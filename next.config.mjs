/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    trailingSlash: true,
    images: {
        unoptimized: true,  // Отключает оптимизацию изображений
      },
};

export default nextConfig;
