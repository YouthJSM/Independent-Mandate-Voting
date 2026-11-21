# Independent Mandate – Voting App (tablet)
Secret digital ballot for station tablets, managed by the company. Voter website: https://youthjsm.github.io/Independent-Mandate/

Files: `index.html`, `styles.css`, `app.js`, `config.js` (settings and demo data), `manifest.webmanifest` + `sw.js` + icons (install as an app, works offline), `API.md` (backend contract).

Run: open the folder in VS Code and start Live Server. Demo code: 482910.
Install: in Chrome or Edge choose "Install app" (or use the "Install this app" link on step 1). For an Android APK use pwabuilder.com.
Deploy: push to a new GitHub repo, then Settings → Pages → `main` / root.
Update: bump `V` in `sw.js` whenever files change, or tablets keep the old copy.
Demo mode simulates fingerprint and SMS checks. It is not a secure election system until the backend and hardware checks are real.
