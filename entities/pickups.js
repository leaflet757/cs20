Entities.add('health_generic',Entities.create(
		{
			create: function(state,x,y,vx,vy){
				if(!state.firstHealth){
					fillProperties(state,Entities.createStandardCollisionState(
							{
								draw:function(gl,delta,screen,manager,pMatrix,mvMatrix){
									manager.fillEllipse(this.x+(this.width/2),this.y+(this.width/2),0,this.width/2,this.height/2,0,0,1,0,1);
									gl.enable(gl.BLEND);
									gl.blendFunc(gl.SRC_ALPHA, gl.DST_ALPHA);
									manager.fillEllipse(this.x+(this.width/2),this.y+(this.width/2),0,this.width,this.height,0,0,1,0,0.5);
									gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_DST_ALPHA);
								},
								z: 0
							},x,y,16,16,1));
					state.health = 1;
					state.dragConst = 0.4;
					state.pickupSound = Sound.createSound('health_small');
					state.pickupSound.gain = 0.1;
					state.firstHealth = true;
					state.pullRange = 512;
					state.pullMag = 600;
				}
				state.set(x,y,vx || 0,vy || 0,0,0);
				graphics.addToDisplay(state,'gl_main');
				physics.add(state);
			},
			update: function(state){
				var p = Entities.player.getInstance(0);
				if(p.collision(state) && p.life<p.maxLife){
					p.life += state.health;
					state.alive = false;
				}else if(p.life<p.maxLife){
					var dist = pythag(state.x+state.width/2 - p.cx,state.y+state.height/2 - p.cy);
					if(dist<state.pullRange){
						state.accelerateToward(p.cx-state.width/2,p.cy-state.height/2,state.pullMag*sqr(1-(dist/state.pullRange)));
					}
				}	
			},
			destroy: function(state,reset){
				if(!reset) {
					state.pickupSound.play(0);
					Entities.shrink_burst.burst(8,state.x,state.y,state.width*.75,state.width*.75,3,50,0,1,0,0.1,state.vel[0],state.vel[1])
				}
				graphics.removeFromDisplay(state,'gl_main');
				physics.remove(state);
			}
		}
		)
	);
	
//small health pickup
Entities.add('health_small',Entities.create(
		{
			parent: Entities.health_generic
		}
		)
	)

	
Entities.add('health_med',Entities.create(
	{
		parent: Entities.health_generic,
		create: function(state,x,y,vx,vy){
			if(!state.healthMed){
				state.width = 24;
				state.height = 24;
				state.health = 15;
				state.pickupSound = Sound.createSound('health_med');
				state.pickupSound.gain = 0.1;
				state.healthMed = true;
			}
		}
	}
	)
)

Entities.add('health_large',Entities.create(
	{
		parent: Entities.health_generic,
		create: function(state,x,y,vx,vy){
			if(!state.healthLarge){
				state.width = 32;
				state.height = 32;
				state.health = 25;
				state.pickupSound = Sound.createSound('health_large');
				state.pickupSound.gain = 0.1;
				state.healthLarge = true;
			}
		}
	}
	)
)

Entities.add('health_burst_frag',Entities.create(
	{
		create: function(state,x,y,size,life,vx,vy){
			if(!state.first){
				fillProperties(state,Entities.createStandardState(
						{
							draw:function(gl,delta,screen,manager,pMatrix,mvMatrix){
								this.alpha -=delta/this.life
								gl.enable(gl.BLEND);
								gl.blendFunc(gl.SRC_ALPHA, gl.DST_ALPHA);
								manager.fillEllipse(this.x+(this.width/2),this.y+(this.width/2),0,this.width,this.height,0,0,1,0,0.5*this.alpha);
								manager.fillEllipse(this.x+(this.width/2),this.y+(this.width/2),0,this.width/2,this.height/2,0,0,1,0,this.alpha);
								gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_DST_ALPHA);
							},
							width: size,
							height: size,
							z: 0
						},x,y));
			}
			state.alpha = 1;
			state.life = life || 1;
			state.set(x,y,vx || 0,vy || 0,0,0);
			graphics.addToDisplay(state,'gl_main');
			physics.add(state);
		},
		update:function(state,delta){
			state.life -= delta;
			if(state.life<=0){
				state.alive = false;
			}
		},
		destroy: function(state){
			graphics.removeFromDisplay(state,'gl_main');
			physics.remove(state);
		}
	}
	)
)

Entities.add('health_burst',Entities.create((function(){
		return {
			create: function(state,x,y,num,size,speed,life,vx,vy){
				for(var i = 0; i< num; i++ ){
					var theta = Math.random()*(Math.PI*2)
					Entities.health_burst_frag.newInstance(x,y,size,life,vx+Math.cos(theta)*speed,vy+Math.sin(theta)*speed)
				}
				state.alive = false;
			},
			destroy: function(state){
			}
		}
	})()
	)
)

