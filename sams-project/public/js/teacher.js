document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  if (!token) { alert("Login first"); window.location.href = "index.html"; return; }

  const payload = JSON.parse(atob(token.split('.')[1]));
  document.querySelector(".welcome-text").textContent = `Welcome, ${payload.username}!`;

  const sectionLinks = document.querySelectorAll(".sidebar nav ul li a");
  const sections = document.querySelectorAll(".content-section");

  sectionLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      sectionLinks.forEach(l => l.classList.remove("active"));
      link.classList.add("active");
      sections.forEach(sec => sec.classList.remove("active"));
      document.getElementById(link.dataset.section).classList.add("active");
    });
  });

  // Load teacher data
  const classes = await fetchData("teacher/classes", token);
  document.getElementById("totalClasses").textContent = `Classes: ${classes.length}`;
  renderClasses(classes);
});

function renderClasses(classes) {
  const container = document.getElementById("classesContainer");
  container.innerHTML = "";
  classes.forEach(c => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `<strong>${c.name}</strong> - ${c.section}`;
    container.appendChild(div);
  });
}

async function fetchData(endpoint, token) {
  const res = await fetch(`http://localhost:3000/api/${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Failed to fetch " + endpoint);
  return res.json();
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "index.html";
}
document.getElementById("logoutBtn").addEventListener("click", logout);