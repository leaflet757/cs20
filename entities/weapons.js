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
			},
			tick: (function(){
				var dir = {0:0,1:0,length:2};
				var time = 0.5;
				return function(delta)
					{
						time -= delta;
						if (mouse.pressed && time <= 0)
						{
							var s = Entities.player.getInstance(0);
							dir[0] = mouse.x - s.cx;
							dir[1] = mouse.yInv - s.cy;
							Entities.rocket.newInstance(s.cx,
									s.cy, dir);
							time = 0.5;
						}
					}
				})()
		};
	})())
);
//ticker.add(Entities.rocket.def);

// Mine -- 
Entities.add('mine', Entities.create(
	(function(){
		return {
			create: function(state,x,y){
				state.alive = true;
				state.life = 1;
				if(!state.first){
					fillProperties(state, Entities.createStandardCollisionState(
					{
						draw:function(gl,delta,screen,manager,pMatrix,mvMatrix){
							manager.fillEllipse(this.x,this.y,0,this.width,this.height,0,.5,1,.5,1);
						}
					},x,y,16,16,1.1));
					state.tick = function(delta){
						this.life-=delta; // Not a number??
						this.alive = this.life>0;
					}
					
					// animator creation
					
					state.first = true;
				}
				
				// animator initialization
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
			},
			tick: function(delta){
				if (mouse.pressed)
				{
					var s = Entities.player.getInstance(0);
					Entities.mine.newInstance(s.cx, s.cy);
				}
			}
		};
	})())
);
//ticker.add(Entities.mine.def);

// TODO:Wave -- 
Entities.add('wave', Entities.create(
	(function(){
		var buffered = false;
		return {
			create: function(state,x,y,dir){
				state.alive = true;
				state.life = 0.3;
				state.theta = Vector.getDir(dir);
				state.delay = 0.15;
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
							this.fired = true;
						}
					}
					
					state.animator = new VertexAnimator("basic", 
						{
						waveColor: 
							fillProperties([
								0.5,1,1,1,
								0.5,1,1,1,
								0.5,1,1,1,
								0.5,1,1,1,
								0.5,1,1,1,
								0.5,1,1,1
							],
							{
								attributeId: "vertexColor",
								items: 5,
								itemSize: 4
							}), 
						wavePosition: 
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
								items: 5,
								itemSize: 3
							})
						},
						{},5);
						
						state.animator.addKeyframe("small", 
						{
						waveColor: 
							fillProperties([
								0.5,1,1,1,
								0.5,1,1,1,
								0.5,1,1,1,
								0.5,1,1,1,
								0.5,1,1,1,
								0.5,1,1,1
							],
							{
								attributeId: "vertexColor",
								items: 5,
								itemSize: 4
							}), 
						wavePosition: 
							fillProperties([
								0,0,0,
								4,7,0,
								8,0,0,
								4,-7,0,
								0,0,0
							],
							{
								attributeId: "vertexPosition",
								items: 5,
								itemSize: 3
							})
						},
						{},5);
						
						state.animator.addKeyframe("large", 
						{
						waveColor: 
							fillProperties([
								0.5,1,1,1,
								0.5,1,1,1,
								0.5,1,1,1,
								0.5,1,1,1,
								0.5,1,1,1,
								0.5,1,1,1
							],
							{
								attributeId: "vertexColor",
								items: 5,
								itemSize: 4
							}), 
						wavePosition: 
							fillProperties([
								0,0,0,
								35,35,0,
								64,0,0,
								35,-35,0,
								0,0,0
							],
							{
								attributeId: "vertexPosition",
								items: 5,
								itemSize: 3
							})
						},
						{},5);
						
					
					state.first = true;
				}
				state.animator.setCurrentKeyframe("small",0);
				state.animator.setCurrentKeyframe("large", state.delay);
				state.x = x;
				state.y = y;
				state.vel[0]=Entities.player.getInstance(0).vel[0];
				state.vel[1]=Entities.player.getInstance(0).vel[1];
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
			},
			tick: (function(){
				var dir = {0:0,1:0,length:2};
				var time = 0.5;
				return function(delta)
					{
						time -= delta;
						if (mouse.pressed && time <= 0)
						{
							var s = Entities.player.getInstance(0);
							dir[0] = mouse.x - s.cx;
							dir[1] = mouse.yInv - s.cy;
							Entities.wave.newInstance(s.cx,
									s.cy, dir);
							time = 0.5;
						}
					}
				})()
		};
	})())
);
//ticker.add(Entities.wave.def);
