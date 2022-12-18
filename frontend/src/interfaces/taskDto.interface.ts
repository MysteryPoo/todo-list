import type { DtoType } from "@/enums/dtoType.enum";

export interface ITaskDto {
  id: string;
  readonly dtoType: DtoType;
}
