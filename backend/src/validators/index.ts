import { z } from "zod";

/** Shared building blocks */
const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

export const idParamSchema = z.object({
  params: z.object({ id: objectId }),
});

/** ---------------- Auth ---------------- */
export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().toLowerCase().pipe(z.string().email()),
    password: z.string().min(1, "Password is required"),
    twoFactorCode: z.string().min(6).max(32).optional(),
  }),
});
export const twoFactorCodeSchema = z.object({ body: z.object({ code: z.string().regex(/^\d{6}$/) }) });
export const disableTwoFactorSchema = z.object({ body: z.object({ password: z.string().min(1) }) });
export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
  }),
});

/** ---------------- Notices ---------------- */
export const createNoticeSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(200),
    titleNe: z.string().max(200).optional().default(""),
    body: z.string().min(3),
    bodyNe: z.string().optional().default(""),
    category: z.enum(["academic", "administrative", "general"]).default("general"),
    priority: z.enum(["normal", "important", "urgent"]).default("normal"),
    attachmentUrl: z.string().optional().default(""),
    imageUrl: z.string().optional().default(""),
    images: z.array(z.string()).optional().default([]),
    published: z.coerce.boolean().default(true),
    publishedAt: z.coerce.date().optional(),
  }),
});
export const updateNoticeSchema = z.object({
  params: z.object({ id: objectId }),
  body: createNoticeSchema.shape.body.partial(),
});
export const listNoticeSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    category: z.enum(["academic", "administrative", "general"]).optional(),
    search: z.string().optional(),
    published: z.enum(["true", "false"]).optional(),
  }),
});

/** ---------------- Events ---------------- */
export const createEventSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(200),
    titleNe: z.string().max(200).optional().default(""),
    description: z.string().min(3),
    descriptionNe: z.string().optional().default(""),
    category: z
      .enum(["academic", "sports", "cultural", "notice", "general"])
      .default("general"),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    location: z.string().optional().default(""),
    imageUrl: z.string().optional().default(""),
    images: z.array(z.string()).optional().default([]),
    featured: z.coerce.boolean().default(false),
    published: z.coerce.boolean().default(true),
  }),
});
export const updateEventSchema = z.object({
  params: z.object({ id: objectId }),
  body: createEventSchema.shape.body.partial(),
});
export const listEventSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    category: z
      .enum(["academic", "sports", "cultural", "notice", "general"])
      .optional(),
    featured: z.enum(["true", "false"]).optional(),
    upcoming: z.enum(["true", "false"]).optional(),
  }),
});

/** ---------------- Gallery ---------------- */
export const createGallerySchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200),
    caption: z.string().optional().default(""),
    imageUrl: z.string().min(1, "imageUrl is required"),
    album: z
      .enum(["campus", "events", "sports", "academics", "cultural", "general"])
      .default("general"),
    published: z.coerce.boolean().default(true),
  }),
});
export const updateGallerySchema = z.object({
  params: z.object({ id: objectId }),
  body: createGallerySchema.shape.body.partial(),
});

/** ---------------- Staff ---------------- */
export const createStaffSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(120),
    nameNe: z.string().optional().default(""),
    role: z.string().min(2).max(120),
    roleNe: z.string().optional().default(""),
    department: z
      .enum([
        "administration",
        "science",
        "management",
        "humanities",
        "languages",
        "general",
      ])
      .default("general"),
    bio: z.string().optional().default(""),
    bioNe: z.string().optional().default(""),
    email: z.string().email().optional().or(z.literal("")).default(""),
    phone: z.string().optional().default(""),
    photoUrl: z.string().optional().default(""),
    order: z.coerce.number().int().optional().default(0),
    published: z.coerce.boolean().default(true),
  }),
});
export const updateStaffSchema = z.object({
  params: z.object({ id: objectId }),
  body: createStaffSchema.shape.body.partial(),
});

/** ---------------- Pages ---------------- */
export const upsertPageSchema = z.object({
  body: z.object({
    slug: z.string().min(1).max(80),
    title: z.string().min(1).max(200),
    titleNe: z.string().optional().default(""),
    body: z.string().optional().default(""),
    bodyNe: z.string().optional().default(""),
    content: z.record(z.string(), z.unknown()).optional().default({}),
    published: z.coerce.boolean().default(true),
  }),
});
export const slugParamSchema = z.object({
  params: z.object({ slug: z.string().min(1).max(80) }),
});

/** ---------------- Submissions (public) ---------------- */
export const contactSubmissionSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(120),
    email: z.string().email(),
    phone: z.string().max(40).optional().default(""),
    subject: z.string().max(200).optional().default(""),
    message: z.string().min(5).max(5000),
  }),
});
export const admissionSubmissionSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(120),
    email: z.string().email(),
    phone: z.string().max(40).optional().default(""),
    studentName: z.string().max(120).optional().default(""),
    gradeApplyingFor: z.string().max(60).optional().default(""),
    message: z.string().min(5).max(5000),
  }),
});
// Donor identity/verification submitted before the donation QRs are shown.
// Sent as multipart/form-data with a `document` file; text fields validated here.
export const donationSubmissionSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(120),
    email: z.string().email(),
    phone: z.string().max(40).optional().default(""),
    message: z.string().max(5000).optional().default(""),
  }),
});
export const listSubmissionSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    type: z.enum(["contact", "admission", "donation"]).optional(),
    status: z.enum(["new", "read", "archived"]).optional(),
  }),
});
export const updateSubmissionSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({
    status: z.enum(["new", "read", "archived"]).optional(),
    reviewStatus: z.enum(["pending", "approved", "rejected"]).optional(),
    reviewNote: z.string().trim().max(1000).optional(),
  }).refine((body) => body.status || body.reviewStatus || body.reviewNote !== undefined, "No update provided"),
});

/** ---------------- Programs ---------------- */
export const createProgramSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(160),
    nameNe: z.string().optional().default(""),
    category: z.enum(["science", "management", "humanities", "general"]).default("general"),
    description: z.string().optional().default(""),
    descriptionNe: z.string().optional().default(""),
    imageUrl: z.string().optional().default(""),
    coreSubjects: z.array(z.string()).optional().default([]),
    keyAreas: z.array(z.string()).optional().default([]),
    accent: z.enum(["primary", "secondary"]).default("primary"),
    order: z.coerce.number().int().optional().default(0),
    published: z.coerce.boolean().default(true),
  }),
});
export const updateProgramSchema = z.object({
  params: z.object({ id: objectId }),
  body: createProgramSchema.shape.body.partial(),
});

const syllabusInput = z.object({
  title: z.string().trim().min(1), titleNe: z.string().optional().default(""),
  grade: z.string().trim().min(1), subject: z.string().trim().min(1),
  stream: z.enum(["science", "management", "humanities", "general"]).optional().default("general"),
  description: z.string().optional().default(""), descriptionNe: z.string().optional().default(""),
  fileUrl: z.string().optional().default(""), coverImageUrl: z.string().optional().default(""),
  academicYear: z.string().optional().default(""), order: z.coerce.number().int().optional().default(0),
  featured: z.coerce.boolean().optional().default(false), published: z.coerce.boolean().optional().default(true),
});
export const createSyllabusSchema = z.object({ body: syllabusInput });
export const updateSyllabusSchema = z.object({ body: syllabusInput.partial(), params: z.object({ id: objectId }) });

/** ---------------- Committee ---------------- */
export const createCommitteeSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(120),
    nameNe: z.string().optional().default(""),
    role: z.string().min(2).max(120),
    roleNe: z.string().optional().default(""),
    message: z.string().optional().default(""),
    messageNe: z.string().optional().default(""),
    phone: z.string().optional().default(""),
    email: z.string().email().optional().or(z.literal("")).default(""),
    photoUrl: z.string().optional().default(""),
    order: z.coerce.number().int().optional().default(0),
    published: z.coerce.boolean().default(true),
  }),
});
export const updateCommitteeSchema = z.object({
  params: z.object({ id: objectId }),
  body: createCommitteeSchema.shape.body.partial(),
});

/** ---------------- Settings ---------------- */
const bannerInput = z.object({
  imageUrl: z.string().optional().default(""),
  videoUrl: z.string().optional().default(""),
  title: z.string().optional().default(""),
  titleNe: z.string().optional().default(""),
  subtitle: z.string().optional().default(""),
  subtitleNe: z.string().optional().default(""),
  ctaLabel: z.string().optional().default(""),
  ctaLabelNe: z.string().optional().default(""),
  ctaLink: z.string().optional().default(""),
  order: z.coerce.number().int().optional().default(0),
});
export const updateSettingsSchema = z.object({
  body: z.object({
    socials: z
      .object({
        facebook: z.string().optional(),
        instagram: z.string().optional(),
        youtube: z.string().optional(),
        twitter: z.string().optional(),
        tiktok: z.string().optional(),
        linkedin: z.string().optional(),
        whatsapp: z.string().optional(),
      })
      .partial()
      .optional(),
    donationEnabled: z.coerce.boolean().optional(),
    heroOpacity: z.coerce.number().min(0).max(1).optional(),
    branding: z.object({
      logoUrl: z.string().optional(),
      logoHeight: z.coerce.number().min(40).max(96).optional(),
      showLogoRing: z.coerce.boolean().optional(),
      schoolName: z.string().optional(),
      schoolNameNe: z.string().optional(),
      tagline: z.string().optional(),
      taglineNe: z.string().optional(),
    }).partial().optional(),
    principal: z
      .object({
        name: z.string().optional(),
        nameNe: z.string().optional(),
        role: z.string().optional(),
        roleNe: z.string().optional(),
        photoUrl: z.string().optional(),
        message: z.string().optional(),
        messageNe: z.string().optional(),
      })
      .partial()
      .optional(),
    banners: z.array(bannerInput).optional(),
    interstitial: z
      .object({
        enabled: z.coerce.boolean().optional(),
        imageUrl: z.string().optional(),
        videoUrl: z.string().optional(),
        title: z.string().optional(),
        titleNe: z.string().optional(),
        body: z.string().optional(),
        bodyNe: z.string().optional(),
        ctaLabel: z.string().optional(),
        ctaLabelNe: z.string().optional(),
        ctaLink: z.string().optional(),
        autoAdvance: z.coerce.boolean().optional(),
        slides: z
          .array(
            z.object({
              imageUrl: z.string().optional().default(""),
              videoUrl: z.string().optional().default(""),
              title: z.string().optional().default(""),
              titleNe: z.string().optional().default(""),
              body: z.string().optional().default(""),
              bodyNe: z.string().optional().default(""),
              ctaLabel: z.string().optional().default(""),
              ctaLabelNe: z.string().optional().default(""),
              ctaLink: z.string().optional().default(""),
            })
          )
          .optional(),
        frequency: z.enum(["session", "daily", "always"]).optional(),
      })
      .partial()
      .optional(),
    announcement: z
      .object({
        enabled: z.coerce.boolean().optional(),
        text: z.string().optional(),
        textNe: z.string().optional(),
        link: z.string().optional(),
        linkLabel: z.string().optional(),
        linkLabelNe: z.string().optional(),
      })
      .partial()
      .optional(),
    partners: z
      .array(
        z.object({
          name: z.string().optional().default(""),
          logoUrl: z.string().optional().default(""),
          url: z.string().optional().default(""),
        })
      )
      .optional(),
    navigation: z.array(z.object({
      label: z.string().optional().default(""), labelNe: z.string().optional().default(""),
      url: z.string().optional().default(""), external: z.coerce.boolean().optional().default(false),
      children: z.array(z.object({
        label: z.string().optional().default(""), labelNe: z.string().optional().default(""),
        url: z.string().optional().default(""), external: z.coerce.boolean().optional().default(false),
      })).optional().default([]),
    })).optional(),
    stats: z
      .array(
        z.object({
          value: z.coerce.number().optional().default(0),
          suffix: z.string().optional().default(""),
          label: z.string().optional().default(""),
          labelNe: z.string().optional().default(""),
        })
      )
      .optional(),
    contact: z
      .object({
        address: z.string().optional(),
        addressNe: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        hours: z.string().optional(),
        hoursNe: z.string().optional(),
        mapUrl: z.string().optional(),
      })
      .partial()
      .optional(),
    facilities: z
      .array(
        z.object({
          icon: z.string().optional().default("library"),
          title: z.string().optional().default(""),
          titleNe: z.string().optional().default(""),
          desc: z.string().optional().default(""),
          descNe: z.string().optional().default(""),
        })
      )
      .optional(),
  }),
});
