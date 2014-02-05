function WeaponManager()
{
 // instance
 this.weaponList = [];
 this.position = 0;
 this.currentWeapon = NULL;
}

WeaponManager.prototype = 
{
 // class
 fire: function() {
	
 }, 
 
 add: function(tag) {
	weaponList[position++] = tag;
	if (this.currentWeapon == NULL)
	{
		currentWeapon = weaponList[0];
	}
 },
 
 clear: function() {
	
 }
}