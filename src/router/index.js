import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'

Vue.use(VueRouter)

const router = new VueRouter({
        routes: [{
                path: '/',
                redirect: '/login'
            }, {
                path: '/login',
                component: Login
            },
            {
                path: '/home',
                component: Home
            }
        ]
    })
    // 挂载路由导航守卫
router.beforeEach((to, from, next) => {
    // to为将要访问的路径 from 为从哪里来 next是一个函数，可以放行，如果有参数，表示强制重新导航
    if (to.path == '/login') return next();
    const token = window.sessionStorage.getItem('token');
    if (!token) return next('/login');
    next();
})

export default router