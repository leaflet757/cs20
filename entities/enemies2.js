Entities.add('enemy',Entities.create({
	create:function(state,x,y){
		if(!state.enemyFirst){
			(function(){
				var life = life || 100;
				state.scope = 1024;
				Object.defineProperties(fillProperties(state,Entities.createStandardCollisionState({},x,y,32,32,1)),{
							life:{
								get: function(){
									return life;
								},
								set: function(nLife){
									life = nLife;
									if(life<=0){
										this.alive = false;
									}
								}
							},
							isEnemy:{
								value: true,
								writable: false
							},
							inActiveScope: {
								get: function(){
									var p = Entities.player.getInstance(0);
									return (p && pythag(p.cx-(this.x+this.width/2),p.cy-(this.y+this.height/2))<this.scope);
								},
								set: function(){}
							}
					})
			})();
			
			state.minSmallHealth = 0;
			state.maxSmallHealth = 0;
			
			state.minMedHealth = 0;
			state.maxMedHealth = 0;
			
			state.minLargeHealth = 0;
			state.maxLargeHealth = 0;
			
			state.healthSpeed = 0;
			
			state.enemyFirst = true;
		}
		state.set(x,y,0,0,0,0);
		graphics.addToDisplay(state,'gl_main'); 
		physics.add(state);
	},
	destroy: function(state,reset){
		if(!reset){
			var smallHealth = Math.round(state.minSmallHealth + Math.random()*(state.maxSmallHealth-state.minSmallHealth));
			var medHealth = Math.round(state.minMedHealth + Math.random()*(state.maxMedHealth-state.minMedHealth));
			var largeHealth = Math.round(state.minLargeHealth + Math.random()*(state.maxLargeHealth-state.minLargeHealth));
			var cx = state.cx || state.x + state.width/2;
			var cy = state.cy || state.y + state.height/2;
			
			var theta = Math.PI*2/smallHealth
			var c = Math.cos(theta);
			var s = Math.sin(theta);
			var vx=state.healthSpeed,vy =0, u = 0, v =0;
			
			for(var i = 0; i< smallHealth; i++){
				u = vx; v = vy;
				vx = c*u - s*v;
				vy = s*u + c*v;
				Entities.health_small.newInstance(cx,cy,vx+state.vel[0],vy+state.vel[1]);
			}
			
			theta = Math.PI*2/medHealth
			c = Math.cos(theta);
			s = Math.sin(theta);
			
			for(var i = 0; i< medHealth; i++){
				u = vx; v = vy;
				vx = c*u - s*v;
				vy = s*u + c*v;
				Entities.health_med.newInstance(cx,cy,vx+state.vel[0],vy+state.vel[1]);
			}
			
			theta = Math.PI*2/largeHealth
			c = Math.cos(theta);
			s = Math.sin(theta);
			
			for(var i = 0; i< largeHealth; i++){
				u = vx; v = vy;
				vx = c*u - s*v;
				vy = s*u + c*v;
				Entities.health_large.newInstance(cx,cy,vx+state.vel[0],vy+state.vel[1]);
			}
		}
		physics.remove(state);
		graphics.removeFromDisplay(state,'gl_main');
	}
}))

Entities.add('enemy_suicider',Entities.create({
		parent: Entities.enemy,
		create: function(state){
			state.damage = 0;
			state.impact = 0;
			state.hitSound = Sound.createSound('player_hit');
			state.hitSound.gain = 0.1;
		},
		update: function(state,delta){
			var p = Entities.player.getInstance(0);
			if(p && p.collision(state)){
				state.hitSound.play(0);
				state.minSmallHealth = 0;
				state.maxSmallHealth = 0;
				state.minMedHealth = 0;
				state.maxMedHealth = 0;
				state.minLargeHealth = 0;
				state.maxLargeHealth = 0;
				p.life -= state.damage;
				p.vel[0] += (state.vel[0]-p.vel[0])*state.impact;
				p.vel[1] += (state.vel[1]-p.vel[1])*state.impact
				state.alive = false;
			}
		}
	}
))

Entities.add('enemy_direct_suicider',Entities.create({
	parent: Entities.enemy_suicider,
	create: function(state){
		if(!state.directSuiciderFirst){
			state.draw = function(gl,delta,screen,manager,pMatrix,mvMatrix){
				manager.fillEllipse(this.x+this.width/2,this.y+this.height/2,0,this.width,this.height,0,1,0,0,1);
			}
			state.width = 32;
			state.height = 32;
			state.damage = 10;
			state.maxSmallHealth = 10;
			state.healthSpeed = 100;
			state.deathSound = Sound.createSound('direct_suicider_death',false);
			state.deathSound.gain = 0.1;
			state.accelCap = 1000;
			state.maxSpeed= 500;
			state.accelMul = 50	;
			state.impact = 0.2;
			state.directSuiciderFirst = true;
		}
		state.life = 1;
	},
	update: function(state,delta){
		if(state.inActiveScope){
			var p = Entities.player.getInstance(0);
			var dist = pythag(p.cx-state.x+state.width/2,p.cy-state.y+state.height/2);
			state.accelerateToward(p.cx-state.width/2,p.cy-state.height/2,Vector.getMag(state.vel)*2+100);
		}
	},
	destroy: function(state,reset){
		if(!reset){
			state.deathSound.play(0)
			Entities.shrink_burst.burst(8,state.x+state.width/2,state.y+state.height/2,18,18,4,200,1,0,0,0.1,state.vel[0],state.vel[1]);
		}
	}
}));