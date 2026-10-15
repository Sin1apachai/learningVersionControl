import { app, BrowserWindow, ipcMain } from "electron";
import semver from "semver";
import path from "node:path";

function createWindow(): void {
    const window = new BrowserWindow({
        width: 380,
        height: 560,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: true
        }
    });

    void window.loadFile(path.join(__dirname, "../index.html"));
}

ipcMain.handle("app:get-version", () => app.getVersion()); ipcMain.handle("app:check-update", async () => {
    const response = await fetch(
        "http://127.0.0.1:3500/latest.json",
        { signal: AbortSignal.timeout(5000) }
    );

    if (!response.ok) {
        throw new Error(`Update server returned ${response.status}`);
    }

    const release = await response.json();

    if (
        typeof release.version !== "string" ||
        !semver.valid(release.version) ||
        typeof release.notes !== "string"
    ) {
        throw new Error("Invalid update information");
    }

    const currentVersion = app.getVersion();

    return {
        currentVersion,
        latestVersion: release.version,
        notes: release.notes,
        available: semver.gt(release.version, currentVersion)
    };
});

app.whenReady().then(() => {
    createWindow();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});