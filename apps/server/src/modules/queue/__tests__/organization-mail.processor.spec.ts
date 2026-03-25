jest.mock('@/templates/organization', () => ({
  OrganizationApprovedEmail: jest.fn().mockReturnValue('<p>Approved Email</p>'),
  OrganizationRegisteredEmail: jest.fn().mockReturnValue('<p>Registered Email</p>'),
  OrganizationRejectedEmail: jest.fn().mockReturnValue('<p>Rejected Email</p>'),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { OrganizationMailProcessor } from '../processors/organization-mail.processor';
import { OrganizationMailService } from '@/modules/mail/services';
import { OrganizationMailJobs } from '../enums';
import {
  SendOrgRegisteredJob,
  SendOrgApprovedJob,
  SendOrgRejectedJob,
} from '../interfaces';

describe('OrganizationMailProcessor', () => {
  let processor: OrganizationMailProcessor;
  let organizationMailService: jest.Mocked<OrganizationMailService>;
  let mockLogger: { log: jest.Mock; error: jest.Mock; warn: jest.Mock; debug: jest.Mock };

  beforeEach(async () => {
    jest.clearAllMocks();

    mockLogger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationMailProcessor,
        {
          provide: OrganizationMailService,
          useValue: {
            sendOrganizationRegisteredAsync: jest.fn(),
            sendOrganizationApprovedAsync: jest.fn(),
            sendOrganizationRejectedAsync: jest.fn(),
          },
        },
        {
          provide: Logger,
          useValue: mockLogger,
        },
      ],
    }).compile();

    processor = module.get<OrganizationMailProcessor>(OrganizationMailProcessor);
    organizationMailService = module.get(OrganizationMailService);
  });

  const createMockJob = (name: string, data: any): Job => ({
    name,
    data,
  } as unknown as Job);

  describe('process', () => {
    it('should handle SEND_REGISTERED_EMAIL job', async () => {
      const jobData: SendOrgRegisteredJob = {
        to: 'org@example.com',
        organizationName: 'Test Org',
        ownerName: 'John Doe',
      };
      const job = createMockJob(OrganizationMailJobs.SEND_REGISTERED_EMAIL, jobData);
      organizationMailService.sendOrganizationRegisteredAsync.mockResolvedValue(undefined);

      await processor.process(job);

      expect(organizationMailService.sendOrganizationRegisteredAsync).toHaveBeenCalledWith({
        to: jobData.to,
        organizationName: jobData.organizationName,
        ownerName: jobData.ownerName,
      });
    });

    it('should handle SEND_APPROVED_EMAIL job', async () => {
      const approvedAt = new Date();
      const jobData: SendOrgApprovedJob = {
        to: 'org@example.com',
        organizationName: 'Test Org',
        ownerName: 'John Doe',
        account: 'org_account',
        password: 'org_password',
        approvedAt,
      };
      const job = createMockJob(OrganizationMailJobs.SEND_APPROVED_EMAIL, jobData);
      organizationMailService.sendOrganizationApprovedAsync.mockResolvedValue(undefined);

      await processor.process(job);

      expect(organizationMailService.sendOrganizationApprovedAsync).toHaveBeenCalledWith({
        to: jobData.to,
        organizationName: jobData.organizationName,
        ownerName: jobData.ownerName,
        approvedAt: jobData.approvedAt,
        account: jobData.account,
        password: jobData.password,
      });
    });

    it('should handle SEND_REJECTED_EMAIL job', async () => {
      const rejectedAt = new Date();
      const jobData: SendOrgRejectedJob = {
        to: 'org@example.com',
        organizationName: 'Test Org',
        ownerName: 'John Doe',
        rejectedAt,
        reason: 'Invalid documents',
      };
      const job = createMockJob(OrganizationMailJobs.SEND_REJECTED_EMAIL, jobData);
      organizationMailService.sendOrganizationRejectedAsync.mockResolvedValue(undefined);

      await processor.process(job);

      expect(organizationMailService.sendOrganizationRejectedAsync).toHaveBeenCalledWith({
        to: jobData.to,
        organizationName: jobData.organizationName,
        ownerName: jobData.ownerName,
        rejectedAt: jobData.rejectedAt,
        reason: jobData.reason,
      });
    });
  });
});
