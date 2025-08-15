async function setupStudentA(scene) {


// This is how you add models from a file:
  // await BABYLON.SceneLoader.AppendAsync("folder-name-if-file-in-folder", "filename.gltf");
   await BABYLON.SceneLoader.AppendAsync("", "studentA/studentA.glb");

  let n = makeNodeObject(scene);
  let a = makeAnimationGroupObject(scene);

  n.choclate.physicsAggregate = new BABYLON.PhysicsAggregate(n.choclate, BABYLON.PhysicsShapeType.BOX, {mass:0, friction: 0.05, restitution: 0.6});

  n.choclate1.physicsAggregate = new BABYLON.PhysicsAggregate(n.choclate1, BABYLON.PhysicsShapeType.BOX, {mass:0, friction: 0.05, restitution: 0.6});

  for (let i = 0; i <= 12; i++) {
  let name = i === 0 ? "donut" : `donut${i}`;
  let node = n[name];
  if (node) {
    // If it's a mesh, use it directly
    if (typeof node.getTotalVertices === "function") {
      node.physicsAggregate = new BABYLON.PhysicsAggregate(
        node,
        BABYLON.PhysicsShapeType.CONVEX_HULL,
        {mass: 0.5, friction: 0.05, restitution: 0.6}
      );
    } else if (node.getChildMeshes) {
      // If it's a TransformNode, try to find a child mesh
      let mesh = node.getChildMeshes()[0];
      if (mesh) {
        mesh.physicsAggregate = new BABYLON.PhysicsAggregate(
          mesh,
          BABYLON.PhysicsShapeType.CONVEX_HULL,
          {mass: 0.5, friction: 0.05, restitution: 0.6}
        );
      } else {
        console.warn(`${name} has no child mesh for physics`);
      }
    } else {
      console.warn(`${name} is not a mesh or transform node`);
    }
  } else {
    console.warn(`${name} not found`);
  }
  }

   const particleSystem = new BABYLON.ParticleSystem("particles", 100000, scene);
  particleSystem.particleTexture = new BABYLON.Texture("images/sprinkles.png");
  particleSystem.emitter = n.golfBall;
  particleSystem.emitRate = 100;
  particleSystem.minLifeTime = 0.3;
  particleSystem.maxLifeTime = 10;
  particleSystem.updateSpeed = 0.1;
  particleSystem.minSize = 0.1;
  particleSystem.maxSize = 0.8;
  particleSystem.minEmitPower = 0.5;
  particleSystem.maxEmitPower = 1;
  particleSystem.direction1 = new BABYLON.Vector3(-1, 0, 0);
  particleSystem.direction2 = new BABYLON.Vector3(1, 1, 1);
  
  // Now you can use particleSystem in your pick action
  addPickAction(n.golfBall, function(item) {
    var impulseDirection = scene.activeCamera.getForwardRay().direction;
    let impulseMagnitude = 0;
    let contactLocalRefPoint = BABYLON.Vector3.Zero();
    item.physicsAggregate.body.applyImpulse(
        impulseDirection.scale(impulseMagnitude),
        item.getAbsolutePosition().add(contactLocalRefPoint)
    );

    particleSystem.start();
    setTimeout(function() {
      particleSystem.stop();
    }, 500);
  });

  n.win.setEnabled(false);

  let ballHoleChecker = scene.onBeforeRenderObservable.add(function() {
    if (n.golfBall.intersectsMesh(n["ballHoleDetector#inv"])) {
        console.log("ball fell in hole");
        n.win.setEnabled(true);
        scene.onBeforeRenderObservable.remove(ballHoleChecker);
    } else {
        console.log("ball not in hole");
    }
  });

  const camTrigger = scene.getMeshByName("camtrigger#inv");
  if (!camTrigger) {
    console.warn("Missing camtrigger#inv");
    return;
  }
  camTrigger.isVisible = false;
  camTrigger.refreshBoundingInfo(true);

  const cam = scene.activeCamera;
  if (!cam) {
    console.warn("No active camera");
    return;
  }

  let insideTrigger = false;
  let baseY = cam.position.y;
  let highY = baseY + 10; // or set to a specific value if you want
  let LERP = 0.08;

  scene.onBeforeRenderObservable.add(() => {
    const b = camTrigger.getBoundingInfo().boundingBox;
    const p = cam.position;
    const isInside =
      p.x >= b.minimumWorld.x && p.x <= b.maximumWorld.x &&
      p.y >= b.minimumWorld.y && p.y <= b.maximumWorld.y &&
      p.z >= b.minimumWorld.z && p.z <= b.maximumWorld.z;

    if (isInside) {
      cam.position.y = BABYLON.Scalar.Lerp(cam.position.y, highY, LERP);
    } else {
      cam.position.y = BABYLON.Scalar.Lerp(cam.position.y, baseY, LERP);
    }
  });
}





 // DO NOT ERASE THIS