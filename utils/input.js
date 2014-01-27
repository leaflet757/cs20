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
			pressed=false,
			m=this,
			update = function(evt){//update x and y
				x=evt.clientX - rect.left;
				y=evt.clientY - rect.top;
			};
			
		var clickListeners = {};
		
		this.addClickListener=function(id,callback){
			if(typeof id == 'updefined' || typeof callback != 'function') throw "addClickListener: illegal values passed"
			clickListeners[id]=callback;
		}
		
		this.removeClickListener=function(id){
			delete clickListeners[id];
		}
		
		Object.defineProperty(this,'x',{
			get:function(){
				return x;
			},
			set: function(){}
		});
		
		Object.defineProperty(this,'y',{
			get:function(){
				return y;
			},
			set: function(){}
		});
		
		Object.defineProperty(this,'yInv',{
			get:function(){
				return (rect.bottom-rect.top)-y;
			},
			set: function(){}
		});
		
		Object.defineProperty(this,'pressed',{
			get:function(){
				return pressed;
			},
			set: function(){}
		});
		
		element.addEventListener(
			'mouseover',
			function(evt){
				m.onElement = true;
				update(evt)
			},
			false);
			
		element.addEventListener(
			'mouseout',
			function(evt){
				m.onElement = false;
				x=0;
				y=0;
				pressed=false;
			},
			false)
			
		element.addEventListener(
			'mousemove',
			function(evt){
				if(m.onElement){
					update(evt);
				}
			},
			false)
			
		element.addEventListener(
			'mousedown',
			function(evt){
				if(m.onElement){
					pressed = true;
				}
			},
			false);
			
		element.addEventListener(
			'mouseup',
			function(evt){
				if(m.onElement){
					pressed = false;
				}
			},
			false);
			
		element.addEventListener(
			'click',
			function(evt){
				for(var o in clickListeners){
					clickListeners[o].call(evt);
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