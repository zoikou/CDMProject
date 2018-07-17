var scene, camera, particleSystem,controls, renderer, HEIGHT, WIDTH, windowHalfX, windowHalfY;

function init() {
	 HEIGHT= window.innerHeight;
     WIDTH= window.innerWidth;
     windowHalfX = WIDTH / 2;
     windowHalfY = HEIGHT / 2;
	scene = new THREE.Scene();

	// camera
	camera = new THREE.PerspectiveCamera(
		45, // field of view
		WIDTH/HEIGHT, // aspect ratio
		1, // near clipping plane
		1000 // far clipping plane
	);
	camera.position.z = 100;
	camera.position.x = 0;
	camera.position.y = 20;
	camera.lookAt(new THREE.Vector3(0, 0, 0));

	var particleMat = new THREE.PointsMaterial({
		color: 'rgb(255, 255, 255)',
		size: 0.25,
		map: new THREE.TextureLoader().load('assets/textures/particle2.png'),
		transparent: true,
		blending: THREE.AdditiveBlending,
		depthWrite: false
	});

	var particleGeo = new THREE.SphereGeometry(10, 64, 64);

	particleGeo.vertices.forEach(function(vertex) {
		vertex.x += (Math.random() - 0.5);
		vertex.y += (Math.random() - 0.5);
		vertex.z += (Math.random() - 0.5);
	});

	particleSystem = new THREE.Points(
		particleGeo,
		particleMat
	);

	scene.add(particleSystem);

	// renderer
	renderer = new THREE.WebGLRenderer({
    //allow transparency to show the gradient background
    alpha: true,
    //activate the anti-aliasing
    antialias: true
    });
	renderer.setSize(WIDTH,HEIGHT);
	renderer.shadowMap.enabled = true;
	

	controls = new THREE.OrbitControls( camera, renderer.domElement );

   
	document.getElementById('world').appendChild(renderer.domElement);
	// listen to the screen: if the user resizes it, the camera and the renderer size should be updated
    window.addEventListener('resize', handleWindowResize, false);
    createLights();
	update();

}

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
function update() {
	controls.update();
	renderer.render(scene, camera);
	particleSystem.rotation.y += 0.005;
	
	requestAnimationFrame(update);
}
var hemisphereLight, shadowLight, ambientLight;

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

  // an ambient light modifies the global color of a scene and makes the shadows softer
  ambientLight = new THREE.AmbientLight(0xdc8874, .5);


  //to activate the lights must be added to the scene
  scene.add(hemisphereLight);
  scene.add(shadowLight);
  scene.add(ambientLight);
}


window.addEventListener('load', init, false);
