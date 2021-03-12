import Vue from 'vue';
import Html5History from './history/html5.js'
import RouterView from './components/RouterView.vue'
import RouterLink from './components/RouterLink.vue'
Vue.component('RouterView', RouterView)
Vue.component('RouterLink', RouterLink)

class RouterTable {
	constructor(routes = []) {
		this._pathMap = new Map();
		this.init(routes);
	}
	init(routes) {
		const addRoute = (route) => {
			this._pathMap.set(route.path, route)
		}
		console.log('initroutes', routes)
		routes.forEach(route => addRoute(route))
	}
	match(path) {
		let find;
		for (const key of this._pathMap.keys()) {
			if (path === key) {
				find = this._pathMap.get(key)
				break;
			}
		}
		return find;
	}
}


const registerHook = (list,fn) => {
	list.push(fn);
	return () => {
		let i = list.indexOf(fn);
		if (i > -1) list.splice(i, 1);
	}
}

export default class myRouter {
	constructor({ routes = [] }) {
		console.log('>>>', routes)
		//路由表
		this.routerTable = new RouterTable(routes)
		//初始化html5路由模式
		this.history = new Html5History(this);
		this.beforeHooks = [];
		this.resolveHooks = [];
		this.afterHooks = [];
	}
	init(app) {
		const { history } = this;
		history.listen(route => {
			app._route = route;
		})
		history.transitionTo(history.getCurrentLocation())
	}
	push(target) {
		this.history.push(target)
	}
	beforeEach(fn) {
		return registerHook(this.beforeHooks,fn)
	}
	beforeResolve(fn) {
		return registerHook(this.resolveHooks,fn)
	}
	afterEach(fn) {
		return registerHook(this.afterHooks,fn)
	}
}

//插件机制中要有一个install方法
myRouter.install = function () {
	Vue.mixin({
		beforeCreate() {
			//初始化的时候如果存在router
			if (this.$options.router !== undefined) {
				console.log('this>>>', this)
				this._routerRoot = this;
				this._router = this.$options.router;
				this._router.init(this)
				Vue.util.defineReactive(this, '_route', this._router.history.current)
			}
		}
	})
}