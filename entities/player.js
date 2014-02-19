

Entities.add('player', Entities.create((function(){

	var transitionSound=Sound.createSound('transition',false);
	transitionSound.gain = 0.1;
	var blipSound=Sound.createSound('blip',false);
	blipSound.gain = 0.05;
	var playerExplosion=Sound.createSound('playerExplosion',false);
	playerExplosion.gain = 0.5;
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
	
	var weaponManager = new WeaponManager();
	
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
			
			weaponManager.add(new BeamWeapon());
			weaponManager.add(new RocketWeapon());
			weaponManager.add(new WaveWeapon());
			
			// weapon manager
			// This section is used for weapons testing
			var weaponsCheck = function() {
				if (mouse.left)
				{
					weaponManager.fire();
				}
				else
				{
					weaponManager.holdFire();
				}
			}
			
			var life = 100;
			state.maxLife = 100;
			Object.defineProperties(
					fillProperties(fillProperties(state,fillProperties(new GLDrawable(),new PolygonCollider(x+animator.x,y+animator.y,animator.width,animator.height,0.5,null,3))),
						{
							cx: x,
							cy: y,
							tick: function(){
								movementCheck();
								weaponsCheck();
								var change = (!animator.animating);
								if(keyboard._1 && k!=1){
									transitionSound.play(0);
									animator.setCurrentKeyframe('triangle',(pk==1) ? 1-animator.getTimeTillNextKeyframe() : 1);
									if(change)pk = k
									k=1;
									weaponManager.swap(0);
								}else if(keyboard._2 && k!=2){
									// if(!animator.animating) pk=2
									transitionSound.play(0);
									animator.setCurrentKeyframe('square',(pk==2) ? 1-animator.getTimeTillNextKeyframe() : 1);
									if(change)pk = k
									k=2;
									weaponManager.swap(1);
								}else if(keyboard._3 && k!=3){
									// if(!animator.animating) pk=3
									transitionSound.play(0);
									animator.setCurrentKeyframe('circle',(pk==3) ? 1-animator.getTimeTillNextKeyframe() : 1);
									if(change)pk = k
									k=3;
									weaponManager.swap(2);
								}
								
								var mx= mouse.x,my=mouse.yInv;
								theta = Vector.getDir(vec2.set(mvec,mx-state.cx,my-state.cy))-r;
								animator.theta = theta;
								
								if(this.life<=0){
									this.alive = 0;
								}
							},
							glInit: function(manager){
								animator.glInit(manager);
							},
							draw: function(gl,delta,screen,manager,pMatrix,mvMatrix){
								updateCoords();
								mvMatrix.identity(mvMatrix);
								mvMatrix.translate(state.cx,state.cy,0);
								// manager.point(0,0,-1,6,1,1,1,1);
								mvMatrix.rotateZ(theta);
								animator.draw(gl,delta,screen,manager,pMatrix,mvMatrix);
								mvMatrix.identity()
								manager.fillRect(32+screen.x,screen.y+screen.height/2,-99,16,(screen.height-32)*(this.life/100),0,1-(1*(this.life/100)),1*(this.life/100),0,1)
								mvMatrix.identity();
								// manager.line(state.x-animator.x,state.y-animator.y,mouse.x,mouse.yInv,0,1,1,1,1)
							},
							onCollision: function(){
								blipSound.play(0);
								blipSound.gain = Vector.getMag(this.vel) * 0.0001
							}
						}),
				(function(){
					var stateX = x+animator.x, stateY= y+animator.y;
					updateCoords = function(){
						stateX = state.cx+animator.x;
						stateY = state.cy+animator.y;
					}
					var verts = new Array();
					return {
						life:{
							get: function(){
								return life;
							},
							set: function(nLife){
								life = Math.min(nLife,this.maxLife);
							},
							configurable: true
						},
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
						},
						verts:{
							get:function(){
								verts.length = 0;
								return animator.getVerts(verts,this.cx,this.cy,1,1);
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
			weaponManager.clear();
			playerExplosion.play(0);
			for (var i = 0; i < 50; i++)
				Entities.explosion.newInstance(state.cx, state.cy,2);
			ticker.addTimer(function(){reinitScene()},2,0);
		}
	};
})()))
