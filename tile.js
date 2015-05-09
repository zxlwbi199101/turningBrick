(function () {


var tile = window.Turning.Tile = function ( scene ) {
	if ( !scene ) { return; }

	var floorTexture = Turning.resources[ 'tile-normal' ];
	// var floorMaterial = new THREE.MeshLambertMaterial( { map: floorTexture, color: 0x55ff55, wrapAround: true } );
	var floorMaterial = new THREE.MeshLambertMaterial( { map: floorTexture } );
	var floorGeometry = new THREE.BoxGeometry( UNIT_WIDTH, 8, UNIT_WIDTH );
	this.obj3d = new THREE.Mesh(floorGeometry, floorMaterial);
	this.obj3d.position.y = -3000;
	scene.add( this.obj3d );

};

tile.prototype = new window.Turning.AnimationObject();
tile.prototype.constructor = tile;

tile.prototype.appear = function ( delay ) {
	this.animate( 700 + 300 * Math.random(), function ( per ) {
		this.obj3d.position.y = -2000 * ( 1 - per ) - UNIT_WIDTH - 4;
	}, delay || 0);
};
tile.prototype.disappear = function () {
	this.animate( 700 + 300 * Math.random(), function ( per ) {
		this.obj3d.position.y = -2000 * per - UNIT_WIDTH;
	}, 500);
};
tile.prototype.refresh = function ( x, z, delay ) {
	this.obj3d.position.x = x;
	this.obj3d.position.z = z;
	this.appear( delay );
};
tile.prototype.destroy = function () {
	this.obj3d.position.y = -2000;
};
})();


(function () {

var tile = window.Turning.WeakTile = function ( scene ) {

	var floorTexture = Turning.resources[ 'tile-normal' ];
	var floorMaterial = new THREE.MeshLambertMaterial( { map: floorTexture, color: 0x55ff55, wrapAround: true } );
	var floorGeometry = new THREE.BoxGeometry( UNIT_WIDTH, 8, UNIT_WIDTH );
	this.obj3d = new THREE.Mesh(floorGeometry, floorMaterial);
	this.obj3d.position.y = -3000;
	scene.add( this.obj3d );

};

tile.prototype = new window.Turning.Tile();
tile.prototype.constructor = tile;

})();



(function () {

var tile = window.Turning.Switch1Tile = function ( scene ) {

	var floorTexture = Turning.resources[ 'tile-switch1' ];
	var floorMaterial = new THREE.MeshLambertMaterial( { map: floorTexture } );
	var floorGeometry = new THREE.BoxGeometry( UNIT_WIDTH, 8, UNIT_WIDTH );
	this.obj3d = new THREE.Mesh(floorGeometry, floorMaterial);
	this.obj3d.position.y = -3000;
	scene.add( this.obj3d );

};

tile.prototype = new window.Turning.Tile();
tile.prototype.constructor = tile;

tile.prototype.triggered = 0;
tile.prototype.relatedBridges = [];
tile.prototype.trigger = function () {
	var len = this.relatedBridges.length,
		b;
	while ( len-- ) {
		b = this.relatedBridges[ len ];

		( b.active ? b.hide : b.display ).call( b );
	}
};

tile.prototype.refresh = function ( x, z, delay ) {
	this.obj3d.position.x = x;
	this.obj3d.position.z = z;
	this.appear( delay );

	this.relatedBridges = [];
	this.triggered = false;
};

})();



(function () {

var tile = window.Turning.Switch2Tile = function ( scene ) {

	var floorTexture = Turning.resources[ 'tile-switch2' ];
	var floorMaterial = new THREE.MeshLambertMaterial( { map: floorTexture } );
	var floorGeometry = new THREE.BoxGeometry( UNIT_WIDTH, 8, UNIT_WIDTH );
	this.obj3d = new THREE.Mesh(floorGeometry, floorMaterial);
	this.obj3d.position.y = -3000;
	scene.add( this.obj3d );

};

tile.prototype = new window.Turning.Tile();
tile.prototype.constructor = tile;

tile.prototype.triggered = 0;
tile.prototype.relatedBridges = [];
tile.prototype.trigger = function () {
	var len = this.relatedBridges.length,
		b;
	while ( len-- ) {
		b = this.relatedBridges[ len ];

		( b.active ? b.hide : b.display ).call( b );
	}
};
tile.prototype.refresh = function ( x, z, delay ) {
	this.obj3d.position.x = x;
	this.obj3d.position.z = z;
	this.appear( delay );

	this.relatedBridges = [];
	this.triggered = false;
};
})();



(function () {

var tile = window.Turning.BridgeTile = function ( scene ) {

	var floorTexture = Turning.resources[ 'tile-bridge' ];
	var floorMaterial = new THREE.MeshLambertMaterial( { map: floorTexture } );
	var floorGeometry = new THREE.BoxGeometry( UNIT_WIDTH, 8, UNIT_WIDTH );
	this.obj3d = new THREE.Mesh(floorGeometry, floorMaterial);
	this.obj3d.position.y = -3000;
	scene.add( this.obj3d );

};

tile.prototype = new window.Turning.Tile();
tile.prototype.constructor = tile;

tile.prototype.active = false;
tile.prototype.display = function () {
	this.appear();
	this.active = true;
};
tile.prototype.hide = function () {
	this.disappear();
	this.active = false;
};
tile.prototype.refresh = function ( x, z, delay ) {
	this.obj3d.position.x = x;
	this.obj3d.position.z = z;
	this.obj3d.position.y = -3000;
	this.active = false;
};
})();



