function ObjectPool(constructor,destructor){
	if(typeof constructor != 'function'){
		throw 'ObjectPool: no constructor passed'
	}
	var objects = new Array();
	var position = 0;
	
	this.create = function(a,b,c,d,e,f,g,h,i,j,k){
		var obj;
		if(position<objects.length){
			obj = objects[position]
		}else{
			obj = new Object();
			objects[position] = obj;
		}
		position++;
		constructor.call(obj,a,b,c,d,e,f,g,h,i,j,k);
		return obj;
	}
	this.remove = function(obj){
		var index;
		if(typeof obj == 'object'){
			for(var i = 0; i<position; i++){
				if(objects[i]==obj){
					index = i;
					break;
				}
			}
		}else if(typeof obj == 'number'){
			index = obj;
		}
		if(index>=position) throw 'ObjectPool.remove: illegal argument: '+obj;
		
		if(destructor)destructor(objects[index]);
		
		var temp = objects[index];
		position--;
		if(index != position){
			objects[index] = objects[position];
			objects[position] = temp;
		}
		
		return temp;
	}
	this.removeAll = function(){
		if(typeof destructor == 'function'){
			for(var i = 0; i<position; i++){
				destructor(objects[i]);
			}
		}
		position = 0;
	}
	this.clear = function(){
		if(typeof destructor == 'function'){
			for(var i = 0; i<position; i++){
				destructor(objects[i]);
			}
		}
		objects.length = 0;
		position = 0;
	}
	
	
	Object.setProperties(this,{
		size: {
			get: function(){
				return position;
			},
			set: function(){}
		},
		poolSize: {
			get: function(){
				return objects.length;
			},
			set: function(){}
		}
	});
	return this;
}
