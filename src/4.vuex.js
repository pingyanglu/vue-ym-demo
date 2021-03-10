import {reactive} from './main'
export class Store{
	constructor(options={}){
		let {state,getters,mutations,actions} = options;
		this._vm = reactive(state);
		this._mutations = mutations;
	}
	get state(){
		return this._vm;
	}
	commit(type,payload){
		let entry = this._mutations[type];
		if(!entry){return}
		entry(this.state,payload)
	}
}