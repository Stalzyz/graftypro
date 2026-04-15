/** @type {import('next').NextConfig} */
const nextConfig = {
    distDir: '.next',
    compress: true,
    poweredByHeader: false,
    generateEtags: true,
    typescript: { ignoreBuildErrors: true },
    eslint: { ignoreDuringBuilds: true },
    images: {
        formats: ['image/avif', 'image/webp'],
        minimumCacheTTL: 60,
    },
    experimental: { 
        serverActions: { bodySizeLimit: '25mb' },
        webpackBuildWorker: false,
        serverComponentsExternalPackages: ['pdf-parse', 'cheerio']
    },
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                path: false,
                stream: false,
                http: false,
                https: false,
                zlib: false,
                crypto: false,
            };
        }
        return config;
    }
}
module.exports = nextConfig
