module.exports = {
  'box-hand': require('./src/box-hand'),
  registerAll: function () {
    if (!AFRAME.components['box-hand']) AFRAME.registerComponent('box-hand', this['box-hand']);
  }
};
