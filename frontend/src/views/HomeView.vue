<script setup lang="ts">
import { computed, onMounted, ref, type Ref } from "vue";
import { TaskType } from "@/enums/tasktype.enum";
import type ITask from "@/interfaces/task.interface";
import TaskService from "@/services/task.service";
import TheWelcome from "../components/TheWelcome.vue";
import FieldSet from "primevue/fieldset";
import TaskList from "@/components/TaskList.vue";

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
</script>

<template>
  <main>
    <FieldSet
      class="dark"
      legend="Daily"
      :toggleable="true"
      :collapsed="dailyTasks.length === 0"
    >
      <TaskList :tasks="dailyTasks" />
    </FieldSet>
    <FieldSet
      legend="Weekly"
      :toggleable="true"
      :collapsed="weeklyTasks.length === 0"
    >
      <TaskList :tasks="weeklyTasks" />
    </FieldSet>
    <TheWelcome />
  </main>
</template>

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
