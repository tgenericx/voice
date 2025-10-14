import { ApiHideProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { IsEmail } from 'class-validator';
import { $Enums, User } from 'generated/prisma';

export class UserDto implements User {
  id: string;
  role: $Enums.Role;
  avatar: string | null;
  matricNo: string;
  firstName: string;
  lastName: string;
  department: string;

  @IsEmail()
  email: string;

  @ApiHideProperty()
  @Exclude()
  password: string;

  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
