var Leap = require('leapjs'),
    transform = require('../lib/leap.transform.js');

Leap.Controller.plugin('transform', transform);
Leap.plugin('aframeSystem', function(options) {
  options = options || {};
  this.use('transform', {vr: true});
  return {hand: function () {}};
});

/**
 * Leap Motion system for A-Frame.
 */
module.exports = {
  init: function () {
    this.controller = Leap.loop()
      .setOptimizeHMD(true)
      .use('aframeSystem');
  },

  frame: function () {
    return this.controller.frame();
  }
};
