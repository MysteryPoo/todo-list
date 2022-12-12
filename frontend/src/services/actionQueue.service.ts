import type TaskService from "./task.service";
import type newTaskDto from "@/dtos/newtask.dto";
import type IUpdateTaskDto from "@/dtos/updatetask.dto";

export enum ActionType {
  CREATE,
  UPDATE,
  DELETE,
}

export interface IAction {
  task: newTaskDto | IUpdateTaskDto | string;
  type: ActionType;
  attempts: number;
}

export class Action {
  public attempts = 0;
  constructor(
    public task: newTaskDto | IUpdateTaskDto | string,
    public type: ActionType
  ) {}
}

export class ActionQueueService {
  private queue: IAction[] = [];

  constructor(private taskService: TaskService) {}

  public push(action: IAction): void {
    this.queue.push(action);
  }
}
