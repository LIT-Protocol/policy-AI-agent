/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    webpack: (config, { dev, isServer }) => {
        if (dev) {
            // Ignore specific directories or files for Fast Refresh
            config.watchOptions = {
                ignored: "./src/app/llm.tsx", // Add the paths you want to ignore
            };
        }

        return config;
    },
};

export default nextConfig;
