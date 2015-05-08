(function ( window ) {


window.Turning.resources = {
	'skybox-xpos': 'images/nebula-xpos.png',
	'skybox-xneg': 'images/nebula-xneg.png',
	'skybox-ypos': 'images/nebula-ypos.png',
	'skybox-yneg': 'images/nebula-yneg.png',
	'skybox-zpos': 'images/nebula-zpos.png',
	'skybox-zneg': 'images/nebula-zneg.png',
	'brick': 'images/86.jpg',
	'tile-normal': 'images/tile.jpg',
	'tile-switch1': 'images/switch1.jpg',
	'tile-switch2': 'images/switch2.jpg',
	'tile-bridge': 'images/bridge.jpg'
};

var level = [
	//level 1
	{ map: [
		'111       ',
		'1s1111    ',
		'111111111 ',
		' 111111111',
		'     11e11',
		'      111 '  ],
	bridge: [] },
	//level 2
	{ map: [
		'      1111  111',
		'1111  11b1  1e1',
		'11a1  1111  111',
		'1111  1111  111',
		'1s11xx1111xx111',
		'1111  1111     '  ],
	bridge: [
		{ 'switch': [ 2, 2 ], 'tiles': [ [ 4, 4 ], [ 5, 4 ] ], 'on': false, 'type': 'normal' },
		{ 'switch': [ 8, 1 ], 'tiles': [ [ 10, 4 ], [ 11, 4 ] ], 'on': false, 'type': 'mormal' }
	] },
	//level 3
	{ map: [
		'      1111111  ',
		'1111  111  11  ',
		'111111111  1111',
		'1s11       11e1',
		'1111       1111',
		'            111'  ],
	bridge: [] }
];

var game = function () {

	// show stats control
	this.isShowStats = true;
	this.showStats = function () {
		var isShow = this.isShowStats = !!arguments[ 0 ];
		this.stats.domElement.style.display = isShow ? 'block' : 'none';
	};

	// Pause Game
	this.pause = true;

	this.brick = null; // be defined in initScene

	this.currentLevel = 0;

};

game.prototype.loading = function () {
	var manager = new THREE.LoadingManager(),
		self = this;

	var k, loader;
	for ( k in Turning.resources ) {
		loader = new THREE.TextureLoader( manager );
		loader.load( Turning.resources[ k ], (function ( k ) {
			return function ( texture ) {
				Turning.resources[ k ] = texture;
			};
		})( k ) );
	}
	manager.onProgress = function ( item, loaded, total ) {
		//console.log(item, loaded, total);
	};
	manager.onLoad = function () {
		self.initScene();
		self.beginRender();

		initMenu();
	};
};
game.prototype.initScene = function () {
	// some dimension variable
	var SCREEN_WIDTH = window.innerWidth,
		SCREEN_HEIGHT = window.innerHeight,
		CONTAINER_ELEMENT = document.body,
		self = this;

	// Scene
	var scene = new THREE.Scene();

	// Camera
	var VIEW_ANGLE = 45,
		ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT,
		NEAR = 200,
		FAR = 9000,
		camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR );
	scene.add( camera );
	camera.position.set( -100, 700, 700 );
	camera.lookAt( scene.position );

	// Light
	var light = new THREE.PointLight( 0xffffff );
	light.position.set( 0, 2000, 1000 );
	scene.add( light );

	// Skybox
	var materialArray = [ 'skybox-xpos', 'skybox-xneg','skybox-ypos', 'skybox-yneg','skybox-zpos', 'skybox-zneg' ];
	for (var i = 0; i < 6; i++) {
		materialArray[i] = new THREE.MeshBasicMaterial( { map: Turning.resources[ materialArray[ i ] ] } );
		materialArray[i].side = THREE.BackSide;
	}
	var skyboxMaterial = new THREE.MeshFaceMaterial( materialArray );
	var skyboxGeom = new THREE.CubeGeometry( 5000, 5000, 5000, 1, 1, 1 );
	var skybox = new THREE.Mesh( skyboxGeom, skyboxMaterial );
	scene.add( skybox );

	// Renderer
	var renderer = Detector.webgl ? new THREE.WebGLRenderer( { antialias: true } )
		: new THREE.CanvasRenderer();
	renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
	CONTAINER_ELEMENT.appendChild( renderer.domElement );

	// Control the mouse manipulate the scene
	var controls = new THREE.OrbitControls( camera, renderer.domElement );
	controls.minDistance = 200;
	controls.maxDistance = 3500;

	// stats
	var stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.bottom = '0px';
	stats.domElement.style.zIndex = 1000;
	CONTAINER_ELEMENT.appendChild( stats.domElement );

	var brick = this.brick = new window.Turning.Brick( scene );

	// bind scene hotkey
	THREEx.WindowResize( renderer, camera );
	THREEx.FullScreen.bindKey( { charCode : 'f'.charCodeAt(0) } );

	var tuple = {
		37: this.brick.moveLeft,
		38: this.brick.moveUp,
		39: this.brick.moveRight,
		40: this.brick.moveDown
	};
	document.addEventListener( "keydown", function ( evt ) {
		if ( self.pause || Turning.AnimationObject.animating() ) {
			return;
		}
		if ( evt.keyCode in tuple ) {
			tuple[ evt.keyCode ].call( self.brick );
			self.check( self.brick.relativePos );
		}
	} );


	this.scene = scene;
	this.camera = camera;
	this.renderer = renderer;
	this.stats = stats;
	this.skybox = skybox;
	this.controls = controls;
};

game.prototype.check = function( pos ) {
	var len = pos.length,
		map = level[ this.currentLevel ].map,
		bridge = level[ this.currentLevel ].bridge,
		tiles = this.currentTiles,
		x, y, word;
	while ( len-- ) {
		x = pos[ len ][ 0 ], y = pos[ len ][ 1 ], word = map[ y ].charAt( x );
		if ( x < 0 || y < 0 || word === ' ' || ( word === 'x' && !tiles[ y ][ x ].active ) ) {
			return this.lose();
		}
		if ( word === 'a' ) {
			tiles[ y ][ x ].trigger();
		};
	}

	x = pos[ 0 ][ 0 ], y = pos[ 0 ][ 1 ], word = map[ y ].charAt( x );
	if ( pos.length === 1 ) {
		if ( word === 'e' ) return this.win();
		if ( word === '2' ) return this.lose();
		if ( word === 'b' ) {
			tiles[ y ][ x ].trigger();
		}

	}
};

var tileCacheTuple = {
	'1': Turning.Tile,
	's': Turning.Tile,
	'2': Turning.WeakTile,
	'a': Turning.Switch1Tile,
	'b': Turning.Switch2Tile,
	'x': Turning.BridgeTile
};

game.prototype.load = function( num ) {
	this.currentLevel = num || 0;
	this.currentTiles = [];

	var map = level[ this.currentLevel ].map,
		bridge = level[ this.currentLevel ].bridge,
		xlength = map[ 0 ].length,
		zlength = map.length,
		startX = -parseInt( xlength / 2 ) * UNIT_WIDTH,
		startZ = -parseInt( zlength / 2 ) * UNIT_WIDTH,
		i, j, word, aTile, tupleItem;

	for ( i in tileCacheTuple ) {
		tileCacheTuple[ i ].cache || ( tileCacheTuple[ i ].cache = [] );
		tileCacheTuple[ i ].usedIndex = 0;
		for ( j in tileCacheTuple[ i ].cache ) {
			tileCacheTuple[ i ].cache[ j ].destroy();
		}
	}
	this.brick.destroy();

	this.prompt( 'LEVEL ' + ( this.currentLevel + 1 ) );

	for ( i = 0; i < zlength; i++ ) {

		this.currentTiles[ i ] = [];

		for ( j = 0; j < xlength; j++ ) {
			word = map[ i ].charAt( j );
			aTile = false;
			tupleItem = tileCacheTuple[ word ];

			if ( tupleItem ) {
				this.currentTiles[ i ][ j ] = (
					( aTile = tupleItem.cache[ tupleItem.usedIndex ] ) ||
					( aTile = new tileCacheTuple[ word ]( this.scene ) ) );

				tupleItem.cache[ tupleItem.usedIndex++ ] = aTile;

				aTile.refresh( startX + UNIT_WIDTH * j, startZ + UNIT_WIDTH * i, 2000 );

				word === 's' && this.brick.refresh( startX + UNIT_WIDTH * j,
					startZ + UNIT_WIDTH * i, j, i, 2000);

			}

		}
	}

	var switchx, switchz, bx, bz;
	for ( i = 0; i < bridge.length; i++ ) {
		switchx = bridge[ i ].switch[ 0 ], switchz = bridge[ i ].switch[ 1 ];
		for ( j = 0; j < bridge[ i ].tiles.length; j++ ) {
			bx = bridge[ i ].tiles[ j ][ 0 ], bz = bridge[ i ].tiles[ j ][ 1 ];
			this.currentTiles[ switchz ][ switchx ].relatedBridges.push(
				this.currentTiles[ bz ][ bx ] );
		}
		if ( bridge[ i ].on ) {
			this.currentTiles[ switchz ][ switchx ].trigger();
		}
	}

};


game.prototype.prompt = function ( text ) {
	var dom = document.getElementById( 'prompt' );
	dom.innerHTML = text;
	Turning.AnimationObject.animate( 1000, function ( per ) {
		per = Math.pow( per, 0.3 );
		dom.style.left = ( 1 - per ) * 100 + '%';
	} );

	Turning.AnimationObject.animate( 1000, function ( per ) {
		per = Math.pow( per, 0.3 );
		dom.style.left = -per * 100 + '%';
	}, 1000 );
};
game.prototype.win = function () {
	var tileLen = this.currentTiles.length,
		subLen, tile, self = this;

	while ( tileLen-- ) {
		subLen = this.currentTiles[ tileLen ].length;
		while ( subLen-- ) {
			tile = this.currentTiles[ tileLen ][ subLen ];
			tile && tile.disappear();
		}
	}
	this.brick.disappear();

	var l = this.currentLevel = this.currentLevel + 1;

	if ( l >= level.length ) {
		setTimeout( function () {
			mainController.show();
		}, 1000 );
	} else {
		setTimeout( function () {
			self.load( l );
		}, 1000 );
	}
};
game.prototype.lose = function () {
	var tileLen = this.currentTiles.length,
		subLen, tile, self = this;

	while ( tileLen-- ) {
		subLen = this.currentTiles[ tileLen ].length;
		while ( subLen-- ) {
			tile = this.currentTiles[ tileLen ][ subLen ];
			tile && tile.disappear();
		}
	}
	this.brick.disappear();

	setTimeout( function () {
			self.load( self.currentLevel );
	}, 1000 );
};

// Begin render
game.prototype.lastRenderTime = 0;

game.prototype.beginRender = function () {
	var self = window.Turning.Game;
	var timeDelta = self.lastRenderTime;
	self.lastRenderTime = Date.now();
	timeDelta = self.lastRenderTime - timeDelta;

	self.skybox.rotateOnAxis( new THREE.Vector3( 0, 1, 0 ), Math.PI / 100 * timeDelta / 1000 );
	self.controls.update();
	self.isShowStats && self.stats.update();

	Turning.AnimationObject.update();

	self.renderer.render( self.scene, self.camera );
	// setTimeout( self.beginRender, 100);
	requestAnimationFrame( self.beginRender )
};



window.Turning.Game = new game();

})( window );


