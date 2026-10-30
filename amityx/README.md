# Amityx Website

Node.js + Express + SQLite company website.

## Run it
1. Install Node.js 18+ from https://nodejs.org
2. In this folder run:
   npm install
   ADMIN_PASSWORD=yourSecret npm start      (Windows PowerShell: $env:ADMIN_PASSWORD="yourSecret"; npm start)
3. Open http://localhost:3000

## Structure
- server.js        Express server and API
- db/schema.sql    Database tables (SQLite file db/amityx.db is created automatically)
- public/*.html    Pages: index, about, products, projects, contact, admin
- public/css       Styles
- public/js        Shared navigation, data loading, contact form, admin inbox

## Customise
- Projects and products are rows in the database; edit the seed lists in server.js
  (before first run) or use a SQLite tool such as DB Browser for SQLite on db/amityx.db.
- Read contact messages at http://localhost:3000/admin.html using your ADMIN_PASSWORD.
- Change the email, phone and team details directly in the HTML files.

## Deploy
Host on any Node platform (Render, Railway, a VPS). Set ADMIN_PASSWORD as an environment variable
and serve over HTTPS.
