
export default class HistoryBase{
	constructor({routerTable}){
		this.routerTable = routerTable;
	}
	listen(cb){
		this.cb = cb;
	}
	transitionTo(target){
		//判断是否在路由表中
		let router = this.routerTable.match(target);
		console.log(router)
		this.current = router;
		this.cb(this.current)
	}
}