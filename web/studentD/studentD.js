async function setupStudentD(scene) {

  // This is how you add models from a file:
  // await BABYLON.SceneLoader.AppendAsync("folder-name-if-file-in-folder", "filename.gltf");
  // await BABYLON.SceneLoader.AppendAsync("", "studentD/studentD.glb");

  // make sure these appear AFTER loading the GLB it refers to
  let n = makeNodeObject(scene); // n holds meshes, empties/transformNodes, cameras and lights
  let a = makeAnimationGroupObject(scene);


  //bg music and quack sound
  (async () => {
    const audioEngine = await BABYLON.CreateAudioEngineAsync();
    await audioEngine.unlockAsync();
})();

let music = await BABYLON.CreateSoundAsync("music", "studentD/sound/bgmusic.mp3");
music.volume = 0.4;
music.play({ loop: true });

const quack = await BABYLON.CreateSoundAsync("quack", "studentD/sound/quack.mp3");


//music play on click
addPickAction(n.golfBall, function(item) {
  var impulseDirection = scene.activeCamera.getForwardRay().direction;
  let impulseMagnitude = 0.15;
  let contactLocalRefPoint = BABYLON.Vector3.Zero();
  item.physicsAggregate.body.applyImpulse(
      impulseDirection.scale(impulseMagnitude),
      item.getAbsolutePosition().add(contactLocalRefPoint)
  );
  quack.play();
});


//teleport1
addPickAction(n["teleport.001_outer"], function(){
  scene.activeCamera.position = n["teleport.001_outer"].getAbsolutePosition().clone();
});

//teleport2
addPickAction(n["teleport.002_outer"], function(){
  scene.activeCamera.position = n["teleport.002_outer"].getAbsolutePosition().clone();
});



//ANIMATION
let Animbutton = scene.getNodeByName("TCylinder");
let animationGroup = scene.getAnimationGroupByName("Armature|mixamo.com|Layer0");
animationGroup.stop();
Animbutton.actionManager = new BABYLON.ActionManager(scene);
Animbutton.actionManager.registerAction(
    new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function () {
        console.log("Button clicked!");
        animationGroup.start(false);
    })
);




} // DO NOT ERASE THIS