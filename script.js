// Basic DOM refs
const passwordInput = document.getElementById("password");
const toggleVisibilityBtn = document.getElementById("toggleVisibility");
const strengthLabel = document.getElementById("strengthLabel");
const strengthScore = document.getElementById("strengthScore");

// Extended refs
const strengthBarFill = document.getElementById("strengthBarFill");

const pillLengthDot = document.getElementById("pillLengthDot");
const pillLengthText = document.getElementById("pillLengthText");
const pillVarietyDot = document.getElementById("pillVarietyDot");
const pillVarietyText = document.getElementById("pillVarietyText");
const pillCommonDot = document.getElementById("pillCommonDot");
const pillCommonText = document.getElementById("pillCommonText");

const reqLength = document.getElementById("reqLength");
const reqLower = document.getElementById("reqLower");
const reqUpper = document.getElementById("reqUpper");
const reqNumber = document.getElementById("reqNumber");
const reqSymbol = document.getElementById("reqSymbol");

const suggestionsList = document.getElementById("suggestionsList");

// Generator refs
const genLength = document.getElementById("genLength");
const genLengthVal = document.getElementById("genLengthVal");
const optLower = document.getElementById("optLower");
const optUpper = document.getElementById("optUpper");
const optNumbers = document.getElementById("optNumbers");
const optSymbols = document.getElementById("optSymbols");
const generateBtn = document.getElementById("generateBtn");
const copyBtn = document.getElementById("copyBtn");
const generatedOutput = document.getElementById("generatedOutput");

// Pwned status ref
const pwnedStatus = document.getElementById("pwnedStatus");

// Small common-password list (expandable)
const commonPasswords = [
  "123456","password","123456789","qwerty","abc123","111111","123123","password1","iloveyou","admin"
];

// Toggle show/hide
toggleVisibilityBtn.addEventListener("click", () => {
  const type = passwordInput.type === "password" ? "text" : "password";
  passwordInput.type = type;
  toggleVisibilityBtn.textContent = type === "password" ? "Show" : "Hide";
  toggleVisibilityBtn.setAttribute("aria-pressed", type !== "password");
  passwordInput.focus();
});

// Input listener
passwordInput.addEventListener("input", () => {
  updateAnalysis(passwordInput.value);
});

// Main analysis function
function updateAnalysis(password) {
  const length = password.length;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const isCommon = commonPasswords.includes(password.toLowerCase());

  // scoring
  let score = 0;
  score += Math.min(length * 2.5, 40); // length contribution (max 40)
  if (hasLower) score += 10;
  if (hasUpper) score += 10;
  if (hasNumber) score += 10;
  if (hasSymbol) score += 10;
  if (length >= 16) score += 10; // bonus
  if (isCommon) score = Math.min(score, 25); // cap if very common

  score = Math.round(Math.max(0, Math.min(score, 100)));

  const { label, colorGradient } = getStrengthLabelAndColor(score);
  strengthLabel.textContent = `Strength: ${label}`;
  strengthScore.textContent = `Score: ${score} / 100`;

  strengthBarFill.style.width = score + "%";
  strengthBarFill.style.background = colorGradient;
  strengthBarFill.style.boxShadow = score > 0 ? "0 10px 25px rgba(0,0,0,0.45)" : "none";

  updatePills(length, hasLower, hasUpper, hasNumber, hasSymbol, isCommon);
  updateRequirements({ length, hasLower, hasUpper, hasNumber, hasSymbol });
  updateSuggestions({ length, hasLower, hasUpper, hasNumber, hasSymbol, isCommon }, password);

  // <-- Call the pwned check scheduler (debounced)
  schedulePwnedCheck(password);
}

function getStrengthLabelAndColor(score) {
  if (score === 0) return { label: "—", colorGradient: "linear-gradient(90deg,#111827,#111827)" };
  if (score <= 25) return { label: "Very Weak", colorGradient: "linear-gradient(90deg,#ef4444,#f87171)" };
  if (score <= 50) return { label: "Weak", colorGradient: "linear-gradient(90deg,#f97316,#f59e0b)" };
  if (score <= 75) return { label: "Strong", colorGradient: "linear-gradient(90deg,#f59e0b,#eab308)" };
  return { label: "Very Strong", colorGradient: "linear-gradient(90deg,#16a34a,#22c55e)" };
}

function updatePills(length, hasLower, hasUpper, hasNumber, hasSymbol, isCommon) {
  if (length === 0) setPill(pillLengthDot, pillLengthText, "bad", "Empty");
  else if (length < 8) setPill(pillLengthDot, pillLengthText, "bad", "Too short");
  else if (length < 12) setPill(pillLengthDot, pillLengthText, "warn", "Okay length");
  else setPill(pillLengthDot, pillLengthText, "ok", "Great length");

  const varietyCount = [hasLower, hasUpper, hasNumber, hasSymbol].filter(Boolean).length;
  if (varietyCount <= 1) setPill(pillVarietyDot, pillVarietyText, "bad", "Low variety");
  else if (varietyCount === 2) setPill(pillVarietyDot, pillVarietyText, "warn", "Average variety");
  else setPill(pillVarietyDot, pillVarietyText, "ok", "High variety");

  if (!length) setPill(pillCommonDot, pillCommonText, "warn", "Not checked");
  else if (isCommon) setPill(pillCommonDot, pillCommonText, "bad", "Very common");
  else setPill(pillCommonDot, pillCommonText, "ok", "Not common");
}

function setPill(dotEl, textEl, status, text) {
  dotEl.classList.remove("ok", "bad", "warn");
  dotEl.classList.add(status === "ok" ? "ok" : status === "bad" ? "bad" : "warn");
  textEl.textContent = text;
}

function updateRequirements({ length, hasLower, hasUpper, hasNumber, hasSymbol }) {
  setRequirementItem(reqLength, length >= 12);
  setRequirementItem(reqLower, hasLower);
  setRequirementItem(reqUpper, hasUpper);
  setRequirementItem(reqNumber, hasNumber);
  setRequirementItem(reqSymbol, hasSymbol);
}

function setRequirementItem(liElement, isOk) {
  liElement.classList.toggle("ok", isOk);
  liElement.classList.toggle("bad", !isOk);
  const iconSpan = liElement.querySelector(".icon");
  if (iconSpan) iconSpan.textContent = isOk ? "✔" : "✖";
}

function updateSuggestions(state, password) {
  const { length, hasLower, hasUpper, hasNumber, hasSymbol, isCommon } = state;
  suggestionsList.innerHTML = "";

  if (!password) {
    const li = document.createElement("li");
    li.textContent = "Use a mix of words, numbers and symbols. Avoid using your name or birth date.";
    suggestionsList.appendChild(li);
    return;
  }

  const suggestions = [];
  if (length < 12) suggestions.push("Increase the length to at least 12 characters.");
  else if (length < 16) suggestions.push("Consider using 16+ characters for important accounts.");

  if (!hasLower || !hasUpper) suggestions.push("Use both lowercase and uppercase letters.");
  if (!hasNumber) suggestions.push("Add numbers in non-obvious places (not just at the end).");
  if (!hasSymbol) suggestions.push("Add special characters like !, @, #, $ in the middle of the password.");

  if (isCommon) suggestions.push("This password is very common. Change it to something unique.");
  if (!isCommon && length >= 12 && hasLower && hasUpper && hasNumber && hasSymbol) {
    suggestions.push("Nice! It's strong. Use a password manager to store it safely.");
  }

  suggestions.forEach(text => {
    const li = document.createElement("li");
    li.textContent = text;
    suggestionsList.appendChild(li);
  });
}

/* ---------- Generator ---------- */

genLength.addEventListener("input", () => {
  genLengthVal.textContent = genLength.value;
});

const CHAR_LOWER = "abcdefghijklmnopqrstuvwxyz";
const CHAR_UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const CHAR_NUMBER = "0123456789";
const CHAR_SYMBOL = "!@#$%^&*()-_=+[]{};:,.<>/?";

function randomChar(str) {
  return str.charAt(Math.floor(Math.random() * str.length));
}

function shuffleString(s) {
  const arr = s.split("");
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join("");
}

function generatePassword(length = 16, { lower=true, upper=true, numbers=true, symbols=true } = {}) {
  let pool = "";
  if (lower) pool += CHAR_LOWER;
  if (upper) pool += CHAR_UPPER;
  if (numbers) pool += CHAR_NUMBER;
  if (symbols) pool += CHAR_SYMBOL;

  if (!pool) return "";

  const required = [];
  if (lower) required.push(randomChar(CHAR_LOWER));
  if (upper) required.push(randomChar(CHAR_UPPER));
  if (numbers) required.push(randomChar(CHAR_NUMBER));
  if (symbols) required.push(randomChar(CHAR_SYMBOL));

  const remainingLength = Math.max(0, length - required.length);
  let result = required.join("");

  for (let i = 0; i < remainingLength; i++) {
    result += randomChar(pool);
  }

  result = shuffleString(result);
  return result;
}

generateBtn.addEventListener("click", () => {
  const length = parseInt(genLength.value, 10) || 16;
  const pwd = generatePassword(length, {
    lower: optLower.checked,
    upper: optUpper.checked,
    numbers: optNumbers.checked,
    symbols: optSymbols.checked
  });
  generatedOutput.value = pwd;
  passwordInput.value = pwd;
  updateAnalysis(pwd);
  copyBtn.focus();
});

copyBtn.addEventListener("click", async () => {
  const txt = generatedOutput.value || passwordInput.value;
  if (!txt) {
    const prev = copyBtn.textContent;
    copyBtn.textContent = "Nothing!";
    setTimeout(() => (copyBtn.textContent = prev), 900);
    return;
  }
  try {
    await navigator.clipboard.writeText(txt);
    const prev = copyBtn.textContent;
    copyBtn.textContent = "Copied!";
    setTimeout(() => (copyBtn.textContent = prev), 1200);
  } catch (err) {
    // fallback
    generatedOutput.select();
    document.execCommand("copy");
    const prev = copyBtn.textContent;
    copyBtn.textContent = "Copied!";
    setTimeout(() => (copyBtn.textContent = prev), 1200);
  }
});

/* ---------- HIBP Pwned Passwords check (k-Anonymity) ---------- */

// debounce handle
let pwnedTimer = null;
const PWNED_DEBOUNCE_MS = 700;

/**
 * Compute SHA-1 hex (uppercase) of given string using SubtleCrypto.
 * Returns uppercase hex string.
 */
async function sha1HexUpper(text) {
  const enc = new TextEncoder();
  const data = enc.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-1", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("").toUpperCase();
}

/**
 * Check if password has been pwned.
 * Returns the count (integer) of times seen in HIBP; 0 means not found.
 *
 * Uses k-anonymity: send first5 chars of SHA1 hash to HIBP range API,
 * then locally match suffixes returned (case-insensitive).
 */
async function checkPwned(password) {
  if (!password) return 0;
  const sha1 = await sha1HexUpper(password);
  const prefix = sha1.slice(0, 5);
  const suffix = sha1.slice(5);

  const url = `https://api.pwnedpasswords.com/range/${prefix}`;
  const res = await fetch(url, { method: "GET", cache: "force-cache" });
  if (!res.ok) throw new Error(`HIBP API returned ${res.status}`);
  const text = await res.text();
  const lines = text.split(/\r?\n/);
  for (const line of lines) {
    if (!line) continue;
    const [returnedSuffix, countStr] = line.split(":");
    if (!returnedSuffix) continue;
    if (returnedSuffix.toUpperCase() === suffix.toUpperCase()) {
      const count = parseInt(countStr.replace(/\D/g, ""), 10) || 0;
      return count;
    }
  }
  return 0;
}

// schedule debounced check and update UI
function schedulePwnedCheck(password) {
  if (pwnedTimer) clearTimeout(pwnedTimer);

  if (!password) {
    pwnedStatus.textContent = "Not checked";
    pwnedStatus.className = "pwned-status";
    return;
  }

  pwnedStatus.textContent = "Checking breaches…";
  pwnedStatus.className = "pwned-status checking";

  pwnedTimer = setTimeout(async () => {
    try {
      const count = await checkPwned(password);
      if (count > 0) {
        pwnedStatus.textContent = `Seen ${count.toLocaleString()} times in breaches — change this password.`;
        pwnedStatus.className = "pwned-status pwned";
      } else {
        pwnedStatus.textContent = "Not found in known breaches (good) — still use unique, long passwords.";
        pwnedStatus.className = "pwned-status safe";
      }
    } catch (err) {
      console.warn("pwned check failed:", err);
      pwnedStatus.textContent = "Breach check unavailable (network/CORS). Try again later or use server-side check.";
      pwnedStatus.className = "pwned-status";
    }
  }, PWNED_DEBOUNCE_MS);
}

// initialize
updateAnalysis("");
genLengthVal.textContent = genLength.value;
