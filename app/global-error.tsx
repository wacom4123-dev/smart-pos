'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="id">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col items-center justify-center p-6 text-center font-sans">
        <h1 className="text-3xl font-black text-red-500 mb-2">Terjadi Kesalahan Sistem</h1>
        <p className="text-slate-400 text-sm max-w-md mb-6">
          Aplikasi mengalami kendala teknis sementara.
        </p>
        <button
          onClick={() => reset()}
          className="px-5 py-2.5 bg-amber-500 text-slate-950 font-black rounded-xl text-xs uppercase hover:bg-amber-400 transition-all cursor-pointer"
        >
          Coba Muat Ulang
        </button>
      </body>
    </html>
  );
}
