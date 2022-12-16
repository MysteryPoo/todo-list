<template>
  <header>
    {{ lastUpdated }}
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
    <Button label="New Task" @click="newTaskVisible = true" />
    <Button
      :label="showHidden ? 'Hide Hidden' : 'Show Hidden'"
      :icon="showHidden ? 'pi pi-eye' : 'pi pi-eye-slash'"
      @click="showHidden = !showHidden"
    />
    <FieldSet
      legend="Daily"
      :toggleable="true"
      :collapsed="dailyTasks.length === 0"
    >
      <Button
        label="New Task"
        @click="
          newTaskVisible = true;
          defaultTaskType = TaskType.DAILY;
        "
      />
      <TaskList
        @remove-task="removeTask"
        @update-task="showUpdateTaskForm"
        @complete-task="completeTask"
        @reset-due-task="resetTask"
        :tasks="dailyTasks"
        :show-hidden="showHidden"
      />
    </FieldSet>
    <FieldSet
      legend="Weekly"
      :toggleable="true"
      :collapsed="weeklyTasks.length === 0"
    >
      <Button
        label="New Task"
        @click="
          newTaskVisible = true;
          defaultTaskType = TaskType.WEEKLY;
        "
      />
      <TaskList
        @remove-task="removeTask"
        @update-task="showUpdateTaskForm"
        @complete-task="completeTask"
        @reset-due-task="resetTask"
        :tasks="weeklyTasks"
        :show-hidden="showHidden"
      />
    </FieldSet>
    <FieldSet
      legend="Monthly"
      :toggleable="true"
      :collapsed="monthlyTasks.length === 0"
    >
      <Button
        label="New Task"
        @click="
          newTaskVisible = true;
          defaultTaskType = TaskType.MONTHLY;
        "
      />
      <TaskList
        @remove-task="removeTask"
        @update-task="showUpdateTaskForm"
        @complete-task="completeTask"
        @reset-due-task="resetTask"
        :tasks="monthlyTasks"
        :show-hidden="showHidden"
      />
    </FieldSet>
    <FieldSet
      legend="Quarterly"
      :toggleable="true"
      :collapsed="quarterlyTasks.length === 0"
    >
      <Button
        label="New Task"
        @click="
          newTaskVisible = true;
          defaultTaskType = TaskType.QUARTERLY;
        "
      />
      <TaskList
        @remove-task="removeTask"
        @update-task="showUpdateTaskForm"
        @complete-task="completeTask"
        @reset-due-task="resetTask"
        :tasks="quarterlyTasks"
        :show-hidden="showHidden"
      />
    </FieldSet>
    <FieldSet
      legend="Yearly"
      :toggleable="true"
      :collapsed="yearlyTasks.length === 0"
    >
      <Button
        label="New Task"
        @click="
          newTaskVisible = true;
          defaultTaskType = TaskType.ANNUALLY;
        "
      />
      <TaskList
        @remove-task="removeTask"
        @update-task="showUpdateTaskForm"
        @complete-task="completeTask"
        @reset-due-task="resetTask"
        :tasks="yearlyTasks"
        :show-hidden="showHidden"
      />
    </FieldSet>
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

const lastUpdated = ref("");
const newTaskVisible = ref(false);
const refreshInterval: Ref<number | undefined> = ref(undefined);
const taskService: TaskService = new TaskService();
const actionQueueService = new ActionQueueService(taskService);
const tasks: Ref<Array<ITask>> = ref([]);
const taskToUpdate: Ref<ITask | undefined> = ref(undefined);
const updateTaskVisible = ref(false);
const showHidden = ref(false);
const defaultTaskType: Ref<undefined | TaskType> = ref(undefined);

onMounted(async () => {
  refreshInterval.value = setInterval(async () => {
    try {
      lastUpdated.value = await taskService.getLastUpdated();
      await actionQueueService.sync();
    } catch {
      console.warn("There was an error.");
    }
  }, 1000);
});

onUnmounted(() => {
  clearInterval(refreshInterval.value);
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
  actionQueueService.push(action);
  newTaskVisible.value = false;
}

async function updateTask(task: IUpdateTaskDto): Promise<void> {
  const action: IAction = new Action(task, ActionType.UPDATE);
  actionQueueService.push(action);
  const cachedTask = tasks.value.find((t) => t.id === task.id);
  if (cachedTask) {
    cachedTask.title = task.title ?? cachedTask.title;
    cachedTask.due = task.due ?? cachedTask.due;
    cachedTask.description = task.description;
    cachedTask.type = task.type ?? cachedTask.type;
  }
  updateTaskVisible.value = false;
}

async function removeTask(id: string): Promise<void> {
  const action: IAction = new Action(id, ActionType.DELETE);
  actionQueueService.push(action);
  const index = tasks.value.findIndex((task: ITask) => task.id === id);
  if (index > -1) {
    tasks.value.splice(index, 1);
  }
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
    id: info.id,
    complete: false,
    due: info.due,
  };
  const action: IAction = new Action(task, ActionType.UPDATE);
  actionQueueService.push(action);
  taskToUpdate.completed = false;
  taskToUpdate.due = info.due;
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
