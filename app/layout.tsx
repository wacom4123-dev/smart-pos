import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="antialiased bg-slate-950 text-slate-100 min-h-screen font-sans">
        {children}
      </body>
    </html>
  );
}
