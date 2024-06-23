<!--
 * @Description: 
 * @Author: fandi
 * @Date: 2024-06-22 14:55:42
 * @LastEditTime: 2024-06-23 16:16:20
 * @LastEditors: fandi
-->
<template>
  <div class="student-scroll-container">
    <div v-for="(item, index) in data" :key="index" class="student-info">
      <!-- <h3>{{ item.name || '未命名' }}</h3> -->
      <div>
        <strong>编号 NO:{{ index + 1 }}</strong> {{ item.student_ID }}
      </div>
      <div><strong>性别:</strong> {{ item.sex }}</div>
      <div><strong>年龄:</strong> {{ item.age }}</div>
      <div><strong>专业:</strong> {{ item.major }}</div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  name: 'StudentInfo',
  data() {
    return {
      data: [],
    };
  },
  mounted() {
    this.drawStudentInfo();
  },
  methods: {
    drawStudentInfo() {
      axios.get('http://127.0.0.1:3001/studentInfo').then((response) => {
        this.data = response.data;
      });
    },
  },
};
</script>

<style scoped>
.student-scroll-container {
  display: flex;
  max-height: 300px; /* 你可以根据需要调整高度 */
  max-width: 1100px;
  overflow-y: auto; /* 启用垂直滚动条 */
  padding: 10px 0px;
  margin: 25px 0px;
}

.student-info {
  /* margin-bottom: 1rem; 为每个学生信息之间添加间距 */
  width: 410px;
  margin: 10px 25px;
  padding: 6px 18px;
  border: 3px solid #e2e8f4;
  background-color: #e4edff;
  border-radius: 10px;
}
</style>
