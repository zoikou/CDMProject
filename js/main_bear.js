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
var newTime = new Date().getTime();
var oldTime = new Date().getTime();
//audios downloaded from https://freesound.org/
var audio = new Audio('assets/audio/wind.mp3');
var audio2 = new Audio('assets/audio/wrong.wav');

//SCENE VARIABLES
var sea, snowFlake, bear, snow, iceberg;

//THREE RELATED VARIABLES
var scene, camera, fieldOfView, aspectRatio, nearPlane, farPlane, HEIGHT, WIDTH, renderer, container, clock, controls,
    windowHalfX,
  	windowHalfY,
    mousePos = {x:0,y:0};

//LIGHTS
var hemisphereLight, shadowLight, ambientLight, backLight;

function resetGame(){
  game = {
          deltatime: 0,
          fallSpeed: .001,
          temperature:100,
          freezingValue:1,
          status : "playing",
          isDrowning : false,
          isMelting : true,
          isSnowing : false,
          isFreezing : false,
         };
}

function createScene(){
  HEIGHT= window.innerHeight;
  WIDTH= window.innerWidth;
  windowHalfX = WIDTH / 2;
  windowHalfY = HEIGHT / 2;
  //create the scene
  scene= new THREE.Scene();

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

  //controls = new THREE.OrbitControls(camera, renderer.domElement);

  // listen to the screen: if the user resizes it, the camera and the renderer size should be updated
  window.addEventListener('resize', handleWindowResize, false);
}


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

SnowFlake = function(){
	this.isFreezing = false;
	this.speed = 0;
	this.acceleration=0;

	this.blueMat = new THREE.MeshPhongMaterial({
		color: Colors.blue,
		shading:THREE.FlatShading
	});

    var mainGeom = new THREE.BoxGeometry(4,60,2)
    var smallGeom = new THREE.BoxGeometry(2,15,2)
    smallGeom.applyMatrix( new THREE.Matrix4().makeTranslation( 0,8,0) );

    //geometry
    var iceFlake1 = new THREE.Mesh(mainGeom, this.blueMat);
    var smallIce1 = new THREE.Mesh(smallGeom, this.blueMat);
    smallIce1.rotation.z= Math.PI/4;
    smallIce1.position.y= 20;
    var smallIce2 = new THREE.Mesh(smallGeom, this.blueMat);
    smallIce2.rotation.z= -Math.PI/4;
    smallIce2.position.y= 20;
    var smallIce3 = new THREE.Mesh(smallGeom, this.blueMat);
    smallIce3.rotation.z= Math.PI/4 * 3;
    smallIce3.position.y= -20;
    var smallIce4 = new THREE.Mesh(smallGeom, this.blueMat);
    smallIce4.rotation.z= -Math.PI/4 * 3;
    smallIce4.position.y= -20;


    this.iceFlakeGroup1 = new THREE.Group();
    this.iceFlakeGroup1.add(iceFlake1);
    this.iceFlakeGroup1.add(smallIce1);
    this.iceFlakeGroup1.add(smallIce2);
    this.iceFlakeGroup1.add(smallIce3);
    this.iceFlakeGroup1.add(smallIce4);

    this.iceFlakeGroup2 = this.iceFlakeGroup1.clone();
    this.iceFlakeGroup2.rotation.z = Math.PI/4 + Math.PI/10;

    this.iceFlakeGroup3 = this.iceFlakeGroup1.clone();
    this.iceFlakeGroup3.rotation.z = - (Math.PI/4 + Math.PI/10);
    
    this.mesh = new THREE.Group();
    this.mesh.add(this.iceFlakeGroup1);
    this.mesh.add(this.iceFlakeGroup2);
    this.mesh.add(this.iceFlakeGroup3);

}

SnowFlake.prototype.update = function(xTarget, yTarget){
  this.mesh.lookAt(new THREE.Vector3(0,80,60));
  //get the target X,Y locations in the defined screen space using the normalize function
  this.targetPosX = normalize(xTarget, -100, 100, -200, 150);
  this.targetPosY = normalize(yTarget, -100, 100, 150, -150);
  //update the mesh position 
  this.mesh.position.x += (this.targetPosX - this.mesh.position.x) /10;
  this.mesh.position.y += (this.targetPosY - this.mesh.position.y) /10;
  
  //update the snowflake's acceleration 
  if (this.isFreezing && this.speed < .5){
    this.acceleration +=.001;
    this.speed += this.acceleration;
    decreaseTemperature();
  }else if (!this.isFreezing){
    this.acceleration = 0;
    this.speed *= .98;
  }
 
 //animate the snowflake 
  this.iceFlakeGroup1.rotation.z += this.speed; 
  this.iceFlakeGroup2.rotation.z += this.speed;
  this.iceFlakeGroup3.rotation.z += this.speed;
}

Bear = function(){
	
  this.windTime = 0;
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
    this.headGroup.position.y +=30;
    this.headGroup.position.z +=10;


    this.bearModel.add(this.body);
    this.bearModel.add(this.frontRightLegGroup);
    this.bearModel.add(this.frontLeftLegGroup);
    this.bearModel.add(this.backLeftLegGroup);
    this.bearModel.add(this.backRightLegGroup);
    this.bearModel.add(this.headGroup);

    this.bearModel.traverse( function ( object ) {
		if ( object instanceof THREE.Mesh ) {
			object.castShadow = true;
			object.receiveShadow = true;
		}
	} );

}

//animate the drowning of the bear
Bear.prototype.drowning = function(){
	this.bearModel.rotation.z += (-Math.PI/2 - this.bearModel.rotation.z)*.0002*game.deltatime;
    this.bearModel.rotation.x += 0.0003*game.deltatime;
    this.bearModel.position.z += 0.1*game.deltatime;
    game.fallSpeed *= 1.1;
    this.bearModel.position.y -= game.fallSpeed*game.deltatime;
}

//make the bear look the snowFlake object
Bear.prototype.look = function(xTarget, yTarget){
  //find the target positions using the normalize function
  this.targetHeadRotY = normalize(xTarget, -100, 100, -Math.PI/4, Math.PI/4);
  this.targetHeadRotX = normalize(yTarget, -100,100, -Math.PI/4, Math.PI/4);
  this.targetHeadPosX = normalize(xTarget, -100, 100, 70,-70);
  this.targetHeadPosY = normalize(yTarget, -140, 260, 20, 100);
  this.targetHeadPosZ = 60;
  
    
  this.targetBigEyeScale = 1;
  this.targetSmallEyeYScale = 1;
  this.targetSmallEyeZScale = 1;
  this.targetSmallEyePosY = normalize(yTarget, -100,100, 80,60);

 //update the body of the bear
  this.updateBody(10);
 
}

//animate the cooling of the bear
Bear.prototype.cool = function(xTarget, yTarget){
  //find the target positions using reversed values than the 'look' action
  this.targetHeadRotY = normalize(xTarget, -100, 100, Math.PI/4, -Math.PI/4);
  this.targetHeadRotX = normalize(yTarget, -100,100, Math.PI/4, -Math.PI/4);
  this.targetHeadPosX = normalize(xTarget, -100, 100, -70, 70);
  this.targetHeadPosY = normalize(yTarget, -140, 260, 100, 20);
  this.targetHeadPosZ = 60;
  
    
  this.targetBigEyeScale = 0.1;
  this.targetSmallEyeYScale = 0.1;
  this.targetSmallEyeZScale = 0.2;
  this.targetSmallEyePosY = 65;
  
  //update the body of the bear
  this.updateBody(10);
  
  //adjust the delta time
  var dt = 20000 / (xTarget*xTarget+yTarget*yTarget);
  dt = Math.max(Math.min(dt,1), .5);
  this.windTime += dt;
  //animate the ears
  this.leftEar.rotation.z = Math.cos(this.windTime)*Math.PI/16*dt; 
  this.rightEar.rotation.z = -Math.cos(this.windTime)*Math.PI/16*dt; 

}

Bear.prototype.updateBody = function(speed){
  
  //update the different parts of the bear object (position, rotation and scale)
  this.headGroup.rotation.y += (this.targetHeadRotY - this.headGroup.rotation.y) / speed;
  this.headGroup.rotation.x += (this.targetHeadRotX - this.headGroup.rotation.x) / speed;
  this.headGroup.position.x += (this.targetHeadPosX-this.headGroup.position.x) / speed; 
  this.headGroup.position.y += (this.targetHeadPosY-this.headGroup.position.y) / speed; 
  this.headGroup.position.z += (this.targetHeadPosZ-this.headGroup.position.z) / speed; 
  
  this.leftBigEye.scale.y += (this.targetBigEyeScale - this.leftBigEye.scale.y) / (speed*2);
  this.rightBigEye.scale.y = this.leftBigEye.scale.y;
  
  this.leftSmallEye.scale.y += (this.targetSmallEyeYScale - this.leftSmallEye.scale.y) / (speed*2);
  this.rightSmallEye.scale.y = this.leftSmallEye.scale.y;
  
  this.leftSmallEye.scale.z += (this.targetSmallEyeZScale - this.leftSmallEye.scale.z) / (speed*2);
  this.rightSmallEye.scale.z = this.leftSmallEye.scale.z;
  
  this.leftSmallEye.position.y += (this.targetSmallEyePosY - this.leftSmallEye.position.y) / speed;
  this.rightSmallEye.position.y = this.leftSmallEye.position.y;
  
}

Sea = function(){
  var geomSea = new THREE.CylinderGeometry(2000,2000,3000,40,10);
  geomSea.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));
  // by merging the vertices we ensure continuity of the waves
  geomSea.mergeVertices();
  // get the vertices
  var length = geomSea.vertices.length;
  // create an array to store new data associated to each vertex
  this.waves = [];

  for (var i=0;i<length;i++){
    //get each vertex
    var v = geomSea.vertices[i];
    //store some data associated to it
    this.waves.push({y:v.y,
                     x:v.x,
                     z:v.z,
                     //a random angle
                     ang:Math.random()*Math.PI*2,
                     //a random distance
                     amp:5 + Math.random()*(20-5),
                     //a random speed 
                     speed:0.001 + Math.random()*(0.003 - 0.001)
                    });
  };
  var matSea = new THREE.MeshPhongMaterial({
    color:Colors.blue,
    transparent:true,
    opacity:.8,
    shading:THREE.FlatShading,

  });

  this.mesh = new THREE.Mesh(geomSea, matSea);
  this.mesh.name = "waves";
  this.mesh.receiveShadow = true;

}

Sea.prototype.moveWaves = function (){
  //get the vertices
  var verts = this.mesh.geometry.vertices;
  var l = verts.length;
  for (var i=0; i<l; i++){
    var v = verts[i];
    //get the data associated to it
    var vprops = this.waves[i];
    //update the position of the vertex
    v.x =  vprops.x + Math.cos(vprops.ang)*vprops.amp;
    v.y = vprops.y + Math.sin(vprops.ang)*vprops.amp;
    //increment the angle for the next frame
    vprops.ang += vprops.speed*game.deltatime;
    //let three.js know that the geometry has changed
    this.mesh.geometry.verticesNeedUpdate=true;
  }
}

//snow particles
Snow = function(){
	var snowGeo = new THREE.Geometry();
  //use a points material for the particle geometry where a .png is loaded
	var snowMat = new THREE.PointsMaterial({
		color: Colors.white,
		size: 10,
		map: new THREE.TextureLoader().load('assets/textures/particle.png'),
		transparent: true,
		opacity: .8,
		blending: THREE.AdditiveBlending,
		depthWrite: false
	});

	var snowCount = 20000;
	var snowDistance = 100;

  //position each particle randomly inbetween the defined distance in all axis
	for (var i=0; i<snowCount; i++) {
		var posX = (Math.random() - 0.5) * snowDistance;
		var posY = (Math.random() - 0.5) * snowDistance;
		var posZ = (Math.random() - 0.5) * snowDistance;
		var particle = new THREE.Vector3(posX, posY, posZ);

		snowGeo.vertices.push(particle);
	}

	this.mesh = new THREE.Points(
		snowGeo,
		snowMat
	);
}

//animate the particles
Snow.prototype.animate = function(){
	this.mesh.geometry.vertices.forEach(function(particle) {
		particle.x += (Math.random() - 1) * 0.1;
		particle.y += (Math.random() - 0.75) * 0.1;
		particle.z += (Math.random()) * 0.1;
    
  //the particles are moving towards the camera of the scene
  //if they go outside of the view spectrum of the camera they will return back so that they won't dissapear 
  //and give the impression that particles are continuously spawn
			if (particle.x < -50) {
			particle.x = 50;
		}

		if (particle.y < -50) {
			particle.y = 50;
		}

		if (particle.z < -50) {
			particle.z = 50;
		}

		if (particle.z > 50) {
			particle.z = -50;
		}
	});
	this.mesh.geometry.verticesNeedUpdate = true;
}

Iceberg = function(){
  var geomIceberg = new THREE.TetrahedronGeometry(8,2);
  var matIceberg = new THREE.MeshPhongMaterial({
    color:Colors.white,
    shading:THREE.FlatShading,
  });

  this.mesh = new THREE.Mesh(geomIceberg, matIceberg);
  this.mesh.receiveShadow = true;
  this.mesh.castShadow = true;
}

//scale the iceberg to simulate shrinking
Iceberg.prototype.melting = function(){
	this.mesh.scale.x -= 0.01
	this.mesh.scale.z -= 0.01

	if(this.mesh.scale.x < 5 && this.mesh.scale.z < 5){
		game.isMelting = false;
	}
	if(this.mesh.scale.x < 22 && this.mesh.scale.z < 22){
		game.isDrowning = true;
	}

}
//create the snowFlake object
function createSnowFlake(){
	snowFlake = new SnowFlake();
    snowFlake.mesh.position.z = 400;
 	scene.add(snowFlake.mesh);
}

//create the bear object
function createBear(){
  bear = new Bear();
  bear.bearModel.position.z = 150;
  bear.bearModel.position.y = 30;
  bear.bearModel.rotation.y = -Math.PI/8;
  bear.bearModel.scale.set(.6, .6, .6);
  scene.add(bear.bearModel);
}

//create the snow particles
function createSnow(){
  snow = new Snow();
  snow.mesh.position.z = -1500;
  snow.mesh.scale.set(40, 40, 40);
  scene.add(snow.mesh);
  snow.mesh.visible = false;
}

//create the sea object
function createSea(){
  sea = new Sea();
  sea.mesh.position.y = -2150;
  sea.mesh.position.z = -600;
  scene.add(sea.mesh);
}

//create the iceberg object
function createIceberg(){
  iceberg = new Iceberg();
  iceberg.mesh.scale.set(40, 10, 40);
  iceberg.mesh.position.y = -155;
  iceberg.mesh.position.z = 100;
  scene.add(iceberg.mesh);
}

//LOOP FUNCTION
function loop(){

  newTime = new Date().getTime();
  game.deltatime = newTime-oldTime;
  oldTime = newTime;


  var timeElapsed = clock.getElapsedTime();
  
  var xTarget = (mousePos.x-windowHalfX);
  var yTarget= (mousePos.y-windowHalfY);
  
  snowFlake.isFreezing = game.isFreezing;
  snowFlake.update(xTarget, yTarget);
  updateTemperature();  
  sea.moveWaves();
  if(game.isSnowing){
  	snow.animate();
  	}
  if(game.isMelting){
  	iceberg.melting();
  }
  
  //check the game status and call the appropriate functions
  if (game.status=="playing"){
  	if(!game.isFreezing){
  		bear.look(xTarget, yTarget);
  	}else{
        bear.cool(xTarget, yTarget);
        audio.play();
  	}

    if(game.isDrowning){
  	  game.status = "gameover";
    }

  }else if(game.status=="gameover"){
    
    bear.drowning();

    if (bear.bearModel.position.y <-600){
      showReplay();
      audio2.play();
      game.status = "waitingReplay";

    }
  }else if (game.status=="waitingReplay"){

  }

  
  renderer.render(scene, camera);
  //controls.update();
  requestAnimationFrame(loop);

}

//handle the replay actions
function replay(){
  //hide the message
  hideReplay();
  
  //bring the bear to its intitial position
  bear.bearModel.position.z = 150;
  bear.bearModel.position.y = 30;
  bear.bearModel.rotation.y = -Math.PI/8;
  bear.bearModel.rotation.x = 0;
  bear.bearModel.rotation.z = 0;
  
  //make the snow particles invisible
  snow.mesh.visible = false;
  iceberg.mesh.scale.set(40, 10, 40);
  resetGame();

}

function showReplay(){
  nowOrNeverMessage.style.display="block";
}

function hideReplay(){
  nowOrNeverMessage.style.display="none";
}

//update the appearence of the temperature bar
function updateTemperature(){
  temperatureBar.style.right = (100-game.temperature)+"%";
  temperatureBar.style.backgroundColor = (game.temperature<50)? "#0D1B2A" : "#f25346";

  if (game.temperature>50){
    temperatureBar.style.animationName = "none";
  }else{
    temperatureBar.style.animationName = "blinking";
  }
  if(game.temperature < 10){
  	game.isSnowing = true;
  	snow.mesh.visible = true;
  }
}

//decrease temperature
function decreaseTemperature(){
  game.temperature -= game.freezingValue;
  game.temperature = Math.max(0, game.temperature);
}

function init(){

  //UI
  temperatureBar = document.getElementById("temperatureBar");
  nowOrNeverMessage = document.getElementById("nowOrNeverMessage");
  resetGame();

  //set up the scene, camera and the renderer
  createScene();

  //add the lights
  createLights();

  //add the objects
  createSnowFlake();
  createBear();
  createSea();
  createIceberg();
  createSnow();

  //add the listener for the mouse interaction
  document.addEventListener('mousemove', handleMouseMove, false);
  document.addEventListener('mousedown', handleMouseDown, false);
  document.addEventListener('mouseup', handleMouseUp, false);
  document.addEventListener('touchstart', handleTouchStart, false);
  document.addEventListener('touchend', handleTouchEnd, false);
  document.addEventListener('touchmove',handleTouchMove, false);

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

//function used from Karim Maaloul in codepen.io
function normalize(v,vmin,vmax,tmin, tmax){

  var nv = Math.max(Math.min(v,vmax), vmin);
  var dv = vmax-vmin;
  var pc = (nv-vmin)/dv;
  var dt = tmax-tmin;
  var tv = tmin + (pc*dt);
  return tv;

}

//EVENT LISTENER FUNCTIONS

function handleMouseMove(event) {
  mousePos = {x:event.clientX, y:event.clientY};
}

function handleMouseDown(event) {
     if (game.status == "playing") game.isFreezing = true;
     else if (game.status == "waitingReplay"){
    replay();
  }
 
}
function handleMouseUp(event) {
     game.isFreezing = false;
}

function handleTouchStart(event) {
  if (event.touches.length > 1) {
    event.preventDefault();
	mousePos = {x:event.touches[0].pageX, y:event.touches[0].pageY};
    game.isFreezing = true;
  }
}

function handleTouchEnd(event) {
   mousePos = {x:windowHalfX, y:windowHalfY};
   game.isFreezing = false;
}

function handleTouchMove(event) {
  if (event.touches.length == 1) {
    event.preventDefault();
	mousePos = {x:event.touches[0].pageX, y:event.touches[0].pageY};
  }
}

