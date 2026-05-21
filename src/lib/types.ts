// Centralized entity types for the CRM.
export type ID = string;

export type ActivityType = "call" | "meeting" | "note" | "task";

export type Activity = {
  id: ID;
  type: ActivityType;
  content: string;
  created_at: string;
  entityType?: "lead" | "opportunity" | "ticket" | "organization" | "contact";
  entityId?: ID;
  owner?: string;
};

export type Lead = {
  id: ID;
  name: string;
  phone: string;
  email?: string;
  owner: string;
  value: number;
  last_touch: string;
  next_action: string;
  tags: string[];
  activities: Activity[];
  orgId?: ID;
  customerType?: "individual" | "company";
  companyName?: string;
  taxCode?: string;
  industry?: string;
};

export type Organization = {
  id: ID;
  name: string;
  industry?: string;
  taxCode?: string;
  website?: string;
  phone?: string;
  address?: string;
};

export type Contact = {
  id: ID;
  name: string;
  email?: string;
  phone?: string;
  jobTitle?: string;
  orgId?: ID;
};

export type OpportunityStatus = "open" | "won" | "lost";
export type Opportunity = {
  id: ID;
  name: string;
  orgId?: ID;
  contactId?: ID;
  leadId?: ID;
  value: number;
  owner: string;
  closeDate: string;
  status: OpportunityStatus;
  createdAt: string;
};

export type Product = {
  id: ID;
  name: string;
  sku: string;
  price: number;
  type: "product" | "service";
  trackInventory: boolean;
};

export type QuoteLine = { productId: ID; qty: number; price: number };
export type QuoteStatus = "draft" | "sent" | "accepted" | "rejected";
export type Quote = {
  id: ID;
  oppId: ID;
  status: QuoteStatus;
  taxRate: number; // e.g. 0.1
  lines: QuoteLine[];
  createdAt: string;
};

export type OrderStatus = "pending" | "confirmed" | "fulfilled";
export type Order = {
  id: ID;
  quoteId?: ID;
  oppId?: ID;
  status: OrderStatus;
  lines: QuoteLine[];
  createdAt: string;
};

export type Movement = {
  id: ID;
  productId: ID;
  qty: number; // positive=inbound, negative=outbound
  reason: string;
  refOrderId?: ID;
  at: string;
};

export type TicketPriority = "low" | "normal" | "high" | "urgent";
export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type TicketReply = {
  id: ID;
  content: string;
  createdAt: string;
  author: string;
  kind: "note" | "reply";
};
export type Ticket = {
  id: ID;
  subject: string;
  description?: string;
  orgId?: ID;
  contactId?: ID;
  owner: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string;
  replies: TicketReply[];
};

export type EventItem = {
  id: ID;
  title: string;
  when: string; // ISO
  entityType?: "lead" | "opportunity" | "ticket";
  entityId?: ID;
};

export type Rule = {
  id: ID;
  name: string;
  kind: "stale_tag" | "urgent_assign";
  enabled: boolean;
  param?: string; // e.g. owner name for urgent_assign
};

export type FAQ = { id: ID; question: string; answer: string; category: string };

export type Project = {
  id: ID;
  name: string;
  description?: string;
  status: "active" | "archived";
};

export type TaskStatus = "todo" | "doing" | "done";
export type Task = {
  id: ID;
  title: string;
  status: TaskStatus;
  projectId?: ID;
  assignee?: string;
};

export type ContractStatus = "draft" | "active" | "completed" | "cancelled";
export type ServiceContract = {
  id: ID;
  quoteId?: ID;
  oppId?: ID;
  orgId?: ID;
  contactId?: ID;
  leadId?: ID;
  value: number;
  startDate: string;
  endDate: string;
  status: ContractStatus;
  createdAt: string;
};

export type AppState = {
  leads: Lead[];
  organizations: Organization[];
  contacts: Contact[];
  opportunities: Opportunity[];
  products: Product[];
  quotes: Quote[];
  orders: Order[];
  serviceContracts: ServiceContract[];
  movements: Movement[];
  tickets: Ticket[];
  events: EventItem[];
  rules: Rule[];
  faqs: FAQ[];
  projects: Project[];
  tasks: Task[];
};
