const PACKS = {
  typewriter: ["sounds/typewriter1.mp3", "sounds/typewriter2.mp3"],
  mechanical: ["sounds/mech1.mp3", "sounds/mech2.mp3"],
  laptop: ["sounds/laptop1.mp3", "sounds/laptop2.mp3"],
  thocky: ["sounds/thock1.mp3", "sounds/thock2.mp3"],
};

const SPECIAL_KEYS = new Set([" ", "Spacebar", "Enter"]);

let currentPack = "typewriter";
let volume = 0.6;
let includeSpecials = true;
let audioEnabled = false;

// preload buffers instead of reusing Howl objects
const buffers = {};
function preloadSounds() {
  Object.keys(PACKS).forEach(pack => {
    buffers[pack] = PACKS[pack].map(src => new Howl({ src: [src], preload: true }));
  });
}
preloadSounds();

// always create a *fresh* sound to avoid lag
function playClick(isSpecial = false) {
  const list = buffers[currentPack];
  if (!list) return;

  const base = list[Math.floor(Math.random() * list.length)];
  const sound = new Howl({ src: base._src, preload: true, html5: false });

  const id = sound.play();
  const detune = (Math.random() * 0.06) - 0.03; // ±3% pitch
  try {
    sound.rate(1 + detune, id);
    sound.volume(volume * (isSpecial ? 0.9 : 1), id);
  } catch {}
}

// UI
const packSel = document.getElementById("pack");
const volInput = document.getElementById("volume");
const specialChk = document.getElementById("spacebar");
const enableBtn = document.getElementById("enableAudio");
const pad = document.querySelector(".pad");

enableBtn.addEventListener("click", () => {
  audioEnabled = true;
  enableBtn.textContent = "audio enabled ✅ (click pad to stay active)";
  enableBtn.disabled = true;
  pad.focus(); // focus the pad so keys are captured
});

packSel.addEventListener("change", e => currentPack = e.target.value);
volInput.addEventListener("input", e => volume = parseFloat(e.target.value));
specialChk.addEventListener("change", e => includeSpecials = !!e.target.checked);

function handleKey(e) {
  if (!audioEnabled) return;
  if (e.repeat) return;
  const key = e.key || e.code;
  const isSpecial = SPECIAL_KEYS.has(key);
  if (!includeSpecials && isSpecial) return;
  playClick(isSpecial);
}

// attach only to the focus pad (not whole window)
pad.addEventListener("keydown", handleKey);
