var Leap = require('leapjs');

module.exports = function () {

	Leap.loop(this.handleLoop.bind(this));

    this.projector   = new THREE.Projector();
	this.isPaused    = false;
	this.handleFrame = function (frame) {
		// NOP - Implementer must override;
	};

	this.hasTrackableObjectInView = false;
	this.hasHandPushingScreen = false;

	this.eventHandlers = {};

	for ( var event in THREE.LeapMotion.Events ) {

		this.eventHandlers[THREE.LeapMotion.Events[event]] = [];

	}

};

THREE.LeapMotion.Events = {

	HAND_CLOSED: 0,
	HAND_UPDSIDE_DOWN: 1,
	HAND_PUSHING_SCREEN: 2,
	NOTHING_TO_TRACK: 3,
	HAND_OPEN: 4,
	TRACKABLE_OBJECT_CAME_INTO_VIEW: 5,
	HAND_STOPPED_PUSHING_SCREEN: 6,
	TRACKABLE_OBJECT_LEFT_VIEW: 7,
	HAND_STARTED_PUSHING_SCREEN: 8

};

THREE.LeapMotion.prototype = {

	setOnCursorPosition: function ( callback ) {

		this.onCursorPosition = callback;

	},

	dispatchEvents: function ( frame ) {

		for ( var event in THREE.LeapMotion.Events ) {

			if ( this.hasTrackableObjectInView == true && THREE.LeapMotion.Events[event] == THREE.LeapMotion.Events.TRACKABLE_OBJECT_CAME_INTO_VIEW ) {
				continue;
			}
			else if ( this.hasTrackableObjectInView == false && THREE.LeapMotion.Events[event] == THREE.LeapMotion.Events.TRACKABLE_OBJECT_CAME_INTO_VIEW && frame.hasHandsVisible() ) {
				this.hasTrackableObjectInView = true;
			}
			else if ( this.hasTrackableObjectInView == false && THREE.LeapMotion.Events[event] == THREE.LeapMotion.Events.TRACKABLE_OBJECT_CAME_INTO_VIEW && !frame.hasHandsVisible() ) {
				continue;
			}
			else if ( this.hasTrackableObjectInView == false && THREE.LeapMotion.Events[event] == THREE.LeapMotion.Events.TRACKABLE_OBJECT_LEFT_VIEW ) {
				continue;
			}
			else if ( this.hasTrackableObjectInView == true && THREE.LeapMotion.Events[event] == THREE.LeapMotion.Events.TRACKABLE_OBJECT_LEFT_VIEW && !frame.hasHandsVisible() ) {
				this.hasTrackableObjectInView = false;
			}
			else if ( this.hasTrackableObjectInView == true && THREE.LeapMotion.Events[event] == THREE.LeapMotion.Events.TRACKABLE_OBJECT_LEFT_VIEW && frame.hasHandsVisible() ) {
				continue;
			}

			if ( this.hasHandPushingScreen == true && THREE.LeapMotion.Events[event] == THREE.LeapMotion.Events.HAND_STARTED_PUSHING_SCREEN ) {
				continue;
			}
			else if ( this.hasTrackableObjectInView == true && this.hasHandPushingScreen == false && THREE.LeapMotion.Events[event] == THREE.LeapMotion.Events.HAND_STARTED_PUSHING_SCREEN && frame.containsHandPushingScreen() ) {
				this.hasHandPushingScreen = true;
			}
			else if ( this.hasHandPushingScreen == false && THREE.LeapMotion.Events[event] == THREE.LeapMotion.Events.HAND_STARTED_PUSHING_SCREEN && !frame.containsHandPushingScreen() ) {
				continue;
			}
			else if ( this.hasHandPushingScreen == false && THREE.LeapMotion.Events[event] == THREE.LeapMotion.Events.HAND_STOPPED_PUSHING_SCREEN ) {
				continue;
			}
			else if ( this.hasTrackableObjectInView == true && this.hasHandPushingScreen == true && THREE.LeapMotion.Events[event] == THREE.LeapMotion.Events.HAND_STOPPED_PUSHING_SCREEN && !frame.containsHandPushingScreen() ) {
				this.hasHandPushingScreen = false;
			}
			else if ( this.hasHandPushingScreen == true && THREE.LeapMotion.Events[event] == THREE.LeapMotion.Events.HAND_STOPPED_PUSHING_SCREEN && frame.containsHandPushingScreen() ) {
				continue;
			}

			else if ( THREE.LeapMotion.Events[event] == THREE.LeapMotion.Events.NOTHING_TO_TRACK && frame.hasHandsVisible() ) {
				continue;
			}
			else if ( THREE.LeapMotion.Events[event] == THREE.LeapMotion.Events.HAND_CLOSED && !frame.containsClosedHand() ) {
				continue;
			}
			else if ( THREE.LeapMotion.Events[event] == THREE.LeapMotion.Events.HAND_OPEN && frame.containsClosedHand() ) {
				continue;
			}
			else if ( THREE.LeapMotion.Events[event] == THREE.LeapMotion.Events.HAND_UPDSIDE_DOWN && !frame.containsUpSideDownHand() ) {
				continue;
			}
			else if ( THREE.LeapMotion.Events[event] == THREE.LeapMotion.Events.HAND_PUSHING_SCREEN && !frame.containsHandPushingScreen() ) {
				continue;
			}

			var handlers = this.eventHandlers[THREE.LeapMotion.Events[event]];


			for (var i = 0; i < handlers.length; i += 1) {

				handlers[i]( frame );

			}

		}

	},

	handleLoop: function ( frame ) {

		if (frame.valid && !this.isPaused) {

			var currentFrame = new THREE.LeapMotion.Frame( frame, this );

			this.handleFrame( currentFrame );
			this.dispatchEvents( currentFrame );

		}

	},

	registerEventHandler: function (event, handler) {

		this.eventHandlers[event].push(handler);

	},

	unregisterEventHandler: function (event, handler) {

		var handlerPosition = this.eventHandlers[event].indexOf(handler);
		this.eventHandlers[event].splice(handlerPosition, 1);

	}

};

THREE.LeapMotion.array3ToVector3 = function ( array ) {

	return new THREE.Vector3(
		array[0],
		array[1],
		array[2]
	);

};

THREE.LeapMotion.Frame = function ( frame, leap ) {

	this.leap = leap;

	this.hands = [];

	while ( frame.hands.length ) {

		this.hands.push(
			new THREE.LeapMotion.Hand( frame.hands.pop() )
		);

	}

	if ( this.isCursorMode() && this.leap.onCursorPosition ) {

        var position = {
            x: Math.round(this.getCursor().stabalizedPosition.x),
            y: Math.round(this.getCursor().stabalizedPosition.y)
        };

		this.leap.onCursorPosition ( position );

	}

};

THREE.LeapMotion.Frame.prototype = {

	isCursorMode: function () {

		return ( this.hasOneHandVisible() && this.getDominantHand().hasOneFinger() );

	},

	getCursor: function () {

		return this.getDominantHand().fingers[0].tip;

	},

	getDominantHand: function () {

		return this.hands[0];

	},

	hasHandsVisible: function () {

		return (this.hands.length > 0);

	},

	hasOneHandVisible: function () {

		return (this.hands.length == 1);

	},

	hasTwoHandsVisible: function () {

		return (this.hands.length == 2);

	},

	getLeftHand: function () {

		if ( this.hasTwoHandsVisible() ) {

			if ( this.hands[0].x > this.hands[1].x ) {

				return this.hands[0];

			}

			return this.hands[1];

		}

	},

	getRightHand: function () {

		if ( this.hasTwoHandsVisible() ) {

			if ( this.hands[0].x < this.hands[1].x ) {

				return this.hands[0];

			}

			return this.hands[1];

		}

	},

	containsClosedHand: function () {

		for ( var i = 0, len = this.hands.length; i < len; i += 1 ) {

			if (this.hands[i].isClosed()) {
				return true;
			}

		}

		return false;

	},

	containsUpSideDownHand: function () {

		for ( var i = 0, len = this.hands.length; i < len; i += 1 ) {

			if ( this.hands[i].isUpsideDown() ) {
				return true;
			}

		}

		return false;

	},

	containsHandPushingScreen: function () {

		for ( var i = 0, len = this.hands.length; i < len; i += 1 ) {

			if ( this.hands[i].isPushing() ) {
				return true;
			}

		}

		return false;

	}

};

THREE.LeapMotion.Palm = function ( palmNormal, palmPosition, palmVelocity, stabilizedPalmPosition ) {

	this.normal				= THREE.LeapMotion.array3ToVector3( palmNormal );
	// this.pitch              = (palmNormal[0] * 180) * (Math.PI/180);
	// this.yaw                = (180 + (palmNormal[0] * 180/Math.PI))// * (Math.PI/180);
	// this.roll               = (180 + palmNormal[1] * 180) * (Math.PI/180);

	this.position           = THREE.LeapMotion.array3ToVector3( palmPosition );
	this.stabalizedPosition = THREE.LeapMotion.array3ToVector3( stabilizedPalmPosition );
	this.velocity           = THREE.LeapMotion.array3ToVector3( palmVelocity );

};

THREE.LeapMotion.Pointable = function ( pointable ) {

	this.direction          = THREE.LeapMotion.array3ToVector3( pointable.direction );
	this.stabilizedPosition = THREE.LeapMotion.array3ToVector3( pointable.stabilizedTipPosition );
	this.position           = THREE.LeapMotion.array3ToVector3( pointable.tipPosition );
	this.speed              = THREE.LeapMotion.array3ToVector3( pointable.tipVelocity );

	this.length             = pointable.length;
	this.width              = pointable.width;
	this.touchDistance      = pointable.touchDistance;
	this.zone               = pointable.touchZone;
	this.timeVisible		= pointable.timeVisible;
	this.isFinger			= !pointable.tool;

	this.tip 				= new THREE.LeapMotion.Tip(
								  pointable.tipPosition,
								  pointable.stabilizedTipPosition,
								  pointable.tipVelocity
							  );

};

THREE.LeapMotion.Tip = function ( position, stabalizedPosition, velocity ) {

	this.position 			= THREE.LeapMotion.array3ToVector3( position );
	this.stabalizedPosition = THREE.LeapMotion.array3ToVector3( stabalizedPosition );
	this.velocity 			= THREE.LeapMotion.array3ToVector3( velocity );

};

THREE.LeapMotion.Hand = function (hand) {

	this.roll         = (180 + hand.palmNormal[1] * 180) * (Math.PI/180);
	this.pitch        = (hand.direction[1] * 180) * (Math.PI/180);
	this.yaw          = (180 + (hand.palmNormal[0]) * 180) * (Math.PI/180);

	this.fingers      = this.processFingers(hand.fingers);

	this.sphereCenter = THREE.LeapMotion.array3ToVector3( hand.sphereCenter );
	this.sphereRadius = hand.sphereRadius;
	this.timeVisible  = hand.timeVisible;

	this.direction    = THREE.LeapMotion.array3ToVector3( hand.direction );

	this.palm         = new THREE.LeapMotion.Palm(
							hand.palmNormal,
							hand.palmPosition,
							hand.palmVelocity,
							hand.stabilizedPalmPosition
						);

};

THREE.LeapMotion.Hand.prototype = {

	hasOneFinger: function () {

		return ( this.fingers.length == 1 );

	},

	isPushing: function () {

		return ( this.pitch > 2.4 );

	},

	isUpsideDown: function () {

		return this.roll > 5.4;

	},

	isClosed: function () {

		return ( this.fingers.length == 0  && ( this.roll > 5.4 || this.roll < 1 ) );

	},

	fingerCount: function () {

		return this.fingers.length;

	},

	pitch: function () {

		return this.rawHand.pitch();

	},

	yaw: function () {

		return this.rawHand.yaw();

	},

	roll: function () {

		return this.rawHand.roll();

	},

	processFingers: function (fingers) {

		var results = [];

		while ( fingers.length ) {

			results.push(
				new THREE.LeapMotion.Pointable( fingers.pop() )
			);

		}

		return results;

	}

};
