//COLORS
var Colors = {
    white:0xFFFBFE,
    black:0x1B1B1E,
    grey: 0xB8BDB5,
    rhinoGrey:0x5B7B7A,
    darkGreen:0x1F2421,
    green:0x49A078,
    blue:0x6CD4FF,
    cyan:0xD5FFF3,
    brown:0x775144, 
    beige: 0x28231C,
    lightGreen: 0x7CFFCB,
    yellow: 0xD5AC4E,
};

// GAME VARIABLES
var game, fieldGameOver, fieldDistance, levelInterval;
//audios downloaded from https://freesound.org/
var audio = new Audio('assets/audio/jump.wav');
var audio2 = new Audio('assets/audio/wrong.wav');
var audio3 = new Audio('assets/audio/obstacle.wav');
var audio4 = new Audio('assets/audio/bonus.wav');

//SCENE VARIABLES
var rhino, machine, obstacle, leaf, bonusParticles;

//THREE RELATED VARIABLES
var scene, camera, fieldOfView, aspectRatio, nearPlane, farPlane, HEIGHT, WIDTH, renderer, container, clock, controls,
    windowHalfX,
  	windowHalfY,
    mousePos = {x:0,y:0};

//LIGHTS
var globalLight, shadowLight;

function gameStart(){
  game = {
      delta : 0,
			floorRadius : 200,
			speed : 6,
			distance : 0,
			level : 1,
			maxSpeed : 48,
			machinePos : .65,
			machinePosTarget : .65,
			floorRotation : 0,
			collisionObstacle : 15,
			collisionBonus : 15,
			status : "play",
			machineAcceleration : 0.004,
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

  //controls = new THREE.OrbitControls(camera, renderer.domElement);

  // listen to the screen: if the user resizes it, the camera and the renderer size should be updated
  window.addEventListener('resize', handleWindowResize, false);
}


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
    //all the groups
    this.mesh = new THREE.Group();
    this.body = new THREE.Group();
    this.torso = new THREE.Group();
    this.legBR = new THREE.Group();
    this.legFR = new THREE.Group();
    this.head = new THREE.Group();
    this.mesh.add(this.body);
    
    //material for the rhino
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
  
  //all the geometries
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
    tailGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0,5,0));
    tailGeom.applyMatrix(new THREE.Matrix4().makeRotationZ(Math.PI/4));
    tailGeom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));

    
    //body
	  this.torsoMesh = new THREE.Mesh(torsoGeom, this.greyMat);
	  this.torsoMesh.rotation.z = Math.PI/2;
	  this.torsoMesh.rotation.x = Math.PI/3.5;
    this.torsoMesh.castShadow = true;
    this.torso.add(this.torsoMesh);
    
    //thighs
    this.thighBR = new THREE.Mesh(legPart1Geom, this.greyMat);
    this.thighBR.position.y = -9;
    this.thighBR.position.z = -4;
    this.thighBR.position.x = -8;
    this.thighBR.castShadow = true;
    this.torso.add(this.thighBR);

    this.thighBL = this.thighBR.clone();
    this.thighBL.position.z = 4;
    this.torso.add(this.thighBL);
    
    this.thighFR = this.thighBR.clone();
    this.thighFR.position.x = 8;
    this.torso.add(this.thighFR);

    this.thighFL = this.thighBL.clone();
    this.thighFL.position.x = 8;
    this.torso.add(this.thighFL);

    //Back Right Leg
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
    this.mouth.position.x = 4.1;
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
    this.head.position.y = 5;

    //tail
     this.tail = new THREE.Mesh(tailGeom, this.greyMat);
     this.tail.position.x = -10;
     this.tail.position.y = 4;
     this.tail.rotation.y = Math.PI/2;
     this.torso.add(this.tail);

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
    this.body.add(this.torso);

    this.body.traverse(function(object) {
    if (object instanceof THREE.Mesh) {
      object.castShadow = true;
      object.receiveShadow = true;
    }
   });
}

//animate the rhino jump
Rhino.prototype.jump = function(){
  if (this.status == "jumping") return;
  this.status = "jumping";
  var _this = this;
  var totalSpeed = 10 / game.speed;
  var jumpHeight = 20;
  
  //animate the rhino parts using TweenMax.js
  TweenMax.to(this.earL.rotation, totalSpeed, {z:"+=.3", ease:Back.easeOut});
  TweenMax.to(this.earR.rotation, totalSpeed, {z:"-=.3", ease:Back.easeOut});
  
  TweenMax.to(this.legFL.rotation, totalSpeed, {z:"+=.7", ease:Back.easeOut});
  TweenMax.to(this.legFR.rotation, totalSpeed, {z:"-=.7", ease:Back.easeOut});
  TweenMax.to(this.legBL.rotation, totalSpeed, {z:"+=.7", ease:Back.easeOut});
  TweenMax.to(this.legBR.rotation, totalSpeed, {z:"-=.7", ease:Back.easeOut});
  
  TweenMax.to(this.tail.rotation, totalSpeed, {x:"+=1", ease:Back.easeOut});
  
  TweenMax.to(this.mouth.rotation, totalSpeed, {z:.5, ease:Back.easeOut});
  
  TweenMax.to(this.mesh.position, totalSpeed/2, {y:jumpHeight, ease:Power2.easeOut});
  TweenMax.to(this.mesh.position, totalSpeed/2, {y:0, ease:Power4.easeIn, delay:totalSpeed/2, onComplete: function(){
  
    _this.status="running";
  }});
  
}

//animate the rhino run
Rhino.prototype.run = function(){
  this.status = "running";
  var s = Math.min(game.speed,game.maxSpeed);
  this.runningCycle += game.delta * s * .7;
  this.runningCycle = this.runningCycle % (Math.PI*2);
  var t = this.runningCycle;
  
  //animate each different part of the rhino using sine and cosine equations
  this.legFR.rotation.z = Math.sin(t)*Math.PI/4;
  this.legFR.position.y = -5.5 - Math.sin(t);
  this.legFR.position.x = 7.5 + Math.cos(t);
  
  this.legFL.rotation.z = Math.sin(t+.4)*Math.PI/4;
  this.legFL.position.y = -5.5 - Math.sin(t+.4);
  this.legFL.position.x = 7.5 + Math.cos(t+.4);
  
  this.legBL.rotation.z = Math.sin(t+2)*Math.PI/4;
  this.legBL.position.y = -5.5 - Math.sin(t+3.8);
  this.legBL.position.x = -7.5 + Math.cos(t+3.8);
  
  this.legBR.rotation.z = Math.sin(t+2.4)*Math.PI/4;
  this.legBR.position.y = -5.5 - Math.sin(t+3.4);
  this.legBR.position.x = -7.5 + Math.cos(t+3.4);
  
  this.torso.position.y = 2-Math.sin(t+Math.PI/2)*2;

  this.earL.rotation.z = Math.cos(-Math.PI/2 + t)*(1*.2);
  this.earR.rotation.z = Math.cos(-Math.PI/2 + .2 + t)*(1*.3);
  
  this.head.position.y = 8-Math.sin(t+Math.PI/2)*2;
  this.head.rotation.z = -.1+Math.sin(-t-1)*.4;
  this.mouth.rotation.z = .2 + Math.sin(t+Math.PI+.3)*.4;
  
  this.tail.rotation.z = .2 + Math.sin(t-Math.PI/2);
  
  this.smallEyeR.scale.y = .5 + Math.sin(t+Math.PI)*.5;
}

//animate the rhino when is inside the machine hand
Rhino.prototype.catch = function(){
  var _this = this;
  var sp = 1;
  var ease = Power4.easeOut;
  
  //kill the previous tween of the eye mesh
  TweenMax.killTweensOf(this.smallEyeR.scale);
  //animate the parts with TweenMax.js
  TweenMax.to(this.head.rotation, sp, {z:Math.PI/6, ease:ease, onComplete:function(){_this.nod();}});
  
  TweenMax.to(this.earL.rotation, sp, {z:-Math.PI/3, ease:ease});
  TweenMax.to(this.earR.rotation, sp, {z:-Math.PI/3, ease:ease});
  
  TweenMax.to(this.legFL.position, sp, {x:-.5, ease:ease});
  TweenMax.to(this.legFR.position, sp, {x:-.5, ease:ease});
  TweenMax.to(this.legBL.position, sp, {x:.5, ease:ease});
  TweenMax.to(this.legBR.position, sp, {x:.5, ease:ease});
  
  TweenMax.to(this.smallEyeR.scale, sp, {y:1, ease:ease});
  TweenMax.to(this.smallEyeL.scale, sp, {y:1, ease:ease});
}
//animate the rhino nod
Rhino.prototype.nod = function(){
  var _this = this;
  var sp = 1 + Math.random()*2;
  
  // HEAD
  var tHeadRotY = -Math.PI/3 + Math.random()*.5;
  var tHeadRotX = Math.PI/3 - .2 +  Math.random()*.4;
  TweenMax.to(this.head.rotation, sp, {x:tHeadRotX, y:tHeadRotY, ease:Power4.easeInOut, onComplete:function(){_this.nod()}});
  
  // TAIL
  
  var tTailRotY = Math.PI/4;
  TweenMax.to(this.tail.rotation, sp/8, {y:tTailRotY, ease:Power1.easeInOut, yoyo:true, repeat:8});
  
  // EYES
  
  TweenMax.to([this.smallEyeR.scale, this.smallEyeL.scale], sp/20, {y:0, ease:Power1.easeInOut, yoyo:true, repeat:1});
}


BonusParticles = function(){
  this.mesh = new THREE.Group();
  //particles materials 
  this.greenMat = new THREE.MeshPhongMaterial ({
    color:Colors.green, 
    shading:THREE.FlatShading
  });

  this.cyanMat = new THREE.MeshPhongMaterial ({
    color:Colors.cyan, 
    shading:THREE.FlatShading
  });
  
  //particles geometries
  var bigParticleGeom = new THREE.CubeGeometry(10,10,10,1);
  var smallParticleGeom = new THREE.CubeGeometry(5,5,5,1);
  this.parts = [];
  for (var i=0; i<10; i++){
    var partGreen = new THREE.Mesh(bigParticleGeom, this.greenMat);
    var partCyan = new THREE.Mesh(smallParticleGeom, this.cyanMat);
    partCyan.scale.set(.5,.5,.5);
    this.parts.push(partGreen);
    this.parts.push(partCyan);
    this.mesh.add(partGreen);
    this.mesh.add(partCyan);
  }
}

//animate the particles explosion
BonusParticles.prototype.explose = function(){
  var _this = this;
  var explosionSpeed = .5;
  for(var i=0; i<this.parts.length; i++){
    var tx = -50 + Math.random()*100;
    var ty = -50 + Math.random()*100;
    var tz = -50 + Math.random()*100;
    var p = this.parts[i];
    p.position.set(0,0,0);
    p.scale.set(1,1,1);
    p.visible = true;
    var s = explosionSpeed + Math.random()*.5;
    TweenMax.to(p.position, s,{x:tx, y:ty, z:tz, ease:Power4.easeOut});
    TweenMax.to(p.scale, s,{x:.01, y:.01, z:.01, ease:Power4.easeOut, onComplete:removeParticle, onCompleteParams:[p]});
  }
}

//make the particle invisible
function removeParticle(p){
  p.visible = false;
}


var firs = new THREE.Group();

//create the Firs and position them around the floor object
function createFirs(){
  
  var nTrees = 100;
   for(var i=0; i< nTrees; i++){
    var phi = i*(Math.PI*2)/nTrees;
    var theta = Math.PI/2;
    theta += (Math.random()>.05)? .25 + Math.random()*.3 : - .35 -  Math.random()*.1;
   
    var fir = new Tree();
    fir.mesh.position.x = Math.sin(theta)*Math.cos(phi)*game.floorRadius;
    fir.mesh.position.y = Math.sin(theta)*Math.sin(phi)*(game.floorRadius-10);
    fir.mesh.position.z = Math.cos(theta)*game.floorRadius; 
     
    var vec = fir.mesh.position.clone();
    var axis = new THREE.Vector3(0,1,0);
    fir.mesh.quaternion.setFromUnitVectors(axis, vec.clone().normalize());
    floor.add(fir.mesh); 
  }
}

//the tree object is actually a trunc geometry
Tree = function(){
	this.mesh = new THREE.Object3D();
	this.trunc = new Trunc();
	this.mesh.add(this.trunc.mesh);
}

//the trunc object
Trunc = function(){
  //trunc height and radius 
  var truncHeight = 20 + Math.random()*30;
  var topRadius = 1+Math.random()*5;
  var bottomRadius = 5+Math.random()*5;
  
  //material 
  this.brownMat = new THREE.MeshPhongMaterial ({
    color:Colors.brown, 
    shading:THREE.FlatShading
  });

  var matTrunc = this.brownMat;
  var nhSegments = 3;
  var nvSegments = 3;

  //trunc geometry
  var geom = new THREE.CylinderGeometry(topRadius,bottomRadius,truncHeight, nhSegments, nvSegments);
  //modify the pivot of the geometry
  geom.applyMatrix(new THREE.Matrix4().makeTranslation(0,truncHeight/2,0));
  
  this.mesh = new THREE.Mesh(geom, matTrunc);
  
  for (var i=0; i<geom.vertices.length; i++){
    //modify the position of the vertices randomly
    var noise = Math.random() ;
    var v = geom.vertices[i];
    v.x += -noise + Math.random()*noise*2;
    v.y += -noise + Math.random()*noise*2;
    v.z += -noise + Math.random()*noise*2;
    
    geom.computeVertexNormals();
     
    
    // BRANCHES
  
    if (Math.random()>.5 && v.y > 10 && v.y < truncHeight - 10){
      var h = 3 + Math.random()*5;
      var thickness = .2 + Math.random();
      
      //create a branch geometry and position it to the trunc's vertex position in x,y,z axis
      var branchGeometry = new THREE.CylinderGeometry(thickness/2, thickness, h, 3, 1);
      branchGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(0,h/2,0));
      var branch = new THREE.Mesh(branchGeometry, matTrunc);
      branch.position.x = v.x;
      branch.position.y = v.y;
      branch.position.z = v.z;
      
      //create a new Vector3 in respect to the vertex.x/z position
      //rotate the branch using quaternion to match the newly created vector's direction
      var vec = new THREE.Vector3(v.x, 2, v.z);
      var axis = new THREE.Vector3(0,1,0);
      branch.quaternion.setFromUnitVectors(axis, vec.clone().normalize());
      
      
      this.mesh.add(branch);
    }
    
  }
  
  this.mesh.castShadow = true;
}


Machine = function(){
	this.runningCycle = 0;
  
    this.mesh = new THREE.Group();
    this.body = new THREE.Group();
    this.hand = new THREE.Group();
   
   //materials
    this.yellowMat = new THREE.MeshPhongMaterial ({
    color:Colors.yellow, 
    shading:THREE.FlatShading
  });
	this.blackMat = new THREE.MeshPhongMaterial ({
    color:Colors.black, 
    shading:THREE.FlatShading
  });
	this.greyMat = new THREE.MeshPhongMaterial ({
    color:Colors.grey, 
    shading:THREE.FlatShading
  });
  
  //all the geometries
	var supportGeom = new THREE.BoxGeometry(7, 130, 7);
	supportGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0,65,0));
	var cylinderGeom = new THREE.CylinderGeometry(8,8,8,20);
	var handPart1Geom = new THREE.BoxGeometry(5, 80, 5);
	handPart1Geom.applyMatrix(new THREE.Matrix4().makeTranslation(0,40,0));
	var handPart2Geom = new THREE.CylinderGeometry(6, 10 , 10, 4);
	var handPart3Geom = new THREE.BoxGeometry(5, 10, 1);
  var wheelGeom = new THREE.CylinderGeometry(20,20,20,20);

	this.support= new THREE.Mesh(supportGeom, this.yellowMat);
	this.support.rotation.z = -Math.PI/4;
  
	this.cylinder = new THREE.Mesh(cylinderGeom, this.greyMat);
	this.cylinder.rotation.x = Math.PI/2;
	this.cylinder.position.x = 90;
	this.cylinder.position.y= 90;
  
  //wheel
  this.wheel = new THREE.Mesh(wheelGeom, this.blackMat);
  this.wheel.rotation.x = Math.PI/2;
  this.wheel.position.x = 100;
  this.wheel.position.y = -5;

  //hand
	this.handPart1 = new THREE.Mesh(handPart1Geom, this.yellowMat);
	this.handPart1.rotation.z = -Math.PI/2;
	this.handPart1.position.x = 90;
	this.handPart1.position.y= 90;
	this.hand.add(this.handPart1);

	this.handPart2 = new THREE.Mesh(handPart2Geom, this.blackMat);
	this.handPart2.rotation.z = Math.PI/2;
	this.handPart2.rotation.x = -Math.PI/4;
	this.handPart2.position.y = 80;
	this.handPart1.add(this.handPart2);

  this.rhinoHolder = new THREE.Group();
  this.rhinoHolder.position.y = -16;
  this.rhinoHolder.rotation.y = -Math.PI/4;
  this.handPart2.add(this.rhinoHolder);
  
  //dung
	this.dung1 = new THREE.Group();
	this.dungPart1 = new THREE.Mesh(handPart3Geom, this.greyMat);
	this.dungPart1.rotation.x = -Math.PI/4;
	this.dungPart1.position.y = -7;
	
	this.dung1.add(this.dungPart1);

	this.dungPart2 = new THREE.Mesh(handPart3Geom, this.greyMat);
	this.dungPart2.rotation.x = Math.PI/4;

	this.dung1.add(this.dungPart2);
	this.dung1.position.y = -8;
	this.dung1.position.x = -7;
	this.dung1.position.z = 4;
	this.dung1.rotation.y = Math.PI/4 + Math.PI/2 ;


	this.dung2 = this.dung1.clone();
	this.dung2.position.z = -1;
	this.dung2.position.x = 5;
	this.dung2.rotation.y = -(Math.PI/4 + Math.PI/2) ;


  this.handPart2.add(this.dung1);
  this.handPart2.add(this.dung2);
  

	this.body.add(this.support);
	this.body.add(this.cylinder);
	this.body.add(this.hand);

	this.mesh.add(this.body);
  this.mesh.add(this.wheel);
}

// make the machine hand approaching the rhino
Machine.prototype.follow = function(){
  var s = Math.min(game.speed,game.maxSpeed);
  this.runningCycle += game.delta * s * .7;
  this.runningCycle = this.runningCycle % (Math.PI*2);
  var t = this.runningCycle;

  this.body.position.x = 10 + Math.cos(t+.2);
  this.handPart1.rotation.z = -Math.PI/2 - Math.sin(t+.4)*(Math.PI/6 - Math.PI/8 );
}

//animate the action of catching the rhino
Machine.prototype.catch = function(){
  var sp = 6;
  var ease = Power4.easeOut;
  var _this = this;

  TweenMax.to(this.dung1.position, sp, {x:-9, ease:ease});
  TweenMax.to(this.body.position, sp, {y:3, ease:ease});

  
  TweenMax.to(this.handPart1.rotation, 2, {z:-Math.PI/2 - Math.PI/10, ease:ease});
  TweenMax.to(this.body.position, sp, {x:-10, ease:ease});
}


Leaf = function(){
  this.angle = 0;
  this.mesh = new THREE.Group();
  
  this.greenMat = new THREE.MeshPhongMaterial ({
    color:Colors.green, 
    shading:THREE.FlatShading
  });
  
  
  var leafGeom = new THREE.CubeGeometry(5,10,1,1);
  leafGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0,5,0));
  //modify the vertices of the leaf geometry
  leafGeom.vertices[2].x-=1;
  leafGeom.vertices[3].x-=1;
  leafGeom.vertices[6].x+=1;
  leafGeom.vertices[7].x+=1;
  
  this.leaf1 = new THREE.Mesh(leafGeom,this.greenMat);
  this.leaf1.position.y = 7;
  this.leaf1.rotation.z = .3;
  this.leaf1.rotation.x = .2;
  this.leaf1.castShadow = true;
  this.leaf1.receiveShadow = true;
  this.mesh.add(this.leaf1);

}

obstacle = function(){
  this.angle = 0;
  this.status="ready";
  this.mesh = new THREE.Group();

  this.brownMat = new THREE.MeshPhongMaterial ({
    color:Colors.beige, 
    shading:THREE.FlatShading
  });
  var bodyGeom = new THREE.CylinderGeometry(3,3,15,5);
  this.body = new THREE.Mesh(bodyGeom, this.brownMat);
  this.body.rotation.z = Math.PI/2;
  this.body.rotation.y = Math.PI/2;
  this.body.castShadow = true;
  this.body.receiveShadow = true;

  this.mesh.add(this.body);

}

//create the rhino object
function createRhino() {
  rhino = new Rhino();
  rhino.mesh.scale.set(0.8,0.8,0.8);
  scene.add(rhino.mesh);
}

//create the machine object
function createMachine(){
	machine = new Machine();
	machine.mesh.position.x = -230;
	machine.mesh.position.y = -50;
	scene.add(machine.mesh);
}

//create the floor object
function createFloor() {
  
  floorShadow = new THREE.Mesh(new THREE.SphereGeometry(game.floorRadius, 50, 50), new THREE.MeshPhongMaterial({
    color: Colors.lightGreen,
    specular:0x000000,
    shininess:1,
    transparent:true,
    opacity:.5
  }));
  //floorShadow.rotation.x = -Math.PI / 2;
  floorShadow.receiveShadow = true;
  
  floorGrass = new THREE.Mesh(new THREE.SphereGeometry(game.floorRadius-.5, 50, 50), new THREE.MeshBasicMaterial({
    color: Colors.lightGreen
  }));
  //floor.rotation.x = -Math.PI / 2;
  floorGrass.receiveShadow = false;
  
  floor = new THREE.Group();
  floor.position.y = -213;
  
  floor.add(floorShadow);
  floor.add(floorGrass);
  scene.add(floor);
  
}

//crate the leaf object
function createLeaf(){
  leaf = new Leaf();
  scene.add(leaf.mesh);
}

//update the position of the leaf around the floor
function updateLeafPosition(){
  leaf.mesh.rotation.y += game.delta * 6;
  leaf.mesh.rotation.x = Math.PI/4 - (game.floorRotation+leaf.angle);
  leaf.mesh.position.y = -game.floorRadius + Math.sin(game.floorRotation+leaf.angle) * (game.floorRadius+20) - game.delta;
  leaf.mesh.position.x = Math.cos(game.floorRotation+leaf.angle) * (game.floorRadius+50);
  
}

//create the obstacle object
function createObstacle(){
  obstacle = new obstacle();
  obstacle.mesh.scale.set(1.5,1.5,1.5);
  obstacle.mesh.position.y = game.floorRadius;
  scene.add(obstacle.mesh);
}

//update the obstacle position around the floor
function updateObstaclePosition(){
  if (obstacle.status=="flying")return;
  
  if (game.floorRotation+obstacle.angle > 2.5 ){
    obstacle.angle = -game.floorRotation + Math.random()*.3;
  }
  
  obstacle.mesh.position.y = -game.floorRadius + Math.sin(game.floorRotation+obstacle.angle) * (game.floorRadius-13);
  obstacle.mesh.position.x = Math.cos(game.floorRotation+obstacle.angle) * (game.floorRadius);
  
}

//animate the floor rotation
function updateFloorRotation(){
  game.floorRotation += game.delta*.03 * game.speed;
  game.floorRotation = game.floorRotation%(Math.PI*2);
  floor.rotation.z = game.floorRotation;
}
//animate the wheel rotation
function updateWheelRotation(){
  machine.wheel.rotation.y = -game.floorRotation;
}

//update the machine position
function updateMachinePosition(){
  machine.follow();
  game.machinePosTarget -= game.delta*game.machineAcceleration;
  game.machinePos += ( game.machinePosTarget-game.machinePos) *game.delta;
  if (game.machinePos < .57){
   gameOver();
  }
  
  var angle = Math.PI* game.machinePos;
  machine.body.position.x = 100 + Math.cos(angle)*(game.floorRadius+15);
}

//handle the game over actions
function gameOver(){
  startToCareMessage.style.display="block";
  game.status = "gameOver";
  machine.catch();
  rhino.catch();
  machine.rhinoHolder.add(rhino.mesh);
  leaf.mesh.visible = false;
  obstacle.mesh.visible = false;
  audio2.play();
  clearInterval(game.levelInterval);
}

//create the bonus particles object
function createBonusParticles(){
  bonusParticles = new BonusParticles();
  bonusParticles.mesh.visible = false;
  scene.add(bonusParticles.mesh);
  
}


//check for collisions amongst rhino and the other scene objects (leaf,obstacle)
function checkCollision(){
  var db = rhino.mesh.position.clone().sub(leaf.mesh.position.clone());
  var dm = rhino.mesh.position.clone().sub(obstacle.mesh.position.clone());
  
  if(db.length() < game.collisionBonus){
    getBonus();
  }
  
  if(dm.length() < game.collisionObstacle && obstacle.status != "flying"){
    getMalus();
  }
}

//initiate particle explosion and update the leaf's angle around the floor
//increase the distance between the rhino and the machine
function getBonus(){
  bonusParticles.mesh.position.copy(leaf.mesh.position);
  bonusParticles.mesh.visible = true;
  bonusParticles.explose();
  leaf.angle += Math.PI + Math.PI/8;
  audio4.play();
  game.machinePosTarget += .06;
  
}

//animate the obstacle fly and update the obstacle's angle around the floor
//decrease the distance between the rhino and the machine
function getMalus(){
  obstacle.status="flying";
  audio3.play();
  var tx = (Math.random()>.5)? -20-Math.random()*10 : 20+Math.random()*5;
  TweenMax.to(obstacle.mesh.position, 4, {x:tx, y:Math.random()*50, z:350, ease:Power4.easeOut});
  TweenMax.to(obstacle.mesh.rotation, 4, {x:Math.PI*3, z:Math.PI*3, y:Math.PI*6, ease:Power4.easeOut, onComplete:function(){
    obstacle.status = "ready";
    
    obstacle.angle = -game.floorRotation - Math.random()*.4;
    
    obstacle.angle = obstacle.angle%(Math.PI*2);
    obstacle.mesh.rotation.x = 0;
    obstacle.mesh.rotation.y = 0;
    obstacle.mesh.rotation.z = 0;
    obstacle.mesh.position.z = 0;
    
  }});
  //
  game.machinePosTarget -= .01;
}

//update the game distance
function updateDistance(){
  game.distance += game.delta*game.speed;
  var t =  game.distance/2;
  time.innerHTML = Math.floor(t);
}

//reset the game
function resetGame(){
  scene.add(rhino.mesh);
  rhino.mesh.position.y = 0;
  rhino.mesh.position.z = 0;
  rhino.mesh.position.x = 0;
  rhino.head.rotation.y = 0;
  rhino.head.rotation.x = 0;

  gameStart();
  leaf.mesh.visible = true;
  obstacle.mesh.visible = true;

  rhino.status = "running";

}
//kill all the tweens that exist in the objects to reset the game
function replay(){
  
  game.status = "preparingToReplay"
  
  startToCareMessage.style.display="none";
  
  TweenMax.killTweensOf(machine.dung1.position);
  TweenMax.killTweensOf(machine.body.position); 
  TweenMax.killTweensOf(machine.handPart1.rotation);

  TweenMax.killTweensOf(rhino.head.rotation);
  TweenMax.killTweensOf(rhino.head.position);
  TweenMax.killTweensOf(rhino.tail.rotation); 
  TweenMax.killTweensOf(rhino.smallEyeR.scale);
  
  resetGame();
  
}

//LOOP FUNCTION
function loop(){
  game.delta = clock.getDelta();
  updateFloorRotation();
  updateWheelRotation();

  //check the game status
  if (game.status == "play"){
    
    if (rhino.status == "running"){
      rhino.run();
    }
    updateDistance();
    updateMachinePosition();
    updateLeafPosition();
    updateObstaclePosition();
    checkCollision();
    
  }
  
  //controls.update();
  renderer.render(scene, camera); 
  requestAnimationFrame(loop);
}

function init(){

  //UI
  time = document.getElementById("timeValue");
  startToCareMessage = document.getElementById("startToCareMessage");
  gameStart();

  //set up the scene, camera and the renderer
  createScene();

  //add the lights
  createLights();

  //add the objects
  createFloor();
  createRhino();
  createFirs();
  createMachine();
  createLeaf();
  createBonusParticles();
  createObstacle();

  //resetGame();

  //add the listener for the mouse interaction
  document.addEventListener('mousedown', handleMouseDown, false);
  document.addEventListener('touchend', handleMouseDown, false);

  //start a loop that will update object's position
  //and render the scene on each frame
  loop();
}

window.addEventListener('load', init, false);

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
  if (game.status == "play") {
    rhino.jump();
    audio.play();
  }
  else if (game.status == "gameOver"){
    replay();
  }
}

