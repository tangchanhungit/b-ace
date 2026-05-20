import type {
  AppState, Lead, Organization, Contact, Opportunity, Product, Quote, Order,
  Movement, Ticket, EventItem, Rule, FAQ, Project, Task, Activity,
} from "./types";

const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
};
const daysAhead = (n: number) => daysAgo(-n);

const seedActivities = (leadId: string, lastTouchDays: number): Activity[] => [
  { id: `${leadId}-a1`, type: "call", content: "Gọi tư vấn lần đầu.", created_at: daysAgo(lastTouchDays), entityType: "lead", entityId: leadId },
  { id: `${leadId}-a2`, type: "note", content: "Khách hỏi lịch học buổi tối.", created_at: daysAgo(lastTouchDays + 2), entityType: "lead", entityId: leadId },
  { id: `${leadId}-a3`, type: "meeting", content: "Hẹn gặp tại văn phòng để demo.", created_at: daysAgo(lastTouchDays + 5), entityType: "lead", entityId: leadId },
];

const leads: Lead[] = [
  { id: "L001", name: "Nguyễn Văn An", phone: "0901 234 567", owner: "Linh", value: 12_000_000, last_touch: daysAgo(1), next_action: "Gọi tư vấn khóa nâng cao", tags: ["facebook", "chua_hoc", "mien_phi_online", "mua_lan_dau", "vang"], activities: seedActivities("L001", 1) },
  { id: "L002", name: "Trần Thị Bình", phone: "0912 345 678", owner: "Minh", value: 25_500_000, last_touch: daysAgo(10), next_action: "Chốt hợp đồng PCTH", tags: ["tiktok", "da_hoc", "pcth", "mua_lai", "vang"], activities: seedActivities("L002", 10) },
  { id: "L003", name: "Lê Minh Châu", phone: "0987 654 321", owner: "Linh", value: 3_200_000, last_touch: daysAgo(3), next_action: "Gửi tài liệu free", tags: ["website", "chua_hoc", "mien_phi_offline", "khong_mua", "bac"], activities: seedActivities("L003", 3) },
  { id: "L004", name: "Phạm Quốc Dũng", phone: "0978 111 222", owner: "Hà", value: 48_000_000, last_touch: daysAgo(0), next_action: "Ký nhượng quyền khu vực", tags: ["zalo", "da_hoc", "nhuong_quyen", "mua_lan_dau", "vang"], activities: seedActivities("L004", 0), orgId: "O001" },
  { id: "L005", name: "Hoàng Thu Em", phone: "0934 567 890", owner: "Minh", value: 1_500_000, last_touch: daysAgo(14), next_action: "Follow-up sau 2 tuần", tags: ["facebook", "chua_hoc", "mien_phi_online", "ngung_mua", "dong"], activities: seedActivities("L005", 14) },
  { id: "L006", name: "Vũ Hồng Phúc", phone: "0966 222 333", owner: "Hà", value: 8_900_000, last_touch: daysAgo(5), next_action: "Demo lớp van_hanh", tags: ["tiktok", "da_hoc", "van_hanh", "mua_lai", "bac"], activities: seedActivities("L006", 5) },
  { id: "L007", name: "Đỗ Thanh Giang", phone: "0945 678 901", owner: "Linh", value: 15_000_000, last_touch: daysAgo(2), next_action: "Tư vấn MKT package", tags: ["website", "chua_hoc", "mkt", "mua_lan_dau", "vang"], activities: seedActivities("L007", 2) },
  { id: "L008", name: "Bùi Khánh Hà", phone: "0903 333 444", owner: "Minh", value: 4_500_000, last_touch: daysAgo(20), next_action: "Khảo sát lý do ngưng", tags: ["zalo", "da_hoc", "lop_khac", "ngung_mua", "dong"], activities: seedActivities("L008", 20) },
  { id: "L009", name: "Mai Thu Hương", phone: "0922 555 666", owner: "Hà", value: 32_000_000, last_touch: daysAgo(4), next_action: "Lên kế hoạch nhượng quyền", tags: ["facebook", "da_hoc", "nhuong_quyen", "mua_lai", "vang"], activities: seedActivities("L009", 4), orgId: "O002" },
  { id: "L010", name: "Ngô Việt Khôi", phone: "0911 777 888", owner: "Linh", value: 6_700_000, last_touch: daysAgo(8), next_action: "Mời học thử PCTH", tags: ["tiktok", "chua_hoc", "pcth", "mua_lan_dau", "bac"], activities: seedActivities("L010", 8) },
  { id: "L011", name: "Đặng Thảo Linh", phone: "0988 999 000", owner: "Minh", value: 0, last_touch: daysAgo(30), next_action: "Đóng lead", tags: ["other", "chua_hoc", "mien_phi_online", "khong_mua", "dong"], activities: seedActivities("L011", 30) },
  { id: "L012", name: "Tô Quang Long", phone: "0909 121 212", owner: "Hà", value: 19_800_000, last_touch: daysAgo(1), next_action: "Ký hợp đồng PCTH", tags: ["website", "da_hoc", "pcth", "mua_lai", "vang"], activities: seedActivities("L012", 1), orgId: "O003" },
  { id: "L013", name: "Phan Văn Nam", phone: "0901 555 010", owner: "Linh", value: 9_500_000, last_touch: daysAgo(6), next_action: "Demo phần mềm vận hành", tags: ["facebook", "chua_hoc", "van_hanh", "mua_lan_dau", "bac"], activities: seedActivities("L013", 6) },
  { id: "L014", name: "Lý Thiên Hương", phone: "0902 555 011", owner: "Minh", value: 14_200_000, last_touch: daysAgo(2), next_action: "Tư vấn franchise", tags: ["zalo", "da_hoc", "nhuong_quyen", "mua_lan_dau", "bac"], activities: seedActivities("L014", 2) },
  { id: "L015", name: "Trịnh Hoàng Sơn", phone: "0903 555 012", owner: "Hà", value: 5_500_000, last_touch: daysAgo(11), next_action: "Gửi báo giá MKT", tags: ["tiktok", "chua_hoc", "mkt", "mua_lan_dau", "dong"], activities: seedActivities("L015", 11) },
  { id: "L016", name: "Cao Thanh Tùng", phone: "0904 555 013", owner: "Linh", value: 28_400_000, last_touch: daysAgo(0), next_action: "Demo PCTH advanced", tags: ["website", "da_hoc", "pcth", "mua_lai", "vang"], activities: seedActivities("L016", 0) },
  { id: "L017", name: "Đinh Khả Vy", phone: "0905 555 014", owner: "Minh", value: 2_100_000, last_touch: daysAgo(9), next_action: "Mời học miễn phí", tags: ["facebook", "chua_hoc", "mien_phi_online", "mua_lan_dau", "dong"], activities: seedActivities("L017", 9) },
  { id: "L018", name: "Hà Bảo Trân", phone: "0906 555 015", owner: "Hà", value: 22_000_000, last_touch: daysAgo(3), next_action: "Chốt franchise quận 7", tags: ["zalo", "da_hoc", "nhuong_quyen", "mua_lan_dau", "vang"], activities: seedActivities("L018", 3), orgId: "O004" },
  { id: "L019", name: "Ngô Quỳnh Anh", phone: "0907 555 016", owner: "Linh", value: 7_800_000, last_touch: daysAgo(4), next_action: "Tư vấn lớp vận hành", tags: ["tiktok", "chua_hoc", "van_hanh", "mua_lan_dau", "bac"], activities: seedActivities("L019", 4) },
  { id: "L020", name: "Lê Trọng Đạt", phone: "0908 555 017", owner: "Minh", value: 17_500_000, last_touch: daysAgo(15), next_action: "Follow-up sau khóa thử", tags: ["website", "da_hoc", "pcth", "mua_lai", "bac"], activities: seedActivities("L020", 15) },
  { id: "L021", name: "Bùi Phương Mai", phone: "0909 555 018", owner: "Hà", value: 11_300_000, last_touch: daysAgo(1), next_action: "Demo onsite", tags: ["facebook", "da_hoc", "lop_khac", "mua_lan_dau", "vang"], activities: seedActivities("L021", 1) },
];

const organizations: Organization[] = [
  { id: "O001", name: "Cafe Phố Cổ", industry: "F&B", taxCode: "0312345678", phone: "028 3812 0001", address: "Q.1, TP.HCM" },
  { id: "O002", name: "Highland Brew JSC", industry: "F&B Chain", taxCode: "0312345679", website: "highlandbrew.vn", phone: "028 3812 0002" },
  { id: "O003", name: "Long Châu Group", industry: "Retail", taxCode: "0312345680", phone: "028 3812 0003" },
  { id: "O004", name: "Saigon Pearl F&B", industry: "F&B", taxCode: "0312345681", phone: "028 3812 0004", address: "Bình Thạnh, TP.HCM" },
  { id: "O005", name: "An Khang Distribution", industry: "Distribution", taxCode: "0312345682" },
  { id: "O006", name: "BamBoo Cafe Chain", industry: "F&B Chain", taxCode: "0312345683", website: "bamboocafe.vn" },
  { id: "O007", name: "Nha Trang Resort", industry: "Hospitality", taxCode: "0312345684" },
  { id: "O008", name: "Hanoi Coffee Lab", industry: "F&B", taxCode: "0312345685" },
  { id: "O009", name: "Đà Nẵng F&B Holdings", industry: "F&B Chain", taxCode: "0312345686" },
  { id: "O010", name: "Mekong Trading", industry: "Distribution", taxCode: "0312345687" },
];

const contacts: Contact[] = [
  { id: "C001", name: "Phạm Quốc Dũng", email: "dung@phoco.vn", phone: "0978 111 222", jobTitle: "Owner", orgId: "O001" },
  { id: "C002", name: "Mai Thu Hương", email: "huong@highland.vn", phone: "0922 555 666", jobTitle: "Operations Manager", orgId: "O002" },
  { id: "C003", name: "Tô Quang Long", email: "long@longchau.vn", phone: "0909 121 212", jobTitle: "CEO", orgId: "O003" },
  { id: "C004", name: "Hà Bảo Trân", email: "tran@sgpearl.vn", phone: "0906 555 015", jobTitle: "F&B Director", orgId: "O004" },
  { id: "C005", name: "Vũ Thành", email: "thanh@ankhang.vn", phone: "0911 000 555", jobTitle: "Procurement", orgId: "O005" },
  { id: "C006", name: "Lê Kim Sơn", email: "son@bamboo.vn", phone: "0912 555 011", jobTitle: "Chain Manager", orgId: "O006" },
  { id: "C007", name: "Nguyễn Hoài An", email: "an@ntrresort.vn", phone: "0913 555 022", jobTitle: "F&B Manager", orgId: "O007" },
];

const opportunities: Opportunity[] = [
  { id: "OP001", name: "Cafe Phố Cổ — PCTH chuyên sâu", orgId: "O001", contactId: "C001", leadId: "L004", value: 48_000_000, owner: "Hà", closeDate: daysAhead(14), status: "won", createdAt: daysAgo(20) },
  { id: "OP002", name: "Highland Brew — Lộ trình MKT", orgId: "O002", contactId: "C002", leadId: "L009", value: 32_000_000, owner: "Hà", closeDate: daysAhead(20), status: "open", createdAt: daysAgo(7) },
  { id: "OP003", name: "Long Châu — PCTH chain", orgId: "O003", contactId: "C003", leadId: "L012", value: 19_800_000, owner: "Hà", closeDate: daysAhead(10), status: "won", createdAt: daysAgo(15) },
  { id: "OP004", name: "Saigon Pearl — Franchise Q7", orgId: "O004", contactId: "C004", leadId: "L018", value: 22_000_000, owner: "Hà", closeDate: daysAhead(30), status: "open", createdAt: daysAgo(5) },
  { id: "OP005", name: "An Khang — Lớp vận hành", orgId: "O005", contactId: "C005", value: 9_500_000, owner: "Linh", closeDate: daysAhead(45), status: "lost", createdAt: daysAgo(30) },
];

const products: Product[] = [
  { id: "P001", name: "Khóa PCTH chuyên sâu", sku: "PCTH-001", price: 12_000_000, type: "service", trackInventory: false },
  { id: "P002", name: "Khóa Vận hành cửa hàng", sku: "VH-001", price: 6_500_000, type: "service", trackInventory: false },
  { id: "P003", name: "Khóa Marketing F&B", sku: "MKT-001", price: 8_000_000, type: "service", trackInventory: false },
  { id: "P004", name: "Bộ giáo trình in", sku: "GT-001", price: 850_000, type: "product", trackInventory: true },
  { id: "P005", name: "Bộ dụng cụ pha chế", sku: "DC-001", price: 2_400_000, type: "product", trackInventory: true },
  { id: "P006", name: "Combo nguyên liệu cơ bản", sku: "NL-001", price: 1_650_000, type: "product", trackInventory: true },
];

const quotes: Quote[] = [
  { id: "Q001", oppId: "OP001", status: "accepted", taxRate: 0.1, createdAt: daysAgo(12), lines: [
    { productId: "P001", qty: 3, price: 12_000_000 },
    { productId: "P004", qty: 5, price: 850_000 },
  ]},
  { id: "Q002", oppId: "OP002", status: "sent", taxRate: 0.1, createdAt: daysAgo(5), lines: [
    { productId: "P003", qty: 4, price: 8_000_000 },
  ]},
  { id: "Q003", oppId: "OP003", status: "accepted", taxRate: 0.1, createdAt: daysAgo(10), lines: [
    { productId: "P001", qty: 1, price: 12_000_000 },
    { productId: "P002", qty: 1, price: 6_500_000 },
    { productId: "P005", qty: 1, price: 2_400_000 },
  ]},
  { id: "Q004", oppId: "OP004", status: "draft", taxRate: 0.1, createdAt: daysAgo(3), lines: [
    { productId: "P001", qty: 2, price: 12_000_000 },
  ]},
  { id: "Q005", oppId: "OP002", status: "rejected", taxRate: 0.1, createdAt: daysAgo(18), lines: [
    { productId: "P002", qty: 2, price: 6_500_000 },
  ]},
];

const orders: Order[] = [
  { id: "SO001", quoteId: "Q001", oppId: "OP001", status: "fulfilled", createdAt: daysAgo(10), lines: [
    { productId: "P001", qty: 3, price: 12_000_000 },
    { productId: "P004", qty: 5, price: 850_000 },
  ]},
  { id: "SO002", quoteId: "Q003", oppId: "OP003", status: "confirmed", createdAt: daysAgo(8), lines: [
    { productId: "P001", qty: 1, price: 12_000_000 },
    { productId: "P002", qty: 1, price: 6_500_000 },
    { productId: "P005", qty: 1, price: 2_400_000 },
  ]},
  { id: "SO003", quoteId: "Q003", oppId: "OP003", status: "pending", createdAt: daysAgo(2), lines: [
    { productId: "P005", qty: 2, price: 2_400_000 },
  ]},
];

const movements: Movement[] = [
  { id: "M001", productId: "P004", qty: 100, reason: "Initial stock", at: daysAgo(40) },
  { id: "M002", productId: "P005", qty: 30, reason: "Initial stock", at: daysAgo(40) },
  { id: "M003", productId: "P006", qty: 50, reason: "Initial stock", at: daysAgo(40) },
  { id: "M004", productId: "P004", qty: -5, reason: "Outbound SO001", refOrderId: "SO001", at: daysAgo(10) },
  { id: "M005", productId: "P005", qty: -1, reason: "Outbound SO002", refOrderId: "SO002", at: daysAgo(8) },
  { id: "M006", productId: "P005", qty: 10, reason: "Restock", at: daysAgo(4) },
];

const tickets: Ticket[] = [
  { id: "T001", subject: "Học viên không xem được video bài 3", orgId: "O002", contactId: "C002", owner: "Minh", priority: "high", status: "in_progress", createdAt: daysAgo(2), description: "Lỗi 404 khi mở bài 3.", replies: [
    { id: "T001-r1", content: "Đã ghi nhận, đang kiểm tra server media.", createdAt: daysAgo(1), author: "Minh", kind: "reply" },
  ]},
  { id: "T002", subject: "Cần xuất hóa đơn VAT khóa PCTH", orgId: "O003", contactId: "C003", owner: "Linh", priority: "normal", status: "open", createdAt: daysAgo(1), replies: [] },
  { id: "T003", subject: "Yêu cầu đổi lịch học buổi tối", orgId: "O001", contactId: "C001", owner: "Hà", priority: "low", status: "resolved", createdAt: daysAgo(7), replies: [
    { id: "T003-r1", content: "Đã chuyển sang lớp tối thứ 3-5.", createdAt: daysAgo(6), author: "Hà", kind: "reply" },
  ]},
  { id: "T004", subject: "Khẩn — hệ thống đặt khóa lỗi thanh toán", orgId: "O004", contactId: "C004", owner: "Linh", priority: "urgent", status: "open", createdAt: daysAgo(0), replies: [] },
  { id: "T005", subject: "Hỏi chính sách franchise", orgId: "O006", contactId: "C006", owner: "Hà", priority: "normal", status: "closed", createdAt: daysAgo(20), replies: [
    { id: "T005-r1", content: "Đã gửi tài liệu franchise v2.", createdAt: daysAgo(19), author: "Hà", kind: "reply" },
  ]},
];

const events: EventItem[] = [
  { id: "E001", title: "Gọi tư vấn Nguyễn Văn An", when: daysAhead(1), entityType: "lead", entityId: "L001" },
  { id: "E002", title: "Demo Highland Brew", when: daysAhead(3), entityType: "opportunity", entityId: "OP002" },
  { id: "E003", title: "Họp triển khai Long Châu", when: daysAhead(5), entityType: "opportunity", entityId: "OP003" },
  { id: "E004", title: "Resolve ticket Saigon Pearl", when: daysAhead(0), entityType: "ticket", entityId: "T004" },
];

const rules: Rule[] = [
  { id: "R001", name: "Tự gắn tag stale cho lead quá 7 ngày", kind: "stale_tag", enabled: true },
  { id: "R002", name: "Ticket urgent → assign Linh", kind: "urgent_assign", enabled: true, param: "Linh" },
];

const faqs: FAQ[] = [
  { id: "F001", question: "Làm sao đổi lịch học?", answer: "Liên hệ chăm sóc khách hàng trước 24h.", category: "Lịch học" },
  { id: "F002", question: "Có xuất hóa đơn VAT không?", answer: "Có, gửi yêu cầu kèm MST trong vòng 7 ngày.", category: "Thanh toán" },
  { id: "F003", question: "Học phí có trả góp không?", answer: "Có 0% qua thẻ tín dụng VPBank/TPB.", category: "Thanh toán" },
];

const projects: Project[] = [
  { id: "PR001", name: "Ra mắt khóa PCTH v3", status: "active" },
  { id: "PR002", name: "Mở chi nhánh Đà Nẵng", status: "active" },
];

const tasks: Task[] = [
  { id: "TK001", title: "Quay video bài 1 PCTH v3", status: "doing", projectId: "PR001", assignee: "Linh" },
  { id: "TK002", title: "Thiết kế poster marketing", status: "todo", projectId: "PR001", assignee: "Minh" },
  { id: "TK003", title: "Khảo sát mặt bằng Đà Nẵng", status: "done", projectId: "PR002", assignee: "Hà" },
  { id: "TK004", title: "Soạn hợp đồng franchise mẫu", status: "todo", projectId: "PR002", assignee: "Hà" },
  { id: "TK005", title: "Upload giáo trình v3 lên LMS", status: "todo", projectId: "PR001", assignee: "Linh" },
];

export const SEED: AppState = {
  leads, organizations, contacts, opportunities, products, quotes, orders,
  movements, tickets, events, rules, faqs, projects, tasks,
};
