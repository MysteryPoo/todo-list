import { IsMongoId } from 'class-validator';
import { ObjectId } from 'mongoose';

export class DeleteTaskParams {
  @IsMongoId()
  id: ObjectId;
}
