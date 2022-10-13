<script setup lang="ts">
import Animatext from "./animatext.vue";
const props = defineProps({
    label: {
        type: String,
        required: true
    },
    img: String,
    disabled: Boolean,
    loading: Boolean
})


</script>
<template>
    <button :disabled="disabled || loading"  @click="$emit('click')">
        <div>
            <img :src="`buttonImages/${img}.png`" width = "64" height = "64">
        </div>
        <span :style="{visibility: loading ? 'hidden' : 'visible'}"> {{label}}</span>
        <Animatext v-if="loading" :text="label" :amplitude="3" :delta-desfase="8" :delta-desfase-entre-letras="60" :increase-desfase-entre-letras="0" />
    </button>
    
</template>
<style scoped>
    button {
        border: 3px solid black;
        font-family: retro-font;
        padding: 3px;
        text-align: center;
        min-width: 0;
        display: flex;
        flex-direction: column;
        justify-items: center;
        background-color: var(--color-background);
        color: var(--color-text);
    }
    button:disabled {
        background-color: var(--color-background-soft);
        color: var(--color-text-soft);
    }
    button > * {
        margin: 3px;
    }

    div {
        margin: auto;
    }
    img {
        image-rendering: pixelated;
    }
    
</style>