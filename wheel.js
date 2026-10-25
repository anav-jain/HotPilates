// ===========================
// WHEEL CONFIG
// ===========================
const items = [
  "Zara Co-Ord Set",
  "Rhode",
  "Dior Lip Oil",
  "Cash Prize",
  "Better Luck\nNext Time"
];

// Colours drawn from the site theme palette
const SEGMENT_COLORS = [
  "#FFE9EF",  // blush pink
  "#93C572",  // pistachio green
  "#F5F5DC",  // cream
  "#f7c5d0",  // deeper pink
  "#b8dea0",  // lighter green
];

const TEXT_COLOR = "#3a2e35";

// ===========================
// SETUP
// ===========================
const canvas    = document.getElementById("wheelCanvas");
const ctx       = canvas.getContext("2d");
const spinBtn   = document.getElementById("spinBtn");
const overlay   = document.getElementById("resultOverlay");
const resultTxt = document.getElementById("resultText");

const NUM_SEGMENTS = items.length;
const ARC          = (2 * Math.PI) / NUM_SEGMENTS;
const CX           = canvas.width  / 2;
const CY           = canvas.height / 2;
const RADIUS       = CX - 8;        // slight inset from border

let currentAngle = 0;   // current rotation offset in radians
let hasSpun      = false;

// ===========================
// DRAW WHEEL
// ===========================
function drawWheel(rotation) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < NUM_SEGMENTS; i++) {
    const startAngle = rotation + i * ARC;
    const endAngle   = startAngle + ARC;

    // --- Segment fill ---
    ctx.beginPath();
    ctx.moveTo(CX, CY);
    ctx.arc(CX, CY, RADIUS, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = SEGMENT_COLORS[i % SEGMENT_COLORS.length];
    ctx.fill();

    // --- Segment border ---
    ctx.strokeStyle = "rgba(255,255,255,0.7)";
    ctx.lineWidth   = 2.5;
    ctx.stroke();

    // --- Label ---
    ctx.save();
    ctx.translate(CX, CY);
    ctx.rotate(startAngle + ARC / 2);

    const label = items[i];
    const lines = label.split("\n");

    ctx.textAlign    = "right";
    ctx.fillStyle    = TEXT_COLOR;
    ctx.font         = `bold ${canvas.width < 380 ? 12 : 14}px 'Outfit', sans-serif`;

    const lineHeight = 18;
    const textRadius = RADIUS * 0.72;

    lines.forEach((line, li) => {
      const yOffset = (li - (lines.length - 1) / 2) * lineHeight;
      ctx.fillText(line, textRadius, yOffset + 4);
    });

    ctx.restore();
  }

  // Outer rim
  ctx.beginPath();
  ctx.arc(CX, CY, RADIUS, 0, 2 * Math.PI);
  ctx.strokeStyle = "#93C572";
  ctx.lineWidth   = 5;
  ctx.stroke();
}

// Initial draw
drawWheel(currentAngle);

// ===========================
// SPIN LOGIC
// ===========================
spinBtn.addEventListener("click", () => {
  if (hasSpun) return;
  hasSpun = true;
  spinBtn.disabled = true;

  // Pick a random target segment (0 to NUM_SEGMENTS-1)
  const winIndex = Math.floor(Math.random() * NUM_SEGMENTS);

  // Compute target rotation so that the winning segment's centre aligns with the pointer at -π/2
  const targetRotation = -Math.PI / 2 - (winIndex * ARC + ARC / 2);
  // Ensure we rotate in the positive (clockwise) direction by adding enough full spins
  const totalSpins = 6 + Math.random() * 4; // 6‑10 full rotations
  const totalRotation = totalSpins * 2 * Math.PI + ((targetRotation - currentAngle + 2 * Math.PI) % (2 * Math.PI));

  const duration   = 5000;  // ms
  const startTime  = performance.now();
  const startAngle = currentAngle;

  function easeOut(t) {
    return 1 - Math.pow(1 - t, 4);  // quartic ease-out
  }

  function animate(now) {
    const elapsed  = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased    = easeOut(progress);

    currentAngle = startAngle + totalRotation * eased;
    drawWheel(currentAngle);

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      // Spin done — show result
      onSpinComplete(winIndex);
    }
  }

  requestAnimationFrame(animate);
});

// ===========================
// RESULT & REDIRECT
// ===========================
function onSpinComplete(winIndex) {
  // Determine the displayed prize based on the final wheel angle
  const normalizedAngle = ( -Math.PI / 2 - currentAngle + 2 * Math.PI ) % (2 * Math.PI);
  const displayedIndex = Math.floor(normalizedAngle / ARC) % NUM_SEGMENTS;
  const prize = items[displayedIndex].replace("\n", " ");
  resultTxt.textContent = prize;
  overlay.classList.remove("hidden");

  // If the prize is "Better Luck Next Time", allow another spin
  if (prize.includes("Better Luck")) {
    setTimeout(() => {
      overlay.classList.add("hidden");
      const loaderFill = document.querySelector(".loader-fill");
      if (loaderFill) { loaderFill.style.animation = "none"; void loaderFill.offsetWidth; loaderFill.style.animation = ""; }
      hasSpun = false;
      spinBtn.disabled = false;
    }, 2500);
  } else {
    setTimeout(() => {
      window.location.href = "yearbook.html";
    }, 3500);
  }
}
