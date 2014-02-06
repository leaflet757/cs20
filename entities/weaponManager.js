function WeaponManager()
{
 // instance
 this.weaponList = [];
 this.position = 0;
 this.currentWeapon = NULL; // is entitiy
}

WeaponManager.prototype = 
{
 // class
 fire: function() {
	//currentWeapon.fire();
	var s = Entities.player.getInstance(0);
	dir[0] = mouse.x - s.cx;
	dir[1] = mouse.yInv - s.cy;
	Entities.rocket.newInstance(s.cx,s.cy, dir);
 },

switch: function(index) {
	if (index < position)
	{
		currentWeapon = weaponList[index];
	}
	else
	{
		Console.log("switch weapon error"):
	}
} 
 
 add: function(tag) {
	weaponList[position++] = tag;
	if (this.currentWeapon == NULL)
	{
		currentWeapon = weaponList[0];
	}
 },
 
 clear: function() {
	weaponList = [];
 }
}