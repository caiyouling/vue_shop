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
// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// 富文本编辑器对应样式
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme


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
// 将富文本编辑器注册为全局可用
Vue.use(VueQuillEditor)

// 过滤日期格式 全局注册过滤器
Vue.filter('dateFormat', function(originVal) {
    const dt = new Date(originVal);
    const y = dt.getFullYear();
    // 不足两位用0填充
    const m = (dt.getMonth() + 1 + '').padStart(2, '0');
    const d = (dt.getDate() + '').padStart(2, '0');
    const hh = (dt.getHours() + '').padStart(2, '0');
    const mm = (dt.getMinutes() + '').padStart(2, '0');
    const tt = (dt.getSeconds() + '').padStart(2, '0');
    return `${y}-${m}-${d} ${hh}:${mm}:${tt}`;
})

new Vue({
    router,
    render: h => h(App)
}).$mount('#app')