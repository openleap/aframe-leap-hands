var HandMesh = require('../lib/leap.hand-mesh'),
    CircularArray = require('circular-array');

/**
 * A-Frame component for a single Leap Motion hand.
 */
module.exports = {
  schema: {
    hand: {default: '', oneOf: ['left', 'right'], required: true},
    debounce: {default: 100}
  },

  init: function () {
    this.system = this.el.sceneEl.systems.leap;

    this.hand = /** @type {Leap.Hand} */ null;
    this.handMesh = /** @type {Leap.HandMesh} */ new HandMesh();

    this.isGrabbing = /** @type {boolean} */ false;
    this.isPinching = /** @type {boolean} */ false;
    var bufferLen = Math.floor(this.data.debounce / (1000 / 120));
    this.grabStrengthBuffer = /** @type {CircularArray<number>} */ new CircularArray(bufferLen);
    this.pinchStrengthBuffer = /** @type {CircularArray<number>} */ new CircularArray(bufferLen);

    this.el.setObject3D('mesh', this.handMesh.getMesh());
    this.handMesh.hide();
    this.isVisible = false;
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
    var isGrabbing = Math.min.apply(Math, this.grabStrengthBuffer.array()) > 0.8,
        isPinching = !isGrabbing && Math.min.apply(Math, this.pinchStrengthBuffer.array()) > 0.8;

    if (this.isGrabbing !== isGrabbing) {
      this.isGrabbing = isGrabbing;
      this.el.emit(isGrabbing ? 'leap-grabstart' :'leap-grabend', {hand: hand});
      // console.log(isGrabbing ? 'leap-grabstart' : 'leap-grabend');
    }

    if (this.isPinching !== isPinching) {
      this.isPinching = isPinching;
      this.el.emit(isPinching ? 'leap-pinchstart' :'leap-pinchend', {hand: hand});
      // console.log(isPinching ? 'leap-pinchstart' : 'leap-pinchend');
    }
  }
};
