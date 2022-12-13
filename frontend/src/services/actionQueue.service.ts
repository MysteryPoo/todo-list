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
  private isSyncing = false;

  constructor(private taskService: TaskService) {}

  public push(action: IAction): void {
    this.queue.push(action);
  }

  public async sync(): Promise<void> {
    if (this.isSyncing) return;
    while (this.queue.length > 0) {
      this.isSyncing = true;
      const action = this.queue.shift();
      if (!action) break;
      try {
        switch (action.type) {
          case ActionType.CREATE: {
            const taskFromServer = await this.taskService.newTask(
              action.task as newTaskDto
            );
            this.updateIdForTask(
              (action.task as newTaskDto).id,
              taskFromServer.id
            );
            break;
          }
          case ActionType.UPDATE: {
            await this.taskService.updateTask(action.task as IUpdateTaskDto);
            break;
          }
          case ActionType.DELETE: {
            await this.taskService.deleteTask(action.task as string);
            break;
          }
          default:
            throw new Error("Unknown action type in queue");
        }
      } catch {
        if (action.attempts++ < 5) this.queue.unshift(action);
      } finally {
        this.isSyncing = false;
      }
    }
  }

  private updateIdForTask(oldId: string, newId: string): void {
    for (const taskAction of this.queue) {
      switch (taskAction.type) {
        case ActionType.CREATE: {
          const task = taskAction.task as newTaskDto;
          if (task.id === oldId) {
            task.id = newId;
          }
          break;
        }
        case ActionType.UPDATE: {
          const task = taskAction.task as IUpdateTaskDto;
          if (task.id === oldId) {
            task.id = newId;
          }
          break;
        }
        case ActionType.DELETE: {
          const taskId = taskAction.task as string;
          if (taskId === oldId) {
            taskAction.task = newId;
          }
          break;
        }
      }
    }
  }
}
