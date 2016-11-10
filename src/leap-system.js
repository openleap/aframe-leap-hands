var Leap = require('leapjs'),
    transform = require('../lib/leap.transform.js');

// Defaults from leap.transform.js.
var DEFAULT_SCALE = 0.001;
var DEFAULT_POSITION = new THREE.Vector3(0, 0, -0.08);
var DEFAULT_QUATERNION = (new THREE.Quaternion())
  .setFromRotationMatrix((new THREE.Matrix4()).set(
    -1,  0,  0, 0,
     0,  0, -1, 0,
     0, -1,  0, 0,
     0,  0,  0, 1
   ));

Leap.Controller.plugin('transform', transform);

/**
 * Leap Motion system for A-Frame.
 */
module.exports = {
  schema: {
    vr: {default: true},
    scale: {default: DEFAULT_SCALE},
    position: {
      type: 'vec3',
      default: {
        x: DEFAULT_POSITION.x,
        y: DEFAULT_POSITION.y,
        z: DEFAULT_POSITION.z,
      }
    },
    quaternion: {
      type: 'vec4',
      default: {
        x: DEFAULT_QUATERNION.x,
        y: DEFAULT_QUATERNION.y,
        z: DEFAULT_QUATERNION.z,
        w: DEFAULT_QUATERNION.w
      }
    }
  },

  init: function () {
    this.controller = Leap.loop()
      .use('transform', this.data);
  },

  getFrame: function () {
    return this.controller.frame();
  }
};
