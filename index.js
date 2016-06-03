module.exports = {
  'system': require('./src/leap-system'),
  'leap-hand': require('./src/leap-hand'),
  'leap-hand-body': require('./src/leap-hand-body'),
  registerAll: function () {
    AFRAME.registerSystem('leap', this.system);
    AFRAME.registerComponent('leap-hand', this['leap-hand']);
    AFRAME.registerComponent('leap-hand-body', this['leap-hand-body']);
  }
};
