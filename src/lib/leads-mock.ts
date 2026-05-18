export type ActivityType = "call" | "meeting" | "note" | "task";

export type Activity = {
  id: string;
  type: ActivityType;
  content: string;
  created_at: string; // ISO date
};

export type Lead = {
  id: string;
  name: string;
  phone: string;
  owner: string;
  value: number;
  last_touch: string; // ISO date
  next_action: string;
  tags: string[];
  activities: Activity[];
};

const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
};

const seedActivities = (leadId: string, lastTouchDays: number): Activity[] => [
  { id: `${leadId}-a1`, type: "call", content: "Gọi tư vấn lần đầu, khách quan tâm khóa nâng cao.", created_at: daysAgo(lastTouchDays) },
  { id: `${leadId}-a2`, type: "note", content: "Khách hỏi lịch học buổi tối và chính sách trả góp.", created_at: daysAgo(lastTouchDays + 2) },
  { id: `${leadId}-a3`, type: "meeting", content: "Hẹn gặp tại văn phòng để demo chương trình.", created_at: daysAgo(lastTouchDays + 5) },
  { id: `${leadId}-a4`, type: "task", content: "Gửi báo giá + brochure qua Zalo.", created_at: daysAgo(lastTouchDays + 7) },
];

export const MOCK_LEADS: Lead[] = [
  { id: "L001", name: "Nguyễn Văn An", phone: "0901 234 567", owner: "Linh", value: 12_000_000, last_touch: daysAgo(1), next_action: "Gọi tư vấn khóa nâng cao", tags: ["facebook", "chua_hoc", "mien_phi_online", "mua_lan_dau", "vang"], activities: seedActivities("L001", 1) },
  { id: "L002", name: "Trần Thị Bình", phone: "0912 345 678", owner: "Minh", value: 25_500_000, last_touch: daysAgo(10), next_action: "Chốt hợp đồng PCTH", tags: ["tiktok", "da_hoc", "pcth", "mua_lai", "vang"], activities: seedActivities("L002", 10) },
  { id: "L003", name: "Lê Minh Châu", phone: "0987 654 321", owner: "Linh", value: 3_200_000, last_touch: daysAgo(3), next_action: "Gửi tài liệu free", tags: ["website", "chua_hoc", "mien_phi_offline", "khong_mua", "bac"], activities: seedActivities("L003", 3) },
  { id: "L004", name: "Phạm Quốc Dũng", phone: "0978 111 222", owner: "Hà", value: 48_000_000, last_touch: daysAgo(0), next_action: "Ký nhượng quyền khu vực", tags: ["zalo", "da_hoc", "nhuong_quyen", "mua_lan_dau", "vang"], activities: seedActivities("L004", 0) },
  { id: "L005", name: "Hoàng Thu Em", phone: "0934 567 890", owner: "Minh", value: 1_500_000, last_touch: daysAgo(14), next_action: "Follow-up sau 2 tuần", tags: ["facebook", "chua_hoc", "mien_phi_online", "ngung_mua", "dong"], activities: seedActivities("L005", 14) },
  { id: "L006", name: "Vũ Hồng Phúc", phone: "0966 222 333", owner: "Hà", value: 8_900_000, last_touch: daysAgo(5), next_action: "Demo lớp van_hanh", tags: ["tiktok", "da_hoc", "van_hanh", "mua_lai", "bac"], activities: seedActivities("L006", 5) },
  { id: "L007", name: "Đỗ Thanh Giang", phone: "0945 678 901", owner: "Linh", value: 15_000_000, last_touch: daysAgo(2), next_action: "Tư vấn MKT package", tags: ["website", "chua_hoc", "mkt", "mua_lan_dau", "vang"], activities: seedActivities("L007", 2) },
  { id: "L008", name: "Bùi Khánh Hà", phone: "0903 333 444", owner: "Minh", value: 4_500_000, last_touch: daysAgo(20), next_action: "Khảo sát lý do ngưng", tags: ["zalo", "da_hoc", "lop_khac", "ngung_mua", "dong"], activities: seedActivities("L008", 20) },
  { id: "L009", name: "Mai Thu Hương", phone: "0922 555 666", owner: "Hà", value: 32_000_000, last_touch: daysAgo(4), next_action: "Lên kế hoạch nhượng quyền", tags: ["facebook", "da_hoc", "nhuong_quyen", "mua_lai", "vang"], activities: seedActivities("L009", 4) },
  { id: "L010", name: "Ngô Việt Khôi", phone: "0911 777 888", owner: "Linh", value: 6_700_000, last_touch: daysAgo(8), next_action: "Mời học thử PCTH", tags: ["tiktok", "chua_hoc", "pcth", "mua_lan_dau", "bac"], activities: seedActivities("L010", 8) },
  { id: "L011", name: "Đặng Thảo Linh", phone: "0988 999 000", owner: "Minh", value: 0, last_touch: daysAgo(30), next_action: "Đóng lead", tags: ["other", "chua_hoc", "mien_phi_online", "khong_mua", "dong"], activities: seedActivities("L011", 30) },
  { id: "L012", name: "Tô Quang Long", phone: "0909 121 212", owner: "Hà", value: 19_800_000, last_touch: daysAgo(1), next_action: "Ký hợp đồng PCTH", tags: ["website", "da_hoc", "pcth", "mua_lai", "vang"], activities: seedActivities("L012", 1) },
];
