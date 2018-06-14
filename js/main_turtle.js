//COLORS
var Colors = {
    lightblue:0x01BAEF,
    lightblue2:0x38AECC,
    green:0x0CBABA,
    softwhite:0xEAEBED,
    grey:0xA3BAC3,
    darkgrey: 0x183446,
    blueDark:0x022F40,
    blue:0x006989,
    red:0xf25346,
};

window.addEventListener('load', init, false);

function init(){

  //set up the scene, camera and the renderer
  createScene();

  //add the lights
  createLights();

  //add the objects
  createTurtle();
  createSea();

  //add the listener for the mouse interaction
  document.addEventListener('mousemove', handleMouseMove, false);

  //start a loop that will update object's position
  //and render the scene on each frame
  loop();
}

//THREE RELATED VARIABLES
var scene, fieldOfView, aspectRatio, nearPlane, farPlane, HEIGHT, WIDTH, renderer, container, clock; // controls;

function createScene(){
  HEIGHT= window.innerHeight;
  WIDTH= window.innerWidth;

  //create the scene
  scene= new THREE.Scene();
  //create a fog effect
  scene.fog = new THREE.Fog(0x38AECC, 100, 950);
  //create a clock object
  clock = new THREE.Clock();
  //create the camera
  aspectRatio= WIDTH/HEIGHT;
  fieldOfView= 60;
  nearPlane= 1;
  farPlane= 10000;
  camera = new THREE.PerspectiveCamera(
    fieldOfView,
    aspectRatio,
    nearPlane,
    farPlane
    );

  //set the position of the camera
  camera.position.x= 0;
  camera.position.z= 200;
  camera.position.y= 100;

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

function handleWindowResize(){
  //update height and width of the renderer and the camera
  HEIGHT= window.innerHeight;
  WIDTH= window. innerWidth;
  renderer.setSize(WIDTH,HEIGHT);
  camera.aspect = WIDTH/HEIGHT;
  camera.updateProjectionMatrix();
}

var hemisphereLight, shadowLight;

//ADD LIGHTS IN THE SCENE
function createLights(){
  //a hemisphere light is a gradient light
  hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, .9);

  //a directional light that acts like a sun
  shadowLight = new THREE.DirectionalLight(0xffffff, .9);

  //set the direction of the light
  shadowLight.position.set(150, 350, 350);

  //allow shadow casting
  shadowLight.castShadow = true;

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

  //to activate the lights must be added to the scene
  scene.add(hemisphereLight);
  scene.add(shadowLight);
}

var turtleModel = function (){
  this.mesh = new THREE.Object3D();
  
  // Create the body
  var geombobyPart1 = new THREE.BoxGeometry(100,45,50,1,1,1);
  var matbodyPart1 = new THREE.MeshPhongMaterial({color:Colors.green, shading:THREE.FlatShading});
  geombobyPart1.vertices[4].z+=15;
  geombobyPart1.vertices[4].x+=30;
  geombobyPart1.vertices[1].z+=15;
  geombobyPart1.vertices[1].x-=30;
  geombobyPart1.vertices[0].z-=15;
  geombobyPart1.vertices[0].x-=30;
  geombobyPart1.vertices[5].z-=15;
  geombobyPart1.vertices[5].x+=30;
  var body1 = new THREE.Mesh(geombobyPart1, matbodyPart1);
  body1.position.y= 8;
  body1.castShadow = true;
  body1.receiveShadow = true;
  this.mesh.add(body1);
  
  

  //create the head
  var geomhead = new THREE.BoxGeometry(25,20,20,1,1,1);
  var mathead = new THREE.MeshPhongMaterial({color: Colors.green, shading: THREE.FlatShading});
  var head = new THREE.Mesh(geomhead, mathead);
  head.position.x = 68;
  head.position.y= 2;
  head.castShadow = true;
  head.receiveShadow = true;
  this.mesh.add(head);

  var geomouth = new THREE.BoxGeometry(17,5,20,1,1,1);
  var matmouth = new THREE.MeshPhongMaterial({color: Colors.green, shading: THREE.FlatShading});
  var mouth = new THREE.Mesh(geomouth, matmouth);
  mouth.position.x = 66;
  mouth.position.y= -10;
  mouth.castShadow = true;
  mouth.receiveShadow = true;
  this.mesh.add(mouth);

  var geomeyebig1 = new THREE.BoxGeometry(6,6,1,1,1,1);
  var mateyebig1 = new THREE.MeshPhongMaterial({color: Colors.softwhite, shading: THREE.FlatShading});
  var eyebig1 = new THREE.Mesh(geomeyebig1, mateyebig1);
  eyebig1.position.x = 80;
  eyebig1.position.y = 2;
  eyebig1.position.z= 10;
  eyebig1.castShadow = true;
  eyebig1.receiveShadow = true;
  this.mesh.add(eyebig1);

  var geomeyesmall1 = new THREE.BoxGeometry(3,3,1,1,1,1);
  var mateyesmall1 = new THREE.MeshPhongMaterial({color: Colors.blueDark, shading: THREE.FlatShading});
  var eyesmall1 = new THREE.Mesh(geomeyesmall1, mateyesmall1);
  eyesmall1.position.x = 81;
  eyesmall1.position.y = 2;
  eyesmall1.position.z= 11;
  eyesmall1.castShadow = true;
  eyesmall1.receiveShadow = true;
  this.mesh.add(eyesmall1);

  var geomeyebig2 = new THREE.BoxGeometry(6,6,1,1,1,1);
  var mateyebig2 = new THREE.MeshPhongMaterial({color: Colors.softwhite, shading: THREE.FlatShading});
  var eyebig2 = new THREE.Mesh(geomeyebig2, mateyebig2);
  eyebig2.position.x = 80;
  eyebig2.position.y = 2;
  eyebig2.position.z= -10;
  eyebig2.castShadow = true;
  eyebig2.receiveShadow = true;
  this.mesh.add(eyebig2);

  var geomeyesmall2 = new THREE.BoxGeometry(3,3,1,1,1,1);
  var mateyesmall2 = new THREE.MeshPhongMaterial({color: Colors.blueDark, shading: THREE.FlatShading});
  var eyesmall2 = new THREE.Mesh(geomeyesmall2, mateyesmall2);
  eyesmall2.position.x = 81;
  eyesmall2.position.y = 2;
  eyesmall2.position.z= -11;
  eyesmall2.castShadow = true;
  eyesmall2.receiveShadow = true;
  this.mesh.add(eyesmall2);

  //create the legs
  var geomleg1 = new THREE.BoxGeometry(25,10,50,1,1,1);
  var matleg1 = new THREE.MeshPhongMaterial({color: Colors.darkgrey, shading: THREE.FlatShading});
  geomleg1.vertices[0].y-=5;
  geomleg1.vertices[0].x-=20;
  geomleg1.vertices[5].y-=5;
  geomleg1.vertices[5].x-=10;
  geomleg1.vertices[2].y+=2;
  geomleg1.vertices[2].x-=20;
  geomleg1.vertices[7].y+=2;
  geomleg1.vertices[7].x-=10;
  var leg1 = new THREE.Mesh(geomleg1, matleg1);
  leg1.position.x = 30;
  leg1.position.y= -5;
  leg1.position.z= 55;
  leg1.castShadow = true;
  leg1.receiveShadow = true;
  this.mesh.add(leg1);

  new TWEEN.Tween({val: -5})
      .to({val: -15}, 2000)
      .easing(TWEEN.Easing.Quartic.Out)
      .repeat( Infinity )
      .onUpdate(function(){
         leg1.position.y = this.val;
      })
      .start();

  new TWEEN.Tween({val: 30})
      .to({val: 25}, 2000)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .repeat( Infinity )
      .onUpdate(function(){
         leg1.position.x = this.val;
      })
      .start();

  new TWEEN.Tween({val: 0})
      .to({val: Math.PI/10}, 2000)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .repeat( Infinity )
      .onUpdate(function(){
         leg1.rotation.z = this.val;
      })
      .start();


  var geomlegsmall1 = new THREE.BoxGeometry(15,10,20,1,1,1);
  var matlegsmall1 = new THREE.MeshPhongMaterial({color: Colors.darkgrey, shading: THREE.FlatShading});
  geomlegsmall1.vertices[0].y-=5;
  geomlegsmall1.vertices[0].x-=15;
  geomlegsmall1.vertices[5].y-=5;
  geomlegsmall1.vertices[5].x-=10;
  geomlegsmall1.vertices[2].y+=2;
  geomlegsmall1.vertices[2].x-=15;
  geomlegsmall1.vertices[7].y+=2;
  geomlegsmall1.vertices[7].x-=10;
  var legsmall1 = new THREE.Mesh(geomlegsmall1, matlegsmall1);
  legsmall1.position.x = -35;
  legsmall1.position.y= -5;
  legsmall1.position.z= 40;
  legsmall1.castShadow = true;
  legsmall1.receiveShadow = true;
  this.mesh.add(legsmall1);

  var geomleg2 = new THREE.BoxGeometry(25,10,50,1,1,1);
  var matleg2 = new THREE.MeshPhongMaterial({color: Colors.darkgrey, shading: THREE.FlatShading});
  geomleg2.vertices[1].y-=5;
  geomleg2.vertices[1].x-=20;
  geomleg2.vertices[4].y-=5;
  geomleg2.vertices[4].x-=10;
  geomleg2.vertices[3].y+=2;
  geomleg2.vertices[3].x-=20;
  geomleg2.vertices[6].y+=2;
  geomleg2.vertices[6].x-=10;
  var leg2 = new THREE.Mesh(geomleg2, matleg2);
  leg2.position.x = 30;
  leg2.position.y= -5;
  leg2.position.z= -55;
  leg2.castShadow = true;
  leg2.receiveShadow = true;
  this.mesh.add(leg2);

  new TWEEN.Tween({val: -5})
      .to({val: -15}, 2000)
      .easing(TWEEN.Easing.Quartic.Out)
      .repeat( Infinity )
      .onUpdate(function(){
         leg2.position.y = this.val;
      })
      .start();

  new TWEEN.Tween({val: 30})
      .to({val: 25}, 2000)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .repeat( Infinity )
      .onUpdate(function(){
         leg2.position.x = this.val;
      })
      .start();

  new TWEEN.Tween({val: 0})
      .to({val: Math.PI/10}, 2000)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .repeat( Infinity )
      .onUpdate(function(){
         leg2.rotation.z = this.val;
      })
      .start();

  var geomlegsmall2 = new THREE.BoxGeometry(15,10,20,1,1,1);
  var matlegsmall2 = new THREE.MeshPhongMaterial({color: Colors.darkgrey, shading: THREE.FlatShading});
  geomlegsmall2.vertices[1].y-=5;
  geomlegsmall2.vertices[1].x-=15;
  geomlegsmall2.vertices[4].y-=5;
  geomlegsmall2.vertices[4].x-=10;
  geomlegsmall2.vertices[3].y+=2;
  geomlegsmall2.vertices[3].x-=15;
  geomlegsmall2.vertices[6].y+=2;
  geomlegsmall2.vertices[6].x-=10;
  var legsmall2 = new THREE.Mesh(geomlegsmall2, matlegsmall2);
  legsmall2.position.x = -35;
  legsmall2.position.y= -5;
  legsmall2.position.z= -40;
  legsmall2.castShadow = true;
  legsmall2.receiveShadow = true;
  this.mesh.add(legsmall2);
 
}

var turtle;

function createTurtle(){
  turtle = new turtleModel();
  turtle.mesh.scale.set(.40, .40, .40);
  turtle.mesh.position.y= 100;
  scene.add(turtle.mesh);  
}

fishGroup = function (){
  //create an empty container that will hold the fishes
  this.mesh = new THREE.Object3D();

  //create a cube geometry for the fish
  var geomFish = new THREE.BoxGeometry(10,10,10);
  var matFish = new THREE.MeshPhongMaterial({ color: Colors.softwhite});
  geomFish.vertices[0].y-=3;
  geomFish.vertices[0].x+=5;
  geomFish.vertices[2].y+=3;
  geomFish.vertices[2].x+=5;
  geomFish.vertices[4].y-=4;
  geomFish.vertices[4].x-=5;
  geomFish.vertices[6].y+=4;
  geomFish.vertices[6].x-=5;


  var geomFishTail = new THREE.BoxGeometry(10,10,2)
  var matFishTail = new THREE.MeshPhongMaterial({ color: Colors.softwhite});
  geomFishTail.vertices[0].y-=3;
  geomFishTail.vertices[1].y-=3;
  geomFishTail.vertices[2].y+=3;
  geomFishTail.vertices[3].y+=3;


  //duplicate the fish geometry a random number of times
  var nFishes = 3+Math.floor(Math.random()*3);
  for(var i=0; i<nFishes; i++){
    
    //create the mesh fish by cloning the geometry and rotate it accordingly 
    var fish = new THREE.Mesh(geomFish,matFish);
    fish.rotation.y = Math.PI / 4;
    
    //create the mesh fishTail and position it right
    var fishTail = new THREE.Mesh(geomFishTail,matFishTail);
    fishTail.position.x = -18;

    //create a group and add the two meshes
    //These meshes can now be rotated / scaled etc as a group
    var group = new THREE.Group();
    group.add( fish );
    group.add( fishTail );

    // set the position of each fish group obj randomly
    group.position.x = i*15;
    group.position.y = Math.random()*40-20;
    group.position.z = Math.random()*40-20;

    // allow each fish group obj to cast and to receive shadows
    group.castShadow = true;
    group.receiveShadow = true;

    // add the fish group obj to the container
    this.mesh.add(group);

  }
}

Sea = function(){
 //create an empty container
 this.mesh = new THREE.Object3D();

 //the number of fish groups
 this.nFishGroups = 20;
 
// To distribute the fish groups consistently,
// we need to place them according to a uniform angle
var stepAngle = Math.PI*2 / this.nFishGroups;

//create the fish groups
for(var i=0; i<this.nFishGroups; i++){
  var fishes = new fishGroup();

  //set the position of each fish group
  var a = stepAngle*i; // this is the final angle of the fish group
  var h = 750 + Math.random()*200; // this is the distance between the center of the axis and the fish group itself

  // converting polar coordinates (angle, distance) into Cartesian coordinates (x, y)
  fishes.mesh.position.y = Math.sin(a)*h;
  fishes.mesh.position.x = Math.cos(a)*h;
  fishes.mesh.rotation.z = a + Math.PI/2;
  // position the fish groups at random depths inside of the scene
  fishes.mesh.position.z = -400-Math.random()*400;

  //set a random scale for each fish group
  var s = Math.random()*2;
  fishes.mesh.scale.set(s,s,s);

  this.mesh.add(fishes.mesh);  

  }
}

var sea;

function createSea(){
  sea = new Sea();
  sea.mesh.position.y = -700;
  scene.add(sea.mesh);
}

var mousePos={x:0, y:0};

//function to handle the mouse move event
function handleMouseMove(event){
  //converting the mouse position value received to 
  //a normalized value between -1 and 1
  //in the horizontal axis
  var mousePosX= -1 + (event.clientX / WIDTH)*2;

  //for the vertical axis the formula should be inversed
  //because the 2D y-axis goes the opposite direction of the 3D y-axis

  var mousePosY= 1 - (event.clientY / HEIGHT)*2;
  mousePos= {x: mousePosX, y: mousePosY};
}

function loop(){
  TWEEN.update();
  var timeElapsed = clock.getElapsedTime();
  sea.mesh.rotation.z += .005;
  sea.mesh.children.forEach(function(child){
    child.children.forEach(function(child, index){   
        var x= timeElapsed*5 + index;
        child.scale.y= (Math.sin(x) + 1) / 2 + 0.8; 
        child.scale.z= (noise.simplex2(x, x) + 1) / 2 + 0.1;

    })
  });
  
  updateTurtle();
  renderer.render(scene, camera);
  //controls.update();
  requestAnimationFrame(loop);

}

function updateTurtle(){
   //the turtle will move between -100 and 100 on the horizontal axis,
   //and between 25 and 175 on the vertical axis
   //depending on the mouse position varying between -1 and 1 on both axis
   //to achieve that a normalized function is used

   var targetX = normalize(mousePos.x, -1, 1, -100, 100);
   var targetY = normalize(mousePos.y, -1, 1, 25, 175);

   //update the turtle position
   turtle.mesh.position.y= targetY;
   turtle.mesh.position.x= targetX;

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