Entities.add('rocket', Entities.create(
	(function(){
		return {
			create: function(state,x,y,dir){
				state.alive = true;
				if(!state.first){
					fillProperties(state, Entities.createStandardState(
					{
						draw:function(gl,delta,screen,manager,pMatrix,mvMatrix){
							manager.fillRect(this.x,this.y,0,this.width,this.height,0,.5,1,1,1);
						},
						width: 16,
						height: 16
					},x,y));
					state.accel[0]=100;
					state.tick = function(delta){
					var screen = graphics.getScreen('gl_main');
						if(this.x>screen.width+screen.x || this.x<0 || this.y>screen.height+screen.y || this.y<0){
							state.alive = false;
						}
					}
					state.first = true;
				}
				state.x = x;
				state.y = y;
				state.vel[0]=0;
				state.vel[1]=0;
				state.accel[0]=100;
				Vector.setDir(state.accel,state.accel,Vector.getDir(dir) + Math.PI);
				
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
							dir[0] = s.physState.x - mouse.x;
							dir[1] = s.physState.y - mouse.yInv;
							Entities.rocket.newInstance(s.physState.x + s.physState.width / 2,
									s.physState.y + s.physState.height / 2, dir);
						}
					}
				})()
		};
	})())
);

ticker.add(Entities.rocket.def);