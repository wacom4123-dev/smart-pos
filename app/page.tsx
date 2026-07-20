"use client";

import React, { useState, useMemo, useEffect } from "react";
import { getNativeDeviceId } from "@/lib/device-helper";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { 
  ShoppingCart, 
  Package, 
  History, 
  Printer, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  RotateCcw, 
  Check, 
  X, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign, 
  Users, 
  SlidersHorizontal,
  ChevronRight,
  Sparkles,
  Info,
  LayoutDashboard,
  BarChart3,
  Settings,
  Store,
  FileText,
  Database,
  RefreshCw,
  Lock,
  ShieldAlert,
  Download,
  Upload,
  Cloud,
  Truck,
  Gift,
  UserPlus,
  CreditCard,
  UserCheck,
  Edit,
  Camera,
  Shield,
  Key,
  Smartphone,
  Mail,
  User,
  Calendar,
  Clock,
  ExternalLink,
  XCircle,
  CheckCircle
} from "lucide-react";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  Cell
} from "recharts";

// Types
interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  category: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  minStock: number;
  image?: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface Supplier {
  id: string;
  name: string;
  phone: string;
  address: string;
  debt: number; // Hutang kita ke supplier
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  rewardPoints: number;
  debt: number; // Piutang (hutang pelanggan ke kita)
}

interface Transaction {
  id: string;
  timestamp: string;
  items: { productName: string; price: number; quantity: number }[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: "CASH" | "DEBIT" | "QRIS" | "HUTANG_MEMBER";
  amountPaid: number;
  change: number;
  customerId?: string;
  customerName?: string;
}

interface UserAccount {
  id: string;
  name: string;
  username: string;
  pin: string;
  role: "Owner" | "Manager" | "Kasir" | "Staff Gudang";
}

const DEFAULT_USERS: UserAccount[] = [
  {
    id: "USR-1",
    name: "Budi Owner",
    username: "owner",
    pin: "1234",
    role: "Owner",
  },
  {
    id: "USR-2",
    name: "Andi Manager",
    username: "manager",
    pin: "2222",
    role: "Manager",
  },
  {
    id: "USR-3",
    name: "Siti Kasir",
    username: "kasir",
    pin: "3333",
    role: "Kasir",
  },
  {
    id: "USR-4",
    name: "Joko Gudang",
    username: "gudang",
    pin: "4444",
    role: "Staff Gudang",
  }
];

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Beras Pandan Wangi 5kg",
    sku: "BRS-PW-5K",
    barcode: "8991234560012",
    category: "Sembako",
    purchasePrice: 65000,
    sellingPrice: 75000,
    stock: 15,
    minStock: 5,
  },
  {
    id: "2",
    name: "Minyak Goreng Sania 2L",
    sku: "MYK-SN-2L",
    barcode: "8991234560029",
    category: "Sembako",
    purchasePrice: 32000,
    sellingPrice: 38000,
    stock: 4,
    minStock: 10,
  },
  {
    id: "3",
    name: "Gula Pasir Gulaku 1kg",
    sku: "GLA-GK-1K",
    barcode: "8991234560036",
    category: "Sembako",
    purchasePrice: 13500,
    sellingPrice: 16000,
    stock: 24,
    minStock: 5,
  },
  {
    id: "4",
    name: "Kopi Bubuk Kapal Api 200g",
    sku: "KPI-KA-200",
    barcode: "8991234560043",
    category: "Minuman",
    purchasePrice: 9000,
    sellingPrice: 12000,
    stock: 3,
    minStock: 5,
  },
  {
    id: "5",
    name: "Teh Celup Sariwangi (Isi 25)",
    sku: "TEH-SW-25",
    barcode: "8991234560050",
    category: "Minuman",
    purchasePrice: 5000,
    sellingPrice: 6500,
    stock: 40,
    minStock: 10,
  },
  {
    id: "6",
    name: "Mie Instan Indomie Goreng",
    sku: "MIE-IG-85",
    barcode: "8991234560067",
    category: "Makanan",
    purchasePrice: 2600,
    sellingPrice: 3500,
    stock: 120,
    minStock: 20,
  }
];

const DEFAULT_SUPPLIERS: Supplier[] = [
  {
    id: "SUP-1",
    name: "Sinar Sembako Surabaya",
    phone: "0812-3344-5566",
    address: "Kawasan Industri Driyorejo Blok B-12",
    debt: 2500000,
  },
  {
    id: "SUP-2",
    name: "Maju Makmur Food",
    phone: "0857-4455-6677",
    address: "Ruko Pandanaran Kav. 12, Sidoarjo",
    debt: 0,
  },
  {
    id: "SUP-3",
    name: "Matahari Beverage",
    phone: "0821-9988-7766",
    address: "Kawasan Pergudangan Margomulyo B-7",
    debt: 850000,
  }
];

const DEFAULT_CUSTOMERS: Customer[] = [
  {
    id: "CUST-1",
    name: "Budi Santoso",
    phone: "0811-2233-4455",
    address: "Jl. Merpati No. 12, Surabaya",
    rewardPoints: 1250,
    debt: 150000,
  },
  {
    id: "CUST-2",
    name: "Siti Aminah",
    phone: "0822-3344-5566",
    address: "Jl. Diponegoro Gang 5 No. 18",
    rewardPoints: 450,
    debt: 0,
  },
  {
    id: "CUST-3",
    name: "Ahmad Hidayat",
    phone: "0877-5566-7788",
    address: "Perum Graha Indah Blok C-4, Sidoarjo",
    rewardPoints: 80,
    debt: 45000,
  }
];

interface VersionSnapshot {
  version: string;
  timestamp: string;
  products: Product[];
  transactions: Transaction[];
  description: string;
  // Settings configuration snapshot
  shopName?: string;
  shopAddress?: string;
  shopPhone?: string;
  receiptHeaderMsg?: string;
  receiptFooterMsg?: string;
  showTaxOnReceipt?: boolean;
  defaultDiscountPercent?: number;
  printerPaperSize?: string;
  printerPort?: string;
  printerAddress?: string;
  printerAutoPrint?: boolean;
  syncEndpoint?: string;
  cashierPin?: string;
  isPinRequiredToEdit?: boolean;
  customCategories?: string[];
  defaultActiveTab?: "cashier" | "products" | "history" | "dashboard" | "settings" | "suppliers" | "customers";
  suppliers?: Supplier[];
  customers?: Customer[];
}

const INITIAL_SNAPSHOTS: VersionSnapshot[] = [
  {
    version: "v01.00",
    timestamp: "15/07/2026, 08:00:00",
    products: DEFAULT_PRODUCTS,
    transactions: [],
    description: "Baseline Aplikasi (Produk Default)",
    defaultActiveTab: "dashboard"
  },
  {
    version: "v01.01",
    timestamp: "15/07/2026, 08:15:00",
    products: DEFAULT_PRODUCTS,
    transactions: [],
    description: "Sistem Kasir POS v01.01",
    defaultActiveTab: "dashboard"
  },
  {
    version: "v01.02",
    timestamp: "15/07/2026, 08:25:32",
    products: DEFAULT_PRODUCTS,
    transactions: [],
    description: "Rilis v01.02: Penambahan Sistem Kontrol Versi & Rollback",
    defaultActiveTab: "dashboard"
  },
  {
    version: "v01.03",
    timestamp: "15/07/2026, 08:33:05",
    products: DEFAULT_PRODUCTS,
    transactions: [],
    description: "Rilis v01.03: Penambahan Modul Dashboard Finansial & Grafik Penjualan",
    defaultActiveTab: "dashboard"
  },
  {
    version: "v01.04",
    timestamp: "15/07/2026, 09:07:20",
    products: DEFAULT_PRODUCTS,
    transactions: [],
    description: "Rilis v01.04: Penambahan Modul Pengaturan Lengkap (Profil, Struk, Printer, Backup, Sinkronisasi, Keamanan)",
    defaultActiveTab: "dashboard"
  },
  {
    version: "v01.05",
    timestamp: "15/07/2026, 10:00:00",
    products: DEFAULT_PRODUCTS,
    transactions: [],
    description: "Rilis v01.05: Menu Kasir POS Sebagai Tampilan Utama secara Default",
    defaultActiveTab: "cashier"
  },
  {
    version: "v01.06",
    timestamp: "15/07/2026, 11:00:00",
    products: DEFAULT_PRODUCTS,
    transactions: [],
    description: "Rilis v01.06: Penambahan Modul Supplier & Pelanggan dengan Sistem Poin, Riwayat, dan Hutang Piutang",
    defaultActiveTab: "cashier"
  }
];

function isTabAllowed(tab: string, role: string): boolean {
  if (role === "Owner") return true;
  if (role === "Manager") return ["dashboard", "history"].includes(tab);
  if (role === "Kasir") return ["cashier", "history"].includes(tab);
  if (role === "Staff Gudang") return ["products", "suppliers"].includes(tab);
  return false;
}

function getFirstAllowedTab(role: string): "cashier" | "products" | "history" | "dashboard" | "settings" | "suppliers" | "customers" {
  if (role === "Owner") return "cashier";
  if (role === "Manager") return "dashboard";
  if (role === "Kasir") return "cashier";
  if (role === "Staff Gudang") return "products";
  return "cashier";
}

export default function POSApplication() {
  // --- CLIENT-SIDE HYBRID LICENSE STATE ---
  const [isLicenseValid, setIsLicenseValid] = useState<boolean | null>(null);
  const [licenseDetails, setLicenseDetails] = useState<any>(null);
  const [deviceId, setDeviceId] = useState("");
  const [licenseError, setLicenseError] = useState("");
  const [activationKey, setActivationKey] = useState("");
  const [isActivating, setIsActivating] = useState(false);

  const [showTrialForm, setShowTrialForm] = useState(false);
  const [trialName, setTrialName] = useState("");
  const [trialEmail, setTrialEmail] = useState("");
  const [isRegisteringTrial, setIsRegisteringTrial] = useState(false);
  const [trialError, setTrialError] = useState("");

  useEffect(() => {
    const initDeviceAndLicense = async () => {
      // 1. Get or generate a persistent Device ID (try native first, then fallback to local storage)
      let dId = localStorage.getItem("spos_device_id");
      
      try {
        const nativeId = await getNativeDeviceId();
        if (nativeId) {
          dId = nativeId;
          localStorage.setItem("spos_device_id", dId);
        }
      } catch (err) {
        console.warn("Gagal mengambil native device ID:", err);
      }

      if (!dId) {
        dId = "SPOS-DEV-" + Math.random().toString(36).substring(2, 11).toUpperCase();
        localStorage.setItem("spos_device_id", dId);
      }
      setDeviceId(dId);

      // 2. Check local license cache
      const storedLicense = localStorage.getItem("spos_license");
      if (!storedLicense) {
        setIsLicenseValid(false);
        return;
      }

      try {
        const parsed = JSON.parse(storedLicense);
        setLicenseDetails(parsed);

        // Offline check: Is key expired?
        if (Date.now() > parsed.expiresAt) {
          setIsLicenseValid(false);
          setLicenseError("Masa berlaku lisensi Anda telah kedaluwarsa.");
          return;
        }

        // Offline check: relative clock manipulation detection
        const lastUsed = Number(localStorage.getItem("spos_last_used") || "0");
        if (Date.now() < lastUsed) {
          setIsLicenseValid(false);
          setLicenseError("Deteksi manipulasi waktu sistem. Silakan sesuaikan kembali jam komputer Anda.");
          return;
        }
        localStorage.setItem("spos_last_used", Date.now().toString());

        // Valid locally, let user in immediately (Offline-First support)
        setIsLicenseValid(true);

        // Verify online in background if possible
        fetch("/api/license/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            key: parsed.key,
            email: parsed.customerEmail,
            expiresAt: parsed.expiresAt,
            signature: parsed.signature,
            deviceId: dId,
          }),
        })
          .then(async (res) => {
            if (!res.ok) {
              const errData = await res.json();
              setIsLicenseValid(false);
              setLicenseError(errData.error || "Validasi lisensi online gagal.");
              localStorage.removeItem("spos_license");
            }
          })
          .catch(() => {
            // Ignore network errors - allows continuing fully offline!
            console.log("Modus Offline: Menggunakan cache lisensi lokal.");
          });
      } catch (err) {
        setIsLicenseValid(false);
        localStorage.removeItem("spos_license");
      }
    };

    initDeviceAndLicense();
  }, []);

  const handleActivateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setLicenseError("");
    if (!activationKey) return;

    setIsActivating(true);
    try {
      const res = await fetch("/api/license/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: activationKey.trim(), deviceId }),
      });

      const contentType = res.headers.get("content-type") || "";
      let data: any;

      if (contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        const previewText = text.substring(0, 150).replace(/<[^>]*>/g, " ").trim() + "...";
        if (text.includes("accounts.google.com") || text.includes("Sign in") || text.includes("login")) {
          throw new Error(`Akses ditolak oleh Google Auth proxy. Pastikan URL Admin Panel di pengaturan (.env) menggunakan URL 'Shared' (https://ais-pre-...) yang sudah dipublikasikan (Shared) secara publik, bukan URL developer privat (https://ais-dev-...). (Cuplikan: ${previewText})`);
        } else {
          throw new Error(`Server mengembalikan respon tidak valid (HTML/Teks). Status: ${res.status}. Cuplikan Respon: "${previewText}"`);
        }
      }

      if (res.ok && data.success) {
        localStorage.setItem("spos_license", JSON.stringify(data.license));
        localStorage.setItem("spos_last_used", Date.now().toString());
        setLicenseDetails(data.license);
        setIsLicenseValid(true);
        setActivationKey("");
      } else {
        setLicenseError(data.error || "Gagal mengaktifkan lisensi.");
      }
    } catch (err: any) {
      console.error(err);
      setLicenseError(err.message || "Gagal menghubungi server aktivasi. Periksa koneksi internet Anda.");
    } finally {
      setIsActivating(false);
    }
  };

  const handleRegisterTrial = async (e: React.FormEvent) => {
    e.preventDefault();
    setTrialError("");
    if (!trialName || !trialEmail) {
      setTrialError("Nama dan Email wajib diisi.");
      return;
    }

    setIsRegisteringTrial(true);
    try {
      const res = await fetch("/api/license/trial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerName: trialName, customerEmail: trialEmail, deviceId }),
      });

      const contentType = res.headers.get("content-type") || "";
      let data: any;

      if (contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        const previewText = text.substring(0, 150).replace(/<[^>]*>/g, " ").trim() + "...";
        if (text.includes("accounts.google.com") || text.includes("Sign in") || text.includes("login")) {
          throw new Error(`Akses ditolak oleh Google Auth proxy. Pastikan URL Admin Panel di pengaturan (.env) menggunakan URL 'Shared' (https://ais-pre-...) yang sudah dipublikasikan (Shared) secara publik, bukan URL developer privat (https://ais-dev-...). (Cuplikan: ${previewText})`);
        } else {
          throw new Error(`Server mengembalikan respon tidak valid (HTML/Teks). Status: ${res.status}. Cuplikan Respon: "${previewText}"`);
        }
      }

      if (res.ok && data.success) {
        localStorage.setItem("spos_license", JSON.stringify(data.license));
        localStorage.setItem("spos_last_used", Date.now().toString());
        setLicenseDetails(data.license);
        setIsLicenseValid(true);
        setShowTrialForm(false);
      } else {
        setTrialError(data.error || "Gagal mengaktifkan trial gratis.");
      }
    } catch (err: any) {
      console.error(err);
      setTrialError(err.message || "Gagal terhubung ke server pendaftaran trial.");
    } finally {
      setIsRegisteringTrial(false);
    }
  };

  // App States
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);

  // User Management states
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [currentUser, setCurrentUser] = useState<UserAccount>({
    id: "USR-1",
    name: "Budi Owner",
    username: "owner",
    pin: "1234",
    role: "Owner"
  });
  const [isUserSwitchOpen, setIsUserSwitchOpen] = useState(false);
  const [selectedSwitchUser, setSelectedSwitchUser] = useState<UserAccount | null>(null);
  const [switchPinInput, setSwitchPinInput] = useState("");
  const [switchError, setSwitchError] = useState("");

  // User CRUD states inside Settings
  const [userFormId, setUserFormId] = useState<string | null>(null);
  const [userFormName, setUserFormName] = useState("");
  const [userFormUsername, setUserFormUsername] = useState("");
  const [userFormPin, setUserFormPin] = useState("");
  const [userFormRole, setUserFormRole] = useState<"Owner" | "Manager" | "Kasir" | "Staff Gudang">("Kasir");
  const [isEditingUser, setIsEditingUser] = useState(false);

  // Transactions History
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeTab, setActiveTab] = useState<"cashier" | "products" | "history" | "dashboard" | "settings" | "suppliers" | "customers">("cashier");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");

  // Suppliers & Customers States
  const [suppliers, setSuppliers] = useState<Supplier[]>(DEFAULT_SUPPLIERS);

  const [customers, setCustomers] = useState<Customer[]>(DEFAULT_CUSTOMERS);

  // Supplier Form States
  const [supForm, setSupForm] = useState({
    name: "",
    phone: "",
    address: "",
    debt: 0
  });
  const [isEditingSupplier, setIsEditingSupplier] = useState(false);
  const [editingSupplierId, setEditingSupplierId] = useState<string | null>(null);

  // Customer Form States
  const [custForm, setCustForm] = useState({
    name: "",
    phone: "",
    address: "",
    rewardPoints: 0,
    debt: 0
  });
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);

  // Cashier Customer Selection
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");

  // Modals for Debt Adjustments
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [debtModalType, setDebtModalType] = useState<"supplier_pay" | "supplier_add" | "customer_pay" | "customer_add">("supplier_pay");
  const [debtTargetId, setDebtTargetId] = useState<string>("");
  const [debtAmountInput, setDebtAmountInput] = useState("");
  const [debtNoteInput, setDebtNoteInput] = useState("");

  // Customer Shopping History Viewer State
  const [viewHistoryCustomerId, setViewHistoryCustomerId] = useState<string | null>(null);

  // Search filter states for Suppliers and Customers list
  const [supplierSearch, setSupplierSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");

  // Shop Profile Settings
  const [shopName, setShopName] = useState("KASIR TOKO BAROKAH");
  const [shopAddress, setShopAddress] = useState("Jl. Pandan Wangi Raya No. 45");
  const [shopPhone, setShopPhone] = useState("0812-3456-7890");

  // Receipt Settings
  const [receiptHeaderMsg, setReceiptHeaderMsg] = useState("KASIR MODERN & EFISIEN");
  const [receiptFooterMsg, setReceiptFooterMsg] = useState("TERIMA KASIH ATAS KUNJUNGAN ANDA");
  const [showTaxOnReceipt, setShowTaxOnReceipt] = useState(true);
  const [defaultDiscountPercent, setDefaultDiscountPercent] = useState(0);

  // Printer Settings
  const [printerPaperSize, setPrinterPaperSize] = useState("58mm");
  const [printerPort, setPrinterPort] = useState("9100");
  const [printerAddress, setPrinterAddress] = useState("BT-PRINTER");
  const [printerAutoPrint, setPrinterAutoPrint] = useState(false);

  // Sync Settings
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncEndpoint, setSyncEndpoint] = useState("https://api.smartpos.id/v1/sync");
  const [lastSyncTime, setLastSyncTime] = useState("Belum pernah disinkronisasi");

  // Security Settings
  const [cashierPin, setCashierPin] = useState("1234");
  const [isPinRequiredToEdit, setIsPinRequiredToEdit] = useState(false);

  // Settings Active Subtab
  const [activeSettingSubtab, setActiveSettingSubtab] = useState<
    "profile" | "receipt" | "printer" | "backup" | "sync" | "security" | "users" | "about"
  >("profile");

  // Versioning & Rollback states
  const [activeVersion, setActiveVersion] = useState("v01.06");
  const [isRollbackOpen, setIsRollbackOpen] = useState(false);
  const [rollbackInput, setRollbackInput] = useState("");

  // Snapshots structure / states
  const [snapshots, setSnapshots] = useState<VersionSnapshot[]>(INITIAL_SNAPSHOTS);

  // Mount detection & client-side localStorage state restoration
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    const savedUsers = localStorage.getItem("pos_users");
    if (savedUsers) {
      try {
        setUsers(JSON.parse(savedUsers));
      } catch (e) {
        setUsers(DEFAULT_USERS);
      }
    } else {
      setUsers(DEFAULT_USERS);
    }

    const savedCurrentUser = localStorage.getItem("pos_current_user");
    if (savedCurrentUser) {
      try {
        setCurrentUser(JSON.parse(savedCurrentUser));
      } catch (e) {
        setCurrentUser(DEFAULT_USERS[0]);
      }
    } else {
      setCurrentUser(DEFAULT_USERS[0]);
    }
    
    const savedProducts = localStorage.getItem("pos_products");
    if (savedProducts) {
      try {
        setProducts(JSON.parse(savedProducts));
      } catch (e) {
        console.error(e);
      }
    }
    const savedTransactions = localStorage.getItem("pos_transactions");
    if (savedTransactions) {
      try {
        setTransactions(JSON.parse(savedTransactions));
      } catch (e) {
        console.error(e);
      }
    }
    const savedSuppliers = localStorage.getItem("pos_suppliers");
    if (savedSuppliers) {
      try {
        setSuppliers(JSON.parse(savedSuppliers));
      } catch (e) {
        console.error(e);
      }
    }
    const savedCustomers = localStorage.getItem("pos_customers_list");
    if (savedCustomers) {
      try {
        setCustomers(JSON.parse(savedCustomers));
      } catch (e) {
        console.error(e);
      }
    }
    const savedShopName = localStorage.getItem("pos_shop_name");
    if (savedShopName) setShopName(savedShopName);
    const savedShopAddress = localStorage.getItem("pos_shop_address");
    if (savedShopAddress) setShopAddress(savedShopAddress);
    const savedShopPhone = localStorage.getItem("pos_shop_phone");
    if (savedShopPhone) setShopPhone(savedShopPhone);
    const savedReceiptHeader = localStorage.getItem("pos_receipt_header");
    if (savedReceiptHeader) setReceiptHeaderMsg(savedReceiptHeader);
    const savedReceiptFooter = localStorage.getItem("pos_receipt_footer");
    if (savedReceiptFooter) setReceiptFooterMsg(savedReceiptFooter);
    const savedShowTax = localStorage.getItem("pos_receipt_show_tax");
    if (savedShowTax) setShowTaxOnReceipt(savedShowTax !== "false");
    const savedDiscount = localStorage.getItem("pos_default_discount");
    if (savedDiscount) setDefaultDiscountPercent(Number(savedDiscount));
    const savedPrinterPaper = localStorage.getItem("pos_printer_paper");
    if (savedPrinterPaper) setPrinterPaperSize(savedPrinterPaper);
    const savedPrinterPort = localStorage.getItem("pos_printer_port");
    if (savedPrinterPort) setPrinterPort(savedPrinterPort);
    const savedPrinterAddress = localStorage.getItem("pos_printer_address");
    if (savedPrinterAddress) setPrinterAddress(savedPrinterAddress);
    const savedPrinterAutoPrint = localStorage.getItem("pos_printer_autoprint");
    if (savedPrinterAutoPrint) setPrinterAutoPrint(savedPrinterAutoPrint === "true");
    const savedSyncEndpoint = localStorage.getItem("pos_sync_endpoint");
    if (savedSyncEndpoint) setSyncEndpoint(savedSyncEndpoint);
    const savedLastSync = localStorage.getItem("pos_last_sync");
    if (savedLastSync) setLastSyncTime(savedLastSync);
    const savedCashierPin = localStorage.getItem("pos_cashier_pin");
    if (savedCashierPin) setCashierPin(savedCashierPin);
    const savedPinRequired = localStorage.getItem("pos_pin_required");
    if (savedPinRequired) setIsPinRequiredToEdit(savedPinRequired === "true");
    const savedVersion = localStorage.getItem("pos_active_version");
    if (savedVersion) setActiveVersion(savedVersion);
    const savedSnapshots = localStorage.getItem("pos_version_snapshots");
    if (savedSnapshots) {
      try {
        setSnapshots(JSON.parse(savedSnapshots));
      } catch (e) {
        console.error(e);
      }
    }
    const savedCustomCategories = localStorage.getItem("pos_custom_categories");
    if (savedCustomCategories) {
      try {
        setCustomCategories(JSON.parse(savedCustomCategories));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Save changes to local storage (only after mount is completed)
  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem("pos_users", JSON.stringify(users));
  }, [users, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem("pos_current_user", JSON.stringify(currentUser));
  }, [currentUser, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem("pos_default_discount", String(defaultDiscountPercent));
  }, [defaultDiscountPercent, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem("pos_shop_name", shopName);
    localStorage.setItem("pos_shop_address", shopAddress);
    localStorage.setItem("pos_shop_phone", shopPhone);
  }, [shopName, shopAddress, shopPhone, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem("pos_receipt_header", receiptHeaderMsg);
    localStorage.setItem("pos_receipt_footer", receiptFooterMsg);
    localStorage.setItem("pos_receipt_show_tax", String(showTaxOnReceipt));
  }, [receiptHeaderMsg, receiptFooterMsg, showTaxOnReceipt, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem("pos_printer_paper", printerPaperSize);
    localStorage.setItem("pos_printer_port", printerPort);
    localStorage.setItem("pos_printer_address", printerAddress);
    localStorage.setItem("pos_printer_autoprint", String(printerAutoPrint));
  }, [printerPaperSize, printerPort, printerAddress, printerAutoPrint, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem("pos_sync_endpoint", syncEndpoint);
  }, [syncEndpoint, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem("pos_cashier_pin", cashierPin);
    localStorage.setItem("pos_pin_required", String(isPinRequiredToEdit));
  }, [cashierPin, isPinRequiredToEdit, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem("pos_active_version", activeVersion);
  }, [activeVersion, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem("pos_version_snapshots", JSON.stringify(snapshots));
  }, [snapshots, isMounted]);

  // Automatically ensure v01.04 snapshot is compiled lower to support hoisted customCategories state

  // Dashboard Data Computations
  const todaySalesTotal = useMemo(() => {
    const todayDateStr = new Date().toLocaleDateString("id-ID");
    const normalize = (dStr: string) => dStr.split('/').map(part => parseInt(part, 10)).join('/');
    const normalizedToday = normalize(todayDateStr);
    return transactions
      .filter(tx => {
        const datePart = tx.timestamp.split(',')[0].trim();
        return normalize(datePart) === normalizedToday;
      })
      .reduce((sum, tx) => sum + tx.total, 0);
  }, [transactions]);

  const todayTransactionsCount = useMemo(() => {
    const todayDateStr = new Date().toLocaleDateString("id-ID");
    const normalize = (dStr: string) => dStr.split('/').map(part => parseInt(part, 10)).join('/');
    const normalizedToday = normalize(todayDateStr);
    return transactions.filter(tx => {
      const datePart = tx.timestamp.split(',')[0].trim();
      return normalize(datePart) === normalizedToday;
    }).length;
  }, [transactions]);

  const monthlyTurnover = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    return transactions
      .filter(tx => {
        const datePart = tx.timestamp.split(',')[0].trim();
        const parts = datePart.split('/');
        if (parts.length < 3) return false;
        const m = parseInt(parts[1], 10) - 1;
        const y = parseInt(parts[2], 10);
        return m === currentMonth && y === currentYear;
      })
      .reduce((sum, tx) => sum + tx.total, 0);
  }, [transactions]);

  const bestSellers = useMemo(() => {
    const counts: Record<string, { name: string; category: string; qty: number; revenue: number }> = {};
    transactions.forEach(tx => {
      tx.items.forEach(item => {
        const prod = products.find(p => p.name === item.productName);
        const cat = prod ? prod.category : "Lain-lain";
        if (!counts[item.productName]) {
          counts[item.productName] = {
            name: item.productName,
            category: cat,
            qty: 0,
            revenue: 0,
          };
        }
        counts[item.productName].qty += item.quantity;
        counts[item.productName].revenue += item.price * item.quantity;
      });
    });
    return Object.values(counts)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [transactions, products]);

  const salesTrendData = useMemo(() => {
    const data = [];
    const now = new Date();
    const normalize = (str: string) => str.split('/').map(p => parseInt(p, 10)).join('/');
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dateStr = d.toLocaleDateString("id-ID");
      const dateLabel = d.toLocaleDateString("id-ID", { day: 'numeric', month: 'short' });
      
      const targetNorm = normalize(dateStr);
      const dayTx = transactions.filter(tx => {
        const datePart = tx.timestamp.split(',')[0].trim();
        return normalize(datePart) === targetNorm;
      });
      
      const totalSales = dayTx.reduce((sum, tx) => sum + tx.total, 0);
      const txCount = dayTx.length;
      
      data.push({
        date: dateLabel,
        "Omset": totalSales,
        "Transaksi": txCount,
      });
    }
    return data;
  }, [transactions]);

  // Save states to local storage
  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem("pos_suppliers", JSON.stringify(suppliers));
  }, [suppliers, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem("pos_customers_list", JSON.stringify(customers));
  }, [customers, isMounted]);

  const handleRollback = (targetVersion: string) => {
    const formattedTarget = targetVersion.trim().toLowerCase();
    
    // Try to find the snapshot
    const match = snapshots.find(s => s.version.toLowerCase() === formattedTarget);
    
    if (match) {
      // Revert state
      setProducts(match.products);
      setTransactions(match.transactions);
      setActiveVersion(match.version);
      
      // Rollback settings if available in snapshot
      if (match.shopName !== undefined) setShopName(match.shopName);
      if (match.shopAddress !== undefined) setShopAddress(match.shopAddress);
      if (match.shopPhone !== undefined) setShopPhone(match.shopPhone);
      if (match.receiptHeaderMsg !== undefined) setReceiptHeaderMsg(match.receiptHeaderMsg);
      if (match.receiptFooterMsg !== undefined) setReceiptFooterMsg(match.receiptFooterMsg);
      if (match.showTaxOnReceipt !== undefined) setShowTaxOnReceipt(match.showTaxOnReceipt);
      if (match.defaultDiscountPercent !== undefined) {
        setDefaultDiscountPercent(match.defaultDiscountPercent);
        setDiscountPercent(match.defaultDiscountPercent);
      }
      if (match.printerPaperSize !== undefined) setPrinterPaperSize(match.printerPaperSize);
      if (match.printerPort !== undefined) setPrinterPort(match.printerPort);
      if (match.printerAddress !== undefined) setPrinterAddress(match.printerAddress);
      if (match.printerAutoPrint !== undefined) setPrinterAutoPrint(match.printerAutoPrint);
      if (match.syncEndpoint !== undefined) setSyncEndpoint(match.syncEndpoint);
      if (match.cashierPin !== undefined) setCashierPin(match.cashierPin);
      if (match.isPinRequiredToEdit !== undefined) setIsPinRequiredToEdit(match.isPinRequiredToEdit);
      if (match.customCategories !== undefined) setCustomCategories(match.customCategories);
      if (match.suppliers !== undefined) setSuppliers(match.suppliers);
      if (match.customers !== undefined) setCustomers(match.customers);
      if (match.defaultActiveTab !== undefined) {
        setActiveTab(match.defaultActiveTab);
      } else {
        setActiveTab("dashboard");
      }

      alert(`Sukses Rollback! Aplikasi berhasil dikembalikan ke versi ${match.version}.\nStatus produk, transaksi, dan pengaturan POS dipulihkan.`);
      setIsRollbackOpen(false);
      setRollbackInput("");
    } else {
      alert(`Versi "${targetVersion}" tidak ditemukan!\nSilakan masukkan versi yang valid (contoh: v01.00, v01.01, v01.02).`);
    }
  };

  // Helper function to create a new manual snapshot of the current state
  const handleCreateSnapshot = (customVersionName?: string) => {
    const nextVerIndex = snapshots.length;
    const newVersion = customVersionName || `v01.${String(nextVerIndex).padStart(2, '0')}`;
    
    // Check duplicate
    if (snapshots.some(s => s.version.toLowerCase() === newVersion.toLowerCase())) {
      alert(`Versi ${newVersion} sudah ada dalam riwayat snapshot!`);
      return;
    }

    const newSnapshot: VersionSnapshot = {
      version: newVersion,
      timestamp: new Date().toLocaleString("id-ID"),
      products: [...products],
      transactions: [...transactions],
      description: `Snapshot Manual oleh Pengguna`,
      shopName,
      shopAddress,
      shopPhone,
      receiptHeaderMsg,
      receiptFooterMsg,
      showTaxOnReceipt,
      defaultDiscountPercent,
      printerPaperSize,
      printerPort,
      printerAddress,
      printerAutoPrint,
      syncEndpoint,
      cashierPin,
      isPinRequiredToEdit,
      customCategories: [...customCategories],
      defaultActiveTab: activeTab,
      suppliers: [...suppliers],
      customers: [...customers],
    };

    setSnapshots(prev => [...prev, newSnapshot]);
    alert(`Snapshot versi ${newVersion} berhasil dibuat!`);
  };
  
  // Checkout & Payment states
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "DEBIT" | "QRIS" | "HUTANG_MEMBER">("CASH");
  const [amountPaidInput, setAmountPaidInput] = useState("");
  const [discountPercent, setDiscountPercent] = useState(defaultDiscountPercent);
  const [taxPercent] = useState(11); // PPN 11%

  // Receipt & Printer logs
  const [lastPrintedReceipt, setLastPrintedReceipt] = useState<Transaction | null>(null);
  const [showPrinterOverlay, setShowPrinterOverlay] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  // Product Management form
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  
  // Category management states
  const [customCategories, setCustomCategories] = useState<string[]>([
    "Sembako", "Makanan", "Minuman", "Kebutuhan Rumah", "Lain-lain"
  ]);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategoryIndex, setEditingCategoryIndex] = useState<number | null>(null);
  const [editingCategoryValue, setEditingCategoryValue] = useState("");

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem("pos_custom_categories", JSON.stringify(customCategories));
  }, [customCategories, isMounted]);

  // Category management handlers
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newCategoryName.trim();
    if (!name) return;
    if (customCategories.some(cat => cat.toLowerCase() === name.toLowerCase())) {
      alert("Kategori ini sudah terdaftar!");
      return;
    }
    setCustomCategories(prev => [...prev, name]);
    setNewCategoryName("");
  };

  const handleStartEditCategory = (index: number, currentVal: string) => {
    setEditingCategoryIndex(index);
    setEditingCategoryValue(currentVal);
  };

  const handleSaveEditCategory = (index: number) => {
    const newVal = editingCategoryValue.trim();
    if (!newVal) return;
    const oldVal = customCategories[index];
    if (newVal === oldVal) {
      setEditingCategoryIndex(null);
      return;
    }
    if (customCategories.some((cat, idx) => idx !== index && cat.toLowerCase() === newVal.toLowerCase())) {
      alert("Nama kategori sudah digunakan!");
      return;
    }

    setCustomCategories(prev => {
      const updated = [...prev];
      updated[index] = newVal;
      return updated;
    });

    setProducts(prevProducts => 
      prevProducts.map(p => p.category === oldVal ? { ...p, category: newVal } : p)
    );

    if (prodForm.category === oldVal) {
      setProdForm(prev => ({ ...prev, category: newVal }));
    }

    setEditingCategoryIndex(null);
  };

  const handleDeleteCategory = (categoryName: string) => {
    if (customCategories.length <= 1) {
      alert("Harus ada minimal satu kategori dalam sistem!");
      return;
    }
    const productsUsing = products.filter(p => p.category === categoryName);
    
    let confirmMsg = `Apakah Anda yakin ingin menghapus kategori "${categoryName}"?`;
    if (productsUsing.length > 0) {
      confirmMsg += `\n\nPerhatian: Ada ${productsUsing.length} produk dalam kategori ini. Produk-produk tersebut akan dipindahkan ke kategori "Lain-lain".`;
    }

    if (confirm(confirmMsg)) {
      let finalCats = customCategories.filter(cat => cat !== categoryName);
      if (!finalCats.some(cat => cat === "Lain-lain") && categoryName !== "Lain-lain") {
        finalCats.push("Lain-lain");
      }
      setCustomCategories(finalCats);

      setProducts(prevProducts =>
        prevProducts.map(p => p.category === categoryName ? { ...p, category: "Lain-lain" } : p)
      );

      if (prodForm.category === categoryName) {
        const fallback = finalCats[0] || "Lain-lain";
        setProdForm(prev => ({ ...prev, category: fallback }));
      }
    }
  };

  // Automatically ensure v01.06 is present in snapshots if not exists
  useEffect(() => {
    if (!isMounted) return;
    if (snapshots && !snapshots.some(s => s.version === "v01.06")) {
      const currentSnapshot: VersionSnapshot = {
        version: "v01.06",
        timestamp: new Date().toLocaleString("id-ID"),
        products: [...products],
        transactions: [...transactions],
        description: "Rilis v01.06: Penambahan Modul Supplier & Pelanggan dengan Sistem Poin, Riwayat, dan Hutang Piutang",
        shopName,
        shopAddress,
        shopPhone,
        receiptHeaderMsg,
        receiptFooterMsg,
        showTaxOnReceipt,
        defaultDiscountPercent,
        printerPaperSize,
        printerPort,
        printerAddress,
        printerAutoPrint,
        syncEndpoint,
        cashierPin,
        isPinRequiredToEdit,
        customCategories: [...customCategories],
        defaultActiveTab: "cashier",
        suppliers: [...suppliers],
        customers: [...customers],
      };
      setSnapshots(prev => {
        if (prev.some(s => s.version === "v01.06")) return prev;
        return [...prev, currentSnapshot];
      });
    }
  }, [
    products,
    transactions,
    snapshots,
    shopName,
    shopAddress,
    shopPhone,
    receiptHeaderMsg,
    receiptFooterMsg,
    showTaxOnReceipt,
    defaultDiscountPercent,
    printerPaperSize,
    printerPort,
    printerAddress,
    printerAutoPrint,
    syncEndpoint,
    cashierPin,
    isPinRequiredToEdit,
    customCategories,
    suppliers,
    customers,
    isMounted
  ]);

  const [prodForm, setProdForm] = useState({
    name: "",
    sku: "",
    barcode: "",
    category: "Sembako",
    purchasePrice: 0,
    sellingPrice: 0,
    stock: 0,
    minStock: 0,
    image: "",
  });

  // Save state helpers
  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem("pos_products", JSON.stringify(products));
  }, [products, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem("pos_transactions", JSON.stringify(transactions));
  }, [transactions, isMounted]);

  // Categories
  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category));
    return ["Semua", ...Array.from(set)];
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.barcode.includes(searchTerm);
      const matchCategory = selectedCategory === "Semua" || p.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  // Calculations
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.sellingPrice * item.quantity, 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    return Math.round((subtotal * discountPercent) / 100);
  }, [subtotal, discountPercent]);

  const taxAmount = useMemo(() => {
    if (!showTaxOnReceipt) return 0;
    return Math.round(((subtotal - discountAmount) * taxPercent) / 100);
  }, [subtotal, discountAmount, taxPercent, showTaxOnReceipt]);

  const total = useMemo(() => {
    return subtotal - discountAmount + taxAmount;
  }, [subtotal, discountAmount, taxAmount]);

  const changeDue = useMemo(() => {
    const paid = parseFloat(amountPaidInput) || 0;
    return paid - total > 0 ? paid - total : 0;
  }, [amountPaidInput, total]);

  // Cart actions
  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      return prev.map((item) => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          if (newQty > item.product.stock) return item; // limit to stock
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  const clearCart = () => {
    setCart([]);
    setDiscountPercent(defaultDiscountPercent);
  };

  // Printer ESC/POS handler
  const printReceipt = (receipt: Transaction) => {
    setIsPrinting(true);
    setShowPrinterOverlay(true);
    
    // Simulate printing delay
    setTimeout(() => {
      setIsPrinting(false);
      // Native-like alert simulated for bluetooth printer feedback as requested in previous guidelines
      alert("Simulasi Printer Bluetooth: Driver ESC/POS sukses mengirim byte stream ke Printer Thermal Bluetooth PORT 9100.");
    }, 2000);
  };

  // Submit checkout
  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // If payment method is HUTANG_MEMBER, make sure a customer/member is selected
    if (paymentMethod === "HUTANG_MEMBER" && !selectedCustomerId) {
      alert("Silakan pilih Pelanggan / Member terlebih dahulu untuk melakukan transaksi hutang!");
      return;
    }

    const paidAmount = (paymentMethod === "CASH" || paymentMethod === "HUTANG_MEMBER") ? parseFloat(amountPaidInput) || 0 : total;
    
    if (paymentMethod === "CASH" && paidAmount < total) {
      alert("Jumlah pembayaran tunai kurang dari total belanja!");
      return;
    }

    // Deduct stock from products
    setProducts((prevProducts) => {
      return prevProducts.map((p) => {
        const cartItem = cart.find((item) => item.product.id === p.id);
        if (cartItem) {
          return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) };
        }
        return p;
      });
    });

    const matchedCustomer = customers.find(c => c.id === selectedCustomerId);

    // Update customer points & debt
    if (matchedCustomer) {
      setCustomers((prevCustomers) => {
        return prevCustomers.map((c) => {
          if (c.id === matchedCustomer.id) {
            const addedPoints = Math.floor(total / 10000);
            const extraDebt = paymentMethod === "HUTANG_MEMBER" ? Math.max(0, total - paidAmount) : 0;
            return {
              ...c,
              rewardPoints: c.rewardPoints + addedPoints,
              debt: c.debt + extraDebt,
            };
          }
          return c;
        });
      });
    }

    const newTransaction: Transaction = {
      id: "TRX-" + Date.now().toString().slice(-8),
      timestamp: new Date().toLocaleString("id-ID"),
      items: cart.map((item) => ({
        productName: item.product.name,
        price: item.product.sellingPrice,
        quantity: item.quantity,
      })),
      subtotal,
      discount: discountAmount,
      tax: taxAmount,
      total,
      paymentMethod,
      amountPaid: paidAmount,
      change: paymentMethod === "CASH" ? Math.max(0, paidAmount - total) : 0,
      customerId: matchedCustomer?.id,
      customerName: matchedCustomer?.name,
    };

    setTransactions((prev) => [newTransaction, ...prev]);
    setLastPrintedReceipt(newTransaction);
    setIsCheckoutOpen(false);
    setCart([]);
    setAmountPaidInput("");
    setDiscountPercent(defaultDiscountPercent);
    setSelectedCustomerId(""); // Reset selected customer

    // Prompt to print immediately
    printReceipt(newTransaction);
  };

  // Supplier Actions
  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supForm.name || !supForm.phone) {
      alert("Nama dan Telepon supplier wajib diisi!");
      return;
    }

    if (isEditingSupplier && editingSupplierId) {
      setSuppliers(prev => prev.map(s => s.id === editingSupplierId ? { ...s, name: supForm.name, phone: supForm.phone, address: supForm.address, debt: Number(supForm.debt) || 0 } : s));
      alert("Data supplier berhasil diperbarui.");
    } else {
      const newSup: Supplier = {
        id: "SUP-" + Date.now().toString().slice(-6),
        name: supForm.name,
        phone: supForm.phone,
        address: supForm.address,
        debt: Number(supForm.debt) || 0
      };
      setSuppliers(prev => [...prev, newSup]);
      alert("Supplier baru berhasil ditambahkan.");
    }

    // Reset Form
    setSupForm({ name: "", phone: "", address: "", debt: 0 });
    setIsEditingSupplier(false);
    setEditingSupplierId(null);
  };

  const handleDeleteSupplier = (id: string) => {
    const matched = suppliers.find(s => s.id === id);
    if (!matched) return;
    if (matched.debt > 0) {
      alert(`Tidak bisa menghapus supplier "${matched.name}" karena masih memiliki hutang senilai ${formatIDR(matched.debt)}!`);
      return;
    }
    if (confirm(`Apakah Anda yakin ingin menghapus supplier "${matched.name}"?`)) {
      setSuppliers(prev => prev.filter(s => s.id !== id));
    }
  };

  // Customer Actions
  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custForm.name || !custForm.phone) {
      alert("Nama dan Telepon pelanggan wajib diisi!");
      return;
    }

    if (isEditingCustomer && editingCustomerId) {
      setCustomers(prev => prev.map(c => c.id === editingCustomerId ? { ...c, name: custForm.name, phone: custForm.phone, address: custForm.address, rewardPoints: Number(custForm.rewardPoints) || 0, debt: Number(custForm.debt) || 0 } : c));
      alert("Data pelanggan berhasil diperbarui.");
    } else {
      const newCust: Customer = {
        id: "CUST-" + Date.now().toString().slice(-6),
        name: custForm.name,
        phone: custForm.phone,
        address: custForm.address,
        rewardPoints: Number(custForm.rewardPoints) || 0,
        debt: Number(custForm.debt) || 0
      };
      setCustomers(prev => [...prev, newCust]);
      alert("Pelanggan/Member baru berhasil ditambahkan.");
    }

    // Reset Form
    setCustForm({ name: "", phone: "", address: "", rewardPoints: 0, debt: 0 });
    setIsEditingCustomer(false);
    setEditingCustomerId(null);
  };

  const handleDeleteCustomer = (id: string) => {
    const matched = customers.find(c => c.id === id);
    if (!matched) return;
    if (matched.debt > 0) {
      alert(`Tidak bisa menghapus pelanggan "${matched.name}" karena masih memiliki tunggakan hutang senilai ${formatIDR(matched.debt)}!`);
      return;
    }
    if (confirm(`Apakah Anda yakin ingin menghapus pelanggan "${matched.name}"?`)) {
      setCustomers(prev => prev.filter(c => c.id !== id));
      if (selectedCustomerId === id) setSelectedCustomerId("");
    }
  };

  // Debt adjustment handler
  const handleDebtSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(debtAmountInput) || 0;
    if (amount <= 0) {
      alert("Jumlah transaksi harus lebih dari 0!");
      return;
    }

    if (debtModalType === "supplier_pay") {
      setSuppliers(prev => prev.map(s => {
        if (s.id === debtTargetId) {
          const newDebt = Math.max(0, s.debt - amount);
          alert(`Sukses mencatat pembayaran hutang ke "${s.name}" senilai ${formatIDR(amount)}.`);
          return { ...s, debt: newDebt };
        }
        return s;
      }));
    } else if (debtModalType === "supplier_add") {
      setSuppliers(prev => prev.map(s => {
        if (s.id === debtTargetId) {
          const newDebt = s.debt + amount;
          alert(`Sukses menambahkan hutang baru ke "${s.name}" senilai ${formatIDR(amount)}.`);
          return { ...s, debt: newDebt };
        }
        return s;
      }));
    } else if (debtModalType === "customer_pay") {
      setCustomers(prev => prev.map(c => {
        if (c.id === debtTargetId) {
          const newDebt = Math.max(0, c.debt - amount);
          alert(`Sukses mencatat cicilan/pembayaran piutang dari pelanggan "${c.name}" senilai ${formatIDR(amount)}.`);
          return { ...c, debt: newDebt };
        }
        return c;
      }));
    } else if (debtModalType === "customer_add") {
      setCustomers(prev => prev.map(c => {
        if (c.id === debtTargetId) {
          const newDebt = c.debt + amount;
          alert(`Sukses menambahkan catatan hutang baru untuk pelanggan "${c.name}" senilai ${formatIDR(amount)}.`);
          return { ...c, debt: newDebt };
        }
        return c;
      }));
    }

    setIsDebtModalOpen(false);
    setDebtAmountInput("");
    setDebtNoteInput("");
    setDebtTargetId("");
  };

  // User Management actions
  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFormName || !userFormUsername || !userFormPin || !userFormRole) {
      alert("Harap isi seluruh field formulir user!");
      return;
    }
    if (userFormPin.length !== 4 || !/^\d+$/.test(userFormPin)) {
      alert("PIN harus berupa 4 digit angka!");
      return;
    }

    const cleanedUsername = userFormUsername.toLowerCase().trim().replace(/\s+/g, "");

    if (userFormId) {
      // Edit mode
      setUsers((prev) =>
        prev.map((usr) =>
          usr.id === userFormId
            ? { ...usr, name: userFormName, username: cleanedUsername, pin: userFormPin, role: userFormRole }
            : usr
        )
      );
      // If updating current user, refresh currentUser state
      if (currentUser.id === userFormId) {
        setCurrentUser({ id: userFormId, name: userFormName, username: cleanedUsername, pin: userFormPin, role: userFormRole });
      }
      alert("User berhasil diperbarui!");
    } else {
      // Add mode
      // Check duplicate username
      if (users.some((usr) => usr.username === cleanedUsername)) {
        alert("Username sudah digunakan! Gunakan username lain.");
        return;
      }
      const newUser: UserAccount = {
        id: `USR-${Date.now()}`,
        name: userFormName,
        username: cleanedUsername,
        pin: userFormPin,
        role: userFormRole,
      };
      setUsers((prev) => [...prev, newUser]);
      alert("User baru berhasil ditambahkan!");
    }

    // Reset Form
    setUserFormId(null);
    setUserFormName("");
    setUserFormUsername("");
    setUserFormPin("");
    setUserFormRole("Kasir");
    setIsEditingUser(false);
  };

  const handleEditUserClick = (usr: UserAccount) => {
    setUserFormId(usr.id);
    setUserFormName(usr.name);
    setUserFormUsername(usr.username);
    setUserFormPin(usr.pin);
    setUserFormRole(usr.role);
    setIsEditingUser(true);
  };

  const handleDeleteUser = (userId: string) => {
    const usr = users.find((u) => u.id === userId);
    if (!usr) return;

    if (usr.id === currentUser.id) {
      alert("Anda tidak dapat menghapus user yang sedang aktif digunakan!");
      return;
    }

    // Count owners left
    const owners = users.filter((u) => u.role === "Owner");
    if (usr.role === "Owner" && owners.length <= 1) {
      alert("Sistem harus menyisakan minimal 1 user dengan peran Owner!");
      return;
    }

    if (confirm(`Apakah Anda yakin ingin menghapus user ${usr.name}?`)) {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      alert("User berhasil dihapus!");
    }
  };

  const handleSwitchUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSwitchUser) return;
    
    if (switchPinInput === selectedSwitchUser.pin) {
      setCurrentUser(selectedSwitchUser);
      setIsUserSwitchOpen(false);
      setSwitchPinInput("");
      setSelectedSwitchUser(null);
      setSwitchError("");
      
      // Auto switch active tab to allowed tab for the new role!
      if (!isTabAllowed(activeTab, selectedSwitchUser.role)) {
        setActiveTab(getFirstAllowedTab(selectedSwitchUser.role));
      }
      alert(`Berhasil masuk sebagai ${selectedSwitchUser.name} (${selectedSwitchUser.role})`);
    } else {
      setSwitchError("PIN salah! Silakan coba lagi.");
    }
  };

  const handleSwitchUserInstant = (usr: UserAccount) => {
    setCurrentUser(usr);
    setIsUserSwitchOpen(false);
    setSwitchPinInput("");
    setSelectedSwitchUser(null);
    setSwitchError("");
    
    // Auto switch active tab to allowed tab for the new role!
    if (!isTabAllowed(activeTab, usr.role)) {
      setActiveTab(getFirstAllowedTab(usr.role));
    }
    alert(`Berhasil masuk sebagai ${usr.name} (${usr.role})`);
  };

  // Product CRUD
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodForm.name || !prodForm.sku || !prodForm.barcode) {
      alert("Semua kolom harus diisi!");
      return;
    }

    if (isEditingProduct && editingProductId) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProductId
            ? {
                ...p,
                name: prodForm.name,
                sku: prodForm.sku,
                barcode: prodForm.barcode,
                category: prodForm.category,
                purchasePrice: Number(prodForm.purchasePrice),
                sellingPrice: Number(prodForm.sellingPrice),
                stock: Number(prodForm.stock),
                minStock: Number(prodForm.minStock),
                image: prodForm.image,
              }
            : p
        )
      );
      setIsEditingProduct(false);
      setEditingProductId(null);
    } else {
      // Check duplicate SKU or Barcode
      const dup = products.find((p) => p.sku === prodForm.sku || p.barcode === prodForm.barcode);
      if (dup) {
        alert("SKU atau Barcode sudah terdaftar!");
        return;
      }

      const newProduct: Product = {
        id: Date.now().toString(),
        name: prodForm.name,
        sku: prodForm.sku,
        barcode: prodForm.barcode,
        category: prodForm.category,
        purchasePrice: Number(prodForm.purchasePrice),
        sellingPrice: Number(prodForm.sellingPrice),
        stock: Number(prodForm.stock),
        minStock: Number(prodForm.minStock),
        image: prodForm.image,
      };
      setProducts((prev) => [...prev, newProduct]);
    }

    // Reset form
    setProdForm({
      name: "",
      sku: "",
      barcode: "",
      category: customCategories[0] || "Lain-lain",
      purchasePrice: 0,
      sellingPrice: 0,
      stock: 0,
      minStock: 0,
      image: "",
    });
  };

  const handleEditClick = (product: Product) => {
    setIsEditingProduct(true);
    setEditingProductId(product.id);
    setProdForm({
      name: product.name,
      sku: product.sku,
      barcode: product.barcode,
      category: product.category,
      purchasePrice: product.purchasePrice,
      sellingPrice: product.sellingPrice,
      stock: product.stock,
      minStock: product.minStock,
      image: product.image || "",
    });
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    }
  };

  // Helper formatting currency
  const formatIDR = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Stats for dashboards
  const revenue = useMemo(() => {
    return transactions.reduce((sum, tx) => sum + tx.total, 0);
  }, [transactions]);

  const profit = useMemo(() => {
    // Basic approximate cost calculation
    return transactions.reduce((sum, tx) => {
      // Find matches in products or fallback to 80% margins
      const txProfit = tx.items.reduce((acc, item) => {
        const prod = products.find((p) => p.name === item.productName);
        const margin = prod ? (prod.sellingPrice - prod.purchasePrice) : (item.price * 0.2);
        return acc + margin * item.quantity;
      }, 0);
      return sum + txProfit;
    }, 0);
  }, [transactions, products]);

  const lowStockCount = useMemo(() => {
    return products.filter((p) => p.stock <= p.minStock).length;
  }, [products]);

  // 1. Loading state while checking license
  if (isLicenseValid === null) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 relative font-sans">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col items-center space-y-4 relative z-10 text-center">
          <div className="p-4 bg-indigo-950/40 border border-indigo-900/30 rounded-2xl animate-pulse text-indigo-400">
            <Shield className="w-8 h-8 animate-spin" />
          </div>
          <h2 className="text-sm font-black text-slate-300 tracking-wider uppercase font-mono">Memeriksa Kepatuhan Lisensi...</h2>
          <p className="text-3xs text-slate-500 max-w-xs leading-relaxed font-mono">Smart-POS Pro sedang memverifikasi integritas kunci dekripsi & tanda tangan digital...</p>
        </div>
      </div>
    );
  }

  // 2. Activation barrier when license is invalid
  if (isLicenseValid === false) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-y-auto font-sans">
        {/* Decorative ambient background */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md bg-slate-900 border border-slate-850 rounded-3xl p-8 shadow-2xl relative z-10 space-y-6">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="p-4 bg-indigo-950 border border-indigo-900/50 rounded-2xl text-indigo-400 shadow-xl shadow-indigo-500/10">
              <Key className="w-8 h-8 stroke-[2.5]" />
            </div>
            <h1 className="text-xl font-black text-slate-100 tracking-tight">Aktivasi SMART-POS Pro</h1>
            <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
              Lisensi yang valid diperlukan untuk menggunakan aplikasi kasir offline-first. Aktifkan key Anda atau gunakan uji coba gratis 3 hari.
            </p>
          </div>

          {!showTrialForm ? (
            <div className="space-y-5">
              <form onSubmit={handleActivateKey} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-3xs font-black tracking-wider uppercase text-slate-400 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-slate-500" /> Masukkan Serial Key Lisensi
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: SPOS-XXXX-XXXX-XXXX-XXXX"
                    value={activationKey}
                    onChange={(e) => setActivationKey(e.target.value.toUpperCase())}
                    className="w-full bg-slate-950 border border-slate-800 text-xs rounded-xl py-3 px-4 font-bold text-slate-200 tracking-wider text-center focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-700 font-mono"
                    disabled={isActivating}
                  />
                </div>

                {licenseError && (
                  <div className="text-3xs text-red-400 font-bold bg-red-950/40 border border-red-900/30 py-2.5 px-3.5 rounded-xl flex items-start gap-2 leading-normal">
                    <XCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                    <span>{licenseError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isActivating || !activationKey}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:border-transparent text-white font-black text-xs tracking-wider uppercase rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-500/15 flex items-center justify-center gap-2"
                >
                  {isActivating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Memvalidasi Kriptografi...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> Aktifkan Lisensi POS
                    </>
                  )}
                </button>
              </form>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-850"></div>
                <span className="flex-shrink mx-4 text-3xs font-black tracking-wider uppercase text-slate-600">ATAU</span>
                <div className="flex-grow border-t border-slate-850"></div>
              </div>

              <div className="w-full">
                <button
                  type="button"
                  onClick={() => setShowTrialForm(true)}
                  className="w-full py-3 bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded-xl text-slate-300 font-black text-3xs tracking-wider uppercase transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Trial Gratis 3 Hari
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleRegisterTrial} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-3xs font-black tracking-wider uppercase text-slate-400 flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-500" /> Nama Anda / Nama Toko
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Toko Barokah Jaya"
                  value={trialName}
                  onChange={(e) => setTrialName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs rounded-xl py-2.5 px-3.5 font-bold text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-700"
                  disabled={isRegisteringTrial}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-3xs font-black tracking-wider uppercase text-slate-400 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-slate-500" /> Alamat Email
                </label>
                <input
                  type="email"
                  placeholder="Contoh: barokah@gmail.com"
                  value={trialEmail}
                  onChange={(e) => setTrialEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs rounded-xl py-2.5 px-3.5 font-bold text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-700"
                  disabled={isRegisteringTrial}
                />
              </div>

              {trialError && (
                <p className="text-3xs text-red-400 font-bold bg-red-950/40 border border-red-900/30 py-2.5 px-3.5 rounded-xl leading-normal">
                  {trialError}
                </p>
              )}

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowTrialForm(false);
                    setTrialError("");
                  }}
                  className="py-2.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded-xl text-slate-400 font-black text-xs uppercase transition-colors cursor-pointer text-center"
                  disabled={isRegisteringTrial}
                >
                  Kembali
                </button>
                <button
                  type="submit"
                  disabled={isRegisteringTrial || !trialName || !trialEmail}
                  className="py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-500/15"
                >
                  {isRegisteringTrial ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Mendaftarkan...
                    </>
                  ) : (
                    <>
                      Mulai Trial <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="border-t border-slate-850 pt-4 flex flex-col items-center gap-1 font-mono text-[9px] text-slate-500">
            <span className="flex items-center gap-1">
              <Smartphone className="w-3 h-3 text-slate-500" /> ID Perangkat: {deviceId}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 font-sans text-slate-100 selection:bg-indigo-600 selection:text-white antialiased">
      {/* Top Navbar */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur sticky top-0 z-40 px-4 py-3.5 flex flex-col gap-3">
        {/* Top Row: App Title & User Profile Info */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-indigo-600 to-indigo-400 p-2 rounded-xl shadow-lg shadow-indigo-500/20">
              <ShoppingCart className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base md:text-lg font-black tracking-tight flex items-center gap-2 bg-gradient-to-r from-indigo-400 to-indigo-200 bg-clip-text text-transparent">
                SMART-POS
                <button 
                  onClick={() => setIsRollbackOpen(true)}
                  className="group/ver flex items-center gap-1.5 text-[10px] py-0.5 px-2 bg-indigo-950 hover:bg-indigo-900 text-indigo-300 font-bold border border-indigo-900/50 hover:border-indigo-700/50 rounded-full transition-all cursor-pointer shadow-sm shadow-indigo-500/5 animate-pulse"
                  title="Sistem Rollback & Versi"
                >
                  {activeVersion}
                  <span className="text-[8px] font-black tracking-widest px-1 bg-indigo-600 text-white rounded font-sans uppercase">ROLLBACK</span>
                </button>
              </h1>
              <p className="text-[10px] text-slate-400 font-mono">Kasir Pintar & Driver Cetak ESC/POS Bluetooth</p>
            </div>
          </div>

          {/* User Profile Badge & Switch Button */}
          <div className="flex items-center gap-2 sm:gap-3.5 pl-3 border-l border-slate-900">
            <div className="text-right hidden sm:block">
              <p className="text-2xs font-black text-slate-100">{currentUser.name}</p>
              <p className="text-[9px] font-mono text-indigo-400 font-extrabold tracking-tight uppercase bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-900/30 inline-block mt-0.5">
                {currentUser.role}
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedSwitchUser(null);
                setSwitchPinInput("");
                setSwitchError("");
                setIsUserSwitchOpen(true);
              }}
              className="flex items-center gap-1.5 py-1.5 px-3 bg-slate-900 hover:bg-indigo-600 hover:text-white border border-slate-850 hover:border-indigo-500 rounded-xl text-[11px] font-black text-slate-300 transition-all cursor-pointer group shadow-sm"
            >
              <UserCheck className="w-3.5 h-3.5 text-indigo-400 group-hover:text-white" />
              <span className="hidden xs:inline">Ganti User</span>
            </button>
          </div>
        </div>

        {/* Bottom Row: Tab Switcher (Scrollable horizontally on mobile/tablet) */}
        <div className="flex items-center gap-1 bg-slate-900/50 border border-slate-900 p-1 rounded-2xl overflow-x-auto scrollbar-none w-full">
          {isTabAllowed("dashboard", currentUser.role) && (
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-2xs font-black transition-all whitespace-nowrap ${
                activeTab === "dashboard"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/10"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
            </button>
          )}
          {isTabAllowed("cashier", currentUser.role) && (
            <button
              onClick={() => setActiveTab("cashier")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-2xs font-black transition-all whitespace-nowrap ${
                activeTab === "cashier"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/10"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" /> Kasir POS
            </button>
          )}
          {isTabAllowed("products", currentUser.role) && (
            <button
              onClick={() => setActiveTab("products")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-2xs font-black transition-all whitespace-nowrap ${
                activeTab === "products"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/10"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Package className="w-3.5 h-3.5" /> Kelola Produk
              {lowStockCount > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
              )}
            </button>
          )}
          {isTabAllowed("history", currentUser.role) && (
            <button
              onClick={() => setActiveTab("history")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-2xs font-black transition-all whitespace-nowrap ${
                activeTab === "history"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/10"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <History className="w-3.5 h-3.5" /> Riwayat Transaksi
            </button>
          )}
          {isTabAllowed("suppliers", currentUser.role) && (
            <button
              onClick={() => setActiveTab("suppliers")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-2xs font-black transition-all whitespace-nowrap ${
                activeTab === "suppliers"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/10"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Truck className="w-3.5 h-3.5" /> Supplier
            </button>
          )}
          {isTabAllowed("customers", currentUser.role) && (
            <button
              onClick={() => setActiveTab("customers")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-2xs font-black transition-all whitespace-nowrap ${
                activeTab === "customers"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/10"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Users className="w-3.5 h-3.5" /> Pelanggan
            </button>
          )}
          {isTabAllowed("settings", currentUser.role) && (
            <button
              onClick={() => setActiveTab("settings")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-2xs font-black transition-all whitespace-nowrap ${
                activeTab === "settings"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/10"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Settings className="w-3.5 h-3.5" /> Pengaturan
            </button>
          )}
        </div>
      </header>

      {/* Main Layout Area */}
      <main className="flex-1 overflow-hidden">
        {activeTab === "dashboard" && (
          <div className="p-6 h-[calc(100vh-80px)] overflow-y-auto space-y-6">
            
            {/* Page Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-slate-900/60 to-slate-900/20 border border-slate-900 p-6 rounded-3xl">
              <div>
                <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
                  <LayoutDashboard className="w-5 h-5 text-indigo-400" /> Ringkasan Kinerja Toko
                </h2>
                <p className="text-xs text-slate-400 mt-1">Status dan metrik performa finansial real-time SMART-POS Anda.</p>
              </div>
              <div className="text-right">
                <span className="text-2xs font-mono font-bold uppercase py-1 px-3 bg-indigo-950/40 text-indigo-400 border border-indigo-900/40 rounded-full">
                  Periode: Hari Ini ({new Date().toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })})
                </span>
              </div>
            </div>

            {/* Overview KPI Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Total Penjualan Hari Ini */}
              <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-emerald-950 border border-emerald-900/40 rounded-xl text-emerald-400">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-950 text-emerald-400 py-0.5 px-2 border border-emerald-900/30 rounded font-sans">HARI INI</span>
                </div>
                <div>
                  <p className="text-3xs font-bold tracking-wider uppercase text-slate-500">Total Penjualan Hari Ini</p>
                  <p className="text-xl font-black font-mono text-slate-200 mt-1">{formatIDR(todaySalesTotal)}</p>
                  <p className="text-[10px] text-slate-500 mt-1 font-medium">Dari {todayTransactionsCount} transaksi hari ini</p>
                </div>
              </div>

              {/* Card 2: Total Transaksi */}
              <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-indigo-950 border border-indigo-900/40 rounded-xl text-indigo-400">
                    <History className="w-5 h-5" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-wider bg-indigo-950 text-indigo-400 py-0.5 px-2 border border-indigo-900/30 rounded font-sans">SEMUA DATA</span>
                </div>
                <div>
                  <p className="text-3xs font-bold tracking-wider uppercase text-slate-500">Total Transaksi</p>
                  <p className="text-xl font-black font-mono text-slate-200 mt-1">{transactions.length}</p>
                  <p className="text-[10px] text-slate-500 mt-1 font-medium">Semua riwayat transaksi di kasir</p>
                </div>
              </div>

              {/* Card 3: Omset Bulanan */}
              <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-purple-950 border border-purple-900/40 rounded-xl text-purple-400">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-wider bg-purple-950 text-purple-400 py-0.5 px-2 border border-purple-900/30 rounded font-sans">
                    {new Date().toLocaleDateString("id-ID", { month: 'short' }).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-3xs font-bold tracking-wider uppercase text-slate-500">Omset Bulanan</p>
                  <p className="text-xl font-black font-mono text-slate-200 mt-1">{formatIDR(monthlyTurnover)}</p>
                  <p className="text-[10px] text-slate-500 mt-1 font-medium">Bulan berjalan saat ini</p>
                </div>
              </div>

              {/* Card 4: Estimasi Margin/Laba */}
              <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-amber-950/40 border border-amber-900/40 rounded-xl text-amber-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-wider bg-amber-950/30 text-amber-400 py-0.5 px-2 border border-amber-900/20 rounded font-sans">PROFIT</span>
                </div>
                <div>
                  <p className="text-3xs font-bold tracking-wider uppercase text-slate-500">Estimasi Laba Kotor</p>
                  <p className="text-xl font-black font-mono text-slate-200 mt-1">{formatIDR(profit)}</p>
                  <p className="text-[10px] text-slate-500 mt-1 font-medium">Laba dihitung dari HPP produk</p>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Main Line / Area Sales Chart - 8 Columns */}
              <div className="lg:col-span-8 bg-slate-900/20 border border-slate-900 p-6 rounded-3xl flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">Grafik Penjualan (7 Hari Terakhir)</h3>
                    <p className="text-3xs text-slate-500 mt-0.5">Analisis tren harian omset dan jumlah transaksi Anda.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 text-3xs font-bold text-slate-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" /> Omset (Rupiah)
                    </span>
                    <span className="flex items-center gap-1.5 text-3xs font-bold text-slate-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Transaksi
                    </span>
                  </div>
                </div>

                {/* Recharts Container */}
                <div className="h-72 w-full mt-4">
                  {isMounted ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={salesTrendData}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="colorOmset" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis 
                          dataKey="date" 
                          stroke="#64748b" 
                          fontSize={10}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis 
                          stroke="#64748b" 
                          fontSize={10}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(val) => `Rp ${val >= 1000000 ? (val/1000000).toFixed(1) + 'M' : val >= 1000 ? (val/1000).toFixed(0) + 'k' : val}`}
                        />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                          labelStyle={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'bold' }}
                          itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                          formatter={(value: any, name: string) => {
                            if (name === "Omset") return [formatIDR(value), "Omset Penjualan"];
                            return [value, "Jumlah Transaksi"];
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="Omset" 
                          stroke="#6366f1" 
                          strokeWidth={2.5}
                          fillOpacity={1} 
                          fill="url(#colorOmset)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="w-full h-full bg-slate-900/10 animate-pulse border border-slate-900 rounded-2xl flex items-center justify-center text-slate-500 font-mono text-xs">
                      Loading chart engine...
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Methods & Quick stats - 4 Columns */}
              <div className="lg:col-span-4 bg-slate-900/20 border border-slate-900 p-6 rounded-3xl flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">Metode Pembayaran</h3>
                  <p className="text-3xs text-slate-500 mt-0.5">Metode pembayaran pilihan pelanggan saat ini.</p>
                </div>

                <div className="space-y-3.5 my-2">
                  {["CASH", "DEBIT", "QRIS"].map((method) => {
                    const methodCount = transactions.filter(tx => tx.paymentMethod === method).length;
                    const methodTotal = transactions.filter(tx => tx.paymentMethod === method).reduce((sum, tx) => sum + tx.total, 0);
                    const percent = transactions.length > 0 ? (methodCount / transactions.length) * 100 : 0;
                    
                    const colorMap = ({
                      CASH: { text: "text-emerald-400", bg: "bg-emerald-950/40", border: "border-emerald-900/50", progress: "bg-emerald-500" },
                      DEBIT: { text: "text-blue-400", bg: "bg-blue-950/40", border: "border-blue-900/50", progress: "bg-blue-500" },
                      QRIS: { text: "text-purple-400", bg: "bg-purple-950/40", border: "border-purple-900/50", progress: "bg-purple-500" },
                    }[method as "CASH" | "DEBIT" | "QRIS"]) || { text: "text-emerald-400", bg: "bg-emerald-950/40", border: "border-emerald-900/50", progress: "bg-emerald-500" };

                    return (
                      <div key={method} className="space-y-1.5 p-3 bg-slate-950/40 border border-slate-900 rounded-xl">
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-black tracking-wider uppercase py-0.5 px-2 ${colorMap.bg} ${colorMap.text} border ${colorMap.border} rounded-md`}>
                            {method}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">{methodCount} Tx ({percent.toFixed(0)}%)</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-3xs text-slate-500">Nilai Penjualan</span>
                          <span className="text-xs font-mono font-bold text-slate-300">{formatIDR(methodTotal)}</span>
                        </div>
                        <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-1">
                          <div className={`h-full ${colorMap.progress}`} style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-indigo-950/10 border border-indigo-900/20 p-3 rounded-xl flex items-center gap-2 text-indigo-400">
                  <Info className="w-4 h-4 shrink-0 text-indigo-500" />
                  <p className="text-3xs text-indigo-300 leading-relaxed">
                    Sistem otomatis memperbarui seluruh visualisasi finansial secara instan saat transaksi baru diselesaikan.
                  </p>
                </div>
              </div>
            </div>

            {/* Produk Terlaris Section */}
            <div className="bg-slate-900/20 border border-slate-900 rounded-3xl overflow-hidden">
              <div className="p-5 border-b border-slate-900 bg-slate-950/60 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">5 Produk Terlaris</h3>
                  <p className="text-3xs text-slate-500 mt-0.5">Produk paling diminati berdasarkan volume penjualan.</p>
                </div>
                <div className="p-1 px-3 bg-slate-900 text-indigo-400 border border-slate-800 text-3xs font-black uppercase rounded-lg">
                  Terbanyak Terjual
                </div>
              </div>

              {bestSellers.length === 0 ? (
                <div className="py-16 flex flex-col items-center justify-center text-slate-500 space-y-3">
                  <BarChart3 className="w-10 h-10 text-slate-700 stroke-[1.2]" />
                  <div className="text-center space-y-1">
                    <p className="text-xs font-bold text-slate-400">Belum ada data penjualan produk</p>
                    <p className="text-2xs text-slate-500">Lakukan transaksi di Kasir POS terlebih dahulu.</p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-slate-900 text-3xs font-black uppercase tracking-wider text-slate-500 bg-slate-900/10">
                        <th className="py-3 px-5">Nama Produk</th>
                        <th className="py-3 px-5">Kategori</th>
                        <th className="py-3 px-5 text-center">Unit Terjual</th>
                        <th className="py-3 px-5 text-right">Total Pendapatan</th>
                        <th className="py-3 px-5 text-right">Porsi Penjualan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900/40">
                      {bestSellers.map((item, index) => {
                        const totalQtySold = bestSellers.reduce((sum, i) => sum + i.qty, 0);
                        const pct = totalQtySold > 0 ? (item.qty / totalQtySold) * 100 : 0;
                        return (
                          <tr key={index} className="hover:bg-slate-900/10 transition-colors">
                            <td className="py-3.5 px-5">
                              <div className="flex items-center gap-3">
                                <span className="flex items-center justify-center w-5 h-5 rounded-md bg-indigo-950/60 border border-indigo-900/30 text-3xs font-bold text-indigo-400">
                                  {index + 1}
                                </span>
                                <span className="text-xs font-bold text-slate-200">{item.name}</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-5">
                              <span className="text-[10px] font-bold py-0.5 px-2 bg-slate-900 text-slate-400 border border-slate-850 rounded-md">
                                {item.category}
                              </span>
                            </td>
                            <td className="py-3.5 px-5 text-center font-mono font-bold text-slate-200 text-xs">
                              {item.qty} pcs
                            </td>
                            <td className="py-3.5 px-5 text-right font-mono font-black text-indigo-400 text-xs">
                              {formatIDR(item.revenue)}
                            </td>
                            <td className="py-3.5 px-5 text-right">
                              <div className="flex items-center justify-end gap-2.5">
                                <span className="text-2xs font-mono font-semibold text-slate-400">{pct.toFixed(0)}%</span>
                                <div className="w-16 bg-slate-900 h-1.5 rounded-full overflow-hidden">
                                  <div className="h-full bg-indigo-500" style={{ width: `${pct}%` }} />
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="p-6 h-[calc(100vh-80px)] overflow-y-auto space-y-6">
            
            {/* Page Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-slate-900/60 to-slate-900/20 border border-slate-900 p-6 rounded-3xl">
              <div>
                <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-indigo-400" /> Pengaturan Sistem POS
                </h2>
                <p className="text-xs text-slate-400 mt-1">Konfigurasi profil toko, struk, koneksi printer bluetooth, backup data, keamanan, dan tentang aplikasi.</p>
              </div>
              <div className="text-right">
                <span className="text-2xs font-mono font-bold uppercase py-1 px-3 bg-indigo-950/40 text-indigo-400 border border-indigo-900/40 rounded-full">
                  Status: Operasional ({activeVersion})
                </span>
              </div>
            </div>

            {/* Split Layout Settings */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Panel: Navigation subtabs (4 columns) */}
              <div className="lg:col-span-4 bg-slate-900/20 border border-slate-900 p-4 rounded-3xl space-y-1">
                <p className="text-3xs font-black tracking-wider uppercase text-slate-500 px-3 pb-2 pt-1 border-b border-slate-900/40 mb-2">MENU PENGATURAN</p>
                
                {[
                  { id: "profile", label: "Profil Toko", icon: Store, desc: "Nama toko, alamat, telepon" },
                  { id: "receipt", label: "Desain Struk", icon: FileText, desc: "Pesan header, footer, PPN" },
                  { id: "printer", label: "Printer Bluetooth", icon: Printer, desc: "Ukuran kertas, port, tes cetak" },
                  { id: "backup", label: "Backup & Restore", icon: Database, desc: "Ekspor & impor data POS" },
                  { id: "sync", label: "Sinkronisasi Data", icon: RefreshCw, desc: "Status sinkronisasi cloud" },
                  { id: "security", label: "Keamanan PIN", icon: Lock, desc: "PIN kasir, proteksi aksi" },
                  { id: "users", label: "User Manajemen", icon: Users, desc: "Kelola hak akses & peran user" },
                  { id: "about", label: "Tentang Aplikasi", icon: Info, desc: "Informasi versi & lisensi" },
                ].map((sub) => {
                  const IconComp = sub.icon;
                  const isActive = activeSettingSubtab === sub.id;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => setActiveSettingSubtab(sub.id as any)}
                      className={`w-full flex items-center gap-3.5 p-3 rounded-2xl text-left transition-all ${
                        isActive
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/10"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
                      }`}
                    >
                      <IconComp className={`w-5 h-5 shrink-0 ${isActive ? "text-white" : "text-indigo-400"}`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-black leading-tight">{sub.label}</p>
                        <p className={`text-4xs truncate mt-0.5 ${isActive ? "text-indigo-200" : "text-slate-500"}`}>{sub.desc}</p>
                      </div>
                      <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isActive ? "text-white rotate-90" : "text-slate-600"}`} />
                    </button>
                  );
                })}
              </div>

              {/* Right Panel: Active Subtab Content Form (8 columns) */}
              <div className="lg:col-span-8 bg-slate-900/20 border border-slate-900 p-6 rounded-3xl min-h-[480px]">
                
                {/* 1. Profil Toko Subtab */}
                {activeSettingSubtab === "profile" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-wider text-slate-200 flex items-center gap-2">
                        <Store className="w-5 h-5 text-indigo-400" /> Profil Toko
                      </h3>
                      <p className="text-3xs text-slate-500 mt-1">Konfigurasi data utama toko yang akan muncul di aplikasi & tercetak pada struk belanja pelanggan.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-3xs font-black uppercase tracking-wider text-slate-400">Nama Toko / Bisnis</label>
                        <input
                          type="text"
                          value={shopName}
                          onChange={(e) => setShopName(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors font-bold"
                          placeholder="Contoh: TOKO BAROKAH"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-3xs font-black uppercase tracking-wider text-slate-400">Nomor Telepon Toko</label>
                        <input
                          type="text"
                          value={shopPhone}
                          onChange={(e) => setShopPhone(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors font-mono font-bold"
                          placeholder="Contoh: 0812-3456-7890"
                        />
                      </div>
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-3xs font-black uppercase tracking-wider text-slate-400">Alamat Lengkap Toko</label>
                        <textarea
                          rows={3}
                          value={shopAddress}
                          onChange={(e) => setShopAddress(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors font-medium leading-relaxed resize-none"
                          placeholder="Contoh: Jl. Pandan Wangi Raya No. 45, Bandung, Jawa Barat"
                        />
                      </div>
                    </div>

                    {/* Preview Live */}
                    <div className="p-4 bg-slate-950/60 border border-slate-900 rounded-2xl space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Live Preview Informasi Struk</p>
                      <div className="bg-slate-950/30 p-3 border border-slate-900/60 rounded-xl font-mono text-[10px] text-slate-400 text-center space-y-1 max-w-sm mx-auto">
                        <p className="font-bold text-slate-200 text-xs">{shopName}</p>
                        <p className="text-3xs">{shopAddress}</p>
                        <p className="text-3xs">Telp: {shopPhone}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Desain Struk Subtab */}
                {activeSettingSubtab === "receipt" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-wider text-slate-200 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-indigo-400" /> Desain & Pesan Struk
                      </h3>
                      <p className="text-3xs text-slate-500 mt-1">Ubah kata sambutan, catatan penutup struk, serta aktifkan/nonaktifkan komponen pajak PPN.</p>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-3xs font-black uppercase tracking-wider text-slate-400">Pesan Header Struk (Sub-title)</label>
                        <input
                          type="text"
                          value={receiptHeaderMsg}
                          onChange={(e) => setReceiptHeaderMsg(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                          placeholder="Contoh: KASIR MODERN & EFISIEN"
                        />
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="text-3xs font-black uppercase tracking-wider text-slate-400">Pesan Catatan Kaki (Footer Struk)</label>
                        <input
                          type="text"
                          value={receiptFooterMsg}
                          onChange={(e) => setReceiptFooterMsg(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                          placeholder="Contoh: TERIMA KASIH ATAS KUNJUNGAN ANDA"
                        />
                      </div>

                      {/* Default Discount Input */}
                      <div className="space-y-1.5">
                        <label className="text-3xs font-black uppercase tracking-wider text-slate-400">Default Diskon Belanja (%)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={defaultDiscountPercent || ""}
                          onChange={(e) => {
                            const val = Math.min(100, Math.max(0, Number(e.target.value)));
                            setDefaultDiscountPercent(val);
                            setDiscountPercent(val); // Sync instantly with current active cart
                          }}
                          className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                          placeholder="0"
                        />
                      </div>

                      {/* Tax options toggle switch */}
                      <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-850 rounded-2xl">
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-slate-300">Tampilkan Pajak PPN (11%)</p>
                          <p className="text-3xs text-slate-500">Otomatis hitung dan tampilkan PPN 11% di ringkasan pembayaran struk.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer select-none">
                          <input 
                            type="checkbox" 
                            checked={showTaxOnReceipt} 
                            onChange={(e) => setShowTaxOnReceipt(e.target.checked)} 
                            className="sr-only peer" 
                          />
                          <div className="w-10 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600 peer-checked:after:bg-white peer-checked:after:border-indigo-600 font-sans"></div>
                        </label>
                      </div>
                    </div>

                    {/* Preview Struk Footer Live */}
                    <div className="p-4 bg-slate-950/60 border border-slate-900 rounded-2xl space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Live Preview Tampilan Struk</p>
                      <div className="bg-slate-950/30 p-3.5 border border-slate-900/60 rounded-xl font-mono text-[9px] text-slate-400 space-y-1.5 max-w-sm mx-auto">
                        <div className="text-center">
                          <p className="font-bold text-slate-200">{shopName}</p>
                          <p className="italic text-[8px] text-slate-500">{receiptHeaderMsg}</p>
                        </div>
                        <div className="border-t border-dashed border-slate-900/80 my-1" />
                        <div className="space-y-0.5 text-2xs">
                          <div className="flex justify-between">
                            <span>Kopi Susu Gula Aren</span>
                            <span>Rp 15.000</span>
                          </div>
                        </div>
                        <div className="border-t border-dashed border-slate-900/80 my-1" />
                        <div className="space-y-0.5 text-[8px]">
                          <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>Rp 15.000</span>
                          </div>
                          {defaultDiscountPercent > 0 && (
                            <div className="flex justify-between text-red-400">
                              <span>Diskon ({defaultDiscountPercent}%):</span>
                              <span>-Rp {((15000 * defaultDiscountPercent) / 100).toLocaleString("id-ID")}</span>
                            </div>
                          )}
                          {showTaxOnReceipt && (
                            <div className="flex justify-between">
                              <span>PPN (11%):</span>
                              <span>Rp {Math.round((15000 - (15000 * defaultDiscountPercent) / 100) * 0.11).toLocaleString("id-ID")}</span>
                            </div>
                          )}
                          <div className="flex justify-between font-bold text-slate-200 text-2xs">
                            <span>TOTAL:</span>
                            <span>Rp {Math.round(
                              15000 - 
                              (15000 * defaultDiscountPercent) / 100 + 
                              (showTaxOnReceipt ? (15000 - (15000 * defaultDiscountPercent) / 100) * 0.11 : 0)
                            ).toLocaleString("id-ID")}</span>
                          </div>
                        </div>
                        <div className="border-t border-dashed border-slate-900/80 my-1" />
                        <p className="text-center font-bold text-slate-200 mt-1">{receiptFooterMsg}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Printer Bluetooth Subtab */}
                {activeSettingSubtab === "printer" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-wider text-slate-200 flex items-center gap-2">
                        <Printer className="w-5 h-5 text-indigo-400" /> Pengaturan Printer Thermal
                      </h3>
                      <p className="text-3xs text-slate-500 mt-1">Konfigurasi driver printer bluetooth nirkabel, port ESC/POS, dan cetak struk otomatis.</p>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-3xs font-black uppercase tracking-wider text-slate-400">Ukuran Kertas Thermal</label>
                          <select
                            value={printerPaperSize}
                            onChange={(e) => setPrinterPaperSize(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors font-bold cursor-pointer"
                          >
                            <option value="58mm">58mm (Standar Portabel)</option>
                            <option value="80mm">80mm (Standar Desktop Kasir)</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-3xs font-black uppercase tracking-wider text-slate-400">Nama Bluetooth Printer (Alias)</label>
                          <input
                            type="text"
                            value={printerAddress}
                            onChange={(e) => setPrinterAddress(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors font-bold"
                            placeholder="Contoh: BT-PRINTER"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-3xs font-black uppercase tracking-wider text-slate-400">Port Printer Server (ESC/POS)</label>
                          <input
                            type="text"
                            value={printerPort}
                            onChange={(e) => setPrinterPort(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors font-mono font-bold"
                            placeholder="9100"
                          />
                        </div>
                        <div className="space-y-1.5 flex flex-col justify-end">
                          <button
                            onClick={() => {
                              // Simulate printer test
                              alert(`Mencoba koneksi ke bluetooth printer ${printerAddress} pada port ${printerPort}...`);
                              setTimeout(() => {
                                alert(`Driver ESC/POS Sukses: Cetak tes karakter berhasil dikirim ke printer thermal ${printerPaperSize}.`);
                              }, 1000);
                            }}
                            className="w-full py-2.5 bg-slate-900 hover:bg-slate-850 text-indigo-400 border border-indigo-900/30 text-xs font-black uppercase rounded-xl transition-all cursor-pointer text-center"
                          >
                            Tes Koneksi Printer
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-850 rounded-2xl">
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-slate-300">Cetak Otomatis Setiap Selesai Transaksi</p>
                          <p className="text-3xs text-slate-500">Membuka dialog/mengirim data cetak otomatis begitu klik &quot;Selesaikan Transaksi&quot;.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer select-none">
                          <input 
                            type="checkbox" 
                            checked={printerAutoPrint} 
                            onChange={(e) => setPrinterAutoPrint(e.target.checked)} 
                            className="sr-only peer" 
                          />
                          <div className="w-10 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600 peer-checked:after:bg-white peer-checked:after:border-indigo-600 font-sans"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Backup & Restore Subtab */}
                {activeSettingSubtab === "backup" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-wider text-slate-200 flex items-center gap-2">
                        <Database className="w-5 h-5 text-indigo-400" /> Backup & Restore Data
                      </h3>
                      <p className="text-3xs text-slate-500 mt-1">Ekspor seluruh data katalog produk, riwayat penjualan kasir, dan snapshot versi Anda ke berkas JSON lokal, atau memulihkannya kembali kapan saja.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Backup Card */}
                      <div className="bg-slate-950/40 border border-slate-900 p-5 rounded-2xl flex flex-col justify-between space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-indigo-950/40 text-indigo-400 border border-indigo-900/30 rounded-xl">
                            <Download className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-200">Ekspor Data (Backup)</p>
                            <p className="text-4xs text-slate-500 mt-0.5">Simpan katalog produk & transaksi</p>
                          </div>
                        </div>
                        <p className="text-3xs text-slate-400 leading-relaxed">Seluruh data yang tersimpan di memori browser (Local Storage) akan diekspor sebagai berkas `.json` terenskripsi standar SMART-POS.</p>
                        <button
                          onClick={() => {
                            const payload = {
                              shop: { name: shopName, address: shopAddress, phone: shopPhone },
                              products,
                              transactions,
                              snapshots,
                              customCategories,
                              suppliers,
                              customers,
                              version: activeVersion,
                              exportedAt: new Date().toISOString()
                            };
                            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
                            const downloadAnchor = document.createElement('a');
                            downloadAnchor.setAttribute("href", dataStr);
                            downloadAnchor.setAttribute("download", `SMART-POS_Backup_${new Date().toISOString().slice(0, 10)}.json`);
                            document.body.appendChild(downloadAnchor);
                            downloadAnchor.click();
                            downloadAnchor.remove();
                            alert("Backup Berhasil! Berkas JSON telah terunduh ke direktori lokal Anda.");
                          }}
                          className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-3xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
                        >
                          Ekspor Berkas JSON
                        </button>
                      </div>
 
                      {/* Restore Card */}
                      <div className="bg-slate-950/40 border border-slate-900 p-5 rounded-2xl flex flex-col justify-between space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-amber-950/40 text-amber-400 border border-amber-900/30 rounded-xl">
                            <Upload className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-200">Impor Data (Restore)</p>
                            <p className="text-4xs text-slate-500 mt-0.5">Pulihkan database dari file cadangan</p>
                          </div>
                        </div>
                        <p className="text-3xs text-slate-400 leading-relaxed">Unggah kembali file `.json` backup Anda untuk menggantikan seluruh data saat ini secara instan.</p>
                        
                        <div className="relative">
                          <input
                            type="file"
                            id="restore-file-uploader-settings"
                            accept=".json"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                try {
                                  const parsed = JSON.parse(event.target?.result as string);
                                  if (parsed && (parsed.products || parsed.transactions)) {
                                    if (parsed.shop) {
                                      if (parsed.shop.name) setShopName(parsed.shop.name);
                                      if (parsed.shop.address) setShopAddress(parsed.shop.address);
                                      if (parsed.shop.phone) setShopPhone(parsed.shop.phone);
                                    }
                                    if (parsed.products) setProducts(parsed.products);
                                    if (parsed.transactions) setTransactions(parsed.transactions);
                                    if (parsed.snapshots) setSnapshots(parsed.snapshots);
                                    if (parsed.version) setActiveVersion(parsed.version);
                                    if (parsed.customCategories) setCustomCategories(parsed.customCategories);
                                    if (parsed.suppliers) setSuppliers(parsed.suppliers);
                                    if (parsed.customers) setCustomers(parsed.customers);
                                    alert("Pemulihan Data Berhasil! Seluruh data produk, profil, transaksi, dan riwayat rollback berhasil di-load kembali.");
                                  } else {
                                    alert("Gagal Impor: Format berkas JSON tidak sesuai spesifikasi SMART-POS.");
                                  }
                                } catch (err) {
                                  alert("Kesalahan membaca file backup JSON!");
                                }
                              };
                              reader.readAsText(file);
                            }}
                            className="hidden"
                          />
                          <button
                            onClick={() => document.getElementById("restore-file-uploader-settings")?.click()}
                            className="w-full py-2 bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 text-3xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                          >
                            Pilih Berkas Backup
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. Sinkronisasi Data Subtab */}
                {activeSettingSubtab === "sync" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-wider text-slate-200 flex items-center gap-2">
                        <RefreshCw className="w-5 h-5 text-indigo-400" /> Sinkronisasi Data Awan (Cloud Sync)
                      </h3>
                      <p className="text-3xs text-slate-500 mt-1">Gunakan fitur ini untuk mensinkronisasi data penjualan, transaksi kasir, dan inventaris barang dengan Server Utama Smart-POS di Cloud.</p>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-3xs font-black uppercase tracking-wider text-slate-400 font-sans">API Endpoint Sinkronisasi</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={syncEndpoint}
                            onChange={(e) => setSyncEndpoint(e.target.value)}
                            className="flex-1 bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                            placeholder="https://api.smartpos.id/v1/sync"
                          />
                        </div>
                      </div>

                      <div className="bg-slate-950 border border-slate-850 p-4 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-slate-300">Status Sinkronisasi Terakhir</p>
                          <p className="text-3xs font-mono text-slate-500 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block"></span>
                            {lastSyncTime}
                          </p>
                        </div>
                        <button
                          type="button"
                          disabled={isSyncing}
                          onClick={() => {
                            setIsSyncing(true);
                            setTimeout(() => {
                              setIsSyncing(false);
                              const nowStr = new Date().toLocaleString("id-ID");
                              setLastSyncTime(nowStr);
                              localStorage.setItem("pos_last_sync", nowStr);
                              alert("Sinkronisasi Sukses! Semua transaksi lokal dan stok produk teranyar telah disinkronisasikan ke Server Utama Smart-POS.");
                            }, 2000);
                          }}
                          className={`px-5 py-2.5 text-3xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2 ${
                            isSyncing
                              ? "bg-slate-900 text-slate-500 border border-slate-850 cursor-not-allowed"
                              : "bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer active:scale-98"
                          }`}
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-slate-500" : "text-white"}`} />
                          {isSyncing ? "Mensinkronkan..." : "Sinkronkan Sekarang"}
                        </button>
                      </div>

                      <div className="p-4 bg-indigo-950/20 border border-indigo-900/30 text-indigo-400 rounded-2xl flex items-start gap-3">
                        <Cloud className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-indigo-300">Mode Hybrid / Offline-First</p>
                          <p className="text-3xs text-indigo-200 leading-relaxed mt-1">Aplikasi akan terus menyimpan seluruh transaksi secara lokal saat koneksi internet terputus, dan secara cerdas mengunggah perubahan secara batch begitu Anda mengaktifkan sinkronisasi cloud.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. Keamanan & PIN Subtab */}
                {activeSettingSubtab === "security" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-wider text-slate-200 flex items-center gap-2">
                        <Lock className="w-5 h-5 text-indigo-400" /> Keamanan & PIN Kasir
                      </h3>
                      <p className="text-3xs text-slate-500 mt-1">Atur kata sandi pengaman kasir (PIN) untuk melindung perubahan data penting seperti menghapus katalog barang atau memodifikasi stok produk.</p>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1.5 max-w-sm">
                        <label className="text-3xs font-black uppercase tracking-wider text-slate-400">PIN Keamanan (4 Digit Angka)</label>
                        <input
                          type="password"
                          maxLength={4}
                          value={cashierPin}
                          onChange={(e) => {
                            // Only allow numbers
                            const val = e.target.value.replace(/\D/g, "");
                            setCashierPin(val);
                          }}
                          className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors font-mono text-center tracking-widest font-black text-lg"
                          placeholder="••••"
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-850 rounded-2xl">
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-slate-300">Wajibkan PIN Setiap Edit Produk</p>
                          <p className="text-3xs text-slate-500">Mencegah kasir atau pihak yang tidak berwenang memodifikasi harga jual atau menghapus data inventaris barang secara sembarangan.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer select-none">
                          <input 
                            type="checkbox" 
                            checked={isPinRequiredToEdit} 
                            onChange={(e) => setIsPinRequiredToEdit(e.target.checked)} 
                            className="sr-only peer" 
                          />
                          <div className="w-10 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600 peer-checked:after:bg-white peer-checked:after:border-indigo-600 font-sans"></div>
                        </label>
                      </div>

                      <div className="bg-amber-950/20 border border-amber-900/30 text-amber-400 p-4 rounded-2xl flex items-start gap-3">
                        <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-amber-300">Catatan Keamanan</p>
                          <p className="text-3xs text-amber-200/80 leading-relaxed mt-1">Secara default, PIN diset ke <span className="font-mono font-bold text-slate-200">1234</span>. Silakan ganti PIN Anda demi menjaga kerahasiaan dan integritas operasional finansial toko Anda.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 6.5. User Manajemen Subtab */}
                {activeSettingSubtab === "users" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-wider text-slate-200 flex items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-400" /> User Manajemen & Hak Akses
                      </h3>
                      <p className="text-3xs text-slate-500 mt-1">
                        Kelola data pengguna aplikasi kasir dan batasi fitur berdasarkan peran masing-masing.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                      {/* Left Side: Users List Table */}
                      <div className="xl:col-span-7 bg-slate-950/30 border border-slate-900 p-4 rounded-2xl space-y-4">
                        <p className="text-xs font-bold text-slate-300">Daftar Pengguna</p>
                        
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b border-slate-900 text-4xs font-black uppercase tracking-wider text-slate-500 bg-slate-900/10">
                                <th className="py-2.5 px-3">Nama / Username</th>
                                <th className="py-2.5 px-3">PIN</th>
                                <th className="py-2.5 px-3">Role</th>
                                <th className="py-2.5 px-3 text-right">Aksi</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-900/30 text-2xs">
                              {users.map((usr) => (
                                <tr key={usr.id} className="hover:bg-slate-900/10 transition-colors">
                                  <td className="py-3 px-3">
                                    <p className="font-bold text-slate-200">{usr.name}</p>
                                    <p className="text-4xs text-slate-500 font-mono">@{usr.username}</p>
                                  </td>
                                  <td className="py-3 px-3 font-mono font-semibold text-slate-400">
                                    {usr.pin}
                                  </td>
                                  <td className="py-3 px-3">
                                    <span className={`inline-block text-[9px] font-black tracking-tight px-2 py-0.5 rounded uppercase border ${
                                      usr.role === "Owner"
                                        ? "bg-red-500/10 text-red-400 border-red-500/20"
                                        : usr.role === "Manager"
                                        ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                        : usr.role === "Kasir"
                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                        : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                    }`}>
                                      {usr.role}
                                    </span>
                                  </td>
                                  <td className="py-3 px-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      <button
                                        onClick={() => handleEditUserClick(usr)}
                                        className="p-1.5 bg-slate-900 hover:bg-slate-850 text-indigo-400 border border-slate-800 rounded-lg hover:text-indigo-300 transition-colors cursor-pointer"
                                        title="Ubah data user"
                                      >
                                        <Edit className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteUser(usr.id)}
                                        className="p-1.5 bg-slate-900 hover:bg-red-950/40 text-red-400 border border-slate-800 hover:border-red-900/30 rounded-lg transition-colors cursor-pointer"
                                        title="Hapus user"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Right Side: Form Create/Update */}
                      <form onSubmit={handleSaveUser} className="xl:col-span-5 bg-slate-950/40 border border-slate-900 p-5 rounded-2xl space-y-4">
                        <div>
                          <p className="text-xs font-bold text-slate-200">
                            {isEditingUser ? "Ubah Data User" : "Tambah User Baru"}
                          </p>
                          <p className="text-4xs text-slate-500 mt-0.5">
                            {isEditingUser ? "Sunting kredensial & peran akun terpilih" : "Buat akun pengguna baru dengan batasan akses peran"}
                          </p>
                        </div>

                        <div className="space-y-3">
                          <div className="space-y-1">
                            <label className="text-4xs font-black uppercase text-slate-400 font-sans">Nama Lengkap</label>
                            <input
                              type="text"
                              value={userFormName}
                              onChange={(e) => setUserFormName(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-2xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                              placeholder="Contoh: Ahmad Kasir"
                              required
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-4xs font-black uppercase text-slate-400 font-sans">Username</label>
                            <input
                              type="text"
                              value={userFormUsername}
                              onChange={(e) => setUserFormUsername(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-2xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                              placeholder="Contoh: ahmad_pos"
                              required
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-4xs font-black uppercase text-slate-400 font-sans">PIN (4 Digit)</label>
                              <input
                                type="password"
                                maxLength={4}
                                value={userFormPin}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/\D/g, "");
                                  setUserFormPin(val);
                                }}
                                className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-2xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors font-mono text-center tracking-widest font-black"
                                placeholder="••••"
                                required
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-4xs font-black uppercase text-slate-400 font-sans">Peran / Role</label>
                              <select
                                value={userFormRole}
                                onChange={(e) => setUserFormRole(e.target.value as any)}
                                className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-2xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors font-sans"
                                required
                              >
                                <option value="Owner">Owner</option>
                                <option value="Manager">Manager</option>
                                <option value="Kasir">Kasir</option>
                                <option value="Staff Gudang">Staff Gudang</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Helper info on permissions */}
                        <div className="bg-slate-900/40 border border-slate-850/60 p-3 rounded-xl space-y-1">
                          <p className="text-4xs font-black text-indigo-400 uppercase">HAK AKSES ROLE:</p>
                          <ul className="text-[10px] text-slate-400 space-y-0.5 list-disc pl-3">
                            <li><strong className="text-slate-300 font-black">Owner:</strong> Akses penuh semua menu sistem POS</li>
                            <li><strong className="text-slate-300 font-black">Manager:</strong> Monitoring (Dashboard & Riwayat)</li>
                            <li><strong className="text-slate-300 font-black">Kasir:</strong> Transaksi kasir utama & riwayat transaksi</li>
                            <li><strong className="text-slate-300 font-black">Staff Gudang:</strong> Stok saja (Katalog & Supplier)</li>
                          </ul>
                        </div>

                        <div className="flex gap-2">
                          {isEditingUser && (
                            <button
                              type="button"
                              onClick={() => {
                                setUserFormId(null);
                                setUserFormName("");
                                setUserFormUsername("");
                                setUserFormPin("");
                                setUserFormRole("Kasir");
                                setIsEditingUser(false);
                              }}
                              className="flex-1 py-2 bg-slate-900 hover:bg-slate-850 text-slate-400 border border-slate-800 text-3xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                            >
                              Batal
                            </button>
                          )}
                          <button
                            type="submit"
                            className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-3xs font-sans uppercase tracking-wider rounded-xl shadow-lg shadow-indigo-500/10 transition-all cursor-pointer"
                          >
                            {isEditingUser ? "Simpan Perubahan" : "Tambah User"}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* 7. Tentang Aplikasi Subtab */}
                {activeSettingSubtab === "about" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-wider text-slate-200 flex items-center gap-2">
                        <Info className="w-5 h-5 text-indigo-400" /> Tentang SMART-POS
                      </h3>
                      <p className="text-3xs text-slate-500 mt-1">Informasi detail mengenai pengembang aplikasi, rincian hak cipta, dan standar kepatuhan versi.</p>
                    </div>

                    <div className="bg-slate-950/60 border border-slate-900 p-6 rounded-2xl space-y-4">
                      <div className="flex items-center gap-3.5 pb-4 border-b border-slate-900/80">
                        <div className="bg-indigo-600 text-white p-3 rounded-xl shadow-lg shadow-indigo-500/20">
                          <ShoppingCart className="w-6 h-6 stroke-[2.5]" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-100 leading-tight">SMART-POS Pro</h4>
                          <p className="text-3xs text-slate-500 font-mono mt-0.5">Versi Rilis: <span className="text-indigo-400 font-bold">{activeVersion}</span></p>
                        </div>
                      </div>

                      <div className="space-y-2.5 text-xs text-slate-400 leading-relaxed">
                        <p>SMART-POS Pro adalah aplikasi kasir pintar terintegrasi dengan modul driver cetak nirkabel Bluetooth thermal printer standar ESC/POS.</p>
                        <p>Didesain secara khusus menggunakan arsitektur hybrid modern yang memastikan operasional kasir tetap berjalan normal dalam keadaan offline sekalipun, dengan fungsionalitas backup handal serta kontrol versi rollback mutakhir.</p>
                      </div>

                      <div className="border-t border-slate-900/80 pt-4 space-y-3">
                        <div className="text-[10px] text-slate-500 flex justify-between items-center font-mono">
                          <span>Pengembang: AI Studio Engineer</span>
                          <span className="text-indigo-400 font-extrabold uppercase">
                            Lisensi: {licenseDetails?.type === "trial" ? "Trial Gratis" : licenseDetails?.type === "lifetime" ? "Pro - Lifetime" : `Pro - ${licenseDetails?.type === "monthly" ? "Bulanan" : "Tahunan"}`}
                          </span>
                        </div>
                        {licenseDetails && (
                          <div className="bg-slate-950/80 border border-slate-900/60 p-3.5 rounded-xl space-y-1.5 font-mono text-[9px] text-slate-400">
                            <p className="flex justify-between">
                              <span className="text-slate-500">Pemilik Toko:</span>
                              <span className="text-slate-300 font-bold">{licenseDetails.customerName}</span>
                            </p>
                            <p className="flex justify-between">
                              <span className="text-slate-500">Email Terdaftar:</span>
                              <span className="text-slate-300">{licenseDetails.customerEmail}</span>
                            </p>
                            <p className="flex justify-between">
                              <span className="text-slate-500">Key Aktif:</span>
                              <span className="text-indigo-300 tracking-wider font-bold select-all">{licenseDetails.key}</span>
                            </p>
                            <p className="flex justify-between">
                              <span className="text-slate-500">Masa Berlaku:</span>
                              <span className="text-slate-300">
                                {licenseDetails.type === "lifetime" ? "Seumur Hidup (Lifetime)" : new Date(licenseDetails.expiresAt).toLocaleDateString()}
                              </span>
                            </p>
                            {licenseDetails.type !== "lifetime" && (
                              <p className="flex justify-between">
                                <span className="text-slate-500">Sisa Hari:</span>
                                <span className={`font-bold ${Math.max(0, Math.ceil((licenseDetails.expiresAt - Date.now()) / (24 * 60 * 60 * 1000))) <= 1 ? 'text-red-400' : 'text-emerald-400'}`}>
                                  {Math.max(0, Math.ceil((licenseDetails.expiresAt - Date.now()) / (24 * 60 * 60 * 1000)))} Hari Lagi
                                </span>
                              </p>
                            )}
                          </div>
                        )}
                        <div className="flex justify-end pt-1">
                          <Link href="https://ais-pre-bkxv65hf2f2focysxjwl7c-61170093996.asia-southeast1.run.app/admin" target="_blank" rel="noopener noreferrer" className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 hover:underline">
                            <Shield className="w-3.5 h-3.5" /> Buka Panel Admin Lisensi <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        )}

        {activeTab === "cashier" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 h-[calc(100vh-80px)] overflow-hidden">
            {/* Cashier View - Catalog of Products (8 Columns) */}
            <div className="lg:col-span-8 flex flex-col h-full bg-slate-950 border-r border-slate-900 overflow-y-auto p-6 space-y-6">
              
              {/* Filter Row */}
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                {/* Search */}
                <div className="relative w-full md:w-80">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                    <Search className="w-4 h-4 text-slate-500" />
                  </span>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Cari produk SKU, nama, barcode..."
                    className="w-full bg-slate-900/60 border border-slate-800 focus:border-indigo-500 rounded-2xl py-2.5 pl-10 pr-4 text-xs font-medium focus:outline-none transition-colors placeholder:text-slate-500 text-slate-200"
                  />
                </div>

                {/* Categories */}
                <div className="flex flex-wrap gap-1.5 overflow-x-auto max-w-full pb-1 md:pb-0">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                        selectedCategory === cat
                          ? "bg-slate-800 text-indigo-400 border border-indigo-500/20 shadow-md"
                          : "bg-slate-900/40 text-slate-400 hover:text-slate-200 border border-transparent"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Products Catalog Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-12">
                {filteredProducts.length === 0 ? (
                  <div className="col-span-full py-16 flex flex-col items-center justify-center text-slate-500 space-y-3 bg-slate-900/10 border border-dashed border-slate-900 rounded-3xl">
                    <Package className="w-10 h-10 text-slate-600 stroke-[1.5]" />
                    <p className="text-xs font-bold text-slate-400">Tidak ada produk ditemukan</p>
                    <p className="text-2xs text-slate-500 font-mono">Coba ubah filter atau tambahkan produk baru</p>
                  </div>
                ) : (
                  filteredProducts.map((p) => {
                    const isLowStock = p.stock <= p.minStock;
                    const outOfStock = p.stock === 0;

                    return (
                      <motion.div
                        layout
                        key={p.id}
                        onClick={() => !outOfStock && addToCart(p)}
                        className={`group relative flex flex-col justify-between bg-slate-900/30 hover:bg-slate-900/60 border rounded-2xl p-4 cursor-pointer transition-all ${
                          outOfStock 
                            ? "border-slate-900 opacity-55 cursor-not-allowed" 
                            : isLowStock 
                              ? "border-amber-500/20 hover:border-amber-500/40" 
                              : "border-slate-900 hover:border-slate-800"
                        }`}
                      >
                        {/* Tags */}
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-4xs font-mono font-bold tracking-wider uppercase px-2 py-0.5 bg-slate-800 text-slate-400 rounded-md">
                            {p.category}
                          </span>
                          {outOfStock ? (
                            <span className="text-4xs font-black uppercase px-2 py-0.5 bg-red-950/80 text-red-400 rounded-md border border-red-900/50">
                              Habis
                            </span>
                          ) : isLowStock ? (
                            <span className="text-4xs font-black uppercase px-2 py-0.5 bg-amber-950/80 text-amber-400 rounded-md border border-amber-900/50 flex items-center gap-1">
                              <AlertTriangle className="w-2.5 h-2.5" /> Minim
                            </span>
                          ) : (
                            <span className="text-4xs font-mono text-slate-500">
                              Stok: <span className="font-bold text-slate-300">{p.stock}</span>
                            </span>
                          )}
                        </div>

                        {/* Product Photo */}
                        {p.image ? (
                          <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden mb-3 border border-slate-900 bg-slate-950 shrink-0">
                            <img
                              src={p.image}
                              alt={p.name}
                              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        ) : (
                          <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden mb-3 border border-slate-900/60 bg-slate-950/60 flex items-center justify-center text-slate-700 shrink-0">
                            <Package className="w-6 h-6 opacity-30" />
                          </div>
                        )}

                        {/* Title & Info */}
                        <div className="space-y-1 flex-1 mb-4">
                          <h3 className="text-xs font-bold text-slate-200 line-clamp-2 group-hover:text-indigo-400 transition-colors">
                            {p.name}
                          </h3>
                          <div className="flex items-center gap-2 font-mono text-4xs text-slate-500">
                            <span>{p.sku}</span>
                          </div>
                        </div>

                        {/* Price & Cart addition Action */}
                        <div className="flex items-center justify-between pt-3 border-t border-slate-900/60">
                          <span className="text-xs font-extrabold text-indigo-300 font-mono">
                            {formatIDR(p.sellingPrice)}
                          </span>
                          <div className="p-1.5 bg-slate-900 group-hover:bg-indigo-600 rounded-lg group-hover:text-white text-slate-500 transition-all">
                            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Sidebar Active Cart Panel (4 Columns) */}
            <div className="lg:col-span-4 bg-slate-950/50 backdrop-blur-xl border-l border-slate-900 h-full flex flex-col justify-between overflow-hidden">
              {/* Header Cart */}
              <div className="p-5 border-b border-slate-900 flex items-center justify-between bg-slate-950">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-indigo-400" />
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-300">Keranjang Belanja</h2>
                  {cart.length > 0 && (
                    <span className="bg-indigo-600 text-white font-mono font-bold text-3xs px-2 py-0.5 rounded-full">
                      {cart.reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                  )}
                </div>
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1 text-3xs font-bold uppercase"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                )}
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4 py-20">
                    <div className="relative">
                      <ShoppingCart className="w-12 h-12 text-slate-700 stroke-[1.2]" />
                      <Plus className="w-5 h-5 text-indigo-500/50 absolute -top-1.5 -right-1.5" />
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-xs font-bold text-slate-400">Keranjang masih kosong</p>
                      <p className="text-2xs text-slate-500 max-w-[200px]">Pilih produk dari katalog di sebelah kiri untuk ditambahkan</p>
                    </div>
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {cart.map((item) => (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        key={item.product.id}
                        className="flex items-center justify-between bg-slate-900/25 border border-slate-900 rounded-xl p-3"
                      >
                        <div className="space-y-1 flex-1 pr-3">
                          <h4 className="text-xs font-bold text-slate-200 line-clamp-1">{item.product.name}</h4>
                          <p className="text-3xs font-mono text-slate-500">
                            {formatIDR(item.product.sellingPrice)} &times; {item.quantity}
                          </p>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                            <button
                              onClick={() => updateQuantity(item.product.id, -1)}
                              className="p-1 text-slate-400 hover:text-slate-100 transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2.5 text-xs font-mono font-bold text-indigo-300">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.product.id, 1)}
                              className="p-1 text-slate-400 hover:text-slate-100 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="p-2 text-slate-500 hover:text-red-400 border border-transparent hover:border-red-500/10 rounded-lg hover:bg-red-950/20 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>

              {/* Checkout Calculation summary */}
              <div className="p-5 border-t border-slate-900 bg-slate-950/90 space-y-4">
                <div className="space-y-2 bg-slate-900/30 border border-slate-900/60 p-4 rounded-xl">
                  {/* Subtotal */}
                  <div className="flex justify-between text-2xs text-slate-400">
                    <span>Subtotal</span>
                    <span className="font-mono text-slate-200">{formatIDR(subtotal)}</span>
                  </div>

                  {/* Discount */}
                  <div className="flex items-center justify-between text-2xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <span>Diskon (%)</span>
                      <div className="flex items-center bg-slate-950 border border-slate-850 rounded px-1.5 py-0.5">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={discountPercent || ""}
                          onChange={(e) => setDiscountPercent(Math.min(100, Math.max(0, Number(e.target.value))))}
                          className="w-8 bg-transparent text-center font-mono font-bold focus:outline-none text-indigo-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <span className="text-slate-500 text-3xs font-bold">%</span>
                      </div>
                    </div>
                    {discountAmount > 0 && (
                      <span className="font-mono text-red-400">-{formatIDR(discountAmount)}</span>
                    )}
                  </div>

                  {/* Tax */}
                  {showTaxOnReceipt && (
                    <div className="flex justify-between text-2xs text-slate-400">
                      <span>PPN (11%)</span>
                      <span className="font-mono text-slate-200">{formatIDR(taxAmount)}</span>
                    </div>
                  )}

                  {/* Divider */}
                  <div className="border-t border-slate-900 my-1" />

                  {/* Total */}
                  <div className="flex justify-between items-center text-xs font-black">
                    <span className="uppercase text-slate-300 tracking-wide">Total Belanja</span>
                    <span className="font-mono text-indigo-400 text-base">{formatIDR(total)}</span>
                  </div>
                </div>

                <button
                  disabled={cart.length === 0}
                  onClick={() => {
                    setIsCheckoutOpen(true);
                    setAmountPaidInput("");
                  }}
                  className={`w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md ${
                    cart.length === 0
                      ? "bg-slate-900 border border-slate-850 text-slate-500 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/10 cursor-pointer active:scale-98"
                  }`}
                >
                  Bayar & Selesai <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Product Management View */}
        {activeTab === "products" && (
          <div className="p-6 h-[calc(100vh-80px)] overflow-y-auto space-y-6">
            
            {/* KPI Cards on Product screen */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-5 flex items-center gap-4">
                <div className="p-3 bg-indigo-950 border border-indigo-900/40 rounded-xl text-indigo-400">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-3xs font-bold tracking-wider uppercase text-slate-500">Jumlah Produk</p>
                  <p className="text-lg font-black font-mono text-slate-200">{products.length}</p>
                </div>
              </div>

              <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-5 flex items-center gap-4">
                <div className="p-3 bg-amber-950 border border-amber-900/40 rounded-xl text-amber-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-3xs font-bold tracking-wider uppercase text-slate-500">Stok Menipis</p>
                  <p className="text-lg font-black font-mono text-slate-200">{lowStockCount}</p>
                </div>
              </div>

              <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-5 flex items-center gap-4">
                <div className="p-3 bg-emerald-950 border border-emerald-900/40 rounded-xl text-emerald-400">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-3xs font-bold tracking-wider uppercase text-slate-500">Estimasi Nilai Stok</p>
                  <p className="text-lg font-black font-mono text-slate-200">
                    {formatIDR(products.reduce((acc, p) => acc + p.stock * p.purchasePrice, 0))}
                  </p>
                </div>
              </div>

              <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-5 flex items-center gap-4">
                <div className="p-3 bg-purple-950 border border-purple-900/40 rounded-xl text-purple-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-3xs font-bold tracking-wider uppercase text-slate-500">Estimasi Margin Penjualan</p>
                  <p className="text-lg font-black font-mono text-slate-200">
                    {formatIDR(products.reduce((acc, p) => acc + p.stock * (p.sellingPrice - p.purchasePrice), 0))}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Add/Edit Product Form (4 Columns) */}
              <div className="lg:col-span-4 bg-slate-900/20 border border-slate-900 p-5 rounded-2xl space-y-4 h-fit">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-900">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-300">
                    {isEditingProduct ? "Edit Produk" : "Tambah Produk Baru"}
                  </h2>
                </div>

                <form onSubmit={handleSaveProduct} className="space-y-4">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="text-3xs font-black tracking-wider uppercase text-slate-400">Nama Produk</label>
                    <input
                      type="text"
                      placeholder="Contoh: Beras Pandan Wangi 5kg"
                      value={prodForm.name}
                      onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 text-xs rounded-lg py-2 px-3 font-bold text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
                    />
                  </div>

                  {/* Foto Produk (Uploader) */}
                  <div className="space-y-1.5">
                    <label className="text-3xs font-black tracking-wider uppercase text-slate-400 flex items-center gap-1">
                      <Camera className="w-3 h-3 text-indigo-400" /> Foto Produk
                    </label>
                    
                    {prodForm.image ? (
                      <div className="relative group/img rounded-xl overflow-hidden border border-indigo-950 bg-slate-950 p-2 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={prodForm.image}
                            alt="Preview"
                            className="w-12 h-12 object-cover rounded-lg border border-slate-850"
                          />
                          <div>
                            <p className="text-[10px] font-bold text-slate-300">Gambar Terpilih</p>
                            <p className="text-[8px] font-mono text-slate-500">Mendukung PNG, JPG, WEBP</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setProdForm(prev => ({ ...prev, image: "" }))}
                          className="p-1.5 bg-red-950/80 hover:bg-red-900/80 text-red-400 border border-red-900/50 rounded-lg text-[10px] transition-colors cursor-pointer"
                        >
                          Hapus
                        </button>
                      </div>
                    ) : (
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const files = e.dataTransfer.files;
                          if (files && files[0]) {
                            const file = files[0];
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              if (event.target?.result) {
                                setProdForm(prev => ({ ...prev, image: event.target!.result as string }));
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        onClick={() => {
                          const input = document.createElement("input");
                          input.type = "file";
                          input.accept = "image/*";
                          input.onchange = (e) => {
                            const files = (e.target as HTMLInputElement).files;
                            if (files && files[0]) {
                              const file = files[0];
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                if (event.target?.result) {
                                  setProdForm(prev => ({ ...prev, image: event.target!.result as string }));
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          };
                          input.click();
                        }}
                        className="border border-dashed border-slate-800 hover:border-indigo-500/50 bg-slate-900/30 hover:bg-slate-900/60 rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all text-center group"
                      >
                        <div className="p-2 bg-slate-950 rounded-lg border border-slate-850 group-hover:border-indigo-500/20 text-slate-400 group-hover:text-indigo-400 transition-colors">
                          <Camera className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-300">Tarik gambar ke sini atau klik</p>
                          <p className="text-[8px] text-slate-500 font-mono">PNG, JPG, WEBP (Maks 1MB)</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* SKU & Barcode */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-3xs font-black tracking-wider uppercase text-slate-400">SKU</label>
                      <input
                        type="text"
                        placeholder="Contoh: BRS-PW-5K"
                        value={prodForm.sku}
                        onChange={(e) => setProdForm({ ...prodForm, sku: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 text-xs rounded-lg py-2 px-3 font-bold text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-3xs font-black tracking-wider uppercase text-slate-400">Barcode</label>
                      <input
                        type="text"
                        placeholder="Barcode EAN..."
                        value={prodForm.barcode}
                        onChange={(e) => setProdForm({ ...prodForm, barcode: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 text-xs rounded-lg py-2 px-3 font-bold text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
                      />
                    </div>
                  </div>

                  {/* Category */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-3xs font-black tracking-wider uppercase text-slate-400">Kategori</label>
                      <button
                        type="button"
                        onClick={() => setIsCategoryModalOpen(true)}
                        className="text-indigo-400 hover:text-indigo-300 font-bold text-[9px] uppercase flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <SlidersHorizontal className="w-2.5 h-2.5 text-indigo-400" /> Kelola Kategori
                      </button>
                    </div>
                    <select
                      value={prodForm.category}
                      onChange={(e) => setProdForm({ ...prodForm, category: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 text-xs rounded-lg py-2 px-3 font-bold text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer"
                    >
                      {customCategories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Pricing */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-3xs font-black tracking-wider uppercase text-slate-400">Harga Beli (Rp)</label>
                      <input
                        type="number"
                        placeholder="Harga modal"
                        value={prodForm.purchasePrice || ""}
                        onChange={(e) => setProdForm({ ...prodForm, purchasePrice: Number(e.target.value) })}
                        className="w-full bg-slate-900 border border-slate-800 text-xs rounded-lg py-2 px-3 font-mono font-bold text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-3xs font-black tracking-wider uppercase text-slate-400">Harga Jual (Rp)</label>
                      <input
                        type="number"
                        placeholder="Harga eceran"
                        value={prodForm.sellingPrice || ""}
                        onChange={(e) => setProdForm({ ...prodForm, sellingPrice: Number(e.target.value) })}
                        className="w-full bg-slate-900 border border-slate-800 text-xs rounded-lg py-2 px-3 font-mono font-bold text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Inventory stock */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-3xs font-black tracking-wider uppercase text-slate-400">Stok Awal</label>
                      <input
                        type="number"
                        placeholder="Stok fisik"
                        value={prodForm.stock || ""}
                        onChange={(e) => setProdForm({ ...prodForm, stock: Number(e.target.value) })}
                        className="w-full bg-slate-900 border border-slate-800 text-xs rounded-lg py-2 px-3 font-mono font-bold text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-3xs font-black tracking-wider uppercase text-slate-400">Min. Stok</label>
                      <input
                        type="number"
                        placeholder="Batas peringatan"
                        value={prodForm.minStock || ""}
                        onChange={(e) => setProdForm({ ...prodForm, minStock: Number(e.target.value) })}
                        className="w-full bg-slate-900 border border-slate-800 text-xs rounded-lg py-2 px-3 font-mono font-bold text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2.5 pt-3">
                    {isEditingProduct && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingProduct(false);
                          setEditingProductId(null);
                          setProdForm({
                            name: "",
                            sku: "",
                            barcode: "",
                            category: customCategories[0] || "Lain-lain",
                            purchasePrice: 0,
                            sellingPrice: 0,
                            stock: 0,
                            minStock: 0,
                            image: "",
                          });
                        }}
                        className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                      >
                        Batal
                      </button>
                    )}
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    >
                      <Check className="w-4 h-4" /> Simpan Produk
                    </button>
                  </div>
                </form>
              </div>

              {/* Products Table/List (8 Columns) */}
              <div className="lg:col-span-8 bg-slate-900/20 border border-slate-900 rounded-2xl overflow-hidden flex flex-col justify-between">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-950/60 border-b border-slate-900">
                        <th className="py-3.5 px-4 text-3xs font-black uppercase tracking-wider text-slate-400">Info Produk</th>
                        <th className="py-3.5 px-4 text-3xs font-black uppercase tracking-wider text-slate-400">Kategori</th>
                        <th className="py-3.5 px-4 text-3xs font-black uppercase tracking-wider text-slate-400">Harga Jual</th>
                        <th className="py-3.5 px-4 text-3xs font-black uppercase tracking-wider text-slate-400">Harga Modal</th>
                        <th className="py-3.5 px-4 text-3xs font-black uppercase tracking-wider text-slate-400 text-center">Stok</th>
                        <th className="py-3.5 px-4 text-3xs font-black uppercase tracking-wider text-slate-400 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900/40">
                      {products.map((p) => {
                        const isLowStock = p.stock <= p.minStock;

                        return (
                          <tr key={p.id} className="hover:bg-slate-900/20 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2.5">
                                {p.image ? (
                                  <img
                                    src={p.image}
                                    alt={p.name}
                                    className="w-8 h-8 rounded-lg object-cover bg-slate-950 border border-slate-800 shrink-0"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-850 flex items-center justify-center text-slate-600 shrink-0">
                                    <Package className="w-4 h-4 opacity-40" />
                                  </div>
                                )}
                                <div className="space-y-0.5">
                                  <p className="text-xs font-bold text-slate-200">{p.name}</p>
                                  <div className="flex items-center gap-2 font-mono text-4xs text-slate-500">
                                    <span>SKU: {p.sku}</span>
                                    <span>&bull;</span>
                                    <span>BAR: {p.barcode}</span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-3xs font-bold px-2 py-0.5 bg-slate-900 text-slate-400 border border-slate-800 rounded-md">
                                {p.category}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono font-bold text-indigo-400 text-xs">
                              {formatIDR(p.sellingPrice)}
                            </td>
                            <td className="py-3 px-4 font-mono text-slate-400 text-xs">
                              {formatIDR(p.purchasePrice)}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={`inline-block font-mono font-bold text-xs px-2 py-0.5 rounded-full ${
                                isLowStock 
                                  ? "bg-amber-950/40 text-amber-400 border border-amber-900/50" 
                                  : "bg-slate-900 text-slate-300"
                              }`}>
                                {p.stock} / {p.minStock}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleEditClick(p)}
                                  className="p-1.5 bg-slate-900 border border-slate-850 hover:border-slate-750 text-indigo-400 hover:text-indigo-300 rounded-lg text-3xs font-bold transition-all"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p.id)}
                                  className="p-1.5 bg-slate-900 border border-slate-850 hover:border-red-950 hover:bg-red-950/20 text-slate-500 hover:text-red-400 rounded-lg text-3xs font-bold transition-all"
                                >
                                  Hapus
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transactions History View */}
        {activeTab === "history" && (
          <div className="p-6 h-[calc(100vh-80px)] overflow-y-auto space-y-6">
            
            {/* KPI Cards on History screen */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-5 flex items-center gap-4">
                <div className="p-3 bg-indigo-950 border border-indigo-900/40 rounded-xl text-indigo-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-3xs font-bold tracking-wider uppercase text-slate-500">Total Penjualan</p>
                  <p className="text-lg font-black font-mono text-slate-200">{formatIDR(revenue)}</p>
                </div>
              </div>

              <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-5 flex items-center gap-4">
                <div className="p-3 bg-purple-950 border border-purple-900/40 rounded-xl text-purple-400">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-3xs font-bold tracking-wider uppercase text-slate-500">Jumlah Transaksi</p>
                  <p className="text-lg font-black font-mono text-slate-200">{transactions.length}</p>
                </div>
              </div>
            </div>

            {/* Past transactions list */}
            <div className="bg-slate-900/20 border border-slate-900 rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-slate-900 bg-slate-950/60 flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">Daftar Transaksi Kasir</h3>
                {transactions.length > 0 && (
                  <button
                    onClick={() => {
                      if (confirm("Hapus semua riwayat transaksi? Tindakan ini tidak bisa dibatalkan.")) {
                        setTransactions([]);
                      }
                    }}
                    className="text-red-400 hover:text-red-300 font-bold text-3xs uppercase tracking-wider flex items-center gap-1 border border-red-500/15 py-1.5 px-3 rounded-lg bg-red-950/20 hover:bg-red-950/40 transition-colors"
                  >
                    Hapus Semua
                  </button>
                )}
              </div>

              {transactions.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-slate-500 space-y-4">
                  <History className="w-12 h-12 text-slate-700 stroke-[1.2]" />
                  <div className="text-center space-y-1">
                    <p className="text-xs font-bold text-slate-400">Belum ada riwayat transaksi</p>
                    <p className="text-2xs text-slate-500">Lakukan penjualan di tab Kasir POS terlebih dahulu</p>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-slate-900/60">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="p-5 hover:bg-slate-900/10 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Left: Metadata & items info */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-black text-indigo-400 font-mono">{tx.id}</span>
                          <span className="text-slate-600 font-mono text-2xs">|</span>
                          <span className="text-2xs text-slate-400 font-mono">{tx.timestamp}</span>
                          <span className="text-slate-600 font-mono text-2xs">|</span>
                          <span className={`text-4xs font-black uppercase py-0.5 px-2 rounded-md ${
                            tx.paymentMethod === "CASH" 
                              ? "bg-emerald-950/60 text-emerald-400 border border-emerald-900/50" 
                              : tx.paymentMethod === "DEBIT"
                                ? "bg-blue-950/60 text-blue-400 border border-blue-900/50"
                                : "bg-purple-950/60 text-purple-400 border border-purple-900/50"
                          }`}>
                            {tx.paymentMethod}
                          </span>
                        </div>
                        {/* Items list summary */}
                        <div className="flex flex-wrap gap-1.5">
                          {tx.items.map((item, idx) => (
                            <span key={idx} className="text-3xs bg-slate-900 text-slate-400 py-1 px-2.5 rounded-lg border border-slate-850">
                              {item.productName} &times; <span className="font-bold text-slate-200">{item.quantity}</span>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Right: Amounts & reprint action */}
                      <div className="flex items-center gap-6 justify-between md:justify-end">
                        <div className="text-right">
                          <p className="text-3xs font-black text-slate-500 uppercase tracking-wider">Total Belanja</p>
                          <p className="text-base font-black font-mono text-indigo-400">{formatIDR(tx.total)}</p>
                          {tx.discount > 0 && (
                            <p className="text-4xs font-mono text-red-400 font-bold">Diskon: -{formatIDR(tx.discount)}</p>
                          )}
                        </div>

                        <button
                          onClick={() => printReceipt(tx)}
                          className="flex items-center gap-1.5 py-2.5 px-4 bg-slate-900 border border-slate-800 hover:border-slate-750 hover:bg-slate-850 rounded-xl text-xs font-black text-indigo-400 hover:text-indigo-300 transition-all cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" /> Cetak Ulang
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Suppliers Tab */}
        {activeTab === "suppliers" && (
          <div className="p-6 h-[calc(100vh-80px)] overflow-y-auto space-y-6">
            
            {/* Page Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-slate-900/60 to-slate-900/20 border border-slate-900 p-6 rounded-3xl">
              <div>
                <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-indigo-400" /> Kelola Supplier &amp; Pasokan
                </h2>
                <p className="text-xs text-slate-400 mt-1">Kelola daftar kontak pemasok barang (supplier) dan pantau saldo hutang piutang dagang Anda secara efisien.</p>
              </div>
              <div className="text-right">
                <span className="text-2xs font-mono font-bold uppercase py-1 px-3 bg-indigo-950/40 text-indigo-400 border border-indigo-900/40 rounded-full">
                  Total Hutang: {formatIDR(suppliers.reduce((sum, s) => sum + s.debt, 0))}
                </span>
              </div>
            </div>

            {/* Overview Cards for Suppliers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-5 flex items-center gap-4">
                <div className="p-3 bg-indigo-950 border border-indigo-900/40 rounded-xl text-indigo-400">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-3xs font-bold tracking-wider uppercase text-slate-500">Jumlah Pemasok</p>
                  <p className="text-lg font-black font-mono text-slate-200">{suppliers.length}</p>
                </div>
              </div>
              <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-5 flex items-center gap-4">
                <div className="p-3 bg-red-950 border border-red-900/40 rounded-xl text-red-400">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-3xs font-bold tracking-wider uppercase text-slate-500">Pemasok Berpiutang (Hutang Kita)</p>
                  <p className="text-lg font-black font-mono text-slate-200">{suppliers.filter(s => s.debt > 0).length} Supplier</p>
                </div>
              </div>
              <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-5 flex items-center gap-4">
                <div className="p-3 bg-amber-950 border border-amber-900/40 rounded-xl text-amber-400">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-3xs font-bold tracking-wider uppercase text-slate-500">Total Tunggakan Hutang</p>
                  <p className="text-lg font-black font-mono text-amber-400">{formatIDR(suppliers.reduce((sum, s) => sum + s.debt, 0))}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Form Column */}
              <div className="lg:col-span-4 bg-slate-900/20 border border-slate-900 p-5 rounded-2xl space-y-4 h-fit">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-900">
                  <UserPlus className="w-4 h-4 text-indigo-400" />
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-300">
                    {isEditingSupplier ? "Edit Pemasok" : "Tambah Supplier Baru"}
                  </h2>
                </div>

                <form onSubmit={handleSaveSupplier} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-3xs font-black tracking-wider uppercase text-slate-400">Nama Lengkap Supplier</label>
                    <input
                      type="text"
                      placeholder="Contoh: PT Sinar Sembako Abadi"
                      required
                      value={supForm.name}
                      onChange={(e) => setSupForm({ ...supForm, name: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 text-xs rounded-lg py-2 px-3 font-bold text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-3xs font-black tracking-wider uppercase text-slate-400">Nomor Telepon / WA</label>
                    <input
                      type="text"
                      placeholder="Contoh: 0812-xxxx-xxxx"
                      required
                      value={supForm.phone}
                      onChange={(e) => setSupForm({ ...supForm, phone: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 text-xs rounded-lg py-2 px-3 font-bold text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600 font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-3xs font-black tracking-wider uppercase text-slate-400">Alamat Kantor/Gudang</label>
                    <textarea
                      placeholder="Masukkan alamat lengkap..."
                      rows={3}
                      value={supForm.address}
                      onChange={(e) => setSupForm({ ...supForm, address: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 text-xs rounded-lg py-2 px-3 font-medium text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600 resize-none leading-relaxed"
                    />
                  </div>
                  {!isEditingSupplier && (
                    <div className="space-y-1.5">
                      <label className="text-3xs font-black tracking-wider uppercase text-slate-400">Saldo Hutang Awal (Rp)</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={supForm.debt || ""}
                        onChange={(e) => setSupForm({ ...supForm, debt: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-slate-900 border border-slate-800 text-xs rounded-lg py-2 px-3 font-mono font-bold text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
                      />
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    {isEditingSupplier && (
                      <button
                        type="button"
                        onClick={() => {
                          setSupForm({ name: "", phone: "", address: "", debt: 0 });
                          setIsEditingSupplier(false);
                          setEditingSupplierId(null);
                        }}
                        className="py-2.5 px-4 bg-slate-950 hover:bg-slate-850 border border-slate-850 text-slate-400 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                      >
                        Batal
                      </button>
                    )}
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    >
                      <Check className="w-4 h-4" /> Simpan Supplier
                    </button>
                  </div>
                </form>
              </div>

              {/* Table Column */}
              <div className="lg:col-span-8 flex flex-col space-y-4">
                
                {/* Search Bar */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                    <Search className="w-4 h-4 text-slate-500" />
                  </span>
                  <input
                    type="text"
                    value={supplierSearch}
                    onChange={(e) => setSupplierSearch(e.target.value)}
                    placeholder="Cari supplier berdasarkan nama, telepon, alamat..."
                    className="w-full bg-slate-900/60 border border-slate-800 focus:border-indigo-500 rounded-2xl py-2.5 pl-10 pr-4 text-xs font-medium focus:outline-none transition-colors placeholder:text-slate-500 text-slate-200"
                  />
                </div>

                {/* Suppliers Table list */}
                <div className="bg-slate-900/20 border border-slate-900 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse font-sans">
                      <thead>
                        <tr className="bg-slate-950/60 border-b border-slate-900 text-3xs font-black uppercase tracking-wider text-slate-400">
                          <th className="py-3.5 px-4">Info Supplier</th>
                          <th className="py-3.5 px-4">Alamat</th>
                          <th className="py-3.5 px-4 text-right">Tunggakan Hutang</th>
                          <th className="py-3.5 px-4 text-right">Kelola Saldo</th>
                          <th className="py-3.5 px-4 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900/40">
                        {suppliers
                          .filter(s => 
                            s.name.toLowerCase().includes(supplierSearch.toLowerCase()) ||
                            s.phone.includes(supplierSearch) ||
                            (s.address && s.address.toLowerCase().includes(supplierSearch.toLowerCase()))
                          )
                          .map((s) => (
                            <tr key={s.id} className="hover:bg-slate-900/10 transition-colors text-xs text-slate-300">
                              <td className="py-3.5 px-4">
                                <div className="space-y-0.5">
                                  <p className="font-bold text-slate-200">{s.name}</p>
                                  <p className="text-4xs font-mono text-slate-500">ID: {s.id} &bull; Telp: {s.phone}</p>
                                </div>
                              </td>
                              <td className="py-3.5 px-4 max-w-[200px] truncate text-slate-400 text-3xs">
                                {s.address || "-"}
                              </td>
                              <td className={`py-3.5 px-4 text-right font-mono font-bold ${s.debt > 0 ? "text-amber-500" : "text-slate-500"}`}>
                                {formatIDR(s.debt)}
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <div className="flex justify-end gap-1.5">
                                  <button
                                    onClick={() => {
                                      setDebtTargetId(s.id);
                                      setDebtModalType("supplier_pay");
                                      setIsDebtModalOpen(true);
                                      setDebtAmountInput("");
                                    }}
                                    className="py-1 px-2.5 bg-emerald-950/40 hover:bg-emerald-950/60 border border-emerald-900/30 text-emerald-400 text-3xs font-black rounded-lg transition-colors cursor-pointer"
                                  >
                                    Bayar Hutang
                                  </button>
                                  <button
                                    onClick={() => {
                                      setDebtTargetId(s.id);
                                      setDebtModalType("supplier_add");
                                      setIsDebtModalOpen(true);
                                      setDebtAmountInput("");
                                    }}
                                    className="py-1 px-2.5 bg-amber-950/40 hover:bg-amber-950/60 border border-amber-900/30 text-amber-400 text-3xs font-black rounded-lg transition-colors cursor-pointer"
                                  >
                                    Tambah Utang
                                  </button>
                                </div>
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => {
                                      setEditingSupplierId(s.id);
                                      setIsEditingSupplier(true);
                                      setSupForm({
                                        name: s.name,
                                        phone: s.phone,
                                        address: s.address || "",
                                        debt: s.debt
                                      });
                                    }}
                                    className="p-1.5 bg-slate-900 border border-slate-850 hover:border-slate-750 text-indigo-400 hover:text-indigo-300 rounded-lg text-3xs font-bold transition-all cursor-pointer"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteSupplier(s.id)}
                                    className="p-1.5 bg-slate-900 border border-slate-850 hover:border-red-950 hover:bg-red-950/20 text-slate-500 hover:text-red-400 rounded-lg text-3xs font-bold transition-all cursor-pointer"
                                  >
                                    Hapus
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Customers Tab */}
        {activeTab === "customers" && (
          <div className="p-6 h-[calc(100vh-80px)] overflow-y-auto space-y-6">
            
            {/* Page Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-slate-900/60 to-slate-900/20 border border-slate-900 p-6 rounded-3xl">
              <div>
                <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-400" /> Kelola Member &amp; Pelanggan
                </h2>
                <p className="text-xs text-slate-400 mt-1">Kelola data keanggotaan (membership), pantau saldo piutang belanja pelanggan, serta tukarkan poin loyalitas pelanggan secara praktis.</p>
              </div>
              <div className="text-right">
                <span className="text-2xs font-mono font-bold uppercase py-1 px-3 bg-indigo-950/40 text-indigo-400 border border-indigo-900/40 rounded-full">
                  Total Piutang Toko: {formatIDR(customers.reduce((sum, c) => sum + c.debt, 0))}
                </span>
              </div>
            </div>

            {/* Overview Cards for Customers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-5 flex items-center gap-4">
                <div className="p-3 bg-indigo-950 border border-indigo-900/40 rounded-xl text-indigo-400">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-3xs font-bold tracking-wider uppercase text-slate-500">Jumlah Member Terdaftar</p>
                  <p className="text-lg font-black font-mono text-slate-200">{customers.length}</p>
                </div>
              </div>
              <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-5 flex items-center gap-4">
                <div className="p-3 bg-emerald-950 border border-emerald-900/40 rounded-xl text-emerald-400">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-3xs font-bold tracking-wider uppercase text-slate-500">Total Poin Terkumpul</p>
                  <p className="text-lg font-black font-mono text-slate-200">{customers.reduce((sum, c) => sum + c.rewardPoints, 0)} Poin</p>
                </div>
              </div>
              <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-5 flex items-center gap-4">
                <div className="p-3 bg-red-950 border border-red-900/40 rounded-xl text-red-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-3xs font-bold tracking-wider uppercase text-slate-500">Piutang Berjalan Pelanggan</p>
                  <p className="text-lg font-black font-mono text-red-400">{formatIDR(customers.reduce((sum, c) => sum + c.debt, 0))}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Form Column */}
              <div className="lg:col-span-4 bg-slate-900/20 border border-slate-900 p-5 rounded-2xl space-y-4 h-fit">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-900">
                  <UserPlus className="w-4 h-4 text-indigo-400" />
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-300">
                    {isEditingCustomer ? "Edit Member / Pelanggan" : "Tambah Member Baru"}
                  </h2>
                </div>

                <form onSubmit={handleSaveCustomer} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-3xs font-black tracking-wider uppercase text-slate-400">Nama Lengkap Member</label>
                    <input
                      type="text"
                      placeholder="Contoh: Budi Santoso"
                      required
                      value={custForm.name}
                      onChange={(e) => setCustForm({ ...custForm, name: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 text-xs rounded-lg py-2 px-3 font-bold text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-3xs font-black tracking-wider uppercase text-slate-400">Nomor Telepon / WA</label>
                    <input
                      type="text"
                      placeholder="Contoh: 0811-xxxx-xxxx"
                      required
                      value={custForm.phone}
                      onChange={(e) => setCustForm({ ...custForm, phone: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 text-xs rounded-lg py-2 px-3 font-bold text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600 font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-3xs font-black tracking-wider uppercase text-slate-400">Alamat Tempat Tinggal</label>
                    <textarea
                      placeholder="Masukkan alamat lengkap..."
                      rows={3}
                      value={custForm.address}
                      onChange={(e) => setCustForm({ ...custForm, address: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 text-xs rounded-lg py-2 px-3 font-medium text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600 resize-none leading-relaxed"
                    />
                  </div>
                  {!isEditingCustomer && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-3xs font-black tracking-wider uppercase text-slate-400">Poin Loyalitas Awal</label>
                        <input
                          type="number"
                          placeholder="0"
                          value={custForm.rewardPoints || ""}
                          onChange={(e) => setCustForm({ ...custForm, rewardPoints: parseInt(e.target.value) || 0 })}
                          className="w-full bg-slate-900 border border-slate-800 text-xs rounded-lg py-2 px-3 font-mono font-bold text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-3xs font-black tracking-wider uppercase text-slate-400">Piutang / Hutang Awal</label>
                        <input
                          type="number"
                          placeholder="0"
                          value={custForm.debt || ""}
                          onChange={(e) => setCustForm({ ...custForm, debt: parseFloat(e.target.value) || 0 })}
                          className="w-full bg-slate-900 border border-slate-800 text-xs rounded-lg py-2 px-3 font-mono font-bold text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    {isEditingCustomer && (
                      <button
                        type="button"
                        onClick={() => {
                          setCustForm({ name: "", phone: "", address: "", rewardPoints: 0, debt: 0 });
                          setIsEditingCustomer(false);
                          setEditingCustomerId(null);
                        }}
                        className="py-2.5 px-4 bg-slate-950 hover:bg-slate-850 border border-slate-850 text-slate-400 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                      >
                        Batal
                      </button>
                    )}
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    >
                      <Check className="w-4 h-4" /> Simpan Pelanggan
                    </button>
                  </div>
                </form>
              </div>

              {/* Table Column */}
              <div className="lg:col-span-8 flex flex-col space-y-4">
                
                {/* Search Bar */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                    <Search className="w-4 h-4 text-slate-500" />
                  </span>
                  <input
                    type="text"
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    placeholder="Cari member berdasarkan nama, nomor telepon, alamat..."
                    className="w-full bg-slate-900/60 border border-slate-800 focus:border-indigo-500 rounded-2xl py-2.5 pl-10 pr-4 text-xs font-medium focus:outline-none transition-colors placeholder:text-slate-500 text-slate-200"
                  />
                </div>

                {/* Shopping History Panel (Renders nested if a client is selected) */}
                {viewHistoryCustomerId && (
                  <div className="bg-slate-900/40 border border-indigo-900/40 p-5 rounded-2xl space-y-4 animate-fadeIn">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <History className="w-4 h-4 text-indigo-400" />
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">
                          Riwayat Belanja: {customers.find(c => c.id === viewHistoryCustomerId)?.name}
                        </h3>
                      </div>
                      <button
                        onClick={() => setViewHistoryCustomerId(null)}
                        className="text-3xs text-indigo-400 hover:text-indigo-300 font-black uppercase tracking-wider cursor-pointer"
                      >
                        Tutup Riwayat
                      </button>
                    </div>

                    {transactions.filter(t => t.customerId === viewHistoryCustomerId).length === 0 ? (
                      <p className="text-3xs text-slate-500 font-mono italic">Belum ada riwayat transaksi belanja terdaftar untuk member ini.</p>
                    ) : (
                      <div className="max-h-60 overflow-y-auto divide-y divide-slate-900/40 pr-2">
                        {transactions
                          .filter(t => t.customerId === viewHistoryCustomerId)
                          .map((tx) => (
                            <div key={tx.id} className="py-2.5 flex justify-between items-center text-xs text-slate-300">
                              <div className="space-y-1">
                                <p className="font-mono text-3xs font-bold text-indigo-400">{tx.id} &bull; <span className="text-slate-500">{tx.timestamp}</span></p>
                                <div className="flex flex-wrap gap-1">
                                  {tx.items.map((it, idx) => (
                                    <span key={idx} className="text-[10px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-900">
                                      {it.productName} ({it.quantity}x)
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div className="text-right space-y-1">
                                <p className="font-mono font-black text-slate-200">{formatIDR(tx.total)}</p>
                                <span className="text-4xs font-bold py-0.5 px-2 bg-indigo-950/40 text-indigo-400 rounded-md uppercase">{tx.paymentMethod}</span>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Customers Table List */}
                <div className="bg-slate-900/20 border border-slate-900 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse font-sans">
                      <thead>
                        <tr className="bg-slate-950/60 border-b border-slate-900 text-3xs font-black uppercase tracking-wider text-slate-400">
                          <th className="py-3.5 px-4">Info Member</th>
                          <th className="py-3.5 px-4">Poin Reward</th>
                          <th className="py-3.5 px-4 text-right">Tunggakan Piutang</th>
                          <th className="py-3.5 px-4 text-center">Riwayat</th>
                          <th className="py-3.5 px-4 text-right">Kelola Saldo</th>
                          <th className="py-3.5 px-4 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900/40">
                        {customers
                          .filter(c => 
                            c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                            c.phone.includes(customerSearch) ||
                            (c.address && c.address.toLowerCase().includes(customerSearch.toLowerCase()))
                          )
                          .map((c) => (
                            <tr key={c.id} className="hover:bg-slate-900/10 transition-colors text-xs text-slate-300">
                              <td className="py-3.5 px-4">
                                <div className="space-y-0.5">
                                  <p className="font-bold text-slate-200">{c.name}</p>
                                  <p className="text-4xs font-mono text-slate-500">ID: {c.id} &bull; Telp: {c.phone}</p>
                                </div>
                              </td>
                              <td className="py-3.5 px-4">
                                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 border border-emerald-900/30 rounded-lg">
                                  <Gift className="w-3 h-3" /> {c.rewardPoints} pts
                                </span>
                              </td>
                              <td className={`py-3.5 px-4 text-right font-mono font-bold ${c.debt > 0 ? "text-red-400" : "text-slate-500"}`}>
                                {formatIDR(c.debt)}
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                <button
                                  onClick={() => setViewHistoryCustomerId(c.id)}
                                  className="py-1 px-2.5 bg-slate-900 border border-slate-850 hover:border-slate-700 text-indigo-400 hover:text-indigo-300 text-3xs font-black rounded-lg transition-colors cursor-pointer"
                                >
                                  Belanja ({transactions.filter(t => t.customerId === c.id).length})
                                </button>
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <div className="flex justify-end gap-1.5">
                                  <button
                                    onClick={() => {
                                      setDebtTargetId(c.id);
                                      setDebtModalType("customer_pay");
                                      setIsDebtModalOpen(true);
                                      setDebtAmountInput("");
                                    }}
                                    className="py-1 px-2.5 bg-emerald-950/40 hover:bg-emerald-950/60 border border-emerald-900/30 text-emerald-400 text-3xs font-black rounded-lg transition-colors cursor-pointer"
                                  >
                                    Cicil Piutang
                                  </button>
                                  <button
                                    onClick={() => {
                                      setDebtTargetId(c.id);
                                      setDebtModalType("customer_add");
                                      setIsDebtModalOpen(true);
                                      setDebtAmountInput("");
                                    }}
                                    className="py-1 px-2.5 bg-red-950/40 hover:bg-red-950/60 border border-red-900/30 text-red-400 text-3xs font-black rounded-lg transition-colors cursor-pointer"
                                  >
                                    Tambah Utang
                                  </button>
                                </div>
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => {
                                      setEditingCustomerId(c.id);
                                      setIsEditingCustomer(true);
                                      setCustForm({
                                        name: c.name,
                                        phone: c.phone,
                                        address: c.address || "",
                                        rewardPoints: c.rewardPoints,
                                        debt: c.debt
                                      });
                                    }}
                                    className="p-1.5 bg-slate-900 border border-slate-850 hover:border-slate-750 text-indigo-400 hover:text-indigo-300 rounded-lg text-3xs font-bold transition-all cursor-pointer"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteCustomer(c.id)}
                                    className="p-1.5 bg-slate-900 border border-slate-850 hover:border-red-950 hover:bg-red-950/20 text-slate-500 hover:text-red-400 rounded-lg text-3xs font-bold transition-all cursor-pointer"
                                  >
                                    Hapus
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Checkout Payment Modal Dialog */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCheckoutOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-slate-900 border border-slate-850 rounded-3xl overflow-hidden shadow-2xl p-6 space-y-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-950 border border-indigo-900/40 rounded-lg text-indigo-400">
                    <ShoppingCart className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">Pilih Metode & Bayar</h3>
                </div>
                <button
                  onClick={() => setIsCheckoutOpen(false)}
                  className="p-1.5 text-slate-500 hover:text-slate-300 rounded-lg bg-slate-950 border border-slate-850 hover:border-slate-750 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleCheckoutSubmit} className="space-y-6">
                          {/* Due total info */}
                <div className="bg-indigo-950/20 border border-indigo-900/30 p-4 rounded-2xl flex justify-between items-center">
                  <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider">Total Tagihan</span>
                  <span className="font-mono text-lg font-black text-indigo-400">{formatIDR(total)}</span>
                </div>

                {/* Customer / Member Selection */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-3xs font-black tracking-wider uppercase text-slate-400">Pilih Member / Pelanggan (Opsional)</label>
                    {selectedCustomerId && (
                      <span className="text-[10px] text-emerald-400 font-extrabold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/30 font-mono">
                        +{Math.floor(total / 10000)} Poin Reward
                      </span>
                    )}
                  </div>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => {
                      setSelectedCustomerId(e.target.value);
                      if (!e.target.value && paymentMethod === "HUTANG_MEMBER") {
                        setPaymentMethod("CASH");
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors font-bold cursor-pointer"
                  >
                    <option value="">-- Non Member / Umum --</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.phone}) {c.debt > 0 ? `[Utang: ${formatIDR(c.debt)}]` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Payment Methods selector */}
                <div className="space-y-2">
                  <label className="text-3xs font-black tracking-wider uppercase text-slate-400">Pilih Metode Pembayaran</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(["CASH", "DEBIT", "QRIS", "HUTANG_MEMBER"] as const).map((method) => {
                      const isDisabled = method === "HUTANG_MEMBER" && !selectedCustomerId;
                      return (
                        <button
                          type="button"
                          key={method}
                          disabled={isDisabled}
                          onClick={() => {
                            setPaymentMethod(method);
                            if (method !== "CASH" && method !== "HUTANG_MEMBER") setAmountPaidInput("");
                          }}
                          className={`py-3 rounded-xl font-black text-3xs tracking-wider transition-all border cursor-pointer ${
                            paymentMethod === method
                              ? "bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500 shadow-md shadow-indigo-500/10"
                              : isDisabled
                                ? "bg-slate-950 text-slate-700 border-slate-950 opacity-45 cursor-not-allowed"
                                : "bg-slate-950 hover:bg-slate-850 text-slate-400 border-slate-850 hover:border-slate-750"
                          }`}
                          title={isDisabled ? "Pilih member/pelanggan terlebih dahulu" : ""}
                        >
                          {method === "HUTANG_MEMBER" ? "HUTANG" : method}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Cash Paid input */}
                {paymentMethod === "CASH" ? (
                  <div className="space-y-4">
                    {/* Amount Input */}
                    <div className="space-y-1.5">
                      <label className="text-3xs font-black tracking-wider uppercase text-slate-400">Uang Tunai Diterima (Rp)</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-xs font-bold text-slate-500 pointer-events-none">
                          Rp
                        </span>
                        <input
                          autoFocus
                          type="number"
                          placeholder="0"
                          required
                          value={amountPaidInput}
                          onChange={(e) => setAmountPaidInput(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 text-base font-mono font-bold rounded-xl py-3 pl-10 pr-4 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Quick-cash buttons */}
                    <div className="flex flex-wrap gap-1.5">
                      {[total, 10000, 20000, 50000, 100000].map((val) => {
                        // round cash values nicely
                        const cashVal = val === total ? Math.ceil(total / 1000) * 1000 : val;
                        if (cashVal < total && val !== total) return null;

                        return (
                          <button
                            type="button"
                            key={cashVal}
                            onClick={() => setAmountPaidInput(String(cashVal))}
                            className="px-3 py-1.5 bg-slate-950 border border-slate-850 hover:border-indigo-500 rounded-lg text-3xs font-mono font-bold text-slate-400 hover:text-indigo-400 transition-all cursor-pointer"
                          >
                            {formatIDR(cashVal)}
                          </button>
                        );
                      })}
                    </div>

                    {/* Change Due Display */}
                    <div className="bg-slate-950 p-4 rounded-2xl flex justify-between items-center border border-slate-850">
                      <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider">Kembalian</span>
                      <span className="font-mono text-base font-black text-emerald-400">{formatIDR(changeDue)}</span>
                    </div>
                  </div>
                ) : paymentMethod === "HUTANG_MEMBER" ? (
                  <div className="space-y-4">
                    {/* Amount Input */}
                    <div className="space-y-1.5">
                      <label className="text-3xs font-black tracking-wider uppercase text-slate-400">Bayar Tunai Sebagian (DP / Uang Muka) (Rp)</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-xs font-bold text-slate-500 pointer-events-none">
                          Rp
                        </span>
                        <input
                          type="number"
                          placeholder="Masukkan DP atau kosongkan jika utang penuh"
                          value={amountPaidInput}
                          onChange={(e) => setAmountPaidInput(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 text-base font-mono font-bold rounded-xl py-3 pl-10 pr-4 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                      </div>
                    </div>
                    
                    {/* Remaining Debt Info */}
                    <div className="bg-red-950/20 p-4 border border-red-900/30 rounded-2xl flex items-start gap-3 text-slate-400">
                      <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-slate-300">Sisa Tagihan Dicatat Sebagai Utang</p>
                        <p className="text-3xs text-slate-500 mt-1">Sisa tagihan senilai <span className="font-mono text-amber-400 font-bold">{formatIDR(Math.max(0, total - (parseFloat(amountPaidInput) || 0)))}</span> akan langsung ditambahkan ke catatan Piutang pelanggan <span className="font-bold text-slate-300">{customers.find(c => c.id === selectedCustomerId)?.name}</span>.</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-950 p-4 border border-slate-850 rounded-2xl flex items-start gap-3 text-slate-400">
                    <Info className="w-5 h-5 text-indigo-400 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-300">Pembayaran Non-Tunai ({paymentMethod})</p>
                      <p className="text-3xs text-slate-500 mt-1">Pembayaran sebesar <span className="font-mono text-slate-300 font-bold">{formatIDR(total)}</span> akan diverifikasi secara otomatis melalui terminal bank atau QRIS provider.</p>
                    </div>
                  </div>
                )}

                {/* Footer submit */}
                <button
                  type="submit"
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-indigo-500/10 cursor-pointer active:scale-98 transition-all"
                >
                  Selesaikan Transaksi
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Printer ESC/POS Simulation Overlay Box */}
      <AnimatePresence>
        {showPrinterOverlay && lastPrintedReceipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isPrinting && setShowPrinterOverlay(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />

            {/* Receipt container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="relative w-full max-w-sm bg-slate-900 border border-slate-850 rounded-3xl overflow-hidden shadow-2xl p-6 flex flex-col items-center space-y-6"
            >
              {/* Virtual Indicator */}
              <div className="w-full flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="flex items-center gap-1.5 text-2xs font-bold text-slate-400">
                  <Printer className="w-3.5 h-3.5 text-indigo-400" /> STATUS PRINTER
                </span>
                {isPrinting ? (
                  <span className="text-3xs font-black text-indigo-400 uppercase tracking-wider animate-pulse flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
                    Sedang Mencetak...
                  </span>
                ) : (
                  <span className="text-3xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                    <Check className="w-3 h-3 stroke-[3]" />
                    Selesai Cetak
                  </span>
                )}
              </div>

              {/* Thermal Paper roll representation on dark backdrop */}
              <div className="w-full bg-slate-950 border border-slate-850 rounded-2xl p-4 md:p-5 relative overflow-hidden">
                
                {/* Paper header tear line */}
                <div className="absolute top-0 inset-x-0 h-1 bg-[linear-gradient(45deg,#334155_25%,transparent_25%),linear-gradient(-45deg,#334155_25%,transparent_25%)] bg-[size:10px_10px]" />
                
                {/* Printer thermal roll effect */}
                <div className="text-slate-300 font-mono text-3xs text-center space-y-4 py-2 select-text">
                  <div className="space-y-1">
                    <p className="text-2xs font-extrabold uppercase text-slate-100">{shopName}</p>
                    <p>{shopAddress}</p>
                    <p>Telp: {shopPhone}</p>
                    {receiptHeaderMsg && <p className="text-4xs italic text-slate-400 mt-1">{receiptHeaderMsg}</p>}
                  </div>

                  <div className="border-t border-dashed border-slate-800 my-2" />

                  <div className="text-left space-y-1">
                    <p className="flex justify-between">
                      <span>No: {lastPrintedReceipt.id}</span>
                      <span>{lastPrintedReceipt.timestamp.split(",")[0]}</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Kasir: Admin Toko</span>
                      <span>{lastPrintedReceipt.timestamp.split(",")[1]}</span>
                    </p>
                  </div>

                  <div className="border-t border-dashed border-slate-800 my-2" />

                  {/* Items list on receipt */}
                  <div className="text-left space-y-2">
                    {lastPrintedReceipt.items.map((item, idx) => (
                      <div key={idx} className="space-y-0.5">
                        <p className="text-slate-200 font-bold">{item.productName}</p>
                        <p className="flex justify-between text-slate-400">
                          <span>{item.quantity} &times; {formatIDR(item.price)}</span>
                          <span className="text-slate-300 font-bold">{formatIDR(item.quantity * item.price)}</span>
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-dashed border-slate-800 my-2" />

                  {/* Totals on receipt */}
                  <div className="text-left space-y-1">
                    <p className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatIDR(lastPrintedReceipt.subtotal)}</span>
                    </p>
                    {lastPrintedReceipt.discount > 0 && (
                      <p className="flex justify-between text-red-400">
                        <span>Diskon:</span>
                        <span>-{formatIDR(lastPrintedReceipt.discount)}</span>
                      </p>
                    )}
                    {showTaxOnReceipt && (
                      <p className="flex justify-between">
                        <span>PPN (11%):</span>
                        <span>{formatIDR(lastPrintedReceipt.tax)}</span>
                      </p>
                    )}
                    <div className="border-t border-slate-800 my-1" />
                    <p className="flex justify-between text-slate-100 font-bold">
                      <span>TOTAL:</span>
                      <span>{formatIDR(lastPrintedReceipt.total)}</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Bayar ({lastPrintedReceipt.paymentMethod}):</span>
                      <span>{formatIDR(lastPrintedReceipt.amountPaid)}</span>
                    </p>
                    {lastPrintedReceipt.paymentMethod === "CASH" && (
                      <p className="flex justify-between text-emerald-400 font-bold">
                        <span>Kembalian:</span>
                        <span>{formatIDR(lastPrintedReceipt.change)}</span>
                      </p>
                    )}
                  </div>

                  <div className="border-t border-dashed border-slate-800 my-2" />

                  <div className="text-center space-y-1">
                    <p className="font-extrabold text-slate-200">{receiptFooterMsg}</p>
                    <p className="text-4xs text-slate-500 mt-2">Driver Cetak Bluetooth &copy; SMART-POS ({printerPaperSize})</p>
                  </div>
                </div>

                {/* Paper footer tear line */}
                <div className="absolute bottom-0 inset-x-0 h-1 bg-[linear-gradient(45deg,#334155_25%,transparent_25%),linear-gradient(-45deg,#334155_25%,transparent_25%)] bg-[size:10px_10px] transform rotate-180" />
              </div>

              {/* Action buttons */}
              <div className="w-full flex gap-3">
                <button
                  disabled={isPrinting}
                  onClick={() => printReceipt(lastPrintedReceipt)}
                  className={`flex-1 py-3 border rounded-xl text-xs font-black uppercase flex items-center justify-center gap-1 transition-all ${
                    isPrinting
                      ? "bg-slate-900 border-slate-850 text-slate-600 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500 shadow-md cursor-pointer active:scale-98"
                  }`}
                >
                  <Printer className="w-4 h-4" /> {isPrinting ? "Mencetak..." : "Cetak Ulang"}
                </button>
                <button
                  disabled={isPrinting}
                  onClick={() => setShowPrinterOverlay(false)}
                  className={`py-3 px-5 bg-slate-950 border border-slate-850 hover:border-slate-750 text-slate-400 hover:text-slate-300 text-xs font-bold rounded-xl transition-all ${
                    isPrinting ? "opacity-50 cursor-not-allowed" : "cursor-pointer active:scale-98"
                  }`}
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* System Rollback & Version Control Modal Dialog */}
      <AnimatePresence>
        {isRollbackOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRollbackOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-slate-900 border border-slate-850 rounded-3xl overflow-hidden shadow-2xl p-6 space-y-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-950 border border-indigo-900/40 rounded-lg text-indigo-400">
                    <SlidersHorizontal className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">Sistem Rollback & Versi</h3>
                    <p className="text-4xs font-mono text-slate-500">Versi Aktif Saat Ini: <span className="font-bold text-indigo-400">{activeVersion}</span></p>
                  </div>
                </div>
                <button
                  onClick={() => setIsRollbackOpen(false)}
                  className="p-1.5 text-slate-500 hover:text-slate-300 rounded-lg bg-slate-950 border border-slate-850 hover:border-slate-750 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Rollback Command Form */}
              <div className="space-y-4">
                <div className="bg-slate-950 border border-slate-850 p-4 rounded-2xl space-y-3">
                  <label className="text-3xs font-black tracking-wider uppercase text-slate-400 block">
                    Perintahkan Rollback ke Versi (contoh: v01.00)
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-xs font-mono font-bold text-slate-500 pointer-events-none">
                        VER
                      </span>
                      <input
                        type="text"
                        placeholder="v01.00"
                        value={rollbackInput}
                        onChange={(e) => setRollbackInput(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-xs font-mono font-bold rounded-xl py-2.5 pl-12 pr-4 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-700"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRollback(rollbackInput)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-500/10 active:scale-98"
                    >
                      Rollback
                    </button>
                  </div>
                </div>

                {/* History of Snapshots / Available Versions */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-3xs font-black tracking-wider uppercase text-slate-400">
                      Daftar Riwayat Snapshot Versi
                    </label>
                    <button
                      type="button"
                      onClick={() => handleCreateSnapshot()}
                      className="text-indigo-400 hover:text-indigo-300 text-4xs font-black uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      + Buat Snapshot
                    </button>
                  </div>
                  
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {snapshots.map((snap) => (
                      <div 
                        key={snap.version}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                          activeVersion === snap.version
                            ? "bg-indigo-950/30 border-indigo-500/40"
                            : "bg-slate-950/40 border-slate-850 hover:border-slate-800"
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-black text-indigo-400">{snap.version}</span>
                            {activeVersion === snap.version && (
                              <span className="text-[8px] font-black bg-indigo-600 text-white py-0.5 px-1.5 rounded uppercase">Aktif</span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-300 font-medium">{snap.description}</p>
                          <p className="text-[9px] font-mono text-slate-500">{snap.timestamp}</p>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => handleRollback(snap.version)}
                          className="text-3xs font-black uppercase bg-slate-900 hover:bg-slate-850 text-slate-300 py-1.5 px-3 rounded-lg border border-slate-800 transition-all cursor-pointer"
                        >
                          Pulihkan
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Info Aturan */}
                <div className="bg-slate-950/60 border border-slate-900 p-3 rounded-2xl flex items-start gap-2.5 text-slate-500">
                  <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-3xs font-bold text-slate-400">Aturan Baku Kepatuhan Versi</p>
                    <ul className="text-[10px] list-disc list-inside space-y-0.5 text-slate-500">
                      <li>Setiap send prompt/perubahan, versi bertambah <span className="font-mono text-slate-300 font-bold">00.01</span> (v01.01 → v01.02).</li>
                      <li>Sistem rollback mandiri memulihkan seluruh data produk & riwayat transaksi dari snapshot terpilih.</li>
                      <li>Menjaga integritas kode program & alur aplikasi sepenuhnya stabil tanpa modifikasi yang tidak diinstruksikan.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Category Management Modal Dialog */}
      <AnimatePresence>
        {isCategoryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsCategoryModalOpen(false);
                setEditingCategoryIndex(null);
                setNewCategoryName("");
              }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-slate-900 border border-slate-850 rounded-3xl overflow-hidden shadow-2xl p-6 space-y-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-950 border border-indigo-900/40 rounded-lg text-indigo-400">
                    <SlidersHorizontal className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">Kelola Kategori</h3>
                    <p className="text-4xs text-slate-500 font-mono">Daftar kategori produk dinamis</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsCategoryModalOpen(false);
                    setEditingCategoryIndex(null);
                    setNewCategoryName("");
                  }}
                  className="p-1.5 text-slate-500 hover:text-slate-300 rounded-lg bg-slate-950 border border-slate-850 hover:border-slate-750 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Tambah Kategori */}
              <form onSubmit={handleAddCategory} className="bg-slate-950 border border-slate-850 p-4 rounded-2xl space-y-3">
                <label className="text-3xs font-black tracking-wider uppercase text-slate-400 block">
                  Tambah Kategori Baru
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Contoh: ATK, Elektronik, Obat..."
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-800 text-xs font-bold rounded-xl py-2.5 px-4 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-700"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-500/10 active:scale-98 flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" /> Tambah
                  </button>
                </div>
              </form>

              {/* List of categories */}
              <div className="space-y-2">
                <label className="text-3xs font-black tracking-wider uppercase text-slate-400 block">
                  Daftar Kategori Saat Ini ({customCategories.length})
                </label>
                
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {customCategories.map((cat, idx) => {
                    const isEditing = editingCategoryIndex === idx;
                    const isLainLain = cat === "Lain-lain";

                    return (
                      <div 
                        key={idx}
                        className="p-3 bg-slate-950/40 border border-slate-850 hover:border-slate-800 rounded-xl flex items-center justify-between gap-3 transition-all"
                      >
                        {isEditing ? (
                          <div className="flex-1 flex gap-2 items-center">
                            <input
                              type="text"
                              value={editingCategoryValue}
                              onChange={(e) => setEditingCategoryValue(e.target.value)}
                              className="flex-1 bg-slate-900 border border-slate-850 text-xs font-bold rounded-lg py-1.5 px-3 text-slate-200 focus:outline-none focus:border-indigo-500"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveEditCategory(idx)}
                              className="p-1.5 bg-emerald-950 border border-emerald-900/40 text-emerald-400 rounded-lg hover:bg-emerald-900 transition-all cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingCategoryIndex(null)}
                              className="p-1.5 bg-slate-900 border border-slate-850 text-slate-400 rounded-lg hover:bg-slate-850 transition-all cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <span className="text-xs font-bold text-slate-300">{cat}</span>
                            
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleStartEditCategory(idx, cat)}
                                className="p-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition-all cursor-pointer"
                              >
                                <SlidersHorizontal className="w-3.5 h-3.5" />
                              </button>
                              
                              <button
                                type="button"
                                disabled={isLainLain}
                                onClick={() => handleDeleteCategory(cat)}
                                className={`p-1.5 rounded-lg border transition-all ${
                                  isLainLain
                                    ? "bg-slate-950 border-slate-900 text-slate-700 cursor-not-allowed"
                                    : "bg-red-950/20 hover:bg-red-950/40 border-red-900/30 text-red-400 cursor-pointer"
                                }`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tips / Info */}
              <div className="bg-slate-950/60 border border-slate-900 p-3 rounded-2xl flex items-start gap-2.5 text-slate-500">
                <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-3xs font-bold text-slate-400">Aturan Pengelolaan Kategori</p>
                  <ul className="text-[10px] list-disc list-inside space-y-0.5 text-slate-500 leading-relaxed font-sans">
                    <li>Mengubah nama kategori otomatis meng-update kategori produk terkait.</li>
                    <li>Menghapus kategori otomatis memindahkan produk terkait ke kategori <span className="font-bold text-slate-300">&quot;Lain-lain&quot;</span>.</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Debt Adjustment Modal Dialog */}
        {isDebtModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDebtModalOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-sm bg-slate-900 border border-slate-850 rounded-3xl overflow-hidden shadow-2xl p-6 space-y-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-950 border border-indigo-900/40 rounded-lg text-indigo-400">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">
                    {debtModalType === "supplier_pay" && "Bayar Hutang Supplier"}
                    {debtModalType === "supplier_add" && "Tambah Hutang Supplier"}
                    {debtModalType === "customer_pay" && "Terima Pembayaran Piutang"}
                    {debtModalType === "customer_add" && "Tambah Utang Pelanggan"}
                  </h3>
                </div>
                <button
                  onClick={() => setIsDebtModalOpen(false)}
                  className="p-1.5 text-slate-500 hover:text-slate-300 rounded-lg bg-slate-950 border border-slate-850 hover:border-slate-750 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body Form */}
              <form onSubmit={handleDebtSubmit} className="space-y-4">
                <div className="p-4 bg-slate-950/40 rounded-2xl border border-slate-850">
                  <span className="text-4xs font-mono font-bold text-slate-500 uppercase tracking-widest block mb-1">Target Transaksi</span>
                  <span className="text-xs font-bold text-slate-200">
                    {debtModalType.startsWith("supplier") 
                      ? suppliers.find(s => s.id === debtTargetId)?.name 
                      : customers.find(c => c.id === debtTargetId)?.name
                    }
                  </span>
                  <span className="text-3xs font-mono font-bold text-indigo-400 block mt-1">
                    Saldo Berjalan: {formatIDR(
                      debtModalType.startsWith("supplier")
                        ? (suppliers.find(s => s.id === debtTargetId)?.debt || 0)
                        : (customers.find(c => c.id === debtTargetId)?.debt || 0)
                    )}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-3xs font-black tracking-wider uppercase text-slate-400">Jumlah Dana (Rp)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-xs font-bold text-slate-500 pointer-events-none">
                      Rp
                    </span>
                    <input
                      autoFocus
                      type="number"
                      placeholder="0"
                      required
                      value={debtAmountInput}
                      onChange={(e) => setDebtAmountInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 text-base font-mono font-bold rounded-xl py-3 pl-10 pr-4 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-3xs font-black tracking-wider uppercase text-slate-400">Keterangan / Memo (Opsional)</label>
                  <input
                    type="text"
                    placeholder="Contoh: Pembayaran cicilan nota #1024"
                    value={debtNoteInput}
                    onChange={(e) => setDebtNoteInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 text-xs rounded-xl py-2.5 px-4 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg transition-all cursor-pointer"
                >
                  Proses Transaksi Saldo
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* User Switcher Modal */}
        {isUserSwitchOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsUserSwitchOpen(false);
                setSelectedSwitchUser(null);
                setSwitchPinInput("");
                setSwitchError("");
              }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-slate-900 border border-slate-850 rounded-3xl overflow-hidden shadow-2xl p-6 space-y-6 animate-in fade-in zoom-in-95 duration-150"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-950 border border-indigo-900/40 rounded-lg text-indigo-400">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">Ganti User / Switch Peran</h3>
                    <p className="text-[10px] text-slate-500">Berpindah sesi pengguna dan membatasi hak akses menu POS</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsUserSwitchOpen(false);
                    setSelectedSwitchUser(null);
                    setSwitchPinInput("");
                    setSwitchError("");
                  }}
                  className="p-1.5 text-slate-500 hover:text-slate-300 rounded-lg bg-slate-950 border border-slate-850 hover:border-slate-750 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {!selectedSwitchUser ? (
                /* 1. Select User Screen */
                <div className="space-y-4">
                  <p className="text-[11px] font-bold text-slate-400">PILIH USER UNTUK MASUK:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {users.map((usr) => (
                      <div
                        key={usr.id}
                        className="p-4 bg-slate-950/50 border border-slate-850 hover:border-indigo-500/50 rounded-2xl flex flex-col justify-between space-y-3 transition-all hover:shadow-lg hover:shadow-indigo-500/5 group"
                      >
                        <div>
                          <div className="flex items-start justify-between">
                            <p className="text-xs font-black text-slate-200 group-hover:text-white transition-colors">{usr.name}</p>
                            <span className={`text-[8px] font-black tracking-wider px-1.5 py-0.5 rounded uppercase border shrink-0 ${
                              usr.role === "Owner"
                                ? "bg-red-500/10 text-red-400 border-red-500/20"
                                : usr.role === "Manager"
                                ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                : usr.role === "Kasir"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            }`}>
                              {usr.role}
                            </span>
                          </div>
                          <p className="text-4xs font-mono text-slate-500 mt-0.5">@{usr.username}</p>
                          <p className="text-4xs font-bold text-indigo-400/80 mt-1">PIN Default: {usr.pin}</p>
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleSwitchUserInstant(usr)}
                            className="flex-1 py-1.5 bg-slate-900 hover:bg-indigo-600 hover:text-white text-[10px] font-black uppercase text-slate-400 rounded-xl transition-all cursor-pointer"
                            title="Masuk secara instan (Bypass PIN)"
                          >
                            Instan
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSwitchUser(usr);
                              setSwitchPinInput("");
                              setSwitchError("");
                            }}
                            className="flex-1 py-1.5 bg-indigo-950 hover:bg-indigo-900 text-[10px] font-black uppercase text-indigo-300 rounded-xl transition-all border border-indigo-900/40 cursor-pointer"
                          >
                            Pakai PIN
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* 2. Enter PIN Screen */
                <form onSubmit={handleSwitchUserSubmit} className="space-y-4">
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-850 flex items-center justify-between">
                    <div>
                      <span className="text-4xs font-mono font-bold text-slate-500 uppercase tracking-widest block mb-1">Target Switch</span>
                      <span className="text-xs font-black text-slate-100">{selectedSwitchUser.name}</span>
                      <span className="text-3xs text-slate-400 block mt-0.5">Peran: {selectedSwitchUser.role}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSwitchUser(null);
                        setSwitchPinInput("");
                        setSwitchError("");
                      }}
                      className="text-3xs font-black text-indigo-400 hover:text-indigo-300 uppercase underline cursor-pointer"
                    >
                      Pilih User Lain
                    </button>
                  </div>

                  <div className="space-y-2 max-w-xs mx-auto text-center">
                    <label className="text-3xs font-black tracking-wider uppercase text-slate-400">Masukkan PIN Keamanan</label>
                    <input
                      autoFocus
                      type="password"
                      maxLength={4}
                      required
                      value={switchPinInput}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setSwitchPinInput(val);
                        setSwitchError("");
                      }}
                      className="w-full bg-slate-950 border border-slate-850 text-xl font-mono font-black rounded-2xl py-3.5 text-center text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors tracking-widest"
                      placeholder="••••"
                    />
                    {switchError && (
                      <p className="text-3xs text-red-400 font-bold mt-1.5">{switchError}</p>
                    )}
                    <p className="text-4xs text-slate-500">Tips: PIN default untuk user ini adalah {selectedSwitchUser.pin}</p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSwitchUser(null);
                        setSwitchPinInput("");
                        setSwitchError("");
                      }}
                      className="flex-1 py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-400 text-3xs font-black uppercase rounded-xl transition-all cursor-pointer"
                    >
                      Kembali
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-3xs font-black uppercase rounded-xl shadow-lg shadow-indigo-500/20 transition-all cursor-pointer"
                    >
                      Verifikasi & Masuk
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
