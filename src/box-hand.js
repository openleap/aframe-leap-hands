var Leap = require('leapjs'),
    handEntry = require('../lib/hand-entry'),
    handHold = require('../lib/hand-hold');

var LEAP_WORLD_SCALE = 1e3,
    LEAP_WORLD_QUATERNION = new THREE.Quaternion(Math.sqrt(0.5), 0, 0, Math.sqrt(0.5));

if (Leap.version.major === 0 && Leap.version.minor < 7 && Leap.version.dot < 4) {
  console.warn("[box-hand] Requires LeapJS > 0.6.3. You're running have " + Leap.version.full);
}

Leap.Controller.plugin('handEntry', handEntry);
Leap.Controller.plugin('handHold', handHold);

Leap.plugin('boxHands', function(options) {
  options = options || {};

  this.use('handEntry');
  this.use('handHold');

  if (this.plugins.transform && this.plugins.transform.getScale()) {
    console.warn('[box-hand] Scale transform not yet supported.')
    // scale = this.plugins.transform.scale.x;
  }

  // this.on('frameEnd', function () { self.frameEnd(this); });
  // this.on('handLost', function () { self.handLost(this); });
  return {hand: function () {
    console.log('onHand');
  }};
});

var controller = Leap.loop()
  .setOptimizeHMD(true)
  .use('boxHands');

module.exports = {
  schema: {
    hand: {default: '', oneOf: ['left', 'right'], required: true}
  },

  init: function () {
    console.info('[box-hand] init()');
    this.controller = controller;
  },

  tick: function () {
    var hand,
        data = this.data,
        frame = this.controller.frame(),
        iBox = frame.interactionBox;

    if (frame.hands.length) {
      hand = frame.hands[frame.hands[0].type === data.hand ? 0 : 1];
    }

    if (hand) {
      this.el.setAttribute('position', getHandWorldPosition(hand, iBox));

      // var quaternion = new THREE.Quaternion(),
      //     palmNormal = new THREE.Vector3(-1 * hand.palmNormal[0], -1 * hand.palmNormal[1], -1 * hand.palmNormal[2]);
      // palmNormal.applyQuaternion(LEAP_WORLD_QUATERNION);
      // quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), palmNormal);
      // this.el.setAttribute('quaternion', quaternion);
    }
  }

};

var getHandWorldPosition = function (hand, iBox) {
  // Swap Y/Z axes for HMD mode.
  return new THREE.Vector3(
    -1 * hand.palmPosition[0] / LEAP_WORLD_SCALE,
    -1 * (hand.palmPosition[2] + iBox.depth / 2) / LEAP_WORLD_SCALE,
    -1 * hand.palmPosition[1] / LEAP_WORLD_SCALE
  );
};
