import {
  Megaphone, CalendarDays, Images, BookOpen, LibraryBig, Files,
  Users, Users2, Inbox, HandCoins, PanelsTopLeft, Settings,
} from "lucide-react";

export const adminSections = [
  { group: "content", key: "notices", labelKey: "admin.manageNotices", icon: Megaphone, admin: "/admin/notices", view: "/notices", desc: "admin.descNotices", countKey: "notices" },
  { group: "content", key: "events", labelKey: "admin.manageEvents", icon: CalendarDays, admin: "/admin/events", view: "/events", desc: "admin.descEvents", countKey: "events" },
  { group: "content", key: "gallery", labelKey: "admin.manageGallery", icon: Images, admin: "/admin/gallery", view: "/gallery", desc: "admin.descGallery", countKey: "gallery" },
  { group: "content", key: "programs", labelKey: "admin.managePrograms", icon: BookOpen, admin: "/admin/programs", view: "/academic", desc: "admin.descPrograms", countKey: "programs" },
  { group: "content", key: "syllabus", labelKey: "admin.manageSyllabus", icon: LibraryBig, admin: "/admin/syllabus", view: "/syllabus", desc: "admin.descSyllabus", countKey: "syllabus" },
  { group: "content", key: "pages", labelKey: "admin.managePages", icon: Files, admin: "/admin/pages", view: "/about", desc: "admin.descPages", countKey: "pages" },
  { group: "people", key: "staff", labelKey: "admin.manageStaff", icon: Users, admin: "/admin/staff", view: "/faculty", desc: "admin.descStaff", countKey: "staff" },
  { group: "people", key: "committee", labelKey: "admin.manageCommittee", icon: Users2, admin: "/admin/committee", view: "/committee", desc: "admin.descCommittee", countKey: "committee" },
  { group: "engagement", key: "inbox", labelKey: "admin.inbox", icon: Inbox, admin: "/admin/inbox", view: "/contact", desc: "admin.descInbox", countKey: "inbox" },
  { group: "engagement", key: "donation", labelKey: "admin.manageDonation", icon: HandCoins, admin: "/admin/donation", view: "/donation", desc: "admin.descDonation" },
  { group: "engagement", key: "ads", labelKey: "admin.manageAds", icon: PanelsTopLeft, admin: "/admin/ads", view: "/", desc: "admin.descAds" },
  { group: "site", key: "settings", labelKey: "admin.settings", icon: Settings, admin: "/admin/settings", view: null, desc: "admin.descSettings" },
];

export default adminSections;
