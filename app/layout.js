import './globals.css';
import { Bricolage_Grotesque, Inter, Cormorant, Instrument_Sans } from 'next/font/google';

const display = Bricolage_Grotesque({ subsets: ['latin'], variable: '--f-display' });
const body = Inter({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--f-body' });
// Atlas sections: editorial serif and a readable UI sans, self-hosted by next/font.
const serif = Cormorant({ subsets: ['latin'], weight: ['400', '500', '600'], style: ['normal', 'italic'], variable: '--f-serif' });
const ui = Instrument_Sans({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--f-ui' });

export const metadata = {
  title: 'Omar Ahmed Saeed — Odoo Developer',
  description: 'Frontend-focused Odoo developer building polished OWL apps, custom modules and websites.',
};

export default function Layout({ children }) {
  return <html lang="en" className={`${display.variable} ${body.variable} ${serif.variable} ${ui.variable}`}><body>{children}</body></html>;
}
