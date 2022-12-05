<template>
  <main>
    <FieldSet legend="New Task" :toggleable="true" :collapsed="true">
      <NewTaskForm @new-task="newTask" />
    </FieldSet>
    <FieldSet
      legend="Daily"
      :toggleable="true"
      :collapsed="dailyTasks.length === 0"
    >
      <TaskList @remove-task="removeTask" :tasks="dailyTasks" />
    </FieldSet>
    <FieldSet
      legend="Weekly"
      :toggleable="true"
      :collapsed="weeklyTasks.length === 0"
    >
      <TaskList @remove-task="removeTask" :tasks="weeklyTasks" />
    </FieldSet>
    <FieldSet
      legend="Monthly"
      :toggleable="true"
      :collapsed="monthlyTasks.length === 0"
    >
      <TaskList @remove-task="removeTask" :tasks="monthlyTasks" />
    </FieldSet>
    <FieldSet
      legend="Quarterly"
      :toggleable="true"
      :collapsed="quarterlyTasks.length === 0"
    >
      <TaskList @remove-task="removeTask" :tasks="quarterlyTasks" />
    </FieldSet>
    <FieldSet
      legend="Yearly"
      :toggleable="true"
      :collapsed="yearlyTasks.length === 0"
    >
      <TaskList @remove-task="removeTask" :tasks="yearlyTasks" />
    </FieldSet>
    <TheWelcome />
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, type Ref } from "vue";
import { TaskType } from "@/enums/tasktype.enum";
import type ITask from "@/interfaces/task.interface";
import type INewTaskForm from "@/interfaces/newTaskForm.interface";
import type INewTaskDTO from "@/dtos/newtask.dto";
import TaskService from "@/services/task.service";
import TheWelcome from "../components/TheWelcome.vue";
import FieldSet from "primevue/fieldset";
import TaskList from "@/components/TaskList.vue";
import NewTaskForm from "@/components/NewTaskForm.vue";
import { DateTime } from "luxon";
import { useActionStore } from "@/stores/action";

const store = useActionStore();
const taskService: TaskService = new TaskService();
const tasks: Ref<Array<ITask>> = ref([]);

onMounted(async () => {
  tasks.value = await taskService.getTasks();
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

async function newTask(newTask: INewTaskForm) {
  const task: INewTaskDTO = {
    title: newTask.title,
    description: newTask.description,
    type: taskService.enumFromValue(newTask.taskType, TaskType),
    due: DateTime.fromJSDate(newTask.due),
  };
  tasks.value.push(await taskService.newTask(task));
}

async function removeTask(id: string) {
  await taskService.deleteTask(id);
  const index = tasks.value.findIndex((task: ITask) => task.id === id);
  if (index > -1) {
    tasks.value.splice(index, 1);
  }
}
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
