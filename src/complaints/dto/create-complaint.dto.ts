import { $Enums } from 'generated/prisma';

export class CreateComplaintDto {
  title: string;
  category: $Enums.ComplaintCategory;
  priority: $Enums.ComplaintPriority;
  description: string;
}
