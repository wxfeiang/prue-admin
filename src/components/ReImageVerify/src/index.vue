<script setup lang="ts">
import { watch } from "vue";
import { useImageVerify } from "./hooks";

defineOptions({
  name: "ReImageVerify"
});

interface Props {
  code?: string;
  remote?: boolean;
}

interface Emits {
  (e: "update:code", code: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  code: "",
  remote: false
});

const emit = defineEmits<Emits>();

const { domRef, imgCode, setImgCode, getImgCode, remoteImg, getNetworkCode } =
  useImageVerify(props.remote);

watch(
  () => props.code,
  newValue => {
    setImgCode(newValue);
  }
);
watch(imgCode, newValue => {
  emit("update:code", newValue);
});

defineExpose({ getImgCode });
</script>

<template>
  <canvas
    v-if="!remote"
    ref="domRef"
    width="120"
    height="40"
    class="cursor-pointer"
    @click="getImgCode"
  />
  <template v-else>
    <div @click="getNetworkCode" v-html="remoteImg" />
  </template>
</template>
