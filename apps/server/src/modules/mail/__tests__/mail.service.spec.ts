import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../services/mail.service';
import { SendRawMailDto, SendReactMailDto } from '../dto';
import React from 'react';

const mockResend = {
  emails: {
    send: jest.fn(),
  },
};

jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => mockResend),
}));

describe('MailService', () => {
  let service: MailService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn((key: string) => {
              const config: Record<string, string> = {
                RESEND_API_KEY: 'test-resend-api-key',
                MAIL_DOMAIN: 'example.com',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
  });

  describe('sendRawMail', () => {
    it('should send raw email successfully', async () => {
      const sendMailDto = new SendRawMailDto();
      sendMailDto.from = 'sender@example.com';
      sendMailDto.to = 'recipient@example.com';
      sendMailDto.subject = 'Test Subject';
      sendMailDto.body = '<p>Test body</p>';
      mockResend.emails.send.mockResolvedValue({ data: { id: 'email-id' } });

      await service.sendRawMail(sendMailDto);

      expect(mockResend.emails.send).toHaveBeenCalledWith({
        from: 'sender@example.com',
        to: 'recipient@example.com',
        subject: 'Test Subject',
        html: '<p>Test body</p>',
      });
    });

    it('should use default from address when not provided', async () => {
      const sendMailDto = new SendRawMailDto();
      sendMailDto.to = 'recipient@example.com';
      sendMailDto.subject = 'Test Subject';
      sendMailDto.body = '<p>Test body</p>';
      mockResend.emails.send.mockResolvedValue({ data: { id: 'email-id' } });

      await service.sendRawMail(sendMailDto);

      expect(mockResend.emails.send).toHaveBeenCalledWith({
        from: 'noreply@example.com',
        to: 'recipient@example.com',
        subject: 'Test Subject',
        html: '<p>Test body</p>',
      });
    });
  });

  describe('sendReactMail', () => {
    it('should send react email successfully', async () => {
      const sendMailDto = new SendReactMailDto();
      sendMailDto.from = 'sender@example.com';
      sendMailDto.to = 'recipient@example.com';
      sendMailDto.subject = 'Test Subject';
      sendMailDto.body = React.createElement('p', null, 'React body');
      mockResend.emails.send.mockResolvedValue({ data: { id: 'email-id' } });

      await service.sendReactMail(sendMailDto);

      expect(mockResend.emails.send).toHaveBeenCalledWith({
        from: 'sender@example.com',
        to: 'recipient@example.com',
        subject: 'Test Subject',
        react: sendMailDto.body,
      });
    });

    it('should use default from address when not provided', async () => {
      const sendMailDto = new SendReactMailDto();
      sendMailDto.to = 'recipient@example.com';
      sendMailDto.subject = 'Test Subject';
      sendMailDto.body = React.createElement('p', null, 'React body');
      mockResend.emails.send.mockResolvedValue({ data: { id: 'email-id' } });

      await service.sendReactMail(sendMailDto);

      expect(mockResend.emails.send).toHaveBeenCalledWith({
        from: 'noreply@example.com',
        to: 'recipient@example.com',
        subject: 'Test Subject',
        react: sendMailDto.body,
      });
    });
  });
});
