interface UpdateCheckResult {
    currentVersion: string;
    latestVersion: string;
    notes: string;
    available: boolean;
}

interface Window {
    appInfo: {
        getVersion: () => Promise<string>;
        checkUpdate: () => Promise<UpdateCheckResult>;
    };
}