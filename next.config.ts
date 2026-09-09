import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['sharp', 'fontkit'],
  outputFileTracingIncludes: {
    '/api/member-card': ['./public/fonts/member-card/**/*', './public/logoicon.png', './public/svslogo.png'],
    '/api/member-card-pdf': ['./public/fonts/member-card/**/*', './public/logoicon.png', './public/svslogo.png'],
    '/api/email/verification': ['./public/fonts/member-card/**/*', './public/logoicon.png', './public/svslogo.png'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/v0/b/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh4.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh5.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh6.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Add any other config options here
};

export default nextConfig;
