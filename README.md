<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1BDgFFAvFDxe7ByEPlHpiE9gZ-jpmYK-X

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Run as Desktop App (Electron)

- Dev (run renderer + electron):

   ```bash
   npm install
   npm run electron-dev
   ```

- Build and create installers (uses `electron-builder`):

   ```bash
   npm install
   npm run dist
   ```

Notes:
- The app will create a system tray icon and hide-to-tray on window close.
- Auto-launch on login is enabled for packaged builds (skipped in dev).

Add your photo as the app icon (quick):

- If you have `aman.png` on your desktop (~/Desktop/aman.png), run:

```bash
npm run setup-icon
```

- Or manually copy `aman.png` into the project at `assets/icon.png`.

After placing the icon, run the app (dev or packaged) — the tray will use `assets/icon.png`.
