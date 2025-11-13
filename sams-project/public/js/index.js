document.addEventListener("DOMContentLoaded", () => {
  const splash = document.getElementById("splash");
  const heroSection = document.querySelector(".hero-section");
  const togglePassword = document.getElementById("togglePassword");
  const passwordField = document.getElementById("password");
  const loginForm = document.getElementById("loginForm");
  const roleField = document.getElementById("role");
  const emailField = document.getElementById("email");

  const roleError = document.getElementById("roleError");
  const emailError = document.getElementById("emailError");
  const passwordError = document.getElementById("passwordError");

  // Splash fade
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

  // Placeholder change
  roleField.addEventListener("change", () => {
    const role = roleField.value;
    if (role === "student") emailField.placeholder = "Student ID (numbers only)";
    else emailField.placeholder = "School Email";
  });

  // Login submit
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    let valid = true;

    // Reset errors
    [roleError, emailError, passwordError].forEach(el => el.textContent = '');
    [roleField, emailField, passwordField].forEach(el => el.classList.remove('invalid'));

    const role = roleField.value;
    const email = emailField.value.trim();
    const password = passwordField.value.trim();

    // Validation
    if (!role) { roleError.textContent = "Select role"; roleField.classList.add("invalid"); valid = false; }
    if (!email) { emailError.textContent = "Required"; emailField.classList.add("invalid"); valid = false; }
    if (!password) { passwordError.textContent = "Required"; passwordField.classList.add("invalid"); valid = false; }

    if (!valid) return;

    // Send login request
    try {
      const res = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Login failed");

      // Save token
      localStorage.setItem("token", data.token);

      // Redirect based on role
      if (role === "admin") window.location.href = "admin.html";
      if (role === "teacher") window.location.href = "teacher.html";
      if (role === "student") window.location.href = "student.html";

    } catch (err) {
      alert(err.message);
    }
  });
});
