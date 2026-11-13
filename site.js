const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector(".primary-nav");
if (menuButton && nav) {
  menuButton.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  });
  nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
    nav.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open navigation");
  }));
}
const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();
const form = document.getElementById("enquiry-form");
const status = document.getElementById("form-status");
if (form) form.addEventListener("submit", event => {
  event.preventDefault();
  const data = new FormData(form);
  if (data.get("company_website")) return;
  const name = String(data.get("name") || "").trim();
  const email = String(data.get("email") || "").trim();
  const organisation = String(data.get("organisation") || "").trim();
  const interest = String(data.get("interest") || "").trim();
  const message = String(data.get("message") || "").trim();
  const subject = encodeURIComponent("Website enquiry: " + interest);
  const body = encodeURIComponent("Name: " + name + "\nWork email: " + email + "\nOrganisation: " + organisation + "\nInterest: " + interest + "\n\n" + message);
  status.textContent = "Your email app should open with this enquiry. Send the email there to complete your request.";
  window.location.href = "mailto:hello@citrine.com.my?subject=" + subject + "&body=" + body;
});
