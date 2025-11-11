document.addEventListener("DOMContentLoaded", () => {
  const splash = document.getElementById("splash");
  const heroSection = document.querySelector(".hero-section");
  const togglePassword = document.getElementById("togglePassword");
  const passwordField = document.getElementById("password");
  const loginForm = document.querySelector("form");
  const roleSelect = document.getElementById("role");

  // === Splash screen fade ===
  setTimeout(() => {
    splash.classList.add("fade-out");
    setTimeout(() => {
      splash.classList.add("hidden");
      heroSection.classList.remove("hidden");
    }, 1000);
  }, 2500);

  // === Password visibility toggle ===
  togglePassword.addEventListener("click", () => {
    const isPassword = passwordField.type === "password";
    passwordField.type = isPassword ? "text" : "password";
    togglePassword.textContent = isPassword ? "Hide" : "Show";
  });

  // === Login form handling ===
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const role = roleSelect.value;

    if (!username || !password || !role) {
      alert("Please fill in all fields and select a role.");
      return;
    }

    try {
      // Send login request to backend
      const response = await fetch(`/login/${role}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();

      if (response.ok) {
        alert(`Welcome, ${role}! Redirecting...`);
        // Redirect based on role
        if (role === "admin") {
          window.location.href = "/admin.html";
        } else if (role === "teacher") {
          window.location.href = "/teacher.html";
        } else if (role === "student") {
          window.location.href = "/student.html";
        }
      } else {
        alert(result.message || "Invalid credentials. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Unable to connect to server. Please try again later.");
    }
  });
});
