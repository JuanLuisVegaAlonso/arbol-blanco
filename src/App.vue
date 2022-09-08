<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
import Footer from "./components/Footer.vue";
import HeaderComponent from "./components/HeaderComponent.vue";

</script>

<template>
  <HeaderComponent id="header" />
  <RouterView />
  <Footer id="footer" />
</template>


<style>
#footer {
  width: 100%;
}
#header {
    width: 100%;
}
</style>
