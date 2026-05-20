// Lightweight global store with localStorage persistence.
// Tag-driven lead logic stays in leads-logic.ts — this is just state.
import { useSyncExternalStore } from "react";
import type {
  AppState, Lead, Organization, Contact, Opportunity, Product, Quote, Order,
  Movement, Ticket, EventItem, Rule, FAQ, Project, Task, Activity, TaskStatus,
  TicketStatus, TicketReply, OrderStatus, QuoteStatus, OpportunityStatus,
  TicketPriority, ID,
} from "./types";
import { SEED } from "./seed";

const STORAGE_KEY = "bace_crm_state_v1";

function load(): AppState {
  if (typeof window === "undefined") return SEED;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED;
    const parsed = JSON.parse(raw) as AppState;
    // Shallow merge to backfill new collections
    return { ...SEED, ...parsed };
  } catch {
    return SEED;
  }
}

let state: AppState = load();
const listeners = new Set<() => void>();

function persist() {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
}

function set(updater: (s: AppState) => AppState) {
  state = updater(state);
  persist();
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function snapshot(): AppState { return state; }

export function useStore<T>(selector: (s: AppState) => T): T {
  return useSyncExternalStore(subscribe, () => selector(state), () => selector(state));
}

export function getState(): AppState { return state; }

export function resetStore() { set(() => SEED); }

// --- helpers ---
const uid = (prefix: string) =>
  `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`.toUpperCase();
const now = () => new Date().toISOString();

// ===================== LEADS =====================
export const leadActions = {
  create(input: Partial<Lead> & Pick<Lead, "name" | "phone">) {
    const lead: Lead = {
      id: uid("L"),
      name: input.name,
      phone: input.phone,
      email: input.email,
      owner: input.owner ?? "Linh",
      value: input.value ?? 0,
      last_touch: now(),
      next_action: input.next_action ?? "",
      tags: input.tags ?? [],
      activities: [],
      orgId: input.orgId,
    };
    set((s) => ({ ...s, leads: [lead, ...s.leads] }));
    return lead;
  },
  update(id: ID, patch: Partial<Lead>) {
    set((s) => ({ ...s, leads: s.leads.map((l) => (l.id === id ? { ...l, ...patch } : l)) }));
  },
  remove(id: ID) {
    set((s) => ({ ...s, leads: s.leads.filter((l) => l.id !== id) }));
  },
  addActivity(id: ID, a: Omit<Activity, "id" | "created_at"> & { created_at?: string }) {
    const activity: Activity = { id: uid("A"), created_at: a.created_at ?? now(), ...a, entityType: "lead", entityId: id };
    set((s) => ({ ...s, leads: s.leads.map((l) => l.id === id ? { ...l, activities: [activity, ...l.activities], last_touch: activity.created_at } : l) }));
  },
  addTag(id: ID, tag: string) {
    set((s) => ({ ...s, leads: s.leads.map((l) => l.id === id && !l.tags.includes(tag) ? { ...l, tags: [...l.tags, tag] } : l) }));
  },
  removeTag(id: ID, tag: string) {
    set((s) => ({ ...s, leads: s.leads.map((l) => l.id === id ? { ...l, tags: l.tags.filter((t) => t !== tag) } : l) }));
  },
};

// ===================== ORGS / CONTACTS =====================
export const orgActions = {
  create(input: Partial<Organization> & Pick<Organization, "name">) {
    const org: Organization = { id: uid("O"), name: input.name, ...input };
    set((s) => ({ ...s, organizations: [org, ...s.organizations] }));
    return org;
  },
  update(id: ID, patch: Partial<Organization>) {
    set((s) => ({ ...s, organizations: s.organizations.map((o) => o.id === id ? { ...o, ...patch } : o) }));
  },
  remove(id: ID) {
    set((s) => ({ ...s, organizations: s.organizations.filter((o) => o.id !== id) }));
  },
};

export const contactActions = {
  create(input: Partial<Contact> & Pick<Contact, "name">) {
    const c: Contact = { id: uid("C"), name: input.name, ...input };
    set((s) => ({ ...s, contacts: [c, ...s.contacts] }));
    return c;
  },
  update(id: ID, patch: Partial<Contact>) {
    set((s) => ({ ...s, contacts: s.contacts.map((c) => c.id === id ? { ...c, ...patch } : c) }));
  },
  remove(id: ID) {
    set((s) => ({ ...s, contacts: s.contacts.filter((c) => c.id !== id) }));
  },
};

// ===================== OPPORTUNITIES =====================
export const opportunityActions = {
  create(input: Partial<Opportunity> & Pick<Opportunity, "name">) {
    const o: Opportunity = {
      id: uid("OP"),
      name: input.name,
      orgId: input.orgId,
      contactId: input.contactId,
      leadId: input.leadId,
      value: input.value ?? 0,
      owner: input.owner ?? "Linh",
      closeDate: input.closeDate ?? now(),
      status: input.status ?? "open",
      createdAt: now(),
    };
    set((s) => ({ ...s, opportunities: [o, ...s.opportunities] }));
    return o;
  },
  update(id: ID, patch: Partial<Opportunity>) {
    set((s) => ({ ...s, opportunities: s.opportunities.map((o) => o.id === id ? { ...o, ...patch } : o) }));
  },
  setStatus(id: ID, status: OpportunityStatus) { this.update(id, { status }); },
  remove(id: ID) {
    set((s) => ({ ...s, opportunities: s.opportunities.filter((o) => o.id !== id) }));
  },
};

// ===================== PRODUCTS =====================
export const productActions = {
  create(input: Partial<Product> & Pick<Product, "name" | "price">) {
    const p: Product = {
      id: uid("P"),
      name: input.name,
      sku: input.sku ?? `SKU-${Math.floor(Math.random() * 9999)}`,
      price: input.price,
      type: input.type ?? "product",
      trackInventory: input.trackInventory ?? true,
    };
    set((s) => ({ ...s, products: [p, ...s.products] }));
    return p;
  },
  update(id: ID, patch: Partial<Product>) {
    set((s) => ({ ...s, products: s.products.map((p) => p.id === id ? { ...p, ...patch } : p) }));
  },
  remove(id: ID) {
    set((s) => ({ ...s, products: s.products.filter((p) => p.id !== id) }));
  },
};

// ===================== QUOTES =====================
export const quoteActions = {
  create(input: Partial<Quote> & Pick<Quote, "oppId">) {
    const q: Quote = {
      id: uid("Q"),
      oppId: input.oppId,
      status: input.status ?? "draft",
      taxRate: input.taxRate ?? 0.1,
      lines: input.lines ?? [],
      createdAt: now(),
    };
    set((s) => ({ ...s, quotes: [q, ...s.quotes] }));
    return q;
  },
  update(id: ID, patch: Partial<Quote>) {
    set((s) => ({ ...s, quotes: s.quotes.map((q) => q.id === id ? { ...q, ...patch } : q) }));
  },
  setStatus(id: ID, status: QuoteStatus) { this.update(id, { status }); },
  remove(id: ID) {
    set((s) => ({ ...s, quotes: s.quotes.filter((q) => q.id !== id) }));
  },
};

export function quoteSubtotal(q: Quote) {
  return q.lines.reduce((s, l) => s + l.qty * l.price, 0);
}
export function quoteTax(q: Quote) { return quoteSubtotal(q) * q.taxRate; }
export function quoteTotal(q: Quote) { return quoteSubtotal(q) + quoteTax(q); }

// ===================== ORDERS =====================
export const orderActions = {
  createFromQuote(quoteId: ID): Order | null {
    const q = state.quotes.find((x) => x.id === quoteId);
    if (!q) return null;
    const o: Order = {
      id: uid("SO"),
      quoteId,
      oppId: q.oppId,
      status: "pending",
      lines: q.lines.map((l) => ({ ...l })),
      createdAt: now(),
    };
    set((s) => ({ ...s, orders: [o, ...s.orders] }));
    return o;
  },
  update(id: ID, patch: Partial<Order>) {
    set((s) => ({ ...s, orders: s.orders.map((o) => o.id === id ? { ...o, ...patch } : o) }));
  },
  setStatus(id: ID, status: OrderStatus) { this.update(id, { status }); },
  remove(id: ID) {
    set((s) => ({ ...s, orders: s.orders.filter((o) => o.id !== id) }));
  },
};

// ===================== INVENTORY =====================
export function stockOf(productId: ID): number {
  return state.movements.filter((m) => m.productId === productId).reduce((s, m) => s + m.qty, 0);
}

export const inventoryActions = {
  inbound(productId: ID, qty: number, reason = "Inbound") {
    if (qty <= 0) throw new Error("Quantity must be positive.");
    const m: Movement = { id: uid("M"), productId, qty, reason, at: now() };
    set((s) => ({ ...s, movements: [m, ...s.movements] }));
    return m;
  },
  outbound(productId: ID, qty: number, reason = "Outbound", refOrderId?: ID) {
    if (qty <= 0) throw new Error("Quantity must be positive.");
    const have = stockOf(productId);
    if (qty > have) throw new Error(`Insufficient stock (${have} available).`);
    const m: Movement = { id: uid("M"), productId, qty: -qty, reason, at: now(), refOrderId };
    set((s) => ({ ...s, movements: [m, ...s.movements] }));
    return m;
  },
};

// ===================== TICKETS =====================
export const ticketActions = {
  create(input: Partial<Ticket> & Pick<Ticket, "subject">) {
    const t: Ticket = {
      id: uid("T"),
      subject: input.subject,
      description: input.description,
      orgId: input.orgId,
      contactId: input.contactId,
      owner: input.owner ?? "Linh",
      priority: input.priority ?? "normal",
      status: input.status ?? "open",
      createdAt: now(),
      replies: [],
    };
    // Auto-assign rule
    const rule = state.rules.find((r) => r.kind === "urgent_assign" && r.enabled);
    if (rule && t.priority === "urgent" && rule.param) t.owner = rule.param;
    set((s) => ({ ...s, tickets: [t, ...s.tickets] }));
    return t;
  },
  update(id: ID, patch: Partial<Ticket>) {
    set((s) => ({ ...s, tickets: s.tickets.map((t) => t.id === id ? { ...t, ...patch } : t) }));
  },
  setStatus(id: ID, status: TicketStatus) { this.update(id, { status }); },
  addReply(id: ID, content: string, kind: "note" | "reply" = "reply", author = "You") {
    const reply: TicketReply = { id: uid("TR"), content, createdAt: now(), author, kind };
    set((s) => ({ ...s, tickets: s.tickets.map((t) => t.id === id ? { ...t, replies: [...t.replies, reply] } : t) }));
  },
  remove(id: ID) {
    set((s) => ({ ...s, tickets: s.tickets.filter((t) => t.id !== id) }));
  },
};

// ===================== EVENTS / SCHEDULE =====================
export const eventActions = {
  create(input: Partial<EventItem> & Pick<EventItem, "title" | "when">) {
    const e: EventItem = { id: uid("E"), title: input.title, when: input.when, entityType: input.entityType, entityId: input.entityId };
    set((s) => ({ ...s, events: [e, ...s.events] }));
    return e;
  },
  remove(id: ID) {
    set((s) => ({ ...s, events: s.events.filter((e) => e.id !== id) }));
  },
};

// ===================== RULES =====================
export const ruleActions = {
  toggle(id: ID) {
    set((s) => ({ ...s, rules: s.rules.map((r) => r.id === id ? { ...r, enabled: !r.enabled } : r) }));
  },
  update(id: ID, patch: Partial<Rule>) {
    set((s) => ({ ...s, rules: s.rules.map((r) => r.id === id ? { ...r, ...patch } : r) }));
  },
  // Apply stale_tag rule across leads (manual trigger from Rules page)
  applyStaleTags(): number {
    const r = state.rules.find((x) => x.kind === "stale_tag" && x.enabled);
    if (!r) return 0;
    let count = 0;
    set((s) => {
      const next = s.leads.map((l) => {
        const days = (Date.now() - new Date(l.last_touch).getTime()) / 86_400_000;
        if (days > 7 && !l.tags.includes("stale")) { count++; return { ...l, tags: [...l.tags, "stale"] }; }
        return l;
      });
      return { ...s, leads: next };
    });
    return count;
  },
};

// ===================== FAQ =====================
export const faqActions = {
  create(input: Partial<FAQ> & Pick<FAQ, "question" | "answer">) {
    const f: FAQ = { id: uid("F"), question: input.question, answer: input.answer, category: input.category ?? "General" };
    set((s) => ({ ...s, faqs: [f, ...s.faqs] }));
    return f;
  },
  update(id: ID, patch: Partial<FAQ>) {
    set((s) => ({ ...s, faqs: s.faqs.map((f) => f.id === id ? { ...f, ...patch } : f) }));
  },
  remove(id: ID) {
    set((s) => ({ ...s, faqs: s.faqs.filter((f) => f.id !== id) }));
  },
};

// ===================== PROJECTS / TASKS =====================
export const projectActions = {
  create(input: Partial<Project> & Pick<Project, "name">) {
    const p: Project = { id: uid("PR"), name: input.name, description: input.description, status: input.status ?? "active" };
    set((s) => ({ ...s, projects: [p, ...s.projects] }));
    return p;
  },
  update(id: ID, patch: Partial<Project>) {
    set((s) => ({ ...s, projects: s.projects.map((p) => p.id === id ? { ...p, ...patch } : p) }));
  },
  remove(id: ID) {
    set((s) => ({ ...s, projects: s.projects.filter((p) => p.id !== id), tasks: s.tasks.filter((t) => t.projectId !== id) }));
  },
};

export const taskActions = {
  create(input: Partial<Task> & Pick<Task, "title">) {
    const t: Task = { id: uid("TK"), title: input.title, status: input.status ?? "todo", projectId: input.projectId, assignee: input.assignee };
    set((s) => ({ ...s, tasks: [t, ...s.tasks] }));
    return t;
  },
  update(id: ID, patch: Partial<Task>) {
    set((s) => ({ ...s, tasks: s.tasks.map((t) => t.id === id ? { ...t, ...patch } : t) }));
  },
  setStatus(id: ID, status: TaskStatus) { this.update(id, { status }); },
  remove(id: ID) {
    set((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== id) }));
  },
};

// Expose for debug
export const __debug = { snapshot, resetStore };
export type { TicketPriority };
