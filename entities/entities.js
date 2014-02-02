/**
* This class holds the game entities and performs fetch operations as well as containing the Entity class
* it also loads all of the entity files with importS()
*/

Entities = fillProperties(new Updatable(),{
	/**
	*  creates a new entity by building an EntityDef object from the properties of the passed object
	*/
	create: function(obj){
		return new Entity(fillProperties(new EntityDef(),obj));
	},
	/**
	*  creates an object that's both a mover and a GLDrawable and assigns the properties
	*  of the passed object to it
	*/
	createStandardState: function(obj,x,y){
		return fillProperties(new GLDrawable(),fillProperties(new MovementState(x,y),obj));
	},
	/**
	*	does a type check then adds the entity to Entities as a property with the given name
	*/
	add: function(name,entity){
		if(entity instanceof Entity){
			this[name] = entity;
		}else{
			throw 'Entities: attempt to add non-entity'
		}
	},
	/**
	*	Deletes the entity from this object and clears its instances
	*/
	remove: function(name){
		if(this[name] instanceof Entity){
			this[name].reset();
			delete this[name];
		}
	},
	/**
	*	updates all of the properties of Entities with an update function
	*/
	update: function(delta){
		for(var o in this){
			if(typeof this[o].update == 'function')this[o].update(delta);
		}
	},
	/**
	*	clears all instances but not object pools
	*/
	reset:function(){
		for(var o in this){
			if(typeof this[o].reset== 'function')this[o].reset();
		}
	},
	/**
	*	clears all object pools, killing all instances
	*/
	clear:function(){
		for(var o in this){
			if(typeof this[o].clear == 'function')this[o].clear();
		}
	}
});

function EntityDef(){
}
EntityDef.prototype={
	/**
	* 	initializes the passed state object
	*/
	create: function(state,a,b,c,d,e,f,g,h){
	},
	/**
	* 	does actions for the end of a instances life
	*/
	destroy: function(state){
	},
	/**
	*  does tick for entity
	*/
	update: function(state,delta){
	},
	/**
	*	sets whether or not the entity is active
	*/
	setActive: function(state,active){
	}
}

function EntityState(id){
	this.id = id;
}
EntityState.prototype={
	alive:false,
	active:false
}

/**
* entities should implement an object pool and handle their initialization
*/
function Entity(def){
	if(def instanceof EntityDef){
		this.def = def;
		this.instances = {};
		this.instanceArray = new Array();
	}else{
		throw 'Entity: illegal parameter';
	}
}
Entity.prototype=(function(){
	var instanceId = 0;
	var position = 0;
	
	return {
		/**
		* creates a new instance
		*/
		newInstance: function(a,b,c,d,e,f,g,h){
			var id = instanceId++
			var instance;
			if(position<this.instanceArray.length){
				instance = this.instanceArray[position];
				instance.id = instanceId++;
			}else{
				instance = new EntityState(instanceId++);
				this.instanceArray.push(instance);
			}
			instance.alive = true;
			this.instances[id] = instance;
			this.def.create(instance,a,b,c,d,e,f,g,h);
			position++;
			return id;
		},
		getInstance: function(id){
			return this.instances[id];
		},
		/**
		*	set 
		*/
		setActive:function(id,active){
			this.instances[id].active = active;
			this.def.setActive(this.instances[i],active);
		},
		/**
		* 	looks for and handles destroyed objects 
		*/
		update : function(delta){
			for(var i = 0; i<position; i++){
				var instance = this.instanceArray[i];
				while(!instance.alive && i<position){
					var temp = instance;
					position--;
					if(i!=position){
						this.instanceArray[i] = this.instanceArray[position];
						this.instanceArray[position] = temp;
					}
					this.instances[temp.id] = null;
					this.def.destroy(temp);
					
					instance = this.instanceArray[i];
				}
				if(i<position && instance.active){
					this.def.update(instance,delta);
				}
			}
		},
		/**
		*	kills all instances but does not clear the object pool
		*/
		reset:function(){
			for(var i = 0; i<position; i++){
				delete this.instances[this.instanceArray[i].id];
				this.def.destroy(this.instanceArray[i]);
			}
			position = 0;
		},
		/**
		*	kills all instances and clears the object pool
		*/
		clear: function(){
			this.reset();
			this.instances.length = 0;
		}
	}
})();



importS('entities/player.js');
importS('entities/miscEntities.js');