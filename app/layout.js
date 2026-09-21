import './globals.css';
import { Bricolage_Grotesque, Inter } from 'next/font/google';

const display = Bricolage_Grotesque({ subsets: ['latin'], variable: '--f-display' });
const body = Inter({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--f-body' });

export const metadata = {
  title: 'Omar Ahmed Saeed — Odoo Developer',
  description: 'Frontend-focused Odoo developer building polished OWL apps, custom modules and websites.',
};

export default function Layout({ children }) {
  return <html lang="en" className={`${display.variable} ${body.variable}`}><body>{children}</body></html>;
}
