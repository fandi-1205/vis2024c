<template>
  <div class="layout-container">
    <div class="layout-column-left">
      <LeftNav></LeftNav>
    </div>

    <div class="layout-column-middle">
      <div class="layout-middle-top">
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
      <div class="layout-middle-middle">
        <MainMap :mainMapData="axesData"></MainMap>
      </div>
      <div class="layout-middle-bottom"></div>
    </div>

    <div class="layout-column-right">
      <div class="layout-right-top">
        <div class="layout-right-top-left"></div>
        <div class="layout-right-top-right">
          <HourHeat></HourHeat>
        </div>
      </div>
      <div class="layout-right-middle">
        <KnowledgeMasteryVue></KnowledgeMasteryVue>
      </div>
      <div class="layout-right-bottom">
        <div class="layout-right-bottom-left"></div>
        <div class="layout-right-bottom-right"></div>
      </div>
    </div>
  </div>
</template>

<script>
import MainMap from './components/mainMap';
import LeftNav from './components/leftNav/';
import KnowledgeMasteryVue from './components/knowledageMastery/';
import HourHeat from './components/hourHeat/';
import axios from 'axios';

export default {
  name: 'App',
  components: {
    LeftNav,
    MainMap,
    KnowledgeMasteryVue,
    HourHeat,
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
.button-group {
  display: flex;
  justify-content: center;
  align-items: center;
}
button {
  width: 130px;
  height: 30px;
  border: none;
  background-color: #3c7df3;
  color: white;
  border-radius: 10px;
  font-size: 16px;
  text-align: center;
  cursor: pointer;
  margin: 5px;
}
.layout-container {
  display: flex;
}

.layout-column-left {
  /* width: 10%; */
  border: 1px solid #3c7df3;
  border-radius: 10px;
  margin: 5px;
}

.layout-column-middle {
  display: flex;
  flex-direction: column;
  /* width: 800px; */
}

.layout-column-right {
  display: flex;
  flex-direction: column;
  /* width: 47%; */
}

.layout-middle-top {
  display: flex;
  border: 1px solid #3c7df3;
  margin: 5px;
  border-radius: 10px;
}

.layout-middle-middle {
  flex: 1;
  border: 1px solid #3c7df3;
  margin: 5px;
  border-radius: 10px;
}

.layout-middle-bottom {
  /* height: 12%; */
  border: 1px solid #3c7df3;
  margin: 5px;
  border-radius: 10px;
}

.layout-right-top,
.layout-right-bottom {
  display: flex;
  /* margin: 5px; */
}

.layout-right-middle {
  flex: 1;
  border: 1px solid #3c7df3;
  margin: 5px;
  border-radius: 10px;
}

.layout-right-top-left,
.layout-right-top-right,
.layout-right-bottom-left,
.layout-right-bottom-right {
  flex: 1;
  border: 1px solid #3c7df3;
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
