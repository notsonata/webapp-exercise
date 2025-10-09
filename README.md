# Webapp — Run Guide

## Prerequisites
- Node.js 18+ recommended

## Install and run
```powershell
npm install
npm run build:css
npm start
```

Then open a page in your browser, for example:
- http://localhost:3000/bootstrap.html

## Auth notes
- Click "Log In" in the navbar to open the login modal.
- If you don’t have an account yet, click "Sign Up" in the modal (or go to `/signup.html`) to create one first.
- Accounts are stored locally in `accounts.json` (demo only; passwords are not hashed).

## Optional
- Rebuild CSS on change:
```powershell
npm run watch:css
```