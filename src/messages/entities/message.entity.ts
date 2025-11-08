import { Message as IMessage } from 'generated/prisma';

export class Message implements IMessage {
  id: string;
  content: string;
  senderId: string;
  complaintId: string | null;
  createdAt: Date;
}
