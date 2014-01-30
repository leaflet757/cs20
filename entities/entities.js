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
	add: function(name,entity){
		if(entity instanceof Entity){
			this[name] = entity;
		}else{
			throw 'Entities: attempt to add non-entity'
		}
	},
	remove: function(name){
		if(this[name] instanceof Entity){
			delete this[name];
		}
	},
	update: function(delta){
		for(var o in this){
			if(typeof this[o].update== 'function')this[o].update(delta);
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
			// console.log(position+ " "+this.instanceArray.length )
			if(position<this.instanceArray.length){
				instance = this.instanceArray[position];
				// console.log(this.instanceArray.length);
				instance.id = instanceId++;
			}else{
				instance = new EntityState(instanceId++);
				this.instanceArray.push(instance);
			}
			instance.alive = true;
			this.instances[id] = instance;
			this.def.create(instance,a,b,c,d,e,f,g,h);
			position++;
			// console.log(instance.alive+' '+position)
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
					for(var j = i+1; j<this.instanceArray.length; j++){
						this.instanceArray[j-1] = this.instanceArray[j];
					}
					this.instanceArray[this.instanceArray.length-1] = temp;
					delete this.instances[temp.id];
					this.def.destroy(temp);
					position--;
					instance = this.instanceArray[i];
				}
				if(i<position && instance.active){
					this.def.update(instance,delta);
				}
			}
		}
	}
})();



importS('entities/player.js');
importS('entities/miscEntities.js');