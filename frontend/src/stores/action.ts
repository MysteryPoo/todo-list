import { ref, type Ref } from "vue";
import { defineStore } from "pinia";
import type ITask from "@/interfaces/task.interface";
import type newTaskDto from "@/dtos/newtask.dto";
import type IUpdateTaskDto from "@/dtos/updatetask.dto";
import TaskService from "@/services/task.service";

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

interface IActionResult {
  success: boolean;
  error: number;
  message: string;
}

export const useActionStore = defineStore("action", () => {
  const taskService = new TaskService();
  const queue: Ref<IAction[]> = ref([]);
  function addAction(action: IAction) {
    queue.value.push(action);
  }
  async function send() {
    const action = queue.value.shift();
    switch (action?.type) {
      case ActionType.CREATE:
        await createTask(action);
        break;
      case ActionType.UPDATE:
        await updateTask(action);
        break;
      case ActionType.DELETE:
        await deleteTask(action);
        break;
      default:
        throw new Error("Unknown action type queued.");
    }
  }
  async function createTask(action: IAction) {
    const task: newTaskDto = action.task as newTaskDto;
    try {
      const taskFromServer = await taskService.newTask(task);
      updateId(task.id, taskFromServer.id);
    } catch {
      if (action.attempts++ < 5) {
        queue.value.unshift(action);
      }
    }
  }

  async function updateTask(action: IAction) {
    const task: IUpdateTaskDto = action.task as IUpdateTaskDto;
    try {
      await taskService.updateTask(task);
    } catch {
      if (action.attempts++ < 5) {
        queue.value.unshift(action);
      }
    }
  }

  async function deleteTask(action: IAction) {
    const task: string = action.task as string;
    try {
      await taskService.deleteTask(task);
    } catch {
      if (action.attempts++ < 5) {
        queue.value.unshift(action);
      }
    }
  }

  function updateId(oldId: string, newId: string) {
    const store = useActionStore();
    const matches = store.queue.filter((a) => {
      switch (a.type) {
        case ActionType.UPDATE: {
          const task = a.task as IUpdateTaskDto;
          return task.id === oldId;
        }
        case ActionType.DELETE: {
          return a.task === oldId;
        }
        default:
          throw new Error("Unknown action type in queue");
      }
    });
    matches.forEach((a) => {
      switch (a.type) {
        case ActionType.UPDATE: {
          const task = a.task as IUpdateTaskDto;
          task.id = newId;
          break;
        }
        case ActionType.DELETE: {
          a.task = newId;
          break;
        }
        default:
          throw new Error("Unknown action type in queue");
      }
    });
  }

  return { queue, addAction, send };
});
