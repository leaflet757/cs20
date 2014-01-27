initPhysics();

function initPhysics(){
	colliders = new Array()
	movers = new Array()
	
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
		return (vel*delta) + (0.5 * accel * delta*delta)
	}
	
	var move = function(mover,delta){
		//calculate drag
		var dragConst = mover.dragConst || 0;
		var mag = mover.vel.getMag()*dragConst;
		var dir =(mover.vel.getDir());
		var u = Math.cos(dir)*mag;
		var v = Math.sin(dir)*mag;
		
		var ax = mover.accel.x-u;
		var ay = mover.accel.y-v;
		
		mover.x += getDif(delta,mover.vel.x,ax);
		mover.y += getDif(delta,mover.vel.y,ay);
		
		mover.vel.x += ax*delta;
		mover.vel.y += ay*delta;
	}
	
	physics = fillProperties(new Updatable(),{
		update: function(delta){
			for(var i in movers){
				move(movers[i],delta)
			}
		},
		add: function(obj){
			var result = -1
			if(isMover(obj)){
				movers.push(obj)
				result = 1
			}
			if(isCollider(obj)){
				colliders.push(obj)
				result = 2
			}
			return result
		}
	});
	
	gameComponents[0] = physics;
}


function PolygonState(x,y,polygon){
	MovementState.call(this,x,y)
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
	this.vel = new Vector2d();
	this.accel = new Vector2d();
	return this;
}