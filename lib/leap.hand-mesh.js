module.exports = (function() {

  var DEFAULTS = {
    opacity: 1.0,
    boneScale: 1/6,
    boneColor: (new THREE.Color()).setHex(0xff0000), // was 0xffffff
    jointScale: 1/5,
    jointColor: (new THREE.Color()).setHex(0x00ff00) // was 0x5daa00
  };

  var BASE_BONE_ROTATION = (new THREE.Quaternion())
    .setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0));

  HandMesh.unusedHandMeshes = [];

  /**
   * TODO - reuse with options will be an issue.
   *
   * @param  {Object} options
   * @return {Leap.HandMesh}
   */
  HandMesh.get = function(options) {
    var handMesh;
    if (HandMesh.unusedHandMeshes.length === 0) {
      handMesh = HandMesh.create(options);
    }
    handMesh = HandMesh.unusedHandMeshes.pop();
    handMesh.show();
    return handMesh;
  };

  HandMesh.prototype.replace = function() {
    this.hide();
    return HandMesh.unusedHandMeshes.push(this);
  };

  HandMesh.create = function(options) {
    var mesh;
    mesh = new HandMesh(options);
    mesh.setVisibility(false);
    HandMesh.unusedHandMeshes.push(mesh);
    if (HandMesh.onMeshCreated) {
      HandMesh.onMeshCreated(mesh);
    }
    return mesh;
  };

  function HandMesh(options) {
    var boneCount, finger, i, j, mesh, _i, _j, _k, _l;

    this.options = options = Object.assign({}, DEFAULTS, options || {});
    this.object3D = new THREE.Object3D();

    var material = !isNaN(this.options.opacity) ? new THREE.MeshPhongMaterial({
      fog: false,
      transparent: true,
      opacity: this.options.opacity
    }) : new THREE.MeshPhongMaterial({
      fog: false
    });
    var boneRadius = 40 * this.options.boneScale;
    var jointRadius = 40 * this.options.jointScale;
    this.fingerMeshes = [];
    for (i = _i = 0; _i < 5; i = ++_i) {
      finger = [];
      boneCount = i === 0 ? 3 : 4;
      for (j = _j = 0; 0 <= boneCount ? _j < boneCount : _j > boneCount; j = 0 <= boneCount ? ++_j : --_j) {
        mesh = new THREE.Mesh(new THREE.SphereGeometry(jointRadius, 32, 32), material.clone());
        mesh.name = 'hand-bone-' + j;
        mesh.material.color.copy(this.options.jointColor);
        // mesh.renderDepth = ((i * 9) + (2 * j)) / 36;
        // mesh.castShadow = true;
        this.object3D.add(mesh);
        finger.push(mesh);

        mesh = new THREE.Mesh(
          new THREE.CylinderGeometry(boneRadius, boneRadius, 40, 32), material.clone()
        );
        mesh.name = 'hand-joint-' + j;
        mesh.material.color.copy(this.options.boneColor);
        // mesh.renderDepth = ((i * 9) + (2 * j) + 1) / 36;
        // mesh.castShadow = true;
        this.object3D.add(mesh);
        finger.push(mesh);
      }

      mesh = new THREE.Mesh(new THREE.SphereGeometry(jointRadius, 32, 32), material.clone());
      mesh.material.color.copy(this.options.jointColor);
      // mesh.castShadow = true;
      // scope.scene.add(mesh);
      finger.push(mesh);
      this.fingerMeshes.push(finger);
    }
    // if (scope.arm) {
    //   this.armMesh = new THREE.Object3D;
    //   this.armBones = [];
    //   this.armSpheres = [];
    //   for (i = _k = 0; _k <= 3; i = ++_k) {
    //     this.armBones.push(new THREE.Mesh(new THREE.CylinderGeometry(boneRadius, boneRadius, (i < 2 ? 1000 : 100), 32), material.clone()));
    //     this.armBones[i].material.color.copy(boneColor);
    //     this.armBones[i].castShadow = true;
    //     this.armBones[i].name = "ArmBone" + i;
    //     if (i > 1) {
    //       this.armBones[i].quaternion.multiply(armTopAndBottomRotation);
    //     }
    //     this.armMesh.add(this.armBones[i]);
    //   }
    //   this.armSpheres = [];
    //   for (i = _l = 0; _l <= 3; i = ++_l) {
    //     this.armSpheres.push(new THREE.Mesh(new THREE.SphereGeometry(jointRadius, 32, 32), material.clone()));
    //     this.armSpheres[i].material.color.copy(jointColor);
    //     this.armSpheres[i].castShadow = true;
    //     this.armSpheres[i].name = "ArmSphere" + i;
    //     this.armMesh.add(this.armSpheres[i]);
    //   }
    //   scope.scene.add(this.armMesh);
    // }
  }

  HandMesh.prototype.traverse = function(callback) {
    var i, mesh, _i, _j, _len, _ref;
    for (i = _i = 0; _i < 5; i = ++_i) {
      _ref = this.fingerMeshes[i];
      for (_j = 0, _len = _ref.length; _j < _len; _j++) {
        mesh = _ref[_j];
        callback(mesh);
      }
    }
    return this.armMesh && this.armMesh.traverse(callback);
  };

  HandMesh.prototype.scaleTo = function(hand) {
    var armLenScale, armWidthScale, baseScale, bone, boneXOffset, finger, fingerBoneLengthScale, halfArmLength, i, j, mesh, _i, _j;

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
    // if (scope.arm) {
    //   armLenScale = hand.arm.length / (this.armBones[0].geometry.parameters.height + this.armBones[0].geometry.parameters.radiusTop);
    //   armWidthScale = hand.arm.width / (this.armBones[2].geometry.parameters.height + this.armBones[2].geometry.parameters.radiusTop);
    //   for (i = _j = 0; _j <= 3; i = ++_j) {
    //     this.armBones[i].scale.set(baseScale, (i < 2 ? armLenScale : armWidthScale), baseScale);
    //     this.armSpheres[i].scale.set(baseScale, baseScale, baseScale);
    //   }
    //   boneXOffset = (hand.arm.width / 2) * 0.85;
    //   halfArmLength = hand.arm.length / 2;
    //   this.armBones[0].position.setX(boneXOffset);
    //   this.armBones[1].position.setX(-boneXOffset);
    //   this.armBones[2].position.setY(halfArmLength);
    //   this.armBones[3].position.setY(-halfArmLength);
    //   this.armSpheres[0].position.set(-boneXOffset, halfArmLength, 0);
    //   this.armSpheres[1].position.set(boneXOffset, halfArmLength, 0);
    //   this.armSpheres[2].position.set(boneXOffset, -halfArmLength, 0);
    //   this.armSpheres[3].position.set(-boneXOffset, -halfArmLength, 0);
    // }
    return this;
  };

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

  HandMesh.prototype.setVisibility = function(visible) {
    var i, j, _i, _j, _results;
    for (i = _i = 0; _i < 5; i = ++_i) {
      j = 0;
      while (true) {
        this.fingerMeshes[i][j].visible = visible;
        ++j;
        if (j === this.fingerMeshes[i].length) {
          break;
        }
      }
    }
    // if (scope.arm) {
    //   _results = [];
    //   for (i = _j = 0; _j <= 3; i = ++_j) {
    //     this.armBones[i].visible = visible;
    //     _results.push(this.armSpheres[i].visible = visible);
    //   }
    //   return _results;
    // }
  };

  HandMesh.prototype.show = function() {
    return this.setVisibility(true);
  };

  HandMesh.prototype.hide = function() {
    return this.setVisibility(false);
  };

  HandMesh.prototype.getMesh = function() {
    return this.object3D;
  };

  return HandMesh;

}());
