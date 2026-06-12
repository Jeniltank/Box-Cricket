import { Outfit } from 'next/font/google';
import { SocketProvider } from '../context/SocketContext';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700', '800', '900'],
  variable: '--font-main',
});

export const metadata = {
  title: 'Box Cricket Live Scoring',
  description: 'Live scoring broadcast graphic for box cricket tournaments',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={outfit.variable}>
        <SocketProvider>{children}</SocketProvider>
      </body>
    </html>
  );
}
