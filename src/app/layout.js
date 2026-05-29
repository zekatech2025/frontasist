import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'RAG Asistan',
  description: 'Belgelerinizle Sohbet Edin - Gemini Flash 1.5',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr" className="h-full">
      <body className="h-full bg-gray-950 text-white antialiased">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#1f2937',
              color: '#fff',
              border: '1px solid #374151',
              borderRadius: '12px',
              fontSize: '14px',
            },
          }}
        />
      </body>
    </html>
  );
}
