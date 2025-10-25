import { IsInt, IsPositive, IsString, IsUrl, Length, Max } from 'class-validator';

export class CreateAttachmentDto {
  @IsString()
  @Length(1, 255)
  fileName: string;

  @IsUrl()
  @Length(1, 2048)
  fileUrl: string;

  @IsInt()
  @IsPositive()
  @Max(50 * 1024 * 1024) // 50 MB limit (adjust as needed)
  fileSize: number;
}
