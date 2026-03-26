/** @type {import('next').NextConfig} */
const nextConfig = {
    distDir: '.next',
    typescript: { ignoreBuildErrors: true },
    eslint: { ignoreDuringBuilds: true },
    experimental: { 
        serverActions: { bodySizeLimit: '25mb' },
        webpackBuildWorker: false
    }
}
module.exports = nextConfig
