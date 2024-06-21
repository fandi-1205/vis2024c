<!--
 * @Description: 
 * @Author: fandi
 * @Date: 2024-06-20 23:07:41
 * @LastEditTime: 2024-06-20 23:42:57
 * @LastEditors: fandi
-->
<template>
  <div class="top-navbar">
    <div class="navbar-left">
      <!-- 系统名称 -->
      <span>NorthClass编程课程学生学习情况可视分析系统</span>
    </div>
    <div class="navbar-right">
      <!-- Legend 按钮 -->
      <button @click="toggleLegend" ref="legendBtn">Legend</button>
      <!-- Legend详情，使用v-show控制显示隐藏 -->
      <div class="legend-details" v-show="isLegendOpen" ref="legendDetails">
        <!-- 这里放置Legend的具体内容 -->
        Legend Content Here...
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TopNav',
  data() {
    return {
      isLegendOpen: false,
    };
  },
  methods: {
    toggleLegend() {
      this.isLegendOpen = !this.isLegendOpen;
      // 如果Legend展开，确保其下方的内容滚动不会遮挡Legend
      if (this.isLegendOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'auto';
      }
    },
  },
};
</script>

<style scoped>
.top-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px; /* 请根据实际需求调整高度 */
  background-color: #7099e5;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 1000;
}
span {
  color: #fff;
  font-size: 24px;
  font-weight: bold;
  line-height: 60px;
  user-select: none;
}
button {
  border: none;
  background-color: #7099e5;
  color: #fff;
  font-size: 16px;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
}
.navbar-left {
  margin-left: 20px;
}

.navbar-right {
  margin-right: 20px;
}

.legend-details {
  position: absolute;
  top: 60px; /* 与导航栏底部对齐 */
  left: 0;
  right: 0;
  background-color: #f9f9f9;
  padding: 10px;
  box-sizing: border-box;
  transition: all 0.3s ease;
}
</style>
