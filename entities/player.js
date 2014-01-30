
Entities.player = (function(){
	var transitionSound=Sound.createSound(Sound.addBuffer('transition','resources/audio/transition.wav'),false);
	transitionSound.gain = 0.1;
	//creates a circle with the given number of sides and radius
	var generateCircle = function(numOfVerts,radius){
		var verts = new Array();
		
		var current = vec3.set(vec3.create(),0,radius,0);
		
		var rotation = mat4.create();
		mat4.identity(rotation);
		mat4.rotateZ(rotation,rotation,(Math.PI*2)/numOfVerts);
		
		for(var i = 0;i<numOfVerts; i++){
			verts.push(current[0]);verts.push(current[1]);verts.push(current[2]);
			vec3.transformMat4(current,current,rotation);
		}
		return verts;
	}
	
	//generates a triangle keyframe
	var generateTriangle = function(numOfVerts,radius){
		var verts = new Array();
		var sides;
		var bottom;
		numOfVerts-=3;
		//get the number of vertices to be
		//hidden in the triangles sides
		if(numOfVerts%3 == 0){
			sides=numOfVerts/3;
			bottom=numOfVerts/3;
		}else{
			var div = Math.floor(numOfVerts/3);
			var mod = numOfVerts%3
			sides=div;
			bottom=div+mod;
		}
		
		var pSides = 1/(sides+1);
		var pBottom = 1/(bottom+1);
		var pa = vec3.set(vec3.create(),0,radius,0);
		var pc = vec3.set(vec3.create(),radius*Math.sin((Math.PI*2)/3),radius*Math.cos((Math.PI*2)/3),0);
		var pb = vec3.set(vec3.create(),radius*Math.sin((Math.PI*4)/3),radius*Math.cos((Math.PI*4)/3),0);
		console.log(vec3.str(pa));
		console.log(vec3.str(pb));
		console.log(vec3.str(pc));
		var temp = vec3.create();
		
		verts.push(pa[0],pa[1],pa[2]);
		for(var j = 1; j<=sides; j++){
			vec3.lerp(temp,pa,pb,pSides*j)
			verts.push(temp[0],temp[1],temp[2]);
		}
		verts.push(pb[0],pb[1],pb[2]);
		for(var j = 1; j<=bottom; j++){
			vec3.lerp(temp,pb,pc,pBottom*j);
			verts.push(temp[0],temp[1],temp[2]);
		}
		verts.push(pc[0],pc[1],pc[2]);
		for(var j = 1; j<=sides; j++){
			vec3.lerp(temp,pc,pa,pSides*j);
			verts.push(temp[0],temp[1],temp[2]);
		}
		return verts;
	}
	
	//generates a square keyframe
	var generateSquare = function(numOfVerts,radius){
		numOfVerts-=5;
		var verts = new Array();
		
		var div = Math.floor(numOfVerts/4);
		var mod = numOfVerts%4;
		var top = (div - (div%2))/2;
		var sides = div;
		var bottom = div + mod +(sides%2);
		
		var topP = 1/top;
		var sideP = 1/sides;
		var bottomP = 1/bottom;
		
		var dist = Math.sqrt((radius*radius)/2);
		
		var n = vec3.set(vec3.create(),0,dist,0);
		var ne = vec3.set(vec3.create(),dist,dist,0);
		var se = vec3.set(vec3.create(),dist,-dist,0);
		var sw = vec3.set(vec3.create(),-dist,-dist,0);
		var nw = vec3.set(vec3.create(),-dist,dist,0);
		
		var temp = vec3.create();
		
		verts.push(n[0],n[1],n[2]);
		for(var i = 1; i<=top ; i++){
			vec3.lerp(temp,n,nw,topP*i);
			verts.push(temp[0],temp[1],temp[2]);
		}
		verts.push(nw[0],nw[1],nw[2]);
		for(var i = 1; i<=sides ; i++){
			vec3.lerp(temp,nw,sw,sideP*i);
			verts.push(temp[0],temp[1],temp[2]);
		}
		verts.push(sw[0],sw[1],sw[2]);
		for(var i = 1; i<=bottom ; i++){
			vec3.lerp(temp,sw,se,bottomP*i);
			verts.push(temp[0],temp[1],temp[2]);
		}
		verts.push(se[0],se[1],se[2]);
		for(var i = 1; i<=sides ; i++){
			vec3.lerp(temp,se,ne,sideP*i);
			verts.push(temp[0],temp[1],temp[2]);
		}
		verts.push(ne[0],ne[1],ne[2]);
		for(var i = 1; i<=top ; i++){
			vec3.lerp(temp,ne,n,topP*i);
			verts.push(temp[0],temp[1],temp[2]);
		}
		return verts;
	}
	
	var getColor = function(numOfVerts,r,g,b,a){
		var colors = new Array()
		for(var i = 0; i<numOfVerts; i++){
			colors.push(r,g,b,a);
		}
		return colors;
	}
	
	var controls = {
		up:'w',
		down:'s',
		right:'d',
		left:'a'
	}
	
	var PlayerInstance = function(x,y){
		
		var verts = 32;
		var radius = 32;
		var posProps = 
			{
				attributeId: "vertexPosition",
				items: verts,
				itemSize: 3
			}
			
		var colProps = 
			{
				attributeId: "vertexColor",
				items: verts,
				itemSize: 4
			}	
		
		var circle = fillProperties(generateCircle(verts,32),posProps);
		var circleColor = fillProperties(getColor(verts,0.0,0.0,1.0,1.0),colProps);
		
		var triangle = fillProperties(generateTriangle(verts,32),posProps);
		var triangleColor = fillProperties(getColor(verts,1.0,0.0,0.0,1.0),colProps);
		
		var square = fillProperties(generateSquare(verts,32),posProps);
		var squareColor = fillProperties(getColor(verts,0.0,1.0,0.0,1.0),colProps);
		
		var animator = new VertexAnimator('basic',
			{
				playerPosition:circle,
				playerColor:circleColor
			},{},verts);
		
		animator.setVertexAttribute('playerPosition',3);
		
		animator.addKeyframe('circle',
			{
				playerPosition:circle,
				playerColor:circleColor
			},{});
			
		animator.addKeyframe('triangle',
			{
				playerPosition:triangle,
				playerColor:triangleColor
			},{});
			
		animator.addKeyframe('square',
			{
				playerPosition:square,
				playerColor:squareColor
			},{});
		
		animator.setCurrentKeyframe('triangle');
			
		var state = new MovementState(x,y);
		var acceleration = 500;
		var drag = 0.3;
		
		this.physState = state;
		state.dragConst = drag;
		
		var movementCheck = function(){//eightway directional movement
			var count=0,angle=0;
			if(keyboard[controls.down]){
				count++;
				angle+=Math.PI*(3/2);
			}
			if(keyboard[controls.up]){
				count++;
				angle+=Math.PI/2;
			}
			if(keyboard[controls.left]){
				count++;
				angle+=Math.PI;
			}
			if(keyboard[controls.right]){
				count++;
				if(keyboard[controls.down]){
					angle+=Math.PI*2;
				}
			}
			angle /= count;
			if(count>0){
				state.accel[0] = Math.cos(angle)*acceleration;
				state.accel[1] = Math.sin(angle)*acceleration;
			}else{
				state.accel[0]=0;
				state.accel[1]=0;
			}
		}
		
		var theta = 0;
		var r = Vector.getDir(triangle);
		var cx = animator.cx, cy = animator.cy;
		var mvec = [0,0];
		var k = 1;
		var pk = 0;
		this.tick = function(delta){
			movementCheck();
			if(keyboard._1 && k!=1){
				transitionSound.play(0);
				animator.setCurrentKeyframe('triangle',(pk==1) ? 1-animator.getTimeTillNextKeyframe() : 1);
				pk=k
				k=1;
			}else if(keyboard._2 && k!=2){
				transitionSound.play(0);
				animator.setCurrentKeyframe('square',(pk==2) ? 1-animator.getTimeTillNextKeyframe() : 1);
				pk=k;
				k=2;
			}else if(keyboard._3 && k!=3){
				transitionSound.play(0);
				animator.setCurrentKeyframe('circle',(pk==3) ? 1-animator.getTimeTillNextKeyframe() : 1);
				pk=k;
				k=3
			}
			
			var mx= mouse.x,my=mouse.yInv;
			theta = Vector.getDir(vec2.set(mvec,mx-(cx+state.x),my-(cy+state.y)))-r;
		}
		
		var PlayerDrawable = function(){
			this.glInit = function(manager){
				animator.glInit(manager);
			},
			this.draw=function(gl,delta,screen,manager,pMatrix,mvMatrix){
				mvMatrix.identity(mvMatrix);
				mvMatrix.translate(state.x,state.y,0);
				mvMatrix.rotateZ(theta);
				animator.draw(gl,delta,screen,manager,pMatrix,mvMatrix);
			},
			Object.defineProperties(this,{
				x:{
					set: function(){
					},
					get: function(){
						return Math.floor(state.x+animator.x);
					}
				},
				y:{
					set: function(){
					},
					get: function(){
						return Math.floor(state.y+animator.y);
					}
				},
				width:{
					set: function(){
					},
					get: function(){
						return Math.ceil(animator.width)+1;
					}
				},
				height:{
					set: function(){
					},
					get: function(){
						return Math.ceil(animator.height)+1;
					}
				}
			});
			return this;
		}
		PlayerDrawable.prototype = new GLDrawable();
		
		this.drawable = new PlayerDrawable();
		
		return this;
	}
	PlayerInstance.prototype = {
	}
	
	var instances = {};
	var currid = 0;
	
	return fillProperties({
		newInstance:function(x,y){
			instances[currid] = new PlayerInstance(x,y);
			graphics.addToDisplay(instances[currid].drawable,'gl_main');
			physics.add(instances[currid].physState);
			ticker.add(instances[currid]);
			return currid++;
		},
		getInstance: function(id){
			return instances[id];
		}
	})
})();