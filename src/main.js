//文件核心作用:导入App.vue，基于App.vue创建结构渲染index.html

//导入vue核心包
import Vue from 'vue'
//导入App.vue 根组件
import App from './App.vue'


//提示当前处于什么环境
Vue.config.productionTip = false

//vue实例化，提供render方法 → 基于App.vue创建结构流染index.html
new Vue({
  render: h => h(App),
}).$mount('#app')
