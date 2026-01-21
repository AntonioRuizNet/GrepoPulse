import './globals.css';

export const metadata = {
  title: 'Grepolis Admin',
  description: 'Grepolis world data ingester',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <div className="container">
          {children}
        </div>
      </body>
    </html>
  );
}
