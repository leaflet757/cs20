Sound.addBuffer('health_small','resources/audio/health_pickup_small.wav')
Sound.addBuffer('health_med','resources/audio/health_pickup_med.wav')
Sound.addBuffer('health_large','resources/audio/health_pickup_large.wav')
//small health pickup
Entities.add('health_small',Entities.create(
		{
			create: function(state,x,y,vx,vy){
				if(!state.first){
					fillProperties(state,Entities.createStandardCollisionState(
							{
								draw:function(gl,delta,screen,manager,pMatrix,mvMatrix){
									manager.fillEllipse(this.x+(this.width/2),this.y+(this.width/2),0,this.width/2,this.height/2,0,0,1,0,1);
									gl.enable(gl.BLEND);
									gl.blendFunc(gl.SRC_ALPHA, gl.DST_ALPHA);
									manager.fillEllipse(this.x+(this.width/2),this.y+(this.width/2),0,this.width,this.height,0,0,1,0,0.5);
									gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_DST_ALPHA);
								},
								tick:function(){
									var p = Entities.player.getInstance(0);
									if(p.collision(this) && p.life<p.maxLife){
										p.life += 1;
										this.alive = false;
									}
								},
								z: 0
							},x,y,16,16,1));
					state.dragConst = 0.1;
					state.pickupSound = Sound.createSound('health_small');
					state.pickupSound.gain = 0.1;
				}
				state.set(x,y,vx || 0,vy || 0,0,0);
				graphics.addToDisplay(state,'gl_main');
				physics.add(state);
				ticker.add(state);
			},
			destroy: function(state){
				state.pickupSound.play(0);
				graphics.removeFromDisplay(state,'gl_main');
				physics.remove(state);
				ticker.remove(state);
				Entities.health_burst.newInstance(state.x,state.y,8,12,25,2,state.vel[0],state.vel[1])
			}
		}
		)
	)

	
Entities.add('health_med',Entities.create(
	{
		create: function(state,x,y,vx,vy){
			if(!state.first){
				fillProperties(state,Entities.createStandardCollisionState(
						{
							draw:function(gl,delta,screen,manager,pMatrix,mvMatrix){
								manager.fillEllipse(this.x+(this.width/2),this.y+(this.width/2),0,this.width/2,this.height/2,0,0,1,0,1);
								gl.enable(gl.BLEND);
								gl.blendFunc(gl.SRC_ALPHA, gl.DST_ALPHA);
								manager.fillEllipse(this.x+(this.width/2),this.y+(this.width/2),0,this.width,this.height,0,0,1,0,0.5);
								gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_DST_ALPHA);
							},
							tick:function(){
								var p = Entities.player.getInstance(0);
								if(p.collision(this) && p.life<p.maxLife){
									p.life += 15;
									this.alive = false;
								}
							},
							z: 0
						},x,y,24,24,1));
				state.dragConst = 0.1;
				state.pickupSound = Sound.createSound('health_med');
				state.pickupSound.gain = 0.1;
			}
			state.set(x,y,vx || 0,vy || 0,0,0);
			graphics.addToDisplay(state,'gl_main');
			physics.add(state);
			ticker.add(state);
		},
		destroy: function(state){
			state.pickupSound.play(0);
			Entities.health_burst.newInstance(state.x,state.y,8,18,25,2,state.vel[0],state.vel[1])
			graphics.removeFromDisplay(state,'gl_main');
			physics.remove(state);
			ticker.remove(state);
		}
	}
	)
)

Entities.add('health_large',Entities.create(
	{
		create: function(state,x,y,vx,vy){
			if(!state.first){
				fillProperties(state,Entities.createStandardCollisionState(
						{
							draw:function(gl,delta,screen,manager,pMatrix,mvMatrix){
								manager.fillEllipse(this.x+(this.width/2),this.y+(this.width/2),0,this.width/2,this.height/2,0,0,1,0,1);
								gl.enable(gl.BLEND);
								gl.blendFunc(gl.SRC_ALPHA, gl.DST_ALPHA);
								manager.fillEllipse(this.x+(this.width/2),this.y+(this.width/2),0,this.width,this.height,0,0,1,0,0.5);
								gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_DST_ALPHA);
							},
							tick:function(){
								var p = Entities.player.getInstance(0);
								if(p.collision(this) && p.life<p.maxLife){
									p.life += 25;
									this.alive = false;
								}
							},
							z: 0
						},x,y,32,32,1));
				state.dragConst = 0.1;
				state.pickupSound = Sound.createSound('health_large');
				state.pickupSound.gain = 0.1;
			}
			state.set(x,y,vx || 0,vy || 0,0,0);
			graphics.addToDisplay(state,'gl_main');
			physics.add(state);
			ticker.add(state);
		},
		destroy: function(state){
			state.pickupSound.play(0);
			Entities.health_burst.newInstance(state.x,state.y,8,24,25,2,state.vel[0],state.vel[1])
			graphics.removeFromDisplay(state,'gl_main');
			physics.remove(state);
			ticker.remove(state);
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
							tick:function(delta){
								this.life -= delta;
								if(this.life<=0){
									this.alive = false;
								}
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

