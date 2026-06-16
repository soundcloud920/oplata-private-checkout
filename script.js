const wallets = {
  sol: {
    label: "Solana",
    address: "BBX6mCEQhhpC9Ms1b2QhoVyhJDwqoHt76hNYjjnUqGvp",
  },
  ltc: {
    label: "Litecoin",
    address: "LWxMQxaMogAjkKUqY4zSmFLqw6BJ28UxhA",
  },
};

const modal = document.querySelector("#payModal");
const openButtons = document.querySelectorAll("[data-open-pay]");
const closeButtons = document.querySelectorAll("[data-close-pay]");
const networkButtons = document.querySelectorAll("[data-network]");
const walletNetwork = document.querySelector("#walletNetwork");
const walletAddress = document.querySelector("#walletAddress");
const modalNetwork = document.querySelector("#modalNetwork");
const modalAddress = document.querySelector("#modalAddress");
const copyButton = document.querySelector("[data-copy-address]");
const copyModalButton = document.querySelector("[data-copy-modal]");

let activeNetwork = "sol";
let lastFocus = null;

function setNetwork(network) {
  if (!wallets[network]) return;

  activeNetwork = network;
  walletNetwork.textContent = wallets[network].label;
  walletAddress.value = wallets[network].address;
  modalNetwork.textContent = wallets[network].label;
  modalAddress.value = wallets[network].address;

  networkButtons.forEach((button) => {
    const isActive = button.dataset.network === network;
    button.classList.toggle("is-active", isActive);

    if (button.getAttribute("role") === "tab") {
      button.setAttribute("aria-selected", String(isActive));
    }
  });

  resetCopyButtons();
}

function openModal() {
  lastFocus = document.activeElement;
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  setTimeout(() => modalAddress.focus(), 50);
}

function closeModal() {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");

  if (lastFocus && typeof lastFocus.focus === "function") {
    lastFocus.focus();
  }
}

function resetCopyButtons() {
  [copyButton, copyModalButton].forEach((button) => {
    button.textContent = "Копировать";
    button.classList.remove("is-copied");
  });
}

async function copyValue(input, button) {
  const value = input.value;

  try {
    await navigator.clipboard.writeText(value);
  } catch {
    input.select();
    document.execCommand("copy");
  }

  button.textContent = "Скопировано";
  button.classList.add("is-copied");
  window.setTimeout(resetCopyButtons, 1900);
}

openButtons.forEach((button) => button.addEventListener("click", openModal));
closeButtons.forEach((button) => button.addEventListener("click", closeModal));
networkButtons.forEach((button) => {
  button.addEventListener("click", () => setNetwork(button.dataset.network));
});

copyButton.addEventListener("click", () => copyValue(walletAddress, copyButton));
copyModalButton.addEventListener("click", () => copyValue(modalAddress, copyModalButton));

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal.classList.contains("is-open")) {
    closeModal();
  }
});

setNetwork(activeNetwork);

const canvas = document.querySelector("#ambientCanvas");
const ctx = canvas.getContext("2d", { alpha: false });
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const pointer = { x: 0.5, y: 0.48, tx: 0.5, ty: 0.48 };
let width = 0;
let height = 0;
let dpr = 1;
let animationFrame = 0;

function resizeCanvas() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function drawBackground(time = 0) {
  const t = time * 0.001;
  ctx.clearRect(0, 0, width, height);

  const base = ctx.createLinearGradient(0, 0, 0, height);
  base.addColorStop(0, "#101116");
  base.addColorStop(0.42, "#050506");
  base.addColorStop(1, "#020203");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, width, height);

  pointer.x += (pointer.tx - pointer.x) * 0.035;
  pointer.y += (pointer.ty - pointer.y) * 0.035;

  drawLiquidSheets(t);
  drawGlassReflections(t);
  drawLightSeams(t);
}

function drawLiquidSheets(t) {
  const pullX = (pointer.x - 0.5) * width * 0.08;
  const pullY = (pointer.y - 0.5) * height * 0.05;
  const sheets = [
    { y: 0.18, h: 0.24, amp: 54, speed: 0.24, alpha: 0.11, tint: "255,255,255" },
    { y: 0.42, h: 0.28, amp: 66, speed: -0.18, alpha: 0.09, tint: "118,228,255" },
    { y: 0.66, h: 0.26, amp: 58, speed: 0.16, alpha: 0.08, tint: "246,176,74" },
  ];

  ctx.save();
  ctx.globalCompositeOperation = "screen";

  sheets.forEach((sheet, index) => {
    const top = height * sheet.y + pullY * (index + 1) * 0.24;
    const depth = height * sheet.h;
    const phase = t * sheet.speed + index * 1.7;
    const gradient = ctx.createLinearGradient(0, top - depth, width, top + depth);
    gradient.addColorStop(0, `rgba(${sheet.tint}, 0)`);
    gradient.addColorStop(0.42, `rgba(${sheet.tint}, ${sheet.alpha})`);
    gradient.addColorStop(0.58, "rgba(255,255,255,0.045)");
    gradient.addColorStop(1, `rgba(${sheet.tint}, 0)`);

    ctx.save();
    ctx.filter = `blur(${30 + index * 10}px)`;
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(-160, top);

    for (let x = -160; x <= width + 160; x += 96) {
      const wave =
        Math.sin(x * 0.0048 + phase) * sheet.amp +
        Math.sin(x * 0.0105 - phase * 1.3) * (sheet.amp * 0.34) +
        pullX * (0.35 + index * 0.18);
      ctx.lineTo(x, top + wave);
    }

    for (let x = width + 160; x >= -160; x -= 96) {
      const wave =
        Math.sin(x * 0.0048 + phase + 1.8) * (sheet.amp * 0.72) +
        Math.sin(x * 0.0105 - phase) * (sheet.amp * 0.28) +
        pullX * (0.25 + index * 0.14);
      ctx.lineTo(x, top + depth + wave);
    }

    ctx.closePath();
    ctx.fill();
    ctx.restore();
  });

  ctx.restore();
}

function drawGlassReflections(t) {
  ctx.save();
  ctx.globalCompositeOperation = "screen";

  for (let i = 0; i < 4; i += 1) {
    const progress = i / 3;
    const y = height * (0.2 + progress * 0.58);
    const drift = Math.sin(t * 0.34 + i) * 28 + (pointer.x - 0.5) * 44;
    const gradient = ctx.createLinearGradient(0, y, width, y - height * 0.2);
    gradient.addColorStop(0, "rgba(255,255,255,0)");
    gradient.addColorStop(0.44, i === 1 ? "rgba(118,228,255,0.12)" : "rgba(255,255,255,0.11)");
    gradient.addColorStop(0.56, i === 2 ? "rgba(246,176,74,0.12)" : "rgba(255,255,255,0.08)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");

    ctx.strokeStyle = gradient;
    ctx.lineWidth = i === 0 ? 1.25 : 0.85;
    ctx.globalAlpha = 0.38 - progress * 0.06;
    ctx.beginPath();
    ctx.moveTo(width * -0.08, y + drift);
    ctx.bezierCurveTo(
      width * 0.22,
      y - 70 + Math.sin(t + i) * 24,
      width * 0.62,
      y + 44 + Math.cos(t * 0.72 + i) * 28,
      width * 1.08,
      y - 90 + drift * 0.42
    );
    ctx.stroke();
  }

  ctx.restore();
}

function drawLightSeams(t) {
  const seamGradient = ctx.createLinearGradient(0, height * 0.86, width, height * 0.24);
  seamGradient.addColorStop(0, "rgba(246, 176, 74, 0)");
  seamGradient.addColorStop(0.34, "rgba(246, 176, 74, 0.2)");
  seamGradient.addColorStop(0.5, "rgba(246, 176, 74, 0.72)");
  seamGradient.addColorStop(0.66, "rgba(118, 228, 255, 0.2)");
  seamGradient.addColorStop(1, "rgba(118, 228, 255, 0)");

  ctx.save();
  ctx.globalAlpha = 0.5 + Math.sin(t * 0.8) * 0.18;
  ctx.strokeStyle = seamGradient;
  ctx.lineWidth = 1.25;
  ctx.beginPath();
  ctx.moveTo(width * -0.08, height * 0.82);
  ctx.bezierCurveTo(
    width * 0.24,
    height * 0.75 + Math.sin(t) * 18,
    width * 0.56,
    height * 0.42,
    width * 1.08,
    height * 0.28
  );
  ctx.stroke();
  ctx.restore();
}

function animate(time) {
  drawBackground(time);

  if (!reducedMotion.matches) {
    animationFrame = window.requestAnimationFrame(animate);
  }
}

window.addEventListener("resize", () => {
  resizeCanvas();
  drawBackground();
});

window.addEventListener("pointermove", (event) => {
  pointer.tx = event.clientX / Math.max(width, 1);
  pointer.ty = event.clientY / Math.max(height, 1);
});

resizeCanvas();
animate(0);
