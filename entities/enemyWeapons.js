Entities.add('enemyFollowBullet', Entities.create(
	(function(){
		return {
			// create gets called when Entities.tempBullet.newInstace gets called
			// Parameters can change depending on need but must have state as an argument
			create: function(state,x,y){
				// destroy will be called when state.alive is false
				state.alive = true;
				state.time = 2; // temporary variable created to destroy the instance after 1 second
				
				var p = Entities.player.getInstance(0);
				
				if(!state.first){
					// fill the state with standard collision state properties
					// this adds the entity to the collision system
					fillProperties(state, Entities.createStandardCollisionState(
					{
						// draw function must have these parameters in this order
						draw:function(gl,delta,screen,manager,pMatrix,mvMatrix){
							// check graphics file for more information
							// some methods include: fillEllipse, fillRect, fillTriangle
							// paramters are x,y,angle,width,height,zindex,r,g,b,a
							manager.fillEllipse(this.x+this.width/2,this.y+this.height/2,0,this.width,this.height,0,1,0,0,1);
						}
					// values for collision box (x,y,width,height,zindex?)
					},x,y,20,20,1.1));
					
					state.hitSound = Sound.createSound('player_hit');
					state.hitSound.gain = 0.1;
					// used to constantly update or check things or stuff fuckitslate
					state.tick = function(delta){
						this.time-=delta;
						//add collision
						if(p.collision(this) ){
							this.alive = false;
							p.life -= 15;
							this.hitSound.play(0);
						}
						if(this.time>0) {
							this.accelerateToward(p.cx, p.cy, 600);
						} else{
						this.alive = false;
						}
					}
					state.first = true;
				}
				// how to set initial values for the entity like vel or accel or xy
				// vel and accel have x and y components represented as indexes respectively 
				state.x = x;
				state.y = y;
				state.vel[0]=0;
				state.vel[1]=0;
				state.accel[0]=200;
				// add state to draw system
				graphics.addToDisplay(state,'gl_main');
				// add tick to ticker system
				ticker.add(state);
				// add obj to collision system
				physics.add(state);
				
			},
			// gets called when alive is false
			destroy: function(state){
				graphics.removeFromDisplay(state,'gl_main');
				ticker.remove(state);
				physics.remove(state);
			}
		};
	})())
);

Entities.add('enemyTail', Entities.create(
	(function(){
		return {
			// create gets called when Entities.tempBullet.newInstace gets called
			// Parameters can change depending on need but must have state as an argument
			create: function(state,x,y){
				// destroy will be called when state.alive is false
				state.alive = true;
				state.time = 2; // temporary variable created to destroy the instance after 1 second
				var p = Entities.player.getInstance(0);
				
				if(!state.first){
					// fill the state with standard collision state properties
					// this adds the entity to the collision system
					fillProperties(state, Entities.createStandardCollisionState(
					{
						// draw function must have these parameters in this order
						draw:function(gl,delta,screen,manager,pMatrix,mvMatrix){
							// check graphics file for more information
							// some methods include: fillEllipse, fillRect, fillTriangle
							// paramters are x,y,angle,width,height,zindex,r,g,b,a
							manager.fillEllipse(this.x+this.width/2,this.y+this.height/2,0,this.width,this.height,0,.5,.8,.3,1);
						}
					// values for collision box (x,y,width,height,zindex?)
					},x,y,20,20,1.1));
					
					state.hitSound = Sound.createSound('player_hit');
					state.hitSound.gain = 0.1;
					// used to constantly update or check things or stuff fuckitslate
					state.tick = function(delta){
						this.time-=delta;
						//add collision
						if(p.collision(this) ){
							this.alive = false;
							p.life -= 5;
							this.hitSound.play(0);
						}
						if(this.time>0) {
						} else{
						this.alive = false;
						}
					}
					state.first = true;
				}
				// how to set initial values for the entity like vel or accel or xy
				// vel and accel have x and y components represented as indexes respectively 
				state.x = x;
				state.y = y;
				state.vel[0]=0;
				state.vel[1]=0;
				state.accel[0]=200;
				// add state to draw system
				graphics.addToDisplay(state,'gl_main');
				// add tick to ticker system
				ticker.add(state);
				// add obj to collision system
				physics.add(state);
				
			},
			// gets called when alive is false
			destroy: function(state){
				graphics.removeFromDisplay(state,'gl_main');
				ticker.remove(state);
				physics.remove(state);
			}
		};
	})())
);