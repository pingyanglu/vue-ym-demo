export function runQueue(queue,iter,end){
	
	let step=(index)=>{
		if(index>queue.length-1){
			end();
		}else{
			if(queue[index]){
				iter(queue[index],()=>{
					console.log('queue>>>>>>>>>>>',index)
					step(index+1)
				})
			}else{
				step(index+1)
			}
		}
	}
	step(0);
}