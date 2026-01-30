/**
 * Utility for managing custom tray menu labels
 * Communicates with Electron main process via IPC
 */

export interface TrayMenuLabels {
  show?: string;
  quit?: string;
  tooltip?: string;
}

/**
 * Sets custom tray menu labels
 * @param labels - Partial labels object with show, quit, and/or tooltip properties
 * @returns Promise with success status and updated labels
 */
export async function setTrayLabels(labels: TrayMenuLabels) {
  try {
    const result = await window.electron.ipcRenderer.invoke('set-tray-labels', labels);
    return result;
  } catch (error) {
    console.error('Failed to set tray labels:', error);
    throw error;
  }
}

/**
 * Gets current tray menu labels
 * @returns Promise with current tray labels
 */
export async function getTrayLabels() {
  try {
    const result = await window.electron.ipcRenderer.invoke('get-tray-labels');
    return result.success ? result.labels : null;
  } catch (error) {
    console.error('Failed to get tray labels:', error);
    throw error;
  }
}

/**
 * Resets tray menu labels to defaults
 * @returns Promise with success status and reset labels
 */
export async function resetTrayLabels() {
  try {
    const result = await window.electron.ipcRenderer.invoke('reset-tray-labels');
    return result;
  } catch (error) {
    console.error('Failed to reset tray labels:', error);
    throw error;
  }
}
