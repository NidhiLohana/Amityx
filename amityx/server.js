const express = require("express");
const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "change-me";

const db = new Database(path.join(__dirname, "db", "amityx.db"));
db.exec(fs.readFileSync(path.join(__dirname, "db", "schema.sql"), "utf8"));

// Seed sample data on first run (edit these or change rows in the DB)
if (db.prepare("SELECT COUNT(*) c FROM projects").get().c === 0) {
  const p = db.prepare("INSERT INTO projects (title,description,icon,tags) VALUES (?,?,?,?)");
  [
    ["Retail Recommendation Engine", "Personalised product suggestions that lifted conversion.", "🛒", "ML,E-commerce"],
    ["Clinic Appointment Assistant", "Multilingual AI scheduler that cut no-shows.", "🏥", "Chatbot,Healthcare"],
    ["Logistics Route Optimiser", "Predictive routing that reduced delivery time and fuel cost.", "🚚", "Optimisation"],
    ["Invoice Data Extraction", "OCR plus AI to capture invoice data automatically.", "🏦", "OCR,Finance"],
    ["Voice Feedback Analyser", "Speech-to-text and sentiment analysis for call centres.", "🎙️", "Speech"],
    ["Fitness Coaching App", "Mobile app with AI-generated workout plans.", "📱", "Mobile"]
  ].forEach(r => p.run(...r));
}
if (db.prepare("SELECT COUNT(*) c FROM products").get().c === 0) {
  const p = db.prepare("INSERT INTO products (name,description,icon,tags) VALUES (?,?,?,?)");
  [
    ["AmityChat", "Conversational AI assistant for customer support.", "💬", "NLP,Web"],
    ["AmityDocs", "Summarise, search and query your documents.", "📝", "Document AI"],
    ["AmityInsights", "Dashboards with predictive analytics.", "📈", "Analytics"],
    ["AmityLearn", "Adaptive learning companion for students.", "🎓", "EdTech"]
  ].forEach(r => p.run(...r));
}

const app = express();
app.use(express.json({ limit: "20kb" }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/projects", (req, res) => res.json(db.prepare("SELECT * FROM projects").all()));
app.get("/api/products", (req, res) => res.json(db.prepare("SELECT * FROM products").all()));

// Simple in-memory rate limit: 5 messages per IP per 10 minutes
const hits = new Map();
app.post("/api/contact", (req, res) => {
  const now = Date.now(), ip = req.ip;
  const recent = (hits.get(ip) || []).filter(t => now - t < 600000);
  if (recent.length >= 5) return res.status(429).json({ error: "Too many messages. Try again later." });
  const { name, email, topic, message } = req.body || {};
  if (!name || !message || !/^\S+@\S+\.\S+$/.test(email || ""))
    return res.status(400).json({ error: "Please provide a name, valid email and message." });
  db.prepare("INSERT INTO messages (name,email,topic,message) VALUES (?,?,?,?)")
    .run(String(name).slice(0, 80), String(email).slice(0, 120), String(topic || "").slice(0, 60), String(message).slice(0, 2000));
  recent.push(now); hits.set(ip, recent);
  res.json({ ok: true });
});

// Admin: view messages (header x-admin-password must match ADMIN_PASSWORD)
app.get("/api/admin/messages", (req, res) => {
  if (req.get("x-admin-password") !== ADMIN_PASSWORD) return res.status(401).json({ error: "Unauthorized" });
  res.json(db.prepare("SELECT * FROM messages ORDER BY id DESC").all());
});

app.listen(PORT, () => console.log(`Amityx running at http://localhost:${PORT}`));
