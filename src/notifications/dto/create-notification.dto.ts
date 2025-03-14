import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { NotificationType } from '../infrastructure/persistence/relational/entities/notification.entity';

export class CreateNotificationDto {
  @IsNumber()
  @IsNotEmpty()
  recipientId: number;

  @IsNumber()
  @IsNotEmpty()
  senderId: number;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsNumber()
  @IsOptional()
  entityId?: number;

  @IsString()
  @IsOptional()
  entityType?: string;
}
