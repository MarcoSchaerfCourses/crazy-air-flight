var aereo,scene,camera,renderer;
var val1=0;
var val2=0;
var val3=0;
var val4=0;
var colore_aereo=document.getElementById("colore").value;
$(function() {
  //abbiamo due entità separate scena e camera. Il renderer li disegna
  var width=600;
  var height=250;
  console.log(colore_aereo);
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(60,window.innerWidth / window.innerHeight,1,10000);
  renderer = new THREE.WebGLRenderer();

  renderer.setClearColor(0x000000);
  renderer.setSize(window.innerWidth, window.innerHeight);

  // per ciascun oggetto dobbiamo definire la geometria e i materiali
  aereo = new Aereo(true);
  aereo.mesh.position.set(-250,0,0);
  //aereo.mesh.position.set(0,0,0);
  aereo.mesh.rotation.y-=Math.PI/4;
  scene.add(aereo.mesh);
  camera.position.x = 0;
  camera.position.y = 0;
  camera.position.z = 400;
  camera.lookAt(0,0,0);
    	// A hemisphere light is a gradient colored light; 
	// the first parameter is the sky color, the second parameter is the ground color, 
	// the third parameter is the intensity of the light
	hemisphereLight = new THREE.HemisphereLight(0xaaaaaa,0x000000, .9)
	
	// A directional light shines from a specific direction. 
	// It acts like the sun, that means that all the rays produced are parallel. 
	shadowLight = new THREE.DirectionalLight(0xffffff, .9);

	// Set the direction of the light  
	shadowLight.position.set(150, 350, 350);
	
	// Allow shadow casting 
	shadowLight.castShadow = true;

	// define the visible area of the projected shadow
	shadowLight.shadow.camera.left = -400;
	shadowLight.shadow.camera.right = 400;
	shadowLight.shadow.camera.top = 400;
	shadowLight.shadow.camera.bottom = -400;
	shadowLight.shadow.camera.near = 1;
	shadowLight.shadow.camera.far = 1000;

	// define the resolution of the shadow; the higher the better, 
	// but also the more expensive and less performant
	shadowLight.shadow.mapSize.width = 2048;
	shadowLight.shadow.mapSize.height = 2048;
	
	// to activate the lights, just add them to the scene
	scene.add(hemisphereLight);  
	scene.add(shadowLight);
  //camera.lookAt(aereo.mesh.position);
  //var controls = new THREE.OrbitControls(camera,renderer.domElement );
  animate();
  function animate(){
	  requestAnimationFrame(animate);
	  aereo.mesh.rotation.y+=0.05;
	  renderer.render(scene,camera);
  }
  renderer.render(scene, camera);
  $("#webGL-container").append(renderer.domElement);

});
function change_color(color){
	colore_aereo=color;
	scene.remove(aereo.mesh);
	aereo.mesh = undefined;
	aereo=new Aereo(false);
	aereo.mesh.position.set(-250,0,0);
	scene.add(aereo.mesh);
}