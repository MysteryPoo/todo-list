import type { TaskType } from "@/enums/tasktype.enum";
import type { DateTime } from "luxon";
import { v4 as uuidv4 } from "uuid";

export default class newTaskDTO {
  public id: string;

  constructor(
    public title: string,
    public type: TaskType,
    public due: DateTime,
    public description?: string
  ) {
    this.id = uuidv4();
  }
}
