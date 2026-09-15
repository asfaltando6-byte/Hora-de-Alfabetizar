"use strict";

// Edite somente estes dois endereços quando os checkouts estiverem prontos.
const CHECKOUT_LINKS = Object.freeze({
  premium: "https://pay.cakto.com.br/3ce9a3r_1110401",
  basic: "https://pay.cakto.com.br/xrt9fot_1110344"
});

const SAMPLE_COUNT = 6;
const GALLERY_COUNT = 14;
const samplePath = (number) => `assets/images/sample-${String(number).padStart(2, "0")}.webp`;
const sampleTitles = Object.freeze([
  "Família silábica do B",
  "Ligue as sílabas",
  "Complete as palavras",
  "Forme as palavras",
  "Separe as sílabas",
  "Leia e marque"
]);
const sampleAlt = (number) => `Amostra ${number}: ${sampleTitles[number - 1]}`;
const galleryPath = (number) => `assets/images/gallery-${String(number).padStart(2, "0")}.webp`;
const galleryTitles = Object.freeze([
  "Pinte a sílaba inicial",
  "Organize as sílabas",
  "Complete com a sílaba",
  "Leia e ligue",
  "Circule a palavra correta",
  "Conte as sílabas",
  "Complete as frases",
  "Encontre as palavras",
  "Ortografia com M ou N",
  "Separação silábica",
  "Ordem alfabética",
  "Encontre as rimas",
  "Singular e plural",
  "Complete as frases"
]);

document.addEventListener("DOMContentLoaded", () => {
  applyCheckoutLinks();
  initCountdown();
  initImageFallbacks(document);
  initSampleViewer();
  initGallery();
  initLightbox();
  initFaq();
  initStickyCta();
  initPurchaseToast();
  initSmoothScroll();
  initRevealAnimations();
});

function applyCheckoutLinks() {
  document.querySelectorAll("[data-checkout]").forEach((link) => {
    const plan = link.dataset.checkout;
    if (CHECKOUT_LINKS[plan]) link.href = CHECKOUT_LINKS[plan];
  });
}

// countdown
function initCountdown() {
  const output = document.querySelector("#countdown");
  if (!output) return;

  const duration = 15 * 60 * 1000;
  const storageKey = "alfabetizacao-session-countdown";
  let endTime = Number(sessionStorage.getItem(storageKey));

  if (!Number.isFinite(endTime) || endTime <= Date.now()) {
    endTime = Date.now() + duration;
    sessionStorage.setItem(storageKey, String(endTime));
  }

  const render = () => {
    const remaining = Math.max(0, endTime - Date.now());
    const totalSeconds = Math.ceil(remaining / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    output.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    if (remaining <= 0) window.clearInterval(timer);
  };

  render();
  const timer = window.setInterval(render, 1000);
}

function initImageFallbacks(scope) {
  scope.querySelectorAll(".image-shell img").forEach((image) => {
    const markMissing = () => image.classList.add("is-missing");
    const markLoaded = () => image.classList.remove("is-missing");
    image.addEventListener("error", markMissing);
    image.addEventListener("load", markLoaded);
    if (image.complete) image.naturalWidth > 0 ? markLoaded() : markMissing();
  });
}

// sample viewer
function initSampleViewer() {
  const viewer = document.querySelector("#sampleViewer");
  if (!viewer) return;

  const image = viewer.querySelector("#sampleImage");
  const counter = viewer.querySelector(".sample-counter");
  const fallbackNumber = viewer.querySelector("#sampleFallbackNumber");
  const dotsContainer = viewer.querySelector(".sample-dots");
  const previousButton = viewer.querySelector(".sample-prev");
  const nextButton = viewer.querySelector(".sample-next");
  const stage = viewer.querySelector(".sample-viewer__stage");
  const autoplayToggle = viewer.querySelector(".autoplay-toggle");
  let current = 1;
  let touchStartX = 0;
  let autoplayTimer = 0;
  let userPaused = false;

  for (let index = 1; index <= SAMPLE_COUNT; index += 1) {
    const dot = document.createElement("button");
    dot.className = "sample-dot";
    dot.type = "button";
    dot.setAttribute("aria-label", `Ir para a página ${index}`);
    dot.addEventListener("click", () => { show(index); restartAutoplay(); });
    dotsContainer.append(dot);
  }

  const dots = [...dotsContainer.children];

  function show(number) {
    current = ((number - 1 + SAMPLE_COUNT) % SAMPLE_COUNT) + 1;
    image.classList.remove("is-missing");
    image.classList.remove("is-entering");
    void image.offsetWidth;
    image.classList.add("is-entering");
    image.src = samplePath(current);
    image.alt = sampleAlt(current);
    fallbackNumber.textContent = String(current);
    counter.textContent = `Página ${current} / ${SAMPLE_COUNT}`;
    dots.forEach((dot, index) => {
      const active = index + 1 === current;
      dot.classList.toggle("is-active", active);
      dot.setAttribute("aria-current", active ? "true" : "false");
    });
  }

  function startAutoplay() {
    if (userPaused) return;
    window.clearInterval(autoplayTimer);
    autoplayTimer = window.setInterval(() => show(current + 1), 3500);
    viewer.classList.remove("is-paused");
  }

  function pauseAutoplay() {
    window.clearInterval(autoplayTimer);
    viewer.classList.add("is-paused");
  }

  function restartAutoplay() {
    pauseAutoplay();
    startAutoplay();
  }

  previousButton.addEventListener("click", () => { show(current - 1); restartAutoplay(); });
  nextButton.addEventListener("click", () => { show(current + 1); restartAutoplay(); });
  stage.addEventListener("click", () => openLightbox(current, "sample"));
  viewer.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") { event.preventDefault(); show(current - 1); restartAutoplay(); }
    if (event.key === "ArrowRight") { event.preventDefault(); show(current + 1); restartAutoplay(); }
    if (event.key === "Enter" && event.target === viewer) openLightbox(current, "sample");
  });
  stage.addEventListener("touchstart", (event) => { touchStartX = event.changedTouches[0].clientX; }, { passive: true });
  stage.addEventListener("touchend", (event) => {
    const distance = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(distance) > 45) { show(distance > 0 ? current - 1 : current + 1); restartAutoplay(); }
  }, { passive: true });

  viewer.addEventListener("mouseenter", pauseAutoplay);
  viewer.addEventListener("mouseleave", startAutoplay);
  viewer.addEventListener("focusin", pauseAutoplay);
  viewer.addEventListener("focusout", (event) => {
    if (!viewer.contains(event.relatedTarget)) startAutoplay();
  });
  document.addEventListener("visibilitychange", () => document.hidden ? pauseAutoplay() : startAutoplay());
  autoplayToggle.addEventListener("click", () => {
    userPaused = !userPaused;
    autoplayToggle.setAttribute("aria-pressed", String(userPaused));
    autoplayToggle.textContent = userPaused ? "Continuar carrossel" : "Pausar carrossel";
    userPaused ? pauseAutoplay() : startAutoplay();
  });

  show(1);
  startAutoplay();
}

function createWorksheetFallback(number) {
  const fallback = document.createElement("span");
  fallback.className = "image-fallback worksheet-placeholder";
  fallback.setAttribute("aria-hidden", "true");
  fallback.innerHTML = `<small>ATIVIDADE DE ALFABETIZAÇÃO</small><strong>Amostra ${number}</strong><span class="worksheet-line"></span><span class="worksheet-line worksheet-line--short"></span><span class="syllable-row"><b>BA</b><b>BE</b><b>BI</b><b>BO</b><b>BU</b></span><span class="worksheet-boxes"><i></i><i></i><i></i></span>`;
  return fallback;
}

function initGallery() {
  const gallery = document.querySelector("#galleryGrid");
  if (!gallery) return;

  const fragment = document.createDocumentFragment();
  for (let index = 1; index <= GALLERY_COUNT; index += 1) {
    const button = document.createElement("button");
    button.className = "gallery-item image-shell reveal";
    button.type = "button";
    button.setAttribute("aria-label", `Ampliar atividade: ${galleryTitles[index - 1]}`);

    const image = document.createElement("img");
    image.src = galleryPath(index);
    image.alt = `Exemplo de atividade: ${galleryTitles[index - 1]}`;
    image.width = 778;
    image.height = 1100;
    image.loading = "lazy";
    const label = document.createElement("span");
    label.className = "gallery-item__label";
    label.textContent = galleryTitles[index - 1];
    button.append(image, createWorksheetFallback(index), label);
    button.addEventListener("click", () => openLightbox(index, "gallery"));
    fragment.append(button);
  }
  gallery.append(fragment);
  initImageFallbacks(gallery);
}

// lightbox
let lightboxState = { current: 1, collection: "sample", lastFocus: null };

function initLightbox() {
  const lightbox = document.querySelector("#lightbox");
  if (!lightbox) return;

  lightbox.querySelectorAll("[data-lightbox-close]").forEach((button) => button.addEventListener("click", closeLightbox));
  lightbox.querySelector(".lightbox__nav--prev").addEventListener("click", () => setLightboxImage(lightboxState.current - 1));
  lightbox.querySelector(".lightbox__nav--next").addEventListener("click", () => setLightboxImage(lightboxState.current + 1));
  lightbox.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft") setLightboxImage(lightboxState.current - 1);
    if (event.key === "ArrowRight") setLightboxImage(lightboxState.current + 1);
    if (event.key === "Tab") trapFocus(event, lightbox);
  });
}

function openLightbox(number, collection = "sample") {
  const lightbox = document.querySelector("#lightbox");
  lightboxState.lastFocus = document.activeElement;
  lightboxState.collection = collection;
  lightbox.hidden = false;
  document.body.classList.add("is-modal-open");
  setLightboxImage(number);
  lightbox.querySelector(".lightbox__close").focus();
}

function closeLightbox() {
  const lightbox = document.querySelector("#lightbox");
  if (!lightbox || lightbox.hidden) return;
  lightbox.hidden = true;
  document.body.classList.remove("is-modal-open");
  if (lightboxState.lastFocus instanceof HTMLElement) lightboxState.lastFocus.focus();
}

function setLightboxImage(number) {
  const lightbox = document.querySelector("#lightbox");
  const image = lightbox.querySelector("#lightboxImage");
  const isGallery = lightboxState.collection === "gallery";
  const count = isGallery ? GALLERY_COUNT : SAMPLE_COUNT;
  lightboxState.current = ((number - 1 + count) % count) + 1;
  image.classList.remove("is-missing");
  image.src = isGallery ? galleryPath(lightboxState.current) : samplePath(lightboxState.current);
  image.alt = isGallery ? `Exemplo de atividade: ${galleryTitles[lightboxState.current - 1]}` : sampleAlt(lightboxState.current);
  lightbox.querySelector("#lightboxFallback").textContent = `Amostra ${lightboxState.current}`;
  lightbox.querySelector("#lightboxCaption").textContent = isGallery
    ? `${galleryTitles[lightboxState.current - 1]} • ${lightboxState.current} de ${count}`
    : `${sampleTitles[lightboxState.current - 1]} • ${lightboxState.current} de ${count}`;
}

function trapFocus(event, container) {
  const focusable = [...container.querySelectorAll("button:not([disabled]), a[href]")].filter((element) => element.offsetParent !== null);
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
}

// faq
function initFaq() {
  document.querySelectorAll(".faq-item").forEach((item, index) => {
    const button = item.querySelector("button");
    const answer = item.querySelector(".faq-answer");
    const answerId = `faq-answer-${index + 1}`;
    answer.id = answerId;
    button.setAttribute("aria-controls", answerId);
    button.addEventListener("click", () => {
      const willOpen = !item.classList.contains("is-open");
      item.classList.toggle("is-open", willOpen);
      button.setAttribute("aria-expanded", String(willOpen));
    });
  });
}

// sticky CTA
function initStickyCta() {
  const sticky = document.querySelector("#mobileSticky");
  const hero = document.querySelector(".hero");
  if (!sticky || !hero) return;

  const update = () => {
    const show = window.innerWidth < 600 && window.scrollY > hero.offsetTop + hero.offsetHeight * 0.75;
    sticky.classList.toggle("is-visible", show);
    sticky.setAttribute("aria-hidden", String(!show));
    sticky.querySelector("a").tabIndex = show ? 0 : -1;
  };
  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
}

// purchase notification
function initPurchaseToast() {
  const toast = document.querySelector("#purchaseToast");
  if (!toast) return;

  const closeButton = toast.querySelector("button");
  const nameOutput = toast.querySelector("#purchaseName");
  const customers = Object.freeze([
    "Mariana Alves", "Gabriel Monteiro", "Camila Ferreira", "Lucas Ribeiro", "Juliana Martins",
    "Rafael Nogueira", "Beatriz Carvalho", "Felipe Andrade", "Amanda Rodrigues", "Bruno Tavares",
    "Larissa Moreira", "Matheus Cardoso", "Isabela Fernandes", "Thiago Almeida", "Renata Barbosa",
    "Gustavo Correia", "Letícia Azevedo", "Daniel Siqueira", "Natália Freitas", "Eduardo Menezes",
    "Carolina Farias", "Vinícius Teixeira", "Priscila Moura", "Leonardo Batista", "Fernanda Vasconcelos"
  ]);
  let hideTimer = 0;
  let nextTimer = 0;
  let currentCustomer = 0;
  const hide = () => {
    window.clearTimeout(hideTimer);
    toast.classList.remove("is-visible");
    window.setTimeout(() => { toast.hidden = true; }, 250);
  };
  const show = () => {
    nameOutput.textContent = customers[currentCustomer];
    currentCustomer = (currentCustomer + 1) % customers.length;
    toast.hidden = false;
    requestAnimationFrame(() => toast.classList.add("is-visible"));
    hideTimer = window.setTimeout(() => {
      hide();
      nextTimer = window.setTimeout(show, 9000);
    }, 6000);
  };

  closeButton.addEventListener("click", () => {
    window.clearTimeout(nextTimer);
    hide();
  });
  window.setTimeout(show, 6500);
}

// smooth scroll
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]:not([data-placeholder-link])').forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = document.querySelector(link.getAttribute("href"));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    });
  });
  document.querySelectorAll("[data-placeholder-link]").forEach((link) => link.addEventListener("click", (event) => event.preventDefault()));
}

function initRevealAnimations() {
  const elements = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    elements.forEach((element) => element.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: "0px 0px -40px" });
  elements.forEach((element) => observer.observe(element));
}
