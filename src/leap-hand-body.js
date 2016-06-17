/**
 * Physics body component for a single Leap Motion hand.
 */
module.exports = {
  dependencies: ['leap-hand'],

  init: function () {
    this.system = this.el.sceneEl.systems.leap;
    this.physics = this.el.sceneEl.systems.physics;
    this.physics.addBehavior(this, this.physics.Phase.SIMULATE);

    /** @type {{string: CANNON.Body}} */
    this.fingerBodies = {};
  },

  remove: function () {
    this.system.removeBehavior(this, this.physics.Phase.SIMULATE);
    for (var id in this.fingerBodies) {
      if (this.fingerBodies.hasOwnProperty(id)) {
        this.physics.removeBody(this.fingerBodies[id]);
      }
    }
  },

  step: function () {
    var body, finger,
        hand = this.el.components['leap-hand'].getHand();

    if (!hand) return;

    for (var i = 0; i < hand.fingers.length; i++) {
      finger = hand.fingers[i];
      if (finger.valid) {
        body = this.fingerBodies[finger.id] || this.createFingerBody(finger);
        this.syncFingerBody(finger, body);
      }
    }
  },

  createFingerBody: function (finger) {
    var body = new CANNON.Body({
      shape: new CANNON.Sphere(finger.distal.length / 2),
      material: this.physics.material,
      mass: 0,
      fixedRotation: true
    });
    body.el = this.el;
    this.physics.addBody(body);
    this.fingerBodies[finger.id] = body;
    return body;
  },

  syncFingerBody: (function () {
    var vthree = new THREE.Vector3();

    return function (finger, body) {
      var position = finger.distal.center();
      vthree.set(position[0], position[1], position[2]);
      this.el.object3D.localToWorld(vthree);
      body.position.copy(vthree);
      body.shapes[0].radius = finger.distal.length / 2;
    };
  }())
};
