import { $Enums } from 'generated/prisma';
import { IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  matricNo: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  department: string;

  @IsEnum($Enums.Role)
  role: $Enums.Role;

  @IsString()
  @MinLength(8)
  password: string;
}
