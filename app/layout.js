import './globals.css';

export const metadata = {
  title: 'SBA Fund Manager',
  description: 'Interest-Free Community Fund Management System',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}