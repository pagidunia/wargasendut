import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Warga Sendut',
  description: 'Dashboard warga RT 02 / RW 02. Kelola iuran, arisan, laporan kas.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
