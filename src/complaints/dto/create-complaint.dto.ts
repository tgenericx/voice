import { $Enums } from 'generated/prisma';
import { CreateAttachmentDto } from 'src/attachments/dto/create-attachment.dto';

export class CreateComplaintDto {
  title: string;
  category: $Enums.ComplaintCategory;
  priority: $Enums.ComplaintPriority;
  description: string;

  attachments: Array<CreateAttachmentDto>;
}
