initPhysics();

function initPhysics(){
	colliders = new Array();
	movers = new Array();
	
	var isCollider = function(obj){
		return false
	}
	
	var isMover = function(obj){
		return 	typeof obj == 'object' && 
				obj.hasOwnProperty('x') && 
				obj.hasOwnProperty('y') && 
				obj.hasOwnProperty('vel') && 
				obj.hasOwnProperty('accel')
	}
	
	var getDif = function(delta,vel,accel){
		return (vel*delta) + (0.5 * accel * delta*delta);
	}
	
	var move = function(mover,delta){
		//calculate drag
		var dragConst = mover.dragConst || 0;
		var mag = Vector.getMag(mover.vel)*dragConst;
		var dir =(Vector.getDir(mover.vel));
		var u = Math.cos(dir)*mag;
		var v = Math.sin(dir)*mag;
		
		var ax = mover.accel[0]-u;
		var ay = mover.accel[1]-v;
		
		mover.x += getDif(delta,mover.vel[0],ax);
		mover.y += getDif(delta,mover.vel[1],ay);
		
		mover.vel[0] += ax*delta;
		mover.vel[1] += ay*delta;
	}
	
	physics = fillProperties(new Updatable(),{
		update: function(delta){
			for(var i in movers){
				move(movers[i],delta);
			}
		},
		add: function(obj){
			var result = -1
			if(isMover(obj)){
				movers.push(obj);
				result = 1
			}
			if(isCollider(obj)){
				colliders.push(obj);
				result = 2
			}
			return result;
		},
		remove: function(obj){
			for(var i=0; i<movers.length; i++){
				if(movers[i]==obj){
					movers.splice(i,1);
					break;
				}
			}
			for(var i=0; i<colliders.length; i++){
				if(colliders[i]==obj){
					colliders.splice(i,1);
					break;
				}
			}
		},
		reset: function(){
		
		}
	});
	
	gameComponents[0] = physics;
}


function PolygonState(x,y,polygon){
	MovementState.call(this,x,y);
	this.polygon = polygon;
	return this;
}

function MovementState(x,y){
	if(typeof x != 'number' && typeof y != 'number'){
		x = 0
		y = 0
	}
	this.x = x;
	this.y = y;
	this.vel = {0:0,1:0,length:2};
	this.accel = {0:0,1:0,length:2};
	return this;
}

MovementState.prototype = {
	setPos:function(x,y){
		this.x = x;
		this.y = y;
	},
	setVel:function(x,y){
		this.vel[0]=x;
		this.vel[1]=y;
	},
	setAccel: function(x,y){
		this.accel[0]=x;
		this.accel[1]=y;
	},
	set:function(x,y,vx,vy,ax,ay){
		this.x = x;
		this.y = y;
		this.vel[0]=vx;
		this.vel[1]=vy;
		this.accel[0]=ax;
		this.accel[1]=ay;
	}
}