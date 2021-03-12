import Vue from 'vue'
import App from './App.vue'
import router from './router/router'
console.log('router',router)

Vue.config.productionTip = false

let active;

let nextTick = (cb) => {
	Promise.resolve().then(cb);
}

let queue = [];
let queueJobs = (job) => {
	if (!queue.includes(job)) {
		queue.push(job);
	}
	console.log('queue', queue)
	nextTick(flushJobs);
}
let flushJobs = () => {
	// console.log(11111)
	let job;
	while ((job = queue.shift()) !== undefined) {
		job();
	}
}
class Dep {
	constructor() {
		this.deps = new Set;
	}
	depend() {
		if (active) {
			this.deps.add(active);
			active.deps.push(this.deps)
		}
	}
	notify() {
		this.deps.forEach(item => {
			queueJobs(item);
			item.options && item.options.scheduler && item.options.scheduler();
		})
	}
}

const creatReactive = (target,prop,initValue)=>{
	/* var dep = new Dep();
	return new Proxy(target,{
		get(target,prop){
			dep.depend();
			return Reflect.get(target,prop);
		},
		set(target,prop,value){
			Reflect.set(target,prop,value);
			//响应更新
			dep.notify()
			return true
		}
	}) */
	
	let val = initValue;
	target._dep = new Dep();
	return Object.defineProperty(target, prop, {
		get: function () {
			//收集依赖
			target._dep.depend();
			return val;
		},
		set: function (newVal) {
			val = newVal;
			//响应更新
			target._dep.notify()
		}
	})
}


let ref = (initValue)=>creatReactive({},'value',initValue);

//set 函数
const set = (target,prop,initValue) => creatReactive(target,prop,initValue);
//传入响应式函数  返回一个函数执行 会返回第一次调用的值 并将该依赖收集起来
let effect = (fn, options) => {
	// console.log('...args', ...args)
	let effect = (...args) => {
		try {
			active = effect;
			// console.log('添加',fn)
			return fn(...args);
		} finally {
			active = null;
		}

	}
	effect.options = options;
	effect.deps = [];

	return effect;
}

function watchEffect(cb) {
	let renner = effect(cb);
	renner();

	return () => {
		cleanupEffect(renner)
	};
}
let computed = (fn) => {
	let value;
	let dirty = true;
	let runner = effect(fn, {
		scheduler: () => {
			if (!dirty) {
				dirty = true;
			}
		}
	})
	return {
		get value() {
			if (dirty) {
				value = runner();
				dirty = false;
			}
			return value
		}
	}
}
let watch = (source, cb, options = {}) => {
	let { immediate } = options
	let getter = () => {
		return source();
	}
	let oldValue;
	const renner = effect(getter, {
		scheduler: () => applyCb()
	})
	//我的版本
	/* const applyCb = () => {
		let newValue = getter();
		if (newValue !== oldValue) {
			cb(newValue, oldValue);
			oldValue = newValue;
		}
	}
	if(immediate){
		applyCb()
	}
	oldValue = renner(); */
	// 老师版本
	const applyCb = () => {
		let newValue = renner();
		if (newValue !== oldValue) {
			cb(newValue, oldValue);
			oldValue = newValue;
		}
	}
	if (immediate) {
		applyCb()
	} else {
		oldValue = renner();
	}
}



let cleanupEffect = (effect) => {
	let { deps } = effect;
	console.log('deps', deps, deps.length)
	if (deps.length) {
		for (var i = 0; i < deps.length; i++) {
			console.log('delete')
			deps[i].delete(effect);
		}
	}
};


//reactive 对对象中的每一项进行初始化响应式
let myCreatReactive = (target,prop,initValue)=>{
	let valueObj= {};
	valueObj[prop] = {}
	valueObj[prop].val= initValue;
	if(!target._dep){
		target._dep={}
	}
	if(!target._dep[prop]){
		target._dep[prop]= new Dep();
	}
	console.log('target[prop]',target[prop])
	return Object.defineProperty(target, prop, {
		get: function () {
			//收集依赖
			target._dep[prop].depend();
			return valueObj[prop].val;
		},
		set: function (newVal) {
			valueObj[prop].val = newVal;
			//响应更新
			target._dep[prop].notify()
		}
	})
}
export const reactive = obj=>{
	let dep =  new Dep();
	Object.keys(obj).forEach(key=>{
		let val = obj[key]
		Object.defineProperty(obj, key, {
			get: function () {
				//收集依赖
				dep.depend();
				return val;
			},
			set: function (newVal) {
				val = newVal;
				//响应更新
				dep.notify()
			}
		})
	})
	/* Object.keys(obj).forEach(key=>{
		myCreatReactive(obj, key,obj[key])
	}) */
	return obj;
}

let count = ref(0);
let computedValue = computed(() => count.value + 3)
//defineProperty模式下 使用set
set(count,'v',0)
document.getElementById("add").addEventListener("click", () => {
	count.value++
	if(!count.v){
		// count.v = 0
	}
	count.v++;
})

watch(() => count.value, (newValue, oldValue) => {
	console.log(newValue, oldValue)
}, {
	immediate: true
});

let str;
let stop = watchEffect(() => {
	// str = count.value;
	//响应式显示
	// str = `${count.value}=====${computedValue.value}`;
	//proxy下新增v也是响应式  defineProperty模式新增属性 是  非响应式
	str = `count.v===>${count.v}`
	document.getElementById("box").innerText = str;
})
// setTimeout(() => stop(), 3000)
////////////////////////////////////////
let arr1 = set([],1,0);
document.getElementById("add1").addEventListener("click", () => {
	arr1[1]++;
})
watchEffect(() => {
	str = `arr[1]===>${arr1[1]}`
	document.getElementById("box1").innerText = str;
})

////////////////
//defineProperty对数组、对象新增属性都无效  所以重写push
let push = Array.prototype.push;
Array.prototype.push = function(...args) {
	push.apply(this,[...args]);
	this._dep && this._dep.notify();
}


let arr2 =set([],0,0);
let arrValue = 0;
document.getElementById("add2").addEventListener("click", () => {
	arrValue++;
	arr2.push(arrValue)
})
watchEffect(() => { 
	str = `arr2===>${arr2.join(',')}`
	document.getElementById("box2").innerText = str;
})

///////////////////
import {Store} from './4.vuex';
const store = new Store({
	state:{
		count:0
	},
	mutations:{
		addCount(state,payload=2){
			state.count+=payload
		}
	},
	plugins:[(store)=>{
		store.subscribe((mutations,state)=>{
			console.log(mutations)
		})
	}]
})
console.log(store)
document.getElementById("add3").addEventListener("click", () => {
	store.commit('addCount',2)
})
watchEffect(() => { 
	str = `store.count===>${store.state.count}`
	document.getElementById("box3").innerText = str;
})


/////////////////////

new Vue({
	router,
	render: h => h(App),
}).$mount('#app')
