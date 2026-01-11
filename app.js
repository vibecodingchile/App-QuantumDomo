// QuantumDomo PASC — app.js
let deferredPrompt = null;

const $ = (id) => document.getElementById(id);

const installBtn = $("installBtn");
const pwaStatus = $("pwaStatus");
const onlineStatus = $("onlineStatus");
const toast = $("toast");

const modeLabel = $("modeLabel");
const lightsTag = $("lightsTag");
const lightsLabel = $("lightsLabel");

let lightsOn = false;

function setToast(msg, type = "info") {
  toast.textContent = msg;
  toast.style.color = (type === "danger") ? "var(--danger)" : "var(--muted)";
  window.clearTimeout(setToast._t);
  setToast._t = window.setTimeout(() => (toast.textContent = ""), 2400);
}

function updateClock() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  $("clock").textContent = `${hh}:${mm}`;
  $("date").textContent = now.toLocaleDateString("es-CL", {
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function setLights(on) {
  lightsOn = on;
  lightsTag.textContent = on ? "ON" : "OFF";
  lightsLabel.textContent = on ? "Encendidas" : "Apagadas";
  setToast(on ? "Luces encendidas" : "Luces apagadas");
}

function setNetworkBadge() {
  onlineStatus.textContent = `Red: ${navigator.onLine ? "online" : "offline"}`;
}

function setPwaBadge() {
  // Si está en standalone (instalada) en iOS/Android
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches
    || window.navigator.standalone === true;

  pwaStatus.textContent = `PWA: ${isStandalone ? "instalada" : "web"}`;
}

function mockSensorsTick() {
  // mock suave, sin volverse loco
  const baseT = 22;
  const baseH = 45;

  const t = baseT + (Math.random() * 2 - 1);
  const h = baseH + (Math.random() * 6 - 3);

  $("temp").textContent = t.toFixed(0);
  $("hum").textContent = h.toFixed(0);

  const w = (t > 23) ? "Cálido" : (t < 21) ? "Fresco" : "Estable";
  $("weather").textContent = w;
}

function wireUI() {
  document.querySelectorAll("[data-mode]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const mode = btn.getAttribute("data-mode");
      modeLabel.textContent = mode;
      setToast(`Modo cambiado a: ${mode}`);
    });
  });

  $("toggleLights").addEventListener("click", () => setLights(!lightsOn));
  $("allOn").addEventListener("click", () => setLights(true));
  $("allOff").addEventListener("click", () => setLights(false));

  $("panicBtn").addEventListener("click", () => {
    setToast("⚠️ Pánico activado (simulación)", "danger");
  });

  $("refreshBtn").addEventListener("click", () => {
    setNetworkBadge();
    setPwaBadge();
    mockSensorsTick();
    setToast("Estado actualizado");
  });

  $("resetBtn").addEventListener("click", () => {
    modeLabel.textContent = "Normal";
    setLights(false);
    setToast("UI reseteada");
  });

  // PWA install flow
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.hidden = false;
  });

  installBtn.addEventListener("click", async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    deferredPrompt = null;
    installBtn.hidden = true;
    setToast(choice?.outcome === "accepted" ? "Instalación iniciada" : "Instalación cancelada");
  });
}

async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  try {
    await navigator.serviceWorker.register("./sw.js", { scope: "./" });
  } catch (err) {
    // No interrumpimos, solo avisamos suave
    console.warn("SW registration failed:", err);
  }
}

function init() {
  wireUI();
  updateClock();
  setNetworkBadge();
  setPwaBadge();
  setLights(false);
  mockSensorsTick();

  window.addEventListener("online", setNetworkBadge);
  window.addEventListener("offline", setNetworkBadge);

  setInterval(updateClock, 1000 * 10);
  setInterval(mockSensorsTick, 1000 * 8);

  registerServiceWorker();
}

init();