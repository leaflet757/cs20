/**
* This class holds the game entities and performs fetch operations as well as containing the Entity class
* it also loads all of the entity files
*/

Entities = {
	add: function(){
	
	},
	get: function(id){
	
	}
}

/**
* entities should implement an object pool and handle their initialization
*/
function Entity(name,state){
	
}

Entity.prototype=fillProperties({
	newInstance: function(){
	},
	getInstance: function(id){
	},
	tick: function(delta){
	}
})


importS('entities/player.js');
