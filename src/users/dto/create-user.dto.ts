import { $Enums } from 'generated/prisma';

export class CreateUserDto {
  matricNo: string;
  firstName: string;
  lastName: string;
  department: string;
  role: $Enums.Role;
  password: string;
}
