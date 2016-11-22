var HandMesh = require('../lib/leap.hand-mesh'),
    CircularArray = require('circular-array'),
    Intersector = require('./helpers/intersector'),
    HandBody = require('./helpers/hand-body');

var nextID = 1;

/**
 * A-Frame component for a single Leap Motion hand.
 */
module.exports = {
  schema: {
    hand:               {default: '', oneOf: ['left', 'right'], required: true},
    enablePhysics:      {default: false},
    holdDistance:       {default: 0.2}, // m
    holdDebounce:       {default: 100}, // ms
    holdSelector:       {default: '[holdable]'},
    holdSensitivity:    {default: 0.95}, // [0,1]
    releaseSensitivity: {default: 0.75}, // [0,1]
    debug:              {default: false}
  },

  init: function () {
    this.system = this.el.sceneEl.systems.leap;

    this.handID = nextID++;
    this.hand = /** @type {Leap.Hand} */ null;
    this.handBody = /** @type {HandBody} */ null;
    this.handMesh = new HandMesh();

    this.isVisible = false;
    this.isHolding = false;

    var bufferLen = Math.floor(this.data.holdDebounce / (1000 / 120));
    this.grabStrength = 0;
    this.pinchStrength = 0;
    this.grabStrengthBuffer = /** @type {CircularArray<number>} */ new CircularArray(bufferLen);
    this.pinchStrengthBuffer = /** @type {CircularArray<number>} */ new CircularArray(bufferLen);

    this.intersector = new Intersector();
    this.holdTarget = /** @type {AFRAME.Element} */ null;

    this.el.setObject3D('mesh', this.handMesh.getMesh());
    this.handMesh.hide();

    if (this.data.debug) {
      this.el.object3D.add(this.intersector.getMesh());
    }
  },

  update: function () {
    var data = this.data;
    if (data.enablePhysics && !this.handBody) {
      this.handBody = new HandBody(this.el, this);
    } else if (!data.enablePhysics && this.handBody) {
      this.handBody.remove();
      this.handBody = null;
    }
  },

  remove: function () {
    if (this.handMesh) {
      this.el.removeObject3D('mesh');
      this.handMesh = null;
    }
    if (this.handBody) {
      this.handBody.remove();
      this.handBody = null;
    }
    if (this.intersector.getMesh()) {
      this.el.object3D.remove(this.intersector.getMesh());
      this.intersector = null;
    }
  },

  tick: function () {
    var hand = this.getHand();

    if (hand && hand.valid) {
      this.handMesh.scaleTo(hand);
      this.handMesh.formTo(hand);
      this.grabStrengthBuffer.push(hand.grabStrength);
      this.pinchStrengthBuffer.push(hand.pinchStrength);
      this.grabStrength = circularArrayAvg(this.grabStrengthBuffer);
      this.pinchStrength = circularArrayAvg(this.pinchStrengthBuffer);
      var isHolding = Math.max(this.grabStrength, this.pinchStrength)
        > (this.isHolding ? this.data.releaseSensitivity : this.data.holdSensitivity);
      this.intersector.update(this.data, this.el.object3D, hand, isHolding);
      if ( isHolding && !this.isHolding) this.hold(hand);
      if (!isHolding &&  this.isHolding) this.release(hand);
    } else if (this.isHolding) {
      this.release(null);
    }

    if (hand && !this.isVisible) {
      this.handMesh.show();
      this.intersector.show();
    }

    if (!hand && this.isVisible) {
      this.handMesh.hide();
      this.intersector.hide();
    }
    this.isVisible = !!hand;
  },

  getHand: function () {
    var data = this.data,
        frame = this.system.getFrame();
    return frame.hands.length ? frame.hands[frame.hands[0].type === data.hand ? 0 : 1] : null;
  },

  hold: function (hand) {
    var objects, results,
        eventDetail = this.getEventDetail(hand);

    this.el.emit('leap-holdstart', eventDetail);

    objects = [].slice.call(this.el.sceneEl.querySelectorAll(this.data.holdSelector))
      .map(function (el) { return el.object3D; });
    results = this.intersector.intersectObjects(objects, true);
    this.holdTarget = results[0] && results[0].object && results[0].object.el;
    if (this.holdTarget) {
      this.holdTarget.emit('leap-holdstart', eventDetail);
    }
    this.isHolding = true;
  },

  release: function (hand) {
    var eventDetail = this.getEventDetail(hand);

    this.el.emit('leap-holdstop', eventDetail);

    if (this.holdTarget) {
      this.holdTarget.emit('leap-holdstop', eventDetail);
      this.holdTarget = null;
    }
    this.isHolding = false;
  },

  getEventDetail: function (hand) {
    return {
      hand: hand,
      handID: this.handID,
      body: this.handBody ? this.handBody.palmBody : null
    };
  }
};

function circularArrayAvg (array) {
  var avg = 0;
  array = array.array();
  for (var i = 0; i < array.length; i++) {
    avg += array[i];
  }
  return avg / array.length;
}
