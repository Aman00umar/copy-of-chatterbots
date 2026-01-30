/**
 * Tray menu configuration for customizable labels
 */

export interface TrayMenuLabels {
  show: string;
  quit: string;
  tooltip?: string;
}

export const DEFAULT_TRAY_LABELS: TrayMenuLabels = {
  show: 'Show App',
  quit: 'Quit',
  tooltip: 'aman',
};

/**
 * Validates tray menu labels
 */
export function validateTrayLabels(labels: Partial<TrayMenuLabels>): TrayMenuLabels {
  return {
    show: labels.show || DEFAULT_TRAY_LABELS.show,
    quit: labels.quit || DEFAULT_TRAY_LABELS.quit,
    tooltip: labels.tooltip || DEFAULT_TRAY_LABELS.tooltip,
  };
}
