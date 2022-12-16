<template>
  <div class="task-list">
    <TaskCard
      v-for="task in tasks"
      v-show="
        !(
          !$props.showHidden &&
          task.completed &&
          midnight.getMidnight(task.lastUpdated) <
            midnight.getMidnight(DateTime.now())
        )
      "
      :key="task.id"
      :task="task"
      @remove="$emit('remove-task', $event)"
      @update="$emit('update-task', $event)"
      @complete="$emit('complete-task', $event)"
      @reset-due="$emit('reset-due-task', $event)"
    />
  </div>
</template>

<script lang="ts" setup>
import TaskCard from "@/components/TaskCard.vue";
import { useMidnight } from "@/composables/midnight";
import type ITask from "@/interfaces/task.interface";
import { DateTime } from "luxon";

defineProps<{
  tasks: Array<ITask>;
  showHidden: boolean;
}>();

defineEmits<{
  (e: "remove-task", id: string): void;
  (e: "update-task", id: string): void;
  (e: "complete-task", info: { id: string; isComplete: boolean }): void;
  (e: "reset-due-task", info: { id: string; due: DateTime }): void;
}>();

const midnight = useMidnight();
</script>

<style lang="scss" scoped>
.task-list {
  background-color: rgba(#414856, 0.5);
  border-radius: 15px;
  padding: 15px;
  min-width: fit-content;
  display: flex;
  flex-direction: column;
  margin-left: auto;
  margin-right: auto;
  margin-top: 15px;
  margin-bottom: 15px;
  h1 {
    display: flex;
    justify-content: center;
  }
}
#checklist {
  --background: #ffffff;
  --width: 200px;
  --height: 140px;
  --border-radius: 10px;
  background: var(--background);
  width: var(--width);
  height: var(--height);
  border-radius: var(--border-radius);
  position: relative;
  box-shadow: 0 10px 30px rgba(#414856, 0.05);
  padding: 30px 45px;
  display: grid;
  grid-template-columns: 30px auto;
  align-items: center;
}
</style>
