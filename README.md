# 🛡️ Password Strength Analyzer

LIVE DEMO : https://nachikethjanvekar.github.io/password-strength-analyzer/

A lightweight, client-side web app that analyzes password strength in real time, suggests improvements, includes a one-click password generator, and checks whether a password has appeared in known breaches using the Have I Been Pwned (k-anonymity) API.

## Features
- Live strength score (0–100) with animated color bar
- Requirements checklist (length, lowercase, uppercase, numbers, symbols)
- Quick summary pills (length, variety, common)
- Contextual suggestions to improve passwords
- Password generator (length & options) + copy-to-clipboard
- Privacy-friendly breach check using HIBP k-anonymity (only first 5 chars of SHA-1 sent)

## Tech
- HTML, CSS, vanilla JavaScript (no frameworks)
- Uses Web Crypto API (`crypto.subtle`) for SHA-1 hashing
- Runs 100% in the browser — no server required


