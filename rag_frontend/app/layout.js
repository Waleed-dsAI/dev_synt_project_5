import './globals.css';
import Sidebar from './components/Sidebar';

export const metadata = {
  title: 'Estate Archive — Document RAG Dashboard',
  description: 'AI-powered document Q&A for real estate document sets.',
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
