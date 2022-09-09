<script setup lang="ts">
defineProps({
    name: {
        type: String,
        required: true
    },
    isGM: Boolean,
    isArbolBlanco: Boolean
});

</script>

<template>
    <div class="slab">
        <div v-if="isArbolBlanco" class="modifier"><img src="arbolBlanco.webp" alt="ArbolBlanco"></div>
        <div v-if="!isArbolBlanco" class="modifier"></div>
        <span>{{name}}</span>
        <div v-if="isGM" class="modifier"><img src="GM.webp" alt="GM"></div>
        <div v-if="!isGM" class="modifier"></div>
    </div>
</template>

<style scoped>
.slab {
    border: black solid;
    border-width: 2px 4px;
    display: flex;
    text-align: center;
    justify-content: center;
    align-items: center;
    width: 100%;
}

.slab span {
    margin-right: auto;
    margin-left: auto;
}

.slab:first-child {
    border-width: 4px 4px 2px 4px;
}

.slab:last-child {
    border-width: 2px 4px 4px 4px;
}

.slab > * {
    padding: 3px;
}

.modifier {
    min-width: 30px;
}
</style>