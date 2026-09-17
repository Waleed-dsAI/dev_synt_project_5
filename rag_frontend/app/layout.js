import './globals.css';
import Sidebar from './components/Sidebar';

export const metadata = {
  title: 'DocsChat',
  description: 'AI-powered document Q&A .',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <Sidebar />
          <main className="main">{children}</main>
        </div>
      </body>
    </html>
  );
}
