import { IsMongoId } from 'class-validator';
import { ObjectId } from 'mongoose';

export class PatchTaskParams {
  @IsMongoId()
  id: ObjectId;
}
