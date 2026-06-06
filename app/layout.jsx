import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'GoMobility — Live Ride Tracking',
  description: 'Track your GoMobility ride in real-time. See live driver location, ETA, and ride status.',
  icons: { icon: '/favicon.ico' },
  openGraph: {
    title: 'GoMobility — Live Ride Tracking',
    description: 'Track your ride in real-time',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50`}>{children}</body>
    </html>
  );
}
