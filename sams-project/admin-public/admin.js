document.addEventListener("DOMContentLoaded", () => {
  const splash = document.getElementById("splash");
  const heroSection = document.querySelector(".hero-section");
  const togglePassword = document.getElementById("togglePassword");
  const passwordField = document.getElementById("password");
  const form = document.getElementById("adminLoginForm");

  // Splash screen
  setTimeout(() => {
    splash.classList.add("fade-out");
    setTimeout(() => {
      splash.classList.add("hidden");
      heroSection.classList.remove("hidden");
    }, 1000);
  }, 2000);

  // Toggle password visibility
  togglePassword.addEventListener("click", () => {
    if (passwordField.type === "password") {
      passwordField.type = "text";
      togglePassword.textContent = "Hide";
    } else {
      passwordField.type = "password";
      togglePassword.textContent = "Show";
    }
  });

  // Admin login submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = passwordField.value;

    const res = await fetch("/login/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: username, password })
    });

    if (res.ok) {
      alert("Admin login successful");
      // redirect to admin dashboard
      window.location.href = "/admin/dashboard";
    } else {
      alert("Login failed. Check your credentials.");
    }
  });
});
