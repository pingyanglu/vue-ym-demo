import Vue from 'vue'
import VueRouter from 'vue-router'
// import VueRouter from './myRouter'

import Foo from '@/pages/foo'
import Bar from '@/pages/bar'



const routes = [
	{ path: '/foo', component: Foo,beforeEnter: (to, from, next) => {
        console.log('beforeEnter',to, from);
		next();
      } },
	{ path: '/bar', component: Bar }
  ]

Vue.use(VueRouter)
const router =  new VueRouter({
	routes // (缩写) 相当于 routes: routes
})

router.beforeEach((to,from,next)=>{
	console.log('router.beforeEach',to,from);
	next();
})
router.beforeResolve((to,from,next)=>{
	console.log('router.beforeResolve',to,from);
	next();
})
router.afterEach((to,from)=>{
	console.log('router.afterEach',to,from);
})

export default router;