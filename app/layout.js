import './globals.css';

export const metadata = {
  title: 'SBA Fund Manager',
  description: 'Interest-Free Community Fund Management System — Sharia Brotherhood Aurangabad',
  applicationName: 'SBA Fund Manager',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SBA Fund',
  },
  formatDetection: {
    telephone: false,
  },
  themeColor: '#0d5c3f',
  manifest: '/manifest.json',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: '#0d5c3f',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="SBA Fund" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}