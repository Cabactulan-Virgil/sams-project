document.addEventListener("DOMContentLoaded", () => {
  const splash = document.getElementById("splash");
  const heroSection = document.querySelector(".hero-section");
  const togglePassword = document.getElementById("togglePassword");
  const passwordField = document.getElementById("password");
  const loginForm = document.getElementById("loginForm");

  // Splash screen animation
  setTimeout(() => {
    splash.classList.add("fade-out");
    setTimeout(() => {
      splash.classList.add("hidden");
      heroSection.classList.remove("hidden");
    }, 1000);
  }, 2500);

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

  // Handle login and redirection
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const role = document.getElementById("role").value;

    if (!role) {
      alert("Please select your role.");
      return;
    }

    // For now, just simulate redirect (you can later connect this to backend)
    if (role === "admin") {
      window.location.href = "admin.html";
    } else if (role === "teacher") {
      window.location.href = "teacher.html";
    } else if (role === "student") {
      window.location.href = "student.html";
    }
  });
});
