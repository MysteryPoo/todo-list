<template>
  <header>
    {{ lastUpdated }}
  </header>
  <main>
    <FieldSet legend="New Task" :toggleable="true" :collapsed="true">
      <NewTaskForm @new-task="newTask" />
      <UpdateTaskForm
        :visible="updateTaskVisible"
        :task="taskToUpdate"
        @close="updateTaskVisible = false"
        @update-task="requestUpdateTask"
      />
    </FieldSet>
    <FieldSet
      legend="Daily"
      :toggleable="true"
      :collapsed="dailyTasks.length === 0"
    >
      <TaskList
        @remove-task="removeTask"
        @update-task="updateTask"
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
        :tasks="yearlyTasks"
      />
    </FieldSet>
    <DynamicDialog />
    <TheWelcome />
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch, type Ref } from "vue";
import { TaskType } from "@/enums/tasktype.enum";
import type ITask from "@/interfaces/task.interface";
import type INewTaskForm from "@/interfaces/newTaskForm.interface";
import type IUpdateTaskForm from "@/interfaces/updateTaskForm.interface";
import type INewTaskDTO from "@/dtos/newtask.dto";
import type IUpdateTaskDTO from "@/dtos/updatetask.dto";
import TaskService from "@/services/task.service";
import TheWelcome from "../components/TheWelcome.vue";
import FieldSet from "primevue/fieldset";
import DynamicDialog from "primevue/dynamicdialog";
import TaskList from "@/components/TaskList.vue";
import NewTaskForm from "@/components/NewTaskForm.vue";
import UpdateTaskForm from "@/components/UpdateTaskForm.vue";
import { DateTime } from "luxon";
import { useActionStore } from "@/stores/action";

const store = useActionStore();
const taskService: TaskService = new TaskService();
const tasks: Ref<Array<ITask>> = ref([]);
const updateTaskVisible = ref(false);
const taskToUpdate: Ref<ITask | undefined> = ref(undefined);
const lastUpdated = ref("");
const refreshInterval: Ref<number | undefined> = ref(undefined);

onMounted(async () => {
  refreshInterval.value = setInterval(async () => {
    lastUpdated.value = await taskService.getLastUpdated();
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

async function newTask(newTask: INewTaskForm): Promise<void> {
  const task: INewTaskDTO = {
    title: newTask.title,
    description: newTask.description,
    type: taskService.enumFromValue(newTask.taskType, TaskType),
    due: DateTime.fromJSDate(newTask.due),
  };
  tasks.value.push(await taskService.newTask(task));
}

async function requestUpdateTask(taskToUpdate: IUpdateTaskForm): Promise<void> {
  const task: IUpdateTaskDTO = {
    id: taskToUpdate.id,
    title: taskToUpdate.title,
    description: taskToUpdate.description,
    type: taskService.enumFromValue(taskToUpdate.taskType, TaskType),
    due: DateTime.fromJSDate(taskToUpdate.due),
    complete: taskToUpdate.complete,
  };
  const taskFromServer = await taskService.updateTask(task);
  const cachedTask = tasks.value.find((t) => t.id === taskFromServer.id);
  if (cachedTask) {
    cachedTask.completed = taskFromServer.completed;
    cachedTask.title = taskFromServer.title;
    cachedTask.due = taskFromServer.due;
    cachedTask.description = taskFromServer.description;
    cachedTask.lastUpdated = taskFromServer.lastUpdated;
    cachedTask.type = taskFromServer.type;
  }
  updateTaskVisible.value = false;
}

async function removeTask(id: string): Promise<void> {
  await taskService.deleteTask(id);
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

watch(lastUpdated, async () => (tasks.value = await taskService.getTasks()));
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
