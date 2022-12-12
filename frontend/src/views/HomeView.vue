<template>
  <header>
    {{ lastUpdated }}
  </header>
  <main>
    <UpdateTaskForm
      :visible="updateTaskVisible"
      :task="taskToUpdate"
      @close="updateTaskVisible = false"
      @update-task="requestUpdateTask"
    />
    <NewTaskForm
      :visible="newTaskVisible"
      @close="newTaskVisible = false"
      @new-task="newTask"
    />
    <Button label="New Task" @click="newTaskVisible = true" />
    <FieldSet
      legend="Daily"
      :toggleable="true"
      :collapsed="dailyTasks.length === 0"
    >
      <TaskList
        @remove-task="removeTask"
        @update-task="updateTask"
        @complete-task="completeTask"
        :tasks="dailyTasks"
      />
    </FieldSet>
    <FieldSet
      legend="Weekly"
      :toggleable="true"
      :collapsed="weeklyTasks.length === 0"
    >
      <TaskList
        @remove-task="removeTask"
        @update-task="updateTask"
        @complete-task="completeTask"
        :tasks="weeklyTasks"
      />
    </FieldSet>
    <FieldSet
      legend="Monthly"
      :toggleable="true"
      :collapsed="monthlyTasks.length === 0"
    >
      <TaskList
        @remove-task="removeTask"
        @update-task="updateTask"
        @complete-task="completeTask"
        :tasks="monthlyTasks"
      />
    </FieldSet>
    <FieldSet
      legend="Quarterly"
      :toggleable="true"
      :collapsed="quarterlyTasks.length === 0"
    >
      <TaskList
        @remove-task="removeTask"
        @update-task="updateTask"
        @complete-task="completeTask"
        :tasks="quarterlyTasks"
      />
    </FieldSet>
    <FieldSet
      legend="Yearly"
      :toggleable="true"
      :collapsed="yearlyTasks.length === 0"
    >
      <TaskList
        @remove-task="removeTask"
        @update-task="updateTask"
        @complete-task="completeTask"
        :tasks="yearlyTasks"
      />
    </FieldSet>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch, type Ref } from "vue";
import { TaskType } from "@/enums/tasktype.enum";
import type ITask from "@/interfaces/task.interface";
import type newTaskDto from "@/dtos/newtask.dto";
import type IUpdateTaskDTO from "@/dtos/updatetask.dto";
import TaskService from "@/services/task.service";
import Button from "primevue/button";
import FieldSet from "primevue/fieldset";
import TaskList from "@/components/TaskList.vue";
import NewTaskForm from "@/components/NewTaskForm.vue";
import UpdateTaskForm from "@/components/UpdateTaskForm.vue";
import { DateTime } from "luxon";
import {
  Action,
  ActionQueueService,
  ActionType,
  type IAction,
} from "@/services/actionQueue.service";

const actionQueue: Ref<IAction[]> = ref([]);
const lastUpdated = ref("");
const newTaskVisible = ref(false);
const refreshInterval: Ref<number | undefined> = ref(undefined);
const taskService: TaskService = new TaskService();
const actionQueueService = new ActionQueueService(taskService);
const tasks: Ref<Array<ITask>> = ref([]);
const taskToUpdate: Ref<ITask | undefined> = ref(undefined);
const updateTaskVisible = ref(false);

onMounted(async () => {
  refreshInterval.value = setInterval(async () => {
    try {
      lastUpdated.value = await taskService.getLastUpdated();
      while (actionQueue.value.length > 0) {
        const action = actionQueue.value.shift();
        if (!action) return;
        try {
          switch (action.type) {
            case ActionType.CREATE: {
              const taskFromServer = await taskService.newTask(
                action.task as newTaskDto
              );
              for (const taskAction of actionQueue.value) {
                switch (taskAction.type) {
                  case ActionType.CREATE: {
                    const task = taskAction.task as newTaskDto;
                    if (task.id === (action.task as newTaskDto).id) {
                      task.id = taskFromServer.id;
                    }
                    break;
                  }
                  case ActionType.UPDATE: {
                    const task = taskAction.task as IUpdateTaskDTO;
                    if (task.id === (action.task as IUpdateTaskDTO).id) {
                      task.id = taskFromServer.id;
                    }
                    break;
                  }
                  case ActionType.DELETE: {
                    const task = taskAction.task as string;
                    if (task === (action.task as string)) {
                      taskAction.task = taskFromServer.id;
                    }
                    break;
                  }
                }
              }
              break;
            }
            case ActionType.UPDATE: {
              await taskService.updateTask(action.task as IUpdateTaskDTO);
              break;
            }
            case ActionType.DELETE: {
              await taskService.deleteTask(action.task as string);
              break;
            }
            default:
              throw new Error("Unknown action type in queue");
          }
        } catch {
          if (action.attempts++ < 5) actionQueue.value.unshift(action);
        }
      }
    } catch {
      console.log("There was an error.");
    }
  }, 1000);
});

onUnmounted(() => {
  clearInterval(refreshInterval.value);
});

const dailyTasks = computed(() =>
  tasks.value.filter((task: ITask) => task.type === TaskType.DAILY)
);
const weeklyTasks = computed(() =>
  tasks.value.filter((task: ITask) => task.type === TaskType.WEEKLY)
);
const monthlyTasks = computed(() =>
  tasks.value.filter((task: ITask) => task.type === TaskType.MONTHLY)
);
const quarterlyTasks = computed(() =>
  tasks.value.filter((task: ITask) => task.type === TaskType.QUARTERLY)
);
const yearlyTasks = computed(() =>
  tasks.value.filter((task: ITask) => task.type === TaskType.ANNUALLY)
);

async function newTask(task: newTaskDto): Promise<void> {
  tasks.value.push({
    id: task.id,
    title: task.title,
    description: task.description,
    type: task.type,
    due: task.due,
    completed: false,
    lastUpdated: DateTime.now(),
  });
  const action: IAction = new Action(task, ActionType.CREATE);
  actionQueue.value.push(action);
  actionQueueService.push(action);
  newTaskVisible.value = false;
}

async function requestUpdateTask(task: IUpdateTaskDTO): Promise<void> {
  const action: IAction = new Action(task, ActionType.UPDATE);
  actionQueue.value.push(action);
  actionQueueService.push(action);
  const cachedTask = tasks.value.find((t) => t.id === task.id);
  if (cachedTask) {
    cachedTask.title = task.title;
    cachedTask.due = task.due;
    cachedTask.description = task.description;
    cachedTask.type = task.type;
  }
  updateTaskVisible.value = false;
}

async function removeTask(id: string): Promise<void> {
  const action: IAction = new Action(id, ActionType.DELETE);
  actionQueue.value.push(action);
  actionQueueService.push(action);
  const index = tasks.value.findIndex((task: ITask) => task.id === id);
  if (index > -1) {
    tasks.value.splice(index, 1);
  }
}

function updateTask(id: string): void {
  console.log(`Editing ${id}`);
  const task = tasks.value.find((t) => t.id === id);
  if (!task) return;
  taskToUpdate.value = task;
  updateTaskVisible.value = true;
}

function completeTask(info: { id: string; isComplete: boolean }): void {
  // TODO: Refactor into smaller DTO
  console.log(`HomeView: Completing task with: ${info.isComplete}`);
  const taskToUpdate = tasks.value.find((task) => task.id === info.id);
  if (!taskToUpdate) return;
  const task: IUpdateTaskDTO = {
    id: taskToUpdate.id,
    title: taskToUpdate.title,
    description: taskToUpdate.description,
    type: taskToUpdate.type,
    due: taskToUpdate.due,
    complete: info.isComplete,
  };
  const action: IAction = new Action(task, ActionType.UPDATE);
  actionQueue.value.push(action);
  actionQueueService.push(action);
}

watch(lastUpdated, async () => {
  tasks.value = await taskService.getTasks();
  for (const task of tasks.value) {
    if (task.completed) {
      switch (task.type) {
        case TaskType.DAILY:
          break;
      }
    }
  }
});
</script>

<style lang="scss" scoped>
.p-fieldset {
  background-color: rgba(25, 25, 25, 0.8);
  :deep(.p-fieldset-legend) {
    background-color: rgba(50, 50, 50, 0.8);
  }
  :deep(.p-fieldset-legend-text) {
    color: white;
  }
}
</style>
