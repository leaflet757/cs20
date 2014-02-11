Sound.addBuffer('player_hit', 'resources/audio/player_hit.wav');
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
					var scope = 800;
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
						// ---- 
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
					var scope = 512;
					var delay = 0;
					state.tick = function(delta){
						var s = Entities.player.getInstance(0);
						delay += delta;
						// test collision code
						if(pythag(s.cx-this.x,s.cy-this.y)<scope && delay >= 1) {
							Entities.enemyFollowBullet.newInstance(this.x + this.width/2, this.y + this.height/2);
							delay = 0;
						}
						// ---- 
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