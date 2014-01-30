
var theta = 0;
Entities.add('clickBox',Entities.create(
	(function(){
		return {
			create: function(state,x,y){
				if(!state.first){
					state.artist = Entities.createStandardState(
					{
						draw:function(gl,delta,screen,manager,pMatrix,mvMatrix){
							manager.fillRect(this.x,this.y,0,this.width,this.height,theta,.5,1,1,1);
						},
						width: 64,
						height: 64
					},x,y);
					state.artist.accel[0]=100;
					state.artist.tick = function(delta){
						if(this.x>640){
							state.alive = false;
						}
					}
					state.artist.first = true;
				}else{
					console.log(1);
					state.artist.x = x;
					state.artist.y = y;
					state.artist.vel[0]=0;
					state.artist.vel[1]=0;
					state.artist.accel[0]=100;
				}
				graphics.addToDisplay(state.artist,'gl_main');
				ticker.add(state.artist);
				physics.add(state.artist);
			},
			destroy: function(state){
				graphics.removeFromDisplay(state.artist,'gl_main');
				ticker.remove(state.artist);
				physics.remove(state.artist);
			}
		};
	})())
);

ticker.add({
	tick:function(delta){
		theta += Math.PI/180
		if(mouse.pressed){
			Entities.clickBox.newInstance(mouse.x,mouse.yInv);
		}
	}
})