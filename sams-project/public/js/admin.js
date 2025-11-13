document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  if (!token) { alert("Login first"); window.location.href = "index.html"; return; }

  const payload = JSON.parse(atob(token.split('.')[1]));
  document.querySelector(".welcome-text").textContent = `Welcome, ${payload.username}!`;

  // Load data
  await loadData(token);
});

async function loadData(token) {
  try {
    const users = await fetchData("users", token);
    console.log("Users:", users);
    // Render your admin cards / tables here
  } catch (err) {
    console.error(err);
  }
}

async function fetchData(endpoint, token) {
  const res = await fetch(`http://localhost:3000/api/admin/${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Failed to fetch " + endpoint);
  return res.json();
}
