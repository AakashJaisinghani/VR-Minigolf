function makeNodeObject(scene) {
  let nodes = {};
  scene.transformNodes.forEach(node => {
    nodes[node.name] = node;
  });
  scene.meshes.forEach(mesh => {
    nodes[mesh.name] = mesh;
  });
  scene.lights.forEach(light => {
    nodes[light.name] = light;
  });
  scene.cameras.forEach(camera => {
    nodes[camera.name] = camera;
  });
  return nodes;
}
// usage: let n = makeNodeSelector(scene);

function makeAnimationGroupObject(scene) {
  let animations = {};
  scene.animationGroups.forEach((animationGroup) => {
    animations[animationGroup.name] = animationGroup;
    // animationGroup.stop();
  });
  return animations;
}
// usage: let a = makeAnimationGroupObject(scene)


function addPickAction(mesh, action) {
  scene = mesh.getScene();
  mesh.actionManager = mesh.actionManager || new BABYLON.ActionManager(scene);
  mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger,function(){
    action(mesh);
  } ));
  return mesh;
}

function addPhysics(mesh, settings = {mass: 0}) {
  mesh.physicsAggregate = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, settings);
}
