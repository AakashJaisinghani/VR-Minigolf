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
scene.fogColor   = BABYLON.Color3.FromHexString("#dbbbe3");
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

// Apply baked lightmap to the ground from common.glb
(function restorePinkBaseAndKeepLightmap(){
  const ground = scene.getMeshByName("Object_6"); // put your exact ground mesh name
  if (!ground || !ground.material) return;

  // Your baked map
  const lm = new BABYLON.Texture("images/lightmap.png", scene);
  lm.coordinatesIndex = 1;   // UV2
  lm.gammaSpace = false;     // light data is linear
  lm.level = 0.8;            // <— reduce if the effect is too strong (0..1)

  // Apply to single or multi-material
  const apply = (mat) => {
    // 1) Remove the baked image from base color (that’s what’s causing the tint)
    mat.albedoTexture = null;            // make sure PBR base color isn’t coming from the lightmap
    mat.albedoColor   = BABYLON.Color3.FromHexString("#F7A9D6"); // your pink

    // 2) Keep the lightmap only as shadow multiplier
    mat.lightmapTexture = lm;
    mat.useLightmapAsShadowMap = true;
  };

  if (ground.material instanceof BABYLON.MultiMaterial && ground.material.subMaterials) {
    ground.material.subMaterials.forEach(m => m && apply(m));
  } else {
    apply(ground.material);
  }

  ground.receiveShadows = true;
})();

// ── DYNAMIC SHADOW MAPS ─────────────────────────────────────────────────────
(function setupShadows(){
  // 1) Make or reuse a directional light just for StudentB
  let dir = scene.getLightByName("dir_studentB");
  if (!dir) {
    dir = new BABYLON.DirectionalLight("dir_studentB",
      new BABYLON.Vector3(-2, -4, 1), scene);            // direction (points down/right)
    dir.position = new BABYLON.Vector3(30, 60, -30);      // place it above the course
    dir.intensity = 1.0;
  }

  // 2) Shadow generator (soft PCF shadows)
  let sg = dir.getShadowGenerator?.();
  if (!sg) {
    sg = new BABYLON.ShadowGenerator(2048, dir);
    sg.usePercentageCloserFiltering = true;
    sg.filteringQuality = BABYLON.ShadowGenerator.QUALITY_HIGH;
    sg.bias = 0.0008;         // fight acne
    sg.normalBias = 0.5;      // fight peter-panning
  }

  // 3) Pick a ground mesh and let it receive shadows
  function pickGround() {
    // try common names first; fall back to largest XZ mesh
    const candidateNames = ["Object_6", "CandyCourseMain", "ground", "platform"];
    let g = candidateNames.map(n => scene.getMeshByName(n)).find(Boolean);
    if (!g) {
      g = scene.meshes.reduce((best, m) => {
        const bb = m.getBoundingInfo().boundingBox, s = bb.maximumWorld.subtract(bb.minimumWorld);
        const area = Math.abs(s.x * s.z);
        return (!best || area > best.area) ? {mesh:m, area} : best;
      }, null)?.mesh;
    }
    return g;
  }
  const ground = pickGround();
  if (ground) ground.receiveShadows = true;

  // 4) Add shadow casters (golf ball + anything you want)
  function addCasterByName(nameOrRegex) {
    if (nameOrRegex instanceof RegExp) {
      scene.meshes.filter(m => nameOrRegex.test(m.name)).forEach(m => sg.addShadowCaster(m, true));
      return;
    }
    const node = scene.getNodeByName(nameOrRegex) || scene.getMeshByName(nameOrRegex);
    if (!node) return;
    (node.getChildMeshes?.() || [node]).forEach(m => sg.addShadowCaster(m, true));
  }

  addCasterByName("golfBall");          // ball casts a shadow
  addCasterByName(/candy/i);            // any mesh with 'candy' in the name
  addCasterByName("Object_43");         // (example) your arch piece
  // addCasterByName("Object_213");     // add more by exact names if you like

  // 5) Optional: don’t waste shadows on the sky dome
  const domeMesh = scene.getMeshByName("testdome_mesh") || null;
  if (domeMesh) domeMesh.receiveShadows = false;

  console.log("[StudentB] Shadows ready. Ground:", ground && ground.name, "Casters:", sg.getShadowMap()?.renderList?.length);
})();


}