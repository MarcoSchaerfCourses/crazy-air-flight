var colori = {
	red:"#FF0000",
	white:0xd8d0d1,
	brown:0x59332e,
	pink:0xF5986E,
	brownDark:0x23190f,
	blue:0x68c3c0,
	cyan:"#00FFFF",
	yellow:"#FFFF00",
	orange:"#FFA500",
	blue2:"#0000FF",
	green:"#008000",
};

var Pianeta = function(map_path,bump_path,specular_path,light_path,normal_path){
		var geom = new THREE.CylinderGeometry(game.pianetaRadius,game.pianetaRadius,game.pianetaLength,40,10);
		geom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));
		manager = new THREE.LoadingManager();
		manager.onProgress = function (item, loaded, total) {
			document.getElementById("barriera").value=loaded/total*100;
		};
		manager.onLoad = function () {
			document.getElementById("progress").style.visibility="hidden";
			document.getElementById("scena").style.visibility="visible";
			loaded=true;
			game.distanza=0;
			deltaTime=0;
		};
		manager.onError = function () {
			console.log('there has been an error');
		};
		var my_spec=null;;
		if(specular_path!=null){
			my_spec=new THREE.TextureLoader(manager).load(specular_path);
		}
		var my_light=null;
		if(light_path!=null){
			my_light=new THREE.TextureLoader(manager).load(light_path);
		}
		var my_normal=null;
		if(normal_path!=null){
			my_normal=new THREE.TextureLoader(manager).load(normal_path);
		}
		var mat = new THREE.MeshPhongMaterial({
			map: new THREE.TextureLoader(manager).load(map_path),
			bumpMap	: new THREE.TextureLoader(manager).load(bump_path),
			bumpScale: 50,
			specularMap: my_spec,
			lightMap: my_light,
			normalMap: my_normal,
			specular: 0x222222,
			shininess: 25
		});
		this.mesh = new THREE.Mesh(geom, mat);
		this.mesh.receiveShadow = true; 
}
Pianeta.prototype.ruota = function(){
	this.mesh.rotation.z += .005;
}

var Nuvola = function(){
	
	this.mesh = new THREE.Object3D();
	
	var geom = new THREE.IcosahedronGeometry(15,1);
	var mat = new THREE.MeshPhongMaterial({
		color:colori.white,  
	});
	
	var nAtomi = 8+Math.floor(Math.random()*3);
	for (var i=0; i<nAtomi; i++ ){
		
		var m = new THREE.Mesh(geom, mat); 
		
		m.position.x = Math.random()*i;
		m.position.y = Math.random()*10;
		m.position.z = Math.random()*i*4;
		m.rotation.z = Math.random()*Math.PI*2;
		m.rotation.y = Math.random()*Math.PI*2;
		
		var s = .1 + Math.random()*.9;
		m.scale.set(s,s,s);
		
		m.castShadow = true;
		m.receiveShadow = true;
		
		this.mesh.add(m);
	} 
}

var Cielo = function(height){

	this.mesh = new THREE.Object3D();
	

	this.numNuvole = 20;
	

	var stepAngolo = Math.PI*2 / this.numNuvole;
	

	for(var i=0; i<this.numNuvole; i++){
		var c = new Nuvola();
	 

		var a = stepAngolo*i; 
		var h = 700+ Math.random()*height ; 


		c.mesh.position.y = Math.sin(a)*h;
		c.mesh.position.x = Math.cos(a)*h;


		c.mesh.rotation.z = a + Math.PI/2;

		var plusOrMinus = Math.random() < 0.5 ? -1 : 1;
		c.mesh.position.z = Math.random()*400*plusOrMinus;

		var s = 1+Math.random()*2;
		c.mesh.scale.set(s,s,s);

		this.mesh.add(c.mesh);  
	}  
}

Cielo.prototype.ruota = function(){
	this.mesh.rotation.z += .01;
}

Racimolo = function(){
  var geom = new THREE.TetrahedronGeometry(3,0);
  var mat = new THREE.MeshPhongMaterial({
    color:0x009999,
    shininess:0,
    specular:0xffffff,
    shading:THREE.FlatShading
  });
  this.mesh = new THREE.Mesh(geom,mat);
}

Racimolo.prototype.explode = function(pos, color, scale){
  var racimoloCorrente = this;
  var parentCorrente = this.mesh.parent;
  this.mesh.material.color = new THREE.Color( color);
  this.mesh.material.needsUpdate = true;
  this.mesh.scale.set(scale, scale, scale);
  var targetX = pos.x + (-1 + Math.random()*2)*50;
  var targetY = pos.y + (-1 + Math.random()*2)*50;
  var targetZ = pos.z;
  var speed = .6+Math.random()*.2;
  var rand_x=Math.random()*12;
  var rand_y=Math.random()*12;
  TweenMax.to(this.mesh.rotation, speed, {x:rand_x, y:rand_y});
  TweenMax.to(this.mesh.scale, speed, {x:.1, y:.1, z:.1});
  TweenMax.to(this.mesh.position, speed, {x:targetX, y:targetY,z:targetZ, delay:Math.random() *.1, ease:Power2.easeOut, onComplete:function(){
      if(parentCorrente) parentCorrente.remove(racimoloCorrente.mesh);
		racimoloCorrente.mesh.scale.set(1,1,1);
		racimoloCorrente.mesh.rotation.x=0;
		racimoloCorrente.mesh.rotation.y=0;
		racimoloCorrente.mesh.rotation.z=0;
		riservaRacimoli.unshift(racimoloCorrente);
    }});
}

const pilota_corpo_width=15;
const pilota_corpo_height=15;
const pilota_corpo_depth=15;
const pilota_faccia_width=10;
const pilota_faccia_height=10;
const pilota_faccia_depth=10;
const pilota_capello_width=4;
const pilota_capello_height=4;
const pilota_capello_depth=4;

var Pilota = function(){
  this.mesh = new THREE.Object3D();
  this.name = "pilota";
  this.angoloCapelli=0;

  var corpoGeom = new THREE.BoxGeometry(pilota_corpo_width,pilota_corpo_height,pilota_corpo_depth);
  var corpoMat = new THREE.MeshPhongMaterial({color:colori.brown, shading:THREE.FlatShading});
  var corpo = new THREE.Mesh(corpoGeom, corpoMat);
  corpo.position.set(2,-12,0);

  this.mesh.add(corpo);

  var facciaGeom = new THREE.BoxGeometry(pilota_faccia_width,pilota_faccia_height,pilota_faccia_depth);
  var facciaMat = new THREE.MeshLambertMaterial({color:colori.pink});
  var faccia = new THREE.Mesh(facciaGeom, facciaMat);
  this.mesh.add(faccia);

  var capelloGeom = new THREE.BoxGeometry(pilota_capello_width,pilota_capello_height,pilota_capello_depth);
  var capelloMat = new THREE.MeshLambertMaterial({color:colori.brown});
  var capello = new THREE.Mesh(capelloGeom, capelloMat);
  capello.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0,2,0));
  var capelli = new THREE.Object3D();

  this.capelliTop = new THREE.Object3D();

  for (var i=0; i<12; i++){
    var h = capello.clone();
    var col = i%3;
    var row = Math.floor(i/3);
    var startPosZ = -4;
    var startPosX = -4;
    h.position.set(startPosX + row*4, 0, startPosZ + col*4);
    h.geometry.applyMatrix(new THREE.Matrix4().makeScale(1,1,1));
    this.capelliTop.add(h);
  }
  capelli.add(this.capelliTop);

  var capelloSideGeom = new THREE.BoxGeometry(12,4,2);
  capelloSideGeom.applyMatrix(new THREE.Matrix4().makeTranslation(-6,0,0));
  var capelloSideR = new THREE.Mesh(capelloSideGeom, capelloMat);
  var capelloSideL = capelloSideR.clone();
  capelloSideR.position.set(8,-2,6);
  capelloSideL.position.set(8,-2,-6);
  capelli.add(capelloSideR);
  capelli.add(capelloSideL);

  var capelloBackGeom = new THREE.BoxGeometry(2,8,10);
  var capelloBack = new THREE.Mesh(capelloBackGeom, capelloMat);
  capelloBack.position.set(-1,-4,0)
  capelli.add(capelloBack);
  capelli.position.set(-5,5,0);

  this.mesh.add(capelli);

  var occhialiGeom = new THREE.BoxGeometry(5,5,5);
  var occhialiMat = new THREE.MeshLambertMaterial({color:colori.brown});
  var occhialiR = new THREE.Mesh(occhialiGeom,occhialiMat);
  occhialiR.position.set(6,0,3);
  var occhialiL = occhialiR.clone();
  occhialiL.position.z = -occhialiR.position.z

  var occhialiAGeom = new THREE.BoxGeometry(11,1,11);
  var occhialiA = new THREE.Mesh(occhialiAGeom, occhialiMat);
  this.mesh.add(occhialiR);
  this.mesh.add(occhialiL);
  this.mesh.add(occhialiA);

  var orecchioGeom = new THREE.BoxGeometry(2,3,2);
  var orecchioL = new THREE.Mesh(orecchioGeom,facciaMat);
  orecchioL.position.set(0,0,-6);
  var orecchioR = orecchioL.clone();
  orecchioR.position.set(0,0,6);
  this.mesh.add(orecchioL);
  this.mesh.add(orecchioR);
  return this;
}

Pilota.prototype.aggiornaCapelli = function(){
  //*
   var capelli = this.capelliTop.children;

   var l = capelli.length;
   for (var i=0; i<l; i++){
      var h = capelli[i];
      h.scale.y = .75 + Math.cos(this.angoloCapelli+i/3)*.25;
   }
  this.angoloCapelli += game.velocita*deltaTime*40;
  //*/
}

//////////////////////////////////////////////////////////////////////////////////////////////AEREO/////////////////////////////////////////////////////////////////////////////////

const fusoliera_width=75;
const cabina_width=75;
const cabina_height=30;
const cabina_depth=50;
const fusoliera_height=25;
const fusoliera_depth=25;
const stabilizzatore_width=15;
const ali_depth=150;
const ali_width=40;
const ali_height=10;
const motore_width=20;
const window_width=5;
const window_height=20;
const window_depth=25;
const param_opacity = 0.75;

var Fusoliera = function(){
	// Fusoliera
	var geomFusoliera = new THREE.BoxGeometry(fusoliera_width,fusoliera_height,fusoliera_depth,1,1,1);
	var matFusoliera = new THREE.MeshPhongMaterial({color:colore_aereo, shading:THREE.FlatShading});
	geomFusoliera.vertices[0].z+=10;
	geomFusoliera.vertices[1].z-=10;
	geomFusoliera.vertices[2].z+=10;
	geomFusoliera.vertices[3].z-=10;
	geomFusoliera.vertices[4].y-=5;
	geomFusoliera.vertices[4].z+=10;
	geomFusoliera.vertices[5].y-=5;
	geomFusoliera.vertices[5].z-=10;
	geomFusoliera.vertices[6].y+=15;
	geomFusoliera.vertices[6].z+=10;
	geomFusoliera.vertices[7].y+=15;
	geomFusoliera.vertices[7].z-=10;
	this.mesh=new THREE.Mesh(geomFusoliera, matFusoliera);
	return this;
}

var Coda = function(){
	var geomTimone = new THREE.BoxGeometry(15,20,5,1,1,1);
	var matTimone = new THREE.MeshPhongMaterial({color:colore_aereo, shading:THREE.FlatShading});
	var geomStabilizzatore = new THREE.BoxGeometry(stabilizzatore_width,8,50,1,1,2);
	var matStabilizzatore = new THREE.MeshPhongMaterial({color:colore_aereo, shading:THREE.FlatShading});
	var stabilizzatore = new THREE.Mesh(geomStabilizzatore, matStabilizzatore);
	stabilizzatore.position.set(0,-10,0);
	stabilizzatore.castShadow=true;
	stabilizzatore.receiveShadow=true;
	var timone = new THREE.Mesh(geomTimone, matTimone);
	timone.castShadow=true;
	timone.receiveShadow=true;
	this.mesh=new THREE.Object3D();
	this.mesh.add(timone);
	this.mesh.add(stabilizzatore);
	return this;
}

var Cabina = function(){
	var geomEngine = new THREE.BoxGeometry(cabina_width,cabina_height,cabina_depth,1,1,1);
	var matEngine = new THREE.MeshPhongMaterial({color:colore_aereo, shading:THREE.FlatShading});
	this.mesh   = new THREE.Mesh(geomEngine, matEngine);
}

var Ali = function(){
	this.mesh=new THREE.Object3D();
	var geomPrimaParte = new THREE.BoxGeometry(ali_width,ali_height,ali_depth,1,1,2);
	var matPrimaParte = new THREE.MeshPhongMaterial({color:colore_aereo, shading:THREE.FlatShading});
	var primaParte = new THREE.Mesh(geomPrimaParte, matPrimaParte);
	var geomSecondaParte = new THREE.CylinderGeometry( ali_width, ali_width, ali_height, 32, 32, false, 0, Math.PI/2 );
	var matSecondaParte = new THREE.MeshPhongMaterial( {color: colore_aereo, shading:THREE.FlatShading} );
	matSecondaParte.side=THREE.DoubleSide;
	var secondaParte = new THREE.Mesh( geomSecondaParte, matSecondaParte );
	secondaParte.position.set(-ali_width/2,0,ali_depth/2);
	var box2 = new THREE.BoxGeometry(0,ali_height,ali_width,1,1,2);
	var material2 = new THREE.MeshPhongMaterial( {color: colore_aereo, shading:THREE.FlatShading} );
	var second_part_box_wing = new THREE.Mesh( box2, material2 );
	second_part_box_wing.position.set(0,0,ali_width/2);
	secondaParte.add( second_part_box_wing );
	var geometry2 = new THREE.CylinderGeometry( ali_width, ali_width, ali_height, 32, 32, false, Math.PI/2, Math.PI/2 );
	var terzaParte = new THREE.Mesh( geometry2, matSecondaParte );
	terzaParte.position.set(-ali_width/2,0,-ali_depth/2);
	var second_part_box_wing_2 = new THREE.Mesh( box2, material2 );
	second_part_box_wing_2.position.set(0.5,0,-ali_width/2);
	terzaParte.add( second_part_box_wing_2 );
	primaParte.castShadow = true;
	primaParte.receiveShadow = true;
	secondaParte.castShadow = true;
	secondaParte.receiveShadow = true;
	terzaParte.castShadow = true;
	terzaParte.receiveShadow = true;
	this.mesh.add( primaParte );
	this.mesh.add( secondaParte );
	this.mesh.add( terzaParte );
}

var Motore = function(){
	var geomMotore = new THREE.BoxGeometry(motore_width,cabina_height,50,1,1,1);
	var matMotore = new THREE.MeshPhongMaterial({color:colore_aereo, shading:THREE.FlatShading});
	geomMotore.vertices[0].y-=5;
	geomMotore.vertices[0].z-=10;
	geomMotore.vertices[1].y-=5;
	geomMotore.vertices[1].z+=10;
	geomMotore.vertices[2].y+=5;
	geomMotore.vertices[2].z-=10;
	geomMotore.vertices[3].y+=5;
	geomMotore.vertices[3].z+=10;
	this.mesh = new  THREE.Mesh(geomMotore, matMotore);
}

var Paravento = function(){
	this.mesh=new THREE.Object3D();
	var geomWindow = new THREE.BoxGeometry(window_width,window_height,window_depth,1,1,1);
	var matWindow = new THREE.MeshPhongMaterial({color:colori.blue, shading:THREE.FlatShading, opacity: param_opacity, transparent: true});
	var window_object  = new THREE.Mesh(geomWindow, matWindow);
	window_object.position.set(30,22,0);
	window_object.castShadow = true;
	window_object.receiveShadow = true;
	this.mesh.add(window_object);
	
	const window_width_s=5;
	const window_height_s=20;
	const window_depth_s=25;
	const param_opacity_s = 0.75;
	var geomWindow_s = new THREE.BoxGeometry(25,20,5,1,1,1);
	var matWindow_s = new THREE.MeshPhongMaterial({color:colori.blue, shading:THREE.FlatShading, opacity: param_opacity, transparent: true});
	var window_object_s  = new THREE.Mesh(geomWindow_s, matWindow_s);
	window_object_s.position.set(20,22,-16);
	window_object_s.castShadow = true;
	window_object_s.receiveShadow = true;
	window_object_s.rotation.y-=0.5;
	this.mesh.add(window_object_s);
	
	const window_width_d=5;
	const window_height_d=20;
	const window_depth_d=25;
	const param_opacity_d = 0.75;
	var geomWindow_d = new THREE.BoxGeometry(25,20,5,1,1,1);
	var matWindow_d = new THREE.MeshPhongMaterial({color:colori.blue, shading:THREE.FlatShading, opacity: param_opacity, transparent: true});
	var window_object_d  = new THREE.Mesh(geomWindow_d, matWindow_d);
	window_object_d.position.set(20,22,+16);
	window_object_d.castShadow = true;
	window_object_d.receiveShadow = true;
	window_object_d.rotation.y+=0.5;
	this.mesh.add(window_object_d);
}

const protezione_ruota_width=30;
const protezione_ruota_height=15;
const protezione_ruota_depth=10;
const gomma_ruota_width=10;
const gomma_ruota_height=10;
const gomma_ruota_depth=4;

var Ruota = function(){
	this.mesh=new THREE.Object3D();
	var wheelProtecGeom = new THREE.BoxGeometry(protezione_ruota_width,protezione_ruota_height,protezione_ruota_depth,1,1,1);
	var wheelProtecMat = new THREE.MeshPhongMaterial({color:colore_aereo, shading:THREE.FlatShading});
	var wheelProtecR = new THREE.Object3D();
	wheelProtecR.add(new THREE.Mesh(wheelProtecGeom,wheelProtecMat));
	wheelProtecR.position.set(0,-cabina_height/2-protezione_ruota_height/2,0);
	this.protection=wheelProtecR;
	this.mesh.add(wheelProtecR);
	var wheelTireGeom = new THREE.CylinderGeometry( gomma_ruota_width, gomma_ruota_height, gomma_ruota_depth );
	var wheelTireMat = new THREE.MeshPhongMaterial({color:colori.brownDark, shading:THREE.FlatShading});
	var wheelTireR = new THREE.Mesh(wheelTireGeom,wheelTireMat);
	wheelTireR.rotation.x+=Math.PI/2;
	wheelTireR.position.set(0,-protezione_ruota_height/2,0);
	this.gomma=wheelTireR;
	wheelProtecR.add(wheelTireR );
	var wheelAxisGeom = new THREE.BoxGeometry(8,8,6);
	var wheelAxisMat = new THREE.MeshPhongMaterial({color:colori.brown, shading:THREE.FlatShading});
	var wheelAxis = new THREE.Mesh(wheelAxisGeom,wheelAxisMat);
	wheelAxis.position.set(0,-protezione_ruota_height/2,0);
	wheelAxis.rotation.y+=Math.PI/2;
	this.asse=wheelAxis;
	wheelProtecR.add(wheelAxis);
}

var RuotaPosteriore= function(){
	this.mesh=new THREE.Object3D();
	var wheelProtecGeom = new THREE.BoxGeometry(protezione_ruota_width*0.3,protezione_ruota_height*2,protezione_ruota_depth,1,1,1);
	var wheelProtecMat = new THREE.MeshPhongMaterial({color:colore_aereo, shading:THREE.FlatShading});
	var wheelProtecR = new THREE.Object3D();
	wheelProtecR.add(new THREE.Mesh(wheelProtecGeom,wheelProtecMat));
	wheelProtecR.position.set(0,-cabina_height/2-protezione_ruota_height/2,0);
	this.protection=wheelProtecR;
	this.mesh.add(wheelProtecR);
	var wheelTireGeom = new THREE.CylinderGeometry( gomma_ruota_width*2/3, gomma_ruota_height*2/3, gomma_ruota_depth );
	var wheelTireMat = new THREE.MeshPhongMaterial({color:colori.brownDark, shading:THREE.FlatShading});
	var wheelTireR = new THREE.Mesh(wheelTireGeom,wheelTireMat);
	wheelTireR.rotation.x+=Math.PI/2;
	wheelTireR.position.set(+4,-protezione_ruota_height,0);
	this.gomma=wheelTireR;
	wheelProtecR.add(wheelTireR );
	var wheelAxisGeom = new THREE.BoxGeometry(5,3,3);
	var wheelAxisMat = new THREE.MeshPhongMaterial({color:colori.brown, shading:THREE.FlatShading});
	var wheelAxis = new THREE.Mesh(wheelAxisGeom,wheelAxisMat);
	wheelAxis.position.set(+4,-protezione_ruota_height,0);
	wheelAxis.rotation.y+=Math.PI/2;
	this.asse=wheelAxis;
	wheelProtecR.add(wheelAxis);
	wheelProtecR.rotation.z-=0.9;
}

var Aereo = function(flag) {
	//variabili d'istanza per le animazioni
	this.animazioneSpintaSinistra=false;
	this.animazioneSpintaDestra=false;
	this.i=0;
	this.mesh = new THREE.Object3D();
	
	var fusoliera = new Fusoliera();
	fusoliera.mesh.position.set(-cabina_width/2-fusoliera_width/2,0,0);
	fusoliera.mesh.castShadow = true;
	fusoliera.mesh.receiveShadow = true;
	
	var coda = new Coda();

	coda.mesh.position.set(-fusoliera_width/2+stabilizzatore_width/2,15,0);
	coda.mesh.castShadow = true;
	coda.mesh.receiveShadow = true;
	fusoliera.mesh.add(coda.mesh);
	
	var cabina = new Cabina();
	cabina = cabina.mesh;
	cabina.castShadow = true;
	cabina.receiveShadow = true;
	cabina.add(fusoliera.mesh);

	var ali = new Ali();
	ali.mesh.castShadow = true;
	ali.mesh.receiveShadow = true;
	cabina.add(ali.mesh);
	
	//fmotore
	var motore = new Motore();
	motore.mesh.position.set(cabina_width/2+motore_width/2,0,0);
	motore.mesh.castShadow = true;
	motore.mesh.receiveShadow = true;
	cabina.add(motore.mesh);
	this.mesh.add(cabina);
	
	// elica
	var geomElica = new THREE.BoxGeometry(20,10,10,1,1,1);
	var matElica = new THREE.MeshPhongMaterial({color:colori.brown, shading:THREE.FlatShading});
	this.elica = new THREE.Mesh(geomElica, matElica);
	this.elica.castShadow = true;
	this.elica.receiveShadow = true;
	
	// lamas
	var geomBlade = new THREE.BoxGeometry(1,40,10,1,1,1);
	var matBlade = new THREE.MeshPhongMaterial({color:colori.brownDark, shading:THREE.FlatShading});
	
	var lama = new THREE.Mesh(geomBlade, matBlade);
	lama.position.set(8,0,0);
	lama.castShadow = true;
	lama.receiveShadow = true;
	this.elica.add(lama);
	this.elica.position.set(motore_width/2,0,0);
	motore.mesh.add(this.elica);
	if(flag ==null){
		this.pilot = new Pilota();
		this.pilot.mesh.position.set(pilota_corpo_width/2,cabina_height/2+pilota_corpo_height/2+pilota_faccia_height/2+pilota_capello_height/2,0);
		cabina.add(this.pilot.mesh);
	}
	var paravento=new Paravento();
	cabina.add(paravento.mesh);

	//ruota
	var ruotaD=new Ruota();
	ruotaD.mesh.position.set(cabina_width/2-protezione_ruota_width/2,0,cabina_depth/2-protezione_ruota_depth/2);
	cabina.add(ruotaD.mesh);
	this.ruotaD=ruotaD;
	var ruotaS=new Ruota();
	ruotaS.mesh.position.set(cabina_width/2-protezione_ruota_width/2,0,-cabina_depth/2+protezione_ruota_depth/2);
	cabina.add(ruotaS.mesh);
	this.ruotaS=ruotaS;
	var ruotaT=new RuotaPosteriore();
	this.ruotaT=ruotaT;
	ruotaT.mesh.position.set(-cabina_width/2,0,0);
	cabina.add(ruotaT.mesh);
	//Guns
	var gunGeom = new THREE.CylinderGeometry( 5, 5, 35 );
	var gunMat = new THREE.MeshPhongMaterial({color:colori.brown, shading:THREE.FlatShading});
	var gun_r = new THREE.Mesh(gunGeom,gunMat);
	gun_r.rotation.z=Math.PI/2;
	gun_r.position.set(0,-ali_height+0.5,ali_depth/2);
	cabina.add(gun_r);
	var gun_l=gun_r.clone();
	gun_l.position.set(0,-ali_height+0.5,-ali_depth/2);
	cabina.add(gun_l);
}

Aereo.prototype.muoviRuote = function(){
  //*
	this.ruotaD.gomma.rotation.y-=0.1;
	this.ruotaS.gomma.rotation.y-=0.1;
	this.ruotaT.gomma.rotation.y-=0.1;
  //*/
}

Aereo.prototype.ruotaElica = function(){
  //*
    aereo.elica.rotation.x += 0.3;
  //*/
}
Aereo.prototype.muoviASinistra = function(zSpeed){
  //*
	this.mesh.position.z -= zSpeed;
	if(this.mesh.rotation.x==0) {
		this.mesh.rotation.x-=Math.PI/5;
	}
  //*/
}

Aereo.prototype.muoviADestra = function(zSpeed){
  //*
	this.mesh.position.z += zSpeed;
	if(this.mesh.rotation.x==0){
		this.mesh.rotation.x+=Math.PI/5;
	}
  //*/
}

Aereo.prototype.muoviSu= function(ySpeed){
  //*
	this.mesh.position.y += ySpeed;
	if(this.mesh.rotation.z==0){
		this.mesh.rotation.z+=Math.PI/8;
	}
  //*/
}

Aereo.prototype.muoviGiu= function(ySpeed){
  //*
	aereo.mesh.position.y -= ySpeed;
	if(aereo.mesh.rotation.z==0){
		aereo.mesh.rotation.z-=Math.PI/8;
	}
  //*/
}

const animSu=[{x:0,y:3,z:0,rotX:0,rotY:0,rotZ:Math.PI/8},{x:0,y:3,z:0,rotX:0,rotY:0,rotZ:0},{x:0,y:3,z:0,rotX:0,rotY:0,rotZ:0},{x:0,y:3,z:0,rotX:0,rotY:0,rotZ:0},{x:0,y:3,z:0,rotX:0,rotY:0,rotZ:0},{x:0,y:3,z:0,rotX:0,rotY:0,rotZ:0},{x:0,y:3,z:0,rotX:0,rotY:0,rotZ:0},{x:0,y:3,z:0,rotX:0,rotY:0,rotZ:0},{x:0,y:3,z:0,rotX:0,rotY:0,rotZ:0},{x:0,y:3,z:0,rotX:0,rotY:0,rotZ:0}];
const animGiu=[{x:0,y:-3,z:0,rotX:0,rotY:0,rotZ:-Math.PI/8},{x:0,y:-3,z:0,rotX:0,rotY:0,rotZ:0},{x:0,y:-3,z:0,rotX:0,rotY:0,rotZ:0},{x:0,y:-3,z:0,rotX:0,rotY:0,rotZ:0},{x:0,y:-3,z:0,rotX:0,rotY:0,rotZ:0},{x:0,y:-3,z:0,rotX:0,rotY:0,rotZ:0},{x:0,y:-3,z:0,rotX:0,rotY:0,rotZ:0},{x:0,y:-3,z:0,rotX:0,rotY:0,rotZ:0},{x:0,y:-3,z:0,rotX:0,rotY:0,rotZ:0},{x:0,y:-3,z:0,rotX:0,rotY:0,rotZ:0}];
const animSinistra=[{x:0,y:0,z:-3,rotX:-Math.PI/5,rotY:0,rotZ:0},{x:0,y:0,z:-3,rotX:0,rotY:0,rotZ:0},{x:0,y:0,z:-3,rotX:0,rotY:0,rotZ:0},{x:0,y:0,z:-3,rotX:0,rotY:0,rotZ:0},{x:0,y:0,z:-3,rotX:0,rotY:0,rotZ:0},{x:0,y:0,z:-3,rotX:0,rotY:0,rotZ:0},{x:0,y:0,z:-3,rotX:0,rotY:0,rotZ:0},{x:0,y:0,z:-3,rotX:0,rotY:0,rotZ:0},{x:0,y:0,z:-3,rotX:0,rotY:0,rotZ:0},{x:0,y:0,z:-3,rotX:0,rotY:0,rotZ:0}];
const animDestra=[{x:0,y:0,z:3,rotX:Math.PI/5,rotY:0,rotZ:0},{x:0,y:0,z:3,rotX:0,rotY:0,rotZ:0},{x:0,y:0,z:3,rotX:0,rotY:0,rotZ:0},{x:0,y:0,z:3,rotX:0,rotY:0,rotZ:0},{x:0,y:0,z:3,rotX:0,rotY:0,rotZ:0},{x:0,y:0,z:3,rotX:0,rotY:0,rotZ:0},{x:0,y:0,z:3,rotX:0,rotY:0,rotZ:0},{x:0,y:0,z:3,rotX:0,rotY:0,rotZ:0},{x:0,y:0,z:3,rotX:0,rotY:0,rotZ:0},{x:0,y:0,z:3,rotX:0,rotY:0,rotZ:0}]; 
const animCaduta=[{x:1,y:-0.5,z:0,rotX:0.2,rotY:0,rotZ:0},{x:1,y:-0.5,z:0,rotX:0.2,rotY:0,rotZ:0},{x:1,y:-0.5,z:0,rotX:0.2,rotY:0,rotZ:0},{x:1,y:-0.5,z:0,rotX:0.2,rotY:0,rotZ:0},{x:1,y:-0.5,z:0,rotX:0.2,rotY:0,rotZ:0},{x:1,y:-0.5,z:0,rotX:0.2,rotY:0,rotZ:0},{x:1,y:-0.5,z:0,rotX:0.2,rotY:0,rotZ:0},{x:1,y:-0.5,z:0,rotX:0.2,rotY:0,rotZ:0},{x:1,y:-0.5,z:0,rotX:0.2,rotY:0,rotZ:0},{x:1,y:-0.5,z:0,rotX:0.2,rotY:0,rotZ:0}];

Animazione = function(object,callback,anim){
	this.callback=callback;
	this.object=object;
	this.i=0;
	this.numFrame=10;
	this.animazione=anim;
}

Animazione.prototype.execute= function(){
	var clip;
	if(this.i>this.numFrame){
		return false;
	}
	else if(this.i === this.numFrame){
		this.callback(0);
		return false;
	}
	else{
		clip=this.animazione[this.i];
		this.i+=1;
		this.object.mesh.position.x+=clip.x;
		this.object.mesh.position.y+=clip.y;
		this.object.mesh.position.z+=clip.z;
		this.object.mesh.rotation.x+=clip.rotX;
		this.object.mesh.rotation.y+=clip.rotY;
		this.object.mesh.rotation.z+=clip.rotZ;
		return true;
	}
}

///////////////////////////////////////////////////////////////////////////////////Ostacolo//////////////////////////////////////////////////////////////////////////////////////////

Ostacolo = function(){
  var geom;
  var colore;
  const num=5;
  const dim = 18;
  var temp=Math.random()*num;
  if(temp < 1){
	  geom = new THREE.TetrahedronGeometry(dim,2);
  }
  else if(temp < 2){
	  geom = new THREE.SphereGeometry( dim, 32, 32 );
  }
  else if(temp < 3){
	  geom = new THREE.BoxGeometry(dim, dim, dim);
  }
  else{
	  geom = new THREE.CylinderGeometry( dim, dim, 20, 32 );
  }
  temp=Math.random()*num;
  if(temp < 1){
	  colore=colori.blue2;
  }
  else if(temp < 2){
	  colore=colori.red;
  }
  else if(temp < 3){
	  colore=colori.green;
  }
  else if(temp < 4){
	  colore=colori.yellow;
  }
  else{
	  colore=colori.cyan;
  }
  var mat = new THREE.MeshPhongMaterial({
    color:colore,
    shininess:0,
    specular:0xffffff,
    shading:THREE.FlatShading
  });
  this.mesh = new THREE.Mesh(geom,mat);
  this.mesh.castShadow = true;
  this.angle = 0;
  this.dist = 0;
}
