var DEG_TO_RAD = Math.PI/180;
var RAD_TO_DEG = 180/Math.PI;

function extend(obj,proto){
	obj.prototype = proto;
	return obj;
}

function fillProperties(target, properties){
	for(var o in properties){
		target[o] = properties[o];
	}
	return target;
}

function pythag(a,b){
	return Math.sqrt(a*a + b*b);
}

function hasUndefined(array){
	for(var i in array){
		if(typeof array[i] == 'undefined') return true;
	}
	return false;
}

function checkNum(a,b){
	return (typeof a === 'number') ? a : b;
}

var uid = (function(){
	var next = 0;
	return function(){
		return next++;
	}
})();