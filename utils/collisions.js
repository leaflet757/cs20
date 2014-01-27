//this script provides a library of functions for collision checking
var collisions ={
	epsilon: 0.000001,
	limit: 1000,
	boxBox: function(boxA,boxB){
		return ((boxA.x+boxA.width > boxB.x) && (boxA.x < boxB.x+boxB.width) 
				&& (boxA.y+boxA.height > boxB.y) && (boxA.y < boxB.y+boxB.height));
	},
	circleCircle: function(circleA,circleB){
		return (pointDistance(circleA.center,circleB.center)>(circleA.radius+circleB.radius));
	},
	lineLine: function(lineA,lineB){//returns the point the lines intersect at or nothing if there is no intersection
		if(typeof lineA== 'undefined' || typeof lineB=='undefined'){
			console.trace();
		}
		var a = (lineB.pointB.y-lineB.pointA.y),
			b = (lineA.pointB.x-lineA.pointA.x),
			c = (lineB.pointB.x-lineB.pointA.x),
			d = (lineA.pointB.y-lineA.pointA.y),
			det = (a*b)-(c*d);
		if(comp(det,0,collisions.epsilon)){
			return false;
		}else{
			var ua = ((c*(lineA.pointA.y-lineB.pointA.y))-(a*(lineA.pointA.x-lineB.pointA.x)))/det,
				ub = (((lineA.pointB.x-lineA.pointA.x)*(lineA.pointA.y-lineB.pointA.y))-
					(d*(lineA.pointA.x-lineB.pointA.x)))/det;
			if((ua<0) || (ua>1) || (ub<0) || (ub>1)){
				return false;
			}else{
				return new Point(lineA.pointA.x+ua*(lineA.pointB.x-lineA.pointA.x),lineA.pointA.y+ua*(lineA.pointB.y-lineA.pointA.y));
			}
		}
	},
	circleBox: function(circle,box){
		if(collisions.pointInBox(box,circle.center)){
			return true;
		}else{
			var p=0;
			for(var i in box.lines){
				if(collisions.circleLine(circle,box.lines[i]).constructor==Line){
					return true;
				}
			}
			for(var i in box.vertices){
				if(collisions.pointInCircle(circle,box.vertices[i])){
					return true;
				}
			}
		}
		return false;
	},
	//returns the point or line segment that intersects the circle or false if there is no intersection
	circleLine: function(circle,line){
		if(typeof line == 'undefined'){
			console.trace();
			new Error('line undefined');
		}
		var p1 = new Point(line.pointA.x-circle.center.x,line.pointA.y-circle.center.y), 
		    p2 = new Point(line.pointB.x-circle.center.x,line.pointB.y-circle.center.y),
			pDif = new Point(p2.x-p1.x,p2.y-p1.y),
			a = (pDif.x*pDif.x)+(pDif.y*pDif.y),
			b = 2 * ((pDif.x * p1.x) + (pDif.y*p1.y));
			c = (p1.x*p1.x) + (p1.y*p1.y) - (circle.radius*circle.radius),
			delta = b*b-(4*a*c);
			// console.log(delta+' '+a+' '+b+' '+c)
			if(delta<0){
				return false;
			}else if(delta<collisions.epsilon){
				var p;
				//console.log("point");
				var u = -b/(2*a);
				p = new Point(line.pointA.x+(pDif.x*u),line.pointA.y+(pDif.y*u));
				if(collisions.pointOnLine(line,p)){
					return p;
				}else{
					return false;
				}
			}else{ 
				var u1,u2,pf1,pf2;
				//console.log("line");
				u1 = (-b + Math.sqrt(delta))/(2 * a);
				u2 = (-b - Math.sqrt(delta))/(2 * a);
				// console.log(u1+' '+u2)
				pf1=new Point(line.pointA.x+(pDif.x*u1),line.pointA.y+(pDif.y*u1));
				pf2=new Point(line.pointA.x+(pDif.x*u2),line.pointA.y+(pDif.y*u2));
				//console.log(pf1);
				if(collisions.pointOnLine(line,pf1)&&collisions.pointOnLine(line,pf2)){
					return new Line(pf1,pf2);
				}else if(collisions.pointOnLine(line,pf1)){
					return pf1;
				}else if(collisions.pointOnLine(line,pf2)){
					return pf2
				}else{
					return false;
				}
			}
	},
	boxLine: function(box,line){
		var p1, p2;
		for(var i in box.lines){
			collisions.lineLine(box.lines[i],line);
		}
	},
	moveToVec: {},
	//calls moveToContactBoxBox and then checks every 
	//step for collison, stopping and moving back one 
	//when it occurs
	moveToContactGeneric: function(entityA,entityB,check,limit,direction,step){	
		//set default values for optional arguments
		if(typeof check != 'function') check = checkCollision;
		if(typeof direction != 'number') direction = Vector2d.getDir(entityA.velocity);
		if(typeof step != 'number') step=1;
		if(typeof limit!='number' || limit<0) limit=collisions.limit+1;
		
		//quick fail
		if(!!check(entityA,entityB)) return;
		
		var back=false;
		this.moveToVec[0] = step*Math.cos(direction);
		this.moveToVec[1] = step*Math.sin(direction);
		
		for(var i=0;!check(entityA,entityB) && i<limit;i++){
			if(i>collisions.limit){
				throw new Error("collision movement limit exceeded");
			}
			back=true;
			entityA.x+=this.moveToVec[0];
			entityA.y+=this.moveToVec[1];
		}
		if(back){
			entityA.x-=this.moveToVec[0];
			entityA.y-=this.moveToVec[1];
		}
	
	},
	//moves along line specified until entity is no longer colliding
	moveOutsideGeneric: function(entityA,entityB,check,limit,direction,step){
		if(typeof check != 'function') check = checkCollision;
		if(typeof direction != 'number') direction = (Vector2d.getDir(entityA.velocity)+Math.PI)%(Math.PI*2);
		if(typeof step != 'number') step=1;
		if(typeof limit != 'number' || limit<=0) limit=collisions.limit+1;
		
		//quick fail
		if(!check(entityA,entityB)) return;
		
		var back=false;
		this.moveToVec[0] = step*Math.cos(direction);
		this.moveToVec[1] = step*Math.sin(direction);
		// collisions.moveOutsideBoxBox(entityA,entityB,direction); // can cause issues
		for(var i=0;!!check(entityA,entityB) && i<limit;i++){
			if(i>collisions.limit){
				throw new Error("collision movement limit exceeded");
			}
			entityA.x+=this.moveToVec[0];
			entityA.y+=this.moveToVec[1];
		}
		
	},
	//moves boxA along the give angle so that it is touching boxB
	//if the path does not intersect the second square the first is 
	//moved to the point along the direction specified to where it would have collided
	moveToContactBoxBox: function(boxA,boxB,direction){
		if(collisions.boxBox(boxA,boxB)){
			return 0;
		}
		var theta,quad,xdis,ydis;
		angle = direction%360;
		quad = Math.floor(angle/90);
		theta = angle%90;
		if(theta<collisions.epsilon){
			switch(quad){
				case 0:
					xdis=boxB.x-(boxA.x+boxA.width);
					ydis=0;
					break;
				case 1:
					xdis=0;
					ydis=boxB.y-(boxA.y+boxA.width);
					break;
				case 2:
					xdis=(boxB.x+boxB.width)-boxA.x;
					ydis=0;
					break;
				case 3:
					xdis=0;
					ydis=(boxB.y+boxB.height)-boxA.y;
					break;
			}
		}else{
			switch(quad){
				case 0:
					if(theta<45){
						ydis = boxB.y-(boxA.y+boxA.height);
						xdis = ydis/Math.tan(toRadians(direction))
					}else{
						xdis = boxB.x-(boxA.x+boxA.width);
						ydis = xdis*Math.tan(toRadians(direction));
					}
					break;
				case 1:
					if(theta<45){
						xdis = -(boxA.x-(boxB.x+boxB.width));
						ydis = xdis*Math.tan(toRadians(direction))
					}else{
						ydis = boxB.y-(boxA.y+boxA.height);
						xdis = ydis/Math.tan(toRadians(direction))
					}
					break;
				case 2:
					if(theta>45){
						xdis = ((boxB.x+boxB.width)-boxA.y);
						ydis = xdis*Math.tan(toRadians(direction))
					}else{
						ydis=(boxB.y+boxB.height)-boxA.y;
						xdis=ydis/Math.tan(toRadians(direction))
					}
					break;
				case 3:
					if(theta>45){
						ydis=(boxB.y+boxB.height)-boxA.y;
						xdis=ydis/Math.tan(toRadians(direction));
					}else{
						xdis=boxB.x-(boxA.x+boxA.width);
						ydis=xdis*Math.tan(toRadians(direction));
					}	
					break;
			}
		}
		//console.log(quad+" "+theta+" "+xdis+" "+ydis+" "+direction+" ");
		boxA.x+=xdis;
		boxA.y+=ydis;
	},
	moveOutsideBoxBox: function(boxA,boxB,direction){
		var theta,quad,xdis,ydis;
		angle = direction%360;
		quad = Math.floor(angle/90);
		theta = angle%90;
		if(theta<collisions.epsilon){
			switch(quad){
				case 0:
					xdis=-(boxB.x-(boxA.x+boxA.width));
					ydis=0;
					break;
				case 1:
					xdis=0;
					ydis=-(boxB.y-(boxA.y+boxA.width));
					break;
				case 2:
					xdis=-((boxB.x+boxB.width)-boxA.x);
					ydis=0;
					break;
				case 3:
					xdis=0;
					ydis=-((boxB.y+boxB.height)-boxA.y);
					break;
			}
		}else{
			switch(quad){
				case 0:
					if(theta>45){
						ydis = (boxB.y+boxB.height)-boxA.y;
						xdis = ydis/Math.tan(toRadians(direction))
					}else{
						xdis = (boxB.x+boxB.width)-boxA.x;
						ydis = xdis*Math.tan(toRadians(direction));
					}
					break;
				case 1:
					if(theta>45){
						xdis = boxB.x-(boxA.x+boxA.width);
						ydis = xdis*Math.tan(toRadians(direction))
					}else{
						ydis = (boxB.y+boxB.height)-boxA.y;
						xdis = ydis/Math.tan(toRadians(direction))
					}
					break;
				case 2:
					if(theta<45){
						xdis = boxB.x-(boxA.x+boxA.width);
						ydis = xdis*Math.tan(toRadians(direction))
					}else{
						ydis=boxB.y-(boxA.y+boxA.height);
						xdis=ydis/Math.tan(toRadians(direction))
					}
					break;
				case 3:
					if(theta<45){
						ydis=boxB.y-(boxA.y+boxA.height);
						xdis=ydis/Math.tan(toRadians(direction));
					}else{
						xdis=(boxB.x+boxB.width)-boxA.x;
						ydis=xdis*Math.tan(toRadians(direction));
					}	
					break;
			}
		}
		//console.log(quad+" "+theta+" "+xdis+" "+ydis+" "+direction+" ");
		boxA.x+=xdis;
		boxA.y+=ydis;
	},
	pointInBox: function(box,point){
		return ((point.x>box.x) && (point.x<(box.x+box.width)) && (point.y>box.y) && (point.y<box.y+box.height));	
	},
	pointInCircle: function(circle,point){
		return (pointDistance(circle.center,point)<circle.radius);
	},
	pointOnLine: function(line,point){
		if(line.pointA.x==line.pointB.x){
			return ((point.x-line.pointA.x)<collisions.epsilon && (point.x-line.pointA.x)>(-collisions.epsilon) 
					&& point.y>Math.min(line.pointA.y,line.pointB.y) && point.y<Math.max(line.pointA.y,line.pointB.y));  
		}else if(line.pointA.y==line.pointB.y){
			return ((point.y-line.pointA.y)<collisions.epsilon && (point.y-line.pointA.y)>(-collisions.epsilon) 
					&& point.x>Math.min(line.pointA.x,line.pointB.x) && point.x<Math.max(line.pointA.x,line.pointB.x));  
		}else{
			var ux = ((point.x-line.pointA.x)/(line.pointB.x-line.pointA.x)),
				uy = ((point.y-line.pointA.y)/(line.pointB.y-line.pointA.y)),
				det = (ux-uy);
			if(det<collisions.epsilon && det>(-collisions.epsilon)){
				return (ux>0 && ux<1 && uy>0 && uy<1);
			}else{
				return false;
			}
		}
	},
	pointInPolygon: function(polygon,x,y){//ray test
		var point;
		if(x instanceof Point){
			point = x;
		}else{
			if(typeof x != 'number' || typeof y!= 'number'){
				throw new Error('pointInPolygon: invalid type for point');
			}
			point = new Point(x,y);
		}
		if(!(polygon instanceof Polygon)){
			console.trace();
			throw new Error("pointInPolygon: invalid type for polygon");
		}
		var ray = new Ray(point,new Point(point.x+1,point.y)),
			n = 0;
		for(var o in polygon.edges){
			if(collisions.lineRay(polygon.edges[o],ray)){
				n++;
			}
		}
		return ((n%2)!=0);
	},
	rayRay: function(lineA,lineB){
		if(typeof lineA== 'undefined' || typeof lineB=='undefined'){
			console.trace();
		}
		var a = (lineB.pointB.y-lineB.pointA.y),
			b = (lineA.pointB.x-lineA.pointA.x),
			c = (lineB.pointB.x-lineB.pointA.x),
			d = (lineA.pointB.y-lineA.pointA.y),
			det = (a*b)-(c*d);
		if(comp(det,0,collisions.epsilon)){
			return false;
		}else{
			var ua = ((c*(lineA.pointA.y-lineB.pointA.y))-
					(a*(lineA.pointA.x-lineB.pointA.x)))/det,
				ub = (((lineA.pointB.x-lineA.pointA.x)*(lineA.pointA.y-lineB.pointA.y))-
					(d*(lineA.pointA.x-lineB.pointA.x)))/det;
			if((ua<0) || (ub<0)){
				return false;
			}else{
				return new Point(lineA.pointA.x+ua*(lineA.pointB.x-lineA.pointA.x),lineA.pointA.y+ua*(lineA.pointB.y-lineA.pointA.y));
			}
		}
	},
	lineRay: function(line,ray){
		var p = collisions.rayRay(line,ray);
		if(p != false){
			if(collisions.pointOnLine(line,p)){
				return p;
			}else{
				return false;
			}
		}else{
			return p;
		}
	},
	getCriticalValues: function(lineA,lineB){//used for line checks
		var val = {det: 0,ua: 0, ub: 0};
		var a = (lineB.pointB.y-lineB.pointA.y),
			b = (lineA.pointB.x-lineA.pointA.x),
			c = (lineB.pointB.x-lineB.pointA.x),
			d = (lineA.pointB.y-lineA.pointA.y);
		val.det = (a*b)-(c*d);
		if(det!=0){
			val.ua = ((c*(lineA.pointA.y-lineB.pointA.y))-
				(a*(lineA.pointA.x-lineB.pointA.x)))/det;
			val.ub = (((lineA.pointB.x-lineA.pointA.x)*(lineA.pointA.y-lineB.pointA.y))-
					(d*(lineA.pointA.x-lineB.pointA.x)))/det;
		}
		return val;
	},
	lineIntersect: function(lineA,lineB){//not line segments
		var a = (lineB.pointB.y-lineB.pointA.y),
			b = (lineA.pointB.x-lineA.pointA.x),
			c = (lineB.pointB.x-lineB.pointA.x),
			d = (lineA.pointB.y-lineA.pointA.y),
			det = (a*b)-(c*d);
		if(det<collisions.epsilon && det>=0){
			return false;
		}else{
			var ua = ((c*(lineA.pointA.y-lineB.pointA.y))-
					(a*(lineA.pointA.x-lineB.pointA.x)))/det,
				ub = (((lineA.pointB.x-lineA.pointA.x)*(lineA.pointA.y-lineB.pointA.y))-
					(d*(lineA.pointA.x-lineB.pointA.x)))/det;
			return new Point(lineA.pointA.x+ua*(lineA.pointB.x-lineA.pointA.x),lineA.pointA.y+ua*(lineA.pointB.y-lineA.pointA.y));
		}
	},
	circlePolygon: function(circle,polygon){
		return collisionsLowGb.circlePolygon(circle.x,circle.y,circle.radius,polygon);
		// if(!(circle instanceof Circle)){
			// err("collisions.circlePolygon: circle is not valid")
		// }
		// if(!(polygon instanceof Polygon)){
			// err("collisions.circlePolygon: polygon is not valid")
		// }
		// if(collisions.pointInPolygon(polygon,circle.center)){
			// return true;
		// }
		// for(o in polygon.edges){
			// if(collisions.circleLine(circle,polygon.edges[o])!=false){
				// return true;
			// }
		// }
		// return false;
	}
};

//low garbage function set
//::::::
//needs testing
//::::::
var collisionsLowGb = {
	epsilon: 0.000001,
	limit: 1000,
	lineRes: {//results for line line calculations
		ua:0,
		ub:0,
		denom: 0,
		point: false,
		getRes: function(xa1,ya1,xa2,ya2,xb1,yb1,xb2,yb2){
			if(this.point===false){this.point = new Point(0,0)}
			this.denom = (((yb2-yb1)*(xa2-xa1))-((xb2-xb1)*(ya2-ya1)));
			if(!collisionsLowGb.comp(this.denom,0)){
				this.ua = 	(((xb2-xb1)*(ya1-yb1))-
							((yb2-yb1)*(xa1-xb1)))/this.denom;
				this.ub = 	(((xa2-xa1)*(ya1-yb1))-
							((ya2-ya1)*(xa1-xb1)))/this.denom;
				this.point.x= xa1+this.ua*(xa2-xa1);
				this.point.y= ya1+this.ua*(ya2-ya1);
			}else{
				this.ua = 0;
				this.ub = 0;
				this.point.x=0;
				this.point.y=0;
			}
		}
	},
	circLineRes: {//results and variables for circle line calculations
		p1: {},
		p2: {},
		pdif: {},
		delta: 0,
		u1: 0,
		u2: 0,
		getRes: function(xc,yc,radius,xa,ya,xb,yb){
			// if(this.p1===false){this.p1 = new Point(0,0)}
			// if(this.p2===false){this.p2 = new Point(0,0)}
			// if(this.pdif===false){this.pdif = new Point(0,0)}
			
			this.p1.x = xa-xc;
			this.p1.y = ya-yc;
			this.p2.x = xb-xc; 
			this.p2.y = yb-yc;
			this.pdif.x = this.p2.x-this.p1.x;
			this.pdif.y = this.p2.y-this.p1.y;
			
			var a = (this.pdif.x*this.pdif.x)+(this.pdif.y*this.pdif.y),
				b = 2 * ((this.pdif.x*this.p1.x)+(this.pdif.y*this.p1.y)),
				c = (this.p1.x*this.p1.x) + (this.p1.y*this.p1.y) - (radius*radius);
			this.delta = (b*b) - (4*a*c);
			
			//console.log(this.delta+' '+a+' '+b+' '+c)
			if(this.delta>=0){
				if(this.delta<this.epsilon){
					this.u1 = -b/(2*a);
				}else{
					this.u1 = (-b + Math.sqrt(this.delta))/(2*a),
					this.u2 = (-b - Math.sqrt(this.delta))/(2*a);
					// console.log(this.u1+' '+this.u2)
				}
			}
		}
	},
	comp: function(a,b){//test if a is equal to b within epsilon
		a = a-b;
		return ((-collisionsLowGb.epsilon<a) && (collisionsLowGb.epsilon>a));
	},
	boxBox: function(x1,y1,width1,height1,x2,y2,width2,height2){
		if(typeof x1 == 'object' && typeof y1 == 'object'){
			var e1 = x1,
				e2 = y1;
			x1 = e1.xAbs || e1.x;
			y1 = e1.yAbs || e1.y;
			width1 = e1.width;
			height1 = e1.height;
			x2 = e2.xAbs || e2.x;
			y2 = e2.yAbs || e2.y;
			width2 = e2.width;
			height2 = e2.height;
		}else{
			for(var i = 0; i<arguments.length; i++){
				if(typeof arguments[i] != 'number'){
					console.trace();
					throw new Error('collisionsLowGb.boxBox: invalid argument type: '+typeof arguments[i])
				}
			}
			if(arguments.length!=8){
				console.trace();
				throw new Error('collisionsLowGb.boxBox: wrong number of arguments')
			}
		}
		return ((x1+width1>x2) && (x1<x2+width2) && (y1+height1>y2) && (y1<y2+height2));
	},
	circleCircle: function(x1,y1,radius1,x2,y2,radius2){
		return (pointDistanceLowGb(x1,y1,x2,y2)<(radius1+radius2));
	},
	//can return a point of intersect or set the x and y of 
	//a passed point to the point of intersect
	lineLine: function(xa1,ya1,xa2,ya2,xb1,yb1,xb2,yb2,point){
		this.lineRes.getRes(xa1,ya1,xa2,ya2,xb1,yb1,xb2,yb2);
		if(this.comp(this.lineRes.denom,0)){
			return false;
		}else if((this.lineRes.ua<0) || (this.lineRes.ua>1) || (this.lineRes.ub<0) || (this.lineRes.ub>1)){
			return false;
		}else{
			if(point instanceof Point){
				point.x = this.lineRes.point.x;
				point.y = this.lineRes.point.y;
				return point;
			}else{
				return this.lineRes.point; //values of object will change
			}
		}
	},
	lineRay: function(xa1,ya1,xa2,ya2,xb1,yb1,xb2,yb2,point){
		this.lineRes.getRes(xa1,ya1,xa2,ya2,xb1,yb1,xb2,yb2);
		if(this.comp(this.lineRes.denom,0)){
			return false;
		}else if((this.lineRes.ua<0) || (this.lineRes.ub<0)){
			//console.log(this.lineRes.ua+' '+this.lineRes.ub)
			return false;
		}else{
			if(this.pointOnLine(this.lineRes.point.x,this.lineRes.point.y,xa1,ya1,xa2,ya2)){
				if(point instanceof Point){
					point.x = this.lineRes.point.x;
					point.y = this.lineRes.point.y;
				}else{
					return this.lineRes.point; //values of object will change
				}
			}else{
				return false;
			}
		}
	},
	rayRay: function(xa1,ya1,xa2,ya2,xb1,yb1,xb2,yb2,point){
		this.lineRes.getRes(xa1,ya1,xa2,ya2,xb1,yb1,xb2,yb2);
		if(this.comp(this.lineRes.denom,0)){
			return false;
		}else if((this.lineRes.ua<0) || (this.lineRes.ub<0)){
			return false;
		}else{
			if(point instanceof Point){
				point.x = this.lineRes.point.x;
				point.y = this.lineRes.point.y;
			}else{
				return this.lineRes.point; //values of object will change
			}
		}
	},
	lineIntersect: function(xa1,ya1,xa2,ya2,xb1,yb1,xb2,yb2,point){
		if(typeof xa1 == 'object' && typeof ya1 == 'object'){
			var lna = xa1, lnb= ya1;
			xa1 = lna.pointA.x;
			ya1 = lna.pointA.y;
			xa2 = lna.pointB.x;
			ya2 = lna.pointB.y;
			xb1 = lnb.pointA.x;
			yb1 = lnb.pointA.y;
			xb2 = lnb.pointB.x;
			yb2 = lnb.pointB.y;
			if(xa2 instanceof Point){
				point = xa2;
			}
		}
		this.lineRes.getRes(xa1,ya1,xa2,ya2,xb1,yb1,xb2,yb2);
		if(this.comp(this.lineRes.denom,0)){
			return false;
		}else{
			if(typeof point == 'object'){
				point.x = this.lineRes.point.x;
				point.y = this.lineRes.point.y;
				return point;
			}else{
				return this.lineRes.point; //values of object will change
			}
		}
	},
	circleLine: function(xc,yc,radius,xa,ya,xb,yb){
		if(typeof xc == 'object' && typeof yc == 'object'){
			var obj1 = xc,
				obj2 = yc;
			xc = obj1.x;
			yc = obj1.y;
			radius = obj1.radius;
			xa = obj2.pointA.x;
			ya = obj2.pointA.y;
			xb = obj2.pointB.x;
			yb = obj2.pointB.y;
		}else{
			for(var i = 0; i<arguments.length; i++){
				if(typeof arguments[i] != 'number'){
					console.trace();
					throw new Error('collisionsLowGb.boxBox: invalid argument type: '+typeof arguments[i])
				}
			}
			if(arguments.length!=7){
				console.trace();
				throw new Error('collisionsLowGb.boxBox: wrong number of arguments')
			}
		}
		this.circLineRes.getRes(xc,yc,radius,xa,ya,xb,yb);
		if(this.circLineRes.delta<0){
			return false;
		}else if(this.circLineRes.delta<this.epsilon){
			return (this.u1>=0 && this.u1<=1)
		}else{
			return !((this.circLineRes.u1<0) || (this.circLineRes.u1>1)) ||
			!((this.circLineRes.u2<0) || (this.circLineRes.u2>1))
		}
	},
	circleBox: function(xc,yc,radius,xb,yb,width,height){
		if(this.pointInBox(xc,yc,xb,yb,width,height)){
			return true;
		}else{
			var p=0;
			if(this.circleLine(xc,yc,radius,xb,yb,xb+width,yb)){return true}
			if(this.circleLine(xc,yc,radius,xb+width,yb,xb+width,yb+height)){return true}
			if(this.circleLine(xc,yc,radius,xb+width,yb+height,xb,yb+height)){return true}
			if(this.circleLine(xc,yc,radius,xb,yb,xb,yb+height)){return true}
		}
		return false;
	},
	pointInCircle: function(x,y,xc,xy,radius){
		if(typeof x == 'object' && typeof y == 'object'){
			var circle = x,
				point = y;
			x = point.x;
			y = point.y;
			xc = circle.x;
			xy = circle.y;
			radius = circle.radius;
		}
		return pointDistanceLowGb(xc,xy,x,y)<radius;
	},
	pointInBox: function(x,y,xb,yb,width,height){
		return (x>xb) && (x<xb+width) && (y>yb) && (y<yb+height);
	},
	boxLine: function(x,y,width,height,xa,ya,xb,yb){
		if(this.lineLine(xa,ya,xb,yb,x,y,x+width,y)){return true}
		if(this.lineLine(xa,ya,xb,yb,x+width,y,x+width,y+height)){return true}
		if(this.lineLine(xa,ya,xb,yb,x+width,y+height,x,y+height)){return true}
		if(this.lineLine(xa,ya,xb,yb,x,y,x,y+height)){return true}
		return false;
	},
	pointOnLine: function(x,y,ax,ay,bx,by){
		if(ax==bx){
			return (this.comp(x,ax) && y>(Math.min(ay,by)) && y<Math.max(ay,by));
		}else if(ay==by){
			return (this.comp(y,ay) && x>(Math.min(ax,bx)) && y<Math.max(ax,bx));
		}else{
			var ux = ((x-ax)/(bx-ax)),
				uy = ((y-ay)/(by-ay));
			if(this.comp(ux,uy)){
				return (ux>0 && ux<1 && uy>0 && uy<1);
			}
			return false;
		}
	},
	pointInPolygon: function(x,y,polygon){//needs polygon object //raytrace test
		var c = 0,l;
		for(var o in polygon.edges){
			var l = polygon.edges[o];
			if(!!this.lineRay(l.pointA.x,l.pointA.y,l.pointB.x,l.pointB.y,x,y,x+1,y)){
				c++;
			}
		}
		if(c==0){//suspicious case
			for(var o in polygon.edges){
				var l = polygon.edges[o];
				if(!!this.lineRay(l.pointA.x,l.pointA.y,l.pointB.x,l.pointB.y,x,y,x,y+1)){
					c++;
				}
			}
		}
		return ((c%2)!=0);
	},
	circlePolygon: function(x,y,radius,polygon){
		if(this.pointInPolygon(x,y,polygon)){
			return true;
		}
		// for(var o in polygon.vertices){
			// if(this.pointInCircle(x,y,radius,polygon.vertices[o].x,
				// polygon.vertices[o].y)!=false){
				// return true;
			// }
		// }
		for(var o in polygon.edges){
			var l = polygon.edges[o];
			if(this.boxBox(x-radius,y-radius,radius*2,radius*2,l.x,l.y,l.width,l.height)){//quick check
				if(this.circleLine(x,y,radius,l.pointA.x,l.pointA.y,l.pointB.x,l.pointB.y)!=false){
					return true;
				}
			}
		}
		
		return false;
	}
}
//generic collision checking function
//should eventually return the angle of the collision
function checkCollision(entityA,entityB,x,y){
	var project = false, ex, ey, result;
	if(typeof x == 'number' && typeof y == 'number'){
		ex = entityA.x;
		ey = entityA.y;
		entityA.x = x;
		entityA.y = y;
		project=true
	}
	if(entityA.shape == "line"){
		if(entityB.shape == "box"){
			result = collisions.boxLine(entityB.box,entityA.line)
		}else if(entityB.shape == "circle"){
			result = collision.circleLine(entityB.circle,entityA.line);
		}else{
			result = collision.lineLine(entityB.line,entityA.line);
		}
	}else if(entityA.shape == "circle"){
		if(entityB.shape == "box"){
			result = collisions.circleBox(entityA.circle,entityB.box);
		}else if(entityB.shape == "circle"){
			result = collisions.circleCircle(entityA.circle,entityB.circle);
		}else{
			result = collisions.circleLine(entityA.circle,entityB.line)
		}
	}else if(entityB.shape == "box"){
		if(entityB.shape == "box"){
			result=collisions.boxBox(entityA.box,entityB.box);
		}else if(entityB.shape == "circle"){
			result=collisions.circleBox(entityB.circle,entityA.box);
		}else{
			result = boxLine(entityA.box,entityB.line);
		}
	}
	if(project){
		entityA.x=ex;
		entityA.y=ey;
	}
	return result;
}

