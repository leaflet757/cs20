initTicker();

function initTicker(){
	var tickables = new Array();
	var timers = new Array();
	
	var isTickable = function(obj){
		return typeof obj == 'object' && typeof obj.tick == 'function'
	}
	
	ticker = fillProperties(new Updatable(),{
		update: function(delta){
			for(var i in tickables){
				tickables[i].tick(delta)
			}
			
			for(var i = 0; i<timers.length; i++){
				timers[i].t-=delta;
				if(timers[i].t<=0){
					timers[i]();
					if(timers[i].r>0 || timers.loop){
						timers[i].t = timers[i].p + timers[i].t;
						if(!timers.loop)timers[i].r--;
					}else{
						timers.splice(i,1);
					}
				}
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
		addTimer: function(func,t,repeat,loop){
			func.p = t || 0;
			func.t = t || 0;
			func.r = Math.round(repeat || 0);
			func.l = loop || false;
			timers.push(func);
		},
		remove: function(obj){
			for(var i = 0; i<tickables.length; i++){
				if(tickables[i]==obj){
					tickables.splice(i,1);
					return obj;
				}
			}
			for(var i = 0; i<timers.length; i++){
				if(timers[i]==obj){
					timers.splice(i,1);
					return obj;
				}
			}
		}
	});
	
	gameComponents[1]=ticker
}