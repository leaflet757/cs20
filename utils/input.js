var input = {
	//these are hotkeys for movement across a webpage
	keys: [32,33,34,35,36,37,38,39,40,],
	//Keyboard is a class for setting up boolean flags for getting keyboard input
	Keyboard: function(element){
		var k = this;
		element.addEventListener(
			'keyup',
			function(e){
				k.release(e);
			},
			false);
		element.addEventListener(
			'keydown',
			function(e){
				k.press(e);
			},		
			false);
	},
	Mouse: function(element,frame){
		var rect = frame.getBoundingClientRect();
		var x=0,
			y=0,
			left=false,
			right=false,
			onElement=false;
			
		var box={
			x:0,
			y:0,
			width:frame.width,
			height:frame.height
		}
		
		var update = function(evt){//update x and y
			x =	evt.clientX-rect.left;
			y =	evt.clientY-rect.top;
		};
			
		var clickListeners = {};
		
		this.addClickListener=function(id,callback){
			if(typeof id == 'updefined' || typeof callback != 'function') throw "addClickListener: illegal values passed"
			clickListeners[id]=callback;
		}
		
		this.removeClickListener=function(id){
			delete clickListeners[id];
		}
		
		Object.defineProperties(this,{
			x:{
				get:function(){
					return box.x + box.width*(x/(rect.right-rect.left));
				},
				set: function(){}
			},
			y:{
				get:function(){
					return box.y + box.height*(y/(rect.bottom-rect.top));
				},
				set: function(){}
			},
			yInv:{
				get:function(){
					return box.y + (box.height - box.height*(y/(rect.bottom-rect.top)));
				},
				set: function(){}
			},
			left:{
				get:function(){
					return left;
				},
				set: function(){}
			},
			right:{
				get:function(){
					return right;
				},
				set: function(){}
			},
			pressed:{
				get:function(){
					return right || left;
				},
				set: function(){}
			},
			/**
			*	this represents a bounding box that the mouses x and y values are scaled to
			* 	the assigned object must have the properties:
			*		.x(number)
			*		.y(number)
			*		.width(number)
			*		.height(number)
			*	else an exception is thrown
			*/
			box:{
				get:function(){
					return box;
				},
				set:function(newBox){
					if(box!=newBox){
						if(
							typeof box.x == 'number' && 
							typeof box.y == 'number' && 
							typeof box.width == 'number' && 
							typeof box.height == 'number'
								){
							box=newBox;
						}else{
							throw 'Input.Mouse.box: invalid assignment'
						}
					}
				}
			}
		});
		
		element.addEventListener(
			'mouseover',
			function(evt){
				onElement = true;
				update(evt)
			},
			false);
			
		element.addEventListener(
			'mouseout',
			function(evt){
				onElement = false;
				x=0;
				y=0;
				left=false;
				right=false;
			},
			false)
			
		element.addEventListener(
			'mousemove',
			function(evt){
				if(onElement){
					update(evt);
				}
			},
			false)
			
		//prevents right click menue
		element.addEventListener('contextmenu', function(e) {
			e.preventDefault();
			return false;
		},false);
		
		var setMousePressed = function(e,val){
			if ("which" in e){  // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
				if(e.which == 3){
					right = val;
				}else{
					left = val;
				}
			}else if ("button" in e){  // IE, Opera 
				if(e.button == 2){
					right = val;
				}else{
					left = val;
				}
			}
		}
			
		element.addEventListener(
			'mousedown',
			function(e){
				if(onElement){
					setMousePressed(e || window.event,true);
				}
			},
			false);
			
		element.addEventListener(
			'mouseup',
			function(e){
				if(onElement){
					setMousePressed(e || window.event,false);
				}
			},
			false);
			
		element.addEventListener(
			'click',
			function(evt){
				for(var o in clickListeners){
					clickListeners[o](evt);
				}
			},
			false);
		
	}
};

input.Keyboard.prototype = {
	flags: {},
	name: "keys",
	addFlag: function(keycode,name){
		this.addKeyListener(keycode,name,{})
	},
	addKeyListener: function(keycode,name,obj){//adds a flag as well
		//can have functions onPress() and onRelease()
		if(typeof obj != 'object'){
			throw new Error('addKeyListener: object not passed')
		}
		if(typeof obj.onPress != 'function') obj.onPress = function(){};
		if(typeof obj.onRelease != 'function') obj.onRelease = function(){};
		this[name] = false;
		this.flags[keycode] = {name: name,onPress: obj.onPress, onRelease: obj.onRelease};
	},
	press:function(event){
		//window.console.log("up");
		if(this.flags.hasOwnProperty(event.keyCode)){
			for(var i =0;i<input.keys.length;i++ ){
				if(event.keyCode == input.keys[i]){
					event.preventDefault();
					event.returnValue=false;
					break;
				}
			}
			this.flags[event.keyCode].onPress(event);
			this[this.flags[event.keyCode].name]=true;
		}
	},
	release:function(event){
		//window.console.log("down");
		if(this.flags.hasOwnProperty(event.keyCode)){
			this.flags[event.keyCode].onRelease(event);
			this[this.flags[event.keyCode].name]=false;
		}
	}	
};

input.Mouse.prototype={
	onElement: false,
	clickActions: new Array(),
	onClick: function(evt){
		for(var i in this.clickActions){
			this.clickActions[i](evt);
		}
	}
}