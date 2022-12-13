<template>
  <div class="task">
    <div>
      <div class="main">
        <input
          :id="task.id.toString()"
          type="checkbox"
          :value="task.id"
          v-model="completed"
        />
        <label :for="task.id.toString()">{{ task.title }}</label>
        <Button
          icon="pi pi-pencil"
          class="utility"
          @click="$emit('update', task.id)"
        />
        <Button
          icon="pi pi-trash"
          class="utility"
          @click="$emit('remove', task.id)"
        />
      </div>
      <h3 :class="pastDue">Due: {{ task.due.toFormat("M/d/y") }}</h3>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref, type Ref, watch } from "vue";
import type ITask from "@/interfaces/task.interface";
import { DateTime } from "luxon";
import { computed } from "vue";
import Button from "primevue/button";
import { TaskType } from "@/enums/tasktype.enum";

const props = defineProps<{
  task: ITask;
}>();

const emit = defineEmits<{
  (e: "remove", id: string): void;
  (e: "update", id: string): void;
  (e: "complete", info: { id: string; isComplete: boolean }): void;
  (e: "reset-due", info: { id: string; due: DateTime }): void;
}>();

const pastDue = computed(() => {
  const now: DateTime = DateTime.now();
  const midnight = DateTime.fromFormat(
    `${now.month}/${now.day}/${now.year}`,
    "M/d/y"
  );
  return props.task.due < midnight ? "past-due" : "not-due";
});

const completed = ref(false);
const resetInterval: Ref<number | undefined> = ref(undefined);
const requestedReset = ref(false);

onMounted(() => {
  completed.value = props.task.completed;
  resetInterval.value = setInterval(() => {
    if (!requestedReset.value) requestReset();
  }, 1000);
});

onUnmounted(() => {
  clearInterval(resetInterval.value);
});

watch(completed, (newValue) => {
  emit("complete", { id: props.task.id, isComplete: newValue });
});

function requestReset() {
  requestedReset.value = true;
  const task = props.task;
  if (task.completed && DateTime.now() > task.due) {
    switch (task.type) {
      case TaskType.DAILY: {
        emit("reset-due", { id: task.id, due: task.due.plus({ day: 1 }) });
        break;
      }
      case TaskType.WEEKLY: {
        emit("reset-due", { id: task.id, due: task.due.plus({ week: 1 }) });
        break;
      }
      case TaskType.MONTHLY: {
        emit("reset-due", { id: task.id, due: task.due.plus({ month: 1 }) });
        break;
      }
      case TaskType.QUARTERLY: {
        emit("reset-due", { id: task.id, due: task.due.plus({ quarter: 1 }) });
        break;
      }
      case TaskType.ANNUALLY: {
        emit("reset-due", { id: task.id, due: task.due.plus({ year: 1 }) });
        break;
      }
      default:
        throw new Error(`Resetting an unknown TaskType: ${task.type}`);
    }
  }
}
</script>

<style lang="scss" scoped>
.task {
  --background: #ffffff;
  --text: #ffffff;
  --check: #4f29f0;
  --disabled: #c3c8de;
  display: flex;
  flex-direction: column;
  border-style: solid;
  border-radius: 15px;
  border-color: darkgray;
  background-color: grey;
  padding-left: 15px;
  padding-right: 15px;
  margin-bottom: 10px;
  .main {
    display: flex;
    flex-direction: row;
    align-items: center;
    .utility {
      margin: 5px;
    }
  }
  label {
    color: var(--text);
    position: relative;
    cursor: pointer;
    display: grid;
    align-items: center;
    width: 100%;
    transition: color 0.3s ease;
    font-size: x-large;
    &::before,
    &::after {
      content: "";
      position: absolute;
    }
    &::before {
      height: 2px;
      width: 8px;
      left: -27px;
      background: var(--check);
      border-radius: 2px;
      transition: var(--background) 0.3s ease;
    }
    &:after {
      height: 4px;
      width: 4px;
      top: 8px;
      left: -25px;
      border-radius: 50%;
    }
  }
  input[type="checkbox"] {
    -webkit-appearance: none;
    -moz-appearance: none;
    position: relative;
    height: 15px;
    width: 15px;
    outline: none;
    border: 0;
    margin: 0 15px 0 0;
    cursor: pointer;
    background: none;
    display: grid;
    &::before,
    &::after {
      content: "";
      position: absolute;
      height: 2px;
      top: auto;
      background: var(--check);
      border-radius: 2px;
    }
    &::before {
      width: 0px;
      right: 60%;
      transform-origin: right bottom;
    }
    &::after {
      width: 0px;
      left: 40%;
      transform-origin: left bottom;
    }
    &:checked {
      &::before {
        animation: check-01 0.4s ease forwards;
      }
      &::after {
        animation: check-02 0.4s ease forwards;
      }
      + label {
        color: var(--disabled);
        animation: move 0.3s ease 0.1s forwards;
        &::before {
          background: var(--disabled);
          animation: slice 0.4s ease forwards;
        }
        &::after {
          animation: firework 0.5s ease forwards 0.1s;
        }
      }
    }
  }
  h3.past-due {
    color: red;
    background-color: rgba(90, 90, 90, 0.6);
    border-radius: 10px;
    display: flex;
    justify-content: center;
    margin: auto;
    padding-left: 10px;
    padding-right: 10px;
  }
  h3.not-due {
    display: none;
  }
}

@keyframes move {
  50% {
    padding-left: 8px;
    padding-right: 0px;
  }
  100% {
    padding-right: 4px;
  }
}
@keyframes slice {
  60% {
    width: 100%;
    left: 4px;
  }
  100% {
    width: 100%;
    left: -2px;
    padding-left: 0;
  }
}
@keyframes check-01 {
  0% {
    width: 4px;
    top: auto;
    transform: rotate(0);
  }
  50% {
    width: 0px;
    top: auto;
    transform: rotate(0);
  }
  51% {
    width: 0px;
    top: 8px;
    transform: rotate(45deg);
  }
  100% {
    width: 10px;
    top: 8px;
    transform: rotate(45deg);
  }
}
@keyframes check-02 {
  0% {
    width: 4px;
    top: auto;
    transform: rotate(0);
  }
  50% {
    width: 0px;
    top: auto;
    transform: rotate(0);
  }
  51% {
    width: 0px;
    top: 8px;
    transform: rotate(-45deg);
  }
  100% {
    width: 20px;
    top: 8px;
    transform: rotate(-45deg);
  }
}
@keyframes firework {
  0% {
    opacity: 1;
    box-shadow: 0 0 0 -2px #4f29f0, 0 0 0 -2px #4f29f0, 0 0 0 -2px #4f29f0,
      0 0 0 -2px #4f29f0, 0 0 0 -2px #4f29f0, 0 0 0 -2px #4f29f0;
  }
  30% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    box-shadow: 0 -15px 0 0px #4f29f0, 14px -8px 0 0px #4f29f0,
      14px 8px 0 0px #4f29f0, 0 15px 0 0px #4f29f0, -14px 8px 0 0px #4f29f0,
      -14px -8px 0 0px #4f29f0;
  }
}
</style>
