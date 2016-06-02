  var DEFAULTS = {
        showArm: true,
        opacity: 1.0,
        segments: 16,
        boneScale: 1/6,
        boneColor: 0xFFFFFF,
        jointScale: 1/5,
        jointColor: null
      },
      JOINT_COLORS = [0x5DAA00, 0xA00041],
      BASE_BONE_ROTATION = (new THREE.Quaternion())
        .setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0)),
      ARM_TOP_AND_BOTTOM_ROTATION = (new THREE.Quaternion())
        .setFromEuler(new THREE.Euler(0, 0, Math.PI / 2));

  var numInstances = 0;

  /**
   * Wrapper for a THREE.Mesh instance fitted to a single Leap Motion hand.
   * @param {Object} options
   */
  function HandMesh(options) {
    this.options = options = Object.assign({}, DEFAULTS, options || {});
    this.options.jointColor = this.options.jointColor || JOINT_COLORS[numInstances % 2];
    this.object3D = new THREE.Object3D();
    this.material = !isNaN(options.opacity) ? new THREE.MeshPhongMaterial({
      fog: false,
      transparent: true,
      opacity: options.opacity
    }) : new THREE.MeshPhongMaterial({fog: false});

    this.createFingers();
    this.createArm();
    numInstances++;
  }

  /** @return {Leap.HandMesh} */
  HandMesh.prototype.createFingers = function () {
    var mesh, finger, boneCount,
        options = this.options,
        boneRadius = 40 * options.boneScale,
        jointRadius = 40 * options.jointScale;

    this.fingerMeshes = [];
    for (var i = 0; i < 5; i++) {
      finger = [];
      boneCount = i === 0 ? 3 : 4;
      for (var j = 0; j < boneCount; j++) {
        mesh = new THREE.Mesh(
          new THREE.SphereGeometry(jointRadius, options.segments, options.segments),
          this.material.clone()
        );
        mesh.name = 'hand-bone-' + j;
        mesh.material.color.setHex(options.jointColor);
        // mesh.renderDepth = ((i * 9) + (2 * j)) / 36;
        this.object3D.add(mesh);
        finger.push(mesh);

        mesh = new THREE.Mesh(
          new THREE.CylinderGeometry(boneRadius, boneRadius, 40, options.segments),
          this.material.clone()
        );
        mesh.name = 'hand-joint-' + j;
        mesh.material.color.setHex(options.boneColor);
        // mesh.renderDepth = ((i * 9) + (2 * j) + 1) / 36;
        this.object3D.add(mesh);
        finger.push(mesh);
      }

      mesh = new THREE.Mesh(
        new THREE.SphereGeometry(jointRadius, options.segments, options.segments),
        this.material.clone()
      );
      mesh.material.color.setHex(options.jointColor);
      this.object3D.add(mesh);
      finger.push(mesh);
      this.fingerMeshes.push(finger);
    }
    return this;
  };

  /** @return {Leap.HandMesh} */
  HandMesh.prototype.createArm = function () {
    if (!this.options.showArm) return;

    var options = this.options,
        boneRadius = 40 * options.boneScale,
        jointRadius = 40 * options.jointScale;

    this.armMesh = new THREE.Object3D();
    this.armBones = [];
    this.armSpheres = [];
    for (var i = 0; i <= 3; i++) {
      this.armBones.push(
        new THREE.Mesh(
          new THREE.CylinderGeometry(
            boneRadius, boneRadius, (i < 2 ? 1000 : 100), options.segments
          ),
          this.material.clone()
        )
      );
      this.armBones[i].material.color.setHex(options.boneColor);
      this.armBones[i].castShadow = true;
      this.armBones[i].name = 'ArmBone' + i;
      if (i > 1) {
        this.armBones[i].quaternion.multiply(ARM_TOP_AND_BOTTOM_ROTATION);
      }
      this.armMesh.add(this.armBones[i]);
    }
    this.armSpheres = [];
    for (i = 0; i <= 3; i++) {
      this.armSpheres.push(new THREE.Mesh(
        new THREE.SphereGeometry(jointRadius, options.segments, options.segments),
        this.material.clone()
      ));
      this.armSpheres[i].material.color.setHex(options.jointColor);
      this.armSpheres[i].castShadow = true;
      this.armSpheres[i].name = 'ArmSphere' + i;
      this.armMesh.add(this.armSpheres[i]);
    }
    this.object3D.add(this.armMesh);
    return this;
  };

  /**
   * @param {function} callback
   * @return {Leap.HandMesh}
   */
  HandMesh.prototype.traverse = function(callback) {
    for (var mesh, ref, i = 0; i < 5; i++) {
      ref = this.fingerMeshes[i];
      for (var j = 0, len = ref.length; j < len; j++) {
        mesh = ref[j];
        callback(mesh);
      }
    }
    if (this.armMesh) this.armMesh.traverse(callback);
    return this;
  };

  /**
   * @param  {Leap.Hand} hand
   * @return {Leap.HandMesh}
   */
  HandMesh.prototype.scaleTo = function(hand) {
    var armLenScale, armWidthScale, baseScale, bone, boneXOffset,
        finger, fingerBoneLengthScale, halfArmLength, i, j, mesh, _i, _j;

    baseScale = hand.middleFinger.proximal.length
      / this.fingerMeshes[2][1].geometry.parameters.height;

    for (i = _i = 0; _i < 5; i = ++_i) {
      finger = hand.fingers[i];
      j = 0;
      while (true) {
        if (j === this.fingerMeshes[i].length - 1) {
          mesh = this.fingerMeshes[i][j];
          mesh.scale.set(baseScale, baseScale, baseScale);
          break;
        }
        bone = finger.bones[3 - (j / 2)];
        mesh = this.fingerMeshes[i][j];
        mesh.scale.set(baseScale, baseScale, baseScale);
        j++;
        mesh = this.fingerMeshes[i][j];
        fingerBoneLengthScale = bone.length / mesh.geometry.parameters.height;
        mesh.scale.set(baseScale, fingerBoneLengthScale, baseScale);
        j++;
      }
    }
    if (this.options.showArm) {
      armLenScale = hand.arm.length
        / (this.armBones[0].geometry.parameters.height
          + this.armBones[0].geometry.parameters.radiusTop);
      armWidthScale = hand.arm.width
        / (this.armBones[2].geometry.parameters.height
          + this.armBones[2].geometry.parameters.radiusTop);
      for (i = _j = 0; _j <= 3; i = ++_j) {
        this.armBones[i].scale.set(baseScale, (i < 2 ? armLenScale : armWidthScale), baseScale);
        this.armSpheres[i].scale.set(baseScale, baseScale, baseScale);
      }
      boneXOffset = (hand.arm.width / 2) * 0.85;
      halfArmLength = hand.arm.length / 2;
      this.armBones[0].position.setX(boneXOffset);
      this.armBones[1].position.setX(-boneXOffset);
      this.armBones[2].position.setY(halfArmLength);
      this.armBones[3].position.setY(-halfArmLength);
      this.armSpheres[0].position.set(-boneXOffset, halfArmLength, 0);
      this.armSpheres[1].position.set(boneXOffset, halfArmLength, 0);
      this.armSpheres[2].position.set(boneXOffset, -halfArmLength, 0);
      this.armSpheres[3].position.set(-boneXOffset, -halfArmLength, 0);
    }
    return this;
  };

  /**
   * @param  {Leap.Hand} hand
   * @return {Leap.HandMesh}
   */
  HandMesh.prototype.formTo = function(hand) {
    var bone, finger, i, j, mesh, _i;
    for (i = _i = 0; _i < 5; i = ++_i) {
      finger = hand.fingers[i];
      j = 0;
      while (true) {
        if (j === this.fingerMeshes[i].length - 1) {
          mesh = this.fingerMeshes[i][j];
          mesh.position.fromArray(bone.prevJoint);
          break;
        }
        bone = finger.bones[3 - (j / 2)];
        mesh = this.fingerMeshes[i][j];
        mesh.position.fromArray(bone.nextJoint);
        ++j;
        mesh = this.fingerMeshes[i][j];
        mesh.position.fromArray(bone.center());
        mesh.setRotationFromMatrix((new THREE.Matrix4()).fromArray(bone.matrix()));
        mesh.quaternion.multiply(BASE_BONE_ROTATION);
        ++j;
      }
    }
    if (this.armMesh) {
      this.armMesh.position.fromArray(hand.arm.center());
      this.armMesh.setRotationFromMatrix((new THREE.Matrix4()).fromArray(hand.arm.matrix()));
      this.armMesh.quaternion.multiply(BASE_BONE_ROTATION);
    }
    return this;
  };

  /**
   * @param  {boolean} visible
   * @return {Leap.HandMesh}
   */
  HandMesh.prototype.setVisibility = function(visible) {
    for (var j, i = 0; i < 5; i++) {
      j = 0;
      while (true) {
        this.fingerMeshes[i][j].visible = visible;
        if (++j === this.fingerMeshes[i].length) break;
      }
    }
    if (this.options.showArm) {
      for (var k = 0; k <= 3; k++) {
        this.armBones[k].visible = visible;
        this.armSpheres[k].visible = visible;
      }
    }
    return this;
  };

  /** @return {Leap.HandMesh} */
  HandMesh.prototype.show = function() {
    this.setVisibility(true);
    return this;
  };

  /** @return {Leap.HandMesh} */
  HandMesh.prototype.hide = function() {
    this.setVisibility(false);
    return this;
  };

  /** @return {THREE.Object3D} */
  HandMesh.prototype.getMesh = function() {
    return this.object3D;
  };

  module.exports = HandMesh;
