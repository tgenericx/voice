import { ApiHideProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { $Enums, User } from 'generated/prisma';

export class UserDto implements User {
  id: string;
  role: $Enums.Role;
  avatar: string | null;
  matricNo: string;
  firstName: string;
  lastName: string;
  department: string;

  @ApiHideProperty()
  @Exclude()
  password: string;

  createdAt: Date;
  updatedAt: Date;
}
