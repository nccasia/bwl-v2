import { PickType } from '@nestjs/swagger';
import { User } from '../entities/user.entity';

export class CreateUserDto extends PickType(User, [
  'email',
  'firstName',
  'lastName',
  'avatar',
  'walletAddress',
  'gender',
  'dob',
  'phone',
  'mezonUserId',
]) { }
