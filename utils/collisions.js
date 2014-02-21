

//low garbage function set
//::::::
//needs testing
//::::::
var Collisions = {
	epsilon: 0.000001,
	limit: 1000,
	lineRes: {//results for line line calculations
		ua:0,
		ub:0,
		denom: 0,
		point: {0:0,1:0,length:2},
		getRes: function(xa1,ya1,xa2,ya2,xb1,yb1,xb2,yb2){
			this.denom = (((yb2-yb1)*(xa2-xa1))-((xb2-xb1)*(ya2-ya1)));
			if(!Collisions.comp(this.denom,0)){
				this.ua = 	(((xb2-xb1)*(ya1-yb1))-
							((yb2-yb1)*(xa1-xb1)))/this.denom;
				this.ub = 	(((xa2-xa1)*(ya1-yb1))-
							((ya2-ya1)*(xa1-xb1)))/this.denom;
				this.point[0]= xa1+this.ua*(xa2-xa1);
				this.point[1]= ya1+this.ua*(ya2-ya1);
			}else{
				this.ua = 0;
				this.ub = 0;
				this.point[0]=0;
				this.point[1]=0;
			}
		}
	},
	circLineRes: {//results and variables for circle line calculations
		p1: {0:0,1:0,length:2},
		p2: {0:0,1:0,length:2},
		pdif: {},
		delta: 0,
		u1: 0,
		u2: 0,
		getRes: function(xc,yc,radius,xa,ya,xb,yb){
			this.p1[0] = xa-xc;
			this.p1[1] = ya-yc;
			this.p2[0] = xb-xc; 
			this.p2[1] = yb-yc;
			this.pdif[0] = this.p2[0]-this.p1[0];
			this.pdif[1] = this.p2[1]-this.p1[1];
			
			var a = (this.pdif[0]*this.pdif[0])+(this.pdif[1]*this.pdif[1]),
				b = 2 * ((this.pdif[0]*this.p1[0])+(this.pdif[1]*this.p1[1])),
				c = (this.p1[0]*this.p1[0]) + (this.p1[1]*this.p1[1]) - (radius*radius);
			this.delta = (b*b) - (4*a*c);
			
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
		return ((-this.epsilon<a) && (this.epsilon>a));
	},
	pointDist: function(x1,y1,x2,y2){
		return Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
	},
	boxBox: function(x1,y1,width1,height1,x2,y2,width2,height2){
		return ((x1+width1>x2) && (x1<x2+width2) && (y1+height1>y2) && (y1<y2+height2));
	},
	pointInBox: function(px,py,x,y,width,height){
		return px>x && px<x+width && py>y && py<y+height;
	},
	circleCircle: function(x1,y1,radius1,x2,y2,radius2){
		return (this.pointDistance(x1,y1,x2,y2)<(radius1+radius2));
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
			if(point){
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
		}else if((this.lineRes.ua<0) || (this.lineRes.ua>1) || (this.lineRes.ub<0)){
			// console.log(this.lineRes.ua+' '+this.lineRes.ub)
			return false;
		}else{
			if(point){
				point[0] = this.lineRes.point[0];
				point[1] = this.lineRes.point[1];
				return point;
			}else{
				return this.lineRes.point; //values of object will change
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
			if(this.pointInCircle(xb,yb,xc,yc,radius)) return true;
			if(this.pointInCircle(xb+width,yb,xc,yc,radius)) return true;
			if(this.pointInCircle(xb+width,yb+height,xc,yc,radius)) return true;
			if(this.pointInCircle(xb,yb+height,xc,yc,radius)) return true;
			if(this.circleLine(xc,yc,radius,xb,yb,xb+width,yb)){return true}
			if(this.circleLine(xc,yc,radius,xb+width,yb,xb+width,yb+height)){return true}
			if(this.circleLine(xc,yc,radius,xb+width,yb+height,xb,yb+height)){return true}
			if(this.circleLine(xc,yc,radius,xb,yb+height,xb,yb)){return true}
		}
		return false;
	},
	pointInCircle: function(x,y,xc,xy,radius){
		return this.pointDist(xc,xy,x,y)<radius;
	},
	pointInBox: function(x,y,xb,yb,width,height){
		return (x>xb) && (x<xb+width) && (y>yb) && (y<yb+height);
	},
	valPointOnLine: function(x,y,x1,y1,x2,y2){
		return ((y2-y1)*x) + ((x1-x2)*y) + ((x2*y1) - (x1*y2));
	},
	boxLine: function(x,y,width,height,xa,ya,xb,yb){
		var val = this.valPointOnLine(x,y,xa,ya,xb,yb);
		if(this.comp(val,0)){
			return true;
		}else if(val<0){
			if(	this.valPointOnLine(x+width,y,xa,ya,xb,yb)<0 			&& 
				this.valPointOnLine(x+width,y+height,xa,ya,xb,yb)<0 	&&
				this.valPointOnLine(x,y+height,xa,ya,xb,yb)<0
					){
				return false
			}
		}else{
			if(	this.valPointOnLine(x+width,y,xa,ya,xb,yb)>0 			&& 
				this.valPointOnLine(x+width,y+height,xa,ya,xb,yb)>0 	&&
				this.valPointOnLine(x,y+height,xa,ya,xb,yb)>0
					){
				return false;
			}
		}
		if(!(
				(xa>x+width  && xb>x+width) 	||
				(xa<x        && xb<x)			||
				(ya>y+height && yb>y+height)	||
				(ya<y        && yb<y)			
					)){
			return true;
		}
		return false;
		// return 	(this.pointInBox(xa,ya,x,y,width,height))					||
				// (this.pointInBox(xa,ya,x,y,width,height)) 					||
				// (this.lineLine(xa,ya,xb,yb,x,y,x+width,y))  				||
				// (this.lineLine(xa,ya,xb,yb,x+width,y,x+width,y+height)) 	||
				// (this.lineLine(xa,ya,xb,yb,x+width,y+height,x,y+height)) 	||
				// (this.lineLine(xa,ya,xb,yb,x,y,x,y+height)); 
	},
	boxRay: function(x,y,width,height,xa,ya,xb,yb){
		var val = this.valPointOnLine(x,y,xa,ya,xb,yb);
		if(this.comp(val,0)){
			return true;
		}else if(val<0){
			if(	this.valPointOnLine(x+width,y,xa,ya,xb,yb)<0 			&& 
				this.valPointOnLine(x+width,y+height,xa,ya,xb,yb)<0 	&&
				this.valPointOnLine(x,y+height,xa,ya,xb,yb)<0
					){
				return false
			}
		}else{
			if(	this.valPointOnLine(x+width,y,xa,ya,xb,yb)>0 			&& 
				this.valPointOnLine(x+width,y+height,xa,ya,xb,yb)>0 	&&
				this.valPointOnLine(x,y+height,xa,ya,xb,yb)>0
					){
				return false;
			}
		}
		if(!(
				(xa>x+width  && xb>xa) 	||
				(xa<x        && xb<xa)			||
				(ya>y+height && yb>ya)	||
				(ya<y        && yb<ya)			
					)){
			return true;
		}
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
	pointInPolygon: function(x,y,verts,itemSize){//raytrace test
		var c = 0,l;
		if(this.lineRay(verts[0],verts[1],verts[verts.length-itemSize],verts[verts.length+1-itemSize],x,y,x+1,y)){
			c++;
		}
		for(var i =itemSize; i<verts.length; i+=itemSize){
			if(this.lineRay(verts[i-itemSize],verts[i+1-itemSize],verts[i],verts[i+1],x,y,x+1,y)){
				c++;
			}
		}
		return ((c%2)!=0);
	},
	circlePolygon: function(x,y,radius,verts,itemSize){
		if(this.pointInPolygon(x,y,verts,itemSize)){
			return true;
		}
		if(this.boxBox(x-radius,y-radius,radius*2,radius*2,verts[0],verts[1],Math.abs(verts[0]-verts[verts.length-itemSize]),Math.abs(verts[0]-verts[verts.length-itemSize]))){
			if(this.circleLine(x,y,radius,verts[0],verts[1],verts[vert.length-itemSize],verts[vert.length+1-itemSize])){
				return true;
			}
		}
		for(var i =itemSize; i<verts.length; i+=itemSize){
			var l = polygon.edges[o];
			if(this.boxBox(x-radius,y-radius,radius*2,radius*2,verts[i-itemSize],verts[i+1-itemSize],Math.abs(verts[i]-verts[i-itemSize]),Math.abs(verts[i+1]-verts[i+1-itemSize]))){//quick check
				if(this.circleLine(x,y,radius,verts[i-itemSize],verts[i+1-itemSize],verts[i],verts[i+1])){
					return true;
				}
			}
		}
		return false;
	},
	polygonLine: function(x1,y1,x2,y2,verts,itemSize){
		if(this.pointInPolygon(x1,y1,verts,itemSize) || this.pointInPolygon(x2,y2,verts,itemSize)){
			return true;
		}
		if(this.boxBox(Math.min(x1,x2),Math.min(y1,y2),Math.abs(x1-x2),Math.abs(y1-y2),
				Math.min(verts[0],verts[verts.length-itemSize]),Math.min(verts[0],verts[verts.length-itemSize]),
				Math.abs(verts[0]-verts[verts.length-itemSize]),Math.abs(verts[0]-verts[verts.length-itemSize]))){
			if(this.lineLine(x1,y1,x2,y2,verts[0],verts[1],verts[verts.length-itemSize],verts[verts.length+1-itemSize])){
				return true;
			}
		}
		
		for(var i =itemSize; i<verts.length; i+=itemSize){
			if(this.boxBox(Math.min(x1,x2),Math.min(y1,y2),Math.abs(x1-x2),Math.abs(y1-y2),
					Math.min(verts[i],verts[i-itemSize]),Math.min(verts[i+1],verts[i+1-itemSize]),
					Math.abs(verts[i]-verts[i-itemSize]),Math.abs(verts[i+1]-verts[i+1-itemSize]))){//quick check
				if(this.lineLine(x1,y1,x2,y2,verts[i-itemSize],verts[(i+1)-itemSize],verts[i],verts[i+1])){
					return true;
				}
			}
		}
		return false;
	},
	polygonRay: function(x1,y1,x2,y2,verts,itemSize){
		if(this.pointInPolygon(x1,y1,verts,itemSize)){
			return true;
		}
		if(this.lineRay(verts[0],verts[1],verts[verts.length-itemSize],verts[verts.length+1-itemSize],x1,y1,x2,y2)){
			return true;
		}
		for(var i =itemSize; i<verts.length; i+=itemSize){
			if(this.lineRay(verts[i-itemSize],verts[i+1-itemSize],verts[i],verts[i+1],x1,y1,x2,y2)){
				return true;
			}
		}
		return false;
	},
	polygonBox: function(x,y,width,height,verts,itemSize){
		if(this.polygonLine(x,y,x+width,y,verts,itemSize)) return true;
		if(this.polygonLine(x+width,y,x+width,y+height,verts,itemSize)) return true;
		if(this.polygonLine(x+width,y+height,x,y+height,verts,itemSize)) return true;
		if(this.polygonLine(x,y+height,x,y,verts,itemSize)) return true;
		return false;
	},
	polygonPolygon: function(verts1,itemSize1,verts2,itemSize2){
		var first1 = true
		var xa=verts1[verts1.length-itemSize1],ya=verts1[verts1.length-itemSize1];
		if(this.pointInPolygon(verts1[0],verts1[1],verts2,itemSize2) || this.pointInPolygon(verts2[0],verts2[1],verts1,itemSize1)) return true;
		for(var i = 0; i<verts1.length; i+=itemSize1){
			var xb=verts2[verts2.length-itemSize2],ya=verts2[verts2.length2-itemSize2];
			for(var j = 0; j<verts2.length; j+=itemSize2){
				if(this.lineLine(xa,ya,verts1[i],verts1[i+1],xb,yb,verts[j],verts[j+1])){
					return true;
				}
				xb=verts2[j];yb=verts2[j+1];
			}
			xa=verts1[i];ya=verts1[i+1];
		}
		return false;
	}
}

