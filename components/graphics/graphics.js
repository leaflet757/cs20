/**
*	this file constructs the graphics component and gets the contexts used for drawing
*/

initGraphics();
var currentScreen;
var draw_bounding_boxes  = true;
var do_screen_test = true;
var draw_grid = false;
var grid_w = 64;
var grid_h = 64;
var grid_z = 99;

function initGraphics(){
	var displayDiv=document.getElementById("displaydiv")
	var width=document.getElementById("Display").width;
	var height=document.getElementById("Display").height;
	var currentId = 1;
	var displays = {};
	var displayIds = {};
		
	var setup = function(){
		gc.fillStyle='rgb(0,0,0)'
		gc.fillRect(0,0,screen.width,screen.height)
	}
	
	var Screen = function(x,y,width,height){
		this.x=x;
		this.y=y;
		this.width=width;
		this.height=height;
	}
	Screen.prototype=fillProperties(new Box(),{
		follower: null,
		update: function(){
			if(this.follower != null){
				this.x = this.follower.cx - (this.width/2);
				this.y = this.follower.cy  - (this.height/2);
			}
		}
	})
	
	//creates a new canvas and adds it to the document
	var createCanvas = function(width,height,z){
		var canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		canvas.style.zIndex=z;
		displayDiv.appendChild(canvas)
		return canvas;
	}
	
	var isOnScreen = function(screen,drawable){
		return (drawable.x < screen.x+screen.width 		&& 
				drawable.x+drawable.width > screen.x 	&&
				drawable.y < screen.y+screen.height 	&&
				drawable.y+drawable.height > screen.y) || !do_screen_test || drawable.boundless;
	}
	
	var zComp = function(a,b){
		return a.z - b.z;
	}
	//constructor for objects representing the different canvases with a 2d context
	var Display = function (id,display){
		this.id=id;
		this.display = display;
		//this is the screen object for this display
		this.screen = new Screen(0,0,display.width,display.height);
		//the drawables to be drawn on this display without a z-index
		this.drawables = new Array();
		//the sorted drawables
		this.zDrawables = new Array();
		//context for the visible canvas
		this.contextFinal = this.display.getContext("2d");
		//creates a buffer canvas
		this.buffer=document.createElement('canvas');
		this.buffer.width=display.width;
		this.buffer.height=display.height;
		//the context to draw to
		this.context=this.buffer.getContext('2d');
		
		//add a drawable to this display
		this.add=function(obj){
			if(obj.isDrawable){
				if(typeof obj.z == 'number'){
					var i = 0;
					for(;i<this.zDrawables.length; i++){
						if(this.zDrawables[i].z<obj.z) break;
					}
					this.zDrawables.splice(i,0,obj);
				}else{
					this.drawables.push(obj)
					return this.drawables.length-1
				}
			}else{
				console.error('failed to add drawable')
				return -1;
			}
		}
		
		//remove a drawable from the display
		this.remove=function(obj){
			if(typeof obj.z == 'number'){
				for(var i in this.zDrawables){
					if(this.zDrawables[i]===obj){
						this.zDrawables.splice(i,1);
						break;
					}
				}
			}else{
				for(var i in this.drawables){
					if(this.drawables[i]===obj){
						this.drawables.splice(i,1);
						break;
					}
				}
			}
		}
		
		this.get=function(i){
			return this.drawables[i];
		}
		
		var lastx=0,lasty=0;
		var draws = new Array(); //allocating this here prevents garbage from being generated
		//draw the drawables then clears the buffer using dirty rectangles
		this.draw=function(delta){
			if(this.drawables.length<=0)return;
			
			var ctx = this.context;
			var s = this.screen;
			if(s.x!=lastx,s.y!=lasty){
				ctx.setTransform(0,0,0,-s.x,-s.y);
				lastx=s.x;
				lasty=s.y;
			}
			for(var i in this.drawables){
				var d = this.drawables[i];
				if(d.visible && isOnScreen(s,d)){
					ctx.save();
					d.draw(ctx,delta,this.screen);
					draws.push(d);
					ctx.restore();
					if(draw_bounding_boxes){
						Draw.rect.stroke(ctx,'rgb(255,255,255)',d.x,d.y,d.width,d.height)
					}
				}
			}
			if(draws.length>0)this.contextFinal.drawImage(this.buffer,0,0);
		}
		this.clear = function(){
			var s = this.screen;
			if(s.x!=lastx,s.y!=lasty){
				ctx.setTransform(0,0,0,-s.x,-s.y);
				lastx=s.x;
				lasty=s.y;
			}
			while(draws.length>0){
				var d = draws.pop();
				if(d.clear){
					if(draw_bounding_boxes){
						this.context.clearRect(d.x-1,d.y-1,d.width+2,d.height+2);
						this.contextFinal.clearRect(d.x-1,d.y-1,d.width+2,d.height+2);
					}else{
						this.context.clearRect(d.x,d.y,d.width,d.height);
						this.contextFinal.clearRect(d.x,d.y,d.width,d.height);
					}
				}
				// this.context.clearRect(0,0,this.screen.width,this.screen.height);
				// this.contextFinal.clearRect(0,0,this.screen.width,this.screen.height);
			}
		}
	}
	
	var MatrixStack = function(){
		var stack = new Array();
		var position = 0;
		var matrix = mat4.create();
		
		var vec = {};//this object is used to avoid garbage generation during matrix operations
		
		/**
		* pushes a matrix onto the stack.
		* allocates a new matrix and copies the currents values to it
		*/
		this.push = function(){
			if(stack.length<position+1){
				stack.push(mat4.copy(mat4.create(),matrix));
				position++;
			}else{//matrix in position already exists
				mat4.copy(stack[position++],matrix);
			}
		}
		
		/**
		* pops a matrix from the stack
		* generates garbage
		*/
		this.pop = function(){
			if(position>0){
				mat4.copy(matrix,stack[--position]);
			}else{
				throw "to many calls to pop matrix"
			}
		}
		
		this.translate = function(x ,y, z){
			vec[0]=x;vec[1]=y;vec[2]=z;
			mat4.translate(matrix,matrix,vec);
		}
		
		this.rotateX = function(rad){
			mat4.rotateX(matrix,matrix,rad);
		}
		
		this.rotateY = function(rad){
			mat4.rotateY(matrix,matrix,rad);
		}
		
		this.rotateZ = function(rad){
			mat4.rotateZ(matrix,matrix,rad);
		}
		
		
		this.scale = function(w,h,d){
			vec[0]=w;vec[1]=h;vec[2]=d;
			mat4.scale(matrix,matrix,vec);
		}
		
		this.identity = function(){
			mat4.identity(matrix);
		}
		
		/**
		*sets position to 0 resetting the stack without creating garbage 
		*/
		this.reset = function(){
			position = 0;
		}
		
		/**
		* clears array deallocating all created matrices
		*/
		this.clear = function(){
			stack.length = 0;
			position = 0;
		}
		
		Object.defineProperties(
		this,
		{
			current:{
				get:function(){return matrix;},
				set:function(mat){matrix = mat;}
			},
			stackSize:{
				get: function(){return position},
				set: function(){}
			}
		}
		);
		
		return this;
	}
	
	//this manages the buffers, shaders, and programs for a gl context
	var GLManager = function(gl,pMatrix,mvMatrix){
		var shaders = {};
		var programs = {};
		var buffers = {};
		var textures = {};
		
		var currentProgram = null;
		var getShader = function(id){
			var shaderScript = document.getElementById(id);
			if (!shaderScript) {
				throw "cannot find shader";
			}

			var str = shaderScript.innerHTML;

			var shader;
			if (shaderScript.type == "x-shader/x-fragment") {
				shader = gl.createShader(gl.FRAGMENT_SHADER);
			} else if (shaderScript.type == "x-shader/x-vertex") {
				shader = gl.createShader(gl.VERTEX_SHADER);
			} else {
				return null;
			}

			gl.shaderSource(shader, str);
			gl.compileShader(shader);

			if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
				console.log(str);
				throw gl.getShaderInfoLog(shader)+" shader compile fail";
				return null;
			}

			return shader;
		} 
		
		/**
		* compiles and adds the shader
		*/
		this.addShader = function(name,docId){
			if(shaders.hasOwnProperty(name)){
				console.log("overwriting shader: "+name);
			}
			shaders[name] = getShader(docId);
		}
		
		/**
		* deletes the shader
		*/
		this.removeShader = function(name){
			if(shaders.hasOwnProperty(name)){
				gl.deleteShader(shaders[name]);
				delete shaders[name];
			}else{
				throw 'no such shader: '+name;
			}
		}
		
		/**
		* creates a program from the shaders with the passed ids
		* does not set the new program to the current program
		* setupAttributes is a function that can be passed to set the shaders Attributes
		*/
		this.addProgram = function(name,vertShaderId,fragShaderId,setupAttributes){
			var vertexShader = shaders[vertShaderId], fragmentShader = shaders[fragShaderId]
			var shaderProgram = gl.createProgram();
			gl.attachShader(shaderProgram, vertexShader);
			gl.attachShader(shaderProgram, fragmentShader);
			gl.linkProgram(shaderProgram);
			
			if(!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)){
				alert("could not initialize shaders, error linking program: "+name+" log info="+gl.getProgramInfoLog(shaderProgram));
			}
			
			shaderProgram.attribArrays = {};
			
			if(typeof setupAttributes == 'function'){
				setupAttributes(gl,shaderProgram);
			}else{
				shaderProgram.attribArrays.vertexPosition = gl.getAttribLocation(shaderProgram, "aVertexPosition");
				gl.enableVertexAttribArray(shaderProgram.attribArrays.vertexPosition);
				
				shaderProgram.attribArrays.vertexColor = gl.getAttribLocation(shaderProgram, "aVertexColor");
				gl.enableVertexAttribArray(shaderProgram.attribArrays.vertexColor);
				
				shaderProgram.pMatrix = gl.getUniformLocation(shaderProgram, "uPMatrix");
				shaderProgram.mvMatrix = gl.getUniformLocation(shaderProgram, "uMVMatrix");
			}
			
			if(programs.hasOwnProperty(name)){
				console.log("overwriting program: "+name);
			}
			programs[name] = shaderProgram;
			return name;
		}
		
		this.removeProgram = function(name){
			if(programs.hasOwnProperty(name)){
				gl.deleteProgram(programs[name]);
				delete programs[name];
			}else{
				throw 'no such program: '+name;
			}
		}
		
		this.bindProgram = function(name){
			var p = this.getProgram(name);
			if(currentProgram!=null){
				for(var o in currentProgram.attribArrays){
					gl.disableVertexAttribArray(currentProgram.attribArrays[o]);
				}
			}
			for(var o in p.attribArrays){
				gl.enableVertexAttribArray(p.attribArrays[o]);
			}
			gl.useProgram(p);
			currentProgram = p;
			return name;
		}
		
		this.getProgram = function(name){
			if(programs.hasOwnProperty(name)){
				return programs[name];
			}else{
				throw 'no such program: '+name;
			}
		}
		
		this.setUniform1f = function(programId,uniformName,value){
			gl.uniform1f(this.getProgram(programId)[uniformName],value);
		}
		
		/**
		* sets a programs matrix 
		*/
		this.setMatrix = function(name,matrixName,matrix){
			var p = this.getProgram(name);
			gl.uniformMatrix4fv(p[matrixName], false, matrix);
			return name;
		}
		
		/**
		* sets both the model view and the projection matrix
		*/
		this.setMatrixUniforms= function(name,pMatrix,mvMatrix){
			var p = this.getProgram(name);
			gl.uniformMatrix4fv(p.pMatrix, false, pMatrix);
			gl.uniformMatrix4fv(p.mvMatrix, false, mvMatrix);
		}
		/**
		* create a new buffer and initializes its values
		*/
		this.addArrayBuffer = function(name,isStatic,verts,items,itemSize){
			var buffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
			if(isStatic){
				gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
			}else{
				gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.DYNAMIC_DRAW);
			}
			buffer.items = items || verts.items;
			buffer.itemSize = itemSize || verts.itemSize;
			if(buffers.hasOwnProperty(name)){
				console.log("overwriting buffer: "+name);
			}
			buffers[name]=buffer;
			return name;
		}
		
		/**
		* fetches a buffer
		*/
		this.getBuffer = function(name){
			if(buffers.hasOwnProperty(name)){
				return buffers[name];
			}else{
				throw 'no such buffer: '+name;
			}
		}
		
		/**
		*	sets the current array buffer to the passed array or Float32Array
		*	should only be called on dynamic buffers
		*/
		this.setArrayBuffer = function(name,isStatic,verts,items,itemSize){
			var buffer = this.getBuffer(name);
			gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
			if(isStatic){
				gl.bufferData(gl.ARRAY_BUFFER, (verts instanceof Float32Array) ? verts : new Float32Array(verts), gl.STATIC_DRAW);
			}else{
				gl.bufferData(gl.ARRAY_BUFFER, (verts instanceof Float32Array) ? verts : new Float32Array(verts), gl.DYNAMIC_DRAW);
			}
			buffer.items = items || verts.items;
			buffer.itemSize = itemSize || verts.itemSize;
		}
		
		this.removeBuffer = function(name){
			if(buffers.hasOwnProperty(name)){
				gl.deleteBuffer(buffers[name]);
				delete buffers[name];
			}else{
				throw 'no such buffer: '+name;
			}
		}
		
		this.bindArrayBuffer = function(name){
			gl.bindBuffer(gl.ARRAY_BUFFER,this.getBuffer(name));
		}
		
		// var t = 0;
		this.setArrayBufferAsProgramAttribute = function(bufferName,programName,attributeName){
			var buffer = this.getBuffer(bufferName);
			// if(t++<64)console.log(name +" "+buffer.itemSize)
			gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
			
			gl.vertexAttribPointer(this.getProgram(programName).attribArrays[attributeName], buffer.itemSize, gl.FLOAT, false, 0, 0);
		}
		
		this.addTexture = (function(){
			var handleTexture = function(text){
				gl.bindTexture(gl.TEXTURE_2D, text);
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, text.image);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
				gl.bindTexture(gl.TEXTURE_2D, null);
			}
			
			return function(fileName){
				var text = gl.createTexture();
				text.loaded = false;
				text.image = new Image();
				text.image.onload = function(){
					handleTexture(text);
				}
				text.image.src = fileName;
				textures[fileName] = text;
				return fileName;
			}
		})();
		
		this.getTexture = function(fileName){
			if(textures[fileName]){
				return textures[fileName];
			}else{
				throw 'texture not found'
			}
		}
		
		this.bindTexture = function(fileName){
			if(textures[fileName]){
				gl.bindTexture(gl.TEXTURE_2D, textures);
			}else{
				throw 'texture not found'
			}
		}
		
		this.removeTexture = function(fileName){
			gl.deleteTexture(textures[fileName]);
			delete textures[fileName];
		}
		
		this.createSprite = (function(){
			var Sprite = function(manager,texture){
				this.draw = function(){
					gl.enable(gl.BLEND);
					gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
					manager.bindProgram('basic_texture');
					manager.setArrayBufferAsProgramAttribute('primitive_rect','basic_texture','vertexPosition');
					manager.setArrayBufferAsProgramAttribute('sprite_texture_coords','basic_texture','textureCoord');
					
					mvMatrix.push();
						mvMatrix.translate(this.x+this.width/2,this.y+this.height/2,this.z || 0);
						mvMatrix.scale(this.width,this.height,1);
						manager.setMatrixUniforms('basic_texture',pMatrix,mvMatrix.current);
					mvMatrix.pop();
					
					gl.activeTexture(gl.TEXTURE0);
					gl.bindTexture(gl.TEXTURE_2D, texture);
					var prog = manager.getProgram('basic_texture');
					gl.uniform1i(prog.samplerUniform, 0);
					gl.uniform1f(prog.alpha, this.alpha)
					gl.uniform1f(prog.tintWeight,this.tintWeight);
					gl.uniform3fv(prog.tint,this.tint);
					
					gl.drawArrays(gl.TRIANGLE_FAN,0,4);
				}
			}
			Sprite.prototype = fillProperties(new Box(),
				{
					tint: [0,0,0],
					tintWeight: 0,
					alpha: 1,
					setTint: function(r,g,b,a){
						this.tint[0]=r;
						this.tint[1]=g;
						this.tint[2]=b;
					}
				}
			);
			
			return function(name){
				if(!textures[name])this.addTexture(name)
				return new Sprite(this,textures[name]);
			}
		})();
		//convenience functions
		//----------------------------------------------------------------------------------------
		var simpleColorVec = vec4.create();
		var sr=0,sg=0,sb=0,sa=1;
		var fr=0,fg=0,fb=0,fa=1;
		var drawMode = 0;
		
		this.CORNER = 1;
		this.CENTER = 0;
		
		this.setDrawMode = function(mode){
			if(mode == this.CENTER || mode == this.CORNER) drawMode = mode;
		}
		
		this.drawPrimitive = function(x,y,z,width,height,theta,r,g,b,a,name,numOfVerts,drawType){
			this.bindProgram('simple');
			gl.uniform4fv(this.getProgram('simple').color,vec4.set(simpleColorVec,r,g,b,a));
			this.setArrayBufferAsProgramAttribute(name,'simple','vertexPosition');
			mvMatrix.push();
			if(drawMode==this.CORNER){
				mvMatrix.translate(x+this.width/2,y+this.height/2,z);
			}else{
				mvMatrix.translate(x,y,z);
			}
			mvMatrix.scale(width,height,1);//default width and height is 1 so scaling is simple
			if(theta && theta!=0){
				mvMatrix.rotateZ(theta);
			}
			this.setMatrixUniforms('simple',pMatrix,mvMatrix.current);
			gl.drawArrays(drawType,0,numOfVerts);
			mvMatrix.pop();
		}
		
		this.fill = function(r,g,b,a){
			if(	
				typeof g != 'number' && 
				typeof b != 'number' && 
				typeof a != 'number'
					) {
				if(typeof r == 'number'){
					fr = r;
					fb = r;
					fg = r;
					fa = 1;
				}
			}else{
				fr = checkNum(r,1);
				fg = checkNum(g,1);
				fb = checkNum(b,1);
				fa = checkNum(a,1);
			}
		}
		
		this.fillPrimitive = function(x,y,z,width,height,theta,r,g,b,a,name,numOfVerts){
			this.drawPrimitive(x,y,z,width,height,theta,checkNum(r,fr),checkNum(g,fg),checkNum(b,fb),checkNum(a,fa),name,numOfVerts,gl.TRIANGLE_FAN);
		}
		
		this.fillRect = function(x,y,z,width,height,theta,r,g,b,a){
			this.fillPrimitive(x,y,z,width,height,theta,r,g,b,a,'primitive_rect',4);
		}
		
		this.fillTriangle = function(x,y,z,width,height,theta,r,g,b,a){
			this.fillPrimitive(x,y,z,width,height,theta,r,g,b,a,'primitive_triangle',3);
		}
		
		this.fillEllipse = function(x,y,z,width,height,theta,r,g,b,a){
			this.fillPrimitive(x,y,z,width,height,theta,r,g,b,a,'primitive_circle',16);
		}
		
		this.stroke = function(r,g,b,a){
			if(	
				typeof g != 'number' && 
				typeof b != 'number' && 
				typeof a != 'number'
					) {
				if(typeof r == 'number'){
					sr = r;
					sb = r;
					sg = r;
					sa = 1;
				}
			}else{
				sr = checkNum(r,1);
				sg = checkNum(g,1);
				sb = checkNum(b,1);
				sa = checkNum(a,1);
			}
		}
		
		this.strokePrimitive = function(x,y,z,width,height,theta,r,g,b,a,name,numOfVerts){
			this.drawPrimitive(x,y,z,width,height,theta,checkNum(r,sr),checkNum(g,sg),checkNum(b,sb),checkNum(a,sa),name,numOfVerts,gl.LINE_LOOP,this);
		}
		
		this.strokeRect = function(x,y,z,width,height,theta,r,g,b,a){
			this.strokePrimitive(x,y,z,width,height,theta,r,g,b,a,'primitive_rect',4);
		}
		
		this.strokeTriangle = function(x,y,z,width,height,theta,r,g,b,a){
			this.strokePrimitive(x,y,z,width,height,theta,r,g,b,a,'primitive_triangle',3);
		}
		
		this.strokeEllipse = function(x,y,z,width,height,theta,r,g,b,a){
			this.strokePrimitive(x,y,z,width,height,theta,r,g,b,a,'primitive_circle',32);
		}
		
		this.line = function(x1,y1,x2,y2,z,r,g,b,a){
			this.strokePrimitive(x1,y1,z,x2-x1,y2-y1,0,r,g,b,a,'primitive_line',2);
		}
		
		this.point = function(x,y,z,size,r,g,b,a){
			this.bindProgram('simple_point');
			gl.uniform1f(this.getProgram('simple_point').pointSize,(size || 6.0));
			gl.uniform4fv(this.getProgram('simple_point').color,vec4.set(simpleColorVec,checkNum(r,fr),checkNum(g,fg),checkNum(b,fb),checkNum(a,fa)));
			this.setArrayBufferAsProgramAttribute('empty_point','simple','vertexPosition');
			mvMatrix.push();
			mvMatrix.translate(x,y,z);
			this.setMatrixUniforms('simple_point',pMatrix,mvMatrix.current);
			gl.drawArrays(gl.POINTS,0,1);
			mvMatrix.pop();
		}
		
		this.drawGrid = function(box,z,gridW,gridH,r,b,g,a){
			this.stroke(r,g,b,a);
			var start = Math.ceil(box.x/gridW)*gridW;
			for(var x = start; x < box.x+box.width; x+=gridW){
				this.line(x,box.y,x,box.y+box.height,z);
			}
			var start = Math.ceil(box.y/gridH)*gridH;
			for(var y = start; y < box.y+box.height; y+=gridH){
				this.line(box.x,y,box.x+box.width,y,z);
			}
		}
		
		//----------------------------------------------------------------------------------------
		/**
		* frees all shaders, programs, and buffers
		*/
		this.clear = function(){
			while(buffers.length>0){
				gl.deleteBuffer(buffers.pop());
			}
			while(programs.length>0){
				gl.deleteProgram(programs.pop());
			}
			while(shaders.length>0){
				gl.deleteShader(shaders.pop());
			}
		}
	
	
		//sets up shaders, primitives, and generic buffers
		{
			this.addArrayBuffer('empty_point',true,[0.0,0.0,0.0],1,3);//for drawing single points
			
			this.addArrayBuffer('primitive_line',true,
			[
				0.0, 0.0, 0.0,
				1.0, 1.0, 0.0
			],2,3)
			
			
			this.addArrayBuffer('primitive_triangle',true,
			[
				0.0,   0.5,  0.0,
				0.5,  -0.5,  0.0,
				-0.5, -0.5, 0.0
			],3,3);
			
			this.addArrayBuffer('primitive_rect',true,
			[
				0.5,   0.5,  0.0,
				0.5,  -0.5,  0.0,
				-0.5, -0.5, 0.0,
				-0.5,  0.5, 0.0
			],4,3);
			
			
			this.addArrayBuffer('primitive_circle',true,(function(){
					var verts = [];
					var current = [0.0,0.5,0.0];
					var numOfVerts = 16
					var theta = (Math.PI*2)/(numOfVerts)
					var c = Math.cos(theta);
					var s = Math.sin(theta);
					
					for(var i = 0; i<numOfVerts; i++){
						verts.push(current[0],current[1],current[2]);
						var u =current[0];
						var v =current[1]
						current[0]= c*u - s*v;
						current[1]= s*u + c*v;
						current[2]=0;
					}
					return verts;
				})(),16,3);
		
			this.addArrayBuffer('sprite_texture_coords',false,[
				1.0, 1.0, 0.0,
				1.0, 0.0, 0.0,
				0.0, 0.0, 0.0,
				0.0, 1.0, 0.0
			],4,3);
			//load shaders
			this.addShader('basic_fs','fs');
			this.addShader('basic_vs','vs');
			this.addProgram('basic','basic_vs','basic_fs');
			this.bindProgram('basic');
			
			this.addShader('simple_fs','simple_fs');
			this.addShader('simple_vs','simple_vs')
			this.addProgram('simple','simple_vs','simple_fs',function(gl,prog){
				prog.attribArrays.vertexPosition = gl.getAttribLocation(prog, "aVertexPosition");
				gl.enableVertexAttribArray(prog.attribArrays.vertexPosition);
				
				prog.pMatrix = gl.getUniformLocation(prog, "uPMatrix");
				prog.mvMatrix = gl.getUniformLocation(prog, "uMVMatrix");
				prog.color = gl.getUniformLocation(prog, "color");
			});
			this.bindProgram('simple');
			
			this.addShader('point_vs','point_vs');
			this.addProgram('basic_point','point_vs','basic_fs',function(gl,prog){
				prog.attribArrays.vertexPosition = gl.getAttribLocation(prog, "aVertexPosition");
				gl.enableVertexAttribArray(prog.attribArrays.vertexPosition);
				
				prog.attribArrays.vertexColor = gl.getAttribLocation(prog, "aVertexColor");
				gl.enableVertexAttribArray(prog.attribArrays.vertexColor);
				
				prog.pMatrix = gl.getUniformLocation(prog, "uPMatrix");
				prog.mvMatrix = gl.getUniformLocation(prog, "uMVMatrix");
				prog.pointSize = gl.getUniformLocation(prog, "pointSize");
			});
			this.bindProgram('basic_point');
			
			this.addShader('simple_point_vs','simple_point_vs');
			this.addProgram('simple_point','simple_point_vs','simple_fs',function(gl,prog){
				prog.attribArrays.vertexPosition = gl.getAttribLocation(prog, "aVertexPosition");
				gl.enableVertexAttribArray(prog.attribArrays.vertexPosition);
				
				prog.pMatrix = gl.getUniformLocation(prog, "uPMatrix");
				prog.mvMatrix = gl.getUniformLocation(prog, "uMVMatrix");
				prog.pointSize = gl.getUniformLocation(prog, "pointSize");
				prog.color = gl.getUniformLocation(prog, "color");
			});
			this.bindProgram('simple_point');
			
			this.addShader('noise_fs','noise_fs');
			this.addShader('noise_vs','noise_vs');
			this.addProgram('noise','noise_vs','noise_fs',function(gl,prog){
				prog.attribArrays.vertexPosition = gl.getAttribLocation(prog, "aVertexPosition");
				gl.enableVertexAttribArray(prog.attribArrays.vertexPosition);
				
				prog.pMatrix = gl.getUniformLocation(prog, "uPMatrix");
				prog.mvMatrix = gl.getUniformLocation(prog, "uMVMatrix");
				prog.time = gl.getUniformLocation(prog, "time");
			});
			this.bindProgram('noise');
			
			this.addShader('text_fs','text_fs');
			this.addShader('text_vs','text_vs');
			this.addProgram('basic_texture','text_vs','text_fs',function(gl,prog){
				prog.attribArrays.vertexPosition = gl.getAttribLocation(prog, "aVertexPosition");
				gl.enableVertexAttribArray(prog.attribArrays.vertexPosition);
				prog.attribArrays.textureCoord = gl.getAttribLocation(prog, "aTextureCoord");
				gl.enableVertexAttribArray(prog.attribArrays.vertexPosition);
				
				prog.sampler = gl.getUniformLocation(prog, 'uSampler');
				prog.tint = gl.getUniformLocation(prog, 'uTint');
				prog.alpha = gl.getUniformLocation(prog, 'uAlpha');
				prog.tintWeight = gl.getUniformLocation(prog, 'uTintWeight');
				prog.pMatrix = gl.getUniformLocation(prog, "uPMatrix");
				prog.mvMatrix = gl.getUniformLocation(prog, "uMVMatrix");
			});
			this.bindProgram('basic_texture');
		}
	}
	
	//constructor for a display that uses the webgl context
	//parameters passed to draw (gl,delta,screen,manager,pMatrix,mvMatrix)
	var GLDisplay = function(id,display){
		this.id=id;
		this.display = display;
		//this is the screen object for this display
		this.screen = new Screen(0,0,display.width,display.height);
		//the drawables to be drawn on this display
		this.drawables = new Array();
		//the sorted drawables
		this.zDrawables = new Array();
		//context for the visible canvas
		var gl;
		//this display's glManager
		var manager;
		
		//this matrix is not operated on by drawables
		var pMatrix = mat4.create();
		//this matrix is used for standard rotation, scaling, and translation
		var mvMatrix = new MatrixStack();
		
		//initializes the context
		try{
			gl = display.getContext("webgl") || display.getContext("experimental-webgl");
		}catch(e){}
		if(!gl){
			alert("unable to initialize webgl");
			throw "unable to initialize webgl";
		}else{
			manager = new GLManager(gl,pMatrix,mvMatrix);
			gl.clearColor(0.0, 0.0, 0.0, 1.0);        
			gl.enable(gl.DEPTH_TEST);
			gl.depthFunc(gl.LEQUAL);                               
			gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
			gl.viewport(0,0,display.width,display.height);
		}
		
		//sets up default shader
		
		//add a drawable to this display
		this.add=function(obj){
			
			if(obj.isDrawable){
				if(obj.isGLDrawable) obj.glInit(manager);
				
				if(typeof obj.z == 'number'){
					var i = 0;
					for(;i<this.zDrawables.length; i++){
						if(this.zDrawables[i].z<obj.z) break;
					}
					this.zDrawables.splice(i,0,obj);
				}else{
					this.drawables.push(obj)
				}
			}else{
				console.error('failed to add drawable '+obj)
			}
		}
		
		//remove a drawable from the display
		this.remove=function(obj){
			if(typeof obj.z == 'number'){
				for(var i in this.zDrawables){
					if(this.zDrawables[i]===obj){
						this.zDrawables.splice(i,1);
						break;
					}
				}
			}else{
				for(var i in this.drawables){
					if(this.drawables[i]===obj){
						this.drawables.splice(i,1);
						break;
					}
				}
			}
			if(obj.isGLDrawable){
				obj.glDelete(manager);
			}
		}
		
		this.get=function(i){
			return this.drawables[i];
		}
		
		var drawSet = function(screen,drawables,delta){
			for(var i in drawables){
				var d = drawables[i];
				if(d.visible && isOnScreen(screen,d)){
					mvMatrix.identity(mvMatrix);
					d.draw(gl,delta,screen,manager,pMatrix,mvMatrix);
					if(mvMatrix.stackSize>0){
						console.error("to many calls to push matrix or to few calls to pop matrix");
						mvMatrix.reset();
					}
				}
			}
		}
		
		this.draw=function(delta){
			if(this.drawables.length<1)return;

			manager.bindProgram('basic');
			gl.viewport(0, 0, display.width, display.height);
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
			mat4.identity(pMatrix);
			mat4.ortho(pMatrix, this.screen.x, this.screen.x+this.screen.width, this.screen.y,this.screen.y+this.screen.height, 100.0, -100.0);
			
			mvMatrix.identity();
			
			if(draw_grid) manager.drawGrid(this.screen,grid_z,grid_w,grid_h,1);
			
			drawSet(this.screen, this.drawables, delta);
			drawSet(this.screen, this.zDrawables, delta);
			
			if(draw_bounding_boxes){	
				mvMatrix.identity();
				for(var i in this.drawables){
					var d = this.drawables[i];
					if(d.visible && isOnScreen(this.screen,d)){
						manager.strokeRect(d.x+(d.width/2),d.y+(d.height/2),0,d.width,d.height,0,1,1,1,1);
					}
					manager.setDrawMode(this.CENTER)
				}
				for(var i in this.zDrawables){
					var d = this.zDrawables[i];
					if(d.visible && isOnScreen(this.screen,d)){
						manager.strokeRect(d.x+(d.width/2),d.y+(d.height/2),0,d.width,d.height,0,1,1,1,1);
					}
				}
			}
		}
		this.clear = function(delta){}
		
		return this;
	}
	
	var getDisplay = function(identifier){
		if(typeof identifier == 'string'){
			if(typeof displayIds[identifier]){
				identifier = displayIds[identifier];
			}else{
				return;
			}
		}
		//assumes identifier is number 
		if(typeof displays[identifier] == 'object'){
			return displays[identifier];
		}
	}
	
	//add the first display
	displayIds.gl_main = 0;
	displays[0] = new GLDisplay(0,document.getElementById("Display"));
	//fills in background black
	
	//these are the public parts of the graphics components
	graphics = fillProperties(new Updatable(),{
		preupdate:function(){
			for(var i in displays){
				displays[i].clear();
			}
		},
		//does drawing
		update:function(delta){
			for(var i in displays){
				displays[i].draw(delta);
			}
		},
		updateScreens:function(delta){
			for(var i in displays){
				displays[i].screen.update();
			}
		},
		//creates a new display
		addDisplay:function(z,name){
			var id = currentId++
			displays[id]=(new Display(id,createCanvas(width,height,Math.round(z))));
			if(typeof name == 'string'){
				displayIds[name]=id;
			}
			return id;
		},
		addGLDisplay: function(z,name){
			var id = currentId++
			displays[id]=(new GLDisplay(id,createCanvas(width,height,Math.round(z))));
			if(typeof name == 'string'){
				displayIds[name]=id;
			}
			return id;
		},
		addToDisplay:function(drawable,identifier){
			var d = getDisplay(identifier);
			if(typeof d == 'object'){
				return d.add(drawable);
			}else{
				throw 'no such display: '+identifier;
			}
			return -1;
		},
		removeFromDisplay: function(drawable,identifier){
			getDisplay(identifier).remove(drawable);
		},
		setDisplayName:function(id,name){
			if(typeof displays[id] == 'object'){
				displayIds[name] = id;
				return true;
			}
			return false;
		},
		getScreen:function(identifier){
			var d = getDisplay(identifier);
			if(typeof d == 'object'){
				return d.screen;
			}
		}
	});
	gameComponents[2] = graphics;
}

/**
*	this is the abstract class defining all drawable objects
*/
function Drawable(){
	
	//these variables are set by the component when the drawable is added and shouldn't be changed
	this.displayWidth=0;
	this.displayHeight=0;
}
Drawable.prototype = fillProperties(new Box(),{
	//these variables define this objects bounding rectangle
	x: 0,
	y: 0,
	width: 0,
	height: 0,
	
	
	visible: true,
	clear: true,
	//sets values
	init: function(x,y,width,height){
		this.x=x;
		this.y=y;
		this.width=width;
		this.height=height;
	},
	//this function should be overridden to provide functionality
	draw: function(ctx,screen,delta){
	},
	isDrawable: true
});

/**
* this is an abstract class defining a special drawable for webgl displays
* it has the method glInit which is called when the object is added to the display in order to 
* initialize any buffers the object uses and it has the method glDelete so that the 
* object can free any data when it is removed
*/
function GLDrawable(){}
GLDrawable.prototype = fillProperties(new Drawable(),{
	glInit: function(manager){},
	glDelete: function(manager){},
	isGLDrawable: true
});

/**
* this is the library of draw functions
* drawing should exclusively use this library in order to aid
* possible transitions to other graphics libraries
*/
Draw = (function(){
	var inputVertices = function(gc,style,vertices){
		gc.beginPath();
			if(vertices instanceof Array && vertices.length>=3){//minimum of three vertices
				gc.moveTo(vertices[0].x,vertices[0].y);
				for(var i = 1; i<vertices.length; i++){
					gc.lineTo(vertices[i].x,vertices[i].y);
				}
			}else{
				throw "Draw.polygon: invalid input";
			}
		gc.closePath();
	}
	return {
		rect: {
			fill : function(gc,style,x,y,width,height){
				gc.fillStyle = style;
				gc.fillRect(x,y,width,height)
			},
			stroke: function(gc, style,x,y, width, height){
				gc.strokeStyle = style;
				gc.strokeRect(x,y,width,height)
			}
		},	
		polygon: {
			fill : function(gc,style,vertices){
				gc.fillStyle = style;
				inputVertices(gc,style,vertices);
				gc.fill();
			},
			stroke: function(gc,style,vertices){
				gc.strokeStyle = style;
				inputVertices(gc,style,vertices);
				gc.stroke();
			}
		},
		circle: {
			fill : function(gc,style,x,y,radius){
				gc.beginPath();
				gc.arc(x,y,(radius),0,(2*Math.PI));
				gc.fillStyle=style;
				gc.closePath();
				gc.fill();
			},
			stroke: function(gc,stle,x,y,radius){
				gc.beginPath();
				gc.arc(x,y,(radius),0,(2*Math.PI));
				gc.strokeStyle=style;
				gc.closePath();
				gc.stroke();
			}
		}
	};
})();


importS('components/graphics/animatedPolygon.js');
importS('components/graphics/VertexAnimator.js');