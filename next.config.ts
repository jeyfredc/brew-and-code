import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Los próximos eventos dependen de la fecha (revalidate = 3600 en la home). Sin esto, Next
  // permite servir HTML caducado hasta 1 año; con 3600 la página caduca junto con su revalidación.
  expireTime: 3600,
};

export default nextConfig;
