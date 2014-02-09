
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


// ticker.add({
<<<<<<< HEAD
// 	misc: [],
// 	tick:function(delta){
// 		if(mouse.left){
// 			Entities.clickBox.newInstance(mouse.x,mouse.yInv);
// 		}
// 		if(mouse.right){
// 			this.misc.length = 0;
// 			var p = Entities.player.getInstance(0);
// 			var traceResult = physics.rayTrace(this.misc,p.x+p.width/2,p.y+p.height/2,mouse.x,mouse.yInv);
// 			if(traceResult.length>3)traceResult[1].moveToward(p.cx,p.cy,-300);
// 		}
// 	}
=======
	// misc: [],
	// tick:function(delta){
		// if(mouse.left){
			// Entities.clickBox.newInstance(mouse.x,mouse.yInv);
		// }
		// if(mouse.right){
			// this.misc.length = 0;
			// var p = Entities.player.getInstance(0);
			// var traceResult = physics.rayTrace(this.misc,p.x+p.width/2,p.y+p.height/2,mouse.x,mouse.yInv);
			// if(traceResult.length>3)traceResult[1].moveToward(p.cx,p.cy,-300);
		// }
	// }
>>>>>>> master
// })


