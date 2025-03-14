import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseIntPipe,
  Body,
} from '@nestjs/common';
import { NotificationsService } from '../../application/services/notifications.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CreateNotificationDto } from '../../dto/create-notification.dto';
import { NotificationType } from '../../infrastructure/persistence/relational/entities/notification.entity';

@ApiTags('v1/notifications')
@Controller('v1/notifications')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Return all notifications for the authenticated user.',
  })
  async findAll(@Request() req) {
    return this.notificationsService.findAllForUser(req.user.id);
  }

  @Post(':id/read')
  @ApiResponse({ status: 200, description: 'Mark notification as read.' })
  async markAsRead(@Param('id', ParseIntPipe) id: number) {
    return this.notificationsService.markAsRead(id);
  }

  @Post('read-all')
  @ApiResponse({ status: 200, description: 'Mark all notifications as read.' })
  async markAllAsRead(@Request() req) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Delete notification.' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.notificationsService.remove(id);
  }

  @Post('test')
  @ApiResponse({ status: 201, description: 'Create a test notification.' })
  async createTestNotification(@Request() req) {
    const testNotification: CreateNotificationDto = {
      recipientId: req.user.id, // Отправляем уведомление самому пользователю
      senderId: req.user.id,
      type: NotificationType.MESSAGE,
      content: 'Это тестовое уведомление',
      entityId: 1,
      entityType: 'test',
    };

    return this.notificationsService.create(testNotification);
  }
}
