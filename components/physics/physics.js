initPhysics();

function initPhysics(){
	var lines = false;
	
	var colliders = new Array();
	var movers = new Array();
	
	var lineTree;
	var colliderTree;
	
	{
		var quadNodeSizeLimit = 4;
		
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
				if(Collisions.boxRay(this.x,this.y,this.width,this.height,x1,y1,x2,y2)){
					if(this.ne!=null){
						this.ne.getRaySet(array,x1,y1,x2,y2);
						this.nw.getRaySet(array,x1,y1,x2,y2);
						this.se.getRaySet(array,x1,y1,x2,y2);
						this.sw.getRaySet(array,x1,y1,x2,y2);
					}
					for(var i = 0; i<this.objects.length; i++){
						array.push(this.objects[i]);
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
			},
			draw: function(gl,delta,screen,manager,pMatrix,mvMatrix){
				manager.strokeRect(this.x+this.width/2,this.y+this.height/2,-98,this.width,this.height,0,1,1,1,1);
				if(this.ne!=null){
					this.ne.draw(gl,delta,screen,manager,pMatrix,mvMatrix);
					this.nw.draw(gl,delta,screen,manager,pMatrix,mvMatrix);
					this.se.draw(gl,delta,screen,manager,pMatrix,mvMatrix);
					this.sw.draw(gl,delta,screen,manager,pMatrix,mvMatrix);
				}
			}
		});
	}
	
	var isCollider = function(obj){
		return 	isMover(obj) &&  
				typeof obj.width == 'number' &&
				typeof obj.height == 'number' &&
				typeof obj.elasticity == 'number' &&
				typeof obj.fineCheck == 'function' &&
				typeof obj.onCollision == 'function';
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
		
		var dx = getDif(delta,mover.vel[0],ax);
		var dy = getDif(delta,mover.vel[1],ay);
		
		mover.x += dx;
		mover.y += dy;
		
		mover.vel[0] += ax*delta;
		mover.vel[1] += ay*delta;
		
		var speed = Vector.getMag(mover.vel);
		if(speed<0.001 || (mover.minSpeed && speed<mover.minSpeed)){
			mover.vel[0]=0;
			mover.vel[1]=0;
		}if(mover.maxSpeed){
			if(Vector.getMag(mover.vel)>mover.maxSpeed) Vector.setMag(mover.vel,mover.vel,mover.maxSpeed);
		}
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
				if(colliders[i].x==colliders[i].px && colliders[i].y==colliders[i].py && colliders[i].width==colliders[i].pwidth && colliders[i].height==colliders[i].pheight) continue;
				collisionSet.length = 0;
				collidingLines.length = 0;
				var co = colliders[i];
				if(!co.doLineCheck) continue;
				lineTree.get(collisionSet,co);
				for(var j =0; j< collisionSet.length; j++){
					var index = collisionSet[j];
					if(Collisions.boxBox
							(Math.min(co.x,co.px),Math.min(co.y,co.py),
							Math.abs(co.x-co.px)+co.width,
							Math.abs(co.y-co.py)+co.height,
							Math.min(lines[index],lines[index+2]),Math.min(lines[index+1],lines[index+3]),
							Math.abs(lines[index]-lines[index+2]),Math.abs(lines[index+1]-lines[index+3])) && 
							co.fineCheck(lines[index],lines[index+1],lines[index+2],lines[index+3])){
						collidingLines.push(index);
					}
				}
				if(collidingLines.length>0){
					co.onCollision();
					if(co.adjust){
						co.adjust(collidingLines,lines,getLineType);
					}else{
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
			}
		}
	})();
	
	physics = fillProperties(new Updatable(),(function(){
	
		var radialForces = [];
		
		var queryArray = [];
		
		var miscVec = [];
		
		var miscArray = [];
		
		var doForces = function(delta){
			if(colliderTree){
				for(var i = 0; i<radialForces.length; i+=5){
					var x = radialForces[i], y = radialForces[i+1], radius = radialForces[i+2], mag = radialForces[i+3];
					queryArray.length = 0;
					var effected = colliderTree.get(queryArray,x-(radius/2),y-(radius/2),radius,radius);
					for(var j in effected){
						var e = effected[j];
						if(e.forcesEnabled){
							miscVec[0] = (e.x+(e.width/2))-x;
							miscVec[1] = (e.y+(e.height/2))-y;
							if(Vector.getMag(miscVec)<radius){
								var m = mag - (mag*(Vector.getMag(miscVec)/radius));
								var theta = Vector.getDir(miscVec);
								e.addForce(Math.cos(theta)*m,Math.sin(theta)*m);
							}
						}
					}
					console.log(radialForces[i+4], delta);
					radialForces[i+4]-=delta;
				}
				for(var i = 0; i<radialForces.length; i+=5){
					if(radialForces[i+4]<=0){
						radialForces.splice(i,5);
					}
				}
			}
			
		}
		
		var sortX =0, sortY = 0;
		var sortComp = function(a,b){
			return pythag((a.x+(a.width/2))-sortX,(a.y+(a.height/2))-sortY)-pythag((b.x+(b.width/2))-sortX,(b.y+(b.height/2))-sortY);
		}
		return {
			update: function(delta){
				if(lines)doCollisionCheck(delta);
				doForces(delta);
				for(var i in movers){
					if(movers[i].doMove)move(movers[i],delta);
					if(!movers[i].keepAccel){
						movers[i].accel[0] = 0;
						movers[i].accel[1] = 0;
					}
				}
				if(lines)doCollisionCheck(delta);
				for(var i = 0; i<colliders.length; i++){
					colliders[i].pwidth = colliders[i].width;
					colliders[i].pheight = colliders[i].height;
					colliders[i].px = colliders[i].x;
					colliders[i].py = colliders[i].y
				}
				if(colliderTree){
					colliderTree.clear();
					for(var i = 0; i< colliders.length; i++){
						colliderTree.add(colliders[i]);
					}
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
				}
				if(!c){
					console.trace();
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
			getColliders: function(array,x,y,width,height){
				if(colliderTree){
					colliderTree.get(array,x,y,width,height);
					return array;
				}
			},
			getCollidersRay: function(array,x1,y1,x2,y2){
				if(colliderTree){
					colliderTree.getRaySet(array,x1,y1,x2,y2);
					return array;
				}
			},
			getLines: function(array,x,y,width,height){
				if(lineTree){
					lineTree.get(array,x,y,width,height);
					return array;
				}
			},
			getLinesRay: function(array,x1,y1,x2,y2){
				if(lineTree){
					lineTree.getRaySet(array,x1,y1,x2,y2);
					return array;
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
					lineTree = new QuadTree(VecArray.getCorner(newLines,2,0)-8,VecArray.getCorner(newLines,2,1)-8,VecArray.getMaxDif(newLines,2,0)+16,VecArray.getMaxDif(newLines,2,1)+16);
					colliderTree = new QuadTree(VecArray.getCorner(newLines,2,0)-8,VecArray.getCorner(newLines,2,1)-8,VecArray.getMaxDif(newLines,2,0)+16,VecArray.getMaxDif(newLines,2,1)+16);
					
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
			/**
			*  Does a raytrace and puts all of the items intersecting the ray into an array in the order of intersection 
			*  the ray is stopped by collision with geometry
			*  if addLine evaluates to true the endpoints of the 
			*  line that the ray collides with is added to the array after the point of collision
			*/
			rayTrace: function(array,x1,y1,x2,y2,addLine){
				queryArray.length = 0;
				var lineSet = lineTree.getRaySet(queryArray,x1,y1,x2,y2);
				var line = null;
				var px,py;
				var dist = -1;
				
				//console.log(lineSet.length);
				for(var i = 0; i<lineSet.length; i++){
					var xa = lines[lineSet[i]], ya = lines[lineSet[i]+1], xb = lines[lineSet[i]+2],yb = lines[lineSet[i]+3];
					var res = Collisions.lineRay(xa,ya,xb,yb,x1,y1,x2,y2);
					// console.log(res);
					var tempDist = pythag(res[0]-x1,res[1]-y1);
					if(res && (dist<0 || tempDist<dist)){
						dist = tempDist;
						line = lineSet[i];
						px = res[0];
						py = res[1];
					}
				}
				
				if(line == null || !px) throw 'ray trace error: can not find line'
				lineSet.length = 0
				
				var collided = colliderTree.getRaySet(lineSet,x1,y1,x2,y2);
				
				for(var i  in collided){
					var o = collided[i];
					if(Collisions.boxBox(o.x,o.y,o.height,o.width,Math.min(x1,px),Math.min(y1,py),Math.abs(x1-px),Math.abs(y1-py)) &&
							Collisions.boxLine(o.x,o.y,o.height,o.width,x1,y1,px,py) && 
							o.fineCheck(x1,y1,px,py)){
						array.push(o);
					}
				}
				
				sortX = x1;
				sortY = y1;
				array.sort(sortComp);
				array.push(px,py);
				if(addLine){
					array.push(lines[line],lines[line+1],lines[line+2],lines[line+3]);
				}
				
				collided.length = 0;
				return array;
			},
			/**
			*	does the ray trace only for the line
			*   puts the point the ray collides with a wall into the array then
			*	the end points of the line in collided with
			*/
			rayTraceLine: function(array,x1,y1,x2,y2){
				queryArray.length = 0;
				var lineSet = lineTree.getRaySet(queryArray,x1,y1,x2,y2);
				var line = null;
				var px,py;
				var dist = -1;
				
				//console.log(lineSet.length);
				for(var i = 0; i<lineSet.length; i++){
					var xa = lines[lineSet[i]], ya = lines[lineSet[i]+1], xb = lines[lineSet[i]+2],yb = lines[lineSet[i]+3];
					var res = Collisions.lineRay(xa,ya,xb,yb,x1,y1,x2,y2);
					// console.log(res);
					var tempDist = pythag(res[0]-x1,res[1]-y1);
					if(res && (dist<0 || tempDist<dist)){
						dist = tempDist;
						line = lineSet[i];
						px = res[0];
						py = res[1];
					}
				}
				lineSet.length = 0;
				if(line == null || !px) {
					throw 'ray trace error: can not find line';
				}
				
				array.push(px,py);
				array.push(lines[line],lines[line+1],lines[line+2],lines[line+3]);
				array.push(line);
				return array;
			},
			/**
			*	returns true if a line can be drawn between the two points without intersecting the geometry
			*/
			lineRayTest: function(x1,y1,x2,y2,exception){
				queryArray.length = 0;
				var lineSet = lineTree.get(queryArray,Math.min(x1,x2),Math.min(y1,y2),Math.abs(x1-x2),Math.abs(y1-y2));
				for(var i = 0;i<lineSet.length; i++){
					if(		lineSet[i] != exception &&
							!(	exception &&
								(Collisions.comp(lines[exception],lines[lineSet[i]])   && Collisions.comp(lines[exception+1],lines[lineSet[i]+1]) ||
								Collisions.comp(lines[exception],lines[lineSet[i]+2]) && Collisions.comp(lines[exception+1],lines[lineSet[i]+3]) ||
								Collisions.comp(lines[exception+2],lines[lineSet[i]])   && Collisions.comp(lines[exception+3],lines[lineSet[i]+1]) ||
								Collisions.comp(lines[exception+2],lines[lineSet[i]+2]) && Collisions.comp(lines[exception+3],lines[lineSet[i]+3]))
							) && 
							!Collisions.pointOnLine(x1,y1,lines[lineSet[i]],lines[lineSet[i]+1],lines[lineSet[i]+2],lines[lineSet[i]+3]) &&
							!Collisions.pointOnLine(x2,y2,lines[lineSet[i]],lines[lineSet[i]+1],lines[lineSet[i]+2],lines[lineSet[i]+3]) &&
							Collisions.lineLine(x1,y1,x2,y2,lines[lineSet[i]],lines[lineSet[i]+1],lines[lineSet[i]+2],lines[lineSet[i]+3])){
						return false;
					}
				}
				return true;
			},
			getCone: function(array,x1,y1,x2,y2,theta){
				array.push(x1,y1,0);
				miscArray.length = 0;
				var dir = Vector.getDir(vec2.set(miscVec,x2-x1,y2-y1));
				
				var u = x2-x1;
				var v = y2-y1;
				var c = Math.cos(theta);
				var s = Math.sin(theta);
				var line = this.rayTraceLine(queryArray,x1,y1,x1+((u*c)-(v*s)),y1+((u*s)+(v*c)));
				array.push(line[0],line[1],0);
				var lx1 = line[2],ly1 = line[3],lx2 = line[4], ly2 = line[5];
				var nx,ny;
				var p = false;
				var d = -1;
				if(Math.abs(Vector.getDir(vec2.set(miscVec,lx1-x1,ly1-y1))-dir)<theta && this.lineRayTest(x1,y1,lx1,ly1,line[6]) &&  d<Vector.getMag(miscVec)){
					nx = lx1;
					ny = ly1;
					array.push(lx1,ly1,0)
					p=true;
					d = Vector.getMag(miscVec);
				}
				if(Math.abs(Vector.getDir(vec2.set(miscVec,lx2-x1,ly2-y1))-dir)<theta && this.lineRayTest(x1,y1,lx2,ly2,line[6]) && d<Vector.getMag(miscVec)){
					nx = lx2;
					ny = ly2;
					array.push(lx2,ly2,0)
					p=true;
					d = Vector.getMag(miscVec);
				}
				var prev = line[6];
				var c = 0
				while(p && c++<20){
					d = -1;
					p=false;
					vec2.set(miscVec,nx-x1,ny-y1)
					Vector.normalize(miscVec,miscVec);
					queryArray.length = 0;
					try{
						line = this.rayTraceLine(queryArray,nx+miscVec[0],ny+miscVec[1],nx+(miscVec[0])*2,ny+(miscVec[1])*2);
					}catch(e){break;}
					array.push(line[0],line[1],0);
					lx1 = line[2],ly1 = line[3],lx2 = line[4], ly2 = line[5];
					if(Math.abs(Vector.getDir(vec2.set(miscVec,lx1-x1,ly1-y1))-dir)<theta && this.lineRayTest(x1,y1,lx1,ly1,line[6]) && d<Vector.getMag(miscVec)){
						nx = lx1;
						ny = ly1;
						array.push(lx1,ly1,0)
						p=true;
						d = Vector.getMag(miscVec);
					}
					if(Math.abs(Vector.getDir(vec2.set(miscVec,lx2-x1,ly2-y1))-dir)<theta && this.lineRayTest(x1,y1,lx2,ly2,line[6]) && d<Vector.getMag(miscVec)){
						nx = lx2;
						ny = ly2;
						array.push(lx2,ly2,0)
						p=true;
						d = Vector.getMag(miscVec);
					}
					prev = line[6];
				}
				if(c>=20)console.error("timeout1")
				
				d=-1;
				c=Math.cos(-theta);
				s=Math.sin(-theta);
				queryArray.length = 0;
				var line = this.rayTraceLine(queryArray,x1,y1,x1+((u*c)-(v*s)),y1+((u*s)+(v*c)));
				miscArray.push(line[0],line[1],0);
				var lx1 = line[2],ly1 = line[3],lx2 = line[4], ly2 = line[5];
				var nx,ny;
				var p = false;
				if(Math.abs(Vector.getDir(vec2.set(miscVec,lx1-x1,ly1-y1))-dir)<theta && this.lineRayTest(x1,y1,lx1,ly1,line[6]) && d<Vector.getMag(miscVec)){
					nx = lx1;
					ny = ly1;
					miscArray.push(lx1,ly1,0)
					p=true;
					d=Vector.getMag(miscVec)
				}
				if(Math.abs(Vector.getDir(vec2.set(miscVec,lx2-x1,ly2-y1))-dir)<theta && this.lineRayTest(x1,y1,lx2,ly2,line[6]) && d<Vector.getMag(miscVec)){
					nx = lx2;
					ny = ly2;
					miscArray.push(lx2,ly2,0)
					p=true;
					d=Vector.getMag(miscVec)
				}
				prev = line[6];
				c = 0;
				while(p && c++<20){
					d=-1
					p=false;
					vec2.set(miscVec,nx-x1,ny-y1)
					Vector.normalize(miscVec,miscVec);
					queryArray.length = 0;
					try{
						line = this.rayTraceLine(queryArray,nx+miscVec[0],ny+miscVec[1],nx+(miscVec[0])*2,ny+(miscVec[1])*2);
					}catch(e){break;}
					miscArray.push(line[0],line[1],0);
					lx1 = line[2],ly1 = line[3],lx2 = line[4], ly2 = line[5];
					if(Math.abs(Vector.getDir(vec2.set(miscVec,lx1-x1,ly1-y1))-dir)<theta && this.lineRayTest(x1,y1,lx1,ly1,line[6]) && d<Vector.getMag(miscVec)){
						nx = lx1;
						ny = ly1;
						miscArray.push(lx1,ly1,0)
						p=true;
						d=Vector.getMag(miscVec)
					}
					if(Math.abs(Vector.getDir(vec2.set(miscVec,lx2-x1,ly2-y1))-dir)<theta && this.lineRayTest(x1,y1,lx2,ly2,line[6]) && d<Vector.getMag(miscVec)){
						nx = lx2;
						ny = ly2;
						miscArray.push(lx2,ly2,0)
						p=true;
						d=Vector.getMag(miscVec)
					}
					prev = line[6];
				}
				if(c>=20)console.error("timeout2")
				for(var i = miscArray.length-3; i>=0; i-=3){
					array.push(miscArray[i],miscArray[i+1],miscArray[i+2])
				}
				// console.log(array.length)
				// console.log(array+"")
				return array;
			},
			/**
			* does a raytrace through a given set 
			*/
			rayTraceSet: function(out,set,x1,y1,x2,y2){
				for(var i in set){
					var o = set[i];
					if(Collisions.boxRay(o.x,o.y,o.height,o.width,x1,y1,x2,y2) && o.fineRayCheck(x1,y1,x2,y2)){
						out.push(set[i]);
					}
				}
				sortX = x1;
				sortY = y1;
				return out.sort(sortComp);
			},
			/**
			*	creates a force that expands outward
			*
			*/
			radialForce: function(x,y,radius,mag,t){
				radialForces.push(x,y,radius,mag,0);
				console.log(radialForces[radialForces.length - 1]);
			},
			draw: function(gl,delta,screen,manager,pMatrix,mvMatrix){
				if(lineTree) lineTree.draw(gl,delta,screen,manager,pMatrix,mvMatrix)
			},
			clear: function(){
				colliders.length = 1;
				movers.length = 1;
			}
		}
	})());
	gameComponents[0] = physics;
}

function MovementState(x,y,theta){
	x = x || 0;
	y = y || 0;
	theta = theta || 0;
	this.children = [];
	this.vel = {0:0,1:0,length:2};
	this.accel = {0:0,1:0,length:2};
	Object.defineProperties(this,{
		x:{
			get:function(){
				return x;
			},
			set:function(nx){
				var dif = nx - x;
				x = nx;
				for(var i in this.children){
					this.children[i].x+=dif;
				}
			},
			configurable:true
		},
		y:{
			get:function(){
				return y;
			},
			set:function(ny){
				var dif = ny - y;
				y = ny;
				for(var i in this.children){
					this.children[i].y+=dif;
				}
			},
			configurable:true
		},
		theta:{
			get:function(){
				return theta;
			},
			set:function(ntheta){
				var dif = ntheta - theta;
				theta = ntheta;
				var c = Math.cos(dif);
				var s = Math.sin(dif);
				for(var i in this.children){
					var x = this.children[i].x;
					var y = this.children[i].y;
					this.children.x = x*c - y*s;
					this.children.y = x*s + y*c;
				}
			},
			configurable:true
		}
	})
	
	return this;
}
MovementState.prototype = Object.defineProperties(
	{
		setPos:function(x,y){
			this.x = x;
			this.y = y;
			return this;
		},
		setVel:function(x,y){
			this.vel[0]=x;
			this.vel[1]=y;
			return this;
		},
		setAccel: function(x,y){
			this.accel[0]=x;
			this.accel[1]=y;
			return this;
		},
		deccelerate: function(mag){
			dir = Vector(this.vel);
			this.accel[0] = math.cos(dir)*mag;
			this.accel[1] = math.sin(dir)*mag;
			return this;
		},
		set:function(x,y,vx,vy,ax,ay){
			this.x = x;
			this.y = y;
			this.vel[0]=vx;
			this.vel[1]=vy;
			this.accel[0]=ax;
			this.accel[1]=ay;
			return this;
		},
		moveToward: function(x,y,speed){
			x-=this.x;
			y-=this.y;
			var l = pythag(x,y);
			this.vel[0] = speed * (x/l);
			this.vel[1] = speed * (y/l);
			return this;
		},
		accelerateToward: function(x,y,scalarAcceleration){
			x-=this.x;
			y-=this.y;
			var l = pythag(x,y);
			this.accel[0] = scalarAcceleration * (x/l);
			this.accel[1] = scalarAcceleration * (y/l);
			return this;
		},
		addChild: function(child){
			if(typeof child.x == 'number' && typeof child.y == 'number' && typeof child.theta == 'number'){
				this.children.push(child);
				return child;
			}else{
				throw 'invalid attempt to add child to movement state'
			}
		},
		removeChild:function(child){
			for(var i=0; i<this.children.length; i++){
				if(this.children[i]==child){
					this.children.splice(i,1);
				}
			}
			return child;
		},
		face : function(x,y,dif){
			dif = dif || 0;
			this.theta = Vector.getDir(x-this.x,y-this.y)+dif
		},
		doMove:true
	},
	{
		speed:{
			get: function(){
				return Vector.getMag(this.vel);
			},
			set: function(mag){
				Vector.setMag(this.vel,this.vel,mag);
			}
		},
		dirVel:{
			get: function(){
				return Vector.getDir(this.vel);
			},
			set: function(theta){
				Vector.setDir(this.vel,this.vel,theta);
			}
		},
		scalarAccel:{
			get: function(){
				return Vector.getMag(this.accel);
			},
			set: function(mag){
				Vector.setMag(this.accel,this.accel,mag);
			}
		},
		dirAccel:{
			get: function(){
				return Vector.getDir(this.accel);
			},
			set: function(theta){
				Vector.setDir(this.accel,this.accel,theta);
			}
		}
	}
);

function BasicCollider(x,y,width,height,elasticity){
	this.x = x || 0;
	this.y = y || 0;
	this.width = width || 0;
	this.height = height || 0;
	this.pwidth = width || 0;
	this.pheight = height || 0;
	this.elasticity = elasticity || 0;
	this.vel = {0:0,1:0,length:2};
	this.accel = {0:0,1:0,length:2};
}
BasicCollider.prototype = fillProperties(new Box(),fillProperties(new MovementState(0,0),{
	width: 0,
	height: 0,
	mass: 1,
	rayTraceEnabled: true,
	forcesEnabled: true,
	addForce: function(x,y){
		this.accel[0]+=x/this.mass;
		this.accel[1]+=y/this.mass;
	},
	onCollision: function(){},
	fineCheck: function(x1,y1,x2,y2){return true;},
	fineRayCheck: function(x1,y1,x2,y2){return true;},
	adjust: false,
	doLineCheck: true
}));

function PolygonCollider(x,y,width,height,elasticity,verts,itemSize){
	this.x = x || 0;
	this.y = y || 0;
	this.width = width || 0;
	this.height = height || 0;
	this.pwidth = width || 0;
	this.pheight = height || 0;
	this.elasticity = elasticity || 0;
	this.verts = verts;
	this.itemSize = itemSize;
	this.vel = {0:0,1:0,length:2};
	this.accel = {0:0,1:0,length:2};
}
PolygonCollider.prototype = fillProperties(new BasicCollider(),
{
	// fineCheck: function(x1,y1,x2,y2){
		// return Collisions.polygonLine(x1,y1,x2,y2,this.verts,this.itemSize);
	// },
	// fineRayCheck: function(x1,y1,x2,y2){
		// return Collisions.polygonRay(x1,y1,x2,y2,this.verts,this.itemSize);
	// },
	// adjust: function(collidingLines,lines,getLineType){
		// for(var i = 0; i<collidingLines.length; i++){
			// var verts = this.verts;
			// var dist=0;
			// var x1 = lines[collidingLines[i]],y1 = lines[collidingLines[i]+1],
				// x2 = lines[collidingLines[i]+2], y2 = lines[collidingLines[i]+3];
			
			// switch(getLineType(collidingLines[i])){
				// case 0://right
					// if(this.vel[0]>0){
						// for(var i = 0; i<verts; i+=this.itemSize){
							// if(verts[i]>x1 && verts[i+1]>=y1 && verts[i+1]<=y2 && dist<verts[i]-x1){
								// dist = verts[i]-x1;
							// }
						// }
						
						
						
					// }
					// break;
				// case 1://left
					// break;
				// case 2://down
					// break;
				// case 3://up
					// break;
			// }
		// }
	// },
	collision: function(x,y,width,height){
		var obj;
		if(typeof x == 'object'){
			obj = x;
			x = obj.x;
			y = obj.y;
			width = obj.width;
			height = obj.height;
		}
		if(Collisions.boxBox(x,y,width,height,this.x,this.y,this.width,this.height)){
			if(obj && obj.isCircle){
					return Collisions.circlePolygon(x+width/2,y+height/2,width/2,this.verts,this.itemSize);
			}else if(obj && obj.verts && obj.itemSize){
				return Collisions.polygonPolygon(obj.verts,obj.itemSize,this.verts,this.itemSize)
			}else{
				return Collisions.polygonBox(x,y,width,height,this.verts,this.itemSize);
			}
		}
		return false;
	}
})