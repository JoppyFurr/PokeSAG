export const SETTINGS_DEFS = [
    { key: 'autoRefresh',     label: 'Auto Refresh',     default: false },
    { key: 'fullTextSearch',  label: 'Full Text Search',  default: true  },
    { key: 'use24hTime',      label: '24 Hour Time',      default: false },
    { key: 'recipientColors', label: 'Recipient Colors',  default: true  },
];

/** Load all settings from localStorage, falling back to defaults. */
export function loadSettings() {
    const out = {};
    for (const def of SETTINGS_DEFS) {
        const raw = localStorage.getItem(def.key);
        try {
            out[def.key] = raw !== null ? JSON.parse(raw) : def.default;
        } catch {
            out[def.key] = def.default;
        }
    }
    return out;
}

/** Persist settings to localStorage. */
export function saveSetting(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}
