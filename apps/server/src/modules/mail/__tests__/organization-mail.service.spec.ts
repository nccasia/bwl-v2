jest.mock('@/templates/organization', () => ({
  OrganizationApprovedEmail: jest.fn().mockReturnValue('<p>Approved Email</p>'),
  OrganizationRegisteredEmail: jest.fn().mockReturnValue('<p>Registered Email</p>'),
  OrganizationRejectedEmail: jest.fn().mockReturnValue('<p>Rejected Email</p>'),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationMailService } from '../services/organization-mail.service';
import { MailService } from '../services/mail.service';
import {
  SendOrgRegisteredMailDto,
  SendOrgApprovedMailDto,
  SendOrgRejectedMailDto,
} from '../dto';

describe('OrganizationMailService', () => {
  let service: OrganizationMailService;
  let mailService: jest.Mocked<MailService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationMailService,
        {
          provide: MailService,
          useValue: {
            sendReactMail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OrganizationMailService>(OrganizationMailService);
    mailService = module.get(MailService);
  });

  describe('sendOrganizationRegisteredAsync', () => {
    it('should send organization registered email', async () => {
      const dto: SendOrgRegisteredMailDto = {
        to: 'org@example.com',
        organizationName: 'Test Organization',
        ownerName: 'John Doe',
      };
      mailService.sendReactMail.mockResolvedValue(undefined);

      await service.sendOrganizationRegisteredAsync(dto);

      expect(mailService.sendReactMail).toHaveBeenCalledWith({
        to: dto.to,
        subject: 'CertChain - Organization Registered',
        body: expect.anything(),
      });
    });

    it('should throw error when mail sending fails', async () => {
      const dto: SendOrgRegisteredMailDto = {
        to: 'org@example.com',
        organizationName: 'Test Organization',
        ownerName: 'John Doe',
      };
      mailService.sendReactMail.mockRejectedValue(new Error('Mail error'));

      await expect(
        service.sendOrganizationRegisteredAsync(dto),
      ).rejects.toThrow('Mail error');
    });
  });

  describe('sendOrganizationApprovedAsync', () => {
    it('should send organization approved email', async () => {
      const dto: SendOrgApprovedMailDto = {
        to: 'org@example.com',
        organizationName: 'Test Organization',
        ownerName: 'John Doe',
        account: 'org_account',
        password: 'org_password',
        approvedAt: new Date(),
      };
      mailService.sendReactMail.mockResolvedValue(undefined);

      await service.sendOrganizationApprovedAsync(dto);

      expect(mailService.sendReactMail).toHaveBeenCalledWith({
        to: dto.to,
        subject: 'CertChain - Organization Approved',
        body: expect.anything(),
      });
    });

    it('should throw error when mail sending fails', async () => {
      const dto: SendOrgApprovedMailDto = {
        to: 'org@example.com',
        organizationName: 'Test Organization',
        ownerName: 'John Doe',
        account: 'org_account',
        password: 'org_password',
        approvedAt: new Date(),
      };
      mailService.sendReactMail.mockRejectedValue(new Error('Mail error'));

      await expect(
        service.sendOrganizationApprovedAsync(dto),
      ).rejects.toThrow('Mail error');
    });
  });

  describe('sendOrganizationRejectedAsync', () => {
    it('should send organization rejected email', async () => {
      const dto: SendOrgRejectedMailDto = {
        to: 'org@example.com',
        organizationName: 'Test Organization',
        ownerName: 'John Doe',
        rejectedAt: new Date(),
        reason: 'Invalid documents',
      };
      mailService.sendReactMail.mockResolvedValue(undefined);

      await service.sendOrganizationRejectedAsync(dto);

      expect(mailService.sendReactMail).toHaveBeenCalledWith({
        to: dto.to,
        subject: 'CertChain - Organization Rejected',
        body: expect.anything(),
      });
    });

    it('should throw error when mail sending fails', async () => {
      const dto: SendOrgRejectedMailDto = {
        to: 'org@example.com',
        organizationName: 'Test Organization',
        ownerName: 'John Doe',
        rejectedAt: new Date(),
        reason: 'Invalid documents',
      };
      mailService.sendReactMail.mockRejectedValue(new Error('Mail error'));

      await expect(
        service.sendOrganizationRejectedAsync(dto),
      ).rejects.toThrow('Mail error');
    });
  });
});
