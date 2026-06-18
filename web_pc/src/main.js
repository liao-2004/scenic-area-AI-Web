import Vue from 'vue'
import App from './App.vue'
import store from '@/store/index'
import TlbsMap from 'tlbs-map-vue'

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min'
import VueRouter from 'vue-router'
Vue.prototype.quanju=false
import AICHAT from './views/aiChat.vue'
import WULIAN from './views/wulianRouter.vue'
import PUBLISH from './views/publish.vue'

Vue.use(VueRouter)
Vue.use(ElementUI);
Vue.use(TlbsMap)


const router =new VueRouter({
  routes:[
    {path:'/',redirect:'/aichat'},
    {path:'/aichat',component:AICHAT},
    {path:'/wulian',component:WULIAN},
    {path:'/publish',component:PUBLISH}
  ]
})

Vue.config.productionTip = false


new Vue({
  render: h => h(App),
  store,
  router
}).$mount('#app')
