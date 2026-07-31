import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-4xl font-black text-amber-500 mb-2">404</h1>
      <h2 className="text-xl font-bold mb-4">Halaman Tidak Ditemukan</h2>
      <p className="text-slate-400 text-sm max-w-md mb-6">
        Halaman yang Anda cari tidak ada atau telah dipindahkan.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 bg-amber-500 text-slate-950 font-black rounded-xl text-xs uppercase hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/10"
      >
        Kembali ke Dashboard Kasir
      </Link>
    </div>
  );
}
