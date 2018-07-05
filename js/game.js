window.addEventListener('load', init, false);

var game;
var deltaTime = 0;
var newTime = new Date().getTime();
var oldTime = new Date().getTime();
var riservaOstacoli = [];
var riservaRacimoli = [];
var camera;
var colore_aereo;
const altezza_aereo=200;

//Animazioni
var flagA=false;
var flagD=false;
var flagW=false;
var flagS=false;
var loaded=false;
var animazione=false;
const zVelocita = 3;
const xVelocita = 3;
const yVelocita = 3;
var animazioni=[];
var ripetizione=0;


function resetVariabiliGioco(){
  game = {velocita:6,
		  altezza_cielo:200,
          distanza:0,
          rapportoVelocitaDistanza:0.005,
          energia:100,
          numOstacoli:6,
          pianetaRadius:600,
          pianetaLength:1200,
		  environment:"earth",
          distanzaToleranzaOstacolo:20,
          valoreOstacolo:34,
		  qualita:4,
          velocitaOstacoli:4,
          status : "playing",
         };
}

var scene, renderer, container, fieldDistance, energyBar, fieldLevel, replayMessage;
var hemisphereLight, ambientLight, shadowLight;
var pianeta;
var cielo;

function init(event){
	replayMessage = document.getElementById("replayMessage");
	fieldDistance = document.getElementById("distValue");
	energyBar = document.getElementById("health");
	fieldLevel = document.getElementById("levelValue");
	var url_string = window.location.href;
	var url = new URLSearchParams(url_string);
	if(url.get("color")!=null){
		colore_aereo = url.get("color");
		document.getElementById("colore").value=colore_aereo;
	}
	var difficulty = url.get("difficulty");
	if(difficulty != null){
		document.getElementById("difficolta").value=difficulty;
	}
	resetVariabiliGioco();
	
	if(url.get("environment")!=null){
		game.environment = url.get("environment");
		document.getElementById("environment").value=game.environment;
	}
	if(url.get("qualita")!=null){
		game.qualita = url.get("qualita");
		document.getElementById("qualita").value=game.qualita;
	}
	if(document.getElementById("difficolta").value==="easy"){
		game.velocitaOstacoli=4;
		fieldLevel.innerHTML=1
	}
	else if(document.getElementById("difficolta").value==="medium"){
		game.velocitaOstacoli=8;
		fieldLevel.innerHTML=2;
	}
	else if(document.getElementById("difficolta").value==="hard"){
		game.velocitaOstacoli=10;
		fieldLevel.innerHTML=3;
	}
	//Scena
		// Create the scene
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(60,window.innerWidth / window.innerHeight,1,10000);
	camera.position.x = -80;
	camera.position.z = 0;
	camera.position.y = 220;
	camera.lookAt(new THREE.Vector3(100,100,0));
	
	// Create the renderer
	renderer = new THREE.WebGLRenderer({ 
		alpha: true, 
		antialias: true 
	});
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.shadowMap.enabled = true;
	container = document.getElementById('scena');
	container.appendChild(renderer.domElement);
	
	// Lights
	hemisphereLight = new THREE.HemisphereLight(0xaaaaaa,0x000000, .9);
	ambientLight = new THREE.AmbientLight(0xdc8874, .5);

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
	scene.add(ambientLight);
	//Pianeta
	console.log("qualita: "+game.qualita);
	if(game.environment==="mars"){
		pianeta = new Pianeta('img/marsmap'+game.qualita+'k.jpg','img/marsbump'+game.qualita+'k.jpg',null,null,'img/mars_'+game.qualita+'k_normal.jpg');
	}
	else{
		pianeta = new Pianeta('img/earthmap'+game.qualita+'k.jpg','img/earthbump'+game.qualita+'k.jpg','img/earthspec'+game.qualita+'k.jpg','img/earthlights'+game.qualita+'k.jpg',null);
	}
	pianeta.mesh.position.y = -600;
	scene.add(pianeta.mesh);
	//Cielo
		cielo = new Cielo(game.altezza_cielo);
	cielo.mesh.position.y = -600;
	if(game.environment==="earth"){
		scene.add(cielo.mesh);
	}
	creaAereo();
	creaOstacoli();
	creaRacimoli();
	loop();
}

var aereo;

function creaAereo(){ 
	aereo = new Aereo();
	aereo.mesh.scale.set(.25,.25,.25);
	aereo.mesh.position.y = altezza_aereo;
	scene.add(aereo.mesh);
}


function creaOstacoli(){
	if(game.status!="dead"){
		for (var i=0; i<10; i++){
			var ostacolo = new Ostacolo();
			riservaOstacoli.push(ostacolo);
		}
		contenitoreOstacoli = new ContenitoreOstacoli();
		contenitoreOstacoli.generaOstacoli();
		scene.add(contenitoreOstacoli.mesh)
	}
}

function creaRacimoli(){
  for (var i=0; i<10; i++){
    var racimolo = new Racimolo();
    riservaRacimoli.push(racimolo);
  }
  contenitoreRacimoli = new ContenitoreRacimoli();
  scene.add(contenitoreRacimoli.mesh)
}


function loop(){
  ambientLight.intensity += (.5 - ambientLight.intensity)*deltaTime*0.005; //normaliza la luce dopo un impatto
  pianeta.ruota();
  cielo.ruota();
  if (game.status=="playing"){
	newTime = new Date().getTime();
	deltaTime = newTime-oldTime;
	oldTime = newTime;
    contenitoreOstacoli.ruotaOstacoli();
	updateAereo();
	updateDistanza();
  }
  else if(game.status=="dead"){
		contenitoreOstacoli.rimuoviOstacoli();
  }
  if(animazioni.length>0){
			var l=[];
			for(var i=0;i<animazioni.length;i++){
				var flag=animazioni[i].execute();
				if(!flag){
					l.push(i);
				}
			}
			for(var i=l.length-1;i>=0;i--){
				animazioni.splice(l[i],1);
			}
  }	
  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}

function showReplay(){
  replayMessage.style.visibility="visible";
}

function hideReplay(){
  replayMessage.style.visibility="hidden";
}

function updateDistanza(){
	if(loaded){
		game.distanza += game.velocita*deltaTime*game.rapportoVelocitaDistanza;
		fieldDistance.innerHTML = Math.floor(game.distanza);
	}
}
function callback2(){
	ripetizione+=1;
	if(ripetizione<10){
		animazioni.push(new Animazione(aereo,callback2,animCaduta));
	}
	else{
		contenitoreRacimoli.generaRacimoli(aereo.mesh.position.clone(), 125, colore_aereo, 3);
		scene.remove(aereo.mesh);
		ambientLight.intensity = 9;
		animazione=false;
		showReplay();
	}
}
function callback(){
	flagW=false;
	flagA=false;
	flagS=false;
	flagD=false;
	animazione=false;
	aereo.mesh.rotation.x=0;
	aereo.mesh.rotation.y=0;
	aereo.mesh.rotation.z=0;
	if(game.energia<0&&game.status!="dead"){
		game.status="dead";
		animazione=true;
		contenitoreOstacoli.rimuoviOstacoli();
		riservaOstacoli=[];
		animazioni.push(new Animazione(aereo,callback2,animCaduta));
		
	}
	else if(game.energia<0){
		animazione=true;
	}
}

function updateAereo(){
	if(!animazione){
	  if(flagA&&(aereo.mesh.position.z-zVelocita>=-100)){
		aereo.mesh.position.z -= zVelocita;
		if(aereo.mesh.rotation.x==0) {
			aereo.mesh.rotation.x-=Math.PI/5;
		}
	  }
	  else if(flagD&&(aereo.mesh.position.z+zVelocita<=100)){
		  	aereo.mesh.position.z += zVelocita;
			if(aereo.mesh.rotation.x==0){
				aereo.mesh.rotation.x+=Math.PI/5;
			}
	  }
	  else if(flagW&&(aereo.mesh.position.y+yVelocita<=altezza_aereo+50)){
			aereo.mesh.position.y += yVelocita;
			if(aereo.mesh.rotation.z==0){
				aereo.mesh.rotation.z+=Math.PI/8;
			}
	  }
	  else if(flagS&&(aereo.mesh.position.y-yVelocita>=altezza_aereo-50)){
			aereo.mesh.position.y -= yVelocita;
			if(aereo.mesh.rotation.z==0){
				aereo.mesh.rotation.z-=Math.PI/8;
			}
	  }
	}

	aereo.pilot.aggiornaCapelli();
	aereo.ruotaElica();
	aereo.muoviRuote();
	
	//update camera position with respect to the main character
	camera.position.y=aereo.mesh.position.y+20;
	camera.position.x = aereo.mesh.position.x-80;
	camera.lookAt(new THREE.Vector3(0,aereo.mesh.position.y,0));
}

ContenitoreOstacoli = function (){
  this.mesh = new THREE.Object3D();
  this.ostacoliCorrenti = [];
}

ContenitoreOstacoli.prototype.generaOstacoli = function(){
  var numOstacoli = game.numOstacoli;
  var ostacolo;
  for (var i=1; numOstacoli!=this.ostacoliCorrenti.length; i++){
    if (riservaOstacoli.length) {
      ostacolo = riservaOstacoli.pop();
    }else{
      ostacolo = new Ostacolo();
    }

    ostacolo.angle = - (i*0.1);
	ostacolo.mesh.position.x = aereo.mesh.position.x+200+200*Math.random();

	var bernulli=Math.floor(Math.random()*numOstacoli);
	if(bernulli===0){
		ostacolo.mesh.position.z = aereo.mesh.position.z;
		ostacolo.mesh.position.y = aereo.mesh.position.y;
	}
	else{
		ostacolo.mesh.position.y = aereo.mesh.position.y+50*Math.random()*(Math.floor(Math.random()*2) == 1 ? 1 : -1);
		ostacolo.mesh.position.z =  Math.random() * 140 ;
		ostacolo.mesh.position.z *= Math.floor(Math.random()*2) == 1 ? 1 : -1;
	}
    this.mesh.add(ostacolo.mesh);
    this.ostacoliCorrenti.push(ostacolo);
  }
}

ContenitoreOstacoli.prototype.rimuoviOstacoli = function(){
  for (var i=0; i<this.ostacoliCorrenti.length; i++){
    var ostacolo = this.ostacoliCorrenti[i];
     riservaOstacoli.unshift(this.ostacoliCorrenti.splice(i,1)[0]);
     this.mesh.remove(ostacolo.mesh);
  }
}

ContenitoreOstacoli.prototype.ruotaOstacoli = function(){
  for (var i=0; i<this.ostacoliCorrenti.length; i++){
    var ostacolo = this.ostacoliCorrenti[i];
	ostacolo.mesh.position.x = ostacolo.mesh.position.x-game.velocitaOstacoli;
    ostacolo.mesh.rotation.z += Math.random()*.3;
    ostacolo.mesh.rotation.y += Math.random()*.3;
    var diffPos = aereo.mesh.position.clone().sub(ostacolo.mesh.position.clone());
	var diffY = aereo.mesh.position.y-ostacolo.mesh.position.y;
	var diffZ = aereo.mesh.position.z-ostacolo.mesh.position.z;
    var d = diffPos.length();
    if (d<game.distanzaToleranzaOstacolo){
	  if(diffY==0&&diffZ>0){
		 animazioni.push(new Animazione(aereo,callback,animDestra));
	  }
	  else if(diffY==0&&diffZ<0){
		 animazioni.push(new Animazione(aereo,callback,animSinistra));
	  }
	  else if(diffY>0&&diffZ===0){
		animazioni.push(new Animazione(aereo,callback,animSu));
	  }
	  else if(diffY<0&&diffZ===0){
		animazioni.push(new Animazione(aereo,callback,animGiu));
	  }
	  else if(diffY>0&&diffZ>0){
		animazioni.push(new Animazione(aereo,callback,animSu));
		animazioni.push(new Animazione(aereo,callback,animDestra));
	  }
	  else if(diffY>0&&diffZ<0){
		animazioni.push(new Animazione(aereo,callback,animSu));
		 animazioni.push(new Animazione(aereo,callback,animSinistra));
	  }
	  else if(diffY<0&&diffZ>0){
		animazioni.push(new Animazione(aereo,callback,animGiu));
		animazioni.push(new Animazione(aereo,callback,animDestra));
	  }
	  else if(diffY<0&&diffZ<0){
		animazioni.push(new Animazione(aereo,callback,animGiu));
		 animazioni.push(new Animazione(aereo,callback,animSinistra));
	  }
	  else{
		  if(Math.random()<0.5){
			animazioni.push(new Animazione(aereo,callback,animSu));
		  }
		  else{
			animazioni.push(new Animazione(aereo,callback,animGiu));
		  }
		  if(Math.random()<0.5){
			animazioni.push(new Animazione(aereo,callback,animDestra));
		  }
		  else{
			animazioni.push(new Animazione(aereo,callback,animSinistra));
		  }
	  }
	  animazione=true;
      contenitoreRacimoli.generaRacimoli(ostacolo.mesh.position.clone(), 15, ostacolo.mesh.material.color, 3);
      riservaOstacoli.unshift(this.ostacoliCorrenti.splice(i,1)[0]);
      this.mesh.remove(ostacolo.mesh);
      ambientLight.intensity = 3;
      scalaEnergia();
      i--;
	  this.generaOstacoli();
    }
	else if (ostacolo.angle > Math.PI){
      riservaOstacoli.unshift(this.ostacoliCorrenti.splice(i,1)[0]);
      this.mesh.remove(ostacolo.mesh);
      i--;
    }
	else if(ostacolo.mesh.position.x<aereo.mesh.position.x){
	  riservaOstacoli.unshift(this.ostacoliCorrenti.splice(i,1)[0]);
      this.mesh.remove(ostacolo.mesh);
	  i--;
	  this.generaOstacoli();
	}
  }
}



function scalaEnergia(){
  game.energia -= game.valoreOstacolo;
  energyBar.value=game.energia;
}

document.addEventListener('keydown', function(event) {
	if(event.code == 'KeyA'){
		if(!flagD && !animazione){
			flagA=true;
		}
	}
	else if (event.code == 'KeyD') {
		if(!flagA && !animazione){
			flagD=true;
		}
	}
	else if(event.code == 'KeyW'){
		if(!flagS && !animazione){
			flagW=true;
		}
	}
	else if(event.code == 'KeyS'){
		if(!flagW && !animazione){
			flagS=true;
		}
	}
});

document.addEventListener('keyup', function(event) {

  if (event.code == 'KeyA' ) {
	  flagA=false;
	  if(!animazione && aereo.mesh.rotation.x != 0){
			aereo.mesh.rotation.x=0;
	  }
  }
  else if(event.code == 'KeyD'){
	  flagD=false;
	  if(!animazione && aereo.mesh.rotation.x != 0){
			aereo.mesh.rotation.x=0;
	  }
  }
  else if(event.code == 'KeyW'){
	  flagW=false;
	  if(!animazione && aereo.mesh.rotation.z!=0 ){
			aereo.mesh.rotation.z=0;	
	  }
  }
  else if(event.code == 'KeyS'){
	  flagS=false;
	  if(!animazione && aereo.mesh.rotation.z !=0 ){
			aereo.mesh.rotation.z=0;
	  }
  }
});

ContenitoreRacimoli = function (){
  this.mesh = new THREE.Object3D();
}

ContenitoreRacimoli.prototype.generaRacimoli = function(pos, nParticelle, color, scale){

  for (var i=0; i<nParticelle; i++){
    var racimolo;
    if (riservaRacimoli.length) {
      racimolo = riservaRacimoli.pop();
    }else{
      racimolo = new Racimolo();
    }
    this.mesh.add(racimolo.mesh);
    racimolo.mesh.visible = true;
    racimolo.mesh.position.y = pos.y;
    racimolo.mesh.position.x = pos.x;
	racimolo.mesh.position.z = pos.z;
    racimolo.explode(pos,color,scale);
  }
}

function restart(){
	resetVariabiliGioco();
	if(document.getElementById("difficolta").value==="easy"){
		game.velocitaOstacoli=4;
		fieldLevel.innerHTML=1
	}
	else if(document.getElementById("difficolta").value==="medium"){
		game.velocitaOstacoli=8;
		fieldLevel.innerHTML=2;
	}
	else if(document.getElementById("difficolta").value==="hard"){
		game.velocitaOstacoli=10;
		fieldLevel.innerHTML=3;
	}
	flagA=false;
	flagD=false;
	flagW=false;
	flagS=false;
	animazione=false;
	ripetizione=0;
	contenitoreOstacoli.rimuoviOstacoli();
	deltaTime = 0;
	newTime = new Date().getTime();
	oldTime = new Date().getTime();
	riservaOstacoli = [];
	riservaRacimoli = [];
	creaAereo();
	hideReplay();
	creaOstacoli();
	creaRacimoli();
	energyBar.value=100;
}