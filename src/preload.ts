import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("appInfo", {
    getVersion: (): Promise<string> =>
        ipcRenderer.invoke("app:get-version"),

    checkUpdate: (): Promise<UpdateCheckResult> =>
        ipcRenderer.invoke("app:check-update")
});