"use client";

import { MessageCircle, Share2, MoreHorizontal, Heart } from "lucide-react";
import { Button } from "@heroui/react";
import { UserAvatar } from "@/modules/shared/components/common/user-avatar";
import { PostCardProps } from "../../../types/home-v2";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { WidgetCard } from "@/modules/shared/components/common/widget-card";
import { PostMediaGrid } from "@/modules/shared/components/post/post-media-grid";
import { usePortCard } from "../hooks/use-port-card";

dayjs.extend(relativeTime);

export default function PostCard({ post }: PostCardProps) {
  const { state } = usePortCard();
  return (
    <>
      <WidgetCard
        noPadding
        className="hover:border-primary/20 hover:shadow-md transition-all mb-6 w-full group/post"
      >
        <div className="px-[48px] py-4 md:py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="group relative">
              <div className="absolute inset-[-2px] rounded-full bg-linear-to-tr from-primary to-purple-400 opacity-10 group-hover:opacity-30 transition-opacity" />
              <UserAvatar
                className="w-11 h-11 relative z-10 border border-white/5"
                src={post.author.avatar}
                name={post.author.displayName || post.author.username}
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-foreground text-[15px] hover:text-primary transition-colors cursor-pointer">
                  {post.author.displayName || post.author.username}
                </span>
                <span className="text-muted-foreground/60 text-xs">•</span>
                <span className="text-muted-foreground/60 text-xs font-medium">
                  {dayjs(post.createdAt).fromNow()}
                </span>
              </div>
            </div>
          </div>
          <Button
            isIconOnly
            variant="ghost"
            size="sm"
            className="text-muted-foreground/50 hover:text-foreground rounded-full"
          >
            <MoreHorizontal size={18} />
          </Button>
        </div>

        <div className="px-[48px] pb-5">
          <p className="text-[17px] leading-relaxed text-foreground/90 font-medium whitespace-pre-wrap">
            {post.content}
          </p>
        </div>

        <PostMediaGrid images={post.images} />

        <div className="border-t border-divider/50 px-6 py-3 flex items-center justify-between bg-content2/30">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-danger hover:bg-danger/10 font-bold gap-2 rounded-xl transition-all"
              onPress={() => state.handleActionClick(state.onLike)}
            >
              <Heart size={18} className="fill-none group-hover:fill-current" />
              <span>{post.stats.likes.toLocaleString()}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-primary hover:bg-primary/10 font-bold gap-2 rounded-xl transition-all"
              onPress={() => state.handleActionClick(state.onComment)}
            >
              <MessageCircle size={18} />
              <span>{post.stats.comments}</span>
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground hover:bg-content3/50 font-bold gap-2 rounded-xl transition-all"
          >
            <Share2 size={18} />
            <span className="hidden sm:inline">{state.t("share")}</span>
          </Button>
        </div>
      </WidgetCard>
    </>
  );
}
