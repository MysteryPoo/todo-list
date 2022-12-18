import { DtoType } from "@/enums/dtoType.enum";
import type { ITaskDto } from "@/interfaces/taskDto.interface";

export interface IDeleteTaskDto extends ITaskDto {}

export class DeleteTaskDto implements IDeleteTaskDto {
  public readonly dtoType: DtoType = DtoType.DeleteTask;
  constructor(public id: string) {}
}
