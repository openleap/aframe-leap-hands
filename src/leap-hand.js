var HandMesh = require('../lib/leap.hand-mesh'),
    CircularArray = require('circular-array');

/**
 * A-Frame component for a single Leap Motion hand.
 */
module.exports = {
  schema: {
    hand:            {default: '', oneOf: ['left', 'right'], required: true},
    holdSelector:    {default: '[holdable]'},
    holdSensitivity: {default: 0.95}, // [0,1]
    holdDistance:    {default: 0.2}, // m
    holdDebounce:    {default: 100} // ms
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

    this.raycaster = new THREE.Raycaster(
      new THREE.Vector3(), new THREE.Vector3(), 0, this.data.holdDistance
    );

    this.holdTarget = /** @type {AFRAME.Element} */ null;

    this.el.setObject3D('mesh', this.handMesh.getMesh());
    this.handMesh.hide();
  },

  remove: function () {
    if (this.handMesh) {
      this.el.removeObject3D('mesh');
      delete this.handMesh;
    }
  },

  tick: function () {
    var hand = this.getHand();

    if (hand && hand.valid) {
      this.handMesh.scaleTo(hand);
      this.handMesh.formTo(hand);
      this.grabStrengthBuffer.push(hand.grabStrength);
      this.pinchStrengthBuffer.push(hand.pinchStrength);
      this.updateEvents(hand);
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

  updateEvents: function (hand) {
    var isHolding, objects, results;

    this.grabStrength = circularArrayAvg(this.grabStrengthBuffer);
    this.pinchStrength = circularArrayAvg(this.pinchStrengthBuffer);

    isHolding = Math.max(this.grabStrength, this.pinchStrength) > this.data.holdSensitivity;

    if (this.isHolding === isHolding) return;
    this.isHolding = isHolding;

    if (!this.isHolding) {
      if (this.holdTarget) {
        this.el.emit('leap-holdstop', {hand: hand});
        this.holdTarget.emit('leap-holdstop', {hand: hand});
        this.holdTarget = null;
      }
      return;
    }

    this.raycaster.ray.direction.set(hand.palmNormal[0], hand.palmNormal[1], hand.palmNormal[2]);
    if (this.pinchStrength < this.grabStrength) {
      this.raycaster.ray.direction.x += hand.direction[0];
      this.raycaster.ray.direction.y += hand.direction[1];
      this.raycaster.ray.direction.z += hand.direction[2];
      this.raycaster.ray.direction.normalize();
    }
    this.raycaster.ray.origin.set(
      hand.palmPosition[0],
      hand.palmPosition[1],
      hand.palmPosition[2]
    );
    this.el.object3D.localToWorld(this.raycaster.ray.origin);
    objects = [].slice.call(this.el.sceneEl.querySelectorAll(this.data.holdSelector))
      .map(function (el) { return el.object3D; });
    results = this.raycaster.intersectObjects(objects, true);

    if (!results.length) return;

    this.el.emit('leap-holdstart', {
      hand: hand,
      body: this.el.components['leap-hand-body'].fingerBodies[hand.indexFinger.id]
    });
    this.holdTarget = results[0].object.el;
    if (this.holdTarget) {
      this.holdTarget.emit('leap-holdstart', {
        hand: hand,
        body: this.el.components['leap-hand-body'].fingerBodies[hand.indexFinger.id]
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
