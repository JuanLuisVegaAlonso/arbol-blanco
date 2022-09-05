<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
import HelloWorld from "./components/HelloWorld.vue";
import Footer from "./components/Footer.vue";

</script>

<template>
  <header>
    <h2>Arbol blanco</h2>
  </header>

  <RouterView />
  <Footer/>
</template>
