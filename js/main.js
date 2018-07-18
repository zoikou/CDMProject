var scene, camera, particleSystem,particleGeo,controls,clock, renderer, HEIGHT, WIDTH, windowHalfX, windowHalfY;

function init() {
	 HEIGHT= window.innerHeight;
     WIDTH= window.innerWidth;
     windowHalfX = WIDTH / 2;
     windowHalfY = HEIGHT / 2;
	scene = new THREE.Scene();
    clock = new THREE.Clock();
	// camera
	camera = new THREE.PerspectiveCamera(
		30, // field of view
		WIDTH/HEIGHT, // aspect ratio
		1, // near clipping plane
		1000 // far clipping plane
	);
	
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

	particleGeo = new THREE.OctahedronGeometry(10, 4);

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
    //createLights();
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
	var timeElapsed = clock.getElapsedTime();
	controls.update();
	renderer.render(scene, camera);
	particleSystem.rotation.y += 0.003;
	
	requestAnimationFrame(update);
}



window.addEventListener('load', init, false);
