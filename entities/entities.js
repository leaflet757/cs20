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
	* combines properties from a GLDrawable and BasicCollider
	*/
	createStandardCollisionState: function(obj,x,y,width,height,elasticity){
		return fillProperties(new GLDrawable(),fillProperties(new BasicCollider(x,y,width,height,elasticity),obj));
	},
	/**
	* used to create a standard collision state with fine collisions
	*/
	createPolygonCollisionState: function(obj,x,y,width,height,elasticity,verts,itemSize){
		return fillProperties(new GLDrawable(),fillProperties(new PolygonCollider(x,y,width,height,elasticity,verts,itemSize),obj));
	},
	/**
	*	provides a standard set of properties for enemies
	*/
	createStandardEnemy: function(obj,x,y,width,height,elasticity,life,scope){
		var life = life || 100;
		return Object.defineProperties(fillProperties(this.createStandardCollisionState(obj,x,y,width,height,elasticity),{
					scope: scope || 1024,
					getPlayer: function(){
						return Entities.Player.getInstance(0);
					}
				}),{
					life:{
						get: function(){
							return life;
						},
						set: function(nLife){
							life = nLife;
							if(life<=0){
								this.alive = false;
							}
						}
					},
					isEnemy:{
						value: true,
						writable: false
					},
					inActiveScope: {
						get: function(){
							var p = this.getPlayer();
							return (p && pythag(p.cx-(this.x+this.width/2),p.cy-(this.y+this.height/2))<this.scope);
						},
						set: function(){}
					}
				});
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
		return entity;
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
		// this.reseting = true;
		for(var o in this){
			if(typeof this[o].reset== 'function')this[o].reset();
		}
		// this.reseting = false;
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
	Object.defineProperties(this,{
		doDestroy:{
			value: function(state,reset){
				if(this.parent){
					this.parent.def.doDestroy(state,reset);
				}
				this.destroy(state,reset);
			},
			writable:false
		},
		doUpdate: {
			value: function(state,delta){
				if(this.parent){
					this.parent.def.doUpdate(state,delta);
				}
				this.update(state,delta);
			},
			writable:false
		},
		doCreate: {
			value: function(state,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p){
				if(this.parent){
					this.parent.def.doCreate(state,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p);
				}
				this.create(state,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p);
			},
			writable:false
		},
	})
}
EntityDef.prototype={
	/**
	* 	initializes the passed state object
	*/
	create: function(state,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p){
	},
	/**
	* 	does actions for the end of a instances life
	*/
	destroy: function(state,reset){
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
	},
	/**
	* 	defines a parent entity for this def
	*/
	parent: false
}

function EntityState(id,euid){
	this[euid] = id;
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
		this.position = 0;
		Object.defineProperty(this,'euid',{
				writible: false,
				value: uid()
			});
	}else{
		throw 'Entity: illegal parameter';
	}
}
Entity.prototype=(function(){
	var instanceId = 0;
	
	return {
		/**
		* creates a new instance
		*/
		newInstance: function(a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p){
			if(Entities.reseting) return;
			var id = instanceId++
			var instance;
			if(this.position<this.instanceArray.length){
				instance = this.instanceArray[this.position];
				this.instances[id] = instance;
			}else{
				instance = new EntityState(id,this.euid);
				this.instanceArray.push(instance);
				this.instances[id] = instance;
			}
			instance[this.euid]= id;
			instance.alive = true;
			this.def.doCreate(instance,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p);
			this.position++;
			return instance;
		},
		getInstance: function(index){
			return this.instanceArray[index];
		},
		getInstanceById: function(id){
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
			for(var i = 0; i<this.position; i++){
				var instance = this.instanceArray[i];
				while(!instance.alive && i<this.position){
					var temp = instance;
					this.position--;
					if(i!=this.position){
						this.instanceArray[i] = this.instanceArray[this.position];
						this.instanceArray[this.position] = temp;
					}
					this.instances[temp[this.euid]] = null;
					this.def.doDestroy(temp)
					instance = this.instanceArray[i];
				}
			}
			for(var i = 0; i<this.position; i++){
				this.def.doUpdate(this.instanceArray[i],delta)
			}
		},
		/**
		*	kills all instances but does not clear the object pool
		*/
		reset:function(){
			for(var i = 0; i<this.position; i++){
				delete this.instances[this.instanceArray[i].id];
				this.def.doDestroy(this.instanceArray[i],true);
			}
			this.position = 0;
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

importS('entities/weaponManager.js');
importS('entities/player.js');
importS('entities/miscEntities.js');
importS('entities/weapons.js');
importS('entities/enemies2.js');
importS('entities/enemies.js');
importS('entities/pickups.js');
importS('entities/enemyWeapons.js');