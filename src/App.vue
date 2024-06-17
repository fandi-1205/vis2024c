<template>
  <div class="App">
    <CuiYhSide></CuiYhSide>

  </div>
</template>

<script>
import CuiYhSide from"./CuiYh/CuiYhSide.vue"
export default {
    components:{
      CuiYhSide,
    },
}
</script>

<style>
.App{
  width: 300px;
  height: 1100px;
  background-color: rgb(247, 253, 246);
}
</style>