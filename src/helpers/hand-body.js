/**
 * CANNON body controller for a single Leap Motion hand.
 */
function HandBody (el, handComponent) {
  this.el = el;
  this.handComponent = handComponent;
  this.system = this.el.sceneEl.systems.leap;
  this.physics = this.el.sceneEl.systems.physics;
  this.physics.addBehavior(this, this.physics.Phase.SIMULATE);

  this.palmBody = /** @type {CANNON.Body} */ null;
  this.fingerBodies = /** @type {{string: CANNON.Body}} */ {};
}

HandBody.prototype.remove = function () {
  this.system.removeBehavior(this, this.physics.Phase.SIMULATE);
  for (var id in this.fingerBodies) {
    if (this.fingerBodies.hasOwnProperty(id)) {
      this.physics.removeBody(this.fingerBodies[id]);
    }
  }
};

HandBody.prototype.step = function () {
  var finger, fingerBody,
      hand = this.handComponent.getHand();

  if (!hand || !hand.valid) return;

  this.syncPalmBody(hand, this.palmBody || this.createPalmBody());

  for (var i = 0; i < hand.fingers.length; i++) {
    finger = hand.fingers[i];
    if (finger.valid) {
      fingerBody = this.fingerBodies[finger.type] || this.createFingerBody(finger);
      this.syncFingerBody(finger, fingerBody);
    }
  }
};

HandBody.prototype.createFingerBody = function (finger) {
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
};

HandBody.prototype.syncFingerBody = (function () {
  var position = new THREE.Vector3();

  return function (finger, body) {
    this.el.object3D.localToWorld(position.fromArray(finger.distal.center()));
    body.position.copy(position);
    body.shapes[0].radius = finger.distal.length / 2;
  };
}());

HandBody.prototype.createPalmBody = function () {
  var body = new CANNON.Body({
    shape: new CANNON.Sphere(0.01),
    material: this.physics.material,
    mass: 0
  });
  body.el = this.el;
  this.physics.addBody(body);
  this.palmBody = body;
  return body;
};

/**
 * Repositions and rotates the Body instance to match the Leap hand.
 * TODO: There are some residual rotation issues here.
 * @param {LEAP.Hand} hand
 * @param {CANNON.Body} body
 */
HandBody.prototype.syncPalmBody = (function () {
  var position = new THREE.Vector3(),
      rotation = new THREE.Quaternion(),
      hmdRotation = new THREE.Quaternion(),
      euler = new THREE.Euler(),
      _tmp1 = new THREE.Vector3(),
      _tmp2 = new THREE.Vector3();

  return function (hand, body) {
    rotation.setFromEuler(euler.set(hand.pitch(), hand.yaw(), hand.roll()));
    this.el.object3D.matrixWorld.decompose(_tmp1, hmdRotation, _tmp2);
    body.quaternion.copy(hmdRotation.multiply(rotation));

    this.el.object3D.localToWorld(position.fromArray(hand.palmPosition));
    body.position.copy(position);
  };
}());

module.exports = HandBody;
