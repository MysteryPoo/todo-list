<script setup lang="ts">
import type ITask from "@/interfaces/task.interface";
import { TaskType } from "@/enums/tasktype.enum";
import TaskList from "./TaskList.vue";
import { computed } from "vue";
import FieldSet from "primevue/fieldset";

const props = defineProps<{
  msg: string;
  tasks: Array<ITask>;
}>();

const dailyTasks = computed(() =>
  props.tasks.filter((task) => task.type === TaskType.DAILY)
);
const weeklyTasks = computed(() =>
  props.tasks.filter((task) => task.type === TaskType.WEEKLY)
);
</script>

<template>
  <div class="greetings">
    <h1 class="green">{{ msg }}</h1>
    <h3>
      You've successfully created a project with
      <a href="https://vitejs.dev/" target="_blank" rel="noopener">Vite</a> +
      <a href="https://vuejs.org/" target="_blank" rel="noopener">Vue 3</a>.
      What's next?
    </h3>
  </div>
  <FieldSet class="dark" legend="Daily" :toggleable="true">
    <TaskList :tasks="dailyTasks" />
  </FieldSet>
  <FieldSet legend="Weekly" :toggleable="true">
    <TaskList :tasks="weeklyTasks" />
  </FieldSet>
</template>

<style lang="scss" scoped>
h1 {
  font-weight: 500;
  font-size: 2.6rem;
  top: -10px;
}

h3 {
  font-size: 1.2rem;
}

.greetings h1,
.greetings h3 {
  text-align: center;
}

@media (min-width: 1024px) {
  .greetings h1,
  .greetings h3 {
    text-align: left;
  }
}

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
