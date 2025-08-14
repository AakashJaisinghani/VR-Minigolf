async function setupCommon(scene) {




  ////////////////////////////////////////
  // Scroll Down
  // Probably don't need to edit below //
  //////////////////////////////////////

  //////////////// START first person controls. Below is code for making first-person controls for non-vr control
  scene.gravity = new BABYLON.Vector3(0, -2, 0);   // x, y and z. Y is up/down so -2 creates gravity

  // good camera for First person walking controls
  let camera = new BABYLON.UniversalCamera("Camera", new BABYLON.Vector3(0, 1.7, 0), scene);
  // This targets the camera to scene origin. Makes the camera point in a particular spot. #edit
  camera.setTarget(new BABYLON.Vector3(0, 1, -2));
  // This attaches the camera to the canvas
  camera.attachControl(canvas, true);

  camera.minZ = 0;

  // Allow WASD in addition to arrow keys to move
  camera.keysUp.push(87);
  camera.keysDown.push(83);
  camera.keysLeft.push(65);
  camera.keysRight.push(68);

  // how fast the camera (aka player) moves
  scene.activeCamera.speed = .2;

  // this creates a collision shape attached to camera so the camera can be affected by gravity
  camera.ellipsoid = new BABYLON.Vector3(.05, .4, .05);
  camera.checkCollisions = true;
  camera.applyGravity = true;
  camera._needMoveForGravity = true;

  // creates an invisible ground plane that user can stand on
  var hiddenGround = BABYLON.MeshBuilder.CreateGround("hiddenGround", { width: 1000, height: 1000 }, scene);
  hiddenGround.collisionsEnabled = true;
  hiddenGround.checkCollisions = true;
  hiddenGround.isVisible = false;

  let vrGround = [hiddenGround];
  ///////////// END first person controls
  try {
    ////////////// XR functionality Makes the scene VR Headset-friendly. Adds teleportation controls
    var xrHelper = await scene.createDefaultXRExperienceAsync({
      // define the floor meshes
      floorMeshes: [hiddenGround] //This is an array of meshes that the player can teleport to. #edit
    });

    const teleportation = xrHelper.teleportation; //creates a variable that allows for more customization of teleportation options.

    // If you want to add more meshes after the xrHelper has already been created
    //teleportation.addFloorMesh(ground2); //ground2 would be the name of another mesh you create.

    teleportation.parabolicRayEnabled = true; // False = cast a straight line for teleportation. True = It will cast an arc for telportation
    teleportation.parabolicCheckRadius = 10; // How far you can teleport #edit
    /////////////// END XR functionality
  } catch (error) {
    console.log(error);
  }


  const havokInstance = await HavokPhysics();
  const hk = new BABYLON.HavokPlugin(true, havokInstance);
  scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), hk);



  // This creates a light, aiming 0,1,0 - to the sky (non-mesh). You can also remove the line below and add a light in the GLTF from blender instead. When you export a GLB / GLTF from Blender, on the right side, expand "include" > punctual lights.
  var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

  // Default intensity is 1. Let's dim the light a small amount #edit
  light.intensity = 0.7;

  // This is how you add models from a file:
  // await BABYLON.SceneLoader.AppendAsync("folder-name-if-file-in-folder", "filename.gltf");
  await BABYLON.SceneLoader.AppendAsync("", "common/common.glb");

  // make sure these appear AFTER loading the GLB
  let n = makeNodeObject(scene); // n holds meshes, empties/transformNodes, cameras and lights
  let a = makeAnimationGroupObject(scene);

  // show debugging controls
  scene.debugLayer.show();

  ////////////////////////////////////////
  // Probably don't need to edit above //
  //////////////////////////////////////

  // your code here



  let invisible = scene.meshes.filter(item => item.name.includes("#inv"));
  invisible.forEach(function(mesh){
      mesh.isVisible = false;
  });

  n.golfBall.physicsAggregate = new BABYLON.PhysicsAggregate(n.golfBall, BABYLON.PhysicsShapeType.SPHERE, {mass:0.05, friction: 0.05, restitution: 0.6});

  let physicsCollisions = scene.meshes.filter(item => item.name.includes("#col"));
  physicsCollisions.forEach(function(mesh){
    // mesh.physicsAggregate = new BABYLON.PhysicsAggregate(mesh, BABYLON.PhysicsShapeType.MESH, {mass:0, friction: 0.5}); //manual way
    addPhysics(mesh, {mass: 0, friction: 0.8, restitution: 0.1}); //using function found in function.js
  });

  addPickAction(n.golfBall, function(item) {
    var impulseDirection = scene.activeCamera.getForwardRay().direction;
    let impulseMagnitude = 0.15;
    let contactLocalRefPoint = BABYLON.Vector3.Zero();
    item.physicsAggregate.body.applyImpulse(
        impulseDirection.scale(impulseMagnitude),
        item.getAbsolutePosition().add(contactLocalRefPoint)
    )
  });


  //////////////////only add / edit code above. Do not edit below.
} // <---- DO NOT ERASE THE BRACKET