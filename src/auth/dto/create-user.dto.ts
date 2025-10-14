import { $Enums } from 'generated/prisma';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  Matches,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z]{3}\/\d{4}\/\d{3}$/, {
    message: 'matricNo must follow the pattern ABC/2020/001',
  })
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

  @IsOptional()
  @IsEnum($Enums.Role)
  role: $Enums.Role;

  @IsStrongPassword()
  password: string;
}
