//COLORS
var Colors = {
    white:0xFFFBFE,
    blue:0x88CCF1,
    black:0x1B1B1E,
    bearWhite:0xEFF2EF,
    bearGrey:0xD9D9D9,
};

// GAME VARIABLES
var game;
var deltaTime = 0;
var newTime = new Date().getTime();
var oldTime = new Date().getTime();

//THREE RELATED VARIABLES
var scene, camera, fieldOfView, aspectRatio, nearPlane, farPlane, HEIGHT, WIDTH, renderer, container, clock, controls;

function createScene(){
  HEIGHT= window.innerHeight;
  WIDTH= window.innerWidth;

  //create the scene
  scene= new THREE.Scene();
  //create a fog effect
  //scene.fog = new THREE.Fog(0x38AECC, 100, 950);
  //create a clock object
  clock = new THREE.Clock();
  //create the camera
  aspectRatio= WIDTH/HEIGHT;
  fieldOfView= 60;
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
  camera.position.z= 800;
  camera.position.y= 0;
  camera.lookAt(new THREE.Vector3(0,0,0)); 
  //create the renderer
  renderer = new THREE.WebGLRenderer({
    //allow transparency to show the gradient background
    alpha: true,
    //activate the anti-aliasing
    antialias: true
  });

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

var hemisphereLight, shadowLight, ambientLight, backLight;

//ADD LIGHTS IN THE SCENE
function createLights(){
  //a hemisphere light is a gradient light
  hemisphereLight = new THREE.HemisphereLight(0xffffff,0xffffff, .5);

  //a directional light that acts like a sun
  shadowLight = new THREE.DirectionalLight(0xffffff, .2);

  //set the direction of the light
  shadowLight.position.set(200, 200, 200);

  //allow shadow casting
  shadowLight.castShadow = true;
  shadowLight.shadowDarkness = .5;

  //define the visible area of the projected shadow
  shadowLight.shadow.camera.left = -400;
  shadowLight.shadow.camera.right = 400;
  shadowLight.shadow.camera.top = 400;
  shadowLight.shadow.camera.bottom = -400;
  shadowLight.shadow.camera.near = 1;
  shadowLight.shadow.camera.far = 1000;

  //define the resolution of the shadow
  shadowLight.shadow.mapSize.width = 2048;
  shadowLight.shadow.mapSize.height = 2048;

  // an ambient light modifies the global color of a scene and makes the shadows softer
  ambientLight = new THREE.AmbientLight(0xdc8874, .5);

  backLight = new THREE.DirectionalLight(0xffffff, .4);
  backLight.position.set(-100, 200, 50);
  backLight.shadowDarkness = .1;
  backLight.castShadow = true;


  //to activate the lights must be added to the scene
  scene.add(hemisphereLight);
  scene.add(shadowLight);
  scene.add(ambientLight);
  scene.add(backLight);
}

Bear = function(){
	this.bodyInitPositions = [];
	this.bearModel = new THREE.Group();

	this.whiteMat = new THREE.MeshPhongMaterial ({
    color:Colors.bearWhite, 
    shading:THREE.FlatShading
  });
	this.greyMat = new THREE.MeshPhongMaterial ({
    color:Colors.bearGrey, 
    shading:THREE.FlatShading
  });
	this.blackMat = new THREE.MeshPhongMaterial ({
    color:Colors.black, 
    shading:THREE.FlatShading
  });

	var bodyGeom = new THREE.CylinderGeometry(110, 110, 280, 17);
	var faceGeom = new THREE.CylinderGeometry(60, 60, 60, 8);
	var earGeom = new THREE.CylinderGeometry(15, 15, 5, 8);
	var eyeBigGeom = new THREE.CylinderGeometry(8, 8, 4, 8);
	var eyeSmallGeom = new THREE.CylinderGeometry(4, 4, 2, 8);
	var mouthGeom = new THREE.CylinderGeometry(15, 40, 50, 8);
	var noseGeom = new THREE.BoxGeometry(20,20,10);
	noseGeom.vertices[6].x+=3;
	noseGeom.vertices[7].x+=3;
	noseGeom.vertices[2].x-=3;
	noseGeom.vertices[3].x-=3;
	var legGeom = new THREE.BoxGeometry(50,50,150);
	legGeom.vertices[5].x+=8;
	legGeom.vertices[7].x+=8;
	legGeom.vertices[0].x-=8;
	legGeom.vertices[2].x-=8;
	var footGeom = new THREE.BoxGeometry(35,10,20);
	var nailsGeom = new THREE.CylinderGeometry(.5, 5, 10, 10);

	 // body
    this.body = new THREE.Mesh(bodyGeom, this.greyMat);
    this.body.position.z = -60;
    this.body.position.y = 20;
    this.body.rotation.x = Math.PI / 2;

    //Front Right Leg
    this.frontRightLeg = new THREE.Mesh(legGeom, this.whiteMat);
    this.frontRightLeg.position.z = 45;
    this.frontRightLeg.position.y = -120;
    this.frontRightLeg.position.x = 50;
    this.frontRightLeg.rotation.x = Math.PI / 2;
    
    this.frontRightFoot = new THREE.Mesh(footGeom, this.greyMat);
    this.frontRightFoot.position.z = 75;
    this.frontRightFoot.position.y = -190;
    this.frontRightFoot.position.x = 50;
    
    this.frontRightNail1 = new THREE.Mesh(nailsGeom, this.blackMat);
    this.frontRightNail1.position.z = 85;
    this.frontRightNail1.position.y = -190;
    this.frontRightNail1.position.x = 50;
    this.frontRightNail1.rotation.x = Math.PI / 2;

    this.frontRightNail2 = new THREE.Mesh(nailsGeom, this.blackMat);
    this.frontRightNail2.position.z = 85;
    this.frontRightNail2.position.y = -190;
    this.frontRightNail2.position.x = 58;
    this.frontRightNail2.rotation.x = Math.PI / 2;

    this.frontRightNail3 = new THREE.Mesh(nailsGeom, this.blackMat);
    this.frontRightNail3.position.z = 85;
    this.frontRightNail3.position.y = -190;
    this.frontRightNail3.position.x = 42;
    this.frontRightNail3.rotation.x = Math.PI / 2;
    
    this.nailsGroupFR = new THREE.Group();
    this.nailsGroupFR.add(this.frontRightNail1);
    this.nailsGroupFR.add(this.frontRightNail2);
    this.nailsGroupFR.add(this.frontRightNail3);

    this.frontRightLegGroup = new THREE.Group();
    this.frontRightLegGroup.add(this.frontRightLeg);
    this.frontRightLegGroup.add(this.frontRightFoot);
    this.frontRightLegGroup.add(this.nailsGroupFR);
    this.frontRightLegGroup.position.x +=15;

    
    //Front Left Leg
    this.frontLeftLeg = new THREE.Mesh(legGeom, this.whiteMat);
    this.frontLeftLeg.position.z = 45;
    this.frontLeftLeg.position.y = -120;
    this.frontLeftLeg.position.x = -50;
    this.frontLeftLeg.rotation.x = Math.PI / 2;

    this.frontLeftFoot = new THREE.Mesh(footGeom, this.greyMat);
    this.frontLeftFoot.position.z = 75;
    this.frontLeftFoot.position.y = -190;
    this.frontLeftFoot.position.x = -50;

    this.frontLeftNail1 = new THREE.Mesh(nailsGeom, this.blackMat);
    this.frontLeftNail1.position.z = 85;
    this.frontLeftNail1.position.y = -190;
    this.frontLeftNail1.position.x = -50;
    this.frontLeftNail1.rotation.x = Math.PI / 2;

    this.frontLeftNail2 = new THREE.Mesh(nailsGeom, this.blackMat);
    this.frontLeftNail2.position.z = 85;
    this.frontLeftNail2.position.y = -190;
    this.frontLeftNail2.position.x = -58;
    this.frontLeftNail2.rotation.x = Math.PI / 2;

    this.frontLeftNail3 = new THREE.Mesh(nailsGeom, this.blackMat);
    this.frontLeftNail3.position.z = 85;
    this.frontLeftNail3.position.y = -190;
    this.frontLeftNail3.position.x = -42;
    this.frontLeftNail3.rotation.x = Math.PI / 2;
    
    this.nailsGroupFL = new THREE.Group();
    this.nailsGroupFL.add(this.frontLeftNail1);
    this.nailsGroupFL.add(this.frontLeftNail2);
    this.nailsGroupFL.add(this.frontLeftNail3);

    this.frontLeftLegGroup = new THREE.Group();
    this.frontLeftLegGroup.add(this.frontLeftLeg);
    this.frontLeftLegGroup.add(this.frontLeftFoot);
    this.frontLeftLegGroup.add(this.nailsGroupFL);
    this.frontLeftLegGroup.position.x -=15;


    //Back Left Leg
    this.backLeftLeg = new THREE.Mesh(legGeom, this.whiteMat);
    this.backLeftLeg.position.z = -165;
    this.backLeftLeg.position.y = -120;
    this.backLeftLeg.position.x = -50;
    this.backLeftLeg.rotation.x = Math.PI / 2;

    this.backLeftFoot = new THREE.Mesh(footGeom, this.greyMat);
    this.backLeftFoot.position.z = -135;
    this.backLeftFoot.position.y = -190;
    this.backLeftFoot.position.x = -50;

    this.backLeftNail1 = new THREE.Mesh(nailsGeom, this.blackMat);
    this.backLeftNail1.position.z = -125;
    this.backLeftNail1.position.y = -190;
    this.backLeftNail1.position.x = -50;
    this.backLeftNail1.rotation.x = Math.PI / 2;

    this.backLeftNail2 = new THREE.Mesh(nailsGeom, this.blackMat);
    this.backLeftNail2.position.z = -125;
    this.backLeftNail2.position.y = -190;
    this.backLeftNail2.position.x = -58;
    this.backLeftNail2.rotation.x = Math.PI / 2;

    this.backLeftNail3 = new THREE.Mesh(nailsGeom, this.blackMat);
    this.backLeftNail3.position.z = -125;
    this.backLeftNail3.position.y = -190;
    this.backLeftNail3.position.x = -42;
    this.backLeftNail3.rotation.x = Math.PI / 2;
    
    this.nailsGroupBL = new THREE.Group();
    this.nailsGroupBL.add(this.backLeftNail1);
    this.nailsGroupBL.add(this.backLeftNail2);
    this.nailsGroupBL.add(this.backLeftNail3);

    this.backLeftLegGroup = new THREE.Group();
    this.backLeftLegGroup.add(this.backLeftLeg);
    this.backLeftLegGroup.add(this.backLeftFoot);
    this.backLeftLegGroup.add(this.nailsGroupBL);
    this.backLeftLegGroup.position.x -=15;


    //Back Right Leg
    this.backRightLeg = new THREE.Mesh(legGeom, this.whiteMat);
    this.backRightLeg.position.z = -165;
    this.backRightLeg.position.y = -120;
    this.backRightLeg.position.x = 50;
    this.backRightLeg.rotation.x = Math.PI / 2;

    this.backRightFoot = new THREE.Mesh(footGeom, this.greyMat);
    this.backRightFoot.position.z = -135;
    this.backRightFoot.position.y = -190;
    this.backRightFoot.position.x = 50;

    this.backRightNail1 = new THREE.Mesh(nailsGeom, this.blackMat);
    this.backRightNail1.position.z = -125;
    this.backRightNail1.position.y = -190;
    this.backRightNail1.position.x = 50;
    this.backRightNail1.rotation.x = Math.PI / 2;

    this.backRightNail2 = new THREE.Mesh(nailsGeom, this.blackMat);
    this.backRightNail2.position.z = -125;
    this.backRightNail2.position.y = -190;
    this.backRightNail2.position.x = 58;
    this.backRightNail2.rotation.x = Math.PI / 2;

    this.backRightNail3 = new THREE.Mesh(nailsGeom, this.blackMat);
    this.backRightNail3.position.z = -125;
    this.backRightNail3.position.y = -190;
    this.backRightNail3.position.x = 42;
    this.backRightNail3.rotation.x = Math.PI / 2;
    
    this.nailsGroupBR = new THREE.Group();
    this.nailsGroupBR.add(this.backRightNail1);
    this.nailsGroupBR.add(this.backRightNail2);
    this.nailsGroupBR.add(this.backRightNail3);

    this.backRightLegGroup = new THREE.Group();
    this.backRightLegGroup.add(this.backRightLeg);
    this.backRightLegGroup.add(this.backRightFoot);
    this.backRightLegGroup.add(this.nailsGroupBR);
    this.backRightLegGroup.position.x +=15;

    //face
    this.face = new THREE.Mesh(faceGeom, this.whiteMat);
    this.face.position.z = 120;
    this.face.position.y = 40;
    this.face.rotation.x = Math.PI / 2;

    //ears
    this.rightEar = new THREE.Mesh(earGeom, this.whiteMat);
    this.rightEar.position.z = 120;
    this.rightEar.position.y = 90;
    this.rightEar.position.x = 40;
    this.rightEar.rotation.x = Math.PI / 2;

    this.leftEar = new THREE.Mesh(earGeom, this.whiteMat);
    this.leftEar.position.z = 120;
    this.leftEar.position.y = 90;
    this.leftEar.position.x = -40;
    this.leftEar.rotation.x = Math.PI / 2;

    //mouth
    this.mouth = new THREE.Mesh(mouthGeom, this.whiteMat);
    this.mouth.position.z = 175;
    this.mouth.position.y = 30;
    this.mouth.rotation.x = Math.PI / 2;

    //nose
    this.nose = new THREE.Mesh(noseGeom, this.blackMat);
    this.nose.position.z = 200;
    this.nose.position.y = 30;

    //eyes
    this.rightBigEye= new THREE.Mesh(eyeBigGeom, this.greyMat);
    this.rightBigEye.position.z = 150;
    this.rightBigEye.position.y = 70;
    this.rightBigEye.position.x = 30;
    this.rightBigEye.rotation.x = Math.PI / 2;

    this.rightSmallEye = new THREE.Mesh(eyeSmallGeom, this.blackMat);
    this.rightSmallEye.position.z = 152;
    this.rightSmallEye.position.y = 70;
    this.rightSmallEye.position.x = 30;
    this.rightSmallEye.rotation.x = Math.PI / 2;

    this.leftBigEye= new THREE.Mesh(eyeBigGeom, this.greyMat);
    this.leftBigEye.position.z = 150;
    this.leftBigEye.position.y = 70;
    this.leftBigEye.position.x = -30;
    this.leftBigEye.rotation.x = Math.PI / 2;

    this.leftSmallEye = new THREE.Mesh(eyeSmallGeom, this.blackMat);
    this.leftSmallEye.position.z = 152;
    this.leftSmallEye.position.y = 70;
    this.leftSmallEye.position.x = -30;
    this.leftSmallEye.rotation.x = Math.PI / 2;



    this.headGroup = new THREE.Group();
    this.headGroup.add(this.face);
    this.headGroup.add(this.rightEar);
    this.headGroup.add(this.leftEar);
    this.headGroup.add(this.mouth);
    this.headGroup.add(this.nose);
    this.headGroup.add(this.rightBigEye);
    this.headGroup.add(this.leftBigEye);
    this.headGroup.add(this.rightSmallEye);
    this.headGroup.add(this.leftSmallEye);
    this.headGroup.position.y +=25;


    this.bearModel.add(this.body);
    this.bearModel.add(this.frontRightLegGroup);
    this.bearModel.add(this.frontLeftLegGroup);
    this.bearModel.add(this.backLeftLegGroup);
    this.bearModel.add(this.backRightLegGroup);
    this.bearModel.add(this.headGroup);

}

function createBear(){
  bear = new Bear();
  scene.add(bear.bearModel);
}

function loop(){

  newTime = new Date().getTime();
  deltaTime = newTime-oldTime;
  oldTime = newTime;

  //TWEEN.update();
  var timeElapsed = clock.getElapsedTime();
 
  
  ambientLight.intensity += (.5 - ambientLight.intensity)*deltaTime*0.005;
  
  renderer.render(scene, camera);
  controls.update();
  requestAnimationFrame(loop);

}

function init(){

  //UI
  //energyBar = document.getElementById("energyBar");
  //resetGame();

  //set up the scene, camera and the renderer
  createScene();

  //add the lights
  createLights();

  //add the objects
  createBear();
  //createSea();
  //createIce();

  //add the listener for the mouse interaction
  //document.addEventListener('mousemove', handleMouseMove, false);
  //document.addEventListener('touchmove', handleTouchMove, false);
  //document.addEventListener('mouseup', handleMouseUp, false);
  //document.addEventListener('touchend', handleTouchEnd, false);

  //start a loop that will update object's position
  //and render the scene on each frame
  loop();
}

window.addEventListener('load', init, false);


function handleWindowResize(){
  //update height and width of the renderer and the camera
  HEIGHT= window.innerHeight;
  WIDTH= window. innerWidth;
  renderer.setSize(WIDTH,HEIGHT);
  camera.aspect = WIDTH/HEIGHT;
  camera.updateProjectionMatrix();
}