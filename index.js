module.exports = {
  'bone-hand': require('./src/bone-hand'),
  registerAll: function () {
    if (!AFRAME.components['bone-hand']) AFRAME.registerComponent('bone-hand', this['bone-hand']);
  }
};
