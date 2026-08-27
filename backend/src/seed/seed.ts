/**
 * Seed demo content + one admin account.
 * Run with: `npm run seed`
 *
 * Idempotent: clears the collections it manages, then re-inserts fresh demo
 * data. The admin is upserted (existing admin password is left untouched
 * unless you delete it first).
 */
import mongoose from "mongoose";
import { connectDB, disconnectDB } from "../config/db";
import { env } from "../config/env";
import { AdminModel, hashPassword } from "../models/Admin";
import { NoticeModel } from "../models/Notice";
import { EventModel } from "../models/Event";
import { GalleryItemModel } from "../models/GalleryItem";
import { StaffMemberModel } from "../models/StaffMember";
import { PageModel } from "../models/Page";
import { CommitteeMemberModel } from "../models/CommitteeMember";
import { ProgramModel } from "../models/Program";
import { SettingsModel } from "../models/Settings";
import { SyllabusModel } from "../models/Syllabus";

async function seedSyllabi() {
  await SyllabusModel.deleteMany({});
  await SyllabusModel.insertMany([
    { title: "Class 12 Physics Syllabus", titleNe: "कक्षा १२ भौतिक विज्ञान पाठ्यक्रम", grade: "Class 12", subject: "Physics", stream: "science", academicYear: "2082", featured: true, published: true, order: 1, description: "Course outline for Class 12 Physics." },
    { title: "Class 12 Accountancy Syllabus", titleNe: "कक्षा १२ लेखाशास्त्र पाठ्यक्रम", grade: "Class 12", subject: "Accountancy", stream: "management", academicYear: "2082", published: true, order: 2, description: "Course outline for Class 12 Accountancy." },
    { title: "Class 10 General Science Syllabus", titleNe: "कक्षा १० सामान्य विज्ञान पाठ्यक्रम", grade: "Class 10", subject: "Science", stream: "general", academicYear: "2082", published: true, order: 3, description: "SEE-aligned general science course outline." },
  ]);
  console.log("✅ Seeded syllabi");
}

async function seedAdmin() {
  const existing = await AdminModel.findOne({ email: env.SEED_ADMIN_EMAIL });
  if (existing) {
    console.log(`ℹ️  Admin already exists: ${env.SEED_ADMIN_EMAIL}`);
    return;
  }
  await AdminModel.create({
    name: env.SEED_ADMIN_NAME,
    email: env.SEED_ADMIN_EMAIL,
    passwordHash: await hashPassword(env.SEED_ADMIN_PASSWORD),
    role: "admin",
  });
  console.log(`✅ Created admin: ${env.SEED_ADMIN_EMAIL} / ${env.SEED_ADMIN_PASSWORD}`);
}

async function seedNotices() {
  await NoticeModel.deleteMany({});
  await NoticeModel.insertMany([
    {
      title: "Urgent notice regarding school closure due to extreme heat",
      titleNe: "अत्यधिक गर्मीका कारण विद्यालय बन्द हुने सम्बन्धी अत्यन्त जरुरी सूचना",
      body: "All students, teachers and guardians studying at this school are informed that classes will remain suspended due to the ongoing extreme heat wave.",
      bodyNe:
        "यस विद्यालयमा अध्ययनरत सम्पूर्ण विद्यार्थी, शिक्षक तथा अभिभावकहरूलाई सूचित गरिन्छ कि हाल बढ्दै गइरहेको अत्यधिक गर्मीका कारण कक्षाहरू स्थगित गरिएको छ।",
      category: "administrative",
      priority: "urgent",
      published: true,
    },
    {
      title: "Notice regarding Grade 11 admission application form",
      titleNe: "कक्षा ११ को भर्ना आवेदन फारम सम्बन्धी सूचना",
      body: "For the academic session 2081/82, students wishing to enroll in Grade 11 at this school may collect and submit the admission application form.",
      bodyNe:
        "शैक्षिक सत्र २०८१/८२ का लागि यस विद्यालयमा कक्षा ११ मा भर्ना हुन चाहने विद्यार्थीहरूको लागि आवेदन फारम वितरण कार्य खुला गरिएको व्यहोरा।",
      category: "academic",
      priority: "important",
      published: true,
    },
    {
      title: "Notice regarding guardian meeting",
      titleNe: "अभिभावक भेला सम्बन्धी सूचना",
      body: "A parent-teacher meeting will be held this coming Saturday. All guardians are requested to attend without fail.",
      bodyNe:
        "आगामी शनिबार विद्यालयको प्राङ्गणमा सञ्चालन हुने अभिभावक भेलामा सम्पूर्ण अभिभावकज्यूहरूलाई अनिवार्य उपस्थितिको लागि अनुरोध गरिन्छ।",
      category: "general",
      priority: "normal",
      published: true,
    },
  ]);
  console.log("✅ Seeded notices");
}

async function seedEvents() {
  await EventModel.deleteMany({});
  const now = Date.now();
  const day = 86_400_000;
  await EventModel.insertMany([
    {
      title: "Annual Sports Week 2024: Let the Games Begin!",
      titleNe: "वार्षिक खेलकुद सप्ताह २०२४",
      description:
        "Get ready for a week of thrilling athletic competitions, team spirit, and sportsmanship. All students are encouraged to participate and showcase their talents.",
      category: "sports",
      startDate: new Date(now + 10 * day),
      location: "School Grounds",
      featured: true,
      published: true,
    },
    {
      title: "Term II Examinations Schedule Released",
      titleNe: "दोस्रो सत्र परीक्षा तालिका",
      description:
        "The routine for the second terminal examinations has been published. Please review the schedule and prepare accordingly.",
      category: "academic",
      startDate: new Date(now + 20 * day),
      featured: true,
      published: true,
    },
    {
      title: "Annual Cultural Day Celebration",
      titleNe: "वार्षिक सांस्कृतिक दिवस",
      description:
        "A vibrant celebration of our diverse cultural heritage with performances, music, and traditional showcases by our students.",
      category: "cultural",
      startDate: new Date(now + 30 * day),
      featured: true,
      published: true,
    },
    {
      title: "Inauguration of New Science Laboratory",
      titleNe: "नयाँ विज्ञान प्रयोगशाला उद्घाटन",
      description:
        "The school proudly announces the opening of its state-of-the-art science laboratory, aimed at providing practical, hands-on experience for our high school students.",
      category: "academic",
      startDate: new Date(now - 15 * day),
      published: true,
    },
    {
      title: "Students Excel in District Level Debate Competition",
      titleNe: "जिल्लास्तरीय वादविवाद प्रतियोगितामा सफलता",
      description:
        "Congratulations to our debate team for securing first position in the annual district-level inter-school debate competition held at the district headquarters.",
      category: "general",
      startDate: new Date(now - 25 * day),
      published: true,
    },
  ]);
  console.log("✅ Seeded events");
}

async function seedStaff() {
  await StaffMemberModel.deleteMany({});
  await StaffMemberModel.insertMany([
    {
      name: "Dr. Sunita Sharma",
      nameNe: "डा. सुनिता शर्मा",
      role: "Principal",
      roleNe: "प्रधानाध्यापक",
      department: "administration",
      bio: "Leading Adarsha Rastriya Secondary School with over 20 years of experience in education administration.",
      email: "principal@adarsha.edu.np",
      order: 1,
      published: true,
    },
    {
      name: "Ramesh Karki",
      nameNe: "रमेश कार्की",
      role: "Vice Principal",
      roleNe: "सहायक प्रधानाध्यापक",
      department: "administration",
      order: 2,
      published: true,
    },
    {
      name: "Anita Thapa",
      nameNe: "अनिता थापा",
      role: "Head of Science",
      roleNe: "विज्ञान विभाग प्रमुख",
      department: "science",
      order: 3,
      published: true,
    },
    {
      name: "Bikash Gurung",
      nameNe: "विकास गुरुङ",
      role: "Head of Management",
      roleNe: "व्यवस्थापन विभाग प्रमुख",
      department: "management",
      order: 4,
      published: true,
    },
    {
      name: "Sarita Adhikari",
      nameNe: "सरिता अधिकारी",
      role: "Head of Humanities",
      roleNe: "मानविकी विभाग प्रमुख",
      department: "humanities",
      order: 5,
      published: true,
    },
    {
      name: "Prakash Yadav",
      nameNe: "प्रकाश यादव",
      role: "English Teacher",
      roleNe: "अंग्रेजी शिक्षक",
      department: "languages",
      order: 6,
      published: true,
    },
  ]);
  console.log("✅ Seeded staff");
}

async function seedGallery() {
  await GalleryItemModel.deleteMany({});
  await GalleryItemModel.insertMany([
    { title: "School Campus", caption: "Our main academic building", imageUrl: "/placeholder/campus.jpg", album: "campus", published: true },
    { title: "Science Laboratory", caption: "Well-equipped labs for practical learning", imageUrl: "/placeholder/lab.jpg", album: "academics", published: true },
    { title: "Annual Sports Day", caption: "Students competing on the track", imageUrl: "/placeholder/sports.jpg", album: "sports", published: true },
    { title: "Cultural Program", caption: "Traditional dance performance", imageUrl: "/placeholder/cultural.jpg", album: "cultural", published: true },
    { title: "Library", caption: "A quiet space for reading and research", imageUrl: "/placeholder/library.jpg", album: "campus", published: true },
    { title: "Classroom Session", caption: "Interactive learning in progress", imageUrl: "/placeholder/classroom.jpg", album: "academics", published: true },
  ]);
  console.log("✅ Seeded gallery");
}

async function seedPages() {
  const pages: Array<Record<string, unknown>> = [
    {
      slug: "about",
      title: "About Our School",
      titleNe: "हाम्रो विद्यालयको बारेमा",
      body: "Established in the vibrant community of Lalgadh, Mithila Municipality, Adarsha Rastriya Secondary School has grown to become a cornerstone of learning, adapting to modern educational needs while preserving its core traditional values.",
      bodyNe:
        "मिथिला नगरपालिकाको जीवन्त समुदाय लालगढमा स्थापित, आदर्श राष्ट्रिय माध्यमिक विद्यालय आफ्नो मूल परम्परागत मूल्यमान्यता जोगाउँदै आधुनिक शैक्षिक आवश्यकताअनुरूप ढालिँदै आजको अवस्थामा आइपुगेको छ।",
      content: {
        established: "2029 BS",
        mission:
          "To provide comprehensive, inclusive, and quality education that empowers students to achieve academic excellence and personal growth.",
        vision:
          "To be recognized as a premier educational institution in the region, fostering critical thinkers, responsible citizens, and lifelong learners.",
      },
      published: true,
    },
    {
      slug: "home-mission",
      title: "Our Mission",
      titleNe: "हाम्रो लक्ष्य",
      body: "Adarsha Rastriya Secondary School is committed to providing a holistic education that empowers students with knowledge, character, and practical skills. We blend our rich cultural heritage with modern pedagogical approaches to prepare our students for global challenges while remaining deeply rooted in our community values.",
      published: true,
    },
  ];
  // Donation page content (editable by admin; visibility toggled in Settings).
  pages.push({
    slug: "donation",
    title: "Support Our School",
    titleNe: "हाम्रो विद्यालयलाई सहयोग गर्नुहोस्",
    body:
      "<p>Your generous contribution helps us provide scholarships, improve facilities, and enrich learning for every student. Every donation, big or small, makes a difference.</p>",
    bodyNe:
      "<p>तपाईंको उदार सहयोगले छात्रवृत्ति प्रदान गर्न, सुविधा सुधार्न र प्रत्येक विद्यार्थीको सिकाइ समृद्ध बनाउन मद्दत गर्छ। सानो वा ठूलो, हरेक दानले फरक पार्छ।</p>",
    content: {
      bankName: "Nepal Bank Ltd., Lalgadh Branch",
      accountName: "Adarsha Rastriya Secondary School",
      accountNumber: "0123456789012",
      esewa: "9800000000",
      khalti: "9800000000",
    },
    published: true,
  });

  for (const p of pages) {
    await PageModel.findOneAndUpdate({ slug: String(p.slug) }, p as Record<string, unknown>, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });
  }
  console.log("✅ Seeded pages");
}

async function seedCommittee() {
  await CommitteeMemberModel.deleteMany({});
  await CommitteeMemberModel.insertMany([
    { name: "Hari Prasad Sharma", nameNe: "हरि प्रसाद शर्मा", role: "Chairperson", roleNe: "अध्यक्ष", message: "Committed to the growth of our school and community.", order: 1, published: true },
    { name: "Gita Devi Yadav", nameNe: "गीता देवी यादव", role: "Vice Chairperson", roleNe: "उपाध्यक्ष", order: 2, published: true },
    { name: "Mohan Bahadur Thapa", nameNe: "मोहन बहादुर थापा", role: "Secretary", roleNe: "सचिव", order: 3, published: true },
    { name: "Sita Kumari Karki", nameNe: "सीता कुमारी कार्की", role: "Treasurer", roleNe: "कोषाध्यक्ष", order: 4, published: true },
    { name: "Ram Chandra Mishra", nameNe: "राम चन्द्र मिश्र", role: "Member", roleNe: "सदस्य", order: 5, published: true },
    { name: "Kamala Adhikari", nameNe: "कमला अधिकारी", role: "Member", roleNe: "सदस्य", order: 6, published: true },
  ]);
  console.log("✅ Seeded committee");
}

async function seedPrograms() {
  await ProgramModel.deleteMany({});
  await ProgramModel.insertMany([
    {
      name: "Science", nameNe: "विज्ञान (कक्षा ११-१२)", category: "science", accent: "primary", order: 1,
      description: "A rigorous program designed for students aiming for careers in medicine, engineering, technology, and pure sciences. Emphasizing practical laboratory work and theoretical understanding.",
      coreSubjects: ["Physics", "Chemistry", "Biology", "Mathematics", "English", "Nepali"],
      published: true,
    },
    {
      name: "Management", nameNe: "व्यवस्थापन", category: "management", accent: "secondary", order: 2,
      description: "Preparing future business leaders and entrepreneurs with practical knowledge in finance, marketing, and business operations.",
      keyAreas: ["Accountancy", "Economics", "Business Studies", "Computer Science / Hotel Management"],
      published: true,
    },
    {
      name: "Humanities", nameNe: "मानविकी", category: "humanities", accent: "secondary", order: 3,
      description: "Fostering critical thinking, social awareness, and communication skills for careers in civil service, media, and social sciences.",
      keyAreas: ["Sociology", "Mass Communication", "Major English / Nepali", "Rural Development"],
      published: true,
    },
    {
      name: "General Secondary Education", nameNe: "माध्यमिक शिक्षा (कक्षा ९-१०)", category: "general", accent: "primary", order: 4,
      description: "Our foundational program aligns with the national curriculum, providing a robust base in compulsory and optional subjects, preparing students for the SEE (Secondary Education Examination).",
      coreSubjects: ["Compulsory Math", "Science", "Social Studies", "Opt. Math/Economics"],
      published: true,
    },
  ]);
  console.log("✅ Seeded programs");
}

async function seedSettings() {
  await SettingsModel.findOneAndUpdate(
    { key: "main" },
    {
      key: "main",
      stats: [
        { value: 1200, suffix: "+", label: "Students", labelNe: "विद्यार्थी" },
        { value: 60, suffix: "+", label: "Teachers", labelNe: "शिक्षक" },
        { value: 50, suffix: "+", label: "Years of Legacy", labelNe: "वर्षको विरासत" },
        { value: 95, suffix: "%", label: "SEE Pass Rate", labelNe: "एसईई उत्तीर्ण दर" },
      ],
      contact: {
        address: "Lalgadh, Mithila Municipality, Dhanusha, Nepal",
        addressNe: "लालगढ, मिथिला नगरपालिका, धनुषा, नेपाल",
        phone: "+977-41-000000",
        email: "info@adarsha.edu.np",
        hours: "Sun – Fri, 10:00 AM – 4:00 PM",
        hoursNe: "आइत – शुक्र, बिहान १०:०० – दिउँसो ४:००",
        mapUrl: "",
      },
      facilities: [
        { icon: "library", title: "Library", titleNe: "पुस्तकालय", desc: "A vast collection of academic and reference materials to support student research and reading habits.", descNe: "विद्यार्थीको अनुसन्धान र पठन बानीलाई सघाउने शैक्षिक तथा सन्दर्भ सामग्रीको विशाल संग्रह।" },
        { icon: "lab", title: "Science Lab", titleNe: "विज्ञान प्रयोगशाला", desc: "Well-equipped laboratories providing hands-on experience in practical scientific concepts.", descNe: "व्यावहारिक वैज्ञानिक अवधारणामा प्रत्यक्ष अनुभव प्रदान गर्ने सुसज्जित प्रयोगशालाहरू।" },
        { icon: "playground", title: "Playground", titleNe: "खेल मैदान", desc: "Spacious sports grounds for physical education, outdoor games, and extracurricular activities.", descNe: "शारीरिक शिक्षा, बाह्य खेल र अतिरिक्त क्रियाकलापका लागि फराकिलो खेल मैदान।" },
      ],
      socials: {
        facebook: "https://facebook.com",
        instagram: "https://instagram.com",
        youtube: "https://youtube.com",
        twitter: "",
        tiktok: "",
        linkedin: "",
        whatsapp: "",
      },
      donationEnabled: true,
      branding: {
        logoUrl: "", logoHeight: 64, showLogoRing: false,
        schoolName: "", schoolNameNe: "", tagline: "", taglineNe: "",
      },
      announcement: {
        enabled: true,
        text: "Admissions open for the 2081/82 session — apply today!",
        textNe: "शैक्षिक सत्र २०८१/८२ का लागि भर्ना खुला — आजै आवेदन दिनुहोस्!",
        link: "/admissions",
        linkLabel: "Apply Now",
        linkLabelNe: "अहिले आवेदन दिनुहोस्",
      },
      partners: [
        { name: "Ministry of Education", logoUrl: "", url: "" },
        { name: "NEB", logoUrl: "", url: "" },
        { name: "CTEVT", logoUrl: "", url: "" },
        { name: "Tribhuvan University", logoUrl: "", url: "" },
        { name: "Mithila Municipality", logoUrl: "", url: "" },
      ],
      navigation: [
        { label: "Home", labelNe: "गृह", url: "/", external: false, children: [] },
        { label: "About", labelNe: "हाम्रो बारेमा", url: "", external: false, children: [
          { label: "About", labelNe: "हाम्रो बारेमा", url: "/about", external: false },
          { label: "Committee", labelNe: "समिति", url: "/committee", external: false },
          { label: "Faculty", labelNe: "शिक्षक", url: "/faculty", external: false },
        ] },
        { label: "Academic", labelNe: "शैक्षिक", url: "", external: false, children: [
          { label: "Academic", labelNe: "शैक्षिक", url: "/academic", external: false },
          { label: "Syllabus", labelNe: "पाठ्यक्रम", url: "/syllabus", external: false },
        ] },
        { label: "Admissions", labelNe: "भर्ना", url: "/admissions", external: false, children: [] },
        { label: "Media", labelNe: "मिडिया", url: "", external: false, children: [
          { label: "Gallery", labelNe: "ग्यालरी", url: "/gallery", external: false },
          { label: "Notice Board", labelNe: "सूचना पाटी", url: "/notices", external: false },
          { label: "News & Events", labelNe: "खबर र कार्यक्रम", url: "/events", external: false },
        ] },
        { label: "Contact", labelNe: "सम्पर्क", url: "/contact", external: false, children: [] },
      ],
      banners: [
        {
          imageUrl: "",
          title: "Welcome to Adarsha Rastriya Secondary School",
          titleNe: "आदर्श राष्ट्रिय माध्यमिक विद्यालयमा स्वागत छ",
          subtitle:
            "Nurturing excellence, fostering tradition, and building the leaders of tomorrow.",
          subtitleNe: "उत्कृष्टता पोषण गर्दै, परम्परा जोगाउँदै, भोलिका नेतृत्व निर्माण गर्दै।",
          ctaLabel: "Explore Admissions",
          ctaLabelNe: "भर्ना हेर्नुहोस्",
          ctaLink: "/admissions",
          order: 1,
        },
        {
          imageUrl: "",
          title: "A Legacy of Excellence Since 2029 BS",
          titleNe: "२०२९ सालदेखि उत्कृष्टताको विरासत",
          subtitle: "Modern learning rooted in strong community values.",
          subtitleNe: "बलियो सामुदायिक मूल्यमा आधारित आधुनिक शिक्षा।",
          ctaLabel: "About Our School",
          ctaLabelNe: "हाम्रो बारेमा",
          ctaLink: "/about",
          order: 2,
        },
      ],
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log("✅ Seeded settings");
}

async function run() {
  await connectDB();
  console.log(`Connected to ${env.MONGO_URL}`);
  await seedAdmin();
  await seedNotices();
  await seedEvents();
  await seedStaff();
  await seedGallery();
  await seedPages();
  await seedCommittee();
  await seedPrograms();
  await seedSyllabi();
  await seedSettings();
  await disconnectDB();
  console.log("🌱 Seeding complete.");
  await mongoose.disconnect().catch(() => undefined);
  process.exit(0);
}

run().catch(async (err) => {
  console.error("❌ Seeding failed:", err);
  await mongoose.disconnect().catch(() => undefined);
  process.exit(1);
});
