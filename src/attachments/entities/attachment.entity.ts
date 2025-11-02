import { Attachment as IAttachment } from 'generated/prisma';
export class Attachment implements IAttachment {
  id: string;
  fileName: string;
  fileSize: number;
  fileId: string;
  fileUrl: string;
  complaintId: string | null;
  uploadedById: string;
  uploadedAt: Date;
}
