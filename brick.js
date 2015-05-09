(function () {


var brick = window.Turning.Brick = function ( scene ) {

	var cubeGeometry = new THREE.BoxGeometry( UNIT_WIDTH, 2 * UNIT_WIDTH, UNIT_WIDTH );
	var moonTexture = Turning.resources[ 'brick' ];
	var moonMaterial = new THREE.MeshLambertMaterial( { map: moonTexture } );
	// var moonMaterial = new THREE.MeshLambertMaterial( { map: moonTexture, color: 0xff4499, ambient: 0x0000ff } );
	this.obj3d = new THREE.Mesh( cubeGeometry, moonMaterial );
	this.obj3d.position.y = 50000;
	scene.add( this.obj3d );


	this.relativePos = [
		[ 0, 0 ]
	];

};

// inherit from AnimationObject
brick.prototype = new window.Turning.AnimationObject();
brick.prototype.constructor = brick;

brick.prototype.refresh = function ( x, z, relX, relZ, delay ) {
	this.relativeAxes = {
		'x+': { vector: new THREE.Vector3( 1, 0, 0  ), axes: 'x', direction: 1,  length: 1 },
		'x-': { vector: new THREE.Vector3( -1, 0, 0 ), axes: 'x', direction: -1, length: 1 },
		'y+': { vector: new THREE.Vector3( 0, 1, 0  ), axes: 'y', direction: 1,  length: 2 },
		'y-': { vector: new THREE.Vector3( 0, -1, 0 ), axes: 'y', direction: -1, length: 2 },
		'z+': { vector: new THREE.Vector3( 0, 0, 1  ), axes: 'z', direction: 1,  length: 1 },
		'z-': { vector: new THREE.Vector3( 0, 0, -1 ), axes: 'z', direction: -1, length: 1 }
	};
	this.relativePos = [ [ relX, relZ ] ];
	this.obj3d.position.x = x;
	this.obj3d.position.z = z;
	//this.obj3d.position.y = 5000;
	this.obj3d.rotation.x = 0;
	this.obj3d.rotation.y = 0;
	this.obj3d.rotation.z = 0;

	this.appear( delay );
};
brick.prototype.appear = function ( delay ) {
	this.animate( 1000, function ( per ) {
		//console.log( 3000 * ( 1 - per ) );
		this.obj3d.position.y = 2000 * ( 1 - per );
	}, delay || 0);
};
brick.prototype.disappear = function () {
	this.animate( 1000, function ( per ) {
		this.obj3d.position.y = -2000 * per;
	}, 300);
};
brick.prototype.destroy = function () {
	this.obj3d.position.y = 2000;
};

var tuple = {
	'Right': { changeTo: [ ['x+', 'y-'], ['x-', 'y+'], ['y+', 'x+'], ['y-', 'x-'] ],
		rotate: 'z-', translate: { direction: 'x', value: 1 } },
	'Left': { changeTo: [ ['x+', 'y+'], ['x-', 'y-'], ['y+', 'x-'], ['y-', 'x+'] ],
		rotate: 'z+', translate: { direction: 'x', value: -1 } },
	'Up': { changeTo: [ ['y+', 'z-'], ['y-', 'z+'], ['z+', 'y+'], ['z-', 'y-'] ],
		rotate: 'x-', translate: { direction: 'z', value: -1 } },
	'Down': { changeTo: [ ['y+', 'z+'], ['y-', 'z-'], ['z+', 'y-'], ['z-', 'y+'] ],
		rotate: 'x+', translate: { direction: 'z', value: 1 } }
};

for ( var t in tuple ) {

	brick.prototype[ 'move' + t ] = (function ( tuple ) {
		return function () {

			var rela = this.relativeAxes,
				to = tuple.changeTo,
				tran = tuple.translate,
				temp = {};



			// calculate the centre of the rotate point
			var centre = {};
			centre.x = this.obj3d.position.x + ( tran.direction === 'x' ?
				rela[ 'x+' ].length / 2 * UNIT_WIDTH * tran.value : 0 );
			centre.z = this.obj3d.position.z + ( tran.direction === 'z' ?
				rela[ 'z+' ].length / 2 * UNIT_WIDTH * tran.value : 0 );

			var radius = Math.sqrt( Math.pow( rela[ 'y+' ].length / 2 * UNIT_WIDTH, 2 ) +
				Math.pow( rela[ tran.direction + '+' ].length / 2 * UNIT_WIDTH, 2 ) );

			var transFrom = this.obj3d.position[ tran.direction ];
			var distance = ( rela[ tran.direction + '+' ].length + rela[ 'y+' ].length ) / 2 * UNIT_WIDTH * tran.value;



			for ( var i = 3; i >= 0; i-- ) {
				temp[ to[ i ][ 1 ] ] = rela[ to[ i ][ 1 ] ];
				rela[ to[ i ][ 1 ] ] = temp[ to[ i ][ 0 ] ] || rela[ to[ i ][ 0 ] ];
			}



			// calculate Positions
			if ( tran.direction === 'x' ) {
				var currentX = this.relativePos.length > 1 ? [ this.relativePos[ 0 ][ 0 ], this.relativePos[ 1 ][ 0 ] ] : this.relativePos[ 0 ][ 0 ];
				if ( rela[ 'x-' ].length == 2 ) {
					this.relativePos = [ [ currentX + tran.value, this.relativePos[ 0 ][ 1 ] ],
						[ currentX + tran.value * 2, this.relativePos[ 0 ][ 1 ] ] ];
				} else if ( rela[ 'y-'].length == 2 ) {
					this.relativePos = [ [ tran.value > 0 ? Math.max( currentX[ 0 ], currentX[ 1 ]) + 1 : Math.min( currentX[ 0 ], currentX[ 1 ]) - 1, this.relativePos[ 0 ][ 1 ] ] ];
				} else {
					this.relativePos = [
						[ currentX[ 0 ] + tran.value, this.relativePos[ 0 ][ 1 ] ],
						[ currentX[ 0 ] + tran.value, this.relativePos[ 1 ][ 1 ] ]
					];
				}
			} else {
				var currentZ = this.relativePos.length > 1 ? [ this.relativePos[ 0 ][ 1 ], this.relativePos[ 1 ][ 1 ] ] : this.relativePos[ 0 ][ 1 ];
				if ( rela[ 'z-' ].length == 2 ) {
					this.relativePos = [ [ this.relativePos[ 0 ][ 0 ], currentZ + tran.value ],
						[ this.relativePos[ 0 ][ 0 ], currentZ + tran.value * 2 ] ];
				} else if ( rela[ 'y-'].length == 2 ) {
					this.relativePos = [ [ this.relativePos[ 0 ][ 0 ], tran.value > 0 ? Math.max( currentZ[ 0 ], currentZ[ 1 ]) + 1 : Math.min( currentZ[ 0 ], currentZ[ 1 ]) - 1] ];
				} else {
					this.relativePos = [
						[ this.relativePos[ 0 ][ 0 ], currentZ[ 0 ] + tran.value ],
						[ this.relativePos[ 1 ][ 0 ], currentZ[ 0 ] + tran.value ]
					];
				}
			}
			// console.log( this.relativePos[ 0 ][ 0 ] + ' ' + this.relativePos[ 0 ][ 1 ]);
			// if ( this.relativePos[ 1 ] )
			// 	console.log( this.relativePos[ 1 ][ 0 ] + ' ' + this.relativePos[ 1 ][ 1 ] );


			var hasRotated = 0;
			this.animate( 300, function ( per ) {
				per *= per * per;
				// handle rotate
				var temp = per * Math.PI / 2;
				this.obj3d.rotateOnAxis( rela[ tuple.rotate ].vector, temp - hasRotated );
				hasRotated = temp;

				// handle translate (x-c.a)^2 + (x-c.b)^2 = r^2
				this.obj3d.position[ tran.direction ] = transFrom + distance * per;
				this.obj3d.position.y = Math.sqrt( Math.pow( radius, 2 ) - Math.pow( centre[ tran.direction ] -  this.obj3d.position[ tran.direction ], 2 ) ) - UNIT_WIDTH;
			}, 0 );
		};
	} )( tuple[ t ] );

}

})();


