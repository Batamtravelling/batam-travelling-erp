import './styles.css';
import type { Metadata } from 'next';
import { AppShell } from '../components/app-shell';
export const metadata: Metadata = { title: 'BATAM TRAVELLING', description: 'Integrated travel operations platform' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="id"><body><AppShell>{children}</AppShell></body></html>; }
