import { Inter } from 'next/font/google';
import './globals.css';
import { ConsentProvider } from '../components/ConsentProvider';
import { AdminProvider } from '../contexts/AdminContext';
import { AuthProvider } from '../contexts/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'ADONS Studio - Professional VFX & Animation Studio',
  description: 'Professional VFX, Animation & Post-Production studio dedicated to delivering high-quality visual effects, 3D animation, and creative solutions with on-time delivery and industry-standard excellence.',
  keywords: [
    'VFX studio India',
    'animation studio India',
    'visual effects production',
    'professional video production',
    'post-production services',
    '3D animation services',
    'motion graphics design',
    'video editing services',
    'ADONS Studio',
    'creative services Bhubaneswar',
    'film production India',
    'commercial video production'
  ],
  manifest: '/favicon/site.webmanifest',
  alternates: {
    canonical: 'https://adonsstudio.com/'
  },
  openGraph: {
    title: 'ADONS Studio - Professional VFX & Animation Studio',
    description: 'Professional VFX, animation, and post-production studio. Dedicated team delivering industry-standard visual effects and creative solutions with on-time commitment.',
    url: 'https://adonsstudio.com/',
    siteName: 'ADONS Studio',
    type: 'website',
    images: [
      {
        url: 'https://adonsstudio.com/Images/og/og-default.png',
        width: 1200,
        height: 630,
        alt: 'ADONS Studio - Professional VFX & Animation Production'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    site: '@AdonsStudio3237',
    title: 'ADONS Studio - Professional VFX & Animation Studio',
    description: 'Professional VFX, animation, and post-production services. Hardworking team committed to industry-standard quality and on-time delivery.',
    images: ['https://adonsstudio.com/Images/og/og-default.png']
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <AdminProvider>
            <ConsentProvider>
              {children}
            </ConsentProvider>
          </AdminProvider>
        </AuthProvider>
      </body>
    </html>
  );
}