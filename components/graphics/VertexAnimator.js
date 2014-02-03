var VERTEXANIMATOR_ALT_DRAW = true;

/**
*  program is string id to a program in the glmanager of the display that this animator is added to
*/
var VertexAnimator = function(program,attributeArrays,uniforms,numOfVerts,setUniforms){
	if(typeof program != 'string' ||  !attributeArrays instanceof Float32Array || 
			typeof uniforms != 'object' || typeof numOfVerts != 'number' ){
		throw "illegal parameter"
	}
	var doUniforms = (typeof setUniforms == 'function');
	var baseUniforms = uniforms;
	var baseAttributeArrays = attributeArrays
	var keyframes = {};
	var sequences = {};
	var paused = false;
	var drawframe;
	var sequence;
	var vertexAttribute;
	var vertexSize;
	var x=NaN,y=NaN,width=NaN,height=NaN,changed=true;
	
	var Keyframe = function(attributeArrays,uniforms){
		this.attributeArrays = attributeArrays;
		this.uniforms = uniforms;
	}
	Keyframe.prototype = {
			glInit:function(manager){
				for(var o in this.attributeArrays){
					manager.addArrayBuffer(o,false,this.attributeArrays[o]);
				}
			},
			glDelete:function(manager){
				for(var o in this.attributeArrays){
					manager.removeArrayBuffer(o);
				}
			},
			draw:(VERTEXANIMATOR_ALT_DRAW) ? (function(){
				var floatArrays = null;
				
				return function(gl,delta,screen,manager,pMatrix,mvMatrix,drawType){
					if(floatArrays == null){
						floatArrays = new Object();
						for(var o in this.attributeArrays){
							floatArrays[o] = new Float32Array(this.attributeArrays[o]);
							
						}
					}else{
						for(var o in this.attributeArrays){
							floatArrays[o].set(this.attributeArrays[o]);
						}
					}
					drawType =drawType || gl.TRIANGLE_FAN;
					manager.bindProgram(program);
					//set array buffers
					for(var o in this.attributeArrays){
						manager.setArrayBuffer(o,false,floatArrays[o],this.attributeArrays[o].items,this.attributeArrays[o].itemSize);
						manager.setArrayBufferAsProgramAttribute(o,program,this.attributeArrays[o].attributeId);
					}
					if(doUniforms){
						setUniforms(this.uniforms,gl,delta,screen,manager);
					}
					manager.setMatrixUniforms(program,pMatrix,mvMatrix.current);
					gl.drawArrays(drawType,0,numOfVerts);
				}
			})() : function(gl,delta,screen,manager,pMatrix,mvMatrix,drawType){
				drawType =drawType || gl.TRIANGLE_FAN;
				manager.bindProgram(program);
				//set array buffers
				for(var o in this.attributeArrays){
					manager.setArrayBuffer(o,false,this.attributeArrays[o]);
					manager.setArrayBufferAsProgramAttribute(o,program,this.attributeArrays[o].attributeId);
				}
				if(doUniforms){
					setUniforms(this.uniforms,gl,delta,screen,manager);
				}
				manager.setMatrixUniforms(program,pMatrix,mvMatrix.current);
				gl.drawArrays(drawType,0,numOfVerts);
			
			},
			clone: function(){
				var tempUniforms = {};
				for(var o in this.uniforms){
					tempUniforms[o] = this.uniforms[o]
				}
				
				var tempAttributes = {};
				for(var o in this.attributeArrays){
					tempAttributes[o] = new Array();
					for(var p in attributeArrays[o]){
						tempAttributes[o][p] = this.attributeArrays[o][p]
					}
				}
				return new Keyframe(tempAttributes,tempUniforms);
			},
			set: function(keyframe){
				for(var o in keyframe.uniforms){
					this.uniforms[o] = keyframe.uniforms[o]
				}
				
				for(var o in keyframe.attributeArrays){
					for(var p in keyframe.attributeArrays[o]){
						this.attributeArrays[o][p] = keyframe.attributeArrays[o][p];
					}
				}
				return this;
			}
		};
	
	var Sequence = function(keyframes,times,loop,onEnd){
		this.keyframes = keyframes;
		this.times = times;
		this.t = 0;
		this.position = 0;
		this.animating = false;
		this.onEnd = onEnd || function(){};
		this.loop = loop;
		var first;
		
		this.start = function(t){
			this.t = t || 0;
			this.position = 0;
			this.animating = true;
			if(!first){
				first = drawframe.clone();
			}else{
				first.set(drawframe);
			}
		}
		this.draw = function(gl,delta,screen,manager,pMatrix,mvMatrix,drawType){
			if(this.animating && !paused){
				this.t += delta;
				if(this.times[this.position]<=this.t){
					if(this.position<this.keyframes.length-2){
						this.position++;
						this.t-=this.times[this.position]; 
					}else{
						if(this.loop){
							this.t=0;
							this.position=0;
							first = this.keyframes[this.keyframes.length-1];
						}else{
							this.animating = false;
							this.onEnd();
						}
					}
				}
				if(this.position>0){
					lterp(drawframe,this.keyframes[this.position-1],this.keyframes[this.position],this.t/this.times[this.position]);
				}else{
					lterp(drawframe,first,this.keyframes[this.position],this.t/this.times[this.position]);
				}
			}
			drawframe.draw(gl,delta,screen,manager,pMatrix,mvMatrix,drawType);
		}
		this.getTimeTillNextKeyframe = function(){
			return this.times[this.position]-this.t;
		}
		this.pushKeyframe = function(keyframe,time){
			this.keyframes.push(keyframe);
			this.times.push(time);
			if(!this.animating && this.position == 0){
				this.start(0);
			}else{
				this.animating = true;
			}
		}
		this.popKeyframe = function(){
			if(this.position<this.keyframes.length-1){
				this.keyframes.pop();
				this.times.pop();
			}
		}
		this.addTo = function(sequence){
			for(var i in sequence.keyframes){
				this.keyframess
			}
			this.animating = true;
		}
		this.setTo = function(sequence){
			this.keyframes = sequences.keyframes.slice(0);
			this.times = sequence.times.slice(0);
			this.loop = sequence.loop;
		},
		this.setCurrentKeyframe = function(time,keyframe){
			this.keyframes[this.position] = keyframe;
			this.times[this.position] = time;
			
			this.t = 0;
			if(!this.animating && this.position == 0){
				this.start(0);
			}else if(this.position == 0){
				first.set(drawframe);
			}else{
				this.keyframes[this.position-1] = first.set(drawframe);
			}
		},
		this.clear = function(){
			this.keyframes.length = 0;
			this.times.length = 0;
		}
		return this;
	}
	
	// linear interpolation between keyframes
	var lterp = function(out,a,b,delta){
		delta = Math.max(0,Math.min(delta,1));
		for(var o in out.uniforms){
			out.uniforms[o] = a.uniforms[o] + (b.uniforms[o]-a.uniforms[o]);
		}
		for(var o in out.attributeArrays){
				var outArray = out.attributeArrays[o]
				var aArray = a.attributeArrays[o];
				var bArray = b.attributeArrays[o];
				for(var i in outArray){
					if(typeof aArray[i] == 'number')outArray[i] = aArray[i] + delta*(bArray[i]-aArray[i]);
				}
		}
		return out;
	}
	console.log(lterp);//for some reason lterp gets dereferenced if this line is missing;
	//initialization logic
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//creates temporary scope to initialize the drawframe
	(function(){
		var tempUniforms = {};
		for(var o in uniforms){
			tempUniforms[o] = uniforms[o]
		}
		
		var tempAttributes = {};
		for(var o in attributeArrays){
			tempAttributes[o] = new Array();
			for(var p in attributeArrays[o]){
				tempAttributes[o][p] = attributeArrays[o][p]
			}
		}
		
		drawframe = new Keyframe(tempAttributes,tempUniforms);
	})()
	sequence = new Sequence([],[]);
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	
	//draw function
	this.draw = function(gl,delta,screen,manager,pMatrix,mvMatrix,drawType){
		sequence.draw(gl,delta,screen,manager,pMatrix,mvMatrix,drawType);
		x=NaN;
		y=NaN;
		width=NaN;
		height=NaN;
		changed=true;
	}
	
	this.glInit = function(manager){
		drawframe.glInit(manager);
	}
	
	this.glDelete = function(manager){
		drawframe.glDelete(manager);
	}
	
	//public fields
	//-------------------------------------------------------------------------
	this.addKeyframe = function(name,kAttribs,kUniforms){
		for(var o in attributeArrays){
			if(!kAttribs.hasOwnProperty(o)){ 
				throw "illegal parameter: attribute does not have property "+o;
			}
			if(!kAttribs[o].hasOwnProperty('attributeId')){
				throw "illegal parameter: attributeId missing"
			}
		}
		for(var o in uniforms){
			if(!kUniforms.hasOwnProperty(o)){
				throw "illegal parameter";
			}
		}
		keyframes[name] = new Keyframe(kAttribs,kUniforms);
	}
	this.removeKeyframe = function(name){
		if(keyframes.hasOwnProperty(name)){
			delete keyframes[name];
		}else{
			console.error('no keyframe with name '+name)
		}
	}
	this.setCurrentKeyframe = function(name,time){
		time = time || 0;
		if(keyframes.hasOwnProperty(name)){
			if(time == 0){
				sequence.clear();
				drawframe.set(keyframes[name]);
			}else{
				sequence.setCurrentKeyframe(time,keyframes[name])
			}
		}else{
			console.error('setCurrentKeyframe: no keyframe with name '+name)
		}
	}
	this.addSequence = function(name,keyframes,times,loop,onEnd){
		sequences[name] = Sequence(keyframes,times,loop,onEnd);
	}
	this.removeSequence = function(name){
		if(sequences.hasOwnProperty(name)){
			delete sequences[name];
		}else{
			console.error('no sequence with name '+name);
		}
	}
	this.getTimeTillNextKeyframe=function(){
		return sequence.getTimeTillNextKeyframe();
	}
	this.setSequence = function(name,now){
		if(!now){
			sequence.addTo(sequences[name]);
		}else{
			sequence.setTo(sequences[name]);
			sequence.start(0);
		}
	}
	this.pushKeyframe = function(time,keyframe){
		sequence.pushKeyframe(time,keyframes[keyframe]);
	}
	this.popKeyframe = function(){
		sequence.popKeyframe();
	}
	this.setVertexAttribute = function(attributeId,elementSize){
		vertexAttribute = attributeId;
		vertexSize = elementSize;
	}
	this.stop = function(){
		sequence.clear();
	}
	this.pause = function(){
		pause = true;
	}
	this.unpause = function(){
		pause = false;
	}
	var vertCheck = function(){
		if(!vertexAttribute || !vertexSize) throw "vertex attribute undefined";
	}
	
	Object.defineProperties(this,(function(){
		var theta = 0;
		var verts = new Array();
		
		var getVerts = function(){
			for(var i = 0; i<drawframe.attributeArrays[vertexAttribute].length; i++){
				verts[i] = drawframe.attributeArrays[vertexAttribute][i];	
			}
			if(theta!=0)rotateVerts(theta);
			changed = false;
		}
		var rotateVerts = function(theta){
			var c = Math.cos(theta);
			var s = Math.sin(theta);
			for(var i = 0; i<verts.length; i+=vertexSize){
				var u = verts[i], v=verts[i+1];
				verts[i] 	= c*u - s*v;
				verts[i+1] 	= s*u + c*v;
			}
		}
		
		return {
			x:{
				get: function(){
					vertCheck();
					if(changed){
						getVerts();
					}
					if(isNaN(x)){
						x = VecArray.getCorner(verts,vertexSize,0);
					}
					return x;
				},
				set: function(x){
					vertCheck();
					VecArray.setCorner(verts,vertexSize,0,x);
				}
			},
			y:{
				get: function(){
					vertCheck();
					if(changed){
						getVerts();
					}
					if(isNaN(y)){
						y = VecArray.getCorner(verts,vertexSize,1);
					}
					return y;
				},
				set: function(y){
					vertCheck();
					VecArray.setCorner(verts,vertexSize,1,y);
				}
			},
			width:{
				get: function(){
					vertCheck();
					if(changed){
						getVerts();
					}
					if(isNaN(width)){
						width = VecArray.getMaxDif(verts,vertexSize,0);
					}
					return width;
				},
				set: function(width){
					vertCheck();
					return VecArray.setMaxDif(verts,vertexSize,0,width);
				}
			},
			height:{
				get: function(){
					vertCheck();
					if(changed){
						getVerts();
					}
					if(isNaN(height)){
						height = VecArray.getMaxDif(verts,vertexSize,1);
					}
					return height;
				},
				set: function(height){
					vertCheck();
					return VecArray.setMaxDif(verts,vertexSize,1,height);
				}
			},
			theta:{
				get: function(){
					return theta;
				},
				set: function(t){
					var dif = t-theta;
					theta = t;
					rotateVerts(dif);
				}
			}
		}
	})());
	//-------------------------------------------------------------------------
	
}

VertexAnimator.prototype = new Box();