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

ipcMain.handle("app:get-version", () => app.getVersion());

ipcMain.handle("app:check-update", async (): Promise<UpdateCheckResult> => {
    try {
        const response = await fetch(
            "https://api.github.com/repos/Sin1apachai/learningVersionControl/releases/latest",
            {
                headers: {
                    Accept: "application/vnd.github+json"
                },
                signal: AbortSignal.timeout(10000)
            }
        );

        if (response.status === 404) {
            throw new Error(
                "ไม่พบ Release กรุณาตรวจว่า Repository เป็น Public และเผยแพร่ Release แล้ว"
            );
        }

        if (response.status === 403 || response.status === 429) {
            throw new Error("GitHub จำกัดการเรียกข้อมูล กรุณาลองใหม่ภายหลัง");
        }

        if (!response.ok) {
            throw new Error(`GitHub ตอบกลับสถานะ ${response.status}`);
        }

        const release = await response.json();

        const latestVersion =
            typeof release.tag_name === "string"
                ? semver.valid(release.tag_name)
                : null;

        if (!latestVersion) {
            throw new Error("รูปแบบ Tag ไม่ถูกต้อง ควรเป็น เช่น v1.0.0");
        }

        const currentVersion = app.getVersion();

        return {
            ok: true,
            currentVersion,
            latestVersion,
            available: semver.gt(latestVersion, currentVersion),
            notes: typeof release.body === "string" ? release.body : ""
        };
    } catch (error) {
        return {
            ok: false,
            message:
                error instanceof Error
                    ? error.message
                    : "ตรวจสอบอัปเดตไม่สำเร็จ"
        };
    }
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