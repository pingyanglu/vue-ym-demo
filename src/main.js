import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

let active;

let nextTick = (cb) => {
	Promise.resolve().then(cb);
}

let queue = [];
let queueJobs = (job) => {
	console.log('add')
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
			console.log('this.deps', this.deps)
		}
	}
	notify() {
		this.deps.forEach(item => {
			queueJobs(item);
			item.options && item.options.scheduler && item.options.scheduler();
		})
	}
}
var dep = new Dep;
function ref(value) {
	let val = value;
	return Object.defineProperty({}, 'value', {
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
}
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



function watchEffect(cb) {
	let renner = effect(cb);
	renner();

	return () => {
		cleanupEffect(renner)
	};
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

let count = ref(0);
let computedValue = computed(() => count.value + 3)
document.getElementById("add").addEventListener("click", () => {
	count.value++
})



watch(() => count.value, (newValue, oldValue) => {
	console.log(newValue, oldValue)
}, {
	immediate: true
});





let str;
let stop = watchEffect(() => {
	// str = count.value;
	str = `${count.value}=====${computedValue.value}`;
	document.getElementById("box").innerText = str;
})
setTimeout(() => stop(), 3000)

new Vue({
	render: h => h(App),
}).$mount('#app')
