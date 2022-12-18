import { DeleteTaskDto } from "@/dtos/deleteTask.dto";
import { NewTaskDto } from "@/dtos/newtask.dto";
import { UpdateTaskDto } from "@/dtos/updatetask.dto";
import type { IContainsIds } from "@/interfaces/containsIds.interface";
import type ITask from "@/interfaces/task.interface";
import {
  Action,
  ActionType,
  type ActionQueueService,
  type IAction,
} from "./actionQueue.service";

export class UndoService implements IContainsIds {
  private queue: IAction[] = [];

  constructor(actionQueueService: ActionQueueService) {
    actionQueueService.listen(this);
  }

  public get length(): number {
    return this.queue.length;
  }

  public pop(): IAction | undefined {
    return this.queue.pop();
  }

  public prepareForUndo(actionType: ActionType, task: ITask) {
    switch (actionType) {
      case ActionType.CREATE: {
        const undoAction: IAction = new Action(
          new DeleteTaskDto(task.id),
          ActionType.DELETE
        );
        this.queue.push(undoAction);
        break;
      }
      case ActionType.UPDATE: {
        this.queue.push(
          new Action(
            new UpdateTaskDto(
              task.id,
              task.title,
              task.type,
              task.due,
              task.completed,
              task.description
            ),
            ActionType.UPDATE
          )
        );
        break;
      }
      case ActionType.DELETE: {
        const newTaskDto = new NewTaskDto(
          task.title,
          task.type,
          task.due,
          task.description
        );
        this.queue.push(new Action(newTaskDto, ActionType.CREATE));
        break;
      }
    }
  }

  public updateIdForTask(oldId: string, newId: string): void {
    for (const taskAction of this.queue) {
      if (taskAction.task.id === oldId) {
        taskAction.task.id = newId;
      }
    }
  }
}
