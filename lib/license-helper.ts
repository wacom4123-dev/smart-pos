import { NextResponse } from "next/server";

export async function forwardToLicenseServer(url: string, options: RequestInit) {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get("content-type") || "";
    
    if (!contentType.includes("application/json")) {
      const text = await res.text();
      let friendlyError = "Server lisensi mengembalikan respon non-JSON (HTML/Teks).";
      
      if (text.includes("accounts.google.com") || text.includes("Sign in - Google Accounts") || text.includes("login")) {
        friendlyError = "Akses ditolak oleh Google Auth proxy. Pastikan URL Admin Panel Anda menggunakan URL 'Shared' (https://ais-pre-...) yang sudah dipublikasikan (Shared) secara publik, bukan URL developer privat (https://ais-dev-...).";
      } else if (res.status === 404) {
        friendlyError = "Endpoint tidak ditemukan di server lisensi (Status 404). Pastikan route API /api/license/... sudah terpasang dengan benar di Admin Panel.";
      } else {
        friendlyError = `Server lisensi mengembalikan respon tidak valid (Status: ${res.status}).`;
      }
      
      return NextResponse.json(
        { 
          error: friendlyError, 
          status: res.status,
          preview: text.substring(0, 150).replace(/<[^>]*>/g, " ").trim() + "..."
        },
        { status: 502 }
      );
    }
    
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json(
      { error: `Gagal menghubungi server lisensi: ${error.message}` },
      { status: 500 }
    );
  }
}
