const { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain } = require('electron');
const isDev = process.env.NODE_ENV !== 'production' || process.defaultApp || !!process.env.ELECTRON_DEV;
const path = require('path');
const AutoLaunch = require('auto-launch');

let mainWindow;
let tray = null;
let autoLauncher = null;

// Default tray menu labels
let trayLabels = {
  show: 'Show App',
  quit: 'Quit',
  tooltip: 'aman',
};

// Set a human-readable app name
try {
  if (typeof app.setName === 'function') {
    app.setName('aman');
  } else {
    app.name = 'aman';
  }
} catch (err) {
  // ignore
}

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  const startUrl = isDev
    ? 'http://localhost:3000' // Dev server
    : `file://${path.join(__dirname, '../dist/index.html')}`; // Production build

  mainWindow.loadURL(startUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // When the user closes the window, hide to tray instead of quitting
  mainWindow.on('close', (e) => {
    if (!app.isQuiting) {
      e.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

const createTray = () => {
  try {
    const iconPath = path.join(__dirname, '..', 'assets', 'icon.png');
    const trayIcon = nativeImage.createFromPath(iconPath);
    tray = new Tray(trayIcon.isEmpty() ? undefined : trayIcon);
  } catch (err) {
    tray = new Tray(undefined);
  }

  updateTrayMenu();

  tray.on('double-click', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
};

/**
 * Updates the tray context menu with current labels
 */
const updateTrayMenu = () => {
  if (!tray) return;

  const contextMenu = Menu.buildFromTemplate([
    {
      label: trayLabels.show,
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      },
    },
    { type: 'separator' },
    {
      label: trayLabels.quit,
      click: () => {
        app.isQuiting = true;
        app.quit();
      },
    },
  ]);

  tray.setToolTip(trayLabels.tooltip);
  tray.setContextMenu(contextMenu);
};

app.whenReady().then(() => {
  createWindow();
  createTray();

  // Enable auto-launch by default (only in packaged builds)
  if (!isDev) {
    try {
      autoLauncher = new AutoLaunch({
        name: 'aman',
        path: app.getPath('exe'),
      });
      // Enable by default on first run
      autoLauncher.enable().catch((err) => {
        console.warn('Failed to enable auto-launch by default:', err);
      });
    } catch (err) {
      console.warn('Auto-launch not available on this platform:', err);
    }
  }
});

app.on('before-quit', () => {
  app.isQuiting = true;
});

// IPC handlers for auto-launch toggle from renderer
ipcMain.handle('set-auto-launch', async (event, enabled) => {
  if (!autoLauncher) {
    return { success: false, error: 'Auto-launcher not available' };
  }
  try {
    if (enabled) {
      await autoLauncher.enable();
      console.log('Auto-launch enabled');
    } else {
      await autoLauncher.disable();
      console.log('Auto-launch disabled');
    }
    return { success: true };
  } catch (err) {
    console.error('Error setting auto-launch:', err);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('get-auto-launch-status', async (event) => {
  if (!autoLauncher) {
    return { available: false, enabled: false };
  }
  try {
    const isEnabled = await autoLauncher.isEnabled();
    return { available: true, enabled: isEnabled };
  } catch (err) {
    console.error('Error getting auto-launch status:', err);
    return { available: true, enabled: false };
  }
});

// IPC handlers for tray menu labels
ipcMain.handle('set-tray-labels', async (event, labels) => {
  try {
    if (labels.show) trayLabels.show = labels.show;
    if (labels.quit) trayLabels.quit = labels.quit;
    if (labels.tooltip) trayLabels.tooltip = labels.tooltip;
    
    updateTrayMenu();
    return { success: true, labels: trayLabels };
  } catch (err) {
    console.error('Error setting tray labels:', err);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('get-tray-labels', async (event) => {
  try {
    return { success: true, labels: trayLabels };
  } catch (err) {
    console.error('Error getting tray labels:', err);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('reset-tray-labels', async (event) => {
  try {
    trayLabels = {
      show: 'Show App',
      quit: 'Quit',
      tooltip: 'aman',
    };
    updateTrayMenu();
    return { success: true, labels: trayLabels };
  } catch (err) {
    console.error('Error resetting tray labels:', err);
    return { success: false, error: err.message };
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  } else if (mainWindow && !mainWindow.isVisible()) {
    mainWindow.show();
  }
});
