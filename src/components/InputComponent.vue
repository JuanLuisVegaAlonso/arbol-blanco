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
    }
    input:disabled {
        background-color: lightgray;
        border: 3px solid lightslategrey;
        cursor: not-allowed;
    }
</style>