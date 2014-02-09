// RocketWeapon -- 
function RocketWeapon(){
	var time = 0;
	var p = Entities.player.getInstance(0);
	var dir = {0:0, 1:0, length:2};
	
	ticker.add(
		{tick:function (delta) {
			if (time > 0)
				time-=delta;
		}
	});
	
	this.fire = function() {
		if (time <= 0) {
			time = 0.5;
			dir[0] = mouse.x - p.cx;
			dir[1] = mouse.yInv - p.cy;
			Entities.rocket.newInstance(p.cx,p.cy, dir);
		}
	};
	
	this.holdFire = function() {
		
	};
}
RocketWeapon.prototype = {};

// Rocket -- 
Entities.add('rocket', Entities.create(
	(function(){
		var buffered = false;
		return {
			create: function(state,x,y,dir){
				state.alive = true;
				state.life = 5;
				state.theta = Vector.getDir(dir) - Math.PI / 2;
				state.delay = 0.5;
				state.fired = false;
				state.mx = mouse.x;
				state.my = mouse.yInv;
				if(!state.first){
					fillProperties(state, Entities.createStandardCollisionState(
					{
						glInit: function(manager)
						{
							if (!buffered)
							{
								this.animator.glInit(manager);
								buffered = true;
							}
						},
						draw:function(gl,delta,screen,manager,pMatrix,mvMatrix){
							mvMatrix.translate(this.x, this.y, 0);
							mvMatrix.rotateZ(this.theta);
							this.animator.draw(gl,delta,screen,manager,pMatrix,mvMatrix);
						
						}
					},x,y,16,16,1));
					
					state.tick = function(delta){
						this.life-=delta;
						this.delay -= delta;
						if (this.life<=0)
						{
							this.alive = false;
						}
						if (this.delay <= 0 && !this.fired)
						{
							this.accelerateToward(this.mx,this.my,800);
							this.fired = true;
						}
					}
					
					state.animator = new VertexAnimator("basic", 
						{
						rocketColor: 
							fillProperties([
								0.8,0,0,1,
								0.8,0,0,1,
								0.8,0,0,1,
								0.8,0,0,1,
								0.8,0,0,1,
								0.8,0,0,1
							],
							{
								attributeId: "vertexColor",
								items: 6,
								itemSize: 4
							}), 
						rocketPosition: 
							fillProperties([
								0,0,0,
								0,16,0,
								-16,-16,0,
								0,8,0,
								16,-16,0,
								0,16,0
							],
							{
								attributeId: "vertexPosition",
								items: 6,
								itemSize: 3
							})
						},
						{},6);
						
						state.animator.addKeyframe("slim", 
						{
						rocketColor: 
							fillProperties([
								0.8,0,0,1,
								0.8,0,0,1,
								0.8,0,0,1,
								0.8,0,0,1,
								0.8,0,0,1,
								0.8,0,0,1
							],
							{
								attributeId: "vertexColor",
								items: 6,
								itemSize: 4
							}), 
						rocketPosition: 
							fillProperties([
								0,0,0,
								0,16,0,
								-8,-16,0,
								0,0,0,
								8,-16,0,
								0,16,0
							],
							{
								attributeId: "vertexPosition",
								items: 6,
								itemSize: 3
							})
						},
						{},6);
						
						state.animator.addKeyframe("fat", 
						{
						rocketColor: 
							fillProperties([
								0.8,0,0,1,
								0.8,0,0,1,
								0.8,0,0,1,
								0.8,0,0,1,
								0.8,0,0,1,
								0.8,0,0,1
							],
							{
								attributeId: "vertexColor",
								items: 6,
								itemSize: 4
							}), 
						rocketPosition: 
							fillProperties([
								0,0,0,
								0,16,0,
								-16,-16,0,
								0,-4,0,
								16,-16,0,
								0,16,0
							],
							{
								attributeId: "vertexPosition",
								items: 6,
								itemSize: 3
							})
						},
						{},6);
						
					
					state.first = true;
				}
				state.animator.setCurrentKeyframe("fat",0);
				state.animator.setCurrentKeyframe("slim", state.delay);
				state.x = x;
				state.y = y;
				state.vel[0]=Entities.player.getInstance(0).vel[0] / 4;
				state.vel[1]=Entities.player.getInstance(0).vel[1] / 4;
				state.accel[0] = 0;
				state.accel[1] = 0;
				graphics.addToDisplay(state,'gl_main');
				ticker.add(state);
				physics.add(state);
			},
			destroy: function(state){
				graphics.removeFromDisplay(state,'gl_main');
				ticker.remove(state);
				physics.remove(state);
			}
		};
	})())
);

// MineWeapon -- 
function MineWeapon(){
	var time = 0;
	var p = Entities.player.getInstance(0);
	
	ticker.add(
		{tick:function (delta) {
			if (time > 0)
				time-=delta;
		}
	});
	
	this.fire = function() {
		if (time <= 0) {
			Entities.mine.newInstance(p.cx,p.cy);
			time = 1;
		}
	};
	
	this.holdFire = function() {
		
	};
}
MineWeapon.prototype = {};

// Mine -- 
Entities.add('mine', Entities.create(
	(function(){
		return {
			create: function(state,x,y){
				state.alive = true;
				state.life = 2;
				if(!state.first){
					fillProperties(state, Entities.createStandardCollisionState(
					{
						draw:function(gl,delta,screen,manager,pMatrix,mvMatrix){
							manager.fillEllipse(this.x,this.y,0,this.width,this.height,0,.5,1,.5,1);
						}
					},x,y,16,16,1.1));
					state.tick = function(delta){
						this.life-=delta;
						this.alive = this.life>0;
						if (!this.alive) {
							// explosion
						}
					}
					
					state.first = true;
				}
				state.x = x;
				state.y = y;
				graphics.addToDisplay(state,'gl_main');
				ticker.add(state);
				physics.add(state);
			},
			destroy: function(state){
				graphics.removeFromDisplay(state,'gl_main');
				ticker.remove(state);
				physics.remove(state);
			}
		};
	})())
);
//ticker.add(Entities.mine.def);

// WaveWeapon -- 
function WaveWeapon(){
	var visible = false;
	var vec = vec2.create();
	var theta = 0;
	var thickness = 156;
	var length = 100;
	
	graphics.addToDisplay(this, 'gl_main');
	
	this.draw = function(gl,delta,screen,manager,pMatrix,mvMatrix) {
		var p = Entities.player.getInstance(0);
		mvMatrix.push();
		theta = Vector.getDir(vec2.set(vec, mouse.x - p.cx, mouse.yInv - p.cy));
		mvMatrix.rotateZ(theta + Math.PI / 2);
		manager.fillTriangle(p.cx + (Math.cos(theta)*(length/2)),p.cy+(Math.sin(theta)*(length/2)),0,thickness,length,0,0.6,0,1,1);
		mvMatrix.pop();
	};
	this.fire = function() {
		this.visible = true;
		var hits = [];
		var p = Entities.player.getInstance(0);
		var traceResult = physics.rayTrace(hits,p.cx,p.cy,mouse.x,mouse.yInv);
		//if (traceResult.length > 1) traceResult[1].moveToward(p.cx,p.cy,-300);
		vec2.set(vec, mouse.x - p.cx, mouse.yInv - p.cy);
		//traceResult[0].accelerateToward(vec[0]*-1, vec[1]*-1, 100);
	};
	this.holdFire = function() {
		this.visible = false;
	}
}
WaveWeapon.prototype = new GLDrawable();

// BeamWeapon -- TODO:Make Pretty
function BeamWeapon(){
	var visible = false;
	var vec = vec2.create();
	var theta = 0;
	var thickness = 4;
	var length = 512;
	
	var animator = new VertexAnimator("basic", 
		{
			beamColor: 
				fillProperties(// TODO: change to triangular verticies
					[0,1,0,1,
					0,1,0,1,
					0,1,0,1],
					{
						attributeId: "vertexColor",
						items: 3,
						itemSize: 4
					}), 
			beamPosition: 
				fillProperties([
					0,0,0,
					1,1,0,
					-1,1,0],
					{
						attributeId: "vertexPosition",
						items: 3,
						itemSize: 3
					})
			},
		{},6);					
	animator.addKeyframe("active", 
			{
				beamColor: 
					fillProperties([
						0,1,0,1,
						0,1,0,1,
						0,1,0,1],
					{
						attributeId: "vertexColor",
						items: 3,
						itemSize: 4
				}), 
				beamPosition: 
					fillProperties([
						0,0,0,
						1,512,0,
						-1,-512,0],
					{
						attributeId: "vertexPosition",
						items: 3,
						itemSize: 3
					})
				},
		{},6);					
	animator.addKeyframe("starting", 
		{
			beamColor: 
			fillProperties(
				[0,1,0,1,
				0,1,0,1,
				0,1,0,1],
				{
					attributeId: "vertexColor",
					items: 3,
					itemSize: 4
				}), 
			beamPosition: 
			fillProperties([
				0,0,0,
				1,1,0,
				-1,1,0],
				{
					attributeId: "vertexPosition",
					items: 3,
					itemSize: 3
			})
		},
		{},6);
	
 	animator.setCurrentKeyframe("starting",0);
 	animator.setCurrentKeyframe("active", 5);
	graphics.addToDisplay(this, 'gl_main');
	
	this.draw = function(gl,delta,screen,manager,pMatrix,mvMatrix) {
		var p = Entities.player.getInstance(0);
		mvMatrix.push();
		theta = Vector.getDir(vec2.set(vec, mouse.x - p.cx, mouse.yInv - p.cy));
		mvMatrix.rotateZ(theta + Math.PI / 2);
		manager.fillRect(p.cx + (Math.cos(theta)*(length/2)),p.cy+(Math.sin(theta)*(length/2)),0,thickness,length,0,0,1,0,1);
		mvMatrix.pop();
	};
	this.fire = function() {
		this.visible = true;
		var hits = [];
		var p = Entities.player.getInstance(0);
		
		var traceResult = physics.rayTrace(hits,p.cx,p.cy,mouse.x,mouse.yInv);
		if (traceResult.length > 3) traceResult[1].accelerateToward(p.cx,p.cy,-80);
		
		//vec2.set(vec, (mouse.x - (p.cx - p.x)), (mouse.yInv - (p.cy - p.y)));
		//p.accelerateToward(vec[0], vec[1], -100);
		
		animator.unpause();
	};
	this.holdFire = function() {
		this.visible = false;
		animator.pause();
	}
}
BeamWeapon.prototype = new GLDrawable();