import { $Enums } from 'generated/prisma';
import { CreateAttachmentDto } from 'src/attachments/dto/create-attachment.dto';
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateComplaintDto {
  @IsString()
  @Length(1, 255)
  title: string;

  @IsEnum($Enums.ComplaintCategory)
  category: $Enums.ComplaintCategory;

  @IsEnum($Enums.ComplaintPriority)
  priority: $Enums.ComplaintPriority;

  @IsString()
  @Length(1, 5000)
  description: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAttachmentDto)
  attachments?: Array<CreateAttachmentDto>;
}
