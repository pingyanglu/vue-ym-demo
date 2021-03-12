<script>
	export default{
		name:"RouterView",
		render(){
			const route =  this.$root._routerRoot._route;
			if(!route){
				return
			}
			
			const {component} = route;
			const hook={
				init(vnode){
					console.log('vnode<><><><><><>',vnode)
					route.instance = vnode.componentInstance;
				}
			}
			return <component hook={hook}/>;
		}
	}
</script>