import { defineConfig, devices } from '@playwright/test';

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

export default defineConfig({
    testDir: './e2e',
    reporter: 'list',
    expect: {
        toHaveScreenshot: {
            maxDiffPixelRatio: 0.002
        }
    },
    webServer: {
        command: `${npmCommand} run dev -- --host 127.0.0.1 --port 5173`,
        url: 'http://127.0.0.1:5173',
        reuseExistingServer: true,
        timeout: 120000
    },
    use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://127.0.0.1:5173',
        viewport: { width: 1180, height: 980 },
        deviceScaleFactor: 1
    },
    projects: [
        {
            name: 'chromium',
            use: { browserName: 'chromium' }
        }
    ]
});
