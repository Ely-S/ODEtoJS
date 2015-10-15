function Lorenz(){
    //Make sure we use new arguments and create a new instance of the object
    if(!(this instanceof arguments.callee)){
        return new arguments.callee(arguments);
    }
		
		if(!Detector.webgl){
				Detector.addGetWebGLMessage();
		}
		
    //Easily refer to this
    var _this = this,
		
		//Three.js vars
	camera, scene, renderer, stats, geometry, material, mesh, time,
		
	cameraZoom = 50,
		
	//Halfsize of the window
	halfWidth = window.innerWidth / 2,
	halfHeight = window.innerHeight / 2,
		
	//Mouse position
	mouseX = 0,
	mouseY = 0;
    
    //Init method
    _this.init = function(){
				//Create Dat.gui controls
				_this.createControls();
				
				//Scene
				scene = new THREE.Scene();
				
				//Camera
        camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 1, 2200);
        camera.position.x = 600;
				camera.position.y = 0;
				camera.position.z = 600;
        scene.add(camera);
				
				//Renderer
				renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setSize(window.innerWidth, window.innerHeight);
        
				document.body.appendChild(renderer.domElement);
				

				//Add the mouse move event
				document.addEventListener('mousemove', _this.mousemove, false);
				document.addEventListener('DOMMouseScroll', _this.wheel, false);
				//Chrome
				document.addEventListener('mousewheel', _this.wheel, false);
				
				//Initial vars used in Lorenz calculation
				_this.startx = 0.0001; _this.starty = 0.0001; _this.startz = 0.0001;
				_this.modifiedIncriment = 0.001;
				
				//Generate points
				_this.generatePoints();
				
				//Start animation
				_this.animate();
    };
		
		//Mouse move 
		_this.mousemove = function(e){
				mouseX = e.clientX - halfWidth;
				mouseY = (e.clientY - halfHeight) / 10;
		};
		
		//Mouse wheel zoom
		_this.wheel = function(e){
				//Wheel change to 0
				var delta = 0;
				if(!e){
						e = window.event;
				}
				
				//Look for wheel data
				if(e.wheelDelta){
						delta = e.wheelDelta/120; 
				if(window.opera){
						delta = -delta;
				}
				} else if(e.detail){
						delta = -e.detail/3;
				}
				
				cameraZoom = cameraZoom - (delta * 1.5);
		};
		
		//Define initial values for Dat.gui
		_this.LorenzControls = function(){
				this.colorModifier = 70;
				this.totalTime = 180;
				this.timeIncriment = 1;
				this.rhoValue = 28;
				this.randomStart = function(){
						_this.startx = Math.ceil(Math.random() * 40);
						_this.starty = Math.ceil(Math.random() * 40);
						_this.startz = Math.ceil(Math.random() * 40);
						_this.rerenderSettings();
				};
				this.showAxis = false;
		};
		
		//Create the Dat.gui controls
		_this.createControls = function(){
				//Define the Dat.gui controls
				_this.lc = new _this.LorenzControls();
				
				//Create the GUI
				var gui = new dat.GUI({autoPlace: false}),

				//Add 2 folders
				folderShape = gui.addFolder('Render Shape'),
				folderResolution = gui.addFolder('Render Resolution'),
				folderColour = gui.addFolder('Render Colour'),
				
				rhoValue = folderShape.add(_this.lc, 'rhoValue', 10, 40).step(1),
				showAxis = folderShape.add(_this.lc, 'showAxis');
				
				folderShape.add(_this.lc, 'randomStart');
				
				//Folder status
				folderShape.open();
				folderResolution.open();
				folderColour.open();
				
				//Add the GUI to the DOM
				document.body.appendChild(gui.domElement);
		};
		
		//After a Dat.gui change re-render the scene
		_this.rerenderSettings = function(){
				//Remove the WebGL objects
				scene.__webglObjects = [];
				
				//Show the loader
				document.getElementById("loading").style.display = "block";
				
				if(_this.lc.showAxis){
						_this.debugaxis(40);
				}
				
				//Regenerate with new settings
				_this.generatePoints();
		};
		
		_this.generatePoints = function(){
				//Set the initial conditions from the dat.gui modified if needed
				_this.x = _this.startx;
				_this.y = _this.starty;
				_this.z = _this.startz;
				
				var sigma = 10.0,
				beta = 8/3,
				time = 0,
				
				worker = new Worker('js/lorenzPoints.js');
				//Message back from the worker
				worker.addEventListener('message', function(e){
						//Data from the worker
						var data = e.data,
						
						//Geometry and lines
						geometry = new THREE.Geometry(), lineMat, line,
						
						//Loop vars
						i, len = data.length;
						
						for(i = 0; i < len; i++){
								geometry.vertices.push(new THREE.Vertex(new THREE.Vector3(data[i][0], -data[i][1], data[i][2]-25)));
								geometry.colors.push(new THREE.Color().setHSV((data[i][0] + _this.lc.colorModifier)/100, (data[i][2] + _this.lc.colorModifier)/100, (data[i][1] + _this.lc.colorModifier)/100));
						}
						
						//Generate the lines
						lineMat = new THREE.LineBasicMaterial({lineWidth: 1, vertexColors: true});
						line = new THREE.Line(geometry, lineMat);
						
						//Hide the loader
						document.getElementById("loading").style.display = "none";
						scene.add(line);
				}, false);


		};
		
		//Draw helpful axis
		_this.debugaxis = function(axisLength){
				//Shorten the vertex function
				function v(x,y,z){ 
						return new THREE.Vertex(new THREE.Vector3(x,y,z)); 
				}
				
				//Create axis (point1, point2, colour)
				function createAxis(p1, p2, color){
						var line, lineGeometry = new THREE.Geometry(),
						lineMat = new THREE.LineBasicMaterial({color: color, lineWidth: 1});
						lineGeometry.vertices.push(p1, p2);
						line = new THREE.Line(lineGeometry, lineMat);
						scene.add(line);
				}
				
				createAxis(v(-axisLength, 0, 0), v(axisLength, 0, 0), 0xFF0000);
				createAxis(v(0, -axisLength, 0), v(0, axisLength, 0), 0x00FF00);
				createAxis(v(0, 0, -axisLength), v(0, 0, axisLength), 0x0000FF);
		};
		
		//Animate the scene
		this.animate = function(){
				//Update stats
				stats.update();
				
				requestAnimationFrame(this.animate);
				
        this.render();
		};
		
		//Render the scene
		this.render = function(){
				var time = Date.now() * 0.0005;
				
				camera.position.y += (- mouseY - camera.position.y) * 0.05;
				
				camera.position.z = Math.sin( 0.3 * time) *  cameraZoom;
				camera.position.x = Math.cos( 0.3 * time) *  cameraZoom;
				camera.lookAt(new THREE.Vector3(0,0,0));

        renderer.render(scene, camera);
		};
    
    //Initialise
    return _this.init();
}
