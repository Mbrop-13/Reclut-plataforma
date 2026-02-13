/** @type {import('next').NextConfig} */
const nextConfig = {
    // Ensure strict React mode for better debugging
    reactStrictMode: true,
    // Add any other necessary config here
    images: {
        domains: ['api.dicebear.com', 'github.com'],
    },
};

export default nextConfig;
