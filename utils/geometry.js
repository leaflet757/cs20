/**
* this file describes several useful geometry objects and functions
*/

/**
*	general class for storing and operating on data that can be represented 
*	as a two dimensional vector
*/
function Vector2d(x,y){
	if(typeof x != 'number') x = 0;
	if(typeof y != 'number') y = 0;
	this.x = x;
	this.y = y;
}

Vector2d.prototype = {
	clone: function(){
		return new Vector2d(this.x,this.y);
	},
	toString: function(){
		return "("+this.x+","+this.y+")";
	},
	/**
	*	sets this vector with the passed values
	*/
	set: function(x,y){
		if(typeof x == Vector2d){
			this.x = x.x;
			this.y = x.y;
		}else if(typeof x == 'number' && typeof y == 'number'){
			this.x=x;
			this.y=y;
		}else{
			throw new Exception();
		}
		return this;
	},
	/**
	*	rotates this vector around the passed coordinates or 0,0
	*	first argument is angle
	*/
	rotate: function(theta,a,b){
		var x,y;
		if(a instanceof Vector2d){
			x = a.x;
			y = a.y;
		}else{
			if(typeof a == 'number'){
				x = a;
			}else{
				x = 0;
			}
			if(typeof b == 'number'){
				y = b;
			}else{
				y = 0;
			}
		}
		var u = this.x-x,
			v = this.y-y;
		this.x=(Math.cos(theta)*u - Math.sin(theta)*v)+x;
		this.y=(Math.sin(theta)*u + Math.cos(theta)*v)+y;
		return this;
	},
	/**
	* scales this vector around the passed coordinates
	*/
	scale: function(w,h,a,b){
		var x,y;
		if(a instanceof Vector2d){
			x = a.x;
			y = a.y;
		}else{
			if(typeof a == 'number'){
				x = a;
			}else{
				x = 0;
			}
			if(typeof b == 'number'){
				y = b;
			}else{
				y = 0;
			}
		}
		var u = this.x-x,
			v = this.y-y;
		theta = toRadians(theta);
		this.x=(u*w)+x;
		this.y=(v*h)+y;
		return this;
	},
	/**
	*	translate the vector so that the passed coordinates are the origin
	*/
	translate: function(a,b){
		if(a instanceof Vector2d){
			this.x -= a.x;
			this.y -= a.y;
		}else if(typeof a == 'number' && typeof b == 'number'){
			this.x -= a;
			this.y -= b;
		}
		return this;
	},
	/**
	*	adds the passed vector to this vector
	*/
	add: function(a,b){
		var x,y;
		if(a instanceof Vector2d){
			x = a.x;
			y = a.y;
		}else{
			if(typeof a == 'number'){
				x = a;
			}else{
				x = 0;
			}
			if(typeof b == 'number'){
				y = b;
			}else{
				y = 0;
			}
		}
		this.x+=x;
		this.y+=y;
	},
	/**
	*	if passed a scalar multiplies this vector by that scalar else if a 
	* 	vector is passed returns the dot product of the 
	*/
	mul: function(value){
		if(value instanceof Vector2d){
			return this.x*value.x + this.y*value.y;
		}else if(typeof value == 'number'){
			this.x *= value;
			this.y *= value;
		}
	},
	/**
	* sets this vector to its orthogonal projection onto the passed vector
	*/
	project: function(vector){
		var u = this.mul(vector)/vector.mul(vector);
		this.x = value.x*u;
		this.y = value.y*u;
	},
	/**
	* returns the direction of this vector in radians
	*/
	getDir: function(){
		//special cases
		if(this.x==0 && this.y==0) return 0; //no angle
		if(this.x==0){
			if(this.y>0) return Math.PI/2;
			if(this.y<0) return Math.PI*(3/2);
		}
		if(this.y==0){
			if(this.x>0) return 0;
			if(this.x<0) return Math.PI;
		}
		
		//general case
		var quad,theta;
		//atan in quadrant
		theta = Math.atan(Math.abs(this.y)/Math.abs(this.x));
		
		//get quadrant
		if(this.x>0){
			if(this.y>0){
				quad = 1;
			}else{
				quad = 4;
			}
		}else{
			if(this.y>0){
				quad = 2;
			}else{
				quad = 3;
			}
		}
		
		switch(quad){
			case 1:
				return theta;
				break;
			case 2:
				return Math.PI - theta;
				break;
			case 3:
				return Math.PI + theta;
				break;
			case 4:
				return (Math.PI*2) - theta;
				break;
		}
	},
	/**
	*	sets the direction of this vector without changing the magnitude
	*/
	setDir: function(theta){
		var m = this.getMag();
        this.x = Math.cos(theta)*m;
		this.y = Math.sin(theta)*m;
	},
	/**
	*	returns the magnitude of this vector
	*/
	getMag: function(){
		return pythag(this.x,this.y);
	},
	/**
	*sets the magnitude of this vector
	*/
	setMag: function(mag){
		var m = this.getMag();
		this.x = (this.x/m)*mag;
		this.y = (this.y/m)*mag;
	},
	/**
	*	returns the distance between this and the passed coordinates,
	*   alternatively can return the distance between two set of passed coordinates
	*/
	dist: function(a,b,c,d){
		var x1=this.x,y1=this.y,x2,y2;
		if(a instanceof Vector2d){
			x2 = a.x; y2 = a.y;
			if(b instanceof Vector2d){
				x1 = b.x;
				y1 = b.y;
			}else if(typeof b == 'number' && typeof c == 'number'){
						x1 = b;
						y1 = c;
			}
		}else if(typeof a == 'number' && typeof b == 'number'){
			x2 = a, y2 = b;
			if(c instanceof Vector2d){
				x1 = c.x;
				y1 = c.y;
			}else if(typeof c == 'number' && typeof d == 'number'){
				x1 = c;
				y1 = d;
			}
		}else{
			throw new Exception();
		}
		return pythag(x1-x2,y1-y2);
	},
	/**
	* sets this vector to a point the given percent from the first passed coordinates
	* and the second one
	*/
	tween: function(percent,x1,y1,x2,y2){
		if(x1 instanceof Vector2d && y1 instanceof Vector2d){
			var temp = y1;
			y1 = x1.y;
			x1 = x1.x;
			x2 = temp.x;
			y2 = temp.y;
		}
		this.x = x1 + (x2-x1)*percent;
		this.y = y1 + (y2-y1)*percent;
		return this;
	}
};

/**
*This function defines a box with a location width and height
*/
function Box(x,y,width,height){
	if(typeof x == 'number') this.x = x;
	if(typeof y == 'number') this.y = y;
	if(typeof width == 'number') this.width = width;
	if(typeof height == 'number') this.height = height;
}

Box.prototype=Object.defineProperties({
	width: 0,
	height: 0,
	x: 0,
	y: 0,
	collision: function(x,y,width,height){
		if(x instanceof Box){
			y = x.y;
			width = x.width;
			height = x.height;
			x = x.x;
		}else{
			width = width || 0;
			height = height || 0;
		}
		return 	(x+width > this.x) &&
				(x < this.x+this.width) &&
				(y+height > this.y) &&
				(y < this.y+this.height);
	}
},
{
	cx:{
		get: function(){
			return this.x+(this.width/2);
		},
		set: function(cx){
			this.x += cx-(this.x+(this.width/2));
		}
	},
	cy:{
		get: function(){
			return this.y+(this.height/2);
		},
		set: function(cy){
			this.y += cy-(this.y+(this.height/2));
		}
	}
});



/**
* this is a lightweight class for holding the data for a single face with the vertices
* listed in CCW order
*/
function Polygon(vertices){
	if(!(vertices instanceof Array)) throw "Polygon: vertices not array "+vertices;
	if(vertices.length<3) throw "not enough vertices";
	//copies array
	this.vertices = new Array();
	for(i in vertices){
		if(!(vertices[i] instanceof Vector2d)) throw "Polygon: illegal object in vertex array";
		this.vertices[i] = vertices[i];
	}
	//ensures the vertices are in CCW order
	if(this.getSignedArea()<0){
		this.vertices.reverse();
	}
	
	Object.defineProperties(this,{
		"x":{
			set: function(x){
				var min = this.vertices[0]
				for(var i in vertices){
					min = Math.min(min,this.vertices[i].x);
				}
				var dif = x-min;
				for(var i in this.vertices){
					this.vertices[i].x+=dif;
				}
			},
			get: function(){
				var min = this.vertices[0].x;
				for(var i =1; i<vertices.length; i++){
					min = Math.min(min,this.vertices[i].x);
				}
				return min;
			}
		},
		"y":{
			set: function(y){
				var min = this.vertices[0].y;
				for(var i in this.vertices){
					min = Math.min(min,this.vertices[i].y);
				}
				var dif = y-min;
				for(var i in this.vertices){
					this.vertices[i].y+=dif;
				}
			},
			get: function(){
				var min = this.vertices[0].y;
				for(var i =1; i<vertices.length; i++){
					min = Math.min(min,this.vertices[i].y);
				}
				return min;
			}
		},
		//keeps box origin
		"width":{
			set: function(w){
				var x=this.x;
				var scale = w/this.width;
				var cx = this.cx;
				for(var i in this.vertices){
					this.vertices[i].x = ((this.vertices[i].x-cx)*w)+cx;
				}
				this.x=x;
			},
			get: function(){
				var max = Math.abs(this.vertices[0].x-this.vertices[this.vertices.length-1].x);
				for(var i = 0; i<this.vertices.length;i++){
					for(var j = i+1; j<this.vertices.length; j++){
						max = Math.max(max,Math.abs(this.vertices[i].x-this.vertices[j].x));
					}
				}
				return max;
			}
		},
		"height":{
			set: function(h){
				var y=this.y;
				var scale = h/this.height;
				var cy = this.cy;
				for(var i in this.vertices){
					this.vertices[i].y = ((this.vertices[i].y-cy)*w)+cy;
				}
				this.y=y;
			},
			get: function(){
				var max = Math.abs(this.vertices[0].y-this.vertices[this.vertices.length-1].y);
				for(var i = 0; i<this.vertices.length;i++){
					for(var j = i+1; j<this.vertices.length; j++){
						max = Math.max(max,Math.abs(this.vertices[i].y-this.vertices[j].y));
					}
				}
				return max;
			}
		}
	})
}
Polygon.prototype = fillProperties(new Box(),{
	clone: function(){
		var verts = new Array();
		for(var i in this.vertices){
			verts.push(this.vertices[i].clone());
		}
		return new Polygon(verts);
	},
	toString: function(){
		var str="{";
		for(var i in this.vertices){
			str+=this.vertices[i];
		}
		str+="}";
		return str;
	},
	vertices: new Array(),
	getSignedArea: function(){
		var a = this.vertices[this.vertices.length-1];
        var b = this.vertices[0];
        area =(a.x*b.y) - (b.x*a.y);
        for(var i = 0; i<this.vertices.length-1; i++){
            a = this.vertices[i];
            b = this.vertices[i+1];
            area +=(a.x*b.y) - (b.x*a.y);
        }
        return area/2;
	},
	/**
	* scales the polygon around the passed point
	* or its center
	*/
	scale: function(w,h,x,y){
		if(!(typeof x == 'number' && typeof y == 'number')){
			x = this.cx;
			y = this.cy;
		}
		for(var i in this.vertices){
			vertices[i].scale(w,h,x,y);
		}
	},
	rotate: function(theta,x,y){
		if(!(typeof x == 'number' && typeof y == 'number') && !(x instanceof Vector2d)){
			x = this.cx;
			y = this.cy;
		}
		for(var i in this.vertices){
			this.vertices[i].rotate(theta,x,y);
		}
	}
});

/**
* this is a vector object used to represent a subsection of a larger array
* it is intended specifically for use with the gl-matrix library
*/
var VirtualVector = function(array,size){
	this.size = size;
	this.array = array;
	
	var getter = function(index){
		return function(){
			return this.array[this.start+index];
		}
	}
	
	var setter = function(index){
		return function(x){
			this.array[this.start+index] = x;
		}
	}
	
	for(var i = 0; i<size; i++){
		Object.defineProperty(this,i,{
			get:getter(i),
			set: setter(i)
		});
	}
}
VirtualVector.prototype = {
	array: new Array(),
	start:0,
	size: 0,
	setTo: function(index){
		if(index>=this.array.length/this.size || index<0){
			throw "VirtualVector: array out of bounds "+index
		}
		this.start = index*this.size;
		return this;
	},
	set: function(vec){
		for(var i = 0; i<this.size; i++){
			this.array[this.start+i] = vec[i];
		}
	}
}

/**
*
*/
function GLPolygon(vecArray,itemSize){
	this.vecType = window['vec'+itemSize];
	if(vec3Array && !hasUndefined(vec3Array)){
		if(typeof vecArray[0] == 'number' && vecArray.length%itemSize==0){//array of numbers
			this.vertices = vecArray;
		}else if(vecArray[0].length = itemSize){//array of vectors
			this.vertices = new Array();
			for(var i in vecArray){
				for(var j in vecArray[i]){
					this.vertices.push(vecArray[i][j]);
				}
			}
		}
	}
	if(!this.vertices){
		throw "GLPolygon.constructor: illegal parameters";
	}
	if(this.getSignedArea()<0){
		this.vertices.reverse();
	}
	
	var virtual = new VirtualVector(this.vertices,itemSize);
	
	var getter = function(index){
		return function(){
			return virtual.setTo(index);
		}
	}
	
	var setter = function(index){
		return function(vec){
			virtual.setTo(index).set(vec);
		}
	}
	
	var rMatrix = (this.itemSize==2) ? mat2.create() :mat4.create();
	
	this.rotate = function(a,b,c,d,e,f){
		if(this.itemSize == 2){
			mat2.identity(rMatrix);
			mat2.rotate(rMatrix,rMatrix,a);
			for(var i= 0; i<this.length; i++){
				this[i][0]-=b;
				this[i][1]-=c;
				vec2.transformMat2(this[i],this[i],rMatrix);
				this[i][0]+=b;
				this[i][1]+=c;
			}
		}else if(this.itemSize == 3){
			mat4.identity(rMatrix);
			mat4.rotateX(rMatrix,rMatrix,a);
			mat4.rotateY(rMatrix,rMatrix,b);
			mat4.rotateZ(rMatrix,rMatrix,c);
			for(var i= 0; i<this.length; i++){
				this[i][0]-=d;
				this[i][1]-=e;
				this[i][2]-=f;
				vec2.transformMat4(this[i],this[i],rMatrix);
				this[i][0]+=d;
				this[i][1]+=e;
				this[i][2]+=f;
			}
		}
	}
	
	//allows polygon to be used like an array and used with the foreach method of gl-matrix
	for(var i = 0; i<(this.array.length<itemSize); i++){
		Object.defineProperty(this,i,{
			get: getter(i),
			set: setter(i)
		});
	}
	Object.defineProperties(this,
	{
		length:{
			get: function(){
				return this.vertices.length/itemSize;
			},
			set: function(i){
				this.vertices.length = i*itemSize;
			}
		}
	});
}

Vector = {
	getDir: function(vec){
		//special cases
		if(vec[0]==0 && vec[1]==0) return 0; //no angle
		if(vec[0]==0){
			if(vec[1]>0) return Math.PI/2;
			if(vec[1]<0) return Math.PI*(3/2);
		}
		if(vec[1]==0){
			if(vec[0]>0) return 0;
			if(vec[0]<0) return Math.PI;
		}
		
		//general case
		var quad,theta;
		//atan in quadrant
		theta = Math.atan(Math.abs(vec[1])/Math.abs(vec[0]));
		
		//get quadrant
		if(vec[0]>0){
			if(vec[1]>0){
				quad = 1;
			}else{
				quad = 4;
			}
		}else{
			if(vec[1]>0){
				quad = 2;
			}else{
				quad = 3;
			}
		}
		
		switch(quad){
			case 1:
				return theta;
				break;
			case 2:
				return Math.PI - theta;
				break;
			case 3:
				return Math.PI + theta;
				break;
			case 4:
				return (Math.PI*2) - theta;
				break;
		}
	},
	getMag: function(vec){
		var mag = 0;
		for(var i in vec){
			mag += vec[i]*vec[i];
		}
		return Math.sqrt(mag);
	},
	setDir: function(out,a,theta){
		var m = this.getMag(a);
        out[0] = Math.cos(theta)*m;
		out[1] = Math.sin(theta)*m;
		return out;
	},
	setMag: function(out,a,mag){
		var m = this.getMag(a);
		for(var i in a){
			out[i] = mag*(a[i]/m);
		}
		return out;
	}
}

VecArray = {
	getMaxDif:function(vecs,itemSize,index){
		var max = 0;
		for(var i = index; i<vecs.length; i+=itemSize){
			for(var j = i; j<vecs.length; j+=itemSize){
				max = Math.max(max,Math.abs(vecs[i],vecs[j]));
			}
		}
		return max;
	},
	setMaxDif:function(vecs,itemSize,index,value){
		var pdif = this.getMaxDif(vecs,itemSize);
		var scale = value/pdif;
		var c = this.getCorner(vecs,itemSize,index)+(pdif/2);
		var trans = (value-pdif)/2;
		for(var i = index; i<vecs.length; i+=itemSize){
			vecs[i] = (c +(vecs[i]-c)*scale)-trans;
		}
		return vecs;
	},
	getCorner:function(vecs,itemSize,index){
		var min = vecs[index];
		for(var i = index; i<vecs.length; i+=itemSize){
			min = Math.min(min,vecs[i]);
		}
		return min;
	},
	setCorner:function(vecs,itemSize,index,value){
		var dif = value-this.getCorner(vecs,itemSize,index);
		for(var i = index; i<vecs.length; i+=itemSize){
			vecs[i]+dif;
		}
		return vecs;
	}
}

/**
* class for holding complex planar data
* this is a more complex data structure
*/
function DCELMesh(Vertices){}

DCELMesh.prototype = {
	edgeList: {},
	faceList: {},
	vertList: {}
}


function numsToVecs(numbers){
	if(numbers.length%2 !=0)throw "numsToVecs: array cannot be resolved into 2d vectors "+numbers.length;
	var vecs = new Array();
	for(var i = 1;i<numbers.length; i+=2){
		vecs.push(new Vector2d(numbers[i-1],numbers[i]));
	}
	return vecs;
}
