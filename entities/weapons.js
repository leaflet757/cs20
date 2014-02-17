
// RocketWeapon -- 
function RocketWeapon(){
	this.boundless = true;
	var time = 0;
	var energy = 100;
	var COST = 10;
	var p = Entities.player.getInstance(0);
	var dir = {0:0, 1:0, length:2};	
	var sound = Sound.createSound('rocket_fire');
	sound.gain = 0.1;
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
			sound.play(0);
		}
	};
	
	this.holdFire = function() {
		// Empty
	};
}
// RocketWeapon.prototype = GLDrawable();
RocketWeapon.prototype = {}

// Rocket -- 
Entities.add('rocket', Entities.create( // blows up before it touches???
	(function(){
		var damage = 1;
		var buffered = false;
		return {
			create: function(state,x,y,dir){
				state.alive = true;
				state.fuse = 5;
				state.theta = Vector.getDir(dir) - Math.PI / 2;
				state.delay = 0.5;
				state.mx = mouse.x;
				state.my = mouse.yInv;
				state.a = []; // array for collision check
				state.blastbox = new Object();
				state.blastbox.width = 24;
		 		state.blastbox.height = 24;
				state.blastbox.x = x - 12;
				state.blastbox.y = y - 12;
				state.ray = [];
				state.hits = physics.rayTrace(state.ray,x,y,mouse.x,mouse.yInv);
				state.targetx = state.hits[state.hits.length - 2];
				state.targety = state.hits[state.hits.length - 1];
				state.sound = Sound.createSound('explosion_fire');
				state.sound.gain = 0.1;
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
					},x,y,16,16,1)); // TODO: WHAT THE FUCK BOX
					
					state.tick = function(delta){
						this.a = [];
						this.fuse-=delta;
						this.delay -= delta;
						if (this.fuse<=0)
						{
							this.alive = false;
						}
						if (this.delay <= 0)
						{
							this.accelerateToward(this.targetx,this.targety,800);
							var enemies = physics.getColliders(state.a, state.x,
								state.y, state.width, state.height);
							for (var i = 0; i < enemies.length; i++){
								if (enemies[i].isEnemy) {
									this.alive = false;
									i = enemies.length;
								}
							}
						}
						this.blastbox.x = this.x - this.blastbox.width/2;
						this.blastbox.y = this.y - this.blastbox.width/2;
					}
					
					state.onCollision = function() {
						this.alive = false;
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
				state.sound.play(0);
				var enemies = physics.getColliders(state.a, state.blastbox.x, state.blastbox.y, state.blastbox.width, state.blastbox.height);
				for (var e in enemies) {
					e = enemies[e];
					if (e.isEnemy) { // add player damage and blast force
						e.life -= damage;
						if (e.life <= 0) {
							e.alive = false;
						} else {
							//e.vel[0] = vec[0] * blastForce;
							//e.vel[1] = vec[1] * blastForce;
						}
					}
				}
				for (var i = 0; i < 50; i++)
					Entities.explosion.newInstance(state.x, state.y, 0.3);
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
	var sound = Sound.createSound('mine_fire');
	sound.gain = 0.1;
	ticker.add(
		{tick:function (delta) {
			if (time > 0)
				time-=delta;
		}
	});
	
	this.fire = function() {
		if (time <= 0) {
			sound.play(0);
			Entities.mine.newInstance(p.cx,p.cy);
			time = 1;
		}
	};
	
	this.holdFire = function() {
		// Empty
	};
}
MineWeapon.prototype = {};

// Mine -- 
Entities.add('mine', Entities.create(
	(function(){
		var damage = 5;
		var blastForce = 800;
		var vec = vec2.create();		
		var sound = Sound.createSound('explosion_fire');
		sound.gain = 0.2;
		return {
			create: function(state,x,y){
				state.alive = true;
				state.time = 1.5;
				state.a = []; // array for collision check
				state.blastbox = new Object();
				state.blastbox.width = 50;
		 		state.blastbox.height = 50;
				state.blastbox.x = x - 25;
				state.blastbox.y = y - 25;
				
				if(!state.first){
					fillProperties(state, Entities.createStandardState(
					{
						draw:function(gl,delta,screen,manager,pMatrix,mvMatrix){
							manager.fillRect(this.x+this.width/2,this.y+this.height/2,0,16,16,0,.5,1,.5,1);
						}
					},x,y,16,16,1.1));
					state.tick = function(delta){
						this.time-=delta;
 						this.alive = this.time>0;
					}
					
					state.first = true;
				}
				state.x = x - state.width/2;
				state.y = y - state.height/2;
				graphics.addToDisplay(state,'gl_main');
				ticker.add(state);
				physics.add(state);
			},
			destroy: function(state){
				sound.play(0);
				var enemies = physics.getColliders(state.a, state.blastbox.x, state.blastbox.y, state.blastbox.width, state.blastbox.height);
				for (var e in enemies) {
					e = enemies[e];
					vec2.set(vec, e.x - this.x, e.y - this.y);
					Vector.setMag(vec, vec, 1);
					if (e.isEnemy) { // add player damage
						e.life -= damage;
						if (e.life > 0) {
							e.vel[0] = vec[0] * blastForce;
							e.vel[1] = vec[1] * blastForce;
						}
					}
				}
				for (var i = 0; i < 50; i++)
					Entities.explosion.newInstance(state.x, state.y);
				graphics.removeFromDisplay(state,'gl_main');
				ticker.remove(state);
				physics.remove(state);
			}
		};
	})())
);

// WaveWeapon -- 
function WaveWeapon(){
	var p = Entities.player.getInstance(0);
	var damage = 0.5;
	var visible = false;
	var vec = vec2.create();
	var theta = 0;
	var thickness = 156;
	var length = 100;
	var radius = 128;

	var sound = Sound.createSound('wave_fire');
	sound.gain = 0.1;

	var mag = 800;
	var wAngle = 50 * Math.PI/180;
	var eAngle = 0;
	var evec = vec2.create();
	
	var hasPressed = false;
	var forceTime = 1;
	
	var newA = true;
	var a = [];
	
	graphics.addToDisplay(this, 'gl_main');
	
	this.draw = function(gl,delta,screen,manager,pMatrix,mvMatrix) {
		mvMatrix.push();
		theta = Vector.getDir(vec2.set(vec, mouse.x - p.cx, mouse.yInv - p.cy));
		mvMatrix.rotateZ(theta + Math.PI / 2);
		manager.fillTriangle(p.cx + (Math.cos(theta)*(length/2)),p.cy+(Math.sin(theta)*(length/2)),0,thickness,length,0,0.6,0,1,1);
		mvMatrix.pop();
	};
	this.fire = function() {
		if (!hasPressed) {
			hasPressed = true;
			sound.play(0);
			theta = Vector.getDir(vec2.set(vec, mouse.x - p.cx, mouse.yInv - p.cy));
			
			this.visible = true;
			// check for enemies
			var enemies = physics.getColliders(a, p.cx - radius, p.cy - radius, radius*2, radius*2);
			newA = true;
			if (enemies.length > 1) {
				for (var i = 0; i < a.length; i++) {
					if (a[i] != p)
					{
						var dist = Math.sqrt(Math.pow(a[i].x - p.cx,2) + Math.pow(a[i].y - p.cy,2));
						if (dist < radius) {
							var eAngle = Vector.getDir(vec2.set(evec, a[i].x - p.cx, a[i].y - p.cy));
							if ((eAngle > theta && eAngle < wAngle + theta) || 
								(eAngle - 2*Math.PI < theta && eAngle - 2*Math.PI > -wAngle + theta) ||
								((eAngle > theta - 2*Math.PI && eAngle < wAngle + theta - 2*Math.PI) || 
								(eAngle - 2*Math.PI < theta - 2*Math.PI && eAngle - 2*Math.PI > -wAngle + theta - 2*Math.PI))) {					
								Vector.setMag(evec, evec, 1);
								a[i].vel[0] = evec[0] * mag;
								a[i].vel[1] = evec[1] * mag;
								if(a[i].life)a[i].life -= damage;
							}
						}
					}
				}
			}
		} else {
			this.visible = false;
		}
	};
	this.holdFire = function() {
		this.visible = false;
		hasPressed = false;
	};
	this.boundless = true;
	ticker.add({
		tick: function(delta) {
			damagePer = delta;
			
			if (newA){	
				for (var i = 0; i < a.length; i++) {
					a[i].accel[0] = 0;
					a[i].accel[1] = 0;
				}
				newA = false;
			}
		}
	});
}
WaveWeapon.prototype = new GLDrawable();

// BeamWeapon --
function BeamWeapon(){
	var p = Entities.player.getInstance(0);
	var damage = 0.7;
	var force = -80;
	var visible = false;
	var vec = vec2.create();
	var theta = 0;
	var laserWidth = 32;
	var thickness = 4;
	var length = 512;
	var endX1 = 0;
	var endY1 = 0;
	var endX2 = 0;
	var endY2 = 0;
	var v = vec2.create();
	var hits = [];
	var sound = Sound.createSound('beam_fire', true);
	sound.gain = 0.1;
 	
	graphics.addToDisplay(this, 'gl_main');
	
	this.draw = function(gl,delta,screen,manager,pMatrix,mvMatrix) {
		manager.line(p.cx, p.cy, endX1, endY1,0,0,1,0,1);
		manager.line(p.cx, p.cy, endX2, endY2,0,0,1,0,1);
	};
	this.fire = function() {
		if (!sound.playing) 
			sound.play(0);
		this.visible = true;
		hits.length = 0;
		
		var traceResult = physics.rayTrace(hits,p.cx,p.cy,mouse.x,mouse.yInv);
		if (traceResult.length > 3) {
			for (var i = 1; i < traceResult.length -2; i++) {
				traceResult[i].accelerateToward(p.cx, p.cy, force * 3/i);
				traceResult[i].life -= damage * 1/i;
			}
		}
		vec2.set(v,mouse.x-p.cx, mouse.yInv-p.cy);
		Vector.setMag(v,v,laserWidth);
		traceResult = physics.rayTrace(hits, p.cx, p.cy,(p.cx+v[0])-Math.cos(theta),(p.cy+v[1])-Math.cos(theta+Math.PI/2));
		endX1 = traceResult[traceResult.length - 2];
		endY1 = traceResult[traceResult.length - 1];
		traceResult = physics.rayTrace(hits, p.cx, p.cy,(p.cx+v[0])+Math.cos(theta),(p.cx+v[1])+Math.cos(theta));
		endX2 = traceResult[traceResult.length - 2];
		endY2 = traceResult[traceResult.length - 1];
		theta+=0.1;
	};
	this.boundless = true;
	this.holdFire = function() {
		if (sound.playing)
			sound.stop(0);
		this.visible = false;
		theta = 0;
	}
}
BeamWeapon.prototype = new GLDrawable();


// Explosion
Entities.add('explosion', Entities.create(
	(function(){
		return {
			create: function(state,x,y,life){
				state.alive = true;
				state.life = life || 0.5;
				var width = 24;
				var height = 24;
				if(!state.first){
					fillProperties(state, Entities.createStandardState(
					{
						draw:function(gl,delta,screen,manager,pMatrix,mvMatrix){
							manager.fillEllipse(this.x,this.y,0,width/2,height/2,0,1,0.5,0,1);
							gl.enable(gl.BLEND);
							gl.blendFunc(gl.SRC_ALPHA, gl.DST_ALPHA);
							manager.fillEllipse(this.x,this.y,0,width,height,0,1,0.5,0,0.5);
							gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_DST_ALPHA);
						}
					},x,y,width,height,1.1));
					state.tick = function(delta){
						this.life-=delta;	
						this.alive = this.life>0;
						
					}
					
					state.first = true;
				}
				state.x = x;
				state.y = y;
				state.vel[0] = Math.random()*400 - 200;
				state.vel[1] = Math.random()*400 - 200;
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