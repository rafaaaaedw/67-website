const body = document.body;
const cursor = document.querySelector(".cursor-orbit");
const menuButton = document.querySelector(".menu-button");
const nav = document.querySelector(".site-header nav");
const modeButtons = document.querySelectorAll(".mode-button");
const signalStage = document.querySelector(".signal-stage");
const signalImages = document.querySelectorAll(".signal-image");
const signalCode = document.querySelector("#signalCode");
const modeDescription = document.querySelector("#modeDescription");
const transmissionButton = document.querySelector("#transmissionButton");
const transmissionOverlay = document.querySelector("#transmissionOverlay");
const overlayClose = document.querySelector(".overlay-close");
const generatePasswordButton = document.querySelector("#generatePassword");
const copyPasswordButton = document.querySelector("#copyPassword");
const generatedPassword = document.querySelector("#generatedPassword");
const passwordLength = document.querySelector("#passwordLength");
const passwordLengthValue = document.querySelector("#passwordLengthValue");
const passwordStatus = document.querySelector("#passwordStatus");

const PASSWORD_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
const RANDOM_BYTE_VALUES = 256;

const modes = {
  day: {
    code: "67_FRIENDLY.JPG",
    description: "Azul, simpático e estranhamente familiar.",
  },
  night: {
    code: "67_UNKNOWN.EXE",
    description: "Escuro, silencioso e definitivamente acordado.",
  },
};

const passwordMathElements = {
  combinationMantissa: document.querySelector("#combinationMantissa"),
  combinationExponent: document.querySelector("#combinationExponent"),
  combinationStat: document.querySelector("#combinationStat"),
  entropyStat: document.querySelector("#entropyStat"),
  spaceLengthText: document.querySelector("#spaceLengthText"),
  spaceLengthRepeat: document.querySelector("#spaceLengthRepeat"),
  spaceLengthPower: document.querySelector("#spaceLengthPower"),
  spaceMantissa: document.querySelector("#spaceMantissa"),
  spaceExponent: document.querySelector("#spaceExponent"),
  entropyLength: document.querySelector("#entropyLength"),
  entropyBits: document.querySelector("#entropyBits"),
};

const formatDecimal = (value, digits) =>
  new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);

const calculatePasswordStrength = (length) => {
  const logarithm = length * Math.log10(PASSWORD_ALPHABET.length);
  const exponent = Math.floor(logarithm);

  return {
    exponent,
    mantissa: 10 ** (logarithm - exponent),
    entropy: length * Math.log2(PASSWORD_ALPHABET.length),
  };
};

const updatePasswordMath = (length) => {
  const { exponent, mantissa, entropy } = calculatePasswordStrength(length);
  const mantissaText = formatDecimal(mantissa, 2);
  const entropyText = formatDecimal(entropy, 1);

  passwordLengthValue.textContent = String(length);
  passwordMathElements.combinationMantissa.textContent = mantissaText;
  passwordMathElements.combinationExponent.textContent = String(exponent);
  passwordMathElements.entropyStat.textContent = entropyText;
  passwordMathElements.spaceLengthText.textContent = String(length);
  passwordMathElements.spaceLengthRepeat.textContent = String(length);
  passwordMathElements.spaceLengthPower.textContent = String(length);
  passwordMathElements.spaceMantissa.textContent = mantissaText;
  passwordMathElements.spaceExponent.textContent = String(exponent);
  passwordMathElements.entropyLength.textContent = String(length);
  passwordMathElements.entropyBits.textContent = entropyText;
  passwordMathElements.combinationStat.setAttribute(
    "aria-label",
    `${mantissaText} vezes 10 elevado a ${exponent} combinações`,
  );
};

const createSecurePassword = (length) => {
  if (!window.crypto || typeof window.crypto.getRandomValues !== "function") {
    throw new Error("A fonte criptográfica do navegador não está disponível.");
  }

  const fairByteLimit =
    Math.floor(RANDOM_BYTE_VALUES / PASSWORD_ALPHABET.length) * PASSWORD_ALPHABET.length;
  const characters = [];

  while (characters.length < length) {
    const remaining = length - characters.length;
    const randomBytes = new Uint8Array(Math.max(remaining * 2, 32));
    window.crypto.getRandomValues(randomBytes);

    for (const randomByte of randomBytes) {
      if (randomByte >= fairByteLimit) continue;

      characters.push(PASSWORD_ALPHABET[randomByte % PASSWORD_ALPHABET.length]);
      if (characters.length === length) break;
    }
  }

  return characters.join("");
};

let copyFeedbackTimer;

const resetCopyFeedback = () => {
  window.clearTimeout(copyFeedbackTimer);
  copyPasswordButton.textContent = "Copiar";
};

const refreshPassword = () => {
  const length = Number(passwordLength.value);
  resetCopyFeedback();

  try {
    generatedPassword.value = createSecurePassword(length);
    copyPasswordButton.disabled = false;
    passwordStatus.textContent = `Nova senha de ${length} caracteres criada só neste dispositivo.`;
    generatedPassword.classList.remove("is-refreshing");
    void generatedPassword.offsetWidth;
    generatedPassword.classList.add("is-refreshing");
  } catch (error) {
    generatedPassword.value = "";
    copyPasswordButton.disabled = true;
    generatePasswordButton.disabled = true;
    passwordStatus.textContent = error.message;
  }
};

const copyGeneratedPassword = async () => {
  if (!generatedPassword.value) return;

  try {
    let copied = false;

    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(generatedPassword.value);
        copied = true;
      } catch {
        copied = false;
      }
    }

    if (!copied) {
      generatedPassword.focus();
      generatedPassword.select();
      copied = document.execCommand("copy");
      generatedPassword.setSelectionRange(0, 0);
    }

    if (!copied) throw new Error("Não foi possível copiar automaticamente.");

    copyPasswordButton.textContent = "Copiada ✓";
    passwordStatus.textContent =
      "Senha copiada. Guarde-a em um gerenciador e não reutilize em outros serviços.";
    copyFeedbackTimer = window.setTimeout(resetCopyFeedback, 2200);
  } catch (error) {
    generatedPassword.focus();
    generatedPassword.select();
    passwordStatus.textContent = `${error.message} Selecione a senha e copie manualmente.`;
  }
};

const updateClock = () => {
  const now = new Date();
  const value = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(now);
  document.querySelector("#liveTime").textContent = value;
};

updateClock();
setInterval(updateClock, 1000);
document.querySelector("#year").textContent = new Date().getFullYear();

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.14 },
);

document.querySelectorAll(".reveal").forEach((element, index) => {
  element.style.transitionDelay = `${Math.min((index % 4) * 65, 195)}ms`;
  observer.observe(element);
});

if (cursor && window.matchMedia("(pointer: fine)").matches) {
  window.addEventListener("pointermove", (event) => {
    cursor.classList.add("is-active");
    cursor.animate(
      { left: `${event.clientX}px`, top: `${event.clientY}px` },
      { duration: 320, fill: "forwards", easing: "cubic-bezier(.2,.8,.2,1)" },
    );
  });

  document.querySelectorAll("a, button, [data-tilt]").forEach((element) => {
    element.addEventListener("pointerenter", () => cursor.classList.add("is-hovering"));
    element.addEventListener("pointerleave", () => cursor.classList.remove("is-hovering"));
  });
}

const tiltCard = document.querySelector("[data-tilt]");
if (tiltCard && window.matchMedia("(pointer: fine)").matches) {
  tiltCard.addEventListener("pointermove", (event) => {
    const rect = tiltCard.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    tiltCard.style.transform = `rotate(-4deg) perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
  });

  tiltCard.addEventListener("pointerleave", () => {
    tiltCard.style.transform = "rotate(-4deg) perspective(800px) rotateY(0) rotateX(0)";
  });
}

menuButton.addEventListener("click", () => {
  const isOpen = body.classList.toggle("menu-open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
  menuButton.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
});

nav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    body.classList.remove("menu-open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Abrir menu");
  });
});

modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const mode = button.dataset.mode;

    modeButtons.forEach((item) => {
      const isActive = item === button;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    });

    signalStage.dataset.signalStage = mode;
    signalStage.classList.add("is-switching");
    signalImages.forEach((image) => {
      image.classList.toggle("is-active", image.classList.contains(`signal-image-${mode}`));
    });
    signalCode.textContent = modes[mode].code;
    modeDescription.textContent = modes[mode].description;

    window.setTimeout(() => signalStage.classList.remove("is-switching"), 360);
  });
});

if (
  generatePasswordButton &&
  copyPasswordButton &&
  generatedPassword &&
  passwordLength &&
  passwordLengthValue &&
  passwordStatus
) {
  updatePasswordMath(Number(passwordLength.value));
  refreshPassword();

  passwordLength.addEventListener("input", () => {
    const length = Number(passwordLength.value);
    updatePasswordMath(length);
    generatedPassword.value = "";
    copyPasswordButton.disabled = true;
    resetCopyFeedback();
    passwordStatus.textContent = `Comprimento ajustado para ${length}. Clique em gerar senha segura.`;
  });

  generatePasswordButton.addEventListener("click", refreshPassword);
  copyPasswordButton.addEventListener("click", copyGeneratedPassword);
}

let frame = 607;
setInterval(() => {
  frame += 1;
  const tail = String(frame % 100).padStart(2, "0");
  document.querySelector("#signalCounter").textContent = `00:00:06:${tail}`;
}, 1000);

const setOverlay = (open) => {
  transmissionOverlay.classList.toggle("is-open", open);
  transmissionOverlay.setAttribute("aria-hidden", String(!open));
  body.classList.toggle("overlay-open", open);
  if (open) {
    window.setTimeout(() => overlayClose.focus(), 650);
  } else {
    transmissionButton.focus();
  }
};

transmissionButton.addEventListener("click", () => setOverlay(true));
overlayClose.addEventListener("click", () => setOverlay(false));

transmissionOverlay.addEventListener("click", (event) => {
  if (event.target === transmissionOverlay) setOverlay(false);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && transmissionOverlay.classList.contains("is-open")) {
    setOverlay(false);
  }
});
