/**
*	this file contains the constructor for a class used for animating the geometry data of a polygon
*   it supports get function for box fields but not set
*/

function AnimatedPolygon(basePoly,baseR,baseG,baseB,baseA){
	
	var interpolate = function(inter,frame,frameA,frameB,percent){
		frame.r = inter(frameA.r,frameB.r,percent);
		frame.g = inter(frameA.g,frameB.g,percent);
		frame.b = inter(frameA.b,frameB.b,percent);
		frame.a = inter(frameA.a,frameB.a,percent);
		for(var i in frame.polygon.vertices){
			var p = frame.polygon.vertices[i],pa=frameA.polygon.vertices[i],pb=frameB.polygon.vertices[i];
			p.x = inter(pa.x,pb.x,percent);
			p.y = inter(pa.y,pb.y,percent);
		}
	}
	
	var interpolators = {
		linear: function(a,b,percent){
			return a + ((b-a)*percent);
		}
	}
	
	var Keyframe = function(polygon,r,g,b,a){
		this.polygon=polygon;
		this.r=r;
		this.g=g;
		this.b=b;
		this.a=a;
		Object.defineProperties(this,{
			x:{
				get:function(){
					return this.polygon.x;
				},
				set: function(x){
					this.polygon.x=x;
				}
			},
			y:{
				get:function(){
					return this.polygon.y;
				},
				set: function(y){
					this.polygon.y=y;
				}
			},
			width:{
				get:function(){
					return this.polygon.width;
				},
				set: function(w){
					this.polygon.width=w;
				}
			},
			height:{
				get:function(){
					return this.polygon.height;
				},
				set: function(h){
					this.polygon.height=h;
				}
			}
		});
	}
	Keyframe.prototype = fillProperties(new Drawable(),{
		draw: function (gc,delta){
			Draw.polygon.fill(gc,'rgba('+Math.round(this.r)+','+Math.round(this.g)
			+','+Math.round(this.b)+','+Math.round(this.a)+')',this.polygon.vertices);
		},
		start: function(){}
	})
	
	var Transition = function(keyframeIdA,keyframeIdB,length,interpolator,callBack){
		this.a = keyframeIdA;
		this.b = keyframeIdB;
		this.length = length;
		this.interpolator = interpolator;
		var t=0;
		
		this.start=function(){
			t=0;
		}
		
		this.init = function(keyframeA,keyframeB,length,interpolator){
			this.a = keyframeA;
			this.b = keyframeB;
			this.length = length;
			this.interpolator = interpolator;
		}
		
		this.draw = function(gc,delta){
			t+=delta;
			var percent = t/length;
			if(percent>=1){//transition completed
				keyframes[this.b].draw(gc,delta);
				if(typeof callBack=='function'){
					callBack();
				}else if(next===null){
					current = keyframes[this.b];
					currentId = this.b;
				}else{
					currentId=nextId;
					current=next;
					current.start();
					next=null;
				}
				return;
			}
			interpolate(interpolator,drawframe,keyframes[this.a],keyframes[this.b],percent);
			drawframe.draw(gc,delta);
		}
		Object.defineProperties(this,{
			x:{
				get:function(){
					return drawframe.x;
				},
				set: function(x){
					drawframe.x=x;
				}
			},
			y:{
				get:function(){
					return drawframe.y;
				},
				set: function(y){
					drawframe.y=y;
				}
			},
			width:{
				get:function(){
					return drawframe.width;
				},
				set: function(w){
					drawframe.width=w;
				}
			},
			height:{
				get:function(){
					return drawframe.height;
				},
				set: function(h){
					drawframe.height=h;
				}
			}
		});
	} 
	Transition.prototype = fillProperties(new Drawable(),{});
	
	var Sequence = function(keyframesIds,lengths,interpolators,callBack){
		var i = 0;
		var t = 0;
		this.start=function(){
			i=0;
			t=0;
		}
		this.draw=function(gc,delta){
			t+=delta;
			var percent = t/lengths[i];
			if(percent>=1){//transition completed
				if(i==lengths.length-1){
					keyframes[keyframeIds[i+1]].draw(gc,delta)
					if(typeof callBack=='function'){
						callBack();
					}else if(next===null){
						current = keyframes[keyframeIds[i+1]];
						currentId = keyframeIds[i+1];
					}else{
						current=next;
						currentId=nextId;
						next=null;
					}
					return;
				}else{
					t = t-lengths[i];
					i++;
					percent = t/lengths[i];
				}
			}
			interpolate(interpolators[i],drawframe,keyframes[keyframeIds[i]],keyframes[keyframeIds[i+1]],percent);
			drawframe.draw(gc,delta);
		}
		Object.defineProperties(this,{
			x:{
				get:function(){
					return drawframe.x;
				},
				set: function(x){
					drawframe.x=x;
				}
			},
			y:{
				get:function(){
					return drawframe.y;
				},
				set: function(y){
					drawframe.y=y;
				}
			},
			width:{
				get:function(){
					return drawframe.width;
				},
				set: function(w){
					drawframe.width=w;
				}
			},
			height:{
				get:function(){
					return drawframe.height;
				},
				set: function(h){
					drawframe.height=h;
				}
			}
		});
	}
	Sequence.prototype = fillProperties(new Drawable(),{});
	
	var keyframes = {};
	var transitions = {};
	var sequences = {};
	
	var base = new Keyframe(basePoly,baseR,baseG,baseB,baseA);
	keyframes['base'] = base;
	
	//this is the keyframe that is actually drawn
	var drawframe = (function(){ 
		var verts = new Array();
		for(var i =0; i<base.polygon.vertices.length;i++) verts.push(new Vector2d());
		return new Keyframe(new Polygon(verts),baseR,baseG,baseB,baseA);
	})();
	
	//the current transition, keyframe or sequence
	var current = base;
	var currentId = 'base';
	//the next transition, keyframe or sequence
	var next = null;
	var noNext = new Object();//unique object for identifying when the next animation or whatnot is not set
	var nextId = noNext;
	
	this.draw = function(gc,delta){
		current.draw(gc,delta);
	}
	
	this.addKeyframe = function(identifier,polygon,r,g,b,a){
		if(polygon.vertices.length != base.polygon.vertices.length) throw new Exception();
		keyframes[identifier]=new Keyframe(polygon.clone(),r,g,b,a);
	}
	
	this.addTransition = function(identifier,keyframeIdA,keyframeIdB,length,callBack){
		if(!(keyframes.hasOwnProperty(keyframeIdA) && keyframes.hasOwnProperty(keyframeIdB))) "addTransition: keyframes undefined";
		transitions[identifier]=new Transition(keyframeIdA,keyframeIdB,length,interpolators.linear,callBack);
	}
	
	this.addSequence = function(identifier,keyframeIds,lengths,callBack){
		var frames = new Array();
		var inters = new Array();
		for(var i in keyframeIds){
			if(!keyframes.hasOwnProperty(keyframeIds[i])) throw "addSequence: undefined keyframe";
			frames[i]=keyframeIds[i];
		}
		
		for(var i in lengths)inters[i]=interpolators.linear;
		
		sequences[identifier]=new Sequence(frames,lengths,inters,callBack);
	}
	
	this.setNextKeyframe = function(id){
		if(!keyframes.hasOwnProperty(id)) throw new Exception();
		next = keyframes[id];
		nextId = id;
	}
	
	this.setNextTransition = function(id){
		if(!transitions.hasOwnProperty(id)) throw new Exception();
		next = transitions[id];
		nextId = id;
	}
	
	this.setNextSequence = function(id){
		if(!sequences.hasOwnProperty(id)) throw new Exception();
		next = sequences[id];
		nextId = id;
	}	
	
	this.setCurrentKeyframe = function(id){
		if(!keyframes.hasOwnProperty(id)) "setCurrentKeframe: keyframe not defined";
		current = keyframes[id];
		currentId = id;
	}
	
	this.setCurrentTransition = function(id){
		if(!transitions.hasOwnProperty(id)) "setCurrentTransition: transition undefined";
		current = transitions[id];
		current.start();
		currentId = id;
	}
	
	this.setCurrentSequence = function(id){
		if(!sequences.hasOwnProperty(id)) throw new Exception();
		current = sequences[id];
		current.start();
		currentId = id;
	}
	
	this.move = function(difx,dify){
		for(var o in keyframes){
			keyframes[o].polygon.x+=difx
			keyframes[o].polygon.y+=dify;
		}
	}
	
	this.scale = function(w,h,x,y){
		for(var o in keyframes){
			keyframes[o].polygon.scale(w,h,x,y);
		}
	}
	
	this.rotate = function(theta,x,y){
		for(var o in keyframes){
			keyframes[o].polygon.rotate(theta,x,y);
		}
	}
	
	this.getCurrent=function(){
		return current;
	}
	
	Object.defineProperties(this,{
		hasNext: {
			get: function(){
				return nextId!==noNext;
			},
			set: function(){}
		},
		nextId: {
			get: function(){
				return nextId;
			},
			set: function(){}
		},
		currentId: {
			get: function(){
				return currentId;
			},
			set: function(){}
		},
		animating:{
			get: function(){
				return current instanceof Sequence || current instanceof Transition;
			},
			set: function(){}
		},
		x:{
			get:function(){
				return current.x;
			},
			set: function(x){
			}
		},
		y:{
			get:function(){
				return current.y;
			},
			set: function(y){
			}
		},
		width:{
			get:function(){
				return current.width;
			},
			set: function(w){
			}
		},
		height:{
			get:function(){
				return current.height;
			},
			set: function(h){
			}
		}
	});
}


AnimatedPolygon.prototype = fillProperties(new Drawable(),{
	visible:true,
	clear:true
});

