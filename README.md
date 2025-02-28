# YouTube Downloader Desktop App

A one-page Electron desktop application built with React that downloads YouTube videos in high resolution. The app lets you paste a YouTube URL into a textbox, then starts downloading the video (choosing a progressive 720p format if available or merging streams with ffmpeg) while showing download progress.

---

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Development](#development)
- [Build & Packaging](#build--packaging)
- [How It Works](#how-it-works)
- [File Structure](#file-structure)
- [Troubleshooting](#troubleshooting)
- [Security Considerations](#security-considerations)
- [License](#license)

---

## Features

- **Single-page UI:** Simple interface with a top bar (textbox & download button) and a download status list.
- **YouTube Video Downloading:** Automatically fetches video info and downloads the best available progressive stream (720p with audio). If unavailable, you can extend the logic to download separate audio and video and merge them.
- **Progress Updates:** Real-time progress is displayed as the video downloads.
- **Electron Integration:** Desktop app running on macOS (or cross-platform) using Electron.
- **Secure IPC:** Uses a preload script with Electron's contextBridge to securely expose IPC methods to the React renderer.
- **Improved UI Styling:** Custom styling ensures text and backgrounds are clearly visible.

---

## Prerequisites

- **Node.js** (v14+ recommended)
- **npm** (or yarn/pnpm)
- **Git** (for cloning the repository)

_Note:_ The application uses [youtube-dl-exec](https://github.com/microlinkhq/youtube-dl-exec) and [ffmpeg-static](https://github.com/eugeneware/ffmpeg-static) to download and merge video streams.

---

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/youtube-downloader.git
   cd youtube-downloader
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

   This installs Electron, React, youtube-dl-exec, ffmpeg-static, and other required packages.

---

## Development

To run the application in development mode (with hot-reloading and React DevTools):

1. **Start your React development server:**

   ```bash
   npm start
   ```

2. **In a separate terminal, run Electron:**

   ```bash
   npm run electron-dev
   ```

   Alternatively, if you use a combined script with concurrently, you might have:

   ```bash
   npm run electron:serve
   ```

3. **Access the app:**
   
   The Electron window should open and load the React app from `http://localhost:3000`. Any changes you make to your React code will be reflected immediately.

---

## Build & Packaging

To create a production build:

1. **Build the React app:**

   ```bash
   npm run build
   ```

2. **Package the Electron app:**

   ```bash
   npm run electron:build
   ```

   This uses [electron-builder](https://www.electron.build/) to package the app along with your main process code. The built executable is output to your designated build folder (e.g. `release/`).

3. **Run the packaged app:**

   Open the generated executable. In production, the app loads the local `index.html` file from the build output.

---

## How It Works

### Main Process

- **main.js** creates a BrowserWindow and determines whether to load the URL from the development server or a local file based on the `isDev` flag.
- An IPC handler is registered on the `"download-video"` channel using `ipcMain.handle()`.  
- When the renderer invokes a download, the main process uses [youtube-dl-exec](https://github.com/microlinkhq/youtube-dl-exec) to:
  - Fetch video metadata (with `--dump-json`)
  - Construct a safe filename based on the video title
  - Download the video (using the `bestvideo+bestaudio` format) with ffmpeg merging if necessary.
- Progress data is sent back to the renderer via the `"download-progress"` IPC channel.

### Preload Script

- **preload.js** uses Electron’s `contextBridge` to safely expose a secure API (`downloadVideo` and `onDownloadProgress`) to the renderer.

### Renderer (React UI)

- **App.jsx** renders an input field, a download button, and a list of download statuses.
- It uses the exposed API (`window.api.downloadVideo`) to request a download and subscribes to progress updates (`window.api.onDownloadProgress`).

### Routing & Styling

- The UI uses inline styles (or can use a CSS file) to set text color to white and a matching background color.
- If using React Router, consider using `HashRouter` in production to avoid issues with file URLs.

---

## File Structure

```
youtube-downloader/
├── Downloads/               # Directory where downloaded videos are saved.
├── main.js                  # Electron main process file.
├── preload.js               # Preload script exposing IPC methods.
├── package.json             # Project configuration and scripts.
└── src/
    ├── index.html           # HTML entry point.
    ├── index.jsx            # React entry file.
    └── App.jsx              # Main React component.
```

---

## Troubleshooting

- **White Screen Issue:**  
  Make sure that in production, the main process loads your local `index.html` correctly using an absolute file URL. Verify that your build output matches the expected folder structure.

- **IPC Errors:**  
  If you see errors like “No handler registered for 'download-video'”, check that your preload.js correctly exposes the IPC API and that your main process registers the corresponding handler.

- **YouTube Download Errors:**  
  If the download fails due to extraction issues or other errors from youtube-dl-exec, verify that you have the latest version of the dependency. Check the [ytdl-core-exec documentation](https://github.com/microlinkhq/youtube-dl-exec) for additional configuration options or known issues.

- **React DevTools Warning:**  
  To get a better development experience, install the [React DevTools extension](https://reactjs.org/link/react-devtools).

- **Security Warnings:**  
  In development, you might see warnings about an insecure Content Security Policy. Set a strict CSP in your HTML file (see the HTML section above) for production.

---

## Security Considerations

- **Content Security Policy (CSP):**  
  Ensure you set a strict CSP in your `index.html` to prevent code injection vulnerabilities in production.

- **Preload Script:**  
  Use Electron’s `contextBridge` and disable `nodeIntegration` to reduce exposure of Node.js APIs to the renderer.

For more information on securing your Electron app, consult the [Electron Security Guidelines](https://www.electronjs.org/docs/tutorial/security).

---

## License

This project is licensed under the [MIT License](LICENSE).

---

*Happy downloading! If you have any questions or encounter issues, please feel free to open an issue on GitHub.*
