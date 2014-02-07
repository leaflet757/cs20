function WeaponManager()
{
	// instance variables
 this.weaponList = [];
 this.position = 0;
 this.currentWeapon = 'undefined'; // is entitiy
}

WeaponManager.prototype = 
{
 	fire: function() {
 		console.log("fire");
 		return;
 	},
 
 	swap: function(index) {
 		if (index < this.position) {
 			this.currentWeapon = this.WeaponList[index];
 		} else {
 			console.error("unable to switch weapons");
 		}
 		return;
 	},
 	
 	add: function(item) {
		this.weaponList[this.position++] = item;
			if (currentWeapon == 'undefined') {
				this.currentWeapon = this.weaponList[0];			
			}
 		return;
 	},
 	
 	clear: function() {
 		this.position = 0;
 		this.weaponList = [];
 		this.currentWeapon = NULL;
 		return;
 	}
}