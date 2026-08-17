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
