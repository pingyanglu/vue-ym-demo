import {reactive} from './main'
export class Store{
	constructor(options={}){
		let {state,getters,mutations,actions,plugins} = options;
		this._vm = reactive(state);
		this._mutations = mutations;
		this._subscribe = [];
		console.log('this.plugins',this.plugins)
		plugins.forEach(plugin=>plugin(this));
	}
	get state(){
		return this._vm;
	}
	commit(type,payload){
		let entry = this._mutations[type];
		if(!entry){return}
		entry(this.state,payload);
		this._subscribe.forEach(sub=>sub({type,payload},this.state))
	}
	subscribe(fn){
		if(!this._subscribe.includes(fn)){
			this._subscribe.push(fn)
		}
	}
}