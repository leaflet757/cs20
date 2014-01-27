initSound();

function initSound(){
	var context = (function(){
		if(typeof AudioContext == "function"){
			return new AudioContext();
		}else{
			return new webkitAudioContext();
		}
	})();
	var globalGain = context.createGain();
	globalGain.connect(context.destination);
	var buffers = {};
	
	var Sound = function(bufferId,loop){
		loop = loop || false;
		var gainNode = context.createGain();
		var playing=false;
		var source=null;
		this.play = function(t){
			if(buffers[bufferId].loaded){
				source = context.createBufferSource(); // Create Sound Source
				source.buffer = buffers[bufferId].data; // Add Buffered Data to Object
				source.loop = loop;
				source.connect(gainNode);
				source.onend = function(){
					playing = false;
					source = null;
				}
				gainNode.connect(globalGain);
				source.start(0);
			}
		}
		this.stop = function(t){
			if(playing){
				source.stop(t);
			}
		}
		return Object.defineProperties(this,{
			loaded:{
				get:function(){
					return buffers[bufferId].loaded;
				},
				set:function(){}
			},
			gain:{
				get:function(){
					return gainNode.gain.value;
				},
				set:function(gain){
					gainNode.gain.value = gain;
				}
			}
		});
	}
	
	var SoundBuffer = function(url){
		var loaded = false;
		var data = null;
			
		(function(){
			try{
				var request = new XMLHttpRequest();
				request.open("GET", url, true); // Path to Audio File
				request.responseType = "arraybuffer"; // Read as Binary Data
				request.onload = function() {
					context.decodeAudioData(request.response, function(b){
						data=b;
						loaded=true;
					}, function(){
						console.error('error loading audio');
					})
				};
				request.onerror = function() {
					console.error("failed to load audio file "+url);
				}
				request.onabort = function() {
					console.error("failed to load audio file "+url);
				}
				request.send();
			}catch(e){}
		})();
		
		
		return Object.defineProperties(this,{
			data:{
				get:function(){
					return data;
				},
				set:function(){}
			},
			loaded:{
				get:function(){
					return loaded;
				},
				set:function(){}
			}
		});	
	}
	
	window.Sound = Object.defineProperties(
		{
			addBuffer:function(id,url){
				buffers[id] = new SoundBuffer(url);
				return id;
			},
			createSound:function(bufferId,loop){
				return new Sound(bufferId,loop);
			}
		},
		{
			globalGain:{
				get: function(){
					return globalGain.gain.value;
				},
				set: function(gain){
					globalGain.gain.value = gain;
				}
			}
		});
}