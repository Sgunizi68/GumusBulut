import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    base: '/GumusBulut/',
    plugins: [react()],
    define: {
        'import.meta.env.APP_VERSION': JSON.stringify(process.env.npm_package_version)
    },
    server: {
        port: 5173,
        host: true,
        hmr: {
            clientPort: 5173,
            path: '/GumusBulut/',
        },
    },
});
