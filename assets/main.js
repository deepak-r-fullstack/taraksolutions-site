// Tarak Solutions homepage: mobile menu and contact form. No libraries needed.

// ---------- Settings ----------
// Free contact form service: get a key at https://web3forms.com (it is emailed to you)
// and paste it here. The key is safe to be public; it only lets people SEND you messages.
// Until a key is set, "Send message" opens the visitor's email app with the message filled in.
const WEB3FORMS_ACCESS_KEY = "";
const CONTACT_EMAIL = "deepakravikumar.dev@gmail.com";

// ---------- Mobile menu ----------
const menuButton = document.querySelector(".menu-button");
const siteNav = document.getElementById("site-nav");

function setMenuOpen(open) {
  menuButton.setAttribute("aria-expanded", String(open));
  siteNav.classList.toggle("is-open", open);
}

menuButton.addEventListener("click", () => {
  setMenuOpen(menuButton.getAttribute("aria-expanded") !== "true");
});
// Close the menu after picking a link, or with the Escape key.
siteNav.addEventListener("click", (event) => {
  if (event.target.closest("a")) setMenuOpen(false);
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenuOpen(false);
});

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
