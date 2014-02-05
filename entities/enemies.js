Entities.add('follower',Entities.create(
	(function(){
		return {
			create: function(state,x,y){
				if(!state.first){
					fillProperties(state,Entities.createStandardState(
						{
							draw:function(gl,delta,screen,manager,pMatrix,mvMatrix){
								manager.fillRect(this.x + this.width/2,this.y + this.height/2,0,this.width,this.height,0,.5,.5,0,1);
							},
							width: 64,
							height: 64
						},x,y));
					state.accel[0]=0;
					state.tick = function(delta){
						var s = Entities.player.getInstance(0);
						state.moveToward(s.cx, s.cy, 50);
					}
					state.first = true;
				}else{
					state.x = x;
					state.y = y;
					state.vel[0]=50;
					state.vel[1]=50;
					state.accel[0]=0;
				}
				
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
ticker.add(Entities.follower.def);