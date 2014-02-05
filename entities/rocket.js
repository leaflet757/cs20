Entities.add('rocket', Entities.create(
	(function(){
		return {
			create: function(state,x,y,dir){
				state.alive = true;
				state.life = 30;
				if(!state.first){
					fillProperties(state, Entities.createStandardCollisionState(
					{
						draw:function(gl,delta,screen,manager,pMatrix,mvMatrix){
							manager.fillRect(this.x+8,this.y+8,0,this.width,this.height,0,.5,1,1,1);
						}
					},x,y,16,16,1));
					state.accel[0]=100;
					state.tick = function(delta){
						this.life-=delta;
						this.alive = this.life>0;
					}
					state.first = true;
				}
				state.x = x;
				state.y = y;
				state.vel[0]=0;
				state.vel[1]=0;
				state.moveToward(mouse.x,mouse.yInv,-100);
				state.accelerateToward(mouse.x,mouse.yInv,100);
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
				return function(delta)
					{
						if (mouse.pressed)
						{
							var s = Entities.player.getInstance(0);
							dir[0] = mouse.x - s.cx;
							dir[1] = mouse.yInv - s.cy;
							Entities.rocket.newInstance(s.cx,
									s.cy, dir);
						}
					}
				})()
		};
	})())
);

ticker.add(Entities.rocket.def);