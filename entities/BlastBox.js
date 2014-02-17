function BlastBox(x,y,width,height) {
	var a = [];
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.startTimer = false;
	this.hasExploded = false;
	this.time = 0;
}

BlastBox.prototype = {
	activate: function(time){
		this.time = time;
		this.startTimer = true;
	},
	
	tick: function(delta){
		if (this.startTimer){
			this.time -= delta;
		}
	},
	
	getEnemiesInBlast: function() {
		var enemies = physics.getColliders(a,this.x,this.y,this.width,this.height);
		return enemies;
	}
};