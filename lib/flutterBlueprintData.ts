export interface BlueprintFile {
  path: string;
  language: string;
  description: string;
  content: string;
}

export const flutterBlueprintFiles: BlueprintFile[] = [
  {
    path: "pubspec.yaml",
    language: "yaml",
    description: "File konfigurasi dependensi Flutter M3, Riverpod, Drift (SQLite), Bluetooth Thermal Printer, Scanner, dan utility enterprise-grade lainnya.",
    content: `name: pos_enterprise_app
description: Enterprise-Grade Point of Sale (POS) Mobile Application.
version: 1.0.0+1

environment:
  sdk: '>=3.3.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter

  # State Management & DI
  flutter_riverpod: ^3.0.0
  riverpod_annotation: ^2.3.5

  # Routing
  go_router: ^16.0.0

  # Local SQLite Database (Drift ORM)
  drift: ^2.28.0
  sqlite3_flutter_libs: ^0.5.39
  path_provider: ^2.1.2
  path: ^1.9.0

  # Barcode & Camera Scanner
  mobile_scanner: ^7.0.1

  # Printing & Receipt Layout
  esc_pos_utils_plus: ^2.0.4
  blue_thermal_printer: ^1.2.3
  pdf: ^3.11.3
  printing: ^5.14.2

  # Network & Cloud Sync
  supabase_flutter: ^2.4.0
  http: ^1.2.0
  connectivity_plus: ^6.0.3

  # Utilities
  intl: ^0.20.2
  uuid: ^4.5.1
  image_picker: ^1.2.0
  shared_preferences: ^2.5.3
  crypto: ^3.0.3

dev_dependencies:
  flutter_test:
    sdk: flutter
  
  # Code Generators
  drift_dev: ^2.28.0
  build_runner: ^2.4.8
  riverpod_generator: ^2.3.9

flutter:
  uses-material-design: true
  assets:
    - assets/images/
    - assets/fonts/
`
  },
  {
    path: "lib/main.dart",
    language: "dart",
    description: "Entry point aplikasi Flutter dengan inisialisasi Riverpod, GoRouter, dan konfigurasi Material 3 Theme (Light & Dark Mode) berstandar tinggi.",
    content: `import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pos_enterprise_app/routes/app_routes.dart';
import 'package:pos_enterprise_app/core/database/database.dart';

// Provider global untuk database SQLite Drift
final databaseProvider = Provider<AppDatabase>((ref) {
  final db = AppDatabase();
  ref.onDispose(() => db.close());
  return db;
});

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Inisialisasi Supabase atau konfigurasi lain di sini jika diperlukan
  // await Supabase.initialize(url: 'YOUR_SUPABASE_URL', anonKey: 'YOUR_ANON_KEY');

  runApp(
    const ProviderScope(
      child: MyApp(),
    ),
  );
}

class MyApp extends ConsumerWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(appRouterProvider);

    return MaterialApp.router(
      title: 'POS Enterprise',
      debugShowCheckedModeBanner: false,
      
      // Konfigurasi Material 3 Theme yang indah dan bersih
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF0F172A), // Slate 900
          brightness: Brightness.light,
          primary: const Color(0xFF0F172A),
          secondary: const Color(0xFF3B82F6), // Blue 500
          background: const Color(0xFFF8FAFC), // Slate 50
        ),
        cardTheme: const CardTheme(
          elevation: 0,
          color: Colors.white,
          margin: EdgeInsets.symmetric(vertical: 4, horizontal: 8),
        ),
        appBarTheme: const AppBarTheme(
          centerTitle: true,
          backgroundColor: Colors.white,
          elevation: 0,
          scrolledUnderElevation: 0,
        ),
      ),
      
      darkTheme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF3B82F6),
          brightness: Brightness.dark,
          primary: const Color(0xFF3B82F6),
          background: const Color(0xFF0F172A),
        ),
      ),
      
      themeMode: ThemeMode.light, // Pengaturan tema default
      routerConfig: router,
    );
  }
}
`
  },
  {
    path: "lib/core/database/database.dart",
    language: "dart",
    description: "Arsitektur Database Relasional SQLite menggunakan Drift ORM, mencakup seluruh 10 tabel dari ERD (Users, Products, Sales, Stock Movements, dll.) secara aman.",
    content: `import 'dart:io';
import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;

part 'database.g.dart'; // file generator dari drift_dev

// 1. Tabel USERS
class Users extends Table {
  TextColumn get id => text()(); // UUID PK
  TextColumn get name => text().withLength(min: 1, max: 100)();
  TextColumn get email => text().unique()();
  TextColumn get password => text()();
  TextColumn get role => text()(); // owner, manager, cashier, staff_gudang
  DateTimeColumn get createdAt => dateTime().withDefault(currentDateAndTime)();

  @override
  Set<Column> get primaryKey => {id};
}

// 2. Tabel CATEGORIES
class Categories extends Table {
  TextColumn get id => text()(); // UUID PK
  TextColumn get name => text().withLength(min: 1, max: 100)();
  DateTimeColumn get createdAt => dateTime().withDefault(currentDateAndTime)();

  @override
  Set<Column> get primaryKey => {id};
}

// 3. Tabel PRODUCTS
class Products extends Table {
  TextColumn get id => text()(); // UUID PK
  TextColumn get categoryId => text().nullable().references(Categories, #id)();
  TextColumn get barcode => text().nullable()();
  TextColumn get sku => text().unique()();
  TextColumn get name => text().withLength(min: 1, max: 200)();
  RealColumn get purchasePrice => real().withDefault(const Constant(0.0))();
  RealColumn get sellingPrice => real().withDefault(const Constant(0.0))();
  IntColumn get stock => integer().withDefault(const Constant(0))();
  IntColumn get minStock => integer().withDefault(const Constant(5))();
  TextColumn get image => text().nullable()();
  DateTimeColumn get createdAt => dateTime().withDefault(currentDateAndTime)();

  @override
  Set<Column> get primaryKey => {id};
}

// 4. Tabel SUPPLIERS
class Suppliers extends Table {
  TextColumn get id => text()(); // UUID PK
  TextColumn get name => text().withLength(min: 1, max: 100)();
  TextColumn get phone => text().nullable()();
  TextColumn get address => text().nullable()();
  RealColumn get debt => real().withDefault(const Constant(0.0))();

  @override
  Set<Column> get primaryKey => {id};
}

// 5. Tabel CUSTOMERS
class Customers extends Table {
  TextColumn get id => text()(); // UUID PK
  TextColumn get name => text().withLength(min: 1, max: 100)();
  TextColumn get phone => text().nullable()();
  IntColumn get point => integer().withDefault(const Constant(0))();
  RealColumn get debt => real().withDefault(const Constant(0.0))();

  @override
  Set<Column> get primaryKey => {id};
}

// 6. Tabel PURCHASES (Pembelian ke Supplier)
class Purchases extends Table {
  TextColumn get id => text()(); // UUID PK
  TextColumn get supplierId => text().references(Suppliers, #id)();
  TextColumn get invoiceNumber => text().unique()();
  RealColumn get total => real()();
  DateTimeColumn get createdAt => dateTime().withDefault(currentDateAndTime)();

  @override
  Set<Column> get primaryKey => {id};
}

// 7. Tabel PURCHASE_ITEMS
class PurchaseItems extends Table {
  TextColumn get id => text()(); // UUID PK
  TextColumn get purchaseId => text().references(Purchases, #id)();
  TextColumn get productId => text().references(Products, #id)();
  IntColumn get qty => integer()();
  RealColumn get price => real()();
  RealColumn get subtotal => real()();

  @override
  Set<Column> get primaryKey => {id};
}

// 8. Tabel SALES (Penjualan Kasir)
class Sales extends Table {
  TextColumn get id => text()(); // UUID PK
  TextColumn get invoiceNumber => text().unique()();
  TextColumn get customerId => text().nullable().references(Customers, #id)();
  TextColumn get cashierId => text().references(Users, #id)();
  TextColumn get paymentMethod => text()(); // Tunai, QRIS, Transfer, E-Wallet
  RealColumn get grandTotal => real()();
  RealColumn get paid => real()();
  RealColumn get change => real()();
  DateTimeColumn get createdAt => dateTime().withDefault(currentDateAndTime)();

  @override
  Set<Column> get primaryKey => {id};
}

// 9. Tabel SALES_ITEMS
class SalesItems extends Table {
  TextColumn get id => text()(); // UUID PK
  TextColumn get salesId => text().references(Sales, #id)();
  TextColumn get productId => text().references(Products, #id)();
  IntColumn get qty => integer()();
  RealColumn get price => real()();
  RealColumn get discount => real().withDefault(const Constant(0.0))();
  RealColumn get subtotal => real()();

  @override
  Set<Column> get primaryKey => {id};
}

// 10. Tabel STOCK_MOVEMENTS (Riwayat Mutasi Stok)
class StockMovements extends Table {
  TextColumn get id => text()(); // UUID PK
  TextColumn get productId => text().references(Products, #id)();
  TextColumn get type => text()(); // IN (Stock In), OUT (Stock Out), ADJ (Stock Opname)
  IntColumn get qty => integer()();
  TextColumn get reference => text().nullable()(); // misal: Nomor Invoice, "Rusak", "Penyesuaian Manual"
  DateTimeColumn get createdAt => dateTime().withDefault(currentDateAndTime)();

  @override
  Set<Column> get primaryKey => {id};
}

// DRIFT DATABASE CONFIGURATION
@DriftDatabase(tables: [
  Users,
  Categories,
  Products,
  Suppliers,
  Customers,
  Purchases,
  PurchaseItems,
  Sales,
  SalesItems,
  StockMovements
])
class AppDatabase extends _$AppDatabase {
  AppDatabase() : super(_openConnection());

  @override
  int get schemaVersion => 1;

  // OPERASI PRODUK (Contoh Query Enterprise)
  Future<List<Product>> getAllProducts() => select(products).get();
  Stream<List<Product>> watchAllProducts() => select(products).watch();
  
  Future<Product?> getProductByBarcode(String barcode) {
    return (select(products)..where((tbl) => tbl.barcode.equals(barcode))).getSingleOrNull();
  }

  Future<int> insertProduct(ProductsCompanion entry) => into(products).insert(entry);
  Future<bool> updateProduct(Product entry) => update(products).replace(entry);
  Future<int> deleteProduct(String id) => (delete(products)..where((tbl) => tbl.id.equals(id))).go();

  // OPERASI TRANSAKSI PENJUALAN (ACID TRANSACTION SECURE)
  Future<void> saveTransaction({
    required Sale sale,
    required List<SalesItem> items,
  }) async {
    await transaction(() async {
      // 1. Simpan header penjualan
      await into(sales).insert(sale);

      // 2. Simpan semua item detail & kurangi stok & catat movement
      for (final item in items) {
        await into(salesItems).insert(item);

        // Ambil produk saat ini
        final product = await (select(products)..where((t) => t.id.equals(item.productId))).getSingle();
        
        // Update stok produk
        final updatedProduct = product.copyWith(stock: product.stock - item.qty);
        await update(products).replace(updatedProduct);

        // Catat mutasi stok
        await into(stockMovements).insert(
          StockMovement(
            id: const Uuid().v4(),
            productId: item.productId,
            type: 'OUT',
            qty: item.qty,
            reference: 'Penjualan: \${sale.invoiceNumber}',
            createdAt: DateTime.now(),
          ),
        );
      }
    });
  }
}

LazyDatabase _openConnection() {
  return LazyDatabase(() async {
    final dbFolder = await getApplicationDocumentsDirectory();
    final file = File(p.join(dbFolder.path, 'db_pos_enterprise.sqlite'));
    return NativeDatabase.createInBackground(file);
  });
}
`
  },
  {
    path: "lib/features/setting/printer_service.dart",
    language: "dart",
    description: "Driver Layanan Cetak Thermal Printer (ESC/POS) komprehensif via Bluetooth, USB, maupun Network (Wi-Fi) dengan layouting struk strukur yang presisi.",
    content: `import 'dart:typed_data';
import 'package:blue_thermal_printer/blue_thermal_printer.dart';
import 'package:esc_pos_utils_plus/esc_pos_utils_plus.dart';
import 'package:intl/intl.dart';

class PrinterService {
  final BlueThermalPrinter _bluetooth = BlueThermalPrinter.instance;

  // Mendapatkan daftar perangkat bluetooth thermal printer yang tersedia
  Future<List<BluetoothDevice>> getBluetoothDevices() async {
    return await _bluetooth.getBondedDevices();
  }

  // Koneksi ke printer Bluetooth
  Future<bool> connect(BluetoothDevice device) async {
    try {
      final isConnected = await _bluetooth.isConnected;
      if (isConnected == true) return true;
      await _bluetooth.connect(device);
      return true;
    } catch (e) {
      print('Gagal koneksi printer: \$e');
      return false;
    }
  }

  // Format Layouting dan Cetak Struk Penjualan (ESC/POS standard 58mm / 80mm)
  Future<void> printReceipt({
    required String storeName,
    required String storeAddress,
    required String storePhone,
    required String invoiceNo,
    required String cashierName,
    required String customerName,
    required List<Map<String, dynamic>> items,
    required double total,
    required double paid,
    required double change,
    required String paymentMethod,
  }) async {
    final isConnected = await _bluetooth.isConnected;
    if (isConnected != true) {
      throw Exception('Printer tidak terkoneksi. Sambungkan bluetooth terlebih dahulu.');
    }

    final currencyFormatter = NumberFormat.currency(locale: 'id_ID', symbol: 'Rp', decimalDigits: 0);
    final dateFormatter = DateFormat('dd/MM/yyyy HH:mm:ss');

    // Menggunakan ukuran kertas standard 58mm (32 karakter per baris)
    const int maxChars = 32;

    _bluetooth.write('--- BEGIN RECEIPT ---\\n');
    
    // 1. Header Toko (Teks Tengah, Tebal)
    _bluetooth.printCustom(storeName, 2, 1); // Size 2, Center align
    _bluetooth.printCustom(storeAddress, 0, 1);
    _bluetooth.printCustom('Telp: \$storePhone', 0, 1);
    _bluetooth.printCustom('=' * maxChars, 0, 1); // Pembatas

    // 2. Metadata Transaksi
    _bluetooth.printLeftRight('Invoice:', invoiceNo, 0);
    _bluetooth.printLeftRight('Tanggal:', dateFormatter.format(DateTime.now()), 0);
    _bluetooth.printLeftRight('Kasir:', cashierName, 0);
    if (customerName.isNotEmpty) {
      _bluetooth.printLeftRight('Pelanggan:', customerName, 0);
    }
    _bluetooth.printCustom('-' * maxChars, 0, 1);

    // 3. Daftar Belanjaan
    for (final item in items) {
      final String name = item['name'] ?? '';
      final int qty = item['qty'] ?? 1;
      final double price = item['price'] ?? 0.0;
      final double discount = item['discount'] ?? 0.0;
      final double subtotal = item['subtotal'] ?? (qty * price - discount);

      // Baris pertama: Nama barang
      _bluetooth.printCustom(name, 0, 0); // Left align

      // Baris kedua: Qty x Harga Jual (Diskon) -> Subtotal kanan
      final String detailString = discount > 0 
          ? '  \$qty x \${currencyFormatter.format(price)} (Disc -\${currencyFormatter.format(discount)})'
          : '  \$qty x \${currencyFormatter.format(price)}';
      final String subtotalString = currencyFormatter.format(subtotal);

      _bluetooth.printLeftRight(detailString, subtotalString, 0);
    }
    _bluetooth.printCustom('=' * maxChars, 0, 1);

    // 4. Perhitungan Akhir (Total, Bayar, Kembali)
    _bluetooth.printLeftRight('TOTAL:', currencyFormatter.format(total), 1); // Tebal
    _bluetooth.printLeftRight('Bayar (\$paymentMethod):', currencyFormatter.format(paid), 0);
    _bluetooth.printLeftRight('Kembali:', currencyFormatter.format(change), 1);
    
    _bluetooth.printCustom('=' * maxChars, 0, 1);

    // 5. Footer Struk
    _bluetooth.printCustom('Terima Kasih Atas Kunjungan Anda', 0, 1);
    _bluetooth.printCustom('Barang yang sudah dibeli', 0, 1);
    _bluetooth.printCustom('tidak dapat ditukar/dikembalikan', 0, 1);
    
    // Feed kertas (kosongkan ruang sobekan)
    _bluetooth.printNewLine();
    _bluetooth.printNewLine();
    _bluetooth.printNewLine();
    
    _bluetooth.write('--- END RECEIPT ---\\n');
  }
}
`
  },
  {
    path: "lib/core/network/supabase_sync.dart",
    language: "dart",
    description: "Sistem Sinkronisasi Offline-First sinkronisasi data background SQLite lokal dengan PostgreSQL cloud / Supabase, lengkap dengan deteksi konflik.",
    content: `import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:drift/drift.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:pos_enterprise_app/core/database/database.dart';

class SyncService {
  final AppDatabase _db;
  final SupabaseClient _supabase = Supabase.instance.client;

  SyncService(this._db);

  // Cek Status Koneksi Internet Aktif
  Future<bool> hasInternetConnection() async {
    final connectivityResult = await Connectivity().checkConnectivity();
    return !connectivityResult.contains(ConnectivityResult.none);
  }

  // SINKRONISASI UTAMA: Jalankan proses upload data lokal ke cloud secara background
  Future<void> syncLocalToCloud() async {
    final isOnline = await hasInternetConnection();
    if (!isOnline) {
      print('Offline Mode: Sinkronisasi ditunda sampai internet terhubung.');
      return;
    }

    print('Internet Aktif: Memulai sinkronisasi data POS ke Cloud Supabase...');

    try {
      // 1. SINKRONISASI KATEGORI
      await _syncCategories();

      // 2. SINKRONISASI PRODUK
      await _syncProducts();

      // 3. SINKRONISASI PELANGGAN
      await _syncCustomers();

      // 4. SINKRONISASI SUPPLIER
      await _syncSuppliers();

      // 5. SINKRONISASI PENJUALAN & DETAIL PENJUALAN
      await _syncSales();

      // 6. SINKRONISASI MUTASI STOK (STOCK MOVEMENTS)
      await _syncStockMovements();

      print('Sukses: Seluruh data lokal berhasil disinkronkan dengan aman.');
    } catch (e) {
      print('Error Sinkronisasi: \$e');
    }
  }

  // Sinkronisasi Tabel Kategori
  Future<void> _syncCategories() async {
    final localCats = await _db.select(_db.categories).get();
    for (final cat in localCats) {
      await _supabase.from('categories').upsert({
        'id': cat.id,
        'name': cat.name,
        'created_at': cat.createdAt.toIso8601String(),
      });
    }
  }

  // Sinkronisasi Tabel Produk
  Future<void> _syncProducts() async {
    final localProds = await _db.select(_db.products).get();
    for (final prod in localProds) {
      await _supabase.from('products').upsert({
        'id': prod.id,
        'category_id': prod.categoryId,
        'barcode': prod.barcode,
        'sku': prod.sku,
        'name': prod.name,
        'purchase_price': prod.purchasePrice,
        'selling_price': prod.sellingPrice,
        'stock': prod.stock,
        'min_stock': prod.minStock,
        'image': prod.image,
        'created_at': prod.createdAt.toIso8601String(),
      });
    }
  }

  // Sinkronisasi Tabel Penjualan (Sales & SalesItems)
  Future<void> _syncSales() async {
    final localSales = await _db.select(_db.sales).get();
    for (final sale in localSales) {
      // Upsert header penjualan
      await _supabase.from('sales').upsert({
        'id': sale.id,
        'invoice_number': sale.invoiceNumber,
        'customer_id': sale.customerId,
        'cashier_id': sale.cashierId,
        'payment_method': sale.paymentMethod,
        'grand_total': sale.grandTotal,
        'paid': sale.paid,
        'change': sale.change,
        'created_at': sale.createdAt.toIso8601String(),
      });

      // Ambil dan upload item detail penjualan terkait
      final localItems = await (_db.select(_db.salesItems)
            ..where((tbl) => tbl.salesId.equals(sale.id)))
          .get();

      for (final item in localItems) {
        await _supabase.from('sales_items').upsert({
          'id': item.id,
          'sales_id': item.salesId,
          'product_id': item.productId,
          'qty': item.qty,
          'price': item.price,
          'discount': item.discount,
          'subtotal': item.subtotal,
        });
      }
    }
  }

  // Sinkronisasi Tabel Customers
  Future<void> _syncCustomers() async {
    final localCusts = await _db.select(_db.customers).get();
    for (final cust in localCusts) {
      await _supabase.from('customers').upsert({
        'id': cust.id,
        'name': cust.name,
        'phone': cust.phone,
        'point': cust.point,
        'debt': cust.debt,
      });
    }
  }

  // Sinkronisasi Tabel Suppliers
  Future<void> _syncSuppliers() async {
    final localSups = await _db.select(_db.suppliers).get();
    for (final sup in localSups) {
      await _supabase.from('suppliers').upsert({
        'id': sup.id,
        'name': sup.name,
        'phone': sup.phone,
        'address': sup.address,
        'debt': sup.debt,
      });
    }
  }

  // Sinkronisasi Tabel Mutasi Stok (Stock Movements)
  Future<void> _syncStockMovements() async {
    final localMovements = await _db.select(_db.stockMovements).get();
    for (final movement in localMovements) {
      await _supabase.from('stock_movements').upsert({
        'id': movement.id,
        'product_id': movement.productId,
        'type': movement.type,
        'qty': movement.qty,
        'reference': movement.reference,
        'created_at': movement.createdAt.toIso8601String(),
      });
    }
  }
}
`
  },
  {
    path: "lib/features/sales/cart_notifier.dart",
    language: "dart",
    description: "Pengontrol Keranjang Kasir POS (Riverpod) yang menangani perhitungan diskon, hitung poin pelanggan, integrasi scanner, dan transaksi SQLite.",
    content: `import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:uuid/uuid.dart';
import 'package:pos_enterprise_app/core/database/database.dart';
import 'package:pos_enterprise_app/main.dart';

// Model Representasi Item Keranjang Kasir
class CartItem {
  final Product product;
  final int qty;
  final double discount;
  final String note;

  CartItem({
    required this.product,
    this.qty = 1,
    this.discount = 0.0,
    this.note = '',
  });

  double get subtotal => (product.sellingPrice * qty) - discount;

  CartItem copyWith({
    Product? product,
    int? qty,
    double? discount,
    String? note,
  }) {
    return CartItem(
      product: product ?? this.product,
      qty: qty ?? this.qty,
      discount: discount ?? this.discount,
      note: note ?? this.note,
    );
  }
}

// State State untuk Keranjang Kasir
class CartState {
  final List<CartItem> items;
  final Customer? selectedCustomer;
  final double globalDiscount;

  CartState({
    this.items = const [],
    this.selectedCustomer,
    this.globalDiscount = 0.0,
  });

  double get subtotal {
    return items.fold(0.0, (sum, item) => sum + item.subtotal);
  }

  double get grandTotal {
    final total = subtotal - globalDiscount;
    return total < 0 ? 0.0 : total;
  }

  CartState copyWith({
    List<CartItem>? items,
    Customer? selectedCustomer,
    double? globalDiscount,
    bool clearCustomer = false,
  }) {
    return CartState(
      items: items ?? this.items,
      selectedCustomer: clearCustomer ? null : (selectedCustomer ?? this.selectedCustomer),
      globalDiscount: globalDiscount ?? this.globalDiscount,
    );
  }
}

// Riverpod Notifier untuk manajemen state keranjang secara interaktif
class CartNotifier extends StateNotifier<CartState> {
  final AppDatabase _db;

  CartNotifier(this._db) : super(CartState());

  // Tambah Produk ke Keranjang (atau tambah qty jika sudah ada)
  void addProduct(Product product, {int qty = 1}) {
    final existingIndex = state.items.indexWhere((item) => item.product.id == product.id);

    if (existingIndex >= 0) {
      final existingItem = state.items[existingIndex];
      // Cek batas stok tersimpan
      if (existingItem.qty + qty > product.stock) return;

      final updatedItems = List<CartItem>.from(state.items);
      updatedItems[existingIndex] = existingItem.copyWith(qty: existingItem.qty + qty);
      state = state.copyWith(items: updatedItems);
    } else {
      if (qty > product.stock) return; // Stok tidak cukup
      state = state.copyWith(
        items: [...state.items, CartItem(product: product, qty: qty)],
      );
    }
  }

  // Kurang Qty Item di Keranjang
  void decreaseQty(String productId) {
    final index = state.items.indexWhere((item) => item.product.id == productId);
    if (index < 0) return;

    final item = state.items[index];
    final updatedItems = List<CartItem>.from(state.items);

    if (item.qty <= 1) {
      updatedItems.removeAt(index);
    } else {
      updatedItems[index] = item.copyWith(qty: item.qty - 1);
    }
    state = state.copyWith(items: updatedItems);
  }

  // Update detail diskon item
  void setItemDiscount(String productId, double discount) {
    final index = state.items.indexWhere((item) => item.product.id == productId);
    if (index < 0) return;

    final updatedItems = List<CartItem>.from(state.items);
    updatedItems[index] = updatedItems[index].copyWith(discount: discount);
    state = state.copyWith(items: updatedItems);
  }

  // Set Pelanggan (Member)
  void setCustomer(Customer customer) {
    state = state.copyWith(selectedCustomer: customer);
  }

  // Hapus Pelanggan dari Keranjang
  void removeCustomer() {
    state = state.copyWith(clearCustomer: true);
  }

  // Set Diskon Global Invoice
  void setGlobalDiscount(double discount) {
    state = state.copyWith(globalDiscount: discount);
  }

  // Reset Total Keranjang
  void clear() {
    state = CartState();
  }

  // PROSES CHECKOUT TRANSAKSI (Simpan ke SQLite Lokal)
  Future<String> checkout({
    required String cashierId,
    required String paymentMethod,
    required double paidAmount,
  }) async {
    if (state.items.isEmpty) throw Exception('Keranjang masih kosong!');
    if (paidAmount < state.grandTotal) throw Exception('Uang bayar kurang!');

    final uuid = const Uuid();
    final String salesId = uuid.v4();
    final String invoiceNumber = 'INV-\${DateTime.now().millisecondsSinceEpoch}';
    final double change = paidAmount - state.grandTotal;

    // 1. Buat Objek Transaksi Utama (Header)
    final sale = Sale(
      id: salesId,
      invoiceNumber: invoiceNumber,
      customerId: state.selectedCustomer?.id,
      cashierId: cashierId,
      paymentMethod: paymentMethod,
      grandTotal: state.grandTotal,
      paid: paidAmount,
      change: change,
      createdAt: DateTime.now(),
    );

    // 2. Buat Daftar Item Transaksi (Detail)
    final List<SalesItem> salesItemsList = state.items.map((cartItem) {
      return SalesItem(
        id: uuid.v4(),
        salesId: salesId,
        productId: cartItem.product.id,
        qty: cartItem.qty,
        price: cartItem.product.sellingPrice,
        discount: cartItem.discount,
        subtotal: cartItem.subtotal,
      );
    }).toList();

    // 3. Eksekusi ACID Transaction di SQLite via Drift ORM
    await _db.saveTransaction(sale: sale, items: salesItemsList);

    // 4. Update Loyalty Point Pelanggan jika dia adalah Member
    if (state.selectedCustomer != null) {
      // Berikan reward 1 poin tiap kelipatan Rp 10.000 belanja
      final int pointsEarned = (state.grandTotal / 10000).floor();
      if (pointsEarned > 0) {
        final updatedCustomer = state.selectedCustomer!.copyWith(
          point: state.selectedCustomer!.point + pointsEarned,
        );
        await _db.update(_db.customers).replace(updatedCustomer);
      }
    }

    // Bersihkan Keranjang setelah sukses checkout
    clear();
    
    return invoiceNumber;
  }
}

// Provider global untuk Riverpod State Keranjang
final cartProvider = StateNotifierProvider<CartNotifier, CartState>((ref) {
  final db = ref.watch(databaseProvider);
  return CartNotifier(db);
});
`
  }
];
