import {
  Controller,
  Get,
  Param,
  Delete,
  ForbiddenException,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AttachmentsService } from './attachments.service';
import { JwtAuthGuard } from 'src/utils/guards';
import { CurrentUser } from 'src/utils/decorators';
import { AuthenticatedUser } from 'src/auth/dto/auth.dto';

@UseGuards(JwtAuthGuard)
@Controller('attachments')
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Post()
  create() {
    throw new ForbiddenException(
      'Attachments can only be created with complaints',
    );
  }

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.attachmentsService.findAll(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.attachmentsService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.attachmentsService.remove(id, user);
  }
}
