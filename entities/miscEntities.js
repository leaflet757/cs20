Entities.add('clickBox',Entities.create(
	(function(){
		return {
			create: function(state,x,y){
				if(!state.first){
					fillProperties(state,Entities.createStandardCollisionState(
						{
							draw:function(gl,delta,screen,manager,pMatrix,mvMatrix){
								manager.fillRect(this.x+(this.width/2),this.y+(this.width/2),0,this.width,this.height,0,.5,1,1,1);
							},
							width: 32,
							height: 32
						},x,y,32,32,1));
					state.first = true;
					// state.tick= function(){
						// this.accel[0]=0;
						// this.accel[1]=0;
					// }
					state.dragConst = 0.1
				}
				state.set(x,y,0,0,0,0);
				graphics.addToDisplay(state,'gl_main');
				physics.add(state);
				// ticker.add(state);
			},
			destroy: function(state){
				graphics.removeFromDisplay(state,'gl_main');
				ticker.remove(state);
				physics.remove(state);
			}
		};
	})())
);

// Sample Enemy Bullet
Entities.add('tempBullet', Entities.create(
	(function(){
		return {
			// create gets called when Entities.tempBullet.newInstace gets called
			// Parameters can change depending on need but must have state as an argument
			create: function(state,x,y){
				// destroy will be called when state.alive is false
				state.alive = true;
				state.time = 1; // temporary variable created to destroy the instance after 1 second
				
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
							manager.fillRect(this.x+this.width/2,this.y+this.height/2,0,this.width,this.height,0,.5,1,.5,1);
						}
					// values for collision box (x,y,width,height,zindex?)
					},x,y,16,16,1.1));
					
					// used to constantly update or check things or stuff fuckitslate
					state.tick = function(delta){
						this.time-=delta;
						this.alive = this.time>0;
					}
					state.first = true;
				}
				// how to set initial values for the entity like vel or accel or xy
				// vel and accel have x and y components represented as indexes respectively 
				state.x = x - state.width/2;
				state.y = y - state.height/2;
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
// Example creation
// Entities.tempBullet.newInstance(Entities.player.getInstance(0).cx, Entities.player.getInstance(0).cy);

