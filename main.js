import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js';

const shell = document.getElementById('game-shell');
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(shell.clientWidth, shell.clientHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setClearColor(0x050812, 1);

shell.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x070b17, 18, 60);

const camera = new THREE.PerspectiveCamera(55, shell.clientWidth / shell.clientHeight, 0.1, 120);
camera.position.set(0, 7.5, 13.5);

const hemi = new THREE.HemisphereLight(0x9cc9ff, 0x090d16, 1);
scene.add(hemi);

const dirLight = new THREE.DirectionalLight(0x9ad7ff, 1.2);
dirLight.position.set(9, 14, 7);
dirLight.castShadow = true;
dirLight.shadow.mapSize.set(1024, 1024);
scene.add(dirLight);

const pointLight = new THREE.PointLight(0xff5b6e, 3.5, 20, 2);
pointLight.position.set(0, 4, 0);
scene.add(pointLight);

const ground = new THREE.Mesh(
  new THREE.CircleGeometry(18, 80),
  new THREE.MeshStandardMaterial({
    color: 0x0a1221,
    metalness: 0.25,
    roughness: 0.75,
    emissive: 0x07111f,
    emissiveIntensity: 0.9
  })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const grid = new THREE.GridHelper(32, 32, 0x7ac9ff, 0x1a2949);
grid.position.y = 0.02;
scene.add(grid);

const player = {
  mesh: null,
  position: new THREE.Vector3(0, 1.4, 0),
  velocity: new THREE.Vector3(),
  speed: 7,
  hp: 1000,
  maxHp: 1000,
  fruit: 100,
  maxFruit: 100,
  v4: 0,
  maxV4: 100,
  ult: 0,
  maxUlt: 100,
  mode: 'sword',
  v4Active: false,
  v4Timer: 0,
  atkCooldown: 0,
  far: 0,
  facing: new THREE.Vector3(0, 0, 1),
  alive: true,
  unlocked: { sword: true, rumble: true, sanguine: true, v4: true }
};

function createPlayer() {
  const group = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0xe7eeff,
    emissive: 0x6c7edc,
    emissiveIntensity: 0.2,
    metalness: 0.32,
    roughness: 0.5
  });

  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.85, 1.8, 8, 14), bodyMat);
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.62, 32, 32),
    new THREE.MeshStandardMaterial({
      color: 0xe5edf8,
      emissive: 0x8bb2ff,
      emissiveIntensity: 0.1,
      roughness: 0.55
    })
  );
  head.position.y = 1.8;
  head.castShadow = true;
  group.add(head);

  const aura = new THREE.Mesh(
    new THREE.TorusGeometry(1.3, 0.15, 16, 100),
    new THREE.MeshStandardMaterial({
      color: 0x8bbcff,
      emissive: 0x75cfff,
      emissiveIntensity: 1.5,
      transparent: true,
      opacity: 0.8
    })
  );
  aura.rotation.x = Math.PI / 2;
  aura.position.y = 0.5;
  group.add(aura);

  const sword = new THREE.Mesh(
    new THREE.BoxGeometry(0.17, 2.4, 0.22),
    new THREE.MeshStandardMaterial({
      color: 0xf0f3ff,
      emissive: 0xb6d8ff,
      emissiveIntensity: 0.5,
      metalness: 0.9,
      roughness: 0.2
    })
  );
  sword.position.set(0.9, 0.8, 0.3);
  sword.rotation.z = -0.8;
  group.add(sword);

  group.position.copy(player.position);
  scene.add(group);
  player.mesh = group;
  player.aura = aura;
  player.sword = sword;
}

const enemies = [];

function createEnemy(x, z, color = 0xff5a6d, hp = 120) {
  const g = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.SphereGeometry(0.9, 24, 24),
    new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.45,
      metalness: 0.2,
      roughness: 0.7
    })
  );
  body.castShadow = true;
  g.add(body);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.25, 0.08, 12, 40),
    new THREE.MeshStandardMaterial({
      color: 0xf7d67a,
      emissive: 0xffb86b,
      emissiveIntensity: 0.9,
      transparent: true,
      opacity: 0.7
    })
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = -0.2;
  g.add(ring);

  g.position.set(x, 1.2, z);
  scene.add(g);

  enemies.push({
    group: g,
    body,
    ring,
    hp,
    maxHp: hp,
    speed: 1.6 + Math.random() * 0.7,
    attackCooldown: 0,
    hitFlash: 0,
    radius: 1.1,
    color
  });
}

function makeBurst(position, color, scale = 1, life = 0.5) {
  const geo = new THREE.SphereGeometry(0.22, 16, 16);
  const mat = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 1.2,
    transparent: true,
    opacity: 0.9
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.copy(position);
  scene.add(mesh);

  return { mesh, life, maxLife: life, scale, velocity: new THREE.Vector3((Math.random()-0.5)*0.5, 1.5, (Math.random()-0.5)*0.5) };
}

const effects = [];

function makeSlash(origin, direction, color = 0xffffff) {
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(2.3, 0.7),
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
      depthWrite: false
    })
  );
  plane.position.copy(origin);
  plane.position.y = 1.2;
  plane.lookAt(origin.clone().add(direction));
  plane.rotation.z += Math.PI / 2;
  scene.add(plane);
  effects.push({ type: 'slash', mesh: plane, life: 0.18, maxLife: 0.18 });
}

function makeLightning(position, color = 0x8de4ff) {
  const geo = new THREE.CylinderGeometry(0.18, 0.18, 4, 6, 1, false);
  const mat = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 2.5,
    transparent: true,
    opacity: 0.9
  });
  const beam = new THREE.Mesh(geo, mat);
  beam.position.copy(position);
  beam.position.y = 1.5;
  beam.rotation.z = Math.PI / 2;
  scene.add(beam);
  effects.push({ type: 'beam', mesh: beam, life: 0.24, maxLife: 0.24 });
}

function makeBloodBurst(position) {
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.6, 0.2, 10, 40),
    new THREE.MeshStandardMaterial({
      color: 0xff4b6e,
      emissive: 0xff2e5f,
      emissiveIntensity: 1.8,
      transparent: true,
      opacity: 0.9
    })
  );
  ring.position.copy(position);
  ring.position.y = 0.4;
  scene.add(ring);
  effects.push({ type: 'ring', mesh: ring, life: 0.45, maxLife: 0.45 });
}

function makeAngelAura(position) {
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(2.3, 0.12, 10, 64),
    new THREE.MeshStandardMaterial({
      color: 0xd3b7ff,
      emissive: 0xc799ff,
      emissiveIntensity: 2.5,
      transparent: true,
      opacity: 0.9
    })
  );
  ring.position.copy(position);
  ring.position.y = 0.6;
  scene.add(ring);
  effects.push({ type: 'aura', mesh: ring, life: 1.6, maxLife: 1.6 });
}

createPlayer();
createEnemy(-5, -2, 0xff6d7d, 140);
createEnemy(5, 2, 0xff8a5e, 180);
createEnemy(-1, 7, 0x6ad2ff, 200);

const state = {
  mode: 'sword',
  input: { up:false, down:false, left:false, right:false },
  mouseX: 0,
  mouseY: 0,
  gameRunning: false,
  chapter: 1,
  messageTimer: 0
};

const ui = {
  hp: document.getElementById('hp-bar'),
  fruit: document.getElementById('fruit-bar'),
  v4: document.getElementById('v4-bar'),
  ult: document.getElementById('ult-bar'),
  hpText: document.getElementById('hp-text'),
  fruitText: document.getElementById('fruit-text'),
  v4Text: document.getElementById('v4-text'),
  ultText: document.getElementById('ult-text'),
  modeLabel: document.getElementById('mode-label'),
  chapterLabel: document.getElementById('chapter-label'),
  dialogue: document.getElementById('dialogue'),
  dialogueText: document.getElementById('dialogue-text'),
  startScreen: document.getElementById('start-screen'),
  endScreen: document.getElementById('end-screen')
};

function setMode(mode) {
  player.mode = mode;
  state.mode = mode;
  ui.modeLabel.textContent = mode.toUpperCase();
  document.querySelectorAll('.slot').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });
}

function showDialogue(text) {
  ui.dialogueText.textContent = text;
  ui.dialogue.classList.remove('hidden');
  clearTimeout(showDialogue.timeout);
  showDialogue.timeout = setTimeout(() => ui.dialogue.classList.add('hidden'), 1600);
}

function updateHUD() {
  ui.hp.style.width = `${(player.hp / player.maxHp) * 100}%`;
  ui.fruit.style.width = `${(player.fruit / player.maxFruit) * 100}%`;
  ui.v4.style.width = `${(player.v4 / player.maxV4) * 100}%`;
  ui.ult.style.width = `${(player.ult / player.maxUlt) * 100}%`;

  ui.hpText.textContent = `${Math.ceil(player.hp)} / ${player.maxHp}`;
  ui.fruitText.textContent = `${Math.floor(player.fruit)}`;
  ui.v4Text.textContent = `${Math.floor(player.v4)}`;
  ui.ultText.textContent = `${Math.floor(player.ult)}`;
}

function startGame() {
  state.gameRunning = true;
  ui.startScreen.classList.add('hidden');
  ui.endScreen.classList.add('hidden');
  player.hp = player.maxHp;
  player.fruit = player.maxFruit;
  player.v4 = 0;
  player.ult = 0;
  player.position.set(0, 1.2, 0);
  player.mesh.position.copy(player.position);
  setMode('sword');
  showDialogue('The cursed abyss awakens.');
}

function endGame() {
  state.gameRunning = false;
  ui.endScreen.classList.remove('hidden');
  showDialogue('Victory is yours.');
}

document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('restart-btn').addEventListener('click', () => {
  location.reload();
});

document.querySelectorAll('.slot').forEach(btn => {
  btn.addEventListener('click', () => setMode(btn.dataset.mode));
});

window.addEventListener('keydown', (e) => {
  if (e.code === 'KeyW' || e.code === 'ArrowUp') state.input.up = true;
  if (e.code === 'KeyS' || e.code === 'ArrowDown') state.input.down = true;
  if (e.code === 'KeyA' || e.code === 'ArrowLeft') state.input.left = true;
  if (e.code === 'KeyD' || e.code === 'ArrowRight') state.input.right = true;

  if (e.code === 'Digit1') setMode('sanguine');
  if (e.code === 'Digit2') setMode('rumble');
  if (e.code === 'Digit3') setMode('sword');
  if (e.code === 'Digit4') setMode('v4');

  if (e.code === 'Space') doAttack();
  if (e.repeat) return;
});
window.addEventListener('keyup', (e) => {
  if (e.code === 'KeyW' || e.code === 'ArrowUp') state.input.up = false;
  if (e.code === 'KeyS' || e.code === 'ArrowDown') state.input.down = false;
  if (e.code === 'KeyA' || e.code === 'ArrowLeft') state.input.left = false;
  if (e.code === 'KeyD' || e.code === 'ArrowRight') state.input.right = false;
});

window.addEventListener('pointerdown', () => doAttack());
window.addEventListener('pointermove', (event) => {
  const x = (event.clientX / window.innerWidth) * 2 - 1;
  const y = -(event.clientY / window.innerHeight) * 2 + 1;
  state.mouseX = x;
  state.mouseY = y;
});

function doAttack() {
  if (!state.gameRunning || player.atkCooldown > 0) return;
  player.atkCooldown = 0.35;

  const aim = new THREE.Vector3(state.mouseX * 9, 0, state.mouseY * 7);
  const direction = aim.clone().normalize();
  const facing = direction.lengthSq() > 0 ? direction : new THREE.Vector3(0, 0, 1);
  player.facing.copy(facing);

  if (player.mode === 'sword') {
    makeSlash(player.mesh.position.clone().add(new THREE.Vector3(0, 1, 0)), facing, 0xffffff);
    for (const enemy of enemies) {
      const dist = enemy.group.position.distanceTo(player.position);
      if (dist < 2.8) {
        enemy.hp -= 45;
        makeBurst(enemy.group.position.clone(), 0xffd564, 1.0, 0.25);
      }
    }
    player.v4 = Math.min(player.maxV4, player.v4 + 6);
    player.ult = Math.min(player.maxUlt, player.ult + 2);
  }

  if (player.mode === 'rumble') {
    if (player.fruit < 20) {
      showDialogue('Not enough Fruit energy!');
      return;
    }
    player.fruit -= 20;
    makeLightning(player.mesh.position.clone().add(new THREE.Vector3(0.5, 0.8, 0.5)), 0x83d8ff);
    for (const enemy of enemies) {
      const dist = enemy.group.position.distanceTo(player.position);
      if (dist < 5.5) {
        enemy.hp -= 85;
        enemy.stun = 1.2;
        makeBurst(enemy.group.position.clone(), 0x7ce7ff, 1.2, 0.4);
      }
    }
    player.v4 = Math.min(player.maxV4, player.v4 + 9);
    player.ult = Math.min(player.maxUlt, player.ult + 4);
  }

  if (player.mode === 'sanguine') {
    makeBloodBurst(player.mesh.position.clone());
    for (const enemy of enemies) {
      const dist = enemy.group.position.distanceTo(player.position);
      if (dist < 4.6) {
        enemy.hp -= 65;
        player.hp = Math.min(player.maxHp, player.hp + 18);
        makeBurst(enemy.group.position.clone(), 0xff4b6e, 1.2, 0.35);
      }
    }
    player.v4 = Math.min(player.maxV4, player.v4 + 7);
    player.ult = Math.min(player.maxUlt, player.ult + 5);
  }

  if (player.mode === 'v4') {
    if (player.v4 < player.maxV4) {
      showDialogue('V4 power not full!');
      return;
    }
    player.v4 = 0;
    player.v4Active = true;
    player.v4Timer = 6;
    makeAngelAura(player.mesh.position.clone());
    for (const enemy of enemies) {
      enemy.hp -= 130;
      enemy.stun = 2.5;
      makeBurst(enemy.group.position.clone(), 0xd9b3ff, 1.4, 0.5);
    }
    showDialogue('V4 TRANSFORM!');
  }
}

function updatePlayer(dt) {
  const moveX = (state.input.right ? 1 : 0) - (state.input.left ? 1 : 0);
  const moveZ = (state.input.down ? 1 : 0) - (state.input.up ? 1 : 0);

  const inputVec = new THREE.Vector3(moveX, 0, moveZ);
  if (inputVec.lengthSq() > 0) {
    inputVec.normalize();
    const move = inputVec.multiplyScalar(player.speed * dt);
    player.position.add(move);
    player.position.x = THREE.MathUtils.clamp(player.position.x, -13, 13);
    player.position.z = THREE.MathUtils.clamp(player.position.z, -13, 13);
    player.mesh.position.copy(player.position);
  }

  if (player.atkCooldown > 0) player.atkCooldown -= dt;
  player.fruit = Math.min(player.maxFruit, player.fruit + dt * 10);

  if (player.v4Active) {
    player.v4Timer -= dt;
    if (player.v4Timer <= 0) {
      player.v4Active = false;
    }
  }

  if (player.v4Active) {
    player.aura.material.emissiveIntensity = 2.1 + Math.sin(performance.now() * 0.025) * 0.6;
    player.aura.scale.setScalar(1.15 + Math.sin(performance.now() * 0.03) * 0.18);
  } else {
    player.aura.material.emissiveIntensity = 1.3;
    player.aura.scale.setScalar(1);
  }

  player.mesh.rotation.y = Math.atan2(player.facing.x, player.facing.z);
  player.mesh.position.copy(player.position);
}

function updateEnemies(dt) {
  for (const enemy of enemies) {
    if (enemy.hp <= 0) continue;
    if (enemy.stun && enemy.stun > 0) {
      enemy.stun -= dt;
      continue;
    }

    const dir = new THREE.Vector3(player.position.x - enemy.group.position.x, 0, player.position.z - enemy.group.position.z);
    const dist = dir.length();
    if (dist > 0.02) {
      dir.normalize();
      enemy.group.position.add(dir.multiplyScalar(enemy.speed * dt));
    }

    const d = enemy.group.position.distanceTo(player.position);
    if (d < 1.9) {
      player.hp = Math.max(0, player.hp - 14 * dt * 60);
      enemy.hitFlash = 0.12;
    }
  }

  for (let i = enemies.length - 1; i >= 0; i--) {
    if (enemies[i].hp <= 0) {
      const e = enemies[i];
      scene.remove(e.group);
      enemies.splice(i, 1);
    }
  }

  if (enemies.length === 0) {
    state.chapter += 1;
    ui.chapterLabel.textContent = `CHAPTER ${state.chapter}`;
    if (state.chapter <= 3) {
      createEnemy(-6, -4, 0xff5f73, 180 + state.chapter * 25);
      createEnemy(5, 7, 0x8ae3ff, 190 + state.chapter * 25);
      createEnemy(0, -8, 0xe5d388, 220 + state.chapter * 25);
      showDialogue(`Wave cleared. Chapter ${state.chapter}`);
    } else {
      endGame();
    }
  }
}

function updateEffects(dt) {
  for (let i = effects.length - 1; i >= 0; i--) {
    const e = effects[i];
    e.life -= dt;

    if (e.type === 'slash') {
      e.mesh.scale.setScalar(1 + (1 - e.life / e.maxLife) * 1.7);
      e.mesh.material.opacity = (e.life / e.maxLife) * 0.8;
    }

    if (e.type === 'beam') {
      e.mesh.scale.y = 1 + (1 - e.life / e.maxLife) * 2.8;
      e.mesh.material.opacity = (e.life / e.maxLife) * 0.9;
    }

    if (e.type === 'ring') {
      e.mesh.scale.setScalar(1 + (1 - e.life / e.maxLife) * 1.6);
      e.mesh.rotation.z += dt * 10;
      e.mesh.material.opacity = (e.life / e.maxLife) * 0.9;
    }

    if (e.type === 'aura') {
      e.mesh.scale.setScalar(1 + (1 - e.life / e.maxLife) * 0.9);
      e.mesh.rotation.z += dt * 3;
      e.mesh.material.opacity = (e.life / e.maxLife) * 0.9;
    }

    if (e.life <= 0) {
      scene.remove(e.mesh);
      effects.splice(i, 1);
    }
  }
}

function animate() {
  const dt = 1 / 60;
  if (state.gameRunning) {
    updatePlayer(dt);
    updateEnemies(dt);
    updateEffects(dt);
    updateHUD();

    if (player.hp <= 0) {
      endGame();
    }
  }

  camera.position.x += (player.position.x - camera.position.x) * 0.06;
  camera.position.z += (player.position.z + 12.5 - camera.position.z) * 0.06;
  camera.position.y += (8.2 - camera.position.y) * 0.08;
  camera.lookAt(player.position.x, 1.4, player.position.z);

  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
updateHUD();
setMode('sword');
ui.chapterLabel.textContent = `CHAPTER ${state.chapter}`;