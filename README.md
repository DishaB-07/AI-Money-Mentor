# 🏦 DhanSetu — Your AI Money Mentor

> **ET Gen AI Hackathon 2026 | Phase 2 Submission**

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen)](https://ai.studio/apps/540f27b4-ab4d-41d7-9f5e-406401a6d61d?fullscreenApplet=true)
[![GitHub](https://img.shields.io/badge/GitHub-AI--Money--Mentor-blue)](https://github.com/DishaB-07/AI-Money-Mentor)

---

## 🎯 Problem

Most Indians don't know where their money goes, how much tax they can save, or when they can retire.

**DhanSetu fixes that** — instant, personalized financial guidance powered by AI. No CA. No jargon. No cost.

---

## ✨ Features

| Feature | What it does |
|---|---|
| 💯 **Money Health Score** | Scores your finances 0–100 with actionable fixes |
| 🔥 **FIRE Planner** | Tells you exactly when you can retire |
| 🧾 **Tax Wizard** | Finds missed deductions, compares old vs new regime |
| 💑 **Couple's Planner** | Joint financial planning for two |
| 📊 **MF Portfolio X-Ray** | Upload CAMS → AI spots overlap & suggests rebalancing |
| 💬 **AI Chat Mentor** | Ask anything about your money, get real answers |

---

## 🛠️ Tech Stack

```
Frontend   →  React + Vite + TypeScript
AI         →  Google Gemini API (gemini-2.0-flash)
Auth       →  Firebase Authentication
Database   →  Firestore
Backend    →  Node.js + Express
```

---

## 🚀 Run Locally

```bash
# Clone
git clone https://github.com/DishaB-07/AI-Money-Mentor.git
cd AI-Money-Mentor

# Install
npm install

# Configure — copy .env.example to .env and add your keys
cp .env.example .env

# Run
npm run dev
```

App → `http://localhost:3000`

---

## 📁 Project Structure

```
src/
├── pages/      # FIRE, Tax, Couple, Portfolio, Health Score
├── services/   # Gemini API + Firebase
├── lib/        # Utilities
├── App.tsx
└── main.tsx
server.ts       # Express backend
```

---

## 🤖 How It Works

1. User inputs financial data (or uploads CAMS PDF)
2. Server builds an India-specific prompt
3. Gemini AI generates personalized analysis
4. Results rendered in UI + saved to Firestore history

---

## 💡 Impact

- **₹18,000–₹45,000** in tax savings found per user
- **~5 hours** saved vs manual research
- **₹0** cost to user (vs ₹2,000–₹5,000 for a CA)

---

## 👥 Team SJ AI

## Team Members
 **Disha Borse** [@DishaB-07](https://github.com/DishaB-07)
 
 **Piyush Borse** [@piyushsb007](https://github.com/piyushsb007)

---

## 📄 License

MIT 
