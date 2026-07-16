import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

// Initialize Gemini SDK with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

export async function POST(req: NextRequest) {
  try {
    const { action, prompt, data } = await req.json();

    if (action === "analyze") {
      // Prompt for sales report analysis
      const systemInstruction = `Anda adalah konsultan bisnis POS ritel profesional dan analis data finansial. 
Analisislah data transaksi penjualan POS berikut, lalu berikan:
1. Ringkasan performa finansial (Omset, Modal, Profit, Margin Laba).
2. Analisis performa produk terlaris dan stok menipis.
3. 3-4 rekomendasi bisnis taktis yang langsung bisa diterapkan oleh pemilik toko untuk meningkatkan omset dan mengoptimalkan persediaan barang.
Tulis dalam Bahasa Indonesia yang profesional, ramah, padat, dan mudah dipahami oleh pemilik UMKM ritel. Gunakan format Markdown yang indah.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Berikut data transaksi dan inventory POS saat ini: ${JSON.stringify(data)}`,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      return NextResponse.json({ success: true, text: response.text });
    }

    if (action === "generate_products") {
      // Prompt to generate high quality mock products
      const systemInstruction = `Anda adalah asisten POS pintar. Hasilkan 5 data produk kasir (JSON format) fiktif yang realistis sesuai dengan kategori yang diminta: "${prompt}".
Tanggapan harus HANYA berupa array JSON murni tanpa pembungkus markdown (tanpa \`\`\`json). Setiap objek produk harus memiliki field berikut:
- id: string uuid acak
- barcode: string barcode acak (13 digit)
- sku: string SKU acak (misal: "PROD-101")
- name: string nama produk yang keren dan realistis
- purchase_price: number (harga modal logis dalam Rupiah, misal: 12000)
- selling_price: number (harga jual logis, harus lebih besar dari purchase_price, misal: 15000)
- stock: number (stok awal, misal: 50)
- min_stock: number (minimum stok, misal: 10)
- category: string (kategori produk)`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Hasilkan 5 produk untuk kategori: ${prompt}`,
        config: {
          systemInstruction,
          temperature: 0.8,
        }
      });

      try {
        const text = response.text || "[]";
        const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const products = JSON.parse(cleanText);
        return NextResponse.json({ success: true, products });
      } catch (parseError) {
        console.error("JSON parse error:", parseError, response.text);
        return NextResponse.json({ success: false, error: "Gagal memproses JSON produk.", raw: response.text });
      }
    }

    if (action === "ask_blueprint") {
      // Prompt to answer questions about the Flutter blueprint
      const systemInstruction = `Anda adalah Arsitek Solusi Flutter Ritel Senior. Anda telah mendesain POS Enterprise-grade blueprint menggunakan Flutter 3.x, Riverpod, Drift (SQLite), Go Router, Supabase Sync, dan ESC/POS Printing.
Jawab pertanyaan pengguna mengenai arsitektur, kode program, integrasi Bluetooth, database SQLite Drift, sinkronisasi background, atau tantangan implementasi lainnya.
Tulis penjelasan dalam Bahasa Indonesia yang sangat jelas, ramah, informatif, dan praktis. Berikan contoh kode jika diperlukan. Gunakan format Markdown yang rapi.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      return NextResponse.json({ success: true, text: response.text });
    }

    return NextResponse.json({ success: false, error: "Action tidak valid." }, { status: 400 });

  } catch (error: any) {
    console.error("Gemini route error:", error);
    return NextResponse.json({ success: false, error: error.message || "Internal server error" }, { status: 500 });
  }
}
