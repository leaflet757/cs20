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
						if(this.x>640 || this.x<0 || this.y>480 || this.y<0){ // map edges
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
						
							dir[0] = Entities.player.getInstance(0).physState.x - mouse.x;
							dir[1] = Entities.player.getInstance(0).physState.y - mouse.yInv;
							Entities.rocket.newInstance(Entities.player.getInstance(0).physState.x,
									Entities.player.getInstance(0).physState.y, dir);
						}
					}
				})()
		};
	})())
);

ticker.add(Entities.rocket.def);
// ticker.add({
// 	tick:function(delta){
// 		if(mouse.pressed){
// 			Entities.rocket.newInstance(player.physState.x,player.yInv);
// 		}
// 	}
// })