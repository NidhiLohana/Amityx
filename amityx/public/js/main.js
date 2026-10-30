// Shared header/footer so every page stays consistent
const links = [["index.html","Home"],["about.html","About"],["products.html","Products"],["projects.html","Projects"],["contact.html","Contact"]];
const here = location.pathname.split("/").pop() || "index.html";
document.body.insertAdjacentHTML("afterbegin",
  `<header><div class="bar"><a class="logo" href="index.html">Amity<span>x</span></a><nav>` +
  links.map(([h,t]) => `<a href="${h}" class="${h===here?"on":""}">${t}</a>`).join("") +
  `</nav></div></header>`);
document.body.insertAdjacentHTML("beforeend",
  `<footer>© ${new Date().getFullYear()} Amityx. All rights reserved.</footer>`);

const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

// Render cards from the database (projects / products pages)
async function renderCards(endpoint, target, titleKey) {
  const el = document.getElementById(target);
  if (!el) return;
  try {
    const items = await (await fetch(endpoint)).json();
    el.innerHTML = items.map(i => `<div class="card"><div class="ic">${esc(i.icon)}</div><h3>${esc(i[titleKey])}</h3><p>${esc(i.description)}</p>` +
      (i.tags||"").split(",").filter(Boolean).map(t => `<span class="tag">${esc(t)}</span>`).join("") + `</div>`).join("");
  } catch { el.innerHTML = "<p>Could not load data.</p>"; }
}
renderCards("/api/projects", "projects-list", "title");
renderCards("/api/products", "products-list", "name");

// Contact form
const form = document.getElementById("cf");
if (form) form.addEventListener("submit", async e => {
  e.preventDefault();
  const st = document.getElementById("st");
  const body = Object.fromEntries(new FormData(form));
  try {
    const r = await fetch("/api/contact", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error);
    st.className = "msg ok"; st.textContent = "Thank you! Your message has been sent."; form.reset();
  } catch (err) { st.className = "msg err"; st.textContent = err.message || "Something went wrong."; }
});

// Admin inbox
const login = document.getElementById("login");
if (login) login.addEventListener("submit", async e => {
  e.preventDefault();
  const r = await fetch("/api/admin/messages", { headers:{ "x-admin-password": document.getElementById("pw").value } });
  const st = document.getElementById("st");
  if (!r.ok) { st.className = "msg err"; st.textContent = "Wrong password."; return; }
  st.className = "msg";
  document.getElementById("rows").innerHTML = (await r.json()).map(m =>
    `<tr><td>${esc(m.created_at)}</td><td>${esc(m.name)}</td><td>${esc(m.email)}</td><td>${esc(m.topic)}</td><td>${esc(m.message)}</td></tr>`).join("");
});
