let userConfig = undefined;
try {
    userConfig = await import("./v0-user-next.config");
} catch (e) {
    // ignore error
}

// Importujemy TerserPlugin
import TerserPlugin from "terser-webpack-plugin";

/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    images: {
        unoptimized: true,
    },
    experimental: {
        webpackBuildWorker: true,
        parallelServerBuildTraces: true,
        parallelServerCompiles: true,
    },
    // Dodatkowe opcje dla Next.js
    swcMinify: true, // Używa SWC do minifikacji kodu
    productionBrowserSourceMaps: false, // Wyłącza source maps w produkcji
    webpack: (config, { dev, isServer }) => {
        // Tylko w trybie produkcyjnym (gdy dev === false) i tylko dla kodu klienta (nie serwera)
        if (!dev && !isServer) {
            // Upewnij się, że mamy sekcję optimization
            if (!config.optimization) {
                config.optimization = {};
            }

            // Zastąp istniejące minimizery naszym własnym TerserPlugin
            config.optimization.minimize = true;
            config.optimization.minimizer = [
                new TerserPlugin({
                    terserOptions: {
                        compress: {
                            drop_console: true, // Usuwa wszystkie console.*
                            pure_funcs: [
                                "console.log",
                                "console.debug",
                                "console.info",
                                "console.warn",
                                "console.error",
                                "console.trace",
                            ],
                            passes: 2, // Wykonaj dwa przejścia kompresji dla lepszych wyników
                        },
                        format: {
                            comments: false, // Usuwa wszystkie komentarze
                        },
                        mangle: {
                            keep_fnames: true, // Zachowaj nazwy funkcji dla komponentów React
                            keep_classnames: true, // Zachowaj nazwy klas dla komponentów React
                        },
                    },
                    extractComments: false, // Nie wyodrębniaj komentarzy do osobnych plików
                }),
            ];
        }

        return config;
    },
};

mergeConfig(nextConfig, userConfig);

function mergeConfig(nextConfig, userConfig) {
    if (!userConfig) {
        return;
    }

    for (const key in userConfig) {
        if (
            typeof nextConfig[key] === "object" &&
            !Array.isArray(nextConfig[key])
        ) {
            nextConfig[key] = {
                ...nextConfig[key],
                ...userConfig[key],
            };
        } else {
            nextConfig[key] = userConfig[key];
        }
    }
}

export default nextConfig;
