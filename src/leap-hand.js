var HandMesh = require('../lib/leap.hand-mesh');


/**
 * A-Frame component for a single Leap Motion hand.
 */
module.exports = {
  schema: {
    hand: {default: '', oneOf: ['left', 'right'], required: true}
  },

  init: function () {
    this.system = this.el.sceneEl.systems.leap;

    /** @type {Leap.Hand} */
    this.hand = null;

    /** @type {Leap.HandMesh} */
    this.handMesh = new HandMesh();

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

    if (hand) {
      this.handMesh.scaleTo(hand);
      this.handMesh.formTo(hand);
    }

    if ( hand && !this.isVisible) this.handMesh.show();
    if (!hand &&  this.isVisible) this.handMesh.hide();
    this.isVisible = !!hand;
  },

  getHand: function () {
    var data = this.data,
        frame = this.system.getFrame();
    return frame.hands.length ? frame.hands[frame.hands[0].type === data.hand ? 0 : 1] : null;
  }
};
