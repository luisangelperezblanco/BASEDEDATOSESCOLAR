/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Evita que Prisma y bcryptjs se empaqueten en el bundle del servidor.
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
};

export default nextConfig;
