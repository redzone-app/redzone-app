import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Redzone Recruiting',
  description: 'A platform to help high school athletes with the recruiting process',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}