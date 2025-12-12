# 🛡️ Password Strength Analyzer

LIVE DEMO : https://nachikethjanvekar.github.io/password-strength-analyzer/


## 📌 Overview
Password Strength Analyzer is a lightweight, fully client-side security tool that:

- Scores password strength in real-time (0–100)
- Shows a visual strength bar + labelled categories
- Highlights requirement checks (length, lowercase, uppercase, numbers, symbols)
- Generates strong random passwords with customizable rules
- Detects whether a password has appeared in known data breaches  
  *(via HaveIBeenPwned — using privacy-preserving k-anonymity hashing)*  
- Provides actionable suggestions to improve weak passwords

No backend. No data stored.  
**Everything runs inside your browser.**



## 🚀 Features

### 🟩 Real-Time Strength Analysis
- Dynamic score (0–100)
- Strength categories: *Very Weak → Very Strong*
- Animated strength bar
- Variety & length indicators

### ⚙️ Password Generator
- Adjustable length (8–32)
- Toggle character types:
  - a–z
  - A–Z
  - 0–9
  - Symbols (!@#$…)
- “Copy” button for convenience
  

### 🔍 Breach Check (HIBP)
Uses HaveIBeenPwned's **k-anonymity API**, meaning:

- Your password NEVER leaves your device  
- Only the first 5 characters of its SHA-1 hash are sent  
- Matching is done client-side  
- Shows how many times password appears in breaches (if any)



### 💡 Smart Suggestions
- Personalized tips based on password weaknesses
- Guidance for stronger & safer passwords
- Warnings for common or known-breached passwords




## 🛠️ Tech Stack

| Tech | Usage |
|------|-------|
| **HTML5** | Structure & layout |
| **CSS3** | Styling, animations, UI components |
| **JavaScript (Vanilla)** | Logic, scoring, generator, breach check |
| **Web Crypto API** | SHA-1 hashing for HIBP |
| **GitHub Pages** | Deployment |





