import './globals.css';

export const metadata = {
  title: 'GeoAware Bible',
  description: 'Scripture that adapts to the language of your location.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
