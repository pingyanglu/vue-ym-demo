
import {runQueue} from '../utils/async'

export default class HistoryBase{
	constructor(router){
		this.router= router;
		this.routerTable = router.routerTable;
	}
	listen(cb){
		this.cb = cb;
	}
	transitionTo(target){
		//判断是否在路由表中
		let route = this.routerTable.match(target);
		console.log('<><><><><',route)
		//匹配到路由后开始执行路由守卫
		this.confirmTransition(route,()=>{
			this.upfateRoute(route);
		})
	}
	confirmTransition(route,onComplete,onAbort){
		if(route==this.current){return}
		const queue = [...this.router.beforeHooks,
			route.beforeEnter,
			route.component.beforeRouteEnter.bind(route.instance),
			...this.router.resolveHooks];
		const iter = (hook,next)=>{
			hook(route,this.current,(to)=>{
				console.log('to>>>>>>>>>>>',to)
				if(to===false){
					onAbort&&onAbort(to)
				}else{
					next(to)
				}
			})
		}
		const end =()=>{
			onComplete()
		}
		runQueue(queue,iter,end)
	}
	upfateRoute(route){
		let from = this.current;
		this.current = route;
		this.cb(this.current)
		this.router.afterHooks.forEach(hook=>{
			hook(route,from)
		})
	}
}