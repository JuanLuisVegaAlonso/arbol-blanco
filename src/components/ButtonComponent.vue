<script setup lang="ts">
const props = defineProps({
    label: String,
    img: String,
})


</script>
<template>
    <button  @click="$emit('click')">
        <div>
            <img :src="`buttonImages/${img}.webp`">
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
        width: 16px;
        height: 16px;
    }
</style>