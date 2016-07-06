/**
 * Helper for raycasting, which chooses a raycaster direction based on hand position. Also supports
 * a debugging mode, in which the ray is visible.
 */
function Intersector () {
  this.arrowHelper = this.createArrowHelper();
  this.raycaster = new THREE.Raycaster(
    new THREE.Vector3(), new THREE.Vector3(), 0, this.holdDistance
  );
}

Intersector.prototype.update = function (options, object3D, hand, isHolding) {
  // Update options.
  this.holdDistance = options.holdDistance;
  this.debug = true; // TODO

  // Update raycaster.
  this.raycaster.ray.direction.set(hand.palmNormal[0], hand.palmNormal[1], hand.palmNormal[2]);
  this.raycaster.ray.direction.x += hand.direction[0] / 2;
  this.raycaster.ray.direction.y += hand.direction[1] / 2;
  this.raycaster.ray.direction.z += hand.direction[2] / 2;
  this.raycaster.ray.direction.normalize();
  this.raycaster.ray.origin.set(hand.palmPosition[0], hand.palmPosition[1], hand.palmPosition[2]);
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

module.exports = Intersector;
