/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'img.clerk.com',
            },
            {
                protocol: 'https',
                hostname: 'images.clerk.dev',
            },
        ],
    },
    webpack(config) {
        config.output.webassemblyModuleFilename =
            'static/wasm/[modulehash].wasm';
        return config;
    },
    async headers() {
        return [
            {
                source: '/static/wasm/:path*',
                headers: [
                    {
                        key: 'Content-Type',
                        value: 'application/wasm',
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
