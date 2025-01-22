/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  modularizeImports: {
    '@mui/icons-material': {
      transform: '@mui/icons-material/{{member}}'
    },
    'lodash': {
      transform: 'lodash/{{member}}'
    }
  }
};

export default nextConfig;
