<script setup lang="ts">
defineProps({
    modelValue: String,
    disabled: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['update:modelValue']);

const updateValue = (event: any) => {
    emit('update:modelValue', event.target.value)
}
</script>
<template>
    <input :value="modelValue" @input="updateValue" :disabled="disabled">
</template>
<style scoped>
    input {
        border: 3px solid black;
        font-family: retro-font;
        padding: 3px;
        text-align: center;
        min-width: 0;
        color: var(--color-text);
        background-color: var(--color-background-soft);
    }
    input:disabled {
        background-color: var(--color-background-mute);
        border: 3px solid var(--color-background-soft);
        cursor: not-allowed;
    }
</style>