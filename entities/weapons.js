// temporary sound files


// RocketWeapon -- 
function RocketWeapon(){
	var time = 0;
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
RocketWeapon.prototype = {};

// Rocket -- 
Entities.add('rocket', Entities.create(
	(function(){
		var damage = 1;
		var buffered = false;
		var hits = [];
		return {
			create: function(state,x,y,dir){
				state.alive = true;
				state.fuse = 5;
				state.theta = Vector.getDir(dir) - Math.PI / 2;
				state.delay = 0.5;
				state.mx = mouse.x;
				state.my = mouse.yInv;
				state.hits = physics.rayTrace(hits,x,y,mouse.x,mouse.yInv);
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
					},x,y,16,16,1));
					
					state.tick = function(delta){
						this.fuse-=delta;
						this.delay -= delta;
						if (this.fuse<=0)
						{
							this.alive = false;
						}
						if (this.delay <= 0)
						{
							this.accelerateToward(this.targetx,this.targety,800);
						}
						for (var e in Entities) {
							if (e.isEnemy) {
								e.life -= damage;
								if (e.life <= 0) {
									e.alive = false;
								}
							}
						}
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
		var a = []; // array for collision check
		var blastbox = new Object();
		var blastForce = 800;
		var vec = vec2.create();		
		var sound = Sound.createSound('explosion_fire');
		sound.gain = 0.2;
		return {
			create: function(state,x,y){
				state.alive = true;
				state.time = 2;
				
				blastbox.width = 100;
		 		blastbox.height = 100;
				blastbox.x = x - 50;
				blastbox.y = y - 50;
				
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
						if (!this.alive) {
							//console.log(Entities.player.getInstance(0).x);
							//console.log(blastbox.x);
							var enemies = physics.getColliders(a, blastbox.x, blastbox.y, blastbox.width, blastbox.height);
							for (var e in enemies) {
								e = enemies[e];
								vec2.set(vec, e.x - this.x, e.y - this.y);
								Vector.setMag(vec, vec, 1);
								if (e.isEnemy) { // add player damage
									e.life -= damage;
									//console.log(Entities.player.getInstance(0).x);
									//console.log(blastbox.x);
									if (e.life <= 0) {
										e.alive = false;
									} else {
										e.vel[0] = vec[0] * blastForce;
										e.vel[1] = vec[1] * blastForce;
									}
								}
							}
						}
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
	var damage = 0.3;
	var damagePer = 1;
	var visible = false;
	var vec = vec2.create();
	var theta = 0;
	var thickness = 156;
	var length = 100;
	var radius = 128;

	var sound = Sound.createSound('wave_fire', true);
	sound.gain = 0.1;

	var mag = 800;
	var wAngle = 50 * Math.PI/180;
	var eAngle = 0;
	var evec = vec2.create();
	
	var reload = 0;
	var duration = 1;
	var forceTime = 1;
	
	var newA = true;
	var a = [];
	
	var hasFired = false;
	
	graphics.addToDisplay(this, 'gl_main');
	
	this.draw = function(gl,delta,screen,manager,pMatrix,mvMatrix) {
		mvMatrix.push();
		theta = Vector.getDir(vec2.set(vec, mouse.x - p.cx, mouse.yInv - p.cy));
		mvMatrix.rotateZ(theta + Math.PI / 2);
		manager.fillTriangle(p.cx + (Math.cos(theta)*(length/2)),p.cy+(Math.sin(theta)*(length/2)),0,thickness,length,0,0.6,0,1,1);
		mvMatrix.pop();
	};
	this.fire = function() {
		if (reload<=0 && duration>0) {
			if (!sound.playing && !hasFired) {
				sound.play(0);
				hasFired = true;
			}
			theta = Vector.getDir(vec2.set(vec, mouse.x - p.cx, mouse.yInv - p.cy));
			duration -= 0.1;
			if (duration < 0) {
				reload = 0.8;
				duration = 1;
				hasFired = false;
			}
			this.visible = true;
			// check for enemies
			var enemies = physics.getColliders(a, p.cx - radius, p.cy - radius, radius*2, radius*2);
			newA = true;
			if (enemies.length > 1) {
				// addforce
				// find direction if direction is legal
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
								//a[i].addForce(mag*evec[0],mag*evec[1]);
								a[i].vel[0] = evec[0] * mag;
								a[i].vel[1] = evec[1] * mag;
								if(a[i].life)a[i].life -= damagePer*damage;
								if (a[i].life <= 0) {
									a[i].alive = false;
								}
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
		if (sound.playing)
			sound.stop(0);
		this.visible = false;
	};
	this.boundless = true;
	ticker.add({
		tick: function(delta) {
			damagePer = delta
			if (reload > 0) {
				reload -= delta;
			}
			
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
	var visible = false;
	var vec = vec2.create();
	var theta = 0;
	var thickness = 4;
	var length = 512;
	var endX = 0;
	var endY = 0;
	var hits = [];
	var sound = Sound.createSound('beam_fire', true);
	sound.gain = 0.1;
 	
	graphics.addToDisplay(this, 'gl_main');
	
	this.draw = function(gl,delta,screen,manager,pMatrix,mvMatrix) {
		manager.line(p.cx, p.cy, endX, endY,0,0,1,0,1);
	};
	this.fire = function() {
		if (!sound.playing) 
			sound.play(0);
		this.visible = true;
		hits.length = 0;
		var p = Entities.player.getInstance(0);
		
		var traceResult = physics.rayTrace(hits,p.cx,p.cy,mouse.x,mouse.yInv);
		if (traceResult.length > 3) {
			traceResult[1].accelerateToward(p.cx,p.cy,-80);
			traceResult[1].life -= damage;
			if (traceResult[1].life <= 0) {
				traceResult[1].alive = false;
			}
		}
		
		endX = traceResult[traceResult.length - 2];
		endY = traceResult[traceResult.length - 1];
	};
	this.boundless = true;
	this.holdFire = function() {
		if (sound.playing)
			sound.stop(0);
		this.visible = false;
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