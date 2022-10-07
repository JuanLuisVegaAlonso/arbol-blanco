<script setup lang="ts">
const props = defineProps({
    label: String,
    img: String,
})


</script>
<template>
    <button  @click="$emit('click')">
        <div>
            <img :src="`buttonImages/${img}.png`" width = "64" height = "64">
        </div>
        <span> {{label}}</span>
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
    }
    button > * {
        margin: 3px;
    }

    img {
        image-rendering: pixelated;
    }
    
</style>