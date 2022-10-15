<script setup lang="ts">


defineProps({
    message: {
        type: String,
        required: true
    },
    
})

</script>

<template>
    <label class="invalid">{{message}}</label>
</template>
<style scoped>
.invalid {
    color: #980023;
    font-size: 22px;
}
</style>