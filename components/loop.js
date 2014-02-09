//this class provides an object for running and monitoring an update loop

if(!window.requestAnimationFrame)setAnimationFrame();
initLoop();

function setAnimationFrame(){
	var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
	var x;
    for(x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
	console.log(vendors[x]);
 
    if (!window.requestAnimationFrame){
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
	}
 
    if (!window.cancelAnimationFrame){
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
	}
}
//doing this in a function provides for some hidden variables
function initLoop(){
	var id=0;
	var previousTime=0;
	var startTime=0;
	var loopTime = 0;
	var updatables= new Array();
	var paused = false;
	
	var update = function(){
		var n = Date.now();
		requestAnimationFrame(update)
		// var delta = (n-previousTime)*0.001;
		var delta = Math.min((n-previousTime)*0.001,0.064);//floored at 15fps
		// var delta =.016;
		previousTime = n;
		if(paused){
			delta = 0;
		}
		for(var i in updatables){
			updatables[i].preupdate(delta)
		}
		for(var i in updatables){
			updatables[i].update(delta)
		}
		for(var i in updatables){
			updatables[i].postupdate(delta)
		}
	}
	
	//public functions and variables
	window.Loop = Object.defineProperties({
		start: function(){
			console.log("loop starting...")
			startTime = Date.now();
			previousTime = Date.now();
			this.id = requestAnimationFrame(update);
		},
		stop: function(){
			cancelAnimationFrame(this.id);
		},
		//return the current game time
		getTime: function(){
			if(startTime!='undefined'){
				return Date.now()-this.startTime
			}else{
				return 0
			}
		},
		add: function(obj){
			if(obj instanceof Updatable){
				updatables.push(obj);
				return updatables.length-1;
			}else{
				console.error("attempt to add non-updatable object to loop")
				return -1;
			}
		},
		getHertz: function(){
			return hertz;
		}
	},
	{
		paused:{
			get: function(){
				return paused;
			},
			set: function(p){
				paused = p;
			}
		}
	});
}

function Updatable(){
	return this;
}

Updatable.prototype={
	preupdate: function(delta){
	},
	update: function(delta){
	},
	postupdate: function(delta){
	}
}

