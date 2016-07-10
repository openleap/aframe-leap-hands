module.exports = {
  'system': require('./src/leap-system'),
  'leap-hand': require('./src/leap-hand'),
  registerAll: function () {
    AFRAME.registerSystem('leap', this.system);
    AFRAME.registerComponent('leap-hand', this['leap-hand']);
  }
};
