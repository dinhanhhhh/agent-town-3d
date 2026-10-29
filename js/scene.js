// Three.js scene for "Thị trấn DevOps" - Isometric Diorama
(function () {
  const containerElem =
    document.getElementById('threejs-container-ANIMATION_2') ||
    document.getElementById('canvas-container') ||
    document.body;

  const width = containerElem.clientWidth || window.innerWidth;
  const height = containerElem.clientHeight || window.innerHeight;

  // Scene setup
  const scene = new THREE.Scene();

  // Orthographic camera for true isometric view
  const aspect = width / height;
  let d = 18;
  const defaultD = 18;
  const camera = new THREE.OrthographicCamera(
    -d * aspect,
    d * aspect,
    d,
    -d,
    1,
    1000
  );

  // Isometric angle: 35.264 deg tilt, 45 deg rotation
  const defaultPos = { x: 25, y: 26, z: 25 };
  camera.position.set(defaultPos.x, defaultPos.y, defaultPos.z);
  camera.lookAt(0, 0, 0);

  // WebGL Renderer with soft shadows and alpha
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  containerElem.appendChild(renderer.domElement);

  // Lighting setup for soft, cozy, sunny pastel diorama
  const ambientLight = new THREE.AmbientLight(0xfff5ea, 0.95);
  scene.add(ambientLight);

  const hemiLight = new THREE.HemisphereLight(0xe8f4f8, 0x88d49e, 0.55);
  hemiLight.position.set(0, 50, 0);
  scene.add(hemiLight);

  const sunLight = new THREE.DirectionalLight(0xfffaed, 1.4);
  sunLight.position.set(28, 42, 18);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.near = 0.5;
  sunLight.shadow.camera.far = 120;
  const shadowCamSize = 24;
  sunLight.shadow.camera.left = -shadowCamSize;
  sunLight.shadow.camera.right = shadowCamSize;
  sunLight.shadow.camera.top = shadowCamSize;
  sunLight.shadow.camera.bottom = -shadowCamSize;
  sunLight.shadow.bias = -0.0008;
  scene.add(sunLight);

  // Secondary soft fill light
  const fillLight = new THREE.DirectionalLight(0xd4e4ff, 0.45);
  fillLight.position.set(-20, 15, -15);
  scene.add(fillLight);

  // Diorama Root Group
  const townGroup = new THREE.Group();
  scene.add(townGroup);

  // Materials Palette (Kenney / KayKit pastel tones)
  const mats = {
    grass: new THREE.MeshLambertMaterial({ color: 0x9be3b5 }),
    grassTop: new THREE.MeshLambertMaterial({ color: 0xb4edd0 }),
    dirt: new THREE.MeshLambertMaterial({ color: 0xc49a6c }),
    darkDirt: new THREE.MeshLambertMaterial({ color: 0xa47b50 }),
    path: new THREE.MeshLambertMaterial({ color: 0xf5ebd6 }),
    water: new THREE.MeshLambertMaterial({
      color: 0xa4dbf8,
      transparent: true,
      opacity: 0.85,
    }),
    wood: new THREE.MeshLambertMaterial({ color: 0xbc8f65 }),
    stone: new THREE.MeshLambertMaterial({ color: 0xd7dde4 }),
    darkStone: new THREE.MeshLambertMaterial({ color: 0x98a2b3 }),
    creamWall: new THREE.MeshLambertMaterial({ color: 0xfefaf0 }),
    roofRed: new THREE.MeshLambertMaterial({ color: 0xef7a7a }),
    roofBlue: new THREE.MeshLambertMaterial({ color: 0x76b6e4 }),
    roofPurple: new THREE.MeshLambertMaterial({ color: 0xb58de6 }),
    roofYellow: new THREE.MeshLambertMaterial({ color: 0xf9c857 }),
    roofGreen: new THREE.MeshLambertMaterial({ color: 0x72c79c }),
    roofOrange: new THREE.MeshLambertMaterial({ color: 0xfca065 }),
    roofTeal: new THREE.MeshLambertMaterial({ color: 0x5bc3b9 }),
    gold: new THREE.MeshLambertMaterial({ color: 0xfbd043 }),
    foliage1: new THREE.MeshLambertMaterial({ color: 0x8bd49a }),
    foliage2: new THREE.MeshLambertMaterial({ color: 0x6bb88b }),
    foliagePink: new THREE.MeshLambertMaterial({ color: 0xffb7b2 }),
    treeTrunk: new THREE.MeshLambertMaterial({ color: 0x8a5d3b }),
    windowBlue: new THREE.MeshLambertMaterial({ color: 0xd6f0fc }),
    accentGlow: new THREE.MeshBasicMaterial({ color: 0x38ef7d }),
    accentGlowRed: new THREE.MeshBasicMaterial({ color: 0xff5252 }),
    characterSkin: new THREE.MeshLambertMaterial({ color: 0xffdfba }),
    characterClothes: [
      new THREE.MeshLambertMaterial({ color: 0x5c7cfa }), // PM
      new THREE.MeshLambertMaterial({ color: 0x20c997 }), // Dev
      new THREE.MeshLambertMaterial({ color: 0x845ef7 }), // Review
      new THREE.MeshLambertMaterial({ color: 0xfa5252 }), // QA
      new THREE.MeshLambertMaterial({ color: 0x339af0 }), // Security
      new THREE.MeshLambertMaterial({ color: 0xf76707 }), // DevOps
      new THREE.MeshLambertMaterial({ color: 0x40c057 }), // Monitoring
    ],
  };

  // 1. FLOATING ISLAND BASE (Layered polygon chunk)
  const baseThickness = 3.5;

  // Top Grass Slab
  const grassGeo = new THREE.CylinderGeometry(15, 14.5, 1.2, 12);
  const grassMesh = new THREE.Mesh(grassGeo, mats.grass);
  grassMesh.position.y = 0;
  grassMesh.receiveShadow = true;
  grassMesh.castShadow = true;
  townGroup.add(grassMesh);

  // Dirt Under-layer (Diorama chunk)
  const dirtGeo = new THREE.CylinderGeometry(14.5, 10.5, baseThickness, 12);
  const dirtMesh = new THREE.Mesh(dirtGeo, mats.dirt);
  dirtMesh.position.y = -baseThickness / 2 - 0.5;
  dirtMesh.receiveShadow = true;
  dirtMesh.castShadow = true;
  townGroup.add(dirtMesh);

  // Bottom tip / floating rock roots
  const tipGeo = new THREE.ConeGeometry(10.5, 3.8, 8);
  const tipMesh = new THREE.Mesh(tipGeo, mats.darkDirt);
  tipMesh.rotation.x = Math.PI;
  tipMesh.position.y = -baseThickness - 2.4;
  townGroup.add(tipMesh);

  // Floating sub-crystals / mini-islands
  const miniIslands = [
    { x: -16, y: -2, z: 8, r: 1.8 },
    { x: 17, y: -3, z: -7, r: 2.2 },
    { x: -12, y: -4, z: -14, r: 1.5 },
    { x: 14, y: -1.5, z: 12, r: 1.6 },
  ];
  miniIslands.forEach((mi) => {
    const mTop = new THREE.Mesh(
      new THREE.CylinderGeometry(mi.r, mi.r * 0.9, 0.6, 6),
      mats.grass
    );
    const mBot = new THREE.Mesh(
      new THREE.ConeGeometry(mi.r * 0.9, 1.8, 6),
      mats.dirt
    );
    mBot.rotation.x = Math.PI;
    mBot.position.y = -1.1;
    const g = new THREE.Group();
    g.add(mTop);
    g.add(mBot);
    g.position.set(mi.x, mi.y, mi.z);
    townGroup.add(g);
  });

  // Cobblestone Central Plaza & Ring Path
  const plazaGeo = new THREE.CylinderGeometry(4.5, 4.5, 0.08, 16);
  const plazaMesh = new THREE.Mesh(plazaGeo, mats.path);
  plazaMesh.position.y = 0.61;
  plazaMesh.receiveShadow = true;
  townGroup.add(plazaMesh);

  // Radial paths connecting to 7 buildings
  const pathRingGeo = new THREE.RingGeometry(8, 10.8, 24);
  const pathRing = new THREE.Mesh(pathRingGeo, mats.path);
  pathRing.rotation.x = -Math.PI / 2;
  pathRing.position.y = 0.61;
  pathRing.receiveShadow = true;
  townGroup.add(pathRing);

  // Mini stepping stones connecting plaza to ring
  for (let a = 0; a < 7; a++) {
    const angle = (a / 7) * Math.PI * 2;
    const pathSpokeGeo = new THREE.PlaneGeometry(1.8, 4.5);
    const spoke = new THREE.Mesh(pathSpokeGeo, mats.path);
    spoke.rotation.x = -Math.PI / 2;
    spoke.rotation.z = -angle + Math.PI / 2;
    spoke.position.set(Math.cos(angle) * 6.3, 0.615, Math.sin(angle) * 6.3);
    townGroup.add(spoke);
  }

  // 2. CENTER: CLAUDE CODE CASTLE (The Orchestrator)
  const castleGroup = new THREE.Group();
  castleGroup.position.set(0, 0.6, 0);

  // Main Keep
  const castleBody = new THREE.Mesh(
    new THREE.BoxGeometry(3.6, 3.8, 3.6),
    mats.creamWall
  );
  castleBody.position.y = 1.9;
  castleBody.castShadow = true;
  castleBody.receiveShadow = true;
  castleGroup.add(castleBody);

  // Roof
  const castleRoof = new THREE.Mesh(
    new THREE.ConeGeometry(2.9, 2.6, 4),
    mats.roofPurple
  );
  castleRoof.rotation.y = Math.PI / 4;
  castleRoof.position.y = 3.8 + 1.3;
  castleRoof.castShadow = true;
  castleGroup.add(castleRoof);

  // 4 Corner Turrets
  const turretPositions = [
    [-1.9, 1.9],
    [1.9, 1.9],
    [-1.9, -1.9],
    [1.9, -1.9],
  ];
  turretPositions.forEach((pos) => {
    const turret = new THREE.Mesh(
      new THREE.CylinderGeometry(0.65, 0.7, 4.2, 8),
      mats.stone
    );
    turret.position.set(pos[0], 2.1, pos[1]);
    turret.castShadow = true;
    castleGroup.add(turret);

    const tRoof = new THREE.Mesh(
      new THREE.ConeGeometry(0.85, 1.5, 8),
      mats.gold
    );
    tRoof.position.set(pos[0], 4.2 + 0.75, pos[1]);
    tRoof.castShadow = true;
    castleGroup.add(tRoof);
  });

  // Castle Gold Emblem / Core Crystal
  const coreCrystal = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.7, 0),
    mats.gold
  );
  coreCrystal.position.set(0, 5.8, 0);
  coreCrystal.castShadow = true;
  castleGroup.add(coreCrystal);

  // Castle Doorway
  const door = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.8, 0.2), mats.wood);
  door.position.set(0, 0.9, 1.82);
  castleGroup.add(door);

  townGroup.add(castleGroup);

  // Helper to make cute low-poly trees
  function createCuteTree(x, z, type = 0) {
    const treeG = new THREE.Group();
    treeG.position.set(x, 0.6, z);

    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.3, 1.4, 6),
      mats.treeTrunk
    );
    trunk.position.y = 0.7;
    trunk.castShadow = true;
    treeG.add(trunk);

    if (type === 0) {
      const f1 = new THREE.Mesh(
        new THREE.DodecahedronGeometry(1.2, 1),
        mats.foliage1
      );
      f1.position.y = 2.1;
      f1.castShadow = true;
      treeG.add(f1);
    } else if (type === 1) {
      const c1 = new THREE.Mesh(
        new THREE.ConeGeometry(1.2, 1.5, 6),
        mats.foliage2
      );
      c1.position.y = 1.6;
      c1.castShadow = true;
      const c2 = new THREE.Mesh(
        new THREE.ConeGeometry(0.9, 1.3, 6),
        mats.foliage1
      );
      c2.position.y = 2.4;
      c2.castShadow = true;
      treeG.add(c1);
      treeG.add(c2);
    } else {
      const fp = new THREE.Mesh(
        new THREE.DodecahedronGeometry(1.3, 1),
        mats.foliagePink
      );
      fp.position.y = 2.2;
      fp.castShadow = true;
      treeG.add(fp);
    }
    return treeG;
  }

  // Add trees around the island
  const treePositions = [
    [-11, -4, 0],
    [-10.5, 5, 2],
    [11.5, -3, 1],
    [9.5, 6, 0],
    [-5, -11, 2],
    [6, -11, 1],
    [-4, 11.5, 0],
    [4.5, 11, 2],
    [-13, 0, 1],
    [13, 2, 0],
    [0, -12.5, 2],
  ];
  treePositions.forEach((tp) => {
    townGroup.add(createCuteTree(tp[0], tp[1], tp[2]));
  });

  // Helper to create cute human/agent figurines
  function createCharacter(clothingIndex, hasBox = false) {
    const charG = new THREE.Group();

    // Head
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.38, 8, 8),
      mats.characterSkin
    );
    head.position.y = 1.35;
    head.castShadow = true;
    charG.add(head);

    // Hat / hair
    const hair = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42, 0.42, 0.18, 8),
      mats.characterClothes[clothingIndex % 7]
    );
    hair.position.y = 1.58;
    charG.add(hair);

    // Body
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.32, 0.42, 0.75, 8),
      mats.characterClothes[clothingIndex % 7]
    );
    body.position.y = 0.82;
    body.castShadow = true;
    charG.add(body);

    // Legs
    const leg1 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 0.45, 6),
      mats.darkStone
    );
    leg1.position.set(-0.16, 0.22, 0);
    const leg2 = leg1.clone();
    leg2.position.set(0.16, 0.22, 0);
    charG.add(leg1);
    charG.add(leg2);

    if (hasBox) {
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(0.48, 0.42, 0.48),
        mats.path
      );
      box.position.set(0, 0.8, 0.38);
      box.castShadow = true;
      charG.add(box);
    }

    return charG;
  }

  // 3. BUILDINGS & AGENTS (The 7 Roles)
  const radius = 9.8;
  const buildingsData = [
    { role: "PM · BA", angle: 0.2, colorRoof: mats.roofYellow, decor: "pm" },
    { role: "Dev", angle: 1.1, colorRoof: mats.roofBlue, decor: "dev" },
    { role: "Review", angle: 2.0, colorRoof: mats.roofPurple, decor: "review" },
    { role: "QA · Test", angle: 2.9, colorRoof: mats.roofGreen, decor: "qa" },
    { role: "Security", angle: 3.8, colorRoof: mats.roofRed, decor: "security" },
    { role: "DevOps", angle: 4.7, colorRoof: mats.roofOrange, decor: "devops" },
    { role: "Monitoring", angle: 5.6, colorRoof: mats.roofTeal, decor: "monitoring" },
  ];

  const buildingMeshes = [];
  const characters = [];

  buildingsData.forEach((b, idx) => {
    const bg = new THREE.Group();
    const bx = Math.cos(b.angle) * radius;
    const bz = Math.sin(b.angle) * radius;
    bg.position.set(bx, 0.6, bz);

    // Rotate building towards center
    bg.rotation.y = -b.angle - Math.PI / 2;

    if (b.decor === "monitoring") {
      const tower = new THREE.Mesh(
        new THREE.CylinderGeometry(1.3, 1.6, 5.2, 8),
        mats.stone
      );
      tower.position.y = 2.6;
      tower.castShadow = true;
      bg.add(tower);

      const roof = new THREE.Mesh(
        new THREE.ConeGeometry(1.6, 2.0, 8),
        b.colorRoof
      );
      roof.position.y = 5.2 + 1.0;
      roof.castShadow = true;
      bg.add(roof);

      const beacon = new THREE.Mesh(
        new THREE.SphereGeometry(0.4, 8, 8),
        mats.accentGlow
      );
      beacon.position.y = 6.6;
      bg.add(beacon);

      const beaconLight = new THREE.PointLight(0x38ef7d, 2.0, 8);
      beaconLight.position.set(0, 6.6, 0);
      bg.add(beaconLight);
    } else {
      const widthW = b.decor === "devops" || b.decor === "qa" ? 2.8 : 2.5;
      const heightW = 2.4;
      const depthW = 2.6;

      const house = new THREE.Mesh(
        new THREE.BoxGeometry(widthW, heightW, depthW),
        mats.creamWall
      );
      house.position.y = heightW / 2;
      house.castShadow = true;
      house.receiveShadow = true;
      bg.add(house);

      const roofGeo = new THREE.ConeGeometry(2.1, 1.8, 4);
      const roof = new THREE.Mesh(roofGeo, b.colorRoof);
      roof.rotation.y = Math.PI / 4;
      roof.position.y = heightW + 0.85;
      roof.scale.set(1.1, 1, 1.1);
      roof.castShadow = true;
      bg.add(roof);

      const dMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 1.3, 0.1),
        mats.wood
      );
      dMesh.position.set(0, 0.65, depthW / 2 + 0.05);
      bg.add(dMesh);

      const winGeo = new THREE.BoxGeometry(0.5, 0.5, 0.05);
      const w1 = new THREE.Mesh(winGeo, mats.windowBlue);
      w1.position.set(-0.7, 1.4, depthW / 2 + 0.05);
      const w2 = new THREE.Mesh(winGeo, mats.windowBlue);
      w2.position.set(0.7, 1.4, depthW / 2 + 0.05);
      bg.add(w1);
      bg.add(w2);

      if (b.decor === "devops") {
        const chimney = new THREE.Mesh(
          new THREE.CylinderGeometry(0.25, 0.25, 1.8, 6),
          mats.stone
        );
        chimney.position.set(0.9, heightW + 0.9, -0.6);
        chimney.castShadow = true;
        bg.add(chimney);

        const rocketG = new THREE.Group();
        const rBody = new THREE.Mesh(
          new THREE.CylinderGeometry(0.2, 0.35, 1.4, 8),
          mats.stone
        );
        const rTip = new THREE.Mesh(
          new THREE.ConeGeometry(0.25, 0.6, 8),
          mats.roofRed
        );
        rTip.position.y = 0.9;
        rocketG.add(rBody);
        rocketG.add(rTip);
        rocketG.position.set(1.9, 1.1, 0.4);
        rocketG.rotation.z = -0.15;
        bg.add(rocketG);
      } else if (b.decor === "security") {
        const shield = new THREE.Mesh(
          new THREE.BoxGeometry(0.65, 0.75, 0.2),
          mats.roofBlue
        );
        shield.position.set(0, heightW + 0.5, depthW / 2 + 0.2);
        bg.add(shield);
      } else if (b.decor === "qa") {
        const flask = new THREE.Mesh(
          new THREE.CylinderGeometry(0.3, 0.4, 1.2, 6),
          mats.windowBlue
        );
        flask.position.set(1.8, 0.6, 0);
        bg.add(flask);
      } else if (b.decor === "review") {
        const pole = new THREE.Mesh(
          new THREE.CylinderGeometry(0.08, 0.08, 1.5, 6),
          mats.wood
        );
        pole.position.set(1.6, 0.75, 0.5);
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(0.32, 0.08, 8, 16),
          mats.gold
        );
        ring.position.set(1.6, 1.6, 0.5);
        ring.rotation.y = Math.PI / 4;
        bg.add(pole);
        bg.add(ring);
      } else if (b.decor === "dev") {
        const table = new THREE.Mesh(
          new THREE.BoxGeometry(0.7, 0.6, 0.5),
          mats.wood
        );
        table.position.set(-1.4, 0.3, 1.1);
        const laptop = new THREE.Mesh(
          new THREE.BoxGeometry(0.4, 0.05, 0.3),
          mats.stone
        );
        laptop.position.set(-1.4, 0.63, 1.1);
        bg.add(table);
        bg.add(laptop);
      }
    }

    townGroup.add(bg);
    buildingMeshes.push(bg);

    const agentChar = createCharacter(idx, false);
    const charX = Math.cos(b.angle) * (radius - 2.4);
    const charZ = Math.sin(b.angle) * (radius - 2.4);
    agentChar.position.set(charX, 0.6, charZ);
    agentChar.rotation.y = -b.angle + Math.PI / 2;
    townGroup.add(agentChar);
    characters.push(agentChar);
  });

  // 4. Two Walking courier characters carrying boxes on pathways
  const courier1 = createCharacter(1, true); // carrying PR #87
  townGroup.add(courier1);

  const courier2 = createCharacter(3, true); // carrying bug
  townGroup.add(courier2);

  // Animation State
  let isRotating = true;
  let animTime = 0;

  // Render Loop
  function animate() {
    requestAnimationFrame(animate);

    animTime += 0.016;

    if (isRotating) {
      townGroup.rotation.y += 0.0035;
    }

    // Float center crystal
    if (coreCrystal) {
      coreCrystal.position.y = 5.8 + Math.sin(animTime * 2.5) * 0.15;
      coreCrystal.rotation.y += 0.02;
    }

    // Animate couriers walking along ring paths
    const courierAngle1 = animTime * 0.4 + 1.2;
    courier1.position.set(
      Math.cos(courierAngle1) * 7.5,
      0.6 + Math.abs(Math.sin(animTime * 6)) * 0.1,
      Math.sin(courierAngle1) * 7.5
    );
    courier1.rotation.y = -courierAngle1 - Math.PI / 2;

    const courierAngle2 = -animTime * 0.35 + 3.8;
    courier2.position.set(
      Math.cos(courierAngle2) * 6.5,
      0.6 + Math.abs(Math.sin(animTime * 5)) * 0.1,
      Math.sin(courierAngle2) * 6.5
    );
    courier2.rotation.y = -courierAngle2 + Math.PI / 2;

    // Gentle character idle breathing/bobbing
    characters.forEach((c, i) => {
      c.position.y = 0.6 + Math.sin(animTime * 2.2 + i) * 0.03;
    });

    renderer.render(scene, camera);
  }

  animate();

  function updateCameraFrustum() {
    const newW = containerElem.clientWidth || window.innerWidth;
    const newH = containerElem.clientHeight || window.innerHeight;
    const newAspect = newW / newH;
    camera.left = -d * newAspect;
    camera.right = d * newAspect;
    camera.top = d;
    camera.bottom = -d;
    camera.updateProjectionMatrix();
    renderer.setSize(newW, newH);
  }

  // Resize handler
  window.addEventListener('resize', updateCameraFrustum);

  // Expose clean public control API
  window.dioramaScene = {
    toggleRotation: function () {
      isRotating = !isRotating;
      return isRotating;
    },
    setRotation: function (state) {
      isRotating = Boolean(state);
      return isRotating;
    },
    isRotating: function () {
      return isRotating;
    },
    zoomIn: function () {
      d = Math.max(8, d - 2);
      updateCameraFrustum();
      return d;
    },
    zoomOut: function () {
      d = Math.min(32, d + 2);
      updateCameraFrustum();
      return d;
    },
    resetCamera: function () {
      d = defaultD;
      updateCameraFrustum();
      camera.position.set(defaultPos.x, defaultPos.y, defaultPos.z);
      camera.lookAt(0, 0, 0);
      townGroup.rotation.y = 0;
      return d;
    },
  };

  // Listen for custom postMessage controls
  window.addEventListener('message', (e) => {
    if (e.data && e.data.type === 'TOGGLE_ROTATION') {
      window.dioramaScene.toggleRotation();
    }
  });
})();
