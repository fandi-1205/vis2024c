<!--
 * @Description: 
 * @Author: fandi
 * @Date: 2024-06-22 14:55:42
 * @LastEditTime: 2024-06-22 15:48:03
 * @LastEditors: fandi
-->
<template>
  <div class="student-scroll-container">
    <div v-for="(item, index) in data" :key="index">
      <!-- <h3>{{ item.name || '未命名' }}</h3> -->
      <p><strong>编号:</strong> {{ item.student_ID }}</p>
      <p><strong>性别:</strong> {{ item.sex }}</p>
      <p><strong>年龄:</strong> {{ item.age }}</p>
      <p><strong>专业:</strong> {{ item.major }}</p>
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3';
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
    async drawStudentInfo() {
      try {
        const response = await d3.json('Data_StudentInfo.json');
        this.data = response;
        console.log(this.data);
        // 在这里安全地使用 this.progressData，因为它已经被赋值了
        // console.log(this.progressData);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    },
  },
};
</script>

<style scoped>
.student-scroll-container {
  max-height: 350px; /* 你可以根据需要调整高度 */
  overflow-y: auto; /* 启用垂直滚动条 */
  margin: 20px;
}

.student-info {
  margin-bottom: 1rem; /* 为每个学生信息之间添加间距 */
}
</style>
