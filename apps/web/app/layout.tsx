import './styles.css';
import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Batam Travelling ERP', description: 'Integrated travel operations platform' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="id"><body>{children}</body></html>; }
