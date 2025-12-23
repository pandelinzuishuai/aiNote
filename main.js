/*
 * @Author: delin66
 * @Date: 2025-11-14 20:28:38
 * @LastEditors: delin66
 * @LastEditTime: 2025-12-16 19:21:23
 * @Descripttion: 
 */
import App from './App'

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
  const app = createSSRApp(App)
  return {
    app
  }
}
// #endif