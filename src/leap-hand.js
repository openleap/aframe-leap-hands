var HandMesh = require('../lib/leap.hand-mesh'),
    CircularArray = require('circular-array'),
    Intersector = require('./intersector');

/**
 * A-Frame component for a single Leap Motion hand.
 */
module.exports = {
  schema: {
    hand:               {default: '', oneOf: ['left', 'right'], required: true},
    holdDistance:       {default: 0.2}, // m
    holdDebounce:       {default: 100}, // ms
    holdSelector:       {default: '[holdable]'},
    holdSensitivity:    {default: 0.95}, // [0,1]
    releaseSensitivity: {default: 0.75}, // [0,1]
    debug:              {default: true}
  },

  init: function () {
    this.system = this.el.sceneEl.systems.leap;

    this.hand = /** @type {Leap.Hand} */ null;
    this.handMesh = /** @type {Leap.HandMesh} */ new HandMesh();

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

  remove: function () {
    if (this.handMesh) {
      this.el.removeObject3D('mesh');
      delete this.handMesh;
    }
    if (this.intersector.getMesh()) {
      this.el.object3D.remove(this.intersector.getMesh());
    }
    delete this.intersector;
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
      if (isHolding !== this.isHolding) this.updateEvents(hand, isHolding);
      this.isHolding = isHolding;
    }

    if ( hand && !this.isVisible) this.handMesh.show();
    if (!hand &&  this.isVisible) this.handMesh.hide();
    this.isVisible = !!hand;
  },

  getHand: function () {
    var data = this.data,
        frame = this.system.getFrame();
    return frame.hands.length ? frame.hands[frame.hands[0].type === data.hand ? 0 : 1] : null;
  },

  updateEvents: function (hand, isHolding) {
    var objects, results;

    if (!isHolding) {
      if (this.holdTarget) {
        this.el.emit('leap-holdstop', {hand: hand});
        this.holdTarget.emit('leap-holdstop', {hand: hand});
        this.holdTarget = null;
      }
      return;
    }

    objects = [].slice.call(this.el.sceneEl.querySelectorAll(this.data.holdSelector))
      .map(function (el) { return el.object3D; });
    results = this.intersector.intersectObjects(objects, true);

    if (!results.length) return;

    this.el.emit('leap-holdstart', {
      hand: hand,
      body: this.el.components['leap-hand-body'].palmBody
    });
    this.holdTarget = results[0].object.el;
    if (this.holdTarget) {
      this.holdTarget.emit('leap-holdstart', {
        hand: hand,
        body: this.el.components['leap-hand-body'].palmBody
      });
    }
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
