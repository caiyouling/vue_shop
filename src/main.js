import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入字体图标
import './assets/fonts/iconfont.css'
// 引入全局样式表
import './assets/css/global.css'
// 引入树形表格
import TreeTable from 'vue-table-with-tree-grid'


// 引入axios
import axios from 'axios'
// 配置请求根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
    // 请求拦截器，每次请求都要携带token
axios.interceptors.request.use(config => {
        // 在请求头中设置token
        config.headers.Authorization = window.sessionStorage.getItem('token');
        return config
    })
    // 挂载axios
Vue.prototype.$http = axios

Vue.config.productionTip = false
    // 注册为全局可用
Vue.component('tree-table', TreeTable);

new Vue({
    router,
    render: h => h(App)
}).$mount('#app')