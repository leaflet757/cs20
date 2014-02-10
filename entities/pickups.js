//small health pickup
Entities.add('health_small',Entities.create(
		{
			create: function(state,x,y){
				if(!state.first){
					fillProperties(state,Entities.createStandardCollisionState(
							{
								draw:function(gl,delta,screen,manager,pMatrix,mvMatrix){
									manager.fillEllipse(this.x+(this.width/2),this.y+(this.width/2),0,this.width,this.height,0,0,0,1,1);
								},
								tick:function(){
									var p = Entities.player.getInstance(0);
									if(p.collision(this)){
										p.life += 10;
										this.alive = false;
									}
								}
							},x,y,16,16,1));
					state.dragConst = 0.1;
				}
				state.set(x,y,0,0,0,0);
				graphics.addToDisplay(state,'gl_main');
				physics.add(state);
				ticker.add(state);
			},
			destroy: function(state){
				graphics.removeFromDisplay(state,'gl_main');
				physics.remove(state);
				ticker.remove(state);
			}
		}
		)
	)