/**
 * Helper for raycasting, which chooses a raycaster direction based on hand position. Also supports
 * a debugging mode, in which the ray is visible.
 */
function Intersector () {
  this.arrowHelper = this.createArrowHelper();
  this.raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(), 0, 0.2);
}

Intersector.prototype.update = function (options, object3D, hand, isHolding) {
  // Update options.
  this.holdDistance = options.holdDistance;
  this.debug = options.debug;

  // Update raycaster.
  this.raycaster.far = this.holdDistance;
  this.raycaster.ray.direction.fromArray(hand.palmNormal);
  this.raycaster.ray.direction.x += hand.direction[0] / 2;
  this.raycaster.ray.direction.y += hand.direction[1] / 2;
  this.raycaster.ray.direction.z += hand.direction[2] / 2;
  this.raycaster.ray.direction.normalize();
  this.raycaster.ray.origin.fromArray(hand.palmPosition);
  object3D.localToWorld(this.raycaster.ray.origin);

  // Update arrow helper.
  if (this.debug) {
    this.arrowHelper = this.arrowHelper || this.createArrowHelper();
    this.arrowHelper.position.copy(this.raycaster.ray.origin);
    object3D.worldToLocal(this.arrowHelper.position);
    this.arrowHelper.setDirection(this.raycaster.ray.direction);
    this.arrowHelper.setLength(this.holdDistance);
    this.arrowHelper.setColor(isHolding ? 0xFF0000 : 0x00FF00);
  } else {
    delete this.arrowHelper;
  }
};

Intersector.prototype.intersectObjects = function (objects, isRecursive) {
  return this.raycaster.intersectObjects(objects, isRecursive);
};

/** @return {THREE.ArrowHelper} */
Intersector.prototype.createArrowHelper = function () {
  return new THREE.ArrowHelper(
    new THREE.Vector3(1, 0, 0),
    new THREE.Vector3(),
    this.holdDistance
  );
};

/** @return {THREE.Object3D} */
Intersector.prototype.getMesh = function () {
  return this.arrowHelper;
};

/** @return {Intersector} */
Intersector.prototype.show = function () {
  if (this.arrowHelper) this.arrowHelper.visible = true;
  return this;
};

/** @return {Intersector} */
Intersector.prototype.hide = function () {
  if (this.arrowHelper) this.arrowHelper.visible = false;
  return this;
};

module.exports = Intersector;
