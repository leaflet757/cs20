
var theta = 0;
Entities.add('clickBox',Entities.create(
	(function(){
		return {
			create: function(state,x,y){
				if(!state.first){
					fillProperties(state,Entities.createStandardState(
						{
							draw:function(gl,delta,screen,manager,pMatrix,mvMatrix){
								manager.fillRect(this.x,this.y,0,this.width,this.height,theta,.5,1,1,1);
							},
							width: 64,
							height: 64
						},x,y));
					state.accel[0]=100;
					state.tick = function(delta){
						if(!graphics.getScreen('gl_main').collision(this)){
							state.alive = false;
						}
					}
					state.first = true;
				}else{
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
		};
	})())
);

<<<<<<< HEAD
// ticker.add({
// 	tick:function(delta){
// 		theta += Math.PI/180
// 		if(mouse.pressed){
// 			Entities.clickBox.newInstance(mouse.x,mouse.yInv);
// 		}
// 	}
// })
=======
ticker.add({
	tick:function(delta){
		theta += Math.PI/180
		if(mouse.right){
			Entities.clickBox.newInstance(mouse.x,mouse.yInv);
		}
	}
})
>>>>>>> 7de144c8d870b4f6d002823864fec7ee2c5a8b32
