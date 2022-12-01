import { IsMongoId } from 'class-validator';
import { ObjectId } from 'mongoose';

export class GetTaskParams {
  @IsMongoId()
  id: ObjectId;
}
