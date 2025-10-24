import { $Enums, Complaint as IComplaint } from 'generated/prisma';

export class Complaint implements IComplaint {
  id: string;
  title: string;
  category: $Enums.ComplaintCategory;
  priority: $Enums.ComplaintPriority;
  description: string;
  status: $Enums.ComplaintStatus;
  madeById: string;

  createdAt: Date;
  updatedAt: Date;
}
