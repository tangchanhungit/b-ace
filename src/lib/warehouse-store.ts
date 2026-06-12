// Multi-warehouse store. localStorage-backed, isolated per warehouse_id.
// Pure client state — no backend required for this prototype.
import { useSyncExternalStore } from "react";

export type WarehouseStatus = "active" | "inactive" | "archived";
export type WarehouseType = "central" | "branch" | "transit" | "cold";

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  type: WarehouseType;
  address: string;
  manager: string;
  status: WarehouseStatus;
  createdAt: string;
}

export type Role = "keeper" | "qc" | "manager" | "admin";

export type ReceiptStatus =
  | "draft" | "pending_qc" | "qc_passed" | "qc_failed" | "approved" | "stored";
export type IssueStatus =
  | "draft" | "pending_approval" | "approved" | "picking" | "shipped" | "rejected";
export type QCResult = "pass" | "fail" | "partial";

export interface TimelineEvent {
  at: string; by: string; role: Role; action: string; note?: string;
}
export interface ReceiptLine {
  sku: string; name: string; lot: string; expiry: string; qty: number;
  qcResult?: QCResult; qcNote?: string; passedQty?: number;
}
export interface Receipt {
  id: string; supplier: string; poRef: string; createdAt: string;
  createdBy: string; status: ReceiptStatus;
  lines: ReceiptLine[]; timeline: TimelineEvent[];
}
export interface IssueLine { sku: string; name: string; lot: string; qty: number }
export interface Issue {
  id: string; customer: string; soRef: string; createdAt: string;
  createdBy: string; status: IssueStatus;
  lines: IssueLine[]; timeline: TimelineEvent[];
}
export interface StockLot {
  sku: string; name: string; lot: string; expiry: string; qty: number; location: string;
}

export type TransferStatus = "pending" | "approved" | "in_transit" | "completed" | "cancelled";
export interface Transfer {
  id: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  sku: string;
  name: string;
  lot: string;
  qty: number;
  reason: string;
  requestedBy: string;
  approvedBy?: string;
  status: TransferStatus;
  createdAt: string;
}

interface WarehouseData {
  receipts: Receipt[];
  issues: Issue[];
  stock: StockLot[];
}

interface MultiState {
  warehouses: Warehouse[];
  transfers: Transfer[];
  data: Record<string, WarehouseData>;
}

const KEY = "bace_multi_warehouse_v1";
const nowISO = () => new Date().toISOString();

const SEED_WH: Warehouse[] = [
  { id: "WH-001", code: "WH-001", name: "Kho Hồ Chí Minh", type: "central",
    address: "Q.7, TP.HCM", manager: "QL Tuấn", status: "active", createdAt: "2026-01-15T08:00:00Z" },
  { id: "WH-002", code: "WH-002", name: "Kho Hà Nội", type: "branch",
    address: "Long Biên, Hà Nội", manager: "QL Nam", status: "active", createdAt: "2026-02-20T08:00:00Z" },
  { id: "WH-003", code: "WH-003", name: "Kho Bình Dương", type: "branch",
    address: "Thuận An, Bình Dương", manager: "QL Hùng", status: "active", createdAt: "2026-03-10T08:00:00Z" },
];

const SEED_DATA: Record<string, WarehouseData> = {
  "WH-001": {
    receipts: [
      { id: "GRN-0001", supplier: "CTY Dược Hậu Giang", poRef: "PO-2026-0142",
        createdAt: "2026-05-28T08:30:00Z", createdBy: "Thủ kho Hà", status: "stored",
        lines: [
          { sku: "MED-001", name: "Paracetamol 500mg", lot: "LOT-2605A", expiry: "2027-05-01", qty: 1000, qcResult: "pass", passedQty: 1000 },
          { sku: "MED-002", name: "Amoxicillin 250mg", lot: "LOT-2605B", expiry: "2027-03-15", qty: 500, qcResult: "pass", passedQty: 500 },
        ],
        timeline: [
          { at: "2026-05-28T08:30:00Z", by: "Thủ kho Hà", role: "keeper", action: "Tạo phiếu nhập" },
          { at: "2026-05-28T09:15:00Z", by: "QC Minh", role: "qc", action: "QC đạt" },
          { at: "2026-05-28T10:00:00Z", by: "QL Tuấn", role: "manager", action: "Duyệt phiếu" },
          { at: "2026-05-28T10:30:00Z", by: "Thủ kho Hà", role: "keeper", action: "Đã nhập kho" },
        ],
      },
      { id: "GRN-0002", supplier: "Vinamilk Logistics", poRef: "PO-2026-0151",
        createdAt: "2026-06-01T07:20:00Z", createdBy: "Thủ kho Hà", status: "pending_qc",
        lines: [{ sku: "FMC-010", name: "Sữa tươi 1L", lot: "LOT-0106", expiry: "2026-08-30", qty: 300 }],
        timeline: [
          { at: "2026-06-01T07:20:00Z", by: "Thủ kho Hà", role: "keeper", action: "Tạo phiếu nhập" },
          { at: "2026-06-01T07:45:00Z", by: "Thủ kho Hà", role: "keeper", action: "Gửi QC" },
        ],
      },
    ],
    issues: [
      { id: "GIN-0001", customer: "Bệnh viện Bạch Mai", soRef: "SO-2026-0088",
        createdAt: "2026-05-30T14:00:00Z", createdBy: "Thủ kho Hà", status: "shipped",
        lines: [{ sku: "MED-001", name: "Paracetamol 500mg", lot: "LOT-2605A", qty: 200 }],
        timeline: [
          { at: "2026-05-30T14:00:00Z", by: "Thủ kho Hà", role: "keeper", action: "Tạo phiếu xuất" },
          { at: "2026-05-30T15:00:00Z", by: "Thủ kho Hà", role: "keeper", action: "Đã giao" },
        ],
      },
    ],
    stock: [
      { sku: "MED-001", name: "Paracetamol 500mg", lot: "LOT-2605A", expiry: "2027-05-01", qty: 800, location: "A1-02" },
      { sku: "MED-002", name: "Amoxicillin 250mg", lot: "LOT-2605B", expiry: "2027-03-15", qty: 500, location: "A1-03" },
      { sku: "MED-004", name: "Aspirin 100mg", lot: "LOT-2504X", expiry: "2026-07-10", qty: 150, location: "A2-01" },
    ],
  },
  "WH-002": {
    receipts: [],
    issues: [],
    stock: [
      { sku: "MED-001", name: "Paracetamol 500mg", lot: "LOT-HN01", expiry: "2027-04-01", qty: 300, location: "B1-01" },
      { sku: "MED-003", name: "Vitamin C 1000mg", lot: "LOT-HN02", expiry: "2027-09-01", qty: 220, location: "B1-02" },
    ],
  },
  "WH-003": {
    receipts: [],
    issues: [],
    stock: [
      { sku: "MED-002", name: "Amoxicillin 250mg", lot: "LOT-BD01", expiry: "2026-12-01", qty: 180, location: "C1-01" },
    ],
  },
};

let state: MultiState = {
  warehouses: SEED_WH,
  transfers: [],
  data: SEED_DATA,
};
let hydrated = false;
const listeners = new Set<() => void>();

function emit() { listeners.forEach((l) => l()); }
function persist() {
  if (typeof window === "undefined" || !hydrated) return;
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
}
function set(updater: (s: MultiState) => MultiState) {
  state = updater(state); persist(); emit();
}

export function hydrateWarehouseStore() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as MultiState;
      state = { warehouses: parsed.warehouses ?? SEED_WH, transfers: parsed.transfers ?? [], data: { ...SEED_DATA, ...(parsed.data ?? {}) } };
      emit();
    }
  } catch { /* ignore */ }
}

export function useWarehouseStore<T>(selector: (s: MultiState) => T): T {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    () => selector(state),
    () => selector({ warehouses: SEED_WH, transfers: [], data: SEED_DATA }),
  );
}

export function getWarehouseState() { return state; }

function ensureData(id: string): WarehouseData {
  return state.data[id] ?? { receipts: [], issues: [], stock: [] };
}

// ===== Warehouse CRUD =====
export const warehouseActions = {
  create(input: Omit<Warehouse, "id" | "createdAt" | "status"> & { status?: WarehouseStatus }) {
    const id = `WH-${String(state.warehouses.length + 1).padStart(3, "0")}`;
    const w: Warehouse = { ...input, id, status: input.status ?? "active", createdAt: nowISO() };
    set((s) => ({ ...s, warehouses: [...s.warehouses, w], data: { ...s.data, [id]: { receipts: [], issues: [], stock: [] } } }));
    return w;
  },
  update(id: string, patch: Partial<Warehouse>) {
    set((s) => ({ ...s, warehouses: s.warehouses.map((w) => w.id === id ? { ...w, ...patch } : w) }));
  },
  remove(id: string) {
    set((s) => {
      const { [id]: _drop, ...rest } = s.data;
      return { ...s, warehouses: s.warehouses.filter((w) => w.id !== id), data: rest };
    });
  },
  archive(id: string) { warehouseActions.update(id, { status: "archived" }); },
};

// ===== Per-warehouse data mutators =====
function patchData(id: string, fn: (d: WarehouseData) => WarehouseData) {
  set((s) => ({ ...s, data: { ...s.data, [id]: fn(ensureData(id)) } }));
}

export const warehouseDataActions = {
  setReceipts(id: string, receipts: Receipt[]) { patchData(id, (d) => ({ ...d, receipts })); },
  setIssues(id: string, issues: Issue[]) { patchData(id, (d) => ({ ...d, issues })); },
  setStock(id: string, stock: StockLot[]) { patchData(id, (d) => ({ ...d, stock })); },
  get(id: string) { return ensureData(id); },
};

// ===== Transfers =====
export const transferActions = {
  create(input: Omit<Transfer, "id" | "createdAt" | "status" | "approvedBy">) {
    const id = `TRF-${String(state.transfers.length + 1).padStart(4, "0")}`;
    const t: Transfer = { ...input, id, status: "pending", createdAt: nowISO() };
    set((s) => ({ ...s, transfers: [t, ...s.transfers] }));
    return t;
  },
  approve(id: string, approvedBy: string) {
    set((s) => ({ ...s, transfers: s.transfers.map((t) => t.id === id ? { ...t, status: "approved", approvedBy } : t) }));
  },
  ship(id: string) {
    set((s) => ({ ...s, transfers: s.transfers.map((t) => t.id === id ? { ...t, status: "in_transit" } : t) }));
  },
  complete(id: string) {
    const t = state.transfers.find((x) => x.id === id);
    if (!t) return;
    // Deduct from source
    patchData(t.fromWarehouseId, (d) => ({
      ...d,
      stock: d.stock.map((s) => s.sku === t.sku && s.lot === t.lot ? { ...s, qty: Math.max(0, s.qty - t.qty) } : s),
    }));
    // Add to destination
    patchData(t.toWarehouseId, (d) => {
      const idx = d.stock.findIndex((s) => s.sku === t.sku && s.lot === t.lot);
      if (idx >= 0) {
        const next = [...d.stock];
        next[idx] = { ...next[idx], qty: next[idx].qty + t.qty };
        return { ...d, stock: next };
      }
      return { ...d, stock: [...d.stock, { sku: t.sku, name: t.name, lot: t.lot, expiry: "—", qty: t.qty, location: "NEW" }] };
    });
    set((s) => ({ ...s, transfers: s.transfers.map((x) => x.id === id ? { ...x, status: "completed" } : x) }));
  },
  cancel(id: string) {
    set((s) => ({ ...s, transfers: s.transfers.map((t) => t.id === id ? { ...t, status: "cancelled" } : t) }));
  },
};
