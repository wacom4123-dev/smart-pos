'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-3xl font-black text-red-500 mb-2">Terjadi Kesalahan</h1>
      <p className="text-slate-400 text-sm max-w-md mb-6">
        Sistem mengalami masalah saat memuat halaman ini.
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => reset()}
          className="px-5 py-2.5 bg-amber-500 text-slate-950 font-black rounded-xl text-xs uppercase hover:bg-amber-400 transition-all cursor-pointer shadow-lg shadow-amber-500/10"
        >
          Coba Lagi
        </button>
        <Link
          href="/"
          className="px-5 py-2.5 bg-slate-800 text-slate-200 font-bold rounded-xl text-xs uppercase hover:bg-slate-700 transition-all"
        >
          Beranda
        </Link>
      </div>
    </div>
  );
}
