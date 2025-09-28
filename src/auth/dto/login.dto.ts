import {
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  Matches,
} from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z]{3}\/\d{4}\/\d{3}$/, {
    message: 'matricNo must follow the pattern ABC/2020/001',
  })
  matricNo: string;

  @IsStrongPassword()
  @IsNotEmpty()
  password: string;
}
