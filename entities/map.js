/**
*	This file defines a map object for the current game
*/

function Map(limit, roomChance, minWidth, maxWidth, minHeight, maxHeight, size, connectorWidth){
	var num= 0;
	var lines= new Array();
	this.lines = lines;
	var rooms= new Array();
	var check = function(x,y){
		for( i in rooms) {
			if( rooms[i].x == x && rooms[i].y == y){
				return false;
			}
		}
		return true;
	}
	var  Room = function(north,east,south,west,x,y){
		this.x = x;
		this.y= y;
		north = north || null;
		south = south || null;
		east = east || null;
		west = west || null;
		var first = true;
		rooms.push(this);
		num++;
		while(((this.north==null && this.east == null && this.south==null && this.west == null)||first) && num<=limit){
			first = false;
			if((Math.random() <= roomChance) && north == null && check(x, y+size)){
				this.north = new Room(null,null,this,null,x,y+size);
			}
			if((Math.random() <= roomChance) && south == null && check(x, y-size)){
				this.south = new Room(this,null,null,null,x,y-size);
			}
			if((Math.random() <= roomChance) && east == null && check(x+size,y)){
				this.east = new Room(null,null,null,this, x+size,y);
			}
			if((Math.random() <= roomChance) && west == null && check(x-size, y)){
				this.west= new Room(null,this,null,null,x-size,y);
			}      
		}
		this.north = (north!=null) ? north : this.north;
		this.south =  (south!=null) ? south : this.south;
		this.east =  (east!=null) ? east : this.east;
		this.west = (west!=null) ? west : this.west;
		
		var width = minWidth + (Math.random() * (maxWidth - minWidth));
		var height= minHeight + (Math.random() * (maxHeight - minHeight));
		var cx = this.x + size/2;
		var cy = this.y + size/2;
		// top 
		if( this.north != null) {
			lines.push(cx+ width/2, cy + height/2, cx + connectorWidth/2, cy + height/2);
			lines.push(cx +connectorWidth/2, cy + height/2, cx +connectorWidth/2, this.y + size);
			lines.push(cx - connectorWidth/2, this.y + size, cx - connectorWidth/2, cy+ height/2);
			lines.push(cx - connectorWidth/2, cy+ height/2, cx - width/2, cy+ height/2);
		}else {
			lines.push(cx+ width/2, cy + height/2, cx - width/2, cy+ height/2);	
		}
		//left
		if( this.west != null){
			lines.push(cx - width/2, cy+ height/2, cx - width/2, cy + connectorWidth/2);
			lines.push(cx - width/2, cy + connectorWidth/2, this.x, cy + connectorWidth/2);
			lines.push(this.x, cy - connectorWidth/2, cx - width/2, cy - connectorWidth/2);
			lines.push(cx - width/2, cy - connectorWidth/2, cx - width/2, cy - height/2);
		}else{
			lines.push(cx - width/2, cy+ height/2, cx - width/2, cy - height/2);
		}
		//bottom
		if( this.south != null){
			lines.push(cx - width/2, cy - height/2, cx- connectorWidth/2, cy - height/2);
			lines.push(cx- connectorWidth/2, cy - height/2, cx- connectorWidth/2, this.y);
			lines.push(cx + connectorWidth/2, this.y, cx + connectorWidth/2, cy - height/2);
			lines.push(cx + connectorWidth/2, cy - height/2, cx + width/2, cy - height/2);
		}else{
			lines.push(cx - width/2, cy - height/2, cx + width/2, cy - height/2);
		}
		//right
		if( this.east != null) {
			lines.push(cx + width/2, cy - height/2, cx + width/2, cy - connectorWidth/2);
			lines.push(cx + width/2, cy - connectorWidth/2, this.x + size, cy - connectorWidth/2);
			lines.push(this.x+ size, cy + connectorWidth/2,cx + width/2, cy + connectorWidth/2);
			lines.push(cx + width/2, cy + connectorWidth/2, cx+ width/2, cy + height/2);
		}else{
			lines.push(cx + width/2, cy - height/2, cx+ width/2, cy + height/2);
		}
	}
	Room.prototype = {
		north: null,
		east: null,
		south: null,
		west: null,
		connected: false
	}
	this.room = new Room(null,null,null,null,0,0);
	
}
Map.prototype=fillProperties(new GLDrawable(),{
	draw: function(gl,delta,screen,manager,pMatrix,mvMatrix){
		manager.stroke(1,1,0,1)
		for(var i = 0; i<this.lines.length; i+=4){
			manager.line(this.lines[i],this.lines[i+1],this.lines[i+2],this.lines[i+3],98);
		}
	}
});