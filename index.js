module.exports = {
  'system': require('./src/leap-system'),
  'leap-hand': require('./src/leap-hand'),
  'leap-configuration': require('./src/leap-configuration'),
  registerAll: function () {
    AFRAME.registerSystem('leap', this.system);
    AFRAME.registerComponent('leap-hand', this['leap-hand']);
    AFRAME.registerComponent('leap-configuration', this['leap-configuration']);
  }
};
