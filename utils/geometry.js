/**
* this file describes several useful geometry objects and functions
*/



/**
*This function defines a box with a location width and height
*/
function Box(x,y,width,height){
	if(typeof x == 'number') this.x = x;
	if(typeof y == 'number') this.y = y;
	if(typeof width == 'number') this.width = width;
	if(typeof height == 'number') this.height = height;
	return this;
}
Box.prototype=Object.defineProperties({
	width: 0,
	height: 0,
	x: 0,
	y: 0,
	collision: function(x,y,width,height){
		if(typeof x == 'object'){
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
	},
	boxInside: function(x,y,width,height){
		if(typeof x == 'object'){
			y = x.y;
			width = x.width;
			height = x.height;
			x = x.x;
		}else{
			width = width || 0;
			height = height || 0;
		}
		return 	(x> this.x) &&
				(x+width<this.x+this.width) &&
				(y > this.y) &&
				(y+height < this.y+this.height);
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
	setUnit: function(out,a){
		var l = 0;
		for(var i =0; i<a.length; a++){
			l += a[i]*a[i];
		}
		for(var i =0; i<a.length; a++){
			out[i] = a[i]/l;
		}
		return out;
	},
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
		for(var i = 0; i<vec.length; i++){
			mag += vec[i]*vec[i];
		}
		return Math.sqrt(mag);
	},
	setDir: function(out,a,theta){
		if(typeof theta == 'object'){
			var l = Vector.getMag(a);
			var lt = Vector.getMag(theta);
			for(var i = 0; i<a.length; i++){
				out[i] = l * (theta[i]/lt);
			}
			return out;
			
		}else{
			var m = this.getMag(a);
			if(m){
				out[0] = Math.cos(theta)*m;
				out[1] = Math.sin(theta)*m;
			}
		}
		return out;
	},
	setMag: function(out,a,mag){
		var m = this.getMag(a);
		if(m){
			for(var i = 0; i<vec.length; i++){
				out[i] = mag*(a[i]/m);
			}
		}else{
			out[0]=mag;
		}
		return out;
	}
}

VecArray = {
	getMaxDif:function(vecs,itemSize,index){
		var max = 0;
		for(var i = index; i<vecs.length; i+=itemSize){
			for(var j = i+itemSize; j<vecs.length; j+=itemSize){
				max = Math.max(max,Math.abs(vecs[i]-vecs[j]));
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
