<template>
  <div class="main">
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
            <button @click="() => sendButtonInfoToBackend('no')">
              随机排序
            </button>
          </div>
        </div>

        <div class="layout-middle-middle common">
          <MainMap :mainMapData="axesData"></MainMap>
          <StudentInfo></StudentInfo>
        </div>
      </div>

      <div class="layout-column-right">
        <div class="layout-right-top">
          <div class="layout-right-top-left common">
            <StudyOrder></StudyOrder>
            <!-- <StudentScores></StudentScores> -->
          </div>

          <div class="layout-right-top-right common">
            <HourHeat></HourHeat>
          </div>
        </div>

        <div class="layout-right-middle common">
          <KnowledgeMasteryVue></KnowledgeMasteryVue>
        </div>

        <div class="layout-right-bottom common">
          <div class="map-title">正确率变化图</div>
          <div class="pic"><img src="pic51.jpg" alt="img" /></div>
          <div
            class="progress-chart"
            v-for="(path, index) in paths"
            :key="index"
          >
            <ProgressChart :key="index" :dataFilePath="path"></ProgressChart>
          </div>

          <!-- <div class="layout-right-bottom-left"></div>
        <div class="layout-right-bottom-right"></div> -->
        </div>
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
import ProgressChart from './components/progressChart/';
// import StudentScores from './components/studentScores/';
import StudentInfo from './components/studentInfo/';
import TopNav from './components/topNav/';
import axios from 'axios';

export default {
  name: 'App',
  components: {
    TopNav,
    LeftNav,
    MainMap,
    KnowledgeMasteryVue,
    HourHeat,
    StudyOrder,
    ProgressChart,
    StudentInfo,
    // StudentScores,
  },
  data() {
    return {
      axesData: [],
      paths: [
        // 'cumulative_average_scores.json',
        'cumulative_average_scores_0d4a3518a188f6888380.json',
        'cumulative_average_scores_6d22912e7e93a96a8690.json',
        'cumulative_average_scores_ac4d829c715fb0c36ad5.json',
        'cumulative_average_scores_db0bcf208cbed26d0bfe.json',
        'cumulative_average_scores_0fc996fff93c00ca5ced.json',
        'cumulative_average_scores_61de1e21015e07aacbe8.json',
        'cumulative_average_scores_cf7f9c2c6872be9bf2d6.json',
        'cumulative_average_scores_20f97b68982d1b2f5c73.json',

        // 更多路径...
      ],
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
* ::-webkit-scrollbar {
  display: none;
}
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
  margin-top: 65px;
  overflow: scroll;
}

.layout-column-left {
  margin: 5px;
  height: 100%vh;
  /* height: 1200px; */
}

.layout-column-middle {
  display: flex;
  flex-direction: column;
  margin: 0px 5px;
  height: 100%vh;

  /* width: 800px; */
}

.layout-column-right {
  display: flex;
  flex-direction: column;
  height: 100%vh;
}

.layout-middle-top {
  display: flex;
  margin: 5px;
  /* height: 6%; */
}

.layout-middle-middle {
  /* flex: 1; */
  margin: 5px;
  /* height: 1000px; */
}

.layout-middle-bottom {
  margin: 5px;
  /* height: 10%; */
}
.layout-right-top {
  display: flex;
  position: relative;
}
.layout-right-bottom {
  position: relative;
  display: flex;
  flex-wrap: nowrap;
  margin: 5px;
  flex: 1;
  width: 1636px;
  overflow: scroll;
}

.layout-right-middle {
  /* flex: 1; */
  border: 3px solid #cad9f4;
  margin: 5px;
  border-radius: 10px;
}

.layout-right-top-left,
.layout-right-top-right,
.layout-right-bottom-left,
.layout-right-bottom-right {
  /* flex: 1; */
  border: 3px solid #cad9f4;
  margin: 5px;
  border-radius: 10px;
}

.layout-right-top-left {
  flex: 1;
}

.layout-right-top-right {
  flex: 2;
}
.map-title {
  position: absolute;
  top: 5px;
  right: 20px;
  text-align: right;
  /* left: 10px; */
  padding: 2px 10px;
  color: #365daa;
  font-size: 24px;
}
.progress-chart {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 5px;
}
.progress-chart-title {
  position: absolute;
  top: 5px;
  right: 20px;
  text-align: right;
  /* left: 10px; */
  padding: 2px 10px;
  color: #365daa;
  font-size: 24px;
}
.pic {
  position: absolute;
  top: -35px;
  right: 10%;
}
.pic img {
  width: 750px;
  height: 120px;
  object-fit: contain;
}
</style>
