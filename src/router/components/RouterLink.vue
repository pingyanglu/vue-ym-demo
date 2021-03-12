<template>
	<a @click="jump">
		<slot></slot>
	</a>
</template>
<script>
	export default{
		name:"RouterLink",
		props:{
			'to':{
				type:String,
				required:true
			}
		},
		methods:{
			jump(){
				let router = this.$root._routerRoot._router;
				router.push(this.to)
			}
		}
	}
</script>