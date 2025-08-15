async function setupStudentB(scene) {

  // This is how you add models from a file:
  // await BABYLON.SceneLoader.AppendAsync("folder-name-if-file-in-folder", "filename.gltf");
  await BABYLON.SceneLoader.AppendAsync("", "studentB/studentB.glb");

  // make sure these appear AFTER loading the GLB it refers to
  let n = makeNodeObject(scene); // n holds meshes, empties/transformNodes, cameras and lights
  let a = makeAnimationGroupObject(scene);


  var dome = new BABYLON.PhotoDome(
        "testdome",
        "skybox360/Final360.png",
        {
            resolution: 32,
            size: 1000
        },
        scene
    );
//dome.infiniteDistance = true;


} // DO NOT ERASE THIS