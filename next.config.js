/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        https: false,
      }
      // pptxgenjs: CDN 런타임 로드 방식 사용 (pptxExporter.ts 참조)
    }
    return config
  },
}

module.exports = nextConfig
