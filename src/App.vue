<template>
  <div class="layout-container">
    <div class="layout-column-left">
      <LeftNav></LeftNav>
    </div>

    <div class="layout-column-middle">
      <div class="layout-middle-top"></div>
      <div class="layout-middle-middle">
        <MainMap></MainMap>
      </div>
      <div class="layout-middle-bottom"></div>
    </div>

    <div class="layout-column-right">
      <div class="layout-right-top">
        <div class="layout-right-top-left"></div>
        <div class="layout-right-top-right"></div>
      </div>
      <div class="layout-right-middle"></div>
      <div class="layout-right-bottom">
        <div class="layout-right-bottom-left"></div>
        <div class="layout-right-bottom-right"></div>
      </div>
    </div>
  </div>
</template>

<script>
 import MainMap from "./components/mainMap";
  import LeftNav from "./components/leftNav/";
 
  
  export default {
    name: "App",
    components: {
      LeftNav,
      MainMap,
  
    },
  };
</script>

<style scoped>
.layout-container {
  display: flex;
  height: 100vh;
}

.layout-column-left {
  width: 6%;
  border: 1px solid #3C7DF3;
  border-radius: 10px;
  margin: 5px;
}

.layout-column-middle {
  display: flex;
  flex-direction: column;
  width: 47%;
}

.layout-column-right {
  display: flex;
  flex-direction: column;
  width: 47%;
}

.layout-middle-top {
  height: 6%;
  border: 1px solid #3C7DF3;
  margin: 5px;
  border-radius: 10px;
}

.layout-middle-middle {
  flex: 1;
  border: 1px solid #3C7DF3;
  margin: 5px;
  border-radius: 10px;
}

.layout-middle-bottom {
  height: 12%;
  border: 1px solid #3C7DF3;
  margin: 5px;
  border-radius: 10px;
}

.layout-right-top,
.layout-right-bottom {
  display: flex;
  flex: 1;
  /* margin: 5px; */
}

.layout-right-middle {
  flex: 1;
  border: 1px solid #3C7DF3;
  margin: 5px;
  border-radius: 10px;
}

.layout-right-top-left,
.layout-right-top-right,
.layout-right-bottom-left,
.layout-right-bottom-right {
  flex: 1;
  border: 1px solid #3C7DF3;
  margin: 5px;
  border-radius: 10px;
}

.layout-right-top-left {
  flex: 1;
}

.layout-right-top-right {
  flex: 2; 
}
</style>
