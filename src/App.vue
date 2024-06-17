<!--
 * @Description: 
 * @Author: fandi
 * @Date: 2024-06-15 13:36:48
 * @LastEditTime: 2024-06-17 23:11:25
 * @LastEditors: fandi
-->
<template>
  <div class="container">
    <div class="left">
      <div class="LeftNav">
        <LeftNav></LeftNav>
      </div>
    </div>
    <div class="center">
      <MainMap></MainMap>
    </div>
    <div class="right">
      <TimeMemory></TimeMemory>
    </div>
  </div>
</template>

<script>
import MainMap from "./components/mainMap";
import TimeMemory from "./components/timeMemory/";
import LeftNav from "./components/leftNav/";
// import MethodsMap from './components/methodsMap/generateMethodsMap.vue';

export default {
  name: "App",
  components: {
    LeftNav,
    MainMap,
    TimeMemory,
    // MethodsMap
  },
};
</script>

<style>
.container {
  display: flex;
  height: 100%;
  width: 100%;
}
.left {
  height: 100%;
}
.center {
  height: 100%;
}
.LeftNav {
  width: 300px;
  height: 1100px;
  background-color: rgb(247, 253, 246);
}
</style>