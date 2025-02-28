// main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');
const youtubedl = require('youtube-dl-exec');
const ffmpegPath = require('ffmpeg-static');

// Ensure Downloads folder exists
const downloadsDir = path.join(__dirname, 'Downloads');
if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir);
}

// Define isDev based on whether the app is packaged
const isDev = !app.isPackaged;

// IPC handler for downloading video using youtube-dl-exec
ipcMain.handle('download-video', async (event, { id, url: videoUrl }) => {
    try {
        // Step 1: Get video info (returns an object when using dumpJson:true)
        const info = await youtubedl(videoUrl, {
            dumpJson: true,
            noWarnings: true,
            noCallHome: true
        });
        const videoTitle = info.title;
        const safeTitle = videoTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const outputPath = path.join(downloadsDir, `${safeTitle}.mp4`);

        // Step 2: Download the video.
        // youtube-dl-exec supports a callback option if you want to capture progress.
        await new Promise((resolve, reject) => {
            // Execute youtube-dl as a child process
            const downloader = youtubedl.exec(videoUrl, {
                output: outputPath,
                format: 'bestvideo+bestaudio/best',
                mergeOutputFormat: 'mp4',
                noWarnings: true,
                'ffmpeg-location': ffmpegPath
            }, { stdio: ['ignore', 'pipe', 'pipe'] });

            // Capture progress info from stdout
            downloader.stdout.on('data', (data) => {
                const progress = data.toString().trim();
                // Send progress update to renderer
                event.sender.send('download-progress', { id, progress });
            });

            // Capture stderr (often used for progress too)
            downloader.stderr.on('data', (data) => {
                const progress = data.toString().trim();
                event.sender.send('download-progress', { id, progress });
            });

            downloader.on('close', (code) => {
                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error(`youtube-dl exited with code ${code}`));
                }
            });
        });

        // Return result to renderer
        return { id, title: videoTitle, output: outputPath };
    } catch (error) {
        console.error('Error in download-video handler:', error);
        throw error;
    }
});

// Create the main BrowserWindow
function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        backgroundColor: '#312450', // Set a background color to avoid flash of white
        show: false, // Do not show until ready-to-show event
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    if (isDev) {
        mainWindow.loadURL('http://localhost:3000');
    } else {
        // Adjust the path if your production build files are in a subfolder (e.g., "build")
        mainWindow.loadURL(url.format({
            pathname: path.join(__dirname, 'index.html'),
            protocol: 'file:',
            slashes: true
        }));
    }

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    if (isDev) {
        mainWindow.webContents.openDevTools();
    }
}

// App event listeners
app.whenReady().then(createWindow);
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});