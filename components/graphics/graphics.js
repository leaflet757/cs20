/**
*	this file constructs the graphics component and gets the contexts used for drawing
*/

initGraphics();
var currentScreen;
var drawBoundingBoxes=true;
var doScreenTest = false;

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
				drawable.y+drawable.height > screen.y) || !doScreenTest;
	}
	
	//constructor for objects representing the different canvases with a 2d context
	var Display = function (id,display){
		this.id=id;
		this.display = display;
		//this is the screen object for this display
		this.screen = new Screen(0,0,display.width,display.height);
		//the drawables to be drawn on this display
		this.drawables = new Array();
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
			if(obj instanceof Drawable){
				this.drawables.push(obj)
				return this.drawables.length-1
			}else{
				console.error('failed to add drawable')
				return -1;
			}
		}
		
		//remove a drawable from the display
		this.remove=function(obj){
			for(var i in this.drawables){
				if(this.drawables[i]===obj){
					this.drawables.splice(i,1);
					break;
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
					if(drawBoundingBoxes){
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
					if(drawBoundingBoxes){
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
	var GLManager = function(gl){
		var shaders = {};
		var programs = {};
		var buffers = {};
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
		
		this.setArrayBuffer = function(name,isStatic,verts,items,itemSize){
			var buffer = this.getBuffer(name);
			gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
			if(isStatic){
				gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
			}else{
				gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.DYNAMIC_DRAW);
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
		this.setArrayBufferAsProgramAttribute = function(name,programName,attributeName){
			var buffer = this.getBuffer(name);
			// if(t++<64)console.log(name +" "+buffer.itemSize)
			gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
			
			gl.vertexAttribPointer(this.getProgram(programName).attribArrays[attributeName], buffer.itemSize, gl.FLOAT, false, 0, 0);
		}
		
		this.drawRect = function(x,y,width,height,r,g,b,a){
		
		}
		
		this.drawTriangle = function(x,y,width,height,r,g,b,a){
		
		}
		
		this.drawCircle = function(x,y,width,height,r,g,b,a){
		
		}
		
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
		//context for the visible canvas
		var gl;
		//this display's glManager
		var manager;
		
		//initializes the context
		try{
			gl = display.getContext("webgl") || display.getContext("experimental-webgl");
		}catch(e){}
		if(!gl){
			alert("unable to initialize webgl");
			throw "unable to initialize webgl";
		}else{
			manager = new GLManager(gl);
			gl.clearColor(0.0, 0.0, 0.0, 1.0);        
			gl.enable(gl.DEPTH_TEST);
			gl.depthFunc(gl.LEQUAL);                               
			gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
			gl.viewport(0,0,display.width,display.height);
		}
		
		//this matrix is not operated on by drawables
		var pMatrix = mat4.create();
		//this matrix is used for standard rotation, scaling, and translation
		var mvMatrix = new MatrixStack();
		
		//sets up default shader
		manager.addShader('basic_fs','fs');
		manager.addShader('basic_vs','vs');
		manager.addProgram('basic','basic_vs','basic_fs');
		manager.bindProgram('basic');
		
		manager.addShader('point_vs','point_vs');
		manager.addProgram('basic_point','point_vs','basic_fs',function(gl,prog){
			prog.attribArrays.vertexPosition = gl.getAttribLocation(prog, "aVertexPosition");
			gl.enableVertexAttribArray(prog.attribArrays.vertexPosition);
			
			prog.attribArrays.vertexColor = gl.getAttribLocation(prog, "aVertexColor");
			gl.enableVertexAttribArray(prog.attribArrays.vertexColor);
			
			prog.pMatrix = gl.getUniformLocation(prog, "uPMatrix");
			prog.mvMatrix = gl.getUniformLocation(prog, "uMVMatrix");
			prog.pointSize = gl.getUniformLocation(prog, "pointSize");
		});
		manager.bindProgram('basic_point');
		
		manager.addShader('noise_fs','noise_fs');
		manager.addShader('noise_vs','noise_vs');
		manager.addProgram('noise','noise_vs','noise_fs',function(gl,prog){
			prog.attribArrays.vertexPosition = gl.getAttribLocation(prog, "aVertexPosition");
			gl.enableVertexAttribArray(prog.attribArrays.vertexPosition);
			
			prog.pMatrix = gl.getUniformLocation(prog, "uPMatrix");
			prog.mvMatrix = gl.getUniformLocation(prog, "uMVMatrix");
			prog.time = gl.getUniformLocation(prog, "time");
		});
		manager.bindProgram('noise');
		
		
		//add a drawable to this display
		this.add=function(obj){
			if(obj instanceof GLDrawable){
				obj.glInit(manager);
				this.drawables.push(obj)
				return this.drawables.length-1
			}else if(obj instanceof Drawable){
				this.drawables.push(obj)
				return this.drawables.length-1
			}else{
				console.error('failed to add drawable')
				return -1;
			}
		}
		
		//remove a drawable from the display
		this.remove=function(obj){
			for(var i in this.drawables){
				if(this.drawables[i]===obj){
					this.drawables.splice(i,1);
					break;
				}
			}
			if(obj instanceof GLDrawable){
				obj.glDelete(manager);
			}
		}
		
		this.get=function(i){
			return this.drawables[i];
		}
		
		this.draw=function(delta){
			if(this.drawables.length<1)return;
			
			manager.bindProgram('basic');
			gl.viewport(0, 0, display.width, display.height);
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
			mat4.identity(pMatrix);
			mat4.ortho(pMatrix, this.screen.x, this.screen.x+this.screen.width, this.screen.y,this.screen.y+this.screen.height, -100.0, 100.0);
			
			mvMatrix.identity();
			
			for(var i in this.drawables){
				var d = this.drawables[i];
				if(d.visible && isOnScreen(this.screen,d)){
					mvMatrix.identity(mvMatrix);
					d.draw(gl,delta,this.screen,manager,pMatrix,mvMatrix);
					if(mvMatrix.stackSize>0){
						console.error("to many calls to push matrix or to few calls to pop matrix");
						mvMatrix.reset();
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
			}
			return -1;
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
	}
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
	glDelete: function(manager){}
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