// ---- sound packs ----
const PACKS = {
  typewriter: ["sounds/typewriter1.mp3", "sounds/typewriter2.mp3"],
  mechanical: ["sounds/mech1.mp3", "sounds/mech2.mp3"],
  laptop: ["sounds/laptop1.mp3", "sounds/laptop2.mp3"],
  thocky: ["sounds/thock1.mp3", "sounds/thock2.mp3"], // NEW
};

// keys like space/enter
const SPECIAL_KEYS = new Set([" ", "Spacebar", "Enter"]);

let currentPack = "typewriter";
let volume = 0.6;
let includeSpecials = true;
let audioEnabled = false;

const pools = {};
function buildPool(packName) {
  const files = PACKS[packName] || [];
  pools[packName] = files.map((src) =>
    new Howl({ src: [src], preload: true, volume, html5: false })
  );
}
Object.keys(PACKS).forEach(buildPool);

function playClick(isSpecial = false) {
  const list = pools[currentPack];
  if (!list || list.length === 0) return;
  const howl = list[Math.floor(Math.random() * list.length)];
  const id = howl.play();
  try {
    const detune = (Math.random() * 0.06) - 0.03; // -3%..+3%
    howl.rate(1 + detune, id);
    howl.volume(volume * (isSpecial ? 0.9 : 1), id);
  } catch {}
}

// UI elements
const packSel = document.getElementById("pack");
const volInput = document.getElementById("volume");
const specialChk = document.getElementById("spacebar");
const enableBtn = document.getElementById("enableAudio");

// restore previous settings
try {
  const saved = JSON.parse(localStorage.getItem("qk_prefs") || "{}");
  if (saved.pack && PACKS[saved.pack]) { currentPack = saved.pack; packSel.value = saved.pack; }
  if (typeof saved.volume === "number") { volume = saved.volume; volInput.value = saved.volume; }
  if (typeof saved.specials === "boolean") { includeSpecials = saved.specials; specialChk.checked = saved.specials; }
} catch {}

function savePrefs() {
  localStorage.setItem("qk_prefs", JSON.stringify({
    pack: currentPack, volume, specials: includeSpecials
  }));
}

// unlock audio (required by browsers)
enableBtn.addEventListener("click", () => {
  audioEnabled = true;
  enableBtn.textContent = "audio enabled ✅";
  enableBtn.disabled = true;
});

packSel.addEventListener("change", (e) => {
  currentPack = e.target.value;
  if (!pools[currentPack]) buildPool(currentPack);
  savePrefs();
});
volInput.addEventListener("input", (e) => {
  volume = parseFloat(e.target.value || "0.6");
  savePrefs();
});
specialChk.addEventListener("change", (e) => {
  includeSpecials = !!e.target.checked;
  savePrefs();
});

function handleKey(e) {
  if (!audioEnabled) return;
  if (e.repeat) return;
  const key = e.key || e.code;
  const isSpecial = SPECIAL_KEYS.has(key);
  if (!includeSpecials && isSpecial) return;
  playClick(isSpecial);
}
window.addEventListener("keydown", handleKey);
