async function setupStudentD(scene) {

  // This is how you add models from a file:
  // await BABYLON.SceneLoader.AppendAsync("folder-name-if-file-in-folder", "filename.gltf");
  // await BABYLON.SceneLoader.AppendAsync("", "studentD/studentD.glb");

  // make sure these appear AFTER loading the GLB it refers to
  let n = makeNodeObject(scene); // n holds meshes, empties/transformNodes, cameras and lights
  let a = makeAnimationGroupObject(scene);

  (async () => {
    const audioEngine = await BABYLON.CreateAudioEngineAsync();
    await audioEngine.unlockAsync();
})();

let music = await BABYLON.CreateSoundAsync("music", "studentD/sound/bgmusic.mp3");
music.volume = 0.4;
music.play({ loop: true });

const quack = await BABYLON.CreateSoundAsync("quack", "studentD/sound/quack.mp3");

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






} // DO NOT ERASE THIS