(function ( window ) {

var alias = Turning.AnimationObject = function () { };

alias.animateQueue = [];
alias.animating = function () {
	return !!Turning.AnimationObject.animateQueue.length;
};
alias.animate = alias.prototype.animate = function ( duration, frameCallback, delay, context, completeCallback ) {
	if ( !duration || !frameCallback ) {
		return;
	}

	var self = context || this;
	var queue = {
		begin: -1, // give the value on setTimeout
		duration: duration,
		frameCallback: frameCallback,
		context: context || self,
		completeCallback: completeCallback
	};

	setTimeout( function () {
		queue.begin = Date.now();
		alias.animateQueue.push( queue );

	}, delay || 1 );
};

alias.update = function ( timeCache ) {
	var time = timeCache || Date.now(),
		len = alias.animateQueue.length,
		queue,
		percentage;

	while ( len-- ) {
		queue = alias.animateQueue[ len ];
		percentage = ( time - queue.begin ) / queue.duration;

		queue.frameCallback.call( queue.context, percentage >= 1 ? 1 : percentage );
		if ( percentage >= 1 ) {
			queue.completeCallback && queue.completeCallback.call( queue.context );
			alias.animateQueue.splice( len, 1 );
		}
	}
};

})( window );


