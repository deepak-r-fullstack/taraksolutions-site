// Tarak Solutions homepage: theme, mobile menu, scroll reveal, voice assistant and contact form. No libraries needed.

// ---------- Settings ----------
// Free contact form service: get a key at https://web3forms.com (it is emailed to you)
// and paste it here. The key is safe to be public; it only lets people SEND you messages.
// Until a key is set, "Send message" opens the visitor's email app with the message filled in.
const WEB3FORMS_ACCESS_KEY = "";
const CONTACT_EMAIL = "deepakravikumar.dev@gmail.com";

// Deepak's voice assistant (ElevenLabs). Same agent as on the personal portfolio.
// The widget script is only downloaded when someone presses "Talk to Deepak's AI".
const ELEVENLABS_AGENT_ID = "agent_3101m693tybbfj2rr9pzkh408b2k";
const ELEVENLABS_SCRIPT_URL = "https://unpkg.com/@elevenlabs/convai-widget-embed";
const VOICE_AVATAR_URL = "https://sritaraksolutions.in/assets/img/deepak-avatar.webp";

const root = document.documentElement;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Storage can be blocked (private mode etc.), so every read and write is wrapped.
function readSavedTheme() {
  try {
    const saved = localStorage.getItem("theme");
    return saved === "light" || saved === "dark" ? saved : null;
  } catch {
    return null;
  }
}

// ---------- Mobile menu ----------
const menuButton = document.querySelector(".menu-button");
const siteNav = document.getElementById("site-nav");

function setMenuOpen(open) {
  menuButton.setAttribute("aria-expanded", String(open));
  siteNav.classList.toggle("is-open", open);
  updateVoiceButton();
}

menuButton.addEventListener("click", () => {
  setMenuOpen(menuButton.getAttribute("aria-expanded") !== "true");
});
// Close the menu after picking a link, or with the Escape key.
siteNav.addEventListener("click", (event) => {
  if (event.target.closest("a")) setMenuOpen(false);
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
    setMenuOpen(false);
    menuButton.focus();
  }
});

// ---------- Light and dark theme ----------
// <head> already set data-theme before the first paint. Here we only handle the toggle.
const themeButton = document.querySelector(".theme-toggle");

function applyTheme(theme) {
  root.setAttribute("data-theme", theme);
  themeButton.setAttribute("aria-label", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
}
applyTheme(root.getAttribute("data-theme") === "dark" ? "dark" : "light");

themeButton.addEventListener("click", () => {
  const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
  applyTheme(next);
  try {
    localStorage.setItem("theme", next);
  } catch {}
});
// With no saved choice, keep following the device setting.
const deviceDark = window.matchMedia("(prefers-color-scheme: dark)");
deviceDark.addEventListener?.("change", (event) => {
  if (!readSavedTheme()) applyTheme(event.matches ? "dark" : "light");
});

// ---------- Reveal sections as they scroll into view ----------
const revealItems = document.querySelectorAll("[data-reveal], [data-stagger]");
if (prefersReducedMotion || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
  );
  revealItems.forEach((item) => revealObserver.observe(item));
}

// ---------- Voice assistant ("Talk to Deepak's AI") ----------
const voiceButton = document.querySelector(".voice-fab");
const voiceStatus = document.querySelector(".voice-status");
let voiceState = "idle"; // idle, loading, ready
let contactInView = false;

// The floating button hides while the contact form or the menu is open, and once the widget is shown.
function updateVoiceButton() {
  const hide = contactInView || voiceState === "ready" || menuButton.getAttribute("aria-expanded") === "true";
  voiceButton.classList.toggle("is-hidden", hide);
}

function showVoiceMessage(message) {
  voiceStatus.textContent = message;
}

function mountVoiceWidget() {
  const widget = document.createElement("elevenlabs-convai");
  widget.setAttribute("agent-id", ELEVENLABS_AGENT_ID);
  widget.setAttribute("avatar-image-url", VOICE_AVATAR_URL);
  widget.setAttribute("avatar-orb-color-1", "#0f4c5c");
  widget.setAttribute("avatar-orb-color-2", "#b26a00");
  widget.setAttribute("default-expanded", "true");
  widget.setAttribute(
    "text-contents",
    JSON.stringify({
      main_label: "Talk to Deepak's AI",
      start_call: "Start a voice call",
      new_call: "Start a new call",
      end_call: "End the call",
    }),
  );
  document.body.appendChild(widget);
  voiceState = "ready";
  showVoiceMessage("");
  updateVoiceButton();
}

function openVoiceAssistant() {
  if (voiceState !== "idle") return;
  if (!ELEVENLABS_AGENT_ID) {
    showVoiceMessage(`The voice assistant is not switched on yet. Please email ${CONTACT_EMAIL}.`);
    return;
  }
  voiceState = "loading";
  showVoiceMessage("Loading the voice assistant…");
  const script = document.createElement("script");
  script.src = ELEVENLABS_SCRIPT_URL;
  script.async = true;
  script.onload = mountVoiceWidget;
  script.onerror = () => {
    voiceState = "idle";
    script.remove();
    showVoiceMessage(`The voice assistant could not load. Please email ${CONTACT_EMAIL}.`);
  };
  document.body.appendChild(script);
}

document.querySelectorAll("[data-voice-open]").forEach((button) => button.addEventListener("click", openVoiceAssistant));

if ("IntersectionObserver" in window) {
  new IntersectionObserver((entries) => {
    contactInView = entries[0].isIntersecting;
    updateVoiceButton();
  }).observe(document.getElementById("contact"));
}

// ---------- Footer year ----------
document.getElementById("year").textContent = String(new Date().getFullYear());

// ---------- Contact form ----------
const form = document.getElementById("contact-form");
const statusLine = form.querySelector(".form-status");
const submitButton = form.querySelector('button[type="submit"]');

function showStatus(message, tone) {
  statusLine.textContent = message;
  statusLine.classList.toggle("is-success", tone === "success");
  statusLine.classList.toggle("is-error", tone === "error");
}

// Checks each field and says exactly what to fix, next to the button.
function validate() {
  const checks = [
    { field: form.name, ok: form.name.value.trim().length >= 2, message: "Please tell us your name." },
    {
      field: form.email,
      ok: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.value.trim()),
      message: "Please check your email address.",
    },
    {
      field: form.message,
      ok: form.message.value.trim().length >= 10,
      message: "Please write a little more about what you need.",
    },
  ];
  checks.forEach(({ field, ok }) => field.setAttribute("aria-invalid", String(!ok)));
  const firstProblem = checks.find((check) => !check.ok);
  if (firstProblem) {
    firstProblem.field.focus();
    showStatus(firstProblem.message, "error");
    return false;
  }
  return true;
}

function openEmailApp() {
  const subject = encodeURIComponent(`Project enquiry from ${form.name.value.trim()}`);
  const body = encodeURIComponent(`${form.message.value.trim()}\n\nFrom: ${form.name.value.trim()} (${form.email.value.trim()})`);
  window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  showStatus("Your email app should open with the message ready. Press send there.", "success");
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (form.botcheck.value) return; // a bot filled the hidden field
  if (!validate()) return;

  if (!WEB3FORMS_ACCESS_KEY) {
    openEmailApp();
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Sending…";
  showStatus("", null);

  try {
    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: WEB3FORMS_ACCESS_KEY,
        subject: `New project enquiry from ${form.name.value.trim()}`,
        from_name: "Tarak Solutions website",
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        message: form.message.value.trim(),
      }),
    });
    const result = await response.json();
    if (!response.ok || !result.success) throw new Error(result.message || "send failed");
    form.reset();
    showStatus("Thank you. Your message is on its way, and we will reply by email.", "success");
  } catch {
    showStatus(`The message could not be sent. Please email ${CONTACT_EMAIL} directly.`, "error");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Send message";
  }
});
