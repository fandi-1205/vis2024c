<template>
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
      <div class="layout-middle-bottom common"></div>
    </div>

    <div class="layout-column-right">
      <div class="layout-right-top">
        <div class="layout-right-top-left common"></div>
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
</template>

<script>
import MainMap from './components/mainMap';
import LeftNav from './components/leftNav/';
import KnowledgeMasteryVue from './components/knowledageMastery/';
import HourHeat from './components/hourHeat/';
import StudyOrder from './components/studyOrder/';
import axios from 'axios';

export default {
  name: 'App',
  components: {
    LeftNav,
    MainMap,
    KnowledgeMasteryVue,
    HourHeat,
    StudyOrder,
  },
  data() {
    return {
      axesData: [],
    };
  },
  mounted() {
    this.sendButtonInfoToBackend('');
  },
  methods: {
    sendButtonInfoToBackend(buttonName) {
      if (buttonName) {
        axios
          .get('http://127.0.0.1:3001/student2/sort', {
            params: {
              sortBy: buttonName,
            },
          })
          .then((response) => {
            console.log('请求成功，后端响应：', response.data);
            // 在这里处理成功的逻辑，比如更新 UI
            this.axesData = response.data;
            this.renderChart();
          })
          .catch((error) => {
            console.error('请求失败示：', error);
            // 在这里处理错误，比如提用户
          });
      } else {
        axios
          .get('http://127.0.0.1:3001/student2')
          .then((response) => {
            this.axesData = response.data;
            console.log(this.mainMapData);
            // this.renderChart();
            // this.generateAxes(response);
          })
          .catch((error) => {
            console.log(error);
          });
      }
      // 发送 POST 请求到后端，携带按钮名称作为参数
    },
  },
};
</script>

<style scoped>
.common {
  border: 3px solid #cad9f4;
  border-radius: 10px;
}
.button-group {
  display: flex;
  justify-content: center;
  align-items: center;
}
button {
  width: 130px;
  height: 30px;
  border: none;
  background-color: #7099e5;
  color: white;
  border-radius: 10px;
  font-size: 16px;
  text-align: center;
  cursor: pointer;
  margin: 5px;
}
button:hover {
  background-color: #316fe2;
}
.layout-container {
  display: flex;
  padding: 5px;
}

.layout-column-left {
  /* margin: 5px; */
}

.layout-column-middle {
  display: flex;
  flex-direction: column;
  margin: 0px 5px;
  /* width: 800px; */
}

.layout-column-right {
  display: flex;
  flex-direction: column;
}

.layout-middle-top {
  display: flex;
  /* margin: 5px; */
}

.layout-middle-middle {
  flex: 1;
  margin: 5px 0px;
}

.layout-middle-bottom {
  margin: 5px;
}

.layout-right-top,
.layout-right-bottom {
  display: flex;
}

.layout-right-middle {
  flex: 1;
  margin: 5px 0px;
}

.layout-right-top-left,
.layout-right-top-right,
.layout-right-bottom-left,
.layout-right-top-left,
.layout-right-bottom-right {
  /* flex: 1; */
  /* margin: 5px; */
}

.layout-right-top-left {
  /* flex: 1; */
  width: 100px;
  margin-right: 5px;
}

.layout-right-top-right {
  flex: 2;
}
</style>
