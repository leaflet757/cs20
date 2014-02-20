Entities.add('runner',Entities.create(
	(function(){
		var mvec = new Array();
		
		return {
			create: function(state,x,y){
			state.isEnemy = true;
				if(!state.first){
					fillProperties(state,Entities.createStandardCollisionState(
						{
							draw:function(gl,delta,screen,manager,pMatrix,mvMatrix){
								var p = Entities.player.getInstance(0);
								mvec[0] = p.x - this.x;
								mvec[1] = p.y - this.y;
								manager.fillRect(this.x + this.width/2,this.y + this.height/2,0,this.width,this.height,Vector.getDir(mvec) - Math.PI / 4,0,0,1,1);
							},
						},x,y,20,20,1));
						state.elasticity = 1;
					state.accel[0]=0;
					state.maxSpeed = 150;
					var m = 0;
					var change = 1;
					var tolerance = 5;
					var scope = 512;
					state.hitSound = Sound.createSound('player_hit');
					state.hitSound.gain = 0.1;
					state.tick = function(delta){
						var s = Entities.player.getInstance(0);
						if(pythag(s.cx-this.x,s.cy-this.y)<scope) {
							m = m + 5*change;
							if( m > 100 ||  Math.abs(this.x -s.cx) < tolerance){
							state.accelerateToward(this.x, s.cy, 10000);
							change = -1;
							}else if(m < 0 || Math.abs(this.y- s.cy) < tolerance) {
							state.accelerateToward(s.cx, this.y, 10000);
							change = 1;
							}
						}else {
						this.vel[0]= 0;
						this.vel[1]= 0;
						
						}
						// test collision code
// 						var r = Entities.rocket;
// 						for(var i = 0; i<r.position; i++){
// 							if(this.collision(r.instanceArray[i])){
// 								r.instanceArray[i].alive = false;
// 								if (--state.life <= 0)
// 								{
// 									this.alive = false;
// 								}
// 								this.x += r.instanceArray[i].vel[0] * .064;
// 								this.y += r.instanceArray[i].vel[1] * .064;
// 								this.vel[0] += r.instanceArray[i].vel[0];
// 								this.vel[1] += r.instanceArray[i].vel[1];
// 							}
// 						}
// 						// ---- 
						// test collision bounding box test
						if(s.collision(this)){
							s.life -= 15;
							this.alive = false;
							this.hitSound.play(0);
						}
					}
					state.first = true;
				}
					state.x = x;
					state.y = y;
					state.vel[0]=50;
					state.vel[1]=50;
					state.accel[0]=0;
				
				state.life = 1;
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

Entities.add('shooter_tank',Entities.create(
	(function(){
		var mvec = new Array();
		
		return {
			create: function(state,x,y){
			state.isEnemy = true;
				if(!state.first){
					fillProperties(state,Entities.createStandardState(
						{
							draw:function(gl,delta,screen,manager,pMatrix,mvMatrix){
								var p = Entities.player.getInstance(0);
								mvec[0] = p.x - this.x;
								mvec[1] = p.y - this.y;
								manager.fillRect(this.x + this.width/2,this.y +this.height/2,0,this.width,this.height,Vector.getDir(mvec) - Math.PI / 4,0,1,0,1);
							},
							width: 80,
							height: 80
						},x,y));
					state.accel[0]=0;
					state.maxSpeed = 80;
					state.tick = function(delta){
						var s = Entities.player.getInstance(0);
						// test collision code
						// var r = Entities.rocket;
// 						for(var i = 0; i<r.position; i++){
// 							if(this.collision(r.instanceArray[i])){
// 								r.instanceArray[i].alive = false;
// 								if (--state.life <= 0)
// 								{
// 									this.alive = false;
// 								}
// 								this.x += r.instanceArray[i].vel[0] * .064;
// 								this.y += r.instanceArray[i].vel[1] * .064;
// 								this.vel[0] += r.instanceArray[i].vel[0];
// 								this.vel[1] += r.instanceArray[i].vel[1];
// 							}
// 						}
// 						// ---- 
					}
					state.first = true;
				}else{
					state.x = x;
					state.y = y;
					state.vel[0]=50;
					state.vel[1]=50;
					state.accel[0]=0;
				}
				state.life = 3;
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

Entities.add('enemy_indirect_suicider',Entities.create({
	parent: Entities.enemy_suicider,
	create: function(state){
		if(!state.directSuiciderFirst){
			state.draw = function(gl,delta,screen,manager,pMatrix,mvMatrix){
				manager.fillRect(this.x + this.width/2,this.y +this.height/2,0,this.width,this.height,0,0,1,0,1);
			}
			state.width = 25;
			state.height = 25;
			state.damage = 10;
			state.maxSmallHealth = 10;
			state.healthSpeed = 100;
			state.deathSound = Sound.createSound('direct_suicider_death',false);
			state.deathSound.gain = 0.1;
			state.accelCap = 1000;
			state.maxSpeed= 800;
			state.accelMul = 75;
			state.impact = 0.2;
			state.moveSpeed = 400;
			state.directSuiciderFirst = true;
		}
		var dir = Math.PI*2*Math.random();
		state.vel[0] = state.moveSpeed;
		Vector.setDir(state.vel,state.vel,dir);
		state.life = 1;			
		state.range = 8;
	},
	update: function(state,delta){
		if(state.inActiveScope){
			var p = Entities.player.getInstance(0);
			var dist = pythag(p.cx-state.x+state.width/2,p.cy-state.y+state.height/2);
			if( Math.abs(state.x -p.cx) < state.range && p.cy > state.y) {
				var dir = Math.PI/2;
				Vector.setDir(state.vel,state.vel,dir);
			}else if(Math.abs(state.x- p.cx) < state.range && p.cy < state.y) {
				var dir = Math.PI+ Math.PI/2;
				Vector.setDir(state.vel,state.vel,dir);
			}else if(Math.abs(state.y- p.cy) < state.range && p.cx > state.x) {
				var dir = Math.PI*2;
				Vector.setDir(state.vel,state.vel,dir);
			}else if(Math.abs(state.y- p.cy) < state.range && p.cx < state.x) {
				var dir = Math.PI;
				Vector.setDir(state.vel,state.vel,dir);
			}
		}
	},
	destroy: function(state,reset){
		if(!reset){
			state.deathSound.play(0)
			Entities.shrink_burst.burst(16,state.x+state.width/2,state.y+state.height/2,24,24,4,200,1,0,0,0.1,state.vel[0],state.vel[1]);
		}
	}
}));

Entities.add('enemy_indirect_tail',Entities.create({
	parent: Entities.enemy_suicider,
	create: function(state){
		if(!state.directSuiciderFirst){
			state.draw = function(gl,delta,screen,manager,pMatrix,mvMatrix){
				manager.fillEllipse(this.x+this.width/2,this.y+this.height/2,0,this.width,this.height,0,0,1,0,1);
			}
			state.width = 50;
			state.height = 50;
			state.damage = 10;
			state.maxSmallHealth = 10;
			state.healthSpeed = 100;
			state.deathSound = Sound.createSound('direct_suicider_death',false);
			state.deathSound.gain = 0.1;
			state.accelCap = 1000;
			state.maxSpeed= 800;
			state.accelMul = 75;
			state.impact = 0.2;
			state.moveSpeed = 200;
			state.directSuiciderFirst = true;
			state.delay = 0;
		}
		var dir = Math.PI*2*Math.random();
		state.vel[0] = state.moveSpeed;
		Vector.setDir(state.vel,state.vel,dir);
		state.life = 1;			
		state.range = 8;
	},
	update: function(state,delta){
		if(state.inActiveScope){
			var p = Entities.player.getInstance(0);
			state.delay += delta;
			var dist = pythag(p.cx-state.x+state.width/2,p.cy-state.y+state.height/2);
			if(state.delay >= .12) {
			Entities.enemyTail.newInstance(state.x + state.width/2, state.y+ state.height/2);
			state.delay = 0;
			}
			if( Math.abs(state.x -p.cx) < state.range && p.cy > state.y) {
				var dir = Math.PI/2;
				Vector.setDir(state.vel,state.vel,dir);
			}else if(Math.abs(state.x- p.cx) < state.range && p.cy < state.y) {
				var dir = Math.PI+ Math.PI/2;
				Vector.setDir(state.vel,state.vel,dir);
			}else if(Math.abs(state.y- p.cy) < state.range && p.cx > state.x) {
				var dir = Math.PI*2;
				Vector.setDir(state.vel,state.vel,dir);
			}else if(Math.abs(state.y- p.cy) < state.range && p.cx < state.x) {
				var dir = Math.PI;
				Vector.setDir(state.vel,state.vel,dir);
			}
		}
	},
	destroy: function(state,reset){
		if(!reset){
			state.deathSound.play(0)
			Entities.shrink_burst.burst(16,state.x+state.width/2,state.y+state.height/2,24,24,4,200,1,0,0,0.1,state.vel[0],state.vel[1]);
		}
	}
}));

Entities.add('enemy_turret',Entities.create({
	parent: Entities.enemy_suicider,
	create: function(state){
		if(!state.directSuiciderFirst){
		var p = Entities.player.getInstance(0);
			state.draw = function(gl,delta,screen,manager,pMatrix,mvMatrix){
				manager.fillRect(this.x+this.width/2,this.y+this.height/2, 0, this.width,this.height,state.theta,1,1,1,1)
			}
			state.v = vec2.create();
			state.theta = 0;
			state.width = 80;
			state.height = 80;
			state.damage = 10;
			state.maxSmallHealth = 10;
			state.healthSpeed = 100;
			state.deathSound = Sound.createSound('direct_suicider_death',false);
			state.deathSound.gain = 0.1;
			state.accelCap = 1000;
			state.maxSpeed= 800;
			state.accelMul = 75;
			state.impact = 0.2;
			state.moveSpeed = 400;
			state.directSuiciderFirst = true;
			state.delay = 0;
			state.shotsound = Sound.createSound('rocket_fire');
			state.shotsound.gain = 0.1;
		}
		state.life = 5;			
	},
	update: function(state,delta){
		if(state.inActiveScope){
			state.delay += delta;
			var p = Entities.player.getInstance(0);
			state.theta = Vector.getDir(vec2.set(state.v, state.x - p.cx, state.y - p.cy));
			var dist = pythag(p.cx-state.x+state.width/2,p.cy-state.y+state.height/2);
			if(state.delay >= .5) {
			Entities.enemyFollowBullet.newInstance(state.x + state.width/2, state.y + state.height/2);
			state.shotsound.play(0)
			state.delay = 0;
			}
		}
	},
	destroy: function(state,reset){
		if(!reset){
			state.deathSound.play(0)
			Entities.shrink_burst.burst(16,state.x+state.width/2,state.y+state.height/2,24,24,4,200,1,0,0,0.1,state.vel[0],state.vel[1]);
		}
	}
}));
