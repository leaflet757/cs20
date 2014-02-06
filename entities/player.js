

Entities.add('player', Entities.create((function(){
	var transitionSound=Sound.createSound(Sound.addBuffer('transition','resources/audio/transition.wav'),false);
	transitionSound.gain = 0.1;
	//creates a circle with the given number of sides and radius
	var generateCircle = function(numOfVerts,radius){
		numOfVerts-=2;
		var verts = new Array();
		verts.push(0,0,0);
		var current = vec3.set(vec3.create(),0,radius,0);
		
		var rotation = mat4.create();
		mat4.identity(rotation);
		mat4.rotateZ(rotation,rotation,(Math.PI*2)/(numOfVerts+1));
		
		for(var i = 0;i<numOfVerts; i++){
			verts.push(current[0]);verts.push(current[1]);verts.push(current[2]);
			vec3.transformMat4(current,current,rotation);
		}
		
		verts.push(0,radius,0);
		return verts;
	}
	
	//generates a triangle keyframe
	var generateTriangle = function(numOfVerts,radius){
		var verts = new Array();
		verts.push(0,0,0)
		var sides;
		var bottom;
		numOfVerts-=5;
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
		verts.push(pa[0],pa[1],pa[2]);
		
		// verts.push(0,radius,0);
		console.log("verts "  + verts.length+ ' '+ numOfVerts);
		
		return verts;
	}
	
	//generates a square keyframe
	var generateSquare = function(numOfVerts,radius){
		numOfVerts-=7;
		var verts = new Array();
		verts.push(0,0,0);
		var div = Math.floor(numOfVerts/4);
		var mod = numOfVerts%4;
		var top = (div - (div%2))/2;
		var sides = div;
		var bottom = div + mod +(sides%2);
		
		var topP = 1/(top+1);
		var sideP = 1/(sides+1);
		var bottomP = 1/(bottom+1);
		
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
		verts.push(n[0],n[1],n[2]);
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
	
	return {
		create: function(state,x,y){
			{//setup animator
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
			}
			var updateCoords;
			var acceleration = 800;
			var drag = 0.01;
			var theta = 0;
			var r = Vector.getDir([triangle[3],triangle[4],triangle[5]]);
			var mvec = [0,0];
			var k = 1;
			var pk = 0;
			
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
			
			var weaponsCheck = function() { // fires currently selected weapon
				var dir = {0:0,1:0,length:2};
				if (mouse.pressed)
				{
					dir[0] = mouse.x - state.cx;
					dir[1] = mouse.yInv - state.cy;
					Entities.rocket.newInstance(state.cx,state.cy, dir);
				}
			}
		
			Object.defineProperties(
					fillProperties(fillProperties(state,fillProperties(new GLDrawable(),new BasicCollider(x+animator.x,y+animator.y,animator.width,animator.height,0.5))),
						{
							cx: x,
							cy: y,
							tick: function(){
								movementCheck();
								weaponsCheck();
								
								if(keyboard._1 && k!=1){
									transitionSound.play(0);
									animator.setCurrentKeyframe('triangle',(pk==1) ? 1-animator.getTimeTillNextKeyframe() : 1);
									pk=k;
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
									k=3;
								}
								
								var mx= mouse.x,my=mouse.yInv;
								theta = Vector.getDir(vec2.set(mvec,mx-state.cx,my-state.cy))-r;
								animator.theta = theta;
							},
							glInit: function(manager){
								animator.glInit(manager);
							},
							draw: function(gl,delta,screen,manager,pMatrix,mvMatrix){
								updateCoords();
								mvMatrix.identity(mvMatrix);
								mvMatrix.translate(state.cx,state.cy,0);
								manager.point(0,0,-1,6,1,1,1,1);
								mvMatrix.rotateZ(theta);
								animator.draw(gl,delta,screen,manager,pMatrix,mvMatrix);
								// mvMatrix.identity();
								// manager.line(state.x-animator.x,state.y-animator.y,mouse.x,mouse.yInv,0,1,1,1,1)
							}
						}),
				(function(){
					var stateX = x+animator.x, stateY= y+animator.y;
					updateCoords = function(){
						stateX = state.cx+animator.x;
						stateY = state.cy+animator.y;
					}
					
					return {
						x:{
							get:function(){
								return stateX;
							},
							set:function(x){
								this.cx+= x-stateX;
								stateX = x;
							}
						},
						y:{
							get:function(){
								return stateY;
							},
							set:function(y){
								
								this.cy += y-stateY;
								stateY = y;
							}
						},
						width:{
							get:function(){
								return animator.width;
							},
							set:function(){}
						},
						height:{
							get:function(){
								return animator.height;
							},
							set:function(){}
						}
					}
				})());
			graphics.addToDisplay(state,'gl_main');
			physics.add(state);
			ticker.add(state);
			graphics.getScreen('gl_main').follower = state;
		},
		destroy: function(state){
			graphics.removeFromDisplay(state,'gl_main');
			physics.remove(state);
			ticker.remove(state);
			if(graphics.getScreen('gl_main').follower == state)graphics.getScreen('gl_main').follower == null;
		}
	};
})()))
