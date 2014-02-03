initPhysics();

function initPhysics(){
	var lines = false;
	
	var colliders = new Array();
	var movers = new Array();
	
	var lineTree;
	var colliderTree;
	
	{
		var quadNodeSizeLimit = 16;
		
		var treeLineCheck = function(index,node){
			var x = Math.min(lines[index],lines[index+2]);
			var y = Math.min(lines[index+1],lines[index+3]);
			return	x>=node.x && 
					x+Math.abs(lines[index]-lines[index+2])<=node.x+node.width && 
					y>=node.y && 
					y+Math.abs(lines[index+1]-lines[index+3])<=node.y+node.height;
		}
		var treeBoxCheck = function(box,node){
			return 	(typeof box == 'number') ? 
					treeLineCheck(box,node) :
					(box.x>=node.x && 
					box.x+box.width<=node.x+node.width && 
					box.y>=node.y && 
					box.y+box.height<=node.y+node.height);
		}
		/**
		*
		*/
		var QuadTree = function(x,y,width,height){
			this.x = x;
			this.y = y;
			this.width = width;
			this.height = height;
			this.objects = new Array();
			return this;
		}
		QuadTree.prototype = fillProperties(new Box(),{
			objects: [],
			ne: null,
			nw: null,
			se: null,
			sw: null,
			subdivide: function(){
				var w = this.width/2;
				var h = this.height/2;
				var x = this.x;
				var y = this.y;
				this.ne = new QuadTree(x  , y+h, w, h);
				this.nw = new QuadTree(x+w, y+h, w, h);
				this.se = new QuadTree(x+w, y  , w, h);
				this.sw = new QuadTree(x  , y  , w, h);
				
				var box;
				for(var i = 0; i<this.objects.length; i++){
					box = this.objects[i];
					if(treeBoxCheck(box,this.ne)){
						this.ne.add(box);
						this.remove(box);
					}else if(treeBoxCheck(box,this.nw)){
						this.nw.add(box);
						this.remove(box);
					}else if(treeBoxCheck(box,this.se)){
						this.se.add(box);
						this.remove(box);
					}else if(treeBoxCheck(box,this.sw)){
						this.sw.add(box);
						this.remove(box);
					}
				}
			},
			add: function(box){
				if(!treeBoxCheck(box,this)) return false;
				if(this.objects.length > quadNodeSizeLimit || this.se != null){
					if(this.se==null){
						this.subdivide();
					}
					if(treeBoxCheck(box,this.ne))return this.ne.add(box);
					if(treeBoxCheck(box,this.nw))return this.nw.add(box);
					if(treeBoxCheck(box,this.se))return this.se.add(box);
					if(treeBoxCheck(box,this.sw))return this.sw.add(box);
				}
				this.objects.push(box);
				return true;
			},
			remove: function(obj){
				for(var i = 0; i<this.objects.length;  i++){
					if(this.objects[i]==obj){
						this.objects[i]=this.objects[this.objects.length-1];
						this.objects.length--;
						return obj;
					}
				}
				if(this.ne!=null){
					if(typeof this.ne.remove(obj) != 'undefined') return obj;
					if(typeof this.nw.remove(obj) != 'undefined') return obj;
					if(typeof this.se.remove(obj) != 'undefined') return obj;
					if(typeof this.sw.remove(obj) != 'undefined') return obj;
				}
			},
			clear: function(){
				this.objects.length = 0;
				if(this.ne != null){
					this.ne.clear();
					this.nw.clear();
					this.se.clear();
					this.sw.clear();
				}
			},
			get: function(array,x,y,width,height){
				if(this.collision(x,y,width,height)){
					if(this.ne!=null){
						this.ne.get(array,x,y,width,height);
						this.nw.get(array,x,y,width,height);
						this.se.get(array,x,y,width,height);
						this.sw.get(array,x,y,width,height);
					}
					for(var i = 0; i<this.objects.length; i++){
						array.push(this.objects[i]);
					}
				}
				return array;
			},
			getAll: function(array){
				for(var i in this.objects){
					array.push(this.objects[i]);
				}
				if(this.ne!=null){
					this.ne.getAll(array);
					this.nw.getAll(array);
					this.se.getAll(array);
					this.sw.getAll(array);
				}
				return array;
			},
			getRaySet: function(array,x1,y1,x2,y2){
				if(Collision.boxRay(this.x,this.y,this.width,this.height,x1,y1,x2,y2)){
					if(this.ne!=null){
						this.ne.getRaySet(array,x1,y1,x2,y2);
						this.nw.getRaySet(array,x1,y1,x2,y2);
						this.se.getRaySet(array,x1,y1,x2,y2);
						this.sw.getRaySet(array,x1,y1,x2,y2);
					}
				}
				return array;
			},
			size: function(){
				var s = this.objects.length;
				if(this.ne!=null){
					s+=this.ne.size();
					s+=this.nw.size();
					s+=this.se.size();
					s+=this.sw.size();
				}
				return s;
			}
		});
	}
	
	var isCollider = function(obj){
		return 	isMover(obj) && 
				typeof obj.width == 'number' &&
				typeof obj.height == 'number' &&
				typeof obj.elasticity == 'number';
	}
	
	var isVec2d = function(obj){
		return 	typeof obj[0] == 'number' && 
				typeof obj[1] == 'number' && 
				typeof obj.length == 'number';
	}
	
	var isMover = function(obj){
		return 	typeof obj == 'object' && 
				typeof obj.x == 'number' && 
				typeof obj.y == 'number' && 
				typeof obj.accel == 'object' && isVec2d(obj.accel) &&
				typeof obj.vel == 'object' && isVec2d(obj.vel) 
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
	
	//assumes lines in CCW order and are all orthogonal to the x and y axis
	var doCollisionCheck = (function(){
		var collisionSet = new Array();
		var collidingLines = new Array();
		
		var getLineType = function(index){
			if(lines[index] == lines[index+2]){//vertical
				if(lines[index+1]>lines[index+3]){//right
					return 0;
				}else{//left
					return 1;
				}
			}else if(lines[index+1] == lines[index+3]){//horizontal
				if(lines[index]>lines[index+2]){//down
					return 2;
				}else{//up
					return 3;
				}
			}else{
				console.error('collision error '+index);
			}
		}
		
		return function(delta){
			for(var i in colliders){
				collisionSet.length = 0;
				collidingLines.length = 0;
				var co = colliders[i];
				lineTree.get(collisionSet,co);
				for(var j =0; j< collisionSet.length; j++){
					var index = collisionSet[j];
					if(Collisions.boxLine(co.x,co.y,co.width,co.height,lines[index],lines[index+1],lines[index+2],lines[index+3])){
						collidingLines.push(index);
					}
				}
				for(var j = 0; j<collidingLines.length; j++){
					var index = collidingLines[j];
					switch(getLineType(collidingLines[j])){
						case 0://right
							if(collidingLines.length == 1 || Math.abs(lines[index]-co.x) < Math.abs(co.vel[0]*delta)+Math.abs(co.width-co.pwidth)){
								if(co.vel[0]<0){
									co.vel[0] = -(co.vel[0]*co.elasticity);
								}
								if(co.x<lines[index]){
									co.x = lines[index]
								}
								// console.log('right');
							}
							break;
						case 1:
							if(collidingLines.length == 1 || Math.abs(lines[index]-(co.x+co.width)) < Math.abs(co.vel[0]*delta)+Math.abs(co.width-co.pwidth)){
								if(co.vel[0]>0){
									co.vel[0] = -(co.vel[0]*co.elasticity);
								}
								if(co.x+co.width > lines[index]){
									co.x = lines[index] - co.width;
								}
								// console.log('left');
							}
							break;
						case 2:
							if(collidingLines.length == 1 || Math.abs(lines[index+1]-(co.y+co.height)) < Math.abs(co.vel[1]*delta)+Math.abs(co.height-co.pheight)){
								if(co.vel[1]>0){
									co.vel[1] = -(co.vel[1]*co.elasticity);
								}
								if(co.y+co.height > lines[index+1]){
									co.y = lines[index+1]-co.height;
								}
								// console.log('down')
							}
							break;
						case 3:
							if(collidingLines.length == 1 || Math.abs(lines[index+1]-co.y) < Math.abs(co.vel[1]*delta)+Math.abs(co.height-co.pheight)){
								if(co.vel[1]<0){
									co.vel[1] = -(co.vel[1]*co.elasticity);
								}
								if(co.y < lines[index+1]){
									co.y = lines[index+1];
								}
								// console.log('up')
								break;
							}
					}
				}
			}
		}
	})();
	
	physics = fillProperties(new Updatable(),{
		update: function(delta){
			if(lines)doCollisionCheck(delta);
			for(var i in movers){
				move(movers[i],delta);
			}
			if(lines)doCollisionCheck(delta);
			for(var i = 0; i<colliders.length; i++){
				colliders[i].pwidth = colliders[i].width;
				colliders[i].pheight = colliders[i].height;
			}
			graphics.updateScreens();
		},
		add: function(obj){
			var c = false;
			if(isMover(obj)){
				movers.push(obj);
				c = true;
			}
			if(isCollider(obj)){
				colliders.push(obj);
				c = true;
				console.log('added collider')
			}
			if(!c){
				throw 'Physics.add: invalid parameter: '+obj;
			}
		},
		addMover: function(obj){
			if(isMover(obj)){
				movers.push(obj);
			}else{
				throw 'Physics.addMover: invalid parameter: '+obj;
			}
		},
		addCollider: function(obj){
			if(isCollider(obj)){
				colliders.push(obj);
			}else{
				throw 'Physics.addCollider: invalid parameter: '+obj;
			}
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
		/**
		*	sets the geometry to do collision checks against it a sorts it into a quad tree
		* 	this function is expensive and should be called rarely
		*/
		setGeometry: function(newLines){
			if(newLines.length%4 == 0){
				console.log(newLines.length)
				lines = newLines;
				lineTree = new QuadTree(VecArray.getCorner(newLines,2,0),VecArray.getCorner(newLines,2,1),VecArray.getMaxDif(newLines,2,0),VecArray.getMaxDif(newLines,2,1));
				colliderTree = new QuadTree(VecArray.getCorner(newLines,2,0),VecArray.getCorner(newLines,2,1),VecArray.getMaxDif(newLines,2,0),VecArray.getMaxDif(newLines,2,1));
				
				var temp = quadNodeSizeLimit;
				quadNodeSizeLimit = 1;
				for(var i = 0; i<lines.length; i+=4){
					if(!lineTree.add(i))console.error("error adding lines");
				}
				quadNodeSizeLimit = temp;
			}else{
				throw 'physics.setGeometry: wrong number of indeces' 
			}
		},
		clear: function(){
			colliders.length = 1;
			movers.length = 1;
		}
	});
	
	gameComponents[0] = physics;
}


function PolygonState(x,y,polygon){
	MovementState.call(this,x,y);
	this.polygon = polygon;
	return this;
}

function BasicCollider(x,y,width,height,elasticity){
	this.x = x || 0;
	this.y = y || 0;
	this.width = width || 0;
	this.height = height || 0;
	this.pwidth = width || 0;
	this.pheight = height || 0;
	this.elasticity = elasticity || 0;
}
BasicCollider.prototype = fillProperties(new MovementState,{
	width: 0,
	height: 0
});

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
	deccelerate: function(mag){
		dir = Vector(this.vel);
		this.accel[0] = math.cos(dir)*mag;
		this.accel[1] = math.sin(dir)*mag;
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