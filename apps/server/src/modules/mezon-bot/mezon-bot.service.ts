import { SecurityOptions } from '@constants';
import { ChannelService } from '@modules/channel/service';
import { Post } from '@modules/post/entities';
import { PostStatus } from '@modules/post/enums';
import { User } from '@modules/user/entities';
import { UserRoles } from '@modules/user/enums';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import bcrypt from 'bcryptjs';
import { ChannelMessage, MezonClient } from 'mezon-sdk';
import randomstring from 'randomstring';
import { Repository } from 'typeorm';

const ALLOWED_IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'image/jpg',
];

interface MezonMessageEvent {
  channel_id?: string;
  channel_private?: number;
  sender_id?: string;
  user_id?: string;
  username?: string;
  display_name?: string;
  avatar?: string;
  message_id?: string;
  id?: string;
  content?: { t?: string } | unknown;
  attachments?: Array<{ filetype?: string; url?: string }>;
}

interface MezonChannelEvent {
  channel_id?: string;
  id?: string;
  channel_label?: string;
  name?: string;
  channel_private?: boolean | number;
}

@Injectable()
export class MezonBotService implements OnModuleInit {
  private readonly logger = new Logger(MezonBotService.name);
  private _mezonClient: MezonClient;
  private whitelistChannels: string[];
  private readonly _channelNameCache = new Map<string, string>();

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    private readonly configService: ConfigService,
    private readonly channelService: ChannelService,
  ) {
    const botId = this.configService.get<string>('MEZON_BOT_ID');
    const token = this.configService.get<string>('MEZON_BOT_TOKEN');

    this.whitelistChannels =
      this.configService
        .get<string>('WHITELIST_CHANNEL_IDS')
        ?.split(',')
        .map((s) => s.trim()) ?? [];

    this._mezonClient = new MezonClient({ botId, token });
  }

  async onModuleInit() {
    const botId = this.configService.get<string>('MEZON_BOT_ID');
    const token = this.configService.get<string>('MEZON_BOT_TOKEN');

    if (!botId || !token) {
      this.logger.warn(
        'MEZON_BOT_ID or MEZON_BOT_TOKEN is not set. MezonBot will not start.',
      );
      return;
    }

    try {
      await this._mezonClient.login();
      this._mezonClient.onChannelMessage(this.listenChannelMessages);
      this._mezonClient.onChannelCreated(this.handleChannelCreated);
      this._mezonClient.onChannelUpdated(this.handleChannelUpdated);
      this._mezonClient.onChannelDeleted(() => { });
      this._mezonClient.onNotification(() => { });
    } catch (err) {
      this.logger.error('Mezon bot login failed:', err);
    }
  }

  /**
   * Handle incoming channel messages from Mezon.
   * If it contains images, auto-create a Post record.
   */
  public listenChannelMessages = async (event: ChannelMessage) => {
    const e = event as MezonMessageEvent;
    const channelId = e.channel_id ?? '';
    if (!this.whitelistChannels.includes(channelId)) return;

    await this.syncChannelFromMessage(channelId, e);
    await this.createPostFromMessage(channelId, e);
  };

  // Sync the channel name into local DB, using a local cache to avoid repeated lookups.
  private async syncChannelFromMessage(channelId: string, event: MezonMessageEvent): Promise<void> {
    try {
      let channelName = this._channelNameCache.get(channelId);
      if (!channelName) {
        channelName = channelId;
        this._channelNameCache.set(channelId, channelName);
      }
      const channelType = event.channel_private === 1 ? 'private' : 'public';
      await this.channelService.upsertFromMezon(channelId, channelName, channelType);
    } catch (err) {
      this.logger.warn('Failed to upsert channel from message event:', err);
    }
  }

  // Create a Post record from the image attachments in the message (idempotent via mezonMessageId).
  private async createPostFromMessage(channelId: string, event: MezonMessageEvent): Promise<void> {
    try {
      if (!event.attachments || event.attachments.length === 0) return;
      const imageUrls = event.attachments
        .filter((a) => ALLOWED_IMAGE_TYPES.includes(a.filetype ?? ''))
        .map((a) => a.url)
        .filter((url): url is string => Boolean(url));

      if (imageUrls.length === 0) return;

      const messageId = event.message_id ?? event.id;
      if (messageId) {
        const existing = await this.postRepository.findOne({ where: { mezonMessageId: messageId } });
        if (existing) return;
      }

      const userName = event.username ?? '';
      const mezonUserId = event.sender_id ?? event.user_id ?? userName;
      const content = typeof event.content === 'object' && event.content !== null
        ? ((event.content as { t?: string }).t ?? null)
        : null;

      const author = await this.upsertMezonUser(
        mezonUserId,
        userName,
        event.avatar,
        event.display_name,
      );

      const newPost = this.postRepository.create({
        authorId: author.id,
        channelId,
        content,
        status: PostStatus.Published,
        images: imageUrls,
        mezonMessageId: messageId,
      });

      await this.postRepository.save(newPost);
    } catch (err) {
      this.logger.error('Error creating post from message:', err);
    }
  }

  public handleChannelCreated = async (event: MezonChannelEvent) => {
    await this.syncChannelFromEvent(event);
  };

  public handleChannelUpdated = async (event: MezonChannelEvent) => {
    await this.syncChannelFromEvent(event);
  };

  private async syncChannelFromEvent(event: MezonChannelEvent): Promise<void> {
    try {
      const channelId = event?.channel_id ?? event?.id ?? '';
      if (!channelId) return;
      const name = event?.channel_label ?? event?.name ?? channelId;
      const type = event?.channel_private === 1 ? 'private' : 'public';
      this._channelNameCache.set(channelId, name);
      await this.channelService.upsertFromMezon(channelId, name, type);
    } catch (err) {
      this.logger.error('Error syncing channel from event:', err);
    }
  }

  //Find an existing user by userName or auto-register a new one.
  private async upsertMezonUser(
    mezonUserId: string,
    userName: string,
    avatar?: string,
    displayName?: string,
  ): Promise<User> {
    let user = await this.usersRepository.findOne({ where: { mezonUserId } });

    if (!user) {
      user = await this.usersRepository.findOne({ where: { userName } });
    }

    if (user) {
      const needsMezonId = mezonUserId && !user.mezonUserId;
      const hasChanges = avatar !== user.avatar || displayName !== user.displayName || needsMezonId;
      if (hasChanges) {
        await this.usersRepository.update(user.id, {
          ...(needsMezonId ? { mezonUserId } : {}),
          ...(avatar ? { avatar } : {}),
          ...(displayName ? { displayName } : {}),
        });
      }
      return user;
    }

    const randomPassword = randomstring.generate();
    const hashedPassword = await bcrypt.hash(
      randomPassword,
      SecurityOptions.PASSWORD_SALT_ROUNDS,
    );

    const newUser = this.usersRepository.create({
      mezonUserId,
      userName,
      displayName: displayName ?? null,
      avatar: avatar ?? null,
      role: UserRoles.ORGANIZATION,
      hashedPassword,
      isFirstLogin: true,
    });
    return this.usersRepository.save(newUser);
  }
}
