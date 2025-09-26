import { Exclude } from 'class-transformer';
import { $Enums, User } from 'generated/prisma';

export class UserDto implements User {
  id: string;
  role: $Enums.Role;
  avatar: string;
  matricNo: string;
  firstName: string;
  lastName: string;
  department: string;

  @Exclude()
  password: string;

  createdAt: Date;
  updatedAt: Date;
}
