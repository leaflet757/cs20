function initParticles(){

	function System(){
		this.particles = new Array();
		this.emitters = new Array();
		this.repulsors = new Array();
	}
	System.prototype = fillProperties(new GLDrawable(), {
		this.update = function(){
		
		},
		this.glInit = function(){
		
		},
		this.draw = function(){
		
		},
		this.glDelete = function(){
		
		}
	}
	
	window.particles = {
		update: function(delta){
		
		}
	}
}