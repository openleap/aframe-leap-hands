/**
 * Physics body component for a single Leap Motion hand.
 */
module.exports = {
  dependencies: ['leap-hand'],

  init: function () {
    this.system = this.el.sceneEl.systems.leap;
    this.physics = this.el.sceneEl.systems.physics;
    this.physics.addBehavior(this, this.physics.Phase.SIMULATE);

    this.palmBody = /** @type {CANNON.Body} */ null;
    this.fingerBodies = /** @type {{string: CANNON.Body}} */ {};
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
    var finger, fingerBody,
        hand = this.el.components['leap-hand'].getHand();

    if (!hand || !hand.valid) return;

    this.syncPalmBody(hand, this.palmBody || this.createPalmBody());

    for (var i = 0; i < hand.fingers.length; i++) {
      finger = hand.fingers[i];
      if (finger.valid) {
        fingerBody = this.fingerBodies[finger.type] || this.createFingerBody(finger);
        this.syncFingerBody(finger, fingerBody);
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
    this.fingerBodies[finger.type] = body;
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
  }()),

  createPalmBody: function () {
    var body = new CANNON.Body({
      shape: new CANNON.Sphere(0.01),
      material: this.physics.material,
      mass: 0
    });
    body.el = this.el;
    this.physics.addBody(body);
    this.palmBody = body;
    return body;
  },

  syncPalmBody: (function () {
    var position = new THREE.Vector3(),
        normal = new THREE.Vector3(),
        baseNormal = new THREE.Vector3(0, -1, 0),
        rotation = new THREE.Quaternion();

    return function (hand, body) {
      normal.set(hand.palmNormal[0], hand.palmNormal[1], hand.palmNormal[2]);
      this.el.object3D.localToWorld(normal);
      rotation.setFromUnitVectors(baseNormal, normal);
      body.quaternion.copy(rotation);

      position.set(hand.palmPosition[0], hand.palmPosition[1], hand.palmPosition[2]);
      this.el.object3D.localToWorld(position);
      body.position.copy(position);
    };

  }())
};
