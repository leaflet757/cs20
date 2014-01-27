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
		}
	});
	
	gameComponents[1]=ticker
}