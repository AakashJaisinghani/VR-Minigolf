async function setupStudentB(scene) {
  // Load ONLY StudentB assets
  await BABYLON.SceneLoader.AppendAsync("", "studentB/studentB.glb");

  // (Optional) helpers
  const n = makeNodeObject(scene);
  const a = makeAnimationGroupObject(scene);

  // --- SKyDOME (already created above) ---
const dome = scene.getNodeByName("testdome") || new BABYLON.PhotoDome(
  "testdome",
  "skybox360/Final360.png",
  { resolution: 32, size: 1000 },
  scene
);
dome.infiniteDistance = true;

// exclude only the dome from fog
const domeMesh = scene.getMeshByName("testdome_mesh") || (dome.mesh ?? null);
if (domeMesh) {
  domeMesh.applyFog = false;
  if (domeMesh.material) domeMesh.material.fogEnabled = false;
}

// --- FORCE FOG ON EVERYTHING ELSE (so we actually see it) ---
scene.fogEnabled = true;                            // safety
scene.fogMode    = BABYLON.Scene.FOGMODE_EXP2;      // very visible
scene.fogColor   = BABYLON.Color3.FromHexString("#e3e9ff");
scene.fogDensity = 0.018;                           // try 0.02–0.04

// make sure all non-dome meshes & materials accept fog
scene.meshes.forEach(m => {
  if (m !== domeMesh) m.applyFog = true;
});
scene.materials.forEach(mat => { mat.fogEnabled = true; });

// DEBUG: prove GlowLayer works (should make the golfBall glow obviously)
let dbgGlow = new BABYLON.GlowLayer("dbgGlow", scene);
dbgGlow.intensity = 0.5;

const dbg = scene.getMeshByName("Object_43") || scene.meshes[0];
dbg.material = dbg.material || new BABYLON.PBRMaterial("dbg", scene);
dbg.material.emissiveColor = new BABYLON.Color3(1, 0, 1);

// ---------------------------------------------------------------------

// Material to the ball

// --- CandyBall Materialize PBR ---
// --- CandyBall Materialize PBR ---
// CANDY BALL (striped)
// CANDY BALL (Materialize maps)
(function makeMaterializedBall(){
  const ball = scene.getMeshByName("golfBall") || scene.meshes.find(m=>/golf/i.test(m.name));
  if (!ball) return;

  const pbr = new BABYLON.PBRMaterial("ballPBR", scene);
  pbr.albedoTexture   = new BABYLON.Texture("images/CandyTextures/CandyBall.jpg", scene);
  pbr.bumpTexture     = new BABYLON.Texture("images/CandyTextures/CandyBall_normal.png", scene);
  pbr.metallicTexture = new BABYLON.Texture("images/CandyTextures/CandyBall_specular.png", scene); // or roughness/ORM you exported
  pbr.metallic  = 0.0;
  pbr.roughness = 0.25;
  pbr.clearCoat.isEnabled = true;
  pbr.clearCoat.intensity = 1.0;
  pbr.clearCoat.roughness = 0.05;

  ball.material = pbr;
})();

const mesh = scene.getMeshByName("mainCourseMeshName"); // replace with actual mesh name
if (mesh && mesh.material) {
  mesh.material.lightmapTexture = new BABYLON.Texture("images/lightmap.png", scene);
  mesh.material.useLightmapAsShadowMap = true;
}


}