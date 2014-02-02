//this javascript file is responsible for setting up the engine and loading all of the other script files

//global object to hold all of the component objects
gameComponents = new Array();

function importS(filename){
	document.write('<script type="text/javascript" src='+filename+'><\/script>');
}

function loadSource(){
	//list script files in order here
	var scriptSource = [
		'misc.js',
		'utils/input.js',
		'utils/collisions.js',
		'utils/geometry.js',
		'utils/ObjectPool.js',
		'components/loop.js',
		'components/ticker/ticker.js',
		'components/physics/physics.js',
		'components/graphics/graphics.js',
		'components/sound/sound.js',
		'entities/entities.js'
	]
	
	for(var i in scriptSource){
		document.write('<script type="text/javascript" src='+scriptSource[i]+'><\/script>')
	}
}

//initializes the keyboard and mouse objects
function initInput(){
	keyboard = new input.Keyboard(window);
	keyboard.addFlag(38,"up");
	keyboard.addFlag(40,"down");
	keyboard.addFlag(37,"left");
	keyboard.addFlag(39,"right");
	keyboard.addFlag(32,"space");
	keyboard.addFlag(87,"w");
	keyboard.addFlag(65,"a");
	keyboard.addFlag(83,"s");
	keyboard.addFlag(68,"d");
	keyboard.addFlag(69,"e");
	keyboard.addFlag(81,"q");
	keyboard.addFlag(33,"page_up");
	keyboard.addFlag(34,"page_down");
	keyboard.addFlag(13,'enter');
	keyboard.addFlag(48,'_0');
	keyboard.addFlag(49,'_1');
	keyboard.addFlag(50,'_2');
	keyboard.addFlag(51,'_3');
	keyboard.addFlag(52,'_4');
	keyboard.addFlag(53,'_5');
	keyboard.addFlag(54,'_6');
	keyboard.addFlag(55,'_7');
	keyboard.addFlag(56,'_8');
	keyboard.addFlag(57,'_9');
	
	keyboard.addKeyListener(80,'p',(function(){
		var pressed = false;
		return {
			onPress:function(){
				if(!pressed){
					pressed = true;
					Loop.paused = !Loop.paused;
				}
			},
			onRelease:function(){
				pressed = false;
			}
		}
		})()
	);
	
	keyboard.addKeyListener(27,'esc',(function(){
		var pressed = false;
		return {
			onPress:function(){
				if(!pressed){
					pressed = true;
					Entities.player.getInstance(0).physState.set(0,0,0,0,0,0);
				}
			},
			onRelease:function(){
				pressed = false;
			}
		}
		})()
	);
	
	mouse = new input.Mouse(window,document.getElementById("Display"));
}


//initialization code goes here
function init(){
	for(var i in gameComponents){
		Loop.add(gameComponents[i])
	}
	Loop.add(Entities)
	Loop.start();
	initScene();
}

function initScene(){
	var currentScreen = graphics.getScreen('gl_main');
	mouse.box = currentScreen;
	
	Entities.player.newInstance(currentScreen.width/2,currentScreen.height/2);
	
	//fps counter using a simple low pass filter
	var fpsCounter = (function(){
		var element = document.getElementById('fps');
		var filterStrength = 10;
		var frameTime = 0, lastLoop = new Date, thisLoop;
		return {
			tick: function(delta){
				var thisFrameTime = (thisLoop=Date.now()) - lastLoop;
				frameTime+= (thisFrameTime - frameTime) / filterStrength;
				lastLoop = thisLoop;
				var fps = 'fps: '+(1000/frameTime);
				element.innerHTML = fps;
			}
		}
	})();
	
	ticker.add(fpsCounter);
	
	var cursor = fillProperties(new GLDrawable(),(function(){
		var first = true;
		var x=0, y=0;
		return{
			draw: function(gl,delta,screen,manager,pMatrix,mvMatrix){
				var r = 1,g = 1,b=1;
				if(mouse.left){
					g = 0;
				}
				if(mouse.right){
					b=0;
				}
				manager.point(mouse.x,mouse.yInv,0,12,r,g,b,1);
			},
			tick: function(){
				x = mouse.x;
				y = mouse.yInv;
				this.x=x-6;
				this.y=y-6;
			},
			width:12,
			height:12
		};
	})());
	graphics.addToDisplay(cursor,"gl_main")
	ticker.add(cursor);
	
	var testLines= [
		0.0, 0.0,	512, 0.0,
		512, 0.0,   512, 128,
		512, 128,   640, 128,
		640, 128,   640, 0,
		640, 0,     1152, 0,
		1152, 0,    1152, 512,
		1152,512,   640, 512,
		640, 512,   640, 394,
		640, 394,   512, 394,
		512, 394,   512, 512,
		512, 512,   0.0, 512,
		0.0, 512,	0.0, 0.0
	]
	
	physics.setGeometry(testLines);
	
	var testMap = fillProperties(new GLDrawable(),{
		draw:function(gl,delta,screen,manager,pMatrix,mvMatrix){
			manager.stroke(1,1,0,1);
			for(var i = 2; i<testLines.length; i+=2){
				manager.line(testLines[i-2],testLines[i-1],testLines[i],testLines[i+1],98);
			}
		},
		x: 0,
		y: 0,
		width: 512,
		height: 512
	});
	
	graphics.addToDisplay(testMap,"gl_main")
}

//initializes game
loadSource();
document.addEventListener("DOMContentLoaded", function(){initInput();init();}, false);