import type TaskService from "./task.service";
import type { INewTaskDto } from "@/dtos/newtask.dto";
import type { IUpdateTaskDto } from "@/dtos/updatetask.dto";
import type { IContainsIds } from "@/interfaces/containsIds.interface";
import type { ITaskDto } from "@/interfaces/taskDto.interface";
import type { IDeleteTaskDto } from "@/dtos/deleteTask.dto";

export enum ActionType {
  CREATE,
  UPDATE,
  DELETE,
}

export interface IAction {
  task: ITaskDto;
  type: ActionType;
  attempts: number;
}

export class Action {
  public attempts = 0;
  constructor(public task: ITaskDto, public type: ActionType) {}
}

export class ActionQueueService implements IContainsIds {
  private queue: IAction[] = [];
  private isSyncing = false;
  private listeners: IContainsIds[] = [this];

  constructor(private taskService: TaskService) {}

  public listen(listener: IContainsIds) {
    this.listeners.push(listener);
  }

  public ignore(listener: IContainsIds) {
    const index = this.listeners.findIndex((l) => listener === l);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

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
              action.task as INewTaskDto
            );
            this.listeners.forEach((listener) =>
              listener.updateIdForTask(
                (action.task as INewTaskDto).id,
                taskFromServer.id
              )
            );
            break;
          }
          case ActionType.UPDATE: {
            await this.taskService.updateTask(action.task as IUpdateTaskDto);
            break;
          }
          case ActionType.DELETE: {
            await this.taskService.deleteTask(action.task as IDeleteTaskDto);
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

  // From IContainsIds
  public updateIdForTask(oldId: string, newId: string): void {
    for (const taskAction of this.queue) {
      if (taskAction.task.id === oldId) {
        taskAction.task.id = newId;
      }
    }
  }
}
