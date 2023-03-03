<template>
  <header>
    {{ lastUpdated?.toFormat("DD hh:mm a") }}
  </header>
  <main>
    <UpdateTaskForm
      :visible="updateTaskVisible"
      :task="taskToUpdate"
      @close="updateTaskVisible = false"
      @update-task="updateTask"
    />
    <NewTaskForm
      :visible="newTaskVisible"
      :default-type="defaultTaskType"
      @close="
        newTaskVisible = false;
        defaultTaskType = undefined;
      "
      @new-task="newTask"
    />
    <div class="main-actions">
      <Button label="New Task" @click="newTaskVisible = true" />
      <Button
        :label="showHidden ? 'Hide Hidden' : 'Show Hidden'"
        :icon="showHidden ? 'pi pi-eye' : 'pi pi-eye-slash'"
        @click="showHidden = !showHidden"
      />
      <Button label="Undo" @click="undo" />
    </div>
    <TaskList
      @new-task="openNewTaskForm($event)"
      @remove-task="removeTask"
      @update-task="showUpdateTaskForm"
      @complete-task="completeTask"
      @reset-due-task="resetTask"
      legend="Daily"
      :default-type="TaskType.DAILY"
      :collapsed="dailyTasks.length === 0"
      :tasks="dailyTasks"
      :show-hidden="showHidden"
    />
    <TaskList
      @new-task="openNewTaskForm($event)"
      @remove-task="removeTask"
      @update-task="showUpdateTaskForm"
      @complete-task="completeTask"
      @reset-due-task="resetTask"
      legend="Weekly"
      :default-type="TaskType.WEEKLY"
      :collapsed="weeklyTasks.length === 0"
      :tasks="weeklyTasks"
      :show-hidden="showHidden"
    />
    <TaskList
      @new-task="openNewTaskForm($event)"
      @remove-task="removeTask"
      @update-task="showUpdateTaskForm"
      @complete-task="completeTask"
      @reset-due-task="resetTask"
      legend="Monthly"
      :default-type="TaskType.MONTHLY"
      :collapsed="monthlyTasks.length === 0"
      :tasks="monthlyTasks"
      :show-hidden="showHidden"
    />
    <TaskList
      @new-task="openNewTaskForm($event)"
      @remove-task="removeTask"
      @update-task="showUpdateTaskForm"
      @complete-task="completeTask"
      @reset-due-task="resetTask"
      legend="Quarterly"
      :default-type="TaskType.QUARTERLY"
      :collapsed="quarterlyTasks.length === 0"
      :tasks="quarterlyTasks"
      :show-hidden="showHidden"
    />
    <TaskList
      @new-task="openNewTaskForm($event)"
      @remove-task="removeTask"
      @update-task="showUpdateTaskForm"
      @complete-task="completeTask"
      @reset-due-task="resetTask"
      legend="Yearly"
      :default-type="TaskType.ANNUALLY"
      :collapsed="yearlyTasks.length === 0"
      :tasks="yearlyTasks"
      :show-hidden="showHidden"
    />
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch, type Ref } from "vue";
import { TaskType } from "@/enums/tasktype.enum";
import type ITask from "@/interfaces/task.interface";
import type { INewTaskDto } from "@/dtos/newtask.dto";
import type { IUpdateTaskDto } from "@/dtos/updatetask.dto";
import TaskService from "@/services/task.service";
import Button from "primevue/button";
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
import { UndoService } from "@/services/undo.service";
import { DtoType } from "@/enums/dtoType.enum";
import { DeleteTaskDto } from "@/dtos/deleteTask.dto";

const lastUpdated: Ref<DateTime | null> = ref(null);
const newTaskVisible = ref(false);
const refreshInterval: Ref<number | undefined> = ref(undefined);
const taskService: TaskService = new TaskService(
  import.meta.env.VITE_API_ENDPOINT
);
const actionQueueService = new ActionQueueService(taskService);
const undoService = new UndoService(actionQueueService);
const tasks: Ref<Array<ITask>> = ref([]);
const taskToUpdate: Ref<ITask | undefined> = ref(undefined);
const updateTaskVisible = ref(false);
const showHidden = ref(false);
const defaultTaskType: Ref<undefined | TaskType> = ref(undefined);

onMounted(async () => {
  refreshInterval.value = window.setInterval(async () => {
    try {
      lastUpdated.value = await taskService.getLastUpdated();
      await actionQueueService.sync();
    } catch {
      console.warn("There was an error.");
    }
  }, 1000);
});

onUnmounted(() => {
  window.clearInterval(refreshInterval.value);
});

const dailyTasks = computed(() => getVisibleTasks(TaskType.DAILY));
const weeklyTasks = computed(() => getVisibleTasks(TaskType.WEEKLY));
const monthlyTasks = computed(() => getVisibleTasks(TaskType.MONTHLY));
const quarterlyTasks = computed(() => getVisibleTasks(TaskType.QUARTERLY));
const yearlyTasks = computed(() => getVisibleTasks(TaskType.ANNUALLY));

function getVisibleTasks(type: TaskType): ITask[] {
  return tasks.value.filter((task: ITask) => task.type === type);
}

async function newTask(task: INewTaskDto): Promise<void> {
  const cachedTask: ITask = {
    id: task.id,
    title: task.title,
    description: task.description,
    type: task.type,
    due: task.due,
    completed: false,
    lastUpdated: DateTime.now(),
  };
  tasks.value.push(cachedTask);
  const action: IAction = new Action(task, ActionType.CREATE);
  undoService.prepareForUndo(ActionType.CREATE, cachedTask);
  actionQueueService.push(action);
  newTaskVisible.value = false;
}

async function updateTask(task: IUpdateTaskDto): Promise<void> {
  const action: IAction = new Action(task, ActionType.UPDATE);
  const cachedTask = tasks.value.find((t) => t.id === task.id);
  if (cachedTask) {
    undoService.prepareForUndo(ActionType.UPDATE, cachedTask);
    actionQueueService.push(action);
    cachedTask.title = task.title ?? cachedTask.title;
    cachedTask.due = task.due ?? cachedTask.due;
    cachedTask.description = task.description;
    cachedTask.type = task.type ?? cachedTask.type;
  }
  updateTaskVisible.value = false;
}

async function removeTask(id: string): Promise<void> {
  const deleteTaskDto = new DeleteTaskDto(id);
  const action: IAction = new Action(deleteTaskDto, ActionType.DELETE);
  actionQueueService.push(action);
  const index = tasks.value.findIndex((task: ITask) => task.id === id);
  if (index > -1) {
    const cachedTask = tasks.value[index];
    undoService.prepareForUndo(ActionType.DELETE, cachedTask);
    tasks.value.splice(index, 1);
  }
}

function openNewTaskForm(type: TaskType): void {
  newTaskVisible.value = true;
  defaultTaskType.value = type;
}

function showUpdateTaskForm(id: string): void {
  const task = tasks.value.find((t) => t.id === id);
  if (!task) throw new Error(`Task (${id}) cannot be found.`);
  taskToUpdate.value = task;
  updateTaskVisible.value = true;
}

function completeTask(info: { id: string; isComplete: boolean }): void {
  const taskToUpdate = tasks.value.find((task) => task.id === info.id);
  if (!taskToUpdate) throw new Error(`Task (${info.id}) cannot be found.`);
  if (taskToUpdate.completed === info.isComplete) return;
  const task: IUpdateTaskDto = {
    dtoType: DtoType.UpdateTask,
    id: info.id,
    complete: info.isComplete,
  };
  const action: IAction = new Action(task, ActionType.UPDATE);
  actionQueueService.push(action);
  taskToUpdate.completed = info.isComplete;
}

function resetTask(info: { id: string; due: DateTime }): void {
  const taskToUpdate = tasks.value.find((task) => task.id === info.id);
  if (!taskToUpdate) throw new Error(`Task (${info.id}) cannot be found.`);
  const task: IUpdateTaskDto = {
    dtoType: DtoType.UpdateTask,
    id: info.id,
    complete: false,
    due: info.due,
  };
  const action: IAction = new Action(task, ActionType.UPDATE);
  actionQueueService.push(action);
  taskToUpdate.completed = false;
  taskToUpdate.due = info.due;
}

function undo(): void {
  if (undoService.length > 0) {
    const undoAction: IAction | undefined = undoService.pop();
    if (undoAction) {
      actionQueueService.push(undoAction);
    }
  }
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
.main-actions {
  display: flex;
  flex-direction: row;
  gap: 5px;
  justify-content: space-between;
}
</style>
