Entities.add('rocket', Entities.create(
	(function(){
		return {
			create: function(state,x,y,mousex,mousey,dir){
				if(!state.first){
					fillProperties(state, Entities.createStandardState(
					{
						draw:function(gl,delta,screen,manager,pMatrix,mvMatrix){
							manager.fillRect(this.x,this.y,0,this.width,this.height,theta,.5,1,1,1);
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
				}else{
					console.log(1);
					state.x = x;
					state.y = y;
					state.vel[0]=0;
					state.vel[1]=0;
					state.accel[0]=100;
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
			tick: function(delta)
			{
				if (mouse.pressed)
				{
					var length = player.x - mouse.x;
					var height = player.yInv - mouse.yInv;
					Entities.rocket.newInstance(player.x, player.yInv, mouse.x, mouse.yInv);
				}
			}
		};
	})())
);

// ticker.add({
// 	tick:function(delta){
// 		theta += Math.PI/180
// 		if(mouse.pressed){
// 			Entities.rocket.newInstance(player.x,player.yInv);
// 		}
// 	}
// })