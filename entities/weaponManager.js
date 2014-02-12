function WeaponManager()
{
	// instance variables
 	this.weaponList = [];
 	this.position = 0;
 	this.currentWeapon = undefined;
}

WeaponManager.prototype = 
{
	// Fires the weapon: starting collision checks and drawing
 	fire: function() {
 		if (!Loop.paused)
 			this.currentWeapon.fire();
 		return;
 	},
 	
 	// Stops the weapon from performing checks and drawing
 	holdFire: function() {
 		this.currentWeapon.holdFire();
 		return;
 	},
 
 	// Changes Weapon to the specified Index starting at 0
 	swap: function(index) {
 		if (index < this.position) {
 			this.currentWeapon.holdFire();
 			this.currentWeapon = this.weaponList[index];
 		} else {
 			console.error("Weapon does not exist in slot: " + index);
 		}
 		return;
 	},
 	
 	// Adds a weapon to the players inventory
 	add: function(item) {
 		item.holdFire();
		this.weaponList[this.position++] = item;
			if (this.currentWeapon == undefined) {
				this.currentWeapon = this.weaponList[0];			
			}
 		return;
 	},
 	
 	// Removes all weapons from the player
 	clear: function() {
 		this.position = 0;
 		this.weaponList = [];
 		this.currentWeapon = undefined;
 		return;
 	}
}