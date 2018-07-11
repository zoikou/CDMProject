//COLORS
var Colors = {
    white:0xFFFBFE,
    black:0x1B1B1E,
    rhinoGrey:0x82735C,
    darkGreen:0x1F2421,
    green:0x49A078,
    blue:0x6CD4FF,
    cyan:0xD5FFF3,
    brown:0x775144, 
    lightGreen: 0x7CFFCB,
};

// GAME VARIABLES
var game, fieldGameOver, fieldDistance, levelInterval;
//SCENE VARIABLES
var rhino, machine, tree, cutTree, trunks;

//THREE RELATED VARIABLES
var scene, camera, fieldOfView, aspectRatio, nearPlane, farPlane, HEIGHT, WIDTH, renderer, container, clock, controls,
    windowHalfX,
  	windowHalfY,
    mousePos = {x:0,y:0};

function gameStart(){
  game = {
            delta : 0,
			floorRadius : 200,
			speed : 6,
			distance : 0,
			level : 1,
			levelUpdateFreq : 3000,
			initSpeed : 5,
			maxSpeed : 48,
			machinePos : .65,
			machinePosTarget : .65,
			floorRotation : 0,
			collisionObstacle : 10,
			collisionBonus : 20,
			status : "play",
			cameraPosGame : 160,
			cameraPosGameOver : 260,
			machineAcceleration : 0.004,
			malusClearColor : 0xb44b39,
			malusClearAlpha : 0,
         };
}

function createScene(){
  HEIGHT= window.innerHeight;
  WIDTH= window.innerWidth;
  windowHalfX = WIDTH / 2;
  windowHalfY = HEIGHT / 2;
  //create the scene
  scene= new THREE.Scene();
  //create a fog effect
  //scene.fog = new THREE.Fog(0x38AECC, 100, 950);
  //create a clock object
  clock = new THREE.Clock();
  //create the camera
  aspectRatio= WIDTH/HEIGHT;
  fieldOfView= 50;
  nearPlane= 1;
  farPlane= 2000;
  camera = new THREE.PerspectiveCamera(
    fieldOfView,
    aspectRatio,
    nearPlane,
    farPlane
    );

  //set the position of the camera
  camera.position.x= 0;
  camera.position.z= 160;
  camera.position.y= 30;
  camera.lookAt(new THREE.Vector3(0,30,0)); 
  //create the renderer
  renderer = new THREE.WebGLRenderer({
    //allow transparency to show the gradient background
    alpha: true,
    //activate the anti-aliasing
    antialias: true
  });
  
  renderer.setPixelRatio(window.devicePixelRatio); 
  renderer.setClearColor( 0xb44b39, 0);
  //define the size of the renderer, which will fill the entire screen
  renderer.setSize(WIDTH,HEIGHT);

  //enable shadow rendering
  renderer.shadowMap.enabled = true;

  //add the DOM element of the renderer to the container element created in HTML
  container = document.getElementById('world');
  container.appendChild(renderer.domElement);

  controls = new THREE.OrbitControls(camera, renderer.domElement);

  // listen to the screen: if the user resizes it, the camera and the renderer size should be updated
  window.addEventListener('resize', handleWindowResize, false);
}

var globalLight, shadowLight;

//ADD LIGHTS IN THE SCENE
function createLights(){
  globalLight = new THREE.AmbientLight(0xffffff, .9);

  shadowLight = new THREE.DirectionalLight(0xffffff, 1);
  shadowLight.position.set(-30, 40, 20);
  shadowLight.castShadow = true;
  shadowLight.shadow.camera.left = -400;
  shadowLight.shadow.camera.right = 400;
  shadowLight.shadow.camera.top = 400;
  shadowLight.shadow.camera.bottom = -400;
  shadowLight.shadow.camera.near = 1;
  shadowLight.shadow.camera.far = 2000;
  shadowLight.shadow.mapSize.width = shadowLight.shadow.mapSize.height = 2048;

  scene.add(globalLight);
  scene.add(shadowLight);
}

Rhino = function(){
	this.status = "running";
    this.runningCycle = 0;
    this.mesh = new THREE.Group();
    this.body = new THREE.Group();
    this.legBR = new THREE.Group();
    this.legFR = new THREE.Group();
    this.head = new THREE.Group();
    this.mesh.add(this.body);

    this.whiteMat = new THREE.MeshPhongMaterial ({
    color:Colors.white, 
    shading:THREE.FlatShading
  });
	this.greyMat = new THREE.MeshPhongMaterial ({
    color:Colors.rhinoGrey, 
    shading:THREE.FlatShading
  });
	this.blackMat = new THREE.MeshPhongMaterial ({
    color:Colors.black, 
    shading:THREE.FlatShading
  });

	var torsoGeom = new THREE.CylinderGeometry(10, 10, 25, 5);
	var legPart1Geom = new THREE.CylinderGeometry(2.2, 1.5, 3, 32);
	var legPart2Geom = new THREE.CylinderGeometry(1.5, 2.2, 6, 32);
	var legPart3Geom = new THREE.BoxGeometry(5, 2, 5);
	legPart3Geom.vertices[5].x+=1;
	legPart3Geom.vertices[4].x+=1;
	legPart3Geom.vertices[0].x-=1;
	legPart3Geom.vertices[1].x-=1;
	legPart3Geom.vertices[5].z-=1;
	legPart3Geom.vertices[4].z+=1;
	legPart3Geom.vertices[0].z-=1;
	legPart3Geom.vertices[1].z+=1;
	var faceGeom = new THREE.CylinderGeometry(5, 4, 9, 6);
	var bigEye = new THREE.BoxGeometry(2,2,.2);
	var smallEye = new THREE.BoxGeometry(.8,.8,.2);
	var ear = new THREE.BoxGeometry(1,5,3);
	var mouth = new THREE.BoxGeometry(1,.5,7);
	var nostril = new THREE.SphereGeometry( .5, 32, 32 );
	var horn1 = new THREE.CylinderGeometry( .1, 1.5, 8, 32 );
	var horn2 = new THREE.CylinderGeometry( .1, 2, 1.2, 32 );
	var tailGeom = new THREE.CylinderGeometry(.5,1, 20, 4, 1);
    tailGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0,10,0));
    tailGeom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));
    tailGeom.applyMatrix(new THREE.Matrix4().makeRotationZ(Math.PI/4));

    
    //body
	this.torso = new THREE.Mesh(torsoGeom, this.greyMat);
	this.torso.rotation.z = Math.PI/2;
	this.torso.rotation.x = Math.PI/3.5;
    this.torso.castShadow = true;
    this.body.add(this.torso);
    
    //Back Right Leg
    this.thighB = new THREE.Mesh(legPart1Geom, this.greyMat);
    this.thighB.castShadow = true;
    this.legBR.add(this.thighB);

    this.calfB = new THREE.Mesh(legPart2Geom, this.greyMat);
    this.calfB.position.y = -7;
    this.calfB.position.x = 1;
    this.calfB.castShadow = true;
    this.legBR.add(this.calfB);

    this.footB = new THREE.Mesh(legPart3Geom, this.greyMat);
    this.footB.position.y = -10;
    this.footB.position.x = 1;
    this.footB.castShadow = true;
    this.legBR.add(this.footB);

    this.legBR.position.y = -9;
    this.legBR.position.z = -4;
    this.legBR.position.x = -8;

    //Back Left Leg
    this.legBL = this.legBR.clone();
    this.legBL.position.y = -9;
    this.legBL.position.z = 4;
    this.legBL.position.x = -8;
    
    //Front Right Leg
    this.thighF = new THREE.Mesh(legPart1Geom, this.greyMat);
    this.thighF.castShadow = true;
    this.legFR.add(this.thighF);

    this.calfF = new THREE.Mesh(legPart2Geom, this.greyMat);
    this.calfF.position.y = -7;
    this.calfF.castShadow = true;
    this.legFR.add(this.calfF);

    this.footF = new THREE.Mesh(legPart3Geom, this.greyMat);
    this.footF.position.y = -10;
    this.footF.castShadow = true;
    this.legFR.add(this.footF);

    this.legFR.position.y = -9;
    this.legFR.position.z = -4;
    this.legFR.position.x = 8;
    
    //Front Left Leg
    this.legFL = this.legFR.clone();
    this.legFL.position.y = -9;
    this.legFL.position.z = 4;
    this.legFL.position.x = 8;

    //Face
    this.face =  new THREE.Mesh(faceGeom, this.greyMat);
    this.face.rotation.z = Math.PI/2;
    this.face.castShadow = true
    this.head.add(this.face);

    //Eyes
    this.bigEyeR = new THREE.Mesh(bigEye, this.whiteMat);
    this.bigEyeR.rotation.x = -Math.PI/6;
    this.bigEyeR.position.z = 3;
    this.bigEyeR.position.y = 3;
    this.bigEyeR.castShadow = true
    this.head.add(this.bigEyeR);

    this.smallEyeR = new THREE.Mesh(smallEye, this.blackMat);
    this.smallEyeR.rotation.x = -Math.PI/6;
    this.smallEyeR.position.z = 3.2;
    this.smallEyeR.position.y = 3;
    this.smallEyeR.castShadow = true
    this.head.add(this.smallEyeR);

    this.bigEyeL = new THREE.Mesh(bigEye, this.whiteMat);
    this.bigEyeL.rotation.x = Math.PI/6;
    this.bigEyeL.position.z = -3;
    this.bigEyeL.position.y = 3;
    this.bigEyeL.castShadow = true
    this.head.add(this.bigEyeL);

    this.smallEyeL = new THREE.Mesh(smallEye, this.blackMat);
    this.smallEyeL.rotation.x = Math.PI/6;
    this.smallEyeL.position.z = -3.2;
    this.smallEyeL.position.y = 3;
    this.smallEyeL.castShadow = true
    this.head.add(this.smallEyeL);

    //nostrils
    this.nostrilR = new THREE.Mesh(nostril, this.blackMat);
    this.nostrilR.position.z = 2.6;
    this.nostrilR.position.y = 2.5;
    this.nostrilR.position.x = 4.1;
    this.nostrilR.castShadow = true
    this.head.add(this.nostrilR);

    this.nostrilL = new THREE.Mesh(nostril, this.blackMat);
    this.nostrilL.position.z = -2.6;
    this.nostrilL.position.y = 2.5;
    this.nostrilL.position.x = 4.1;
    this.nostrilL.castShadow = true
    this.head.add(this.nostrilL);

    //mouth
    this.mouth = new THREE.Mesh(mouth, this.blackMat);
    this.mouth.position.y = -2;
    this.mouth.position.x = 4;
    this.mouth.castShadow = true
    this.head.add(this.mouth);

    //horns
    this.bigHorn = new THREE.Mesh(horn1, this.whiteMat);
    this.bigHorn.position.y = 7;
    this.bigHorn.position.x = 2.5;
    this.bigHorn.castShadow = true
    this.head.add(this.bigHorn);

    this.smallHorn = new THREE.Mesh(horn2, this.whiteMat);
    this.smallHorn.position.y = 4.5;
    this.smallHorn.position.x = -1.2;
    this.smallHorn.castShadow = true
    this.head.add(this.smallHorn);

    this.head.position.x = 18;
    this.head.position.y = 4;

    //tail
     this.tail = new THREE.Mesh(tailGeom, this.greyMat);
     this.tail.position.x = -4;
     this.tail.position.y = 7;
     this.tail.rotation.y = Math.PI/2;

     //ears 
     this.earR = new THREE.Mesh(ear, this.greyMat);
     this.earR.position.y = 4.5;
     this.earR.position.x = -3.5;
     this.earR.position.z = 3;
     this.earR.rotation.x = Math.PI/9;
     this.earR.castShadow = true
     this.head.add(this.earR);

     this.earL = new THREE.Mesh(ear, this.greyMat);
     this.earL.position.y = 4.5;
     this.earL.position.x = -3.5;
     this.earL.position.z = -3;
     this.earL.rotation.x = -Math.PI/9;
     this.earL.castShadow = true
     this.head.add(this.earL);

    this.body.add(this.legBR);
    this.body.add(this.legBL);
    this.body.add(this.legFR);
    this.body.add(this.legFL);
    this.body.add(this.head);
    this.body.add(this.tail);



}

function createRhino() {
  rhino = new Rhino();
  //rhino.mesh.rotation.y = Math.PI/2;
  rhino.mesh.position.y = 30;
  rhino.mesh.position.z = 60;
  scene.add(rhino.mesh);
  //hero.nod();
}

function createFloor() {
  
  floorShadow = new THREE.Mesh(new THREE.SphereGeometry(game.floorRadius, 50, 50), new THREE.MeshPhongMaterial({
    color: Colors.green,
    specular:0x000000,
    shininess:1,
    transparent:true,
    opacity:.5
  }));
  //floorShadow.rotation.x = -Math.PI / 2;
  floorShadow.receiveShadow = true;
  
  floorGrass = new THREE.Mesh(new THREE.SphereGeometry(game.floorRadius-.5, 50, 50), new THREE.MeshBasicMaterial({
    color: Colors.green
  }));
  //floor.rotation.x = -Math.PI / 2;
  floorGrass.receiveShadow = false;
  
  floor = new THREE.Group();
  floor.position.y = -game.floorRadius;
  
  floor.add(floorShadow);
  floor.add(floorGrass);
  scene.add(floor);
  
}

function loop(){
  game.delta = clock.getDelta();
  //updateFloorRotation();
  
  /*if (gameStatus == "play"){
    
    if (hero.status == "running"){
      hero.run();
    }
    updateDistance();
    updateMonsterPosition();
    updateCarrotPosition();
    updateObstaclePosition();
    checkCollision();
  }*/
  
  controls.update();
  renderer.render(scene, camera); 
  requestAnimationFrame(loop);
}

function init(){

  //UI
  temperatureBar = document.getElementById("energyBar");
  nowOrNeverMessage = document.getElementById("startToCareMessage");
  gameStart();

  //set up the scene, camera and the renderer
  createScene();

  //add the lights
  createLights();

  //add the objects
  createFloor();
  createRhino();
  //createSea();
  //createIceberg();
  //createSnow();

  //add the listener for the mouse interaction
  document.addEventListener('mousedown', handleMouseDown, false);
  document.addEventListener('touchend', handleMouseDown, false);

  //start a loop that will update object's position
  //and render the scene on each frame
  loop();
}

window.addEventListener('load', init, false);


function handleWindowResize(){
  //update height and width of the renderer and the camera
  HEIGHT= window.innerHeight;
  WIDTH= window. innerWidth;
  windowHalfX = WIDTH / 2;
  windowHalfY = HEIGHT / 2;
  renderer.setSize(WIDTH,HEIGHT);
  camera.aspect = WIDTH/HEIGHT;
  camera.updateProjectionMatrix();
}

function handleMouseDown(event) {
   
}

//function used from Karim Maaloul in codepen
function normalize(v,vmin,vmax,tmin, tmax){

  var nv = Math.max(Math.min(v,vmax), vmin);
  var dv = vmax-vmin;
  var pc = (nv-vmin)/dv;
  var dt = tmax-tmin;
  var tv = tmin + (pc*dt);
  return tv;

}