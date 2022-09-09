<script setup lang="ts">
const props = defineProps({
    modelValue: String
})

const emit = defineEmits(['update:modelValue'])

const updateValue = (event: any) => {
    emit('update:modelValue', event.target.value)
}
</script>
<template>
    <input :value="modelValue" @input="updateValue">
</template>
<style scoped>
    input {
        border: 3px solid black;
        font-family: retro-font;
        padding: 3px;
        text-align: center;
        min-width: 0;
    }
</style>