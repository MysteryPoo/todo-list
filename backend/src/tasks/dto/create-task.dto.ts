import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsRFC3339, IsString } from 'class-validator';
import { TaskType } from '../enums/tasktype.enum';

export class CreateTaskDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  @IsEnum(TaskType)
  type: TaskType;

  @ApiProperty()
  @IsRFC3339()
  due?: string;
}
