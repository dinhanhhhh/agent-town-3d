import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Thị trấn DevOps 3D · 8 Autonomous Agents',
  description: 'Interactive 3D Isometric DevOps Simulation with 8 Autonomous AI Agents & Production Gatekeeper',
  other: {
    google: 'notranslate',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" translate="no" className="h-full w-full notranslate">
      <head>
        <meta name="google" content="notranslate" />
      </head>
      <body className="h-full w-full overflow-hidden bg-slate-900 text-slate-100 antialiased notranslate" translate="no">
        {children}
      </body>
    </html>
  );
}
