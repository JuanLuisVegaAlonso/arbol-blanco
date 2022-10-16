<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
import Footer from "./components/Footer.vue";
import HeaderComponent from "./components/HeaderComponent.vue";
import Background from "./components/Background.vue";

</script>

<template>
  <Background/>
  <HeaderComponent id="header" />
  <div id="content">

  
  <RouterView />
  </div>
  <Footer id="footer" />
</template>


<style>

#footer {
  width: 100%;
}
#header {
    width: 100%;
}
#content {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>
