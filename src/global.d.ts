type UpdateCheckResult =
    | {
        ok: true;
        currentVersion: string;
        latestVersion: string;
        available: boolean;
        notes: string;
    }
    | {
        ok: false;
        message: string;
    };

interface Window {
    appInfo: {
        getVersion: () => Promise<string>;
        checkUpdate: () => Promise<UpdateCheckResult>;
    };
}