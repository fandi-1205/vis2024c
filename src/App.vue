<template>
  <div>
    <TopNav></TopNav>
    <div class="layout-container">
      <div class="layout-column-left common">
        <LeftNav></LeftNav>
      </div>

      <div class="layout-column-middle">
        <div class="layout-middle-top common">
          <div class="button-group">
            <button @click="() => sendButtonInfoToBackend('frequency')">
              按次数排序
            </button>
            <button @click="() => sendButtonInfoToBackend('accuracy')">
              按正确率排序
            </button>
            <button @click="() => sendButtonInfoToBackend('days')">
              按天数排序
            </button>
          </div>
        </div>

        <div class="layout-middle-middle common">
          <MainMap :mainMapData="axesData"></MainMap>
        </div>

        <div class="layout-middle-bottom common">
          <ProgressChart></ProgressChart>
        </div>
      </div>

      <div class="layout-column-right">
        <div class="layout-right-top">
          <div class="layout-right-top-left common">
            <StudentScores></StudentScores>
          </div>

          <div class="layout-right-top-right common">
            <HourHeat></HourHeat>
          </div>
        </div>

        <div class="layout-right-middle common">
          <KnowledgeMasteryVue></KnowledgeMasteryVue>
        </div>

        <div class="layout-right-bottom common">
          <StudyOrder></StudyOrder>

          <!-- <div class="layout-right-bottom-left"></div>
        <div class="layout-right-bottom-right"></div> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'

export default {
  name: 'App',
  components: {
    HelloWorld
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
