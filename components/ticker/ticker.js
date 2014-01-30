initTicker();

function initTicker(){
	var tickables = new Array();
	
	var isTickable = function(obj){
		return typeof obj == 'object' && typeof obj.tick == 'function'
	}
	
	ticker = fillProperties(new Updatable(),{
		update: function(delta){
			for(var i in tickables){
				tickables[i].tick(delta)
			}
		},
		add: function(obj){
			if(isTickable(obj)){
				tickables.push(obj)
				return 1
			}else{
				return -1
			}
		},
		remove: function(obj){
			for(var i = 0; i<tickables.length; i++){
				if(tickables[i]==obj){
					tickables.splice(i,1);
					break;
				}
			}
		}
	});
	
	gameComponents[1]=ticker
}