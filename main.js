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
		'utils/geometry.js',
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
	mouse = new input.Mouse(window,document.getElementById("Display"));
}


//initialization code goes here
function init(){
	for(var i in gameComponents){
		Loop.add(gameComponents[i])
	}
	Loop.add(Entities)
	
	var currentScreen = graphics.getScreen('gl_main');
	
	var glTester = fillProperties(new GLDrawable(),
	{
		time:1,
		glInit:function(manager){
			manager.addArrayBuffer('testVert',true,
				[
				0.0, 64, 0.0,
				-64, -64, 0.0,
				64, -64, 0.0
				],3,3);
			
			manager.addArrayBuffer('testColor',true,
				[
				1.0, 0.0, 0.0, 1.0,
				0.0, 1.0, 0.0, 1.0,
				0.0, 0.0, 1.0, 1.0
				],3,4);
		},
		glDelete:function(){
			manager.removeArrayBuffer('testVert');
			manager.removeArrayBuffer('testColor');
		},
		draw:function(gl,delta,screen,manager,pMatrix,mvMatrix){
			if(this.time>10)this.time=1;
			
			manager.bindProgram('noise');
			
			manager.setArrayBufferAsProgramAttribute('testVert','noise','vertexPosition');
			
			gl.uniform1f(manager.getProgram('noise').time,this.time++);
			
			mvMatrix.translate(128,128,0);
			manager.setMatrixUniforms('noise',pMatrix,mvMatrix.current);
			gl.drawArrays(gl.TRIANGLES,0,3);
		},
		x:0,
		y:0,
		width:128,
		height:128
	})
	
	graphics.addToDisplay(glTester,'gl_main');
	
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
				manager.point(mouse.x+12,mouse.yInv,0,12,1,1,1,1)
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
	
	// var follower = fillProperties(new GLDrawable(),{
		// xs: new Array(),
		// ys: new Array(),
		// dist: 60,
		// tick: function(delta){
			// var player = Entities.player.getInstance(0);
			// if(this.xs.length>=this.dist){
				// this.x=this.xs.shift();
				// this.y=this.ys.shift();
			// }
			// this.xs.push(player.physState.x);
			// this.ys.push(player.physState.y);
		// },
		// glInit: function(manager){
		// },
		// glDelete: function(manager){
			
		// },
		// draw: function(gl,delta,screen,manager,pMatrix,mvMatrix){
			// manager.fill(1.0,1.0,0,1);
			// manager.stroke(0,0,1,1);
			// manager.fillRect(this.x,this.y,-5,this.width*2,this.height,0);
			// manager.strokeRect(this.x,this.y,-5,this.width*2,this.height,0);
			// var player = Entities.player.getInstance(0)
			// manager.stroke(1,1,1,1)
			// manager.line(this.x,this.y,player.physState.x,player.physState.y,0);
		// },
		// x:0,
		// y:0,
		// width:64,
		// height:64
	// });
	// graphics.addToDisplay(follower,"gl_main")
	// ticker.add(follower);
	Loop.start();
}


//initializes engine
loadSource();
document.addEventListener("DOMContentLoaded", function(){initInput();init();}, false);