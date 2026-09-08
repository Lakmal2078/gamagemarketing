import React, { useState, useEffect, useRef, FormEvent, ReactNode } from 'react';
import ReactGA from 'react-ga4';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { GoogleDriveBackupModal } from './components/GoogleDriveBackupModal';

// Interfaces
interface ServicePhase {
  name: { si: string; en: string };
  time: { si: string; en: string };
  progress: number;
}

interface ServiceDelivery {
  durationText: { si: string; en: string };
  badge: { si: string; en: string };
  velocity: number;
  icon: string;
  phases: ServicePhase[];
}

interface ServiceDetail {
  id: string;
  icon: string;
  title: { si: string; en: string };
  tagline: { si: string; en: string };
  deliveryTime: ServiceDelivery;
  what: { si: string[]; en: string[] };
  opportunities: { si: string[]; en: string[] };
  assumptions: { si: string[]; en: string[] };
}

interface Review {
  stars: number;
  tag: { si: string; en: string };
  body: { si: string; en: string };
  platform: 'google' | 'facebook' | 'instagram';
  initials: string;
  avatarBg: string;
  reviewerName: string;
  reviewerMeta: { si: string; en: string };
}

interface FaqItem {
  question: { si: string; en: string };
  answer: { si: string; en: string };
}

// Translations lexicon map
const T = {
  si: {
    logo: "ගමගේ Marketing",
    navServices: "සේවා",
    navPortfolio: "Portfolio",
    navPricing: "Pricing",
    navReviews: "Reviews",
    navContact: "සම්බන්ධ වන්න",
    getStarted: "Get Started",
    heroTitleLine1: "ඔබේ Brand එක",
    heroTitleGlow: "Digital Powerhouse",
    heroTitleLine2: "එකක් කරන්න",
    heroDesc: "AI-driven marketing strategies, premium branding solutions, high-converting campaigns සහ modern digital experiences එක්ක ඔබේ business එක next level එකට ගෙන යන්න.",
    heroStartBtn: "ව්‍යාපෘතිය ආරම්භ කරන්න",
    heroViewBtn: "Portfolio බලන්න",
    statsClients: "සතුටු ග්‍රාහකයින්",
    statsRoi: "ROI වර්ධනය",
    statsSupport: "පැයේ සහාය",
    statsProjects: "සාර්ථක ව්‍යාපෘති",
    servicesTitle: "Premium Services",
    servicesSubtitle: "Modern businesses සඳහා powerful digital solutions.",
    learnMore: "Learn More",
    projectsTitle: "Featured Projects",
    projectsSubtitle: "Some premium experiences we created for brands.",
    projectsLuxuryFashion: "Luxury Fashion Brand",
    projectsFintech: "Fintech Startup",
    projectsCreativeAgency: "Creative Agency",
    projectsMarketingCampaign: "Marketing Campaign",
    projectsUiUxDesign: "UI/UX Design",
    projectsBrandIdentity: "Brand Identity",
    pricingTitle: "Pricing Plans",
    pricingSubtitle: "Choose the perfect package for your business.",
    priceStarter: "Starter",
    priceBusiness: "Business",
    priceEnterprise: "Enterprise",
    priceChoosePlan: "Choose Plan",
    priceFeatured: "FEATURED",
    estimatorTitle: "ව්‍යාපෘති පිරිවැය ඇස්තමේන්තුව (Calculator)",
    estimatorSubtitle: "ඔබගේ අවශ්‍යතා මත පදනම්ව දළ මිල ගණනයක් ලබා ගන්න.",
    estTotal: "ඇස්තමේන්තුගත මුළු පිරිවැය:",
    estNote: "මෙය පැහැදිලි කිරීම සඳහා වූ දළ අගයක් පමණි. නිශ්චිත මිල ගණන් ව්‍යාපෘතිය අනුව වෙනස් විය හැක.",
    faqTitle: "නිතර අසන ප්‍රශ්න",
    faqSubtitle: "අපගේ සේවා සැපයීම, Deliverables සහ සහයෝගීතා ක්‍රියාවලිය පිළිබඳ පොදු ප්‍රශ්නවලට පිළිතුරු (FAQ).",
    reviewsTitle: "Client Reviews",
    reviewsSubtitle: "Real results, real people. Here's what our clients say after working with us.",
    reviewsOutOf: "out of 5 — 312 reviews",
    reviewsPostedOn: "Posted on",
    reviewsVerifiedClient: "Verified Client",
    ctaTitle: "Ready To Scale Your Business?",
    ctaDesc: "Transform your brand into a premium digital experience with cutting-edge marketing and modern design.",
    ctaStartBtn: "Start Your Journey",
    contactTitle: "අප සමඟ සම්බන්ධ වන්න",
    contactSubtitle: "ඔබේ ව්‍යාපාරයේ ඊළඟ පියවර ගැන කතා කරමු",
    contactNamePlaceholder: "ඔබේ නම",
    contactEmailPlaceholder: "ඊමේල් ලිපිනය",
    contactPhonePlaceholder: "දුරකථන අංකය",
    contactDescPlaceholder: "ඔබේ අවශ්‍යතාවය විස්තර කරන්න",
    contactServiceInterest: "ඔබට අවශ්‍ය සේවාව කුමක්ද?",
    contactBudget: "ඇස්තමේන්තුගත අයවැය",
    contactCompanySize: "ව්‍යාපාරයේ ප්‍රමාණය",
    contactSelectOption: "-- තෝරන්න --",
    contactSending: "යවමින්...",
    contactSubmit: "සම්බන්ධ වන්න",
    contactSuccess: "✓ සාර්ථකව ලැබුණි!",
    contactError: "Error — නැවත උත්සාහ කරන්න",
    footerReserved: "ගමගේ Marketing. සියලුම හිමිකම් ඇවිරිණි.",
    modalEstimatedDelivery: "ඇස්තමේන්තුගත සම්පූර්ණ කිරීමේ කාලය",
    modalAvgReadiness: "කාර්යක්ෂමතාව",
    modalMilestonePhases: "ප්‍රධාන ක්‍රියාත්මක කිරීමේ පියවර",
    modalEstimatedTimeline: "සම්පූර්ණ කිරීමේ කාලසීමාව",
    modalWhat: "What's Included",
    modalOpp: "Opportunities",
    modalAssumptions: "Assumptions & How We Work",
    modalChat: "Chat on WhatsApp",
    themeLight: "පැහැදිලි තේමාව",
    themeDark: "අඳුරු තේමාව",
    scrollToTop: "මුදුනටම යන්න",
    driveBackup: "Google Drive උපස්ථය",
    driveBackupBtn: "Drive Backup",
  },
  en: {
    logo: "Gamage Marketing",
    navServices: "Services",
    navPortfolio: "Portfolio",
    navPricing: "Pricing",
    navReviews: "Reviews",
    navContact: "Contact Us",
    getStarted: "Get Started",
    heroTitleLine1: "Make Your Brand",
    heroTitleGlow: "A Digital Powerhouse",
    heroTitleLine2: "",
    heroDesc: "Take your business to the next level with AI-driven marketing strategies, premium branding solutions, high-converting campaigns, and modern digital experiences.",
    heroStartBtn: "Start Project",
    heroViewBtn: "View Portfolio",
    statsClients: "Happy Clients",
    statsRoi: "ROI Growth",
    statsSupport: "24/7 Support",
    statsProjects: "Successful Projects",
    servicesTitle: "Premium Services",
    servicesSubtitle: "Powerful digital solutions for modern businesses.",
    learnMore: "Learn More",
    projectsTitle: "Featured Projects",
    projectsSubtitle: "Some premium experiences we created for brands.",
    projectsLuxuryFashion: "Luxury Fashion Brand",
    projectsFintech: "Fintech Startup",
    projectsCreativeAgency: "Creative Agency",
    projectsMarketingCampaign: "Marketing Campaign",
    projectsUiUxDesign: "UI/UX Design",
    projectsBrandIdentity: "Brand Identity",
    pricingTitle: "Pricing Plans",
    pricingSubtitle: "Choose the perfect package for your business.",
    priceStarter: "Starter",
    priceBusiness: "Business",
    priceEnterprise: "Enterprise",
    priceChoosePlan: "Choose Plan",
    priceFeatured: "FEATURED",
    estimatorTitle: "Project Cost Estimator",
    estimatorSubtitle: "Get a rough estimate based on your custom requirements.",
    estTotal: "Estimated Total Cost:",
    estNote: "This is a rough estimate for reference purposes. Final pricing may vary based on actual project scope.",
    faqTitle: "Frequently Asked Questions",
    faqSubtitle: "Answers to common questions about our service delivery, deliverables, and collaboration process.",
    reviewsTitle: "Client Reviews",
    reviewsSubtitle: "Real results, real people. Here's what our clients say after working with us.",
    reviewsOutOf: "out of 5 — 312 reviews",
    reviewsPostedOn: "Posted on",
    reviewsVerifiedClient: "Verified Client",
    ctaTitle: "Ready To Scale Your Business?",
    ctaDesc: "Transform your brand into a premium digital experience with cutting-edge marketing and modern design.",
    ctaStartBtn: "Start Your Journey",
    contactTitle: "Contact Us",
    contactSubtitle: "Let's talk about the next steps for your business",
    contactNamePlaceholder: "Your Name",
    contactEmailPlaceholder: "Email Address",
    contactPhonePlaceholder: "Phone Number",
    contactDescPlaceholder: "Describe your requirements",
    contactServiceInterest: "Interested Service",
    contactBudget: "Estimated Budget",
    contactCompanySize: "Company Size",
    contactSelectOption: "-- Select Option --",
    contactSending: "Sending...",
    contactSubmit: "Submit",
    contactSuccess: "✓ Successfully Received!",
    contactError: "Error — Try Again",
    footerReserved: "Gamage Marketing. All rights reserved.",
    modalEstimatedDelivery: "Estimated Completion Time",
    modalAvgReadiness: "Delivery Velocity",
    modalMilestonePhases: "Key Execution Milestones",
    modalEstimatedTimeline: "Turnaround Timeline",
    modalWhat: "What's Included",
    modalOpp: "Opportunities",
    modalAssumptions: "Assumptions & How We Work",
    modalChat: "Chat on WhatsApp",
    themeLight: "Light Theme",
    themeDark: "Dark Theme",
    scrollToTop: "Scroll to Top",
    driveBackup: "Google Drive Backup",
    driveBackupBtn: "Drive Backup",
  }
};

// Services Data matching the user's spec exactly
const SERVICES_DATA: Record<string, ServiceDetail> = {
  social: {
    id: 'social',
    icon: 'fas fa-bullhorn',
    title: { si: 'Social Media Marketing', en: 'Social Media Marketing' },
    tagline: {
      si: 'අපි Facebook, TikTok, සහ Instagram හරහා පාරිභෝගිකයින් ආකර්ෂණය කර ගන්නා ප්‍රචාරණ ව්‍යාපාර සැලසුම් කරමු — සෑම රුපියලකම ප්‍රතිලාභය නිවැරදිව වාර්තා කරමින්.',
      en: 'We craft platform-native campaigns across Facebook, TikTok, and Instagram that turn scrollers into buyers — with every rupee tracked back to real business outcomes.'
    },
    deliveryTime: {
      durationText: { si: 'දින 3 - 5', en: '3 – 5 Days' },
      badge: { si: 'වේගවත් දියත් කිරීම', en: 'Fast Launch' },
      velocity: 92,
      icon: 'fas fa-bolt',
      phases: [
        { name: { si: 'ප්‍රේක්ෂක හා තරඟකාරී පර්යේෂණ', en: 'Audience & Competitor Audit' }, time: { si: 'දින 1', en: 'Day 1' }, progress: 100 },
        { name: { si: 'දැන්වීම් පිටපත් සහ Creative නිර්මාණය', en: 'Ad Copy & Creative Production' }, time: { si: 'දින 2-3', en: 'Days 2-3' }, progress: 85 },
        { name: { si: 'Campaign Launch & Analytics Setup', en: 'Campaign Launch & Analytics Setup' }, time: { si: 'දින 4-5', en: 'Days 4-5' }, progress: 95 }
      ]
    },
    what: {
      si: [
        'ඔබේ ප්‍රේක්ෂකයින්ට සහ අයවැයට ගැළපෙන පූර්ණ ප්‍රචාරණ උපාය මාර්ගය.',
        'නිර්මාණශීලී අන්තර්ගතයන් නිෂ්පාදනය: දැන්වීම් පිටපත්, නිශ්චල රූප, reels සහ story දැන්වීම්.',
        'ප්‍රජා කළමනාකරණය, අදහස් (comments) මනස්ථකරණය සහ ප්‍රේක්ෂක සම්බන්ධතාවය.',
        'ප්‍රතිලාභ (ROI) විශ්ලේෂණය ඇතුළත් සතිපතා ප්‍රගති වාර්තා.',
        'උනන්දුවක් දක්වන පාරිභෝගිකයින් සැබෑ ගැනුම්කරුවන් බවට පත් කරන Retargeting ක්‍රියාවලිය.'
      ],
      en: [
        'Full-funnel campaign strategy tailored to your audience and budget.',
        'Creative content production: copy, static graphics, reels, and story ads.',
        'Community management, comment moderation, and audience engagement.',
        'Weekly performance reports with clear ROI breakdowns.',
        'Retargeting sequences to convert warm audiences into paying customers.'
      ]
    },
    opportunities: {
      si: [
        'ශ්‍රී ලංකාවේ වේගයෙන්ම වර්ධනය වන TikTok සහ Facebook වාණිජ්‍ය වෙළඳපොලට පිවිසීම.',
        'ඉංග්‍රීසි දැන්වීම්වලට වඩා වැඩි ප්‍රතිචාර ලැබෙන සිංහල භාෂාවෙන් සැකසූ දේශීය දැන්වීම් ක්‍රියාත්මක කිරීම.',
        'සුවිශේෂී කාලවලදී (අවුරුදු, නත්තල්) ඉහළ ප්‍රතිලාභ ලබා දෙන විශේෂ ප්‍රචාරණ ව්‍යාපාර පැවැත්වීම.',
        'දිගුකාලීන ප්‍රචාරණ පිරිවැය අවම කර ගැනීමට කාබනික (Organic) අනුගාමික පිරිසක් გොඩනැගීම.'
      ],
      en: [
        'Tap into Sri Lanka\'s rapidly growing TikTok and Facebook commerce audience.',
        'Run localised, Sinhala-language creatives that outperform generic English ads.',
        'Use seasonal campaigns (Avurudu, Christmas, Year-End) for high-return bursts.',
        'Build organic followings in parallel to reduce long-term ad spend.'
      ]
    },
    assumptions: {
      si: [
        'සේවාලාභියා විසින් නිෂ්පාදන පින්තූර, මිල ගණන් සහ සන්නාම මාර්ගෝපදේශ ආරම්භයේදීම ලබා දීම.',
        'සේවාලාභියා විසින් අවම මාසික දැන්වීම් අයවැය (Ad budget) තීරණය කරනු ලැබේ; අපගේ සේවා ගාස්තුව ඊට ඇතුළත් නොවේ.',
        'ප්‍රතිඵල මාස 3-6ක් ඇතුළත ක්‍රමයෙන් වර්ධනය වේ — කෙටි කාලීන බලාපොරොත්තු ඒ අනුව සකස් කෙරේ.',
        'වේගවත් ප්‍රචාරණ කටයුතු පවත්වා ගැනීම සඳහා සේවාලාභියා දැන්වීම් නිර්මාණ පැය 48ක් ඇතුළත අනුමත කළ යුතුය.'
      ],
      en: [
        'Client provides product images, pricing, and brand guidelines at the start.',
        'A minimum monthly ad budget is set by the client; our fee is separate.',
        'Results compound over 3–6 months — short-term expectations are calibrated accordingly.',
        'Client approves ad creatives within 48 hours to maintain campaign velocity.'
      ]
    }
  },
  growth: {
    id: 'growth',
    icon: 'fas fa-chart-line',
    title: { si: 'Growth Strategy', en: 'Growth Strategy' },
    tagline: {
      si: 'ඔබේ ව්‍යාපාරයේ සීමාවන් බිඳ දමමින්, නාලිකා උපාය මාර්ග, ප්‍රචාරණ පද්ධති සහ අඛණ්ඩ ප්‍රශස්තකරණය ඒකාබද්ධ කරමින් සැලසුම් කළ සුවිශේෂී වර්ධන පද්ධතියක්.',
      en: 'A bespoke, data-first marketing system designed to remove the ceiling on your business — combining channel strategy, funnel engineering, and continuous optimisation.'
    },
    deliveryTime: {
      durationText: { si: 'දින 5 - 7', en: '5 – 7 Days' },
      badge: { si: 'උපායමාර්ගික සැලැස්ම', en: 'Strategic Sprint' },
      velocity: 84,
      icon: 'fas fa-chart-line',
      phases: [
        { name: { si: 'Data Audit & Funnel Diagnosing', en: 'Data Audit & Funnel Diagnostics' }, time: { si: 'දින 1-2', en: 'Days 1-2' }, progress: 100 },
        { name: { si: 'Customer Journey & Funnel Optimization', en: 'Customer Journey & Funnel Optimization' }, time: { si: 'දින 3-5', en: 'Days 3-5' }, progress: 80 },
        { name: { si: 'A/B Testing & Scaling Roadmap', en: 'A/B Testing & Scaling Roadmap' }, time: { si: 'දින 6-7', en: 'Days 6-7' }, progress: 90 }
      ]
    },
    what: {
      si: [
        'පූර්ණ අලෙවිකරණ විගණනය: නාලිකා, පණිවිඩකරණය, පරිවර්තන ලක්ෂ්‍ය සහ දුර්වලතා හඳුනා ගැනීම.',
        'දින 30/60/90 සන්ධිස්ථාන සහිත රිසිකරණය කළ වර්ධන සැලැස්ම.',
        'දැනුවත්භාවය → ලීඩ් → විකුණුම් → රඳවා ගැනීම දක්වා විහිදෙන ප්‍රචාරණ පද්ධති සැලසුම.',
        'තරඟකරුවන් සහ වෙළඳපල ස්ථානගත කිරීම් විශ්ලේෂණය.',
        'සජීවී දත්ත මත පදනම්ව මාසික උපාය මාර්ගික සමාලෝචන සහ නිර්දේශ ලබා දීම.'
      ],
      en: [
        'Full marketing audit: channels, messaging, conversion points, and leakage.',
        'Custom growth roadmap with 30/60/90-day milestones.',
        'Funnel design covering awareness → lead → sale → retention.',
        'Competitor benchmarking and market positioning analysis.',
        'Monthly strategy reviews and pivot recommendations based on live data.'
      ]
    },
    opportunities: {
      si: [
        'Email සහ WhatsApp අලෙවිකරණය හරහා ශ්‍රී ලංකාවේ බොහෝ සුළු හා මධ්‍ය පරිමාණ ව්‍යාපාර සඳහා ඇති විශාල අවස්ථා ලබා ගැනීම.',
        'නව පාරිභෝගිකයින් ලබා ගැනීමේ පිරිවැය (Acquisition Cost) අඩු කිරීමට නිර්දේශ සහ ලෝයල්ටි ක්‍රම භාවිතා කිරීම.',
        'අමතර දැන්වීම් පිරිවැයකින් තොරව විකුණුම් 30-50% කින් ඉහළ නැංවීමට ක්‍රමවේද සැකසීම.',
        'B2B සන්නාම සඳහා LinkedIn සහ උපාය මාර්ගික හවුල්කාරිත්වයන් හරහා ඉහළ වටිනාකමකින් යුත් ලීඩ්ස් ලබා ගැනීම.'
      ],
      en: [
        'Most SMEs in Sri Lanka have untapped potential in email and WhatsApp marketing.',
        'Referral and loyalty loops can dramatically lower customer acquisition cost.',
        'Cross-selling and upselling systems often yield 30–50% revenue lifts with zero extra ad spend.',
        'B2B brands can leverage LinkedIn and strategic partnerships for high-value leads.'
      ]
    },
    assumptions: {
      si: [
        'සේවාලාභියා විසින් පවතින විකුණුම් දත්ත, පාරිභෝගික තොරතුරු සහ ආදායම් වාර්තා සාකච්ඡා කිරීම.',
        'ප්‍රධාන තීරණ ගන්නන් මාසිකව පැයක උපාය මාර්ගික සාකච්ඡාවකට සම්බන්ධ වීම.',
        'නිර්දේශ ක්‍රියාත්මක කිරීමට අමතර මෘදුකාංග හෝ මෙවලම් අවශ්‍ය විය හැක (පිරිවැය කල්තියා දන්වනු ලැබේ).',
        'වර්ධනය මනිනු ලබන්නේ එකඟ වූ නිර්ණායක අනුව මිස follower ප්‍රමාණය වැනි නොවැදගත් කරුණු මත නොවේ.'
      ],
      en: [
        'Client shares existing sales data, revenue figures, and customer demographics.',
        'Key decision-makers are available for a monthly 1-hour strategy call.',
        'Implementation of recommendations may require additional tools or platforms (costs advised upfront).',
        'Growth is measured against agreed KPIs — not vanity metrics like follower counts.'
      ]
    }
  },
  brand: {
    id: 'brand',
    icon: 'fas fa-palette',
    title: { si: 'Brand Identity', en: 'Brand Identity' },
    tagline: {
      si: 'පාරිභෝගිකයින් ක්ෂණිකව හඳුනා ගන්නා ලාංඡනයක් සකසමින්, සන්නාමයක් සඳහා උසස් තත්වයේ අනන්‍යතාවයක් සහ වෘත්තීය නිමාවක් අපි නිර්මාණය කරමු.',
      en: 'We build brand identities that command premium positioning — from the logo your customers recognise instantly to the visual language that makes every touchpoint feel intentional.'
    },
    deliveryTime: {
      durationText: { si: 'දින 7 - 10', en: '7 – 10 Days' },
      badge: { si: 'පූර්ණ අනන්‍යතාවය', en: 'Full Identity' },
      velocity: 78,
      icon: 'fas fa-palette',
      phases: [
        { name: { si: 'Brand Discovery & Moodboards', en: 'Brand Discovery & Moodboards' }, time: { si: 'දින 1-3', en: 'Days 1-3' }, progress: 100 },
        { name: { si: 'Logo Concepts & Typography Palette', en: 'Logo Concepts & Typography Palette' }, time: { si: 'දින 4-7', en: 'Days 4-7' }, progress: 85 },
        { name: { si: 'Brand Guidelines & Vector Assets', en: 'Brand Guidelines & Vector Assets' }, time: { si: 'දින 8-10', en: 'Days 8-10' }, progress: 95 }
      ]
    },
    what: {
      si: [
        'ලාංඡන (Logo) සැලසුම්කරණය (ප්‍රාථමික, ද්විතීයික සහ අයිකන ප්‍රභේද).',
        'සම්පූර්ණ සන්නාම මාර්ගෝපදේශ: වර්ණ palette, අකුරු භාවිතය, ස්වරය සහ භාවිත නීති.',
        'ව්‍යාපාරික කාඩ්පත්, ලෙටර් හෙඩ්ස් සහ ලිපි ද්‍රව්‍ය සැලසුම් කිරීම.',
        'සමාජ මාධ්‍ය ප්‍රෝෆයිල් කට්ටල සහ කවර් ටෙම්ප්ලේට.',
        'නව අනන්‍යතාවය ඔබේ දැනට පවතින වත්කම්වලට යෙදීම සඳහා උපකාර ලබා දීම.'
      ],
      en: [
        'Logo design with primary, secondary, and icon variants.',
        'Full brand guidelines: colour palette, typography, tone of voice, and usage rules.',
        'Business card, letterhead, and stationery design.',
        'Social media profile kits and cover templates.',
        'Brand rollout support — applying the new identity across your existing assets.'
      ]
    },
    opportunities: {
      si: [
        'ස්ථාවර සන්නාමකරණය මඟින් නිෂ්පාදනවල වටිනාකම ඉහළ නංවන අතර, ඉහළ මිල ගණන් නියම කිරීමට ඉඩ සලසයි.',
        'උසස් දෘශ්‍ය අනන්‍යතාවය විශ්වාසය වේගයෙන් ගොඩනඟයි — විශේෂයෙන් සේවා සහ මූල්‍ය අංශවලදී.',
        'පාරිභෝගිකයින් අතර සන්නාම හඳුනාගැනීම වැඩි වන විට දැන්වීම් සඳහා යන පිරිවැය ක්‍රමයෙන් අඩු වේ.',
        'ජාත්‍යන්තර ප්‍රමිතීන්ට අනුව නිර්මාණය කරන දේශීය සන්නාම ශ්‍රී ලංකා වෙළඳපොලේ කැපී පෙනේ.'
      ],
      en: [
        'Consistent branding increases perceived value, allowing higher price points.',
        'Premium visual identity builds trust faster — especially important in services and finance.',
        'A strong brand reduces marketing costs over time as recognition compounds.',
        'Local brands that invest in international-standard design stand out sharply in the Sri Lankan market.'
      ]
    },
    assumptions: {
      si: [
        'සේවාලාභියා විසින් ඔවුන්ගේ දැක්ම, ඉලක්කගත ප්‍රේක්ෂකයින් සහ ඔවුන් කැමති තරඟකරුවන් පිළිබඳ තොරතුරු සැපයීම.',
        'මූලික සංකල්ප 3ක් දක්වා ඉදිරිපත් කෙරෙන අතර; සංශෝධන වට 2ක් ඇතුළත් වේ.',
        'අවසාන ලිපිගොනු Vector (AI/SVG) සහ වෙබ්-හිතකාමී (PNG/WebP) ආකෘතිවලින් ලබා දෙනු ලැබේ.',
        'සන්නාම මාර්ගෝපදේශ PDF ආකාරයෙන් ලබා දේ; අවශ්‍ය නම් Figma ගොනුවද එකතු කළ හැක.'
      ],
      en: [
        'Client provides a brief covering their vision, target audience, and competitors they admire.',
        'Up to 3 concept directions are presented; 2 rounds of revisions are included.',
        'Final files are delivered in vector (AI/SVG) and web-ready (PNG/WebP) formats.',
        'Brand guidelines are presented as a PDF; a Figma file can be added on request.'
      ]
    }
  },
  web: {
    id: 'web',
    icon: 'fas fa-code',
    title: { si: 'Web Development', en: 'Web Development' },
    tagline: {
      si: 'පළමු දවසේ සිටම SEO පදනම සහිතව, සෑම උපාංගයකටම ගැළපෙන පරිදි ඉතා වේගවත් සහ පරිශීලක-හිතකාමී වෙබ් අඩවි නිර්මාණය කිරිම.',
      en: 'Blazing-fast, conversion-optimised websites that look premium on every device — built on modern stacks with SEO foundations baked in from day one.'
    },
    deliveryTime: {
      durationText: { si: 'දින 10 - 14', en: '10 – 14 Days' },
      badge: { si: 'ප්‍රතිචාරාත්මක Full Build', en: 'Full Stack Build' },
      velocity: 70,
      icon: 'fas fa-laptop-code',
      phases: [
        { name: { si: 'UI/UX Wireframes & Interactive Prototypes', en: 'UI/UX Wireframes & Prototypes' }, time: { si: 'දින 1-4', en: 'Days 1-4' }, progress: 100 },
        { name: { si: 'Modern Frontend & Mobile Responsive Build', en: 'Frontend & Responsive Build' }, time: { si: 'දින 5-11', en: 'Days 5-11' }, progress: 85 },
        { name: { si: 'Core Web Vitals, SEO & Production Launch', en: 'Core Web Vitals, SEO & Launch' }, time: { si: 'දින 12-14', en: 'Days 12-14' }, progress: 95 }
      ]
    },
    what: {
      si: [
        'සුවිශේෂී සැලසුම සහ සංවර්ධනය (සූදානම් කළ ටෙම්ප්ලේට භාවිතා නොකෙරේ).',
        'සෑම තිර ප්‍රමාණයකටම ගැළපෙන ජංගම-පළමු, ප්‍රතිචාරාත්මක සැකසුම.',
        'ගූගල් ශ්‍රේණිගත කිරීම් සඳහා Core Web Vitals තාක්ෂණික කාර්ය සාධන මට්ටම් ඉහළ නැංවීම.',
        'මූලික on-page SEO: මෙටා ටැග්ස්, රූප ප්‍රශස්තකරණය සහ schema සලකුණුකරණය.',
        'ඔබටම තොරතුරු වෙනස් කරගත හැකි පරිදි CMS පද්ධති (WordPress, Webflow හෝ custom) ඒකාබද්ධ කිරීම.',
        'වෙබ් අඩවිය දියත් කිරීමෙන් පසු දින 30ක නොමිලේ තාක්ෂණික සහාය.'
      ],
      en: [
        'Custom design and development (no drag-and-drop templates).',
        'Mobile-first, responsive layout across all screen sizes.',
        'Core Web Vitals optimisation for speed and Google rankings.',
        'Basic on-page SEO: meta tags, schema markup, image optimisation.',
        'CMS integration (WordPress, Webflow, or custom) so you can edit content yourself.',
        '30-day post-launch support included.'
      ]
    },
    opportunities: {
      si: [
        'වේගවත් වෘත්තීය වෙබ් අඩවියක් මඟින් විශ්වසනීයත්වය සහ අලෙවිය සැලකිය යුතු ලෙස ඉහළ යයි.',
        'E-commerce ඒකාබද්ධ කිරීම ඔස්සේ පාරිභෝගිකයින්ට සෘජුවම අන්තර්ජාලයෙන් භාණ්ඩ මිලදී ගැනීමට අවස්ථාව සැලසීම.',
        'සුවිශේෂී දැන්වීම් ප්‍රචාරණ සඳහා සකසන Landing Pages මඟින් සාමාන්‍ය පිටුවලට වඩා ඉහළ පරිවර්තන ප්‍රතිශතයක් ලබා දීම.',
        'බහුවිධ භාෂා සහාය (සිංහල, ඉංග්‍රීසි, දෙමළ) මඟින් ඔබේ ව්‍යාපාරයේ ප්‍රේක්ෂක පිරිස පුළුල් කිරීම.'
      ],
      en: [
        'A fast, professional website increases credibility and conversion rates significantly.',
        'E-commerce integration opens direct-to-consumer revenue streams.',
        'Landing pages built for specific campaigns consistently outperform generic homepages.',
        'Multilingual support (Sinhala/English/Tamil) expands your addressable audience.'
      ]
    },
    assumptions: {
      si: [
        'සංවර්ධන කටයුතු ආරම්භ කිරීමට පෙර සේවාලාභියා විසින් අවශ්‍ය ලේඛන, පින්තූර සහ ලාංඡනය ලබා දිය යුතුය.',
        'Hosting සහ Domain සේවාලාභියා විසින් මිලදී ගත යුතුය; නිර්දේශිත සේවා සපයන්නන් තෝරා ගැනීමට අපි සහාය වෙමු.',
        'ව්‍යාපෘති විෂය පථය ආරම්භයේදීම ස්ථාවර කෙරේ — එකඟ වූ පිටුවලට වඩා අමතර පිටු සඳහා වෙන වෙනම අය කෙරේ.',
        'ව්‍යාපෘති කාලය (සාමාන්‍යෙන් සති 3-5) සේවාලාභියාගේ ප්‍රතිචාර දැක්වීමේ වේගය මත රඳා පවතී.'
      ],
      en: [
        'Client supplies final copy, images, and logo before development begins.',
        'Hosting and domain are managed by the client; we advise on recommended providers.',
        'Scope is fixed at the start — additional pages beyond agreed count are quoted separately.',
        'Timeline (typically 3–5 weeks) depends on client feedback turnaround speed.'
      ]
    }
  },
  ai: {
    id: 'ai',
    icon: 'fas fa-robot',
    title: { si: 'AI Automation', en: 'AI Automation' },
    tagline: {
      si: 'පාරිභෝගික විමසීම් හැසිරවීම, ලීඩ්ස් වර්ගීකරණය කිරීම සහ ඔබ නිදා සිටින විට පවා ව්‍යාපාරික පද්ධති ස්වයංක්‍රීයව ක්‍රියාවට නැංවීම සඳහා බුද්ධිමත් පද්ධති යෙදවීම.',
      en: 'Deploy intelligent systems that handle customer enquiries, qualify leads, and run workflows while you sleep — cutting operational costs without sacrificing quality.'
    },
    deliveryTime: {
      durationText: { si: 'දින 4 - 7', en: '4 – 7 Days' },
      badge: { si: 'AI Smart Integration', en: 'AI Integration' },
      velocity: 88,
      icon: 'fas fa-robot',
      phases: [
        { name: { si: 'Knowledge Base & Workflow Audit', en: 'Knowledge Base & Workflow Audit' }, time: { si: 'දින 1-2', en: 'Days 1-2' }, progress: 100 },
        { name: { si: 'AI Agent Architecture & Multi-Channel Sync', en: 'AI Agent Architecture & Sync' }, time: { si: 'දින 3-5', en: 'Days 3-5' }, progress: 85 },
        { name: { si: 'Testing, Fallback Validation & Deployment', en: 'Testing, Fallbacks & Live Deployment' }, time: { si: 'දින 6-7', en: 'Days 6-7' }, progress: 95 }
      ]
    },
    what: {
      si: [
        'WhatsApp, Facebook Messenger, සහ ඔබේ වෙබ් අඩවිය සඳහා සකසන ලද බුද්ධිමත් AI Chatbots.',
        'CRM පද්ධති සමඟ සම්බන්ධිත පාරිභෝගික තොරතුරු ග්‍රහණය කරගැනීමේ සහ වර්ගීකරණය කිරීමේ පද්ධති.',
        'පාරිභෝගික හැසිරීම් මත පදනම් වූ ස්වයංක්‍රීය පසු විපරම් (Follow-up) පණිවිඩ.',
        'සමාජ මාධ්‍ය සඳහා AI මඟින් අන්තර්ගතයන් කාලසටහන්ගත කිරීම සහ ස්වයංක්‍රීයව පළ කිරීම.',
        'ඇණවුම්, ඉන්වොයිසි සහ දැනුම්දීම් සම්බන්ධ කරන කාර්ය ප්‍රවාහ ස්වයංක්‍රීයකරණය (Workflow automation).'
      ],
      en: [
        'Custom AI chatbots for WhatsApp, Facebook Messenger, and your website.',
        'Lead capture and qualification flows with CRM integration.',
        'Automated follow-up sequences triggered by customer behaviour.',
        'AI-assisted content scheduling and social media posting.',
        'Workflow automation connecting your tools (bookings, invoicing, notifications).'
      ]
    },
    opportunities: {
      si: [
        'WhatsApp Chatbots මඟින් පොදු පාරිභෝගික ප්‍රශ්නවලින් 80%කට ක්ෂණිකව, පැය 24 පුරාම පිළිතුරු ලබා දීම.',
        'ස්වයංක්‍රීය පාරිභෝගික සන්නිවේදනය මඟින් විමසීම්වලින් මිලදී ගැනීම් කරා ළඟා වීමේ ප්‍රතිශතය තුන් ගුණයකින් වැඩි කිරීම.',
        'නිතර නිතර සිදු කරන පුනරාවර්තන කාර්යයන් ස්වයංක්‍රීය කිරීමෙන් ව්‍යාපාරික ඵලදායිතාවය 20-40%කින් වැඩි කරගත හැකි වීම.',
        'AI මෙවලම් භාවිතයෙන් කුඩා කණ්ඩායමකට වුවද මහා පරිමාණ ආයතනයක මට්ටමින් නිමැවුම් ධාරිතාවයක් පවත්වා ගැනීමට හැකි වීම.'
      ],
      en: [
        'WhatsApp chatbots respond to 80% of common customer questions instantly — 24/7.',
        'Automated lead nurturing can triple conversion rates from enquiry to sale.',
        'Businesses that automate repetitive tasks report 20–40% productivity gains.',
        'AI content tools allow small teams to maintain enterprise-level output volume.'
      ]
    },
    assumptions: {
      si: [
        'පොදු පාරිභෝගික ප්‍රශ්න සහ ඊට අපේක්ෂිත නිවැරදි පිළිතුරු ලැයිස්තුවක් සේවාලාභියා විසින් සැපයිය යුතුය.',
        'ඒකාබද්ධ කිරීම් සැලසුම් කරනු ලබන්නේ සේවාලාභියා දැනට භාවිතා කරන තාක්ෂණික මෙවලම් මත පදනම්වය.',
        'සජීවීව ක්‍රියාත්මක කිරීමට පෙර AI ස්වයංක්‍රීය පිළිතුරු සියල්ල සේවාලාභියා විසින් සමාලෝචනය කර අනුමත කළ යුතුය.',
        'අඛණ්ඩ නිරීක්ෂණ සහ නැවත මට්ටම් සැකසීම් මාසිකව සිදු කිරීම නිර්දේශ කරනු ලැබේ.'
      ],
      en: [
        'Client provides a list of common customer questions and desired responses.',
        'Integrations depend on the platforms currently used by the client.',
        'AI responses are reviewed and approved by the client before going live.',
        'Ongoing fine-tuning is recommended monthly — included in retainer plans, quoted separately otherwise.'
      ]
    }
  },
  video: {
    id: 'video',
    icon: 'fas fa-video',
    title: { si: 'Video Production', en: 'Video Production' },
    tagline: {
      si: 'ප්‍රේක්ෂකයින් නතර කරන, සන්නාමයේ වටිනාකම පෙන්වන සහ පාරිභෝගික ක්‍රියාවන් උත්තේජනය කරන උසස් තත්ත්වයේ සිනමාත්මක විඩියෝ නිර්මාණය කිරිම.',
      en: 'Cinematic brand films and scroll-stopping short-form content — produced to platform specifications and engineered to drive action, not just views.'
    },
    deliveryTime: {
      durationText: { si: 'දින 5 - 8', en: '5 – 8 Days' },
      badge: { si: 'සිනමාත්මක නිෂ්පාදනය', en: 'Cinematic Sprint' },
      velocity: 82,
      icon: 'fas fa-video',
      phases: [
        { name: { si: 'Creative Scripting & Storyboarding', en: 'Creative Scripting & Storyboards' }, time: { si: 'දින 1-2', en: 'Days 1-2' }, progress: 100 },
        { name: { si: 'Cinematic Filming & Raw Production', en: 'Cinematic Filming & Production' }, time: { si: 'දින 3-5', en: 'Days 3-5' }, progress: 80 },
        { name: { si: 'Color Grading, Sound Design & Multi-Ratio Exports', en: 'Color Grading, Sound & Multi-Ratio Exports' }, time: { si: 'දින 6-8', en: 'Days 6-8' }, progress: 95 }
      ]
    },
    what: {
      si: [
        'සංකල්ප සංවර්ධනය, පිටපත් රචනය සහ Storyboarding කටයුතු.',
        'ආලෝකකරණය සහ පටිගත කිරීම් සහිතව වෘත්තීය මට්ටමේ වීඩියෝ රූගත කිරීම්.',
        'සම්පූර්ණ පශ්චාත්-නිෂ්පාදනය (Post-production): වීඩියෝ සංස්කරණය, වර්ණ ගැන්වීම සහ සංගීතය එක් කිරීම.',
        'විවිධ සමාජ මාධ්‍ය සඳහා ප්‍රශස්ත මානයන්ගෙන් අපනයනය: (YouTube සඳහා 16:9, Reels/TikTok සඳහා 9:16).',
        'වීඩියෝවට ගැළපෙන උපසිරැසි (Subtitles) සහ සිංහල/ඉංග්‍රීසි Caption එක් කිරීම.'
      ],
      en: [
        'Concept development, scripting, and storyboarding.',
        'Professional on-location or studio shoot with lighting and sound.',
        'Full post-production: editing, colour grading, motion graphics, and music.',
        'Platform-specific exports: 16:9 for YouTube, 9:16 for Reels/TikTok, 1:1 for feeds.',
        'Subtitles and Sinhala/English caption overlays included.'
      ]
    },
    opportunities: {
      si: [
        'TikTok සහ Instagram Reels දැන්වීම් මඟින් සාමාන්‍ය පින්තූර දැන්වීම්වලට වඩා ඉතා අඩු පිරිවැයකින් වැඩි පිරිසක් වෙත ළඟා විය හැක.',
        'ප්‍රධාන වීඩියෝවක් කොටස්වලට වෙන් කිරීමෙන් විවිධ දැන්වීම් 10කට වඩා වැඩි ප්‍රමාණයක් නිර්මාණය කරගැනීමේ අවස්ථාව.',
        'පාරිභෝගික අදහස් ඇතුළත් වීඩියෝ (Testimonial videos) මඟින් සන්නාම විශ්වාසය ඉතා වේගයෙන් ගොඩනැඟිය හැකි වීම.',
        'ආයතනයේ පසුබිම් රූගත කිරීම් (Behind-the-scenes) මඟින් සේවාලාභියා සහ ආයතනය අතර සෘජු මානුෂීය සම්බන්ධතාවයක් ඇති වීම.'
      ],
      en: [
        'Video ads on TikTok and Instagram Reels consistently deliver lower CPMs than static ads.',
        'A single hero brand film can be repurposed into 10+ shorter assets — maximising production value.',
        'Testimonial videos build social proof and trust faster than written reviews.',
        'Behind-the-scenes and process videos humanise your brand and drive organic reach.'
      ]
    },
    assumptions: {
      si: [
        'රූගත කිරීම් සිදුවන ස්ථානවල අවසර ලබා ගැනීම් සහ අවශ්‍ය නිෂ්පාදන සේවාලාභියා විසින් සූදානම් කළ යුතුය.',
        'සම්පූර්ණ ගෙවීම් නිම කරන තෙක් රූගත කළ දර්ශනවල අයිතිය Gamage Marketing ආයතනය සතු වේ.',
        'සංස්කරණ සංශෝධන වට 2ක් ඇතුළත් වේ; අමතර සංශෝධන සඳහා වෙනම අය කෙරේ.',
        'සාමාන්‍ය ව්‍යාපෘතියක් සඳහා රූගත කිරීම් අවසන් වී දින 7-10ක් ඇතුළත අවසන් නිර්මාණය ලබා දේ.'
      ],
      en: [
        'Client arranges access to the shoot location and any required talent or products.',
        'Raw footage belongs to Gamage Marketing until full payment is received.',
        'Up to 2 rounds of edit revisions are included; additional rounds are charged at a day rate.',
        'Final delivery is within 7–10 business days of the shoot date for standard projects.'
      ]
    }
  }
};

// Testimonials data exactly matching user specification
const REVIEWS_DATA: Review[] = [
  {
    stars: 5,
    tag: { si: 'Social Media Marketing', en: 'Social Media Marketing' },
    body: {
      si: '"ගමගේ Marketing සමඟ සාකච්ඡා කර වැඩ ආරම්භ කර මාස 3ක් වැනි කෙටි කාලයක් තුළ අපගේ Facebook පිටුවේ අනුගාමිකන් සංඛ්‍යාව 800 සිට 14,000 දක්වා ඉහළ ගියා. වඩාත්ම වැදගත් දෙය නම් අපේ වෙළඳසැලට පැමිණෙන ජනතාව දෙගුණයකින් වැඩි වීමයි. ඔවුන්ගේ දැන්වීම් ක්‍රම සහ ඉලක්කගත කිරීම් ඉතා නිවැරදි වන අතර සමස්ත කණ්ඩායමම ඇත්තටම කැපවීමකින් වැඩ කරනවා."',
      en: '"Within 3 months of working with Gamage Marketing, our Facebook page went from 800 followers to over 14,000 — and more importantly, our in-store foot traffic doubled. The campaigns are creative, the targeting is precise, and the team genuinely cares about results."'
    },
    platform: 'google',
    initials: 'DK',
    avatarBg: 'linear-gradient(135deg, #f59e0b, #ef4444)',
    reviewerName: 'Dilshan Karunarathne',
    reviewerMeta: { si: 'හිමිකරු, කරුණාරත්න ගෘහ භාණ්ඩ — මහනුවර', en: 'Owner, Karunarathne Furniture — Kandy' }
  },
  {
    stars: 5,
    tag: { si: 'Web Development', en: 'Web Development' },
    body: {
      si: '"ඔවුන් අපගේ ඊ-වාණිජ්‍ය වෙබ් අඩවිය සති 4කට අඩු කාලයකින් නිම කර දුන්නා. එය ඉතා වේගවත් සහ ලස්සනයි, කිසිදු තාක්ෂණික දැනුමක් නැතිව මටම එය වෙනස් කරගන්න පුළුවන්. දැන් අපේ මාසික ආදායමෙන් 40%ක් ලැබෙන්නේ අන්තර්ජාල ඇණවුම් හරහා. වසර ගණනාවකින් අප කල හොඳම ආයෝජනය මෙයයි."',
      en: '"They built our entire e-commerce website in under 4 weeks — it\'s fast, beautiful, and I can update it myself without any technical knowledge. Our online orders now account for 40% of monthly revenue. Best investment we\'ve made in years."'
    },
    platform: 'google',
    initials: 'NP',
    avatarBg: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
    reviewerName: 'Nimesha Perera',
    reviewerMeta: { si: 'නිර්මාතෘ, Ceylon Spice Box — කොළඹ', en: 'Founder, Ceylon Spice Box — Colombo' }
  },
  {
    stars: 5,
    tag: { si: 'Brand Identity', en: 'Brand Identity' },
    body: {
      si: '"අපේ පැරණි ලාංඡනය MS Wordවලින් හදපු එකක් වගෙයි තිබුණේ. ගමගේ කණ්ඩායම අපට සැබවින්ම ආඩම්බර විය හැකි සන්නාම අනන්‍යතාවයක් නිර්මාණය කර දුන්නා — ලාංඡනය, වර්ණ, ව්‍යාපාරික කාඩ්පත් ඇතුළු සියලුම දේ. දැන් අපේ පාරිභෝගිකයින් පවසන්නේ අප ඉතා වෘත්තීය මට්ටමක පෙනෙන බවයි. එය අපගේ සේවාවන්වල වටිනාකම තීරණය කිරීමටද බෙහෙවින් උපකාරී වුණා."',
      en: '"Our old logo looked like it was made in Microsoft Word. The Gamage team gave us a full brand identity that we\'re genuinely proud of — logo, colours, business cards, the whole package. Clients comment on how professional we look now. It changed how they perceive our pricing too."'
    },
    platform: 'facebook',
    initials: 'RS',
    avatarBg: 'linear-gradient(135deg, #10b981, #3b82f6)',
    reviewerName: 'Roshan Silva',
    reviewerMeta: { si: 'අධ්‍යක්ෂ, සිල්වා සහ පුත්‍රයෝ ලොජිස්ටික්ස් — ගම්පහ', en: 'Director, Silva & Sons Logistics — Gampaha' }
  },
  {
    stars: 5,
    tag: { si: 'AI Automation', en: 'AI Automation' },
    body: {
      si: '"ඔවුන් සකස් කළ WhatsApp chatbot එක අපගේ කිසිදු මැදිහත් වීමකින් තොරව දිනකට පාරිභෝගික විමසීම් 200ක් පමණ කළමනාකරණය කරනවා. එය පාරිභෝගික අපේක්ෂාවන් හඳුනාගෙන, නිතර අසන ප්‍රශ්නවලට පිළිතුරු සපයමින්, ස්වයංක්‍රීයව වේලාවන් වෙන්කර දෙනවා. අපි සේවකයින් දෙදෙනෙකුගේ සිට පාරිභෝගිකයින් 10 ගුණයක් දක්වා ව්‍යාපාරය පුළුල් කළා."',
      en: '"The WhatsApp chatbot they set up handles about 200 customer inquiries a day without us lifting a finger. It qualifies leads, answers FAQs, and books appointments automatically. We scaled from 2 staff to serving 10× more customers. I genuinely don\'t know how we managed before."'
    },
    platform: 'google',
    initials: 'AP',
    avatarBg: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
    reviewerName: 'Amaya Pathirana',
    reviewerMeta: { si: 'ප්‍රධාන විධායක නිලධාරී, පතිරණ රූපලාවන්‍ය සායනය — මීගමුව', en: 'CEO, Pathirana Beauty Clinics — Negombo' }
  },
  {
    stars: 5,
    tag: { si: 'Growth Strategy', en: 'Growth Strategy' },
    body: {
      si: '"ගමගේ ආයතනය බඳවා ගැනීමට පෙර අපගේ ආදායම වසර දෙකක් තිස්සේ එකම මට්ටමක පැවතුණා. ඔවුන්ගේ වර්ධන විගණනයෙන් අපට නොපෙනුණු විශාල අඩුපාඩු තුනක් සොයා දුන්නා. මාස හයකට පසුව අපගේ මාසික ආදායම 180%කින් ඉහළ ගොස් තිබෙනවා. ඔවුන්ගේ උපාය මාර්ගික සැසි සැබවින්ම ඉතා වටිනවා."',
      en: '"We were stuck at the same revenue for two years before hiring Gamage. Their growth audit identified three major leaks in our funnel that we never saw. Six months later we\'re up 180% in monthly revenue. The strategy sessions are worth every rupee — they think in systems, not gimmicks."'
    },
    platform: 'google',
    initials: 'KW',
    avatarBg: 'linear-gradient(135deg, #f59e0b, #10b981)',
    reviewerName: 'Kavinda Wickramasinghe',
    reviewerMeta: { si: 'කළමනාකාර අධ්‍යක්ෂ, වික්‍රමසිංහ මෝටර් රථ උපාංග — කුරුණෑගල', en: 'MD, Wickramasinghe Auto Parts — Kurunegala' }
  },
  {
    stars: 5,
    tag: { si: 'Video Production', en: 'Video Production' },
    body: {
      si: '"අපගේ හෝටලය විවෘත කිරීම සඳහා ඔවුන් නිර්මාණය කල ප්‍රවර්ධන වීඩියෝව ජාත්‍යන්තර මට්ටමේ සිනමාත්මක ගුණයෙන් යුක්ත වුණා. එය TikTok සහ Instagramවල මීට පෙර දැන්වීම්වලට වඩා තුන් ගුණයක ඉහළ ප්‍රතිචාර ලැබුවා. රූගත කිරීම් ඉතා වෘත්තීය මට්ටමෙන් සිදු වූ අතර නියමිත වේලාවට පෙර නිර්මාණය ලබා දුන්නා."',
      en: '"The product video they produced for our hotel launch was cinematic quality — we\'ve had it compared to international ad agency work. It performed 3× better than our previous ads on TikTok and Instagram. The shoot was smooth, professional, and they delivered ahead of schedule."'
    },
    platform: 'instagram',
    initials: 'SF',
    avatarBg: 'linear-gradient(135deg, #06b6d4, #4f46e5)',
    reviewerName: 'Sachini Fernando',
    reviewerMeta: { si: 'අලෙවිකරණ කළමනාකාරිනී, ද සෙරෙනිටි බුටික් හෝටලය — ගාල්ල', en: 'Marketing Manager, The Serenity Boutique Hotel — Galle' }
  },
  {
    stars: 5,
    tag: { si: 'Social Media Marketing', en: 'Social Media Marketing' },
    body: {
      si: '"B2B සමාගමකට සමාජ මාධ්‍ය අලෙවිකරණය සුදුසු යැයි මා සිතුවේ නැතත්, ගමගේ ආයතනය එය වැරදි බව ඔප්පු කළා. ඔවුන්ගේ LinkedIn සහ Facebook උපාය මාර්ගයෙන් පළමු මාසයේදීම ඉතා සාර්ථක පාරිභෝගික සම්බන්ධතා (leads) 47ක් ලැබුණා. ඉතා විනිවිදභාවයෙන් යුතු වාර්තාකරණය, ක්‍රියාශීලී කණ්ඩායම සහ සැබෑ අවසාන ප්‍රතිඵල මෙහි දැකිය හැක."',
      en: '"I was sceptical about social media marketing for a B2B company, but Gamage proved me completely wrong. Their LinkedIn and Facebook strategy generated 47 qualified leads in the first month — more than we\'d received all of last year. Transparent reporting, responsive team, real ROI."'
    },
    platform: 'google',
    initials: 'TJ',
    avatarBg: 'linear-gradient(135deg, #3b82f6, #ec4899)',
    reviewerName: 'Tharindu Jayasekara',
    reviewerMeta: { si: 'කොටස්කරු, ජයසේකර පලaccounting සමාගම — කොළඹ 3', en: 'Partner, Jayasekara & Co. Chartered Accountants — Colombo 3' }
  },
  {
    stars: 5,
    tag: { si: 'Web Development + Brand Identity', en: 'Web Development + Brand Identity' },
    body: {
      si: '"අපි වෙබ් සහ සන්නාමකරණය ඒකාබද්ධ කල Business පැකේජය තෝරා ගත්තා. අපගේ අයවැය මට්ටමට වඩා ඉතා උසස් සේවාවක් අපට ලැබුණා. අපගේ වෙබ් අඩවිය දැන් ප්‍රධාන සෙවුම් පද සඳහා Googleහි පළමු පිටුවේ තිබෙන අතර සන්නාමය ද ඉතාම වෘත්තීය මට්ටමක පවතී."',
      en: '"We took the Business package combining web and branding. The end result was far beyond what we imagined at that price point. Our website now ranks on page one for three of our target keywords, and the brand looks like we belong in the premium segment — because now we do."'
    },
    platform: 'facebook',
    initials: 'MR',
    avatarBg: 'linear-gradient(135deg, #ef4444, #f59e0b)',
    reviewerName: 'Malsha Rajapaksa',
    reviewerMeta: { si: 'සහ-නිර්මාතෘ, MR අභ්‍යන්තර සැලසුම්කරණය — බත්තරමුල්ල', en: 'Co-Founder, MR Interior Designs — Battaramulla' }
  }
];

const FAQ_DATA: FaqItem[] = [
  {
    question: {
      si: "ව්‍යාපෘතියක් ආරම්භ කිරීමට මූලිකවම අවශ්‍ය වන්නේ කුමක්ද?",
      en: "What is required to start a project?"
    },
    answer: {
      si: "පළමුව ඔබ අපගේ 'සම්බන්ධ වන්න' පෝරමය (Contact Form) පුරවා එවන්න. ඉන්පසුව අපගේ නොමිලේ ලබාදෙන උපාය මාර්ගික සාකච්ඡාව (Free Discovery Call) හරහා ඔබේ ව්‍යාපාරික අවශ්‍යතා සහ ඉලක්ක හඳුනාගෙන, ඔබට වඩාත්ම ගැළපෙන සැලැස්ම (Custom Roadmap) සහ මූලික පියවර අපි සකස් කර දෙන්නෙමු.",
      en: "First, fill out and submit our contact form. Then, through our free Discovery Call, we will identify your business needs & goals, and prepare a custom roadmap & next steps tailored specifically for you."
    }
  },
  {
    question: {
      si: "සේවා Deliverables ලැබීමට සාමාන්‍යෙන් කොපමණ කාලයක් ගතවේද?",
      en: "How long does it typically take to receive service deliverables?"
    },
    answer: {
      si: "සේවාවේ ස්වභාවය අනුව කාලය වෙනස් වේ. සාමාන්‍යෙන්, සන්නාම අනන්‍යතාවය (Brand Identity) සති 2-3ක් ද, වෙබ් අඩවි සැලසුම් කිරීම සහ සංවර්ධනය (Web Development) සති 3-5ක් ද ගත වේ. සමාජ මාධ්‍ය ප්‍රචාරණ සේවා (Social campaigns) ගිවිසුම්ගත වී දින 7ක් ඇතුළත සජීවීව (Live) ක්‍රියාත්මක කළ හැක.",
      en: "Times vary depending on the service. Generally, Brand Identity takes 2-3 weeks, Web Development takes 3-5 weeks, and Social Media Marketing campaigns can go live within 7 days of signing."
    }
  },
  {
    question: {
      si: "ප්‍රචාරණ කටයුතු සඳහා Ad Budget එක කළමනාකරණය කරන්නේ කෙසේද?",
      en: "How is the advertising budget managed?"
    },
    answer: {
      si: "අපගේ සේවා ගාස්තුව (Agency Fee) සහ Facebook, TikTok හෝ Google වෙත ගෙවනු ලබන ප්‍රචාරණ පිරිවැය (Ad Spend) වෙනස් වේ. ප්‍රචාරණ අයවැය සෘජුවම ඔබේ දැන්වීම් ගිණුම (Ad Account) හරහා කළමනාකරණය කිරීමට අපි සැකසුම් සකස් කර දෙන අතර, දිනපතා අයවැය උපරිම කාර්යක්ෂමතාවයකින් යුතු සේ මෙහෙයවීම අපගේ කණ්ඩායම විසින් සිදු කරයි.",
      en: "Our Agency Fee and actual Ad Spend (paid directly to platforms like Facebook, TikTok, or Google) are separate. We set up your ad accounts so you manage your budget directly, and our team continuously optimizes of daily spends for maximum efficiency."
    }
  },
  {
    question: {
      si: "ප්‍රචාරණ ව්‍යාපෘතිවල සාර්ථකත්වය සහ ROI මනින්නේ කෙසේද?",
      en: "How do you measure project success and ROI?"
    },
    answer: {
      si: "අපි 'Vanity Metrics' (likes/shares) වෙනුවට සැබෑ ව්‍යාපාරික වර්ධනය (Leads, Sales, Conversions) කෙරෙහි අවධානය යොමු කරමු. සෑම සතියකම සවිස්තරාත්මක වාර්තාවක් (Performance Reports) සහ ඕනෑම වෙලාවක බලාගත හැකි live dashboard එකක් ඔබේ ව්‍යාපාරයට අපි ලබා දෙන්නෙමු.",
      en: "Instead of vanity metrics like likes & shares, we focus on real business growth: leads, sales, and conversions. We provide detailed weekly performance reports and a live dashboard accessible at any time."
    }
  },
  {
    question: {
      si: "ව්‍යාපෘතිය අතරතුර සහ පසුව පාරිභෝගික සහාය (Support) ක්‍රියාත්මක වන්නේ කෙසේද?",
      en: "How does customer support work during and after the project?"
    },
    answer: {
      si: "අපගේ Business සහ Enterprise පැකේජ සාමාජිකයන්ට විශේෂිත Dedicated Account Manager කෙනෙකු සහ 24/7 ක්‍රියාත්මක WhatsApp ප්‍රමුඛතා සහාය (Priority Support) හිමි වේ. වෙනත් සාමාන්‍ය විමසීම් සඳහා වැඩකරන දිනවලදී පැය කීපයක් ඇතුළත අපගේ කණ්ඩායම විසඳුම් ලබා දෙන්නෙමු.",
      en: "Our Business and Enterprise package clients receive a dedicated Account Manager and 24/7 WhatsApp Priority Support. For other queries, our team provides solutions within a few working hours."
    }
  }
];

// Helper components

// Stat Counter Component
interface CounterProps {
  target: number;
  suffix?: string;
  label: string;
}

function StatCounter({ target, suffix = "+", label }: CounterProps) {
  const [count, setCount] = useState(0);
  const counterRef = useRef<HTMLDivElement | null>(null);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !animated) {
          setAnimated(true);
          let start = 0;
          const duration = 1500; // 1.5 seconds animation
          const startTime = performance.now();

          const animateValue = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Quad ease-out equation
            const easeProgress = progress * (2 - progress);
            setCount(Math.floor(easeProgress * target));

            if (progress < 1) {
              requestAnimationFrame(animateValue);
            } else {
              setCount(target);
            }
          };

          requestAnimationFrame(animateValue);
        }
      },
      { threshold: 0.1 }
    );

    if (counterRef.current) {
      observer.observe(counterRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [target, animated]);

  return (
    <div
      ref={counterRef}
      className="stat-counter-card bg-white/[0.04] p-8 rounded-3xl backdrop-blur-md border border-white/[0.08] text-center transition-all duration-300 hover:-translate-y-2.5 hover:bg-white/[0.07] hover:border-cyan-500/30"
    >
      <h2 className="text-4xl md:text-5xl font-extrabold mb-2 bg-gradient-to-r from-cyan-400 to-indigo-500 bg-clip-text text-transparent">
        {count}
        {suffix}
      </h2>
      <p className="text-slate-300 text-sm md:text-base">{label}</p>
    </div>
  );
}

// Animated Rating Bar
interface RatingBarProps {
  label: string;
  count: number;
  percentage: number;
}

function RatingProgress({ label, count, percentage }: RatingBarProps) {
  const [width, setWidth] = useState(0);
  const barRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setWidth(percentage);
        }
      },
      { threshold: 0.1 }
    );

    if (barRef.current) {
      observer.observe(barRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [percentage]);

  return (
    <div ref={barRef} className="flex items-center gap-3 text-xs md:text-sm">
      <span className="w-8 text-slate-400 font-semibold text-right">{label}</span>
      <div className="flex-1 h-2 bg-white/[0.08] rounded-full overflow-hidden">
        <div
          style={{ width: `${width}%` }}
          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500 transition-all duration-1000 ease-out"
        />
      </div>
      <span className="w-8 text-slate-500 font-medium text-left">{count}</span>
    </div>
  );
}

// Fade in visibility observer
interface FadeInViewProps {
  key?: string;
  children: ReactNode;
  className?: string;
  delay?: string;
}

function FadeInView({ children, className = "", delay = "" }: FadeInViewProps) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.15 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={elementRef}
      style={{ transitionDelay: delay }}
      className={`transition-all duration-800 transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      } ${className}`}
    >
      {children}
    </div>
  );
}

// Cost Estimator Component
interface CostEstimatorProps {
  lang: 'si' | 'en';
  T: any;
}

function CostEstimator({ lang, T }: CostEstimatorProps) {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  
  const services = [
    { id: 'web', label: lang === 'si' ? 'Web Development (Basic)' : 'Web Development (Basic)', basePrice: 75000 },
    { id: 'web_adv', label: lang === 'si' ? 'E-Commerce / Advanced Web' : 'E-Commerce / Advanced Web', basePrice: 150000 },
    { id: 'branding', label: lang === 'si' ? 'Brand Identity Design' : 'Brand Identity Design', basePrice: 50000 },
    { id: 'social_media', label: lang === 'si' ? 'Social Media Management (Monthly)' : 'Social Media Management (Monthly)', basePrice: 40000 },
    { id: 'seo', label: lang === 'si' ? 'SEO Optimization' : 'SEO Optimization', basePrice: 35000 },
    { id: 'ads', label: lang === 'si' ? 'Paid Ads Management (Setup + 1 month)' : 'Paid Ads Management (Setup + 1 month)', basePrice: 60000 },
  ];

  const toggleService = (id: string) => {
    setSelectedServices(prev => 
      prev.includes(id) ? prev.filter(serviceId => serviceId !== id) : [...prev, id]
    );
  };

  const calculateTotal = () => {
    return selectedServices.reduce((total, id) => {
      const service = services.find(s => s.id === id);
      return total + (service?.basePrice || 0);
    }, 0);
  };

  return (
    <div className="estimator-container bg-white/[0.03] border border-white/[0.08] p-8 rounded-[30px] backdrop-blur-md max-w-[800px] mx-auto text-left shadow-lg">
      <h3 className="text-xl md:text-2xl font-bold mb-6 text-white text-center">{T[lang].estimatorTitle}</h3>
      <p className="text-sm md:text-base text-slate-400 mb-8 text-center">{T[lang].estimatorSubtitle}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {services.map(service => (
          <div 
            key={service.id} 
            onClick={() => toggleService(service.id)}
            className={`flex items-center justify-between p-4 rounded-xl cursor-pointer border transition-all duration-300 select-none ${
              selectedServices.includes(service.id) 
                ? 'bg-cyan-900/40 border-cyan-400 text-white shadow-[0_0_15px_rgba(34,211,238,0.2)]' 
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center gap-3 w-full">
              <div className={`w-5 h-5 rounded flex items-center justify-center border shrink-0 transition-colors ${
                selectedServices.includes(service.id) ? 'bg-cyan-400 border-cyan-400' : 'bg-transparent border-slate-500'
              }`}>
                {selectedServices.includes(service.id) && <i className="fas fa-check text-slate-900 text-xs" />}
              </div>
              <span className="text-sm font-medium leading-tight flex-1">{service.label}</span>
              <span className="text-sm font-bold text-cyan-300 shrink-0 whitespace-nowrap">Rs. {service.basePrice.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="border-t border-white/10 pt-6 mt-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <p className="text-slate-400 text-sm">{T[lang].estTotal}</p>
          <div className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">
            LKR {calculateTotal().toLocaleString()}
          </div>
        </div>
        <a 
          href={`#contact`} 
          onClick={() => {
            const el = document.getElementById('contactForm');
            if(el) {
              const info = selectedServices.map(id => services.find(s=>s.id === id)?.label).join(', ');
              const textarea = el.querySelector('textarea[name="message"]') as HTMLTextAreaElement;
              if (textarea) {
                textarea.value = `I'm interested in: ${info}. (Estimated Total: LKR ${calculateTotal().toLocaleString()})`;
              }
            }
          }}
          className={`px-8 py-4 rounded-full font-bold transition-all ${
            selectedServices.length > 0 
              ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white hover:shadow-lg hover:shadow-cyan-500/30' 
              : 'bg-white/10 text-slate-400 cursor-not-allowed'
          }`}
          style={{ pointerEvents: selectedServices.length > 0 ? 'auto' : 'none' }}
        >
          {lang === 'si' ? 'මෙම පිරිවැයට සාකච්ඡා කරන්න' : 'Discuss this Estimate'}
        </a>
      </div>
      <p className="text-xs text-slate-500 mt-6 text-center">{T[lang].estNote}</p>
    </div>
  );
}

export default function App() {
  // Initialize Google Analytics ONCE
  useEffect(() => {
    // We use a placeholder Measurement ID, user can replace it with real ID
    ReactGA.initialize('G-RZHZQ9SL61');
    ReactGA.send({ hitType: "pageview", page: window.location.pathname });
  }, []);

  // Set up scroll for parallax
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 1000], [0, 400]);
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);
  const bgY1 = useTransform(scrollY, [0, 2000], [0, -600]);
  const bgY2 = useTransform(scrollY, [0, 2000], [0, 800]);

  // Language State (Persisted in localStorage across sessions, defaults to Sinhala)
  const [lang, setLang] = useState<'si' | 'en'>(() => {
    try {
      const savedLang = localStorage.getItem('lang');
      if (savedLang === 'si' || savedLang === 'en') {
        return savedLang;
      }
    } catch {
      // Fallback if localStorage is inaccessible
    }
    return 'si';
  });

  const toggleLang = () => {
    setLang(prev => (prev === 'si' ? 'en' : 'si'));
  };

  const [langChanging, setLangChanging] = useState(false);

  // Synchronize language changes with localStorage, document element, and trigger visual refresh animation
  useEffect(() => {
    try {
      localStorage.setItem('lang', lang);
    } catch (e) {
      console.warn('Failed to save language to localStorage:', e);
    }
    document.documentElement.lang = lang;
    setLangChanging(true);
    const timer = setTimeout(() => {
      setLangChanging(false);
    }, 350);
    return () => clearTimeout(timer);
  }, [lang]);

  // Theme State (Persisted in localStorage with system preference check during initial load)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark' || savedTheme === 'light') {
        return savedTheme;
      }
      if (typeof window !== 'undefined' && window.matchMedia) {
        if (window.matchMedia('(prefers-color-scheme: light)').matches) {
          return 'light';
        }
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          return 'dark';
        }
      }
    } catch {
      // Fallback if localStorage or matchMedia is restricted
    }
    return 'dark';
  });

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Sync theme changes with the root HTML elements and persist across all sessions
  useEffect(() => {
    try {
      localStorage.setItem('theme', theme);
    } catch (e) {
      console.warn('Failed to save theme to localStorage:', e);
    }
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('theme-light');
    } else {
      root.classList.remove('theme-light');
    }
  }, [theme]);

  // Listen to OS/browser system color scheme changes if user hasn't explicitly set a preference
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      try {
        const hasManualPref = localStorage.getItem('theme');
        // Only react to OS changes if the user has not manually set a preference
        if (!hasManualPref) {
          setTheme(e.matches ? 'light' : 'dark');
        }
      } catch {
        // Ignore localStorage access errors
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemThemeChange);
      return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
    }
  }, []);

  // Scroll to Top Button state
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show scroll-to-top button when scrolled past 500px (typically past the hero section)
      if (window.scrollY > 500) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Mobile Menu State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Modal Service State
  const [selectedService, setSelectedService] = useState<ServiceDetail | null>(null);

  // Google Drive Backup Modal State
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);

  // Testimonial Scroll Tracker State
  const [activeReviewIndex, setActiveReviewIndex] = useState(0);
  const reviewsTrackRef = useRef<HTMLDivElement | null>(null);

  // Form submission feedback
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [showToast, setShowToast] = useState(false);

  // Handle auto dot updates on manual scroll
  const handleReviewsScroll = () => {
    const track = reviewsTrackRef.current;
    if (!track) return;
    const cards = track.querySelectorAll('.review-card-item');
    if (cards.length === 0) return;
    const firstCard = cards[0] as HTMLDivElement;
    const cardWidth = firstCard.offsetWidth + 24; // Width + gap
    const index = Math.round(track.scrollLeft / cardWidth);
    if (!isNaN(index) && index >= 0 && index < REVIEWS_DATA.length) {
      setActiveReviewIndex(index);
    }
  };

  // Scroll to a specific testimonial card index
  const scrollToReview = (index: number) => {
    const track = reviewsTrackRef.current;
    if (!track) return;
    const cards = track.querySelectorAll('.review-card-item');
    if (cards.length === 0) return;
    const firstCard = cards[0] as HTMLDivElement;
    const cardWidth = firstCard.offsetWidth + 24;
    track.scrollTo({
      left: cardWidth * index,
      behavior: 'smooth'
    });
    setActiveReviewIndex(index);
  };

  // Close service modal outside click or ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedService(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Set overflow hidden on body when modal is active
  useEffect(() => {
    if (selectedService) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [selectedService]);

  // Form Submission Handler
  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormStatus('sending');

    const form = e.currentTarget;
    const data: Record<string, string> = {};
    const formData = new FormData(form);
    formData.forEach((value, key) => {
      data[key] = value.toString();
    });

    try {
      const response = await fetch('https://formspree.io/f/mkoeqqpn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        setFormStatus('success');
        setShowToast(true);
        form.reset();
        
        // Reset the button state and toast back to idle after 5 seconds
        setTimeout(() => {
          setFormStatus('idle');
          setShowToast(false);
        }, 5000);
      } else {
        throw new Error('Form submission failed');
      }
    } catch {
      setFormStatus('error');
    }
  };

  return (
    <div className={`relative min-h-screen ${langChanging ? 'lang-transition-active' : ''}`}>
      {/* Background Animated Glow Spheres */}
      <motion.div style={{ y: bgY1 }} className="bg-glow-wrapper" id="ambient-glows">
        <div className="bg-glow-1" />
        <motion.div style={{ y: bgY2 }} className="bg-glow-2" />
      </motion.div>

      {/* Modern Sticky Navigation */}
      <nav className="fixed top-0 left-0 w-full px-[7%] py-4 flex justify-between items-center backdrop-blur-md bg-slate-950/75 border-b border-white/[0.08] z-50">
        <a href="#" className="logo text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-white via-slate-100 to-cyan-400 bg-clip-text text-transparent">
          {T[lang].logo}
        </a>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-10">
          <a href="#services" className="text-slate-300 hover:text-white font-medium transition duration-300">{T[lang].navServices}</a>
          <a href="#portfolio" className="text-slate-300 hover:text-white font-medium transition duration-300">{T[lang].navPortfolio}</a>
          <a href="#pricing" className="text-slate-300 hover:text-white font-medium transition duration-300">{T[lang].navPricing}</a>
          <a href="#testimonials" className="text-slate-300 hover:text-white font-medium transition duration-300">{T[lang].navReviews}</a>
          <a href="#contact" className="text-slate-300 hover:text-white font-medium transition duration-300">{T[lang].navContact}</a>
        </div>

        <div className="hidden lg:flex items-center gap-6">
          <button
            onClick={toggleLang}
            className="group flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.1] hover:bg-white/[0.1] hover:border-cyan-400/50 text-xs font-semibold text-slate-200 transition duration-300 cursor-pointer overflow-hidden min-w-[90px] justify-center"
            id="lang-toggle-desktop"
            title={lang === 'si' ? 'Switch to English' : 'සිංහල භාෂාවට මාරු වන්න'}
            aria-label={lang === 'si' ? 'Switch to English' : 'සිංහල භාෂාවට මාරු වන්න'}
          >
            <i className="fas fa-globe text-cyan-400 group-hover:animate-spin-slow" />
            <AnimatePresence mode="wait">
              <motion.span
                key={lang}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="block"
              >
                {lang === 'si' ? 'English' : 'සිංහල'}
              </motion.span>
            </AnimatePresence>
          </button>
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-white/[0.05] border border-white/[0.1] hover:bg-white/[0.1] hover:border-cyan-400/50 text-slate-200 transition duration-300 cursor-pointer"
            id="theme-toggle-desktop"
            title={theme === 'dark' ? T[lang].themeLight : T[lang].themeDark}
          >
            <i className={theme === 'dark' ? "fas fa-sun text-amber-400" : "fas fa-moon text-indigo-400"} />
          </button>
          <button
            onClick={() => setIsDriveModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.1] hover:bg-white/[0.1] hover:border-amber-400/50 text-xs font-semibold text-slate-200 transition duration-300 cursor-pointer"
            id="drive-backup-desktop"
            title={T[lang].driveBackup}
            aria-label={T[lang].driveBackup}
          >
            <i className="fab fa-google-drive text-amber-400" />
            <span className="hidden xl:inline">{T[lang].driveBackupBtn}</span>
          </button>
          <a href="#contact" className="btn select-none">{T[lang].getStarted}</a>
        </div>

        {/* Mobile Menu Toggle & Lang Toggle */}
        <div className="flex lg:hidden items-center gap-4">
          <button
            onClick={toggleLang}
            className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.1] hover:bg-white/[0.1] text-xs font-semibold text-slate-200 transition duration-300 cursor-pointer overflow-hidden min-w-[70px] justify-center"
            id="lang-toggle-mobile-top"
            title={lang === 'si' ? 'Switch to English' : 'සිංහල භාෂාවට මාරු වන්න'}
            aria-label={lang === 'si' ? 'Switch to English' : 'සිංහල භාෂාවට මාරු වන්න'}
          >
            <i className="fas fa-globe text-cyan-400 group-hover:animate-spin-slow" />
            <AnimatePresence mode="wait">
              <motion.span
                key={lang}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="block"
              >
                {lang === 'si' ? 'EN' : 'සිං'}
              </motion.span>
            </AnimatePresence>
          </button>
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-white/[0.05] border border-white/[0.1] hover:bg-white/[0.1] text-xs text-slate-200 transition duration-300 cursor-pointer"
            id="theme-toggle-mobile-top"
            title={theme === 'dark' ? T[lang].themeLight : T[lang].themeDark}
          >
            <i className={theme === 'dark' ? "fas fa-sun text-amber-400" : "fas fa-moon text-indigo-400"} />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-2xl text-slate-200 hover:text-white focus:outline-none cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            <i className={mobileMenuOpen ? "fas fa-times" : "fas fa-bars"} />
          </button>
        </div>

        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 top-[65px] bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden"
          />
        )}

        {/* Mobile Links Container */}
        <div
          className={`fixed top-[69px] right-0 w-full max-w-[320px] h-[calc(100vh-69px)] nav-links-mobile shadow-2xl flex flex-col gap-6 p-8 border-l border-white/[0.08] z-50 transition-transform duration-300 lg:hidden ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <a
            href="#services"
            onClick={() => setMobileMenuOpen(false)}
            className="text-lg text-slate-300 hover:text-white font-medium py-2 border-b border-white/[0.05]"
          >
            {T[lang].navServices}
          </a>
          <a
            href="#portfolio"
            onClick={() => setMobileMenuOpen(false)}
            className="text-lg text-slate-300 hover:text-white font-medium py-2 border-b border-white/[0.05]"
          >
            {T[lang].navPortfolio}
          </a>
          <a
            href="#pricing"
            onClick={() => setMobileMenuOpen(false)}
            className="text-lg text-slate-300 hover:text-white font-medium py-2 border-b border-white/[0.05]"
          >
            {T[lang].navPricing}
          </a>
          <a
            href="#testimonials"
            onClick={() => setMobileMenuOpen(false)}
            className="text-lg text-slate-300 hover:text-white font-medium py-2 border-b border-white/[0.05]"
          >
            {T[lang].navReviews}
          </a>
          <a
            href="#contact"
            onClick={() => setMobileMenuOpen(false)}
            className="text-lg text-slate-300 hover:text-white font-medium py-2 border-b border-white/[0.05]"
          >
            {T[lang].navContact}
          </a>
          <div className="pt-6 flex flex-col gap-4">
            <button
              onClick={() => {
                toggleLang();
                setMobileMenuOpen(false);
              }}
              className="group flex items-center justify-center gap-1.5 w-full py-3 rounded-full bg-white/[0.05] border border-white/[0.1] text-sm font-semibold text-slate-200 transition duration-300 cursor-pointer overflow-hidden"
              id="lang-toggle-mobile-sidebar"
              aria-label={lang === 'si' ? 'Switch to English' : 'සිංහල භාෂාවට මාරු වන්න'}
            >
              <i className="fas fa-globe text-cyan-400 group-hover:animate-spin-slow" />
              <AnimatePresence mode="wait">
                <motion.span
                  key={lang}
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 10, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="block"
                >
                  {lang === 'si' ? 'Switch to English' : 'සිංහල භාෂාවට මාරු වන්න'}
                </motion.span>
              </AnimatePresence>
            </button>
            <button
              onClick={() => {
                toggleTheme();
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-full bg-white/[0.05] border border-white/[0.1] text-sm font-semibold text-slate-200 transition duration-300 cursor-pointer"
              id="theme-toggle-mobile-sidebar"
            >
              <i className={theme === 'dark' ? "fas fa-sun text-amber-400" : "fas fa-moon text-indigo-400"} />
              <span>{theme === 'dark' ? T[lang].themeLight : T[lang].themeDark}</span>
            </button>
            <button
              onClick={() => {
                setIsDriveModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-full bg-white/[0.05] border border-white/[0.1] text-sm font-semibold text-slate-200 hover:border-amber-400/50 transition duration-300 cursor-pointer"
              id="drive-backup-mobile-sidebar"
            >
              <i className="fab fa-google-drive text-amber-400" />
              <span>{T[lang].driveBackup}</span>
            </button>
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="btn w-full text-center"
            >
              {T[lang].getStarted}
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <motion.section 
        style={{ y: heroY, opacity: heroOpacity }}
        className="min-h-screen flex flex-col lg:flex-row items-center justify-between px-[7%] pt-[140px] pb-16 gap-16"
      >
        <div className="flex-1 text-left">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[70px] leading-[1.1] font-extrabold mb-6 tracking-tight">
            {T[lang].heroTitleLine1}<br />
            <span className="bg-gradient-to-r from-cyan-400 to-indigo-500 bg-clip-text text-transparent">{T[lang].heroTitleGlow}</span> {T[lang].heroTitleLine2}
          </h1>
          <p className="text-slate-300 text-base sm:text-lg sm:leading-[1.8] mb-8 max-w-[650px]">
            {T[lang].heroDesc}
          </p>
          <div className="flex flex-wrap gap-4">
            <a href="#contact" className="btn select-none">
              {T[lang].heroStartBtn}
            </a>
            <a href="#portfolio" className="glass-btn select-none">
              {T[lang].heroViewBtn}
            </a>
          </div>
        </div>

        <div className="flex-1 w-full max-w-lg lg:max-w-none">
          <div className="hero-card animate-float">
            <img
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1200&auto=format&fit=crop"
              alt="Digital Marketing Professional Team"
              className="w-full rounded-2xl object-cover shadow-inner"
              loading="lazy"
            />
          </div>
        </div>
      </motion.section>

      {/* Running Numbers Statistics */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-6 px-[7%] pb-24">
        <StatCounter target={500} suffix="+" label={T[lang].statsClients} />
        <StatCounter target={250} suffix="%" label={T[lang].statsRoi} />
        <StatCounter target={24} suffix="/7" label={T[lang].statsSupport} />
        <StatCounter target={1200} suffix="+" label={T[lang].statsProjects} />
      </section>

      {/* Services Section */}
      <section id="services" className="px-[7%] py-24 border-t border-white/[0.05]">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4">{T[lang].servicesTitle}</h2>
          <p className="text-slate-400 max-w-[700px] mx-auto text-base sm:text-lg">{T[lang].servicesSubtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Object.values(SERVICES_DATA).map((srv, index) => (
            <FadeInView
              key={srv.id}
              delay={`${index * 100}ms`}
              className="service-card group cursor-pointer"
            >
              <div
                onClick={() => setSelectedService(srv)}
                className="service-card-inner h-full p-10 rounded-[30px] bg-white/[0.04] border border-white/[0.08] backdrop-blur-md transition-all duration-500 hover:border-cyan-400 group-hover:-translate-y-3 relative overflow-hidden"
              >
                {/* Glow overlay */}
                <div className="absolute -top-20 -right-20 w-[180px] h-[180px] bg-gradient-to-br from-cyan-400 to-indigo-500 filter blur-[80px] opacity-20 group-hover:opacity-35 transition-opacity" />

                <i className={`${srv.icon} text-4xl mb-6 bg-gradient-to-r from-cyan-400 to-indigo-500 bg-clip-text text-transparent`} />
                <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-cyan-300 transition-colors">{srv.title[lang]}</h3>
                <p className="text-slate-300 line-clamp-3 leading-[1.8] text-sm sm:text-base">{srv.tagline[lang]}</p>
                <div className="inline-flex items-center gap-2 mt-6 text-sm font-semibold text-cyan-400 transition-all group-hover:gap-3">
                  <span>{T[lang].learnMore}</span>
                  <i className="fas fa-arrow-right text-xs group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </FadeInView>
          ))}
        </div>
      </section>

      {/* Featured Projects Portfolio Section */}
      <section id="portfolio" className="px-[7%] py-24 border-t border-white/[0.05]">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4">{T[lang].projectsTitle}</h2>
          <p className="text-slate-400 max-w-[700px] mx-auto text-base sm:text-lg">{T[lang].projectsSubtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FadeInView delay="0ms" className="portfolio-card group relative overflow-hidden rounded-[30px] aspect-video md:aspect-[4/5] cursor-pointer">
            <img
              src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop"
              alt="Luxury Fashion Brand Marketing Campaign"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            />
            {/* Smooth background overlay transition */}
            <div className="portfolio-overlay absolute inset-0 z-10" />
            
            {/* Category badge clearly displayed and styled */}
            <div className="absolute top-6 left-6 z-20 transition-all duration-300">
              <span className="portfolio-badge text-[11px] font-extrabold px-3.5 py-1.5 rounded-full uppercase tracking-widest bg-cyan-500/20 text-cyan-400 border border-cyan-400/30 backdrop-blur-md">
                {T[lang].projectsMarketingCampaign}
              </span>
            </div>

            <div className="absolute inset-x-0 bottom-0 p-8 z-20 flex flex-col justify-end">
              <h3 className="text-2xl font-bold tracking-tight text-white mb-1 group-hover:text-cyan-300 transition-colors duration-300">{T[lang].projectsLuxuryFashion}</h3>
              <p className="text-slate-300 text-sm opacity-80 group-hover:opacity-100 transition-opacity duration-300">{lang === 'si' ? 'සාර්ථක අලෙවිකරණ ව්‍යාපාරයක්' : 'Successful marketing campaign integration.'}</p>
            </div>
          </FadeInView>

          <FadeInView delay="150ms" className="portfolio-card group relative overflow-hidden rounded-[30px] aspect-video md:aspect-[4/5] cursor-pointer">
            <img
              src="https://images.unsplash.com/photo-1556740749-887f6717d7e4?q=80&w=1200&auto=format&fit=crop"
              alt="Fintech Startup UI/UX Design"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            />
            {/* Smooth background overlay transition */}
            <div className="portfolio-overlay absolute inset-0 z-10" />
            
            {/* Category badge clearly displayed and styled */}
            <div className="absolute top-6 left-6 z-20 transition-all duration-300">
              <span className="portfolio-badge text-[11px] font-extrabold px-3.5 py-1.5 rounded-full uppercase tracking-widest bg-cyan-500/20 text-cyan-400 border border-cyan-400/30 backdrop-blur-md">
                {T[lang].projectsUiUxDesign}
              </span>
            </div>

            <div className="absolute inset-x-0 bottom-0 p-8 z-20 flex flex-col justify-end">
              <h3 className="text-2xl font-bold tracking-tight text-white mb-1 group-hover:text-cyan-300 transition-colors duration-300">{T[lang].projectsFintech}</h3>
              <p className="text-slate-300 text-sm opacity-80 group-hover:opacity-100 transition-opacity duration-300">{lang === 'si' ? 'නවීන UI/UX මෘදුකාංග සැලසුම්කරණය' : 'Cutting-edge fintech software experience design.'}</p>
            </div>
          </FadeInView>

          <FadeInView delay="300ms" className="portfolio-card group relative overflow-hidden rounded-[30px] aspect-video md:aspect-[4/5] cursor-pointer">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop"
              alt="Creative Agency Brand Identity"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            />
            {/* Smooth background overlay transition */}
            <div className="portfolio-overlay absolute inset-0 z-10" />
            
            {/* Category badge clearly displayed and styled */}
            <div className="absolute top-6 left-6 z-20 transition-all duration-300">
              <span className="portfolio-badge text-[11px] font-extrabold px-3.5 py-1.5 rounded-full uppercase tracking-widest bg-cyan-500/20 text-cyan-400 border border-cyan-400/30 backdrop-blur-md">
                {T[lang].projectsBrandIdentity}
              </span>
            </div>

            <div className="absolute inset-x-0 bottom-0 p-8 z-20 flex flex-col justify-end">
              <h3 className="text-2xl font-bold tracking-tight text-white mb-1 group-hover:text-cyan-300 transition-colors duration-300">{T[lang].projectsCreativeAgency}</h3>
              <p className="text-slate-300 text-sm opacity-80 group-hover:opacity-100 transition-opacity duration-300">{lang === 'si' ? 'සන්නාම අනන්‍යතාවය සහ නිර්මාණකරණය' : 'Complete visual branding and brand deployment.'}</p>
            </div>
          </FadeInView>
        </div>
      </section>

      {/* Pricing Plans Section */}
      <section id="pricing" className="px-[7%] py-24 border-t border-white/[0.05]">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4">{T[lang].pricingTitle}</h2>
          <p className="text-slate-400 max-w-[700px] mx-auto text-base sm:text-lg">{T[lang].pricingSubtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* Starter Plan */}
          <FadeInView delay="0ms" className="flex">
            <div className="pricing-card-standard w-full p-10 rounded-[30px] bg-white/[0.04] border border-white/[0.08] backdrop-blur-md text-center flex flex-col justify-between transition-all duration-300 hover:-translate-y-2.5 hover:bg-white/[0.06]">
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-slate-200">{T[lang].priceStarter}</h3>
                <div className="my-6">
                  <span className="text-5xl font-extrabold text-white">$99</span>
                </div>
                <ul className="text-left space-y-4 mb-8">
                  <li className="flex items-center gap-3 text-slate-300 py-1.5 border-b border-white/[0.05]">
                    <i className="fas fa-check text-cyan-400 text-xs" />
                    <span>{lang === 'si' ? 'සමාජ මාධ්‍ය සැකසුම්' : 'Social Media Setup'}</span>
                  </li>
                  <li className="flex items-center gap-3 text-slate-300 py-1.5 border-b border-white/[0.05]">
                    <i className="fas fa-check text-cyan-400 text-xs" />
                    <span>{lang === 'si' ? 'මූලික සන්නාමකරණය' : 'Basic Branding'}</span>
                  </li>
                  <li className="flex items-center gap-3 text-slate-300 py-1.5 border-b border-white/[0.05]">
                    <i className="fas fa-check text-cyan-400 text-xs" />
                    <span>{lang === 'si' ? 'දැන්වීම් ව්‍යාපාර 3ක්' : '3 Campaigns'}</span>
                  </li>
                  <li className="flex items-center gap-3 text-slate-300 py-1.5">
                    <i className="fas fa-check text-cyan-400 text-xs" />
                    <span>{lang === 'si' ? 'ඊමේල් සහාය' : 'Email Support'}</span>
                  </li>
                </ul>
              </div>
              <a href="#contact" className="btn w-full select-none text-center block">{T[lang].priceChoosePlan}</a>
            </div>
          </FadeInView>

          {/* Featured Business Plan */}
          <FadeInView delay="150ms" className="flex">
            <div className="pricing-card-featured w-full p-10 rounded-[30px] bg-gradient-to-br from-indigo-600 to-cyan-500 shadow-xl shadow-indigo-900/30 text-center flex flex-col justify-between transition-all duration-300 hover:-translate-y-2.5 relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {T[lang].priceFeatured}
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-white">{T[lang].priceBusiness}</h3>
                <div className="my-6">
                  <span className="text-5xl font-extrabold text-white">$299</span>
                </div>
                <ul className="text-left space-y-4 mb-8">
                  <li className="flex items-center gap-3 text-white/90 py-1.5 border-b border-white/20">
                    <i className="fas fa-check text-white text-xs" />
                    <span>{lang === 'si' ? 'උසස් මට්ටමේ අලෙවිකරණය' : 'Advanced Marketing'}</span>
                  </li>
                  <li className="flex items-center gap-3 text-white/90 py-1.5 border-b border-white/20">
                    <i className="fas fa-check text-white text-xs" />
                    <span>{lang === 'si' ? 'Premium සන්නාමකරණය' : 'Premium Branding'}</span>
                  </li>
                  <li className="flex items-center gap-3 text-white/90 py-1.5 border-b border-white/20">
                    <i className="fas fa-check text-white text-xs" />
                    <span>{lang === 'si' ? 'සීමාවකින් තොර ප්‍රචාරණ' : 'Unlimited Campaigns'}</span>
                  </li>
                  <li className="flex items-center gap-3 text-white/90 py-1.5">
                    <i className="fas fa-check text-white text-xs" />
                    <span>{lang === 'si' ? 'ප්‍රමුඛතා සහාය' : 'Priority Support'}</span>
                  </li>
                </ul>
              </div>
              <a href="#contact" className="glass-btn w-full bg-white/10 border-white/30 hover:bg-white/25 hover:border-white/50 text-white select-none text-center block">{T[lang].priceChoosePlan}</a>
            </div>
          </FadeInView>

          {/* Enterprise Plan */}
          <FadeInView delay="300ms" className="flex">
            <div className="pricing-card-standard w-full p-10 rounded-[30px] bg-white/[0.04] border border-white/[0.08] backdrop-blur-md text-center flex flex-col justify-between transition-all duration-300 hover:-translate-y-2.5 hover:bg-white/[0.06]">
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-slate-200">{T[lang].priceEnterprise}</h3>
                <div className="my-6">
                  <span className="text-5xl font-extrabold text-white">$799</span>
                </div>
                <ul className="text-left space-y-4 mb-8">
                  <li className="flex items-center gap-3 text-slate-300 py-1.5 border-b border-white/[0.05]">
                    <i className="fas fa-check text-cyan-400 text-xs" />
                    <span>{lang === 'si' ? 'AI ක්‍රියාවලි ස්වයංක්‍රීයකරණය' : 'AI Automation'}</span>
                  </li>
                  <li className="flex items-center gap-3 text-slate-300 py-1.5 border-b border-white/[0.05]">
                    <i className="fas fa-check text-cyan-400 text-xs" />
                    <span>{lang === 'si' ? 'පූර්ණ වර්ධන උපාය මාර්ගය' : 'Full Growth Strategy'}</span>
                  </li>
                  <li className="flex items-center gap-3 text-slate-300 py-1.5 border-b border-white/[0.05]">
                    <i className="fas fa-check text-cyan-400 text-xs" />
                    <span>{lang === 'si' ? 'විශේෂිත කණ්ඩායමක්' : 'Dedicated Team'}</span>
                  </li>
                  <li className="flex items-center gap-3 text-slate-300 py-1.5">
                    <i className="fas fa-check text-cyan-400 text-xs" />
                    <span>{lang === 'si' ? '24/7 පාරිභෝගික සහාය' : '24/7 Support'}</span>
                  </li>
                </ul>
              </div>
              <a href="#contact" className="btn w-full select-none text-center block">{T[lang].priceChoosePlan}</a>
            </div>
          </FadeInView>
        </div>
      </section>

      {/* Cost Estimator Section */}
      <section id="estimator" className="px-[7%] py-24 border-t border-white/[0.05]">
        <FadeInView>
          <CostEstimator lang={lang} T={T} />
        </FadeInView>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faq" className="px-[7%] py-24 border-t border-white/[0.05] relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4">{T[lang].faqTitle}</h2>
          <p className="text-slate-400 max-w-[700px] mx-auto text-base sm:text-lg">
            {T[lang].faqSubtitle}
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          {FAQ_DATA.map((item, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <FadeInView key={`faq-${index}`} delay={`${index * 80}ms`}>
                <div 
                  className={`faq-item-card bg-white/[0.03] border rounded-2xl overflow-hidden transition-all duration-300 ${
                    isOpen ? 'border-cyan-500/50 bg-white/[0.05]' : 'border-white/[0.08] hover:border-white/20 hover:bg-white/[0.04]'
                  }`}
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full p-6 text-left flex justify-between items-center gap-4 cursor-pointer focus:outline-none"
                  >
                    <span className="text-base sm:text-lg font-bold text-white pr-4">
                      {item.question[lang]}
                    </span>
                    <span 
                      className={`flex-shrink-0 w-8 h-8 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center transition-transform duration-300 ${
                        isOpen ? 'rotate-180 text-cyan-400' : 'text-slate-400'
                      }`}
                    >
                      <i className="fas fa-chevron-down text-xs" />
                    </span>
                  </button>
                  
                  <div 
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="px-6 pb-6 pt-2 text-slate-300 border-t border-white/[0.05] text-sm sm:text-base leading-[1.8]">
                      {item.answer[lang]}
                    </div>
                  </div>
                </div>
              </FadeInView>
            );
          })}
        </div>
      </section>

      {/* Testimonials Reviews Section */}
      <section id="testimonials" className="px-[7%] py-24 border-t border-white/[0.05]">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4">{T[lang].reviewsTitle}</h2>
          <p className="text-slate-400 max-w-[700px] mx-auto text-base sm:text-lg">{T[lang].reviewsSubtitle}</p>
        </div>

        {/* Rating Block Summary Grid */}
        <FadeInView className="reviews-summary-card grid grid-cols-1 md:grid-cols-3 gap-10 items-center p-8 sm:p-10 bg-white/[0.03] border border-white/[0.08] rounded-3xl backdrop-blur-md mb-12">
          {/* Main Score Card */}
          <div className="text-center md:border-r md:border-white/[0.08] md:pr-10">
            <div className="text-6xl sm:text-7xl font-black bg-gradient-to-r from-cyan-400 to-indigo-500 bg-clip-text text-transparent">
              4.9
            </div>
            <div className="text-slate-400 text-xs sm:text-sm mt-1 uppercase font-semibold tracking-wider">
              {T[lang].reviewsOutOf}
            </div>
            <div className="flex justify-center gap-1.5 mt-4 text-amber-500 text-xl">
              <i className="fas fa-star" />
              <i className="fas fa-star" />
              <i className="fas fa-star" />
              <i className="fas fa-star" />
              <i className="fas fa-star-half-alt" />
            </div>
          </div>

          {/* Rating Micro stats bars */}
          <div className="space-y-3">
            <RatingProgress label="5 ★" percentage={88} count={274} />
            <RatingProgress label="4 ★" percentage={9} count={28} />
            <RatingProgress label="3 ★" percentage={2} count={7} />
            <RatingProgress label="2 ★" percentage={1} count={3} />
            <RatingProgress label="1 ★" percentage={0} count={0} />
          </div>

          {/* Rating platforms */}
          <div className="flex flex-col gap-4 md:border-l md:border-white/[0.08] md:pl-10 text-sm sm:text-base">
            <div className="flex items-center gap-3">
              <i className="fab fa-google text-red-500 w-6 text-center text-lg" />
              <span className="text-slate-200 font-semibold">Google</span>
              <div className="flex gap-0.5 text-xs text-amber-500 ml-2">
                <i className="fas fa-star" /><i className="fas fa-star" /><i className="fas fa-star" /><i className="fas fa-star" /><i className="fas fa-star" />
              </div>
              <span className="text-amber-500 font-bold ml-auto">4.9</span>
            </div>
            <div className="flex items-center gap-3">
              <i className="fab fa-facebook-f text-blue-500 w-6 text-center text-lg" />
              <span className="text-slate-200 font-semibold">Facebook</span>
              <div className="flex gap-0.5 text-xs text-amber-500 ml-2">
                <i className="fas fa-star" /><i className="fas fa-star" /><i className="fas fa-star" /><i className="fas fa-star" /><i className="fas fa-star" />
              </div>
              <span className="text-amber-500 font-bold ml-auto">5.0</span>
            </div>
            <div className="flex items-center gap-3">
              <i className="fab fa-instagram text-pink-500 w-6 text-center text-lg" />
              <span className="text-slate-200 font-semibold">Instagram</span>
              <div className="flex gap-0.5 text-xs text-amber-500 ml-2">
                <i className="fas fa-star" /><i className="fas fa-star" /><i className="fas fa-star" /><i className="fas fa-star" /><i className="fas fa-star" />
              </div>
              <span className="text-amber-500 font-bold ml-auto">4.8</span>
            </div>
          </div>
        </FadeInView>

        {/* Swipe Carousel for Reviews */}
        <div className="relative group/carousel">
          {/* Gradient fade edge covers */}
          <div className="absolute top-0 bottom-0 left-0 w-16 bg-gradient-to-r from-[#020617] to-transparent z-10 pointer-events-none" />
          <div className="absolute top-0 bottom-0 right-0 w-16 bg-gradient-to-l from-[#020617] to-transparent z-10 pointer-events-none" />

          <div
            ref={reviewsTrackRef}
            onScroll={handleReviewsScroll}
            className="reviews-track flex gap-6 overflow-x-auto py-5 px-1.5 snap-x snap-mandatory no-scrollbar"
          >
            {REVIEWS_DATA.map((rev, idx) => (
              <div
                key={idx}
                className="review-card-item review-card flex-shrink-0 w-[300px] sm:w-[340px] bg-white/[0.04] border border-white/[0.09] p-8 sm:p-9 rounded-[28px] snap-start flex flex-col justify-between gap-6 transition-all duration-300 hover:border-cyan-500/30 hover:bg-white/[0.07] hover:-translate-y-2 relative"
              >
                {/* Visual quote mark */}
                <div className="absolute top-4 right-6 text-7xl font-serif bg-gradient-to-r from-cyan-400 to-indigo-500 bg-clip-text text-transparent opacity-20 pointer-events-none select-none">
                  “
                </div>

                <div className="space-y-4">
                  {/* Review Stars */}
                  <div className="flex gap-0.5 text-amber-500 text-sm">
                    {Array.from({ length: 5 }).map((_, sIdx) => (
                      <i key={sIdx} className="fas fa-star" />
                    ))}
                  </div>

                  {/* Review Service Tag */}
                  <span className="inline-block text-[11px] font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300">
                    {rev.tag[lang]}
                  </span>

                  {/* Review Body */}
                  <p className="text-slate-300 text-sm sm:text-[15px] leading-[1.8]">
                    {rev.body[lang]}
                  </p>
                </div>

                {/* Review footer - Platform indicator and Author details */}
                <div className="border-t border-white/[0.07] pt-5 mt-auto">
                  <div className="flex items-center gap-1 text-slate-400 text-xs font-semibold mb-3">
                    {rev.platform === 'google' && <i className="fab fa-google text-red-500 mr-1" />}
                    {rev.platform === 'facebook' && <i className="fab fa-facebook-f text-blue-500 mr-1" />}
                    {rev.platform === 'instagram' && <i className="fab fa-instagram text-pink-500 mr-1" />}
                    <span>{T[lang].reviewsPostedOn} {rev.platform.charAt(0).toUpperCase() + rev.platform.slice(1)}</span>
                  </div>

                  <div className="flex items-center gap-3.5">
                    <div
                      style={{ background: rev.avatarBg }}
                      className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-base text-white shadow-md flex-shrink-0"
                    >
                      {rev.initials}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm sm:text-base">{rev.reviewerName}</h4>
                      <p className="text-slate-400 text-xs mt-0.5 line-clamp-1">{rev.reviewerMeta[lang]}</p>
                      <div className="flex items-center gap-1 text-emerald-400 text-[10px] font-semibold mt-1">
                        <i className="fas fa-circle-check text-[9px]" />
                        <span>{T[lang].reviewsVerifiedClient}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Carousel Clickable Dots navigation */}
        <div className="scroll-dots flex justify-center gap-2 mt-6">
          {REVIEWS_DATA.map((_, idx) => (
            <button
              key={idx}
              onClick={() => scrollToReview(idx)}
              className={`h-2 rounded-full cursor-pointer transition-all duration-300 focus:outline-none ${
                activeReviewIndex === idx
                  ? 'w-7 bg-gradient-to-r from-cyan-400 to-indigo-500'
                  : 'w-2 bg-white/15'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-[7%] my-24">
        <div className="p-12 sm:p-20 bg-gradient-to-r from-indigo-600 to-cyan-500 rounded-[40px] text-center shadow-xl shadow-cyan-950/20">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">
            {T[lang].ctaTitle}
          </h2>
          <p className="text-white/85 text-base sm:text-lg sm:leading-[1.8] max-w-2xl mx-auto mb-8">
            {T[lang].ctaDesc}
          </p>
          <a href="#contact" className="glass-btn inline-block bg-white/10 hover:bg-white/20 hover:border-white/40 text-white select-none">
            {T[lang].ctaStartBtn}
          </a>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="px-[7%] py-24 border-t border-white/[0.05]">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4">{T[lang].contactTitle}</h2>
          <p className="text-slate-400 max-w-[700px] mx-auto text-base sm:text-lg">{T[lang].contactSubtitle}</p>
        </div>

        <FadeInView className="contact-form-card max-w-[700px] mx-auto bg-white/[0.03] border border-white/[0.08] p-8 sm:p-12 rounded-[30px] backdrop-blur-md">
          <form id="contactForm" onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  name="name"
                  placeholder={T[lang].contactNamePlaceholder}
                  required
                  className="w-full p-4 bg-white/10 border border-white/5 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-400 focus:bg-white/[0.12] transition-all text-sm md:text-base"
                />
              </div>
              <div>
                <input
                  type="email"
                  name="email"
                  placeholder={T[lang].contactEmailPlaceholder}
                  required
                  className="w-full p-4 bg-white/10 border border-white/5 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-400 focus:bg-white/[0.12] transition-all text-sm md:text-base"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  type="tel"
                  name="phone"
                  placeholder={T[lang].contactPhonePlaceholder}
                  required
                  className="w-full p-4 bg-white/10 border border-white/5 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-400 focus:bg-white/[0.12] transition-all text-sm md:text-base"
                />
              </div>
              <div>
                <select
                  name="companySize"
                  defaultValue=""
                  className="w-full p-4 bg-white/10 border border-white/5 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-400 focus:bg-white/[0.12] transition-all text-sm md:text-base appearance-none cursor-pointer"
                  style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'white\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1em' }}
                >
                  <option value="" disabled hidden>{T[lang].contactCompanySize}</option>
                  <option value="1-10" className="bg-slate-800">1 - 10</option>
                  <option value="11-50" className="bg-slate-800">11 - 50</option>
                  <option value="51-200" className="bg-slate-800">51 - 200</option>
                  <option value="200+" className="bg-slate-800">200+</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <select
                  name="serviceInterest"
                  defaultValue=""
                  className="w-full p-4 bg-white/10 border border-white/5 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-400 focus:bg-white/[0.12] transition-all text-sm md:text-base appearance-none cursor-pointer"
                  style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'white\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1em' }}
                >
                  <option value="" disabled hidden>{T[lang].contactServiceInterest}</option>
                  <option value="Web Development" className="bg-slate-800">Web Development</option>
                  <option value="Branding" className="bg-slate-800">Branding & Strategy</option>
                  <option value="Digital Marketing" className="bg-slate-800">Digital Marketing</option>
                  <option value="Social Media" className="bg-slate-800">Social Media Management</option>
                  <option value="Full Package" className="bg-slate-800">Full Business Package</option>
                </select>
              </div>
              <div>
                <select
                  name="budget"
                  defaultValue=""
                  className="w-full p-4 bg-white/10 border border-white/5 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-400 focus:bg-white/[0.12] transition-all text-sm md:text-base appearance-none cursor-pointer"
                  style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'white\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1em' }}
                >
                  <option value="" disabled hidden>{T[lang].contactBudget}</option>
                  <option value="< 100k" className="bg-slate-800">LKR &lt; 100K</option>
                  <option value="100k - 500k" className="bg-slate-800">LKR 100K - 500K</option>
                  <option value="> 500k" className="bg-slate-800">LKR 500K+</option>
                </select>
              </div>
            </div>

            <div>
              <textarea
                name="message"
                placeholder={T[lang].contactDescPlaceholder}
                rows={4}
                className="w-full p-4 bg-white/10 border border-white/5 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-400 focus:bg-white/[0.12] transition-all resize-none text-sm md:text-base"
              />
            </div>

            <div className="pt-4">
              {formStatus === 'sending' && (
                <button
                  type="submit"
                  disabled
                  className="btn w-full text-center py-4 select-none opacity-80 cursor-not-allowed cursor-wait"
                >
                  {T[lang].contactSending}
                </button>
              )}

              {formStatus === 'idle' && (
                <button
                  type="submit"
                  className="btn w-full text-center py-4 select-none cursor-pointer"
                >
                  {T[lang].contactSubmit}
                </button>
              )}

              {formStatus === 'success' && (
                <button
                  type="button"
                  disabled
                  className="w-full text-center py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-full select-none cursor-not-allowed"
                >
                  {T[lang].contactSuccess}
                </button>
              )}

              {formStatus === 'error' && (
                <button
                  type="submit"
                  className="w-full text-center py-4 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-semibold rounded-full select-none cursor-pointer"
                >
                  {T[lang].contactError}
                </button>
              )}
            </div>
          </form>
        </FadeInView>
      </section>

      {/* Footer Area */}
      <footer className="px-[7%] py-16 border-t border-white/[0.08] text-center text-slate-400">
        <h2 className="logo-footer-glow text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-white to-cyan-400 bg-clip-text text-transparent">
          {T[lang].logo}
        </h2>
        <div className="flex justify-center gap-5 my-8">
          <a
            href="#"
            className="w-12 h-12 rounded-full bg-white/[0.05] hover:bg-gradient-to-r hover:from-indigo-600 hover:to-cyan-400 hover:text-white flex items-center justify-center text-slate-200 transition-all duration-300 hover:scale-110"
            aria-label="Facebook link"
          >
            <i className="fab fa-facebook-f" />
          </a>
          <a
            href="#"
            className="w-12 h-12 rounded-full bg-white/[0.05] hover:bg-gradient-to-r hover:from-indigo-600 hover:to-cyan-400 hover:text-white flex items-center justify-center text-slate-200 transition-all duration-300 hover:scale-110"
            aria-label="Instagram link"
          >
            <i className="fab fa-instagram" />
          </a>
          <a
            href="#"
            className="w-12 h-12 rounded-full bg-white/[0.05] hover:bg-gradient-to-r hover:from-indigo-600 hover:to-cyan-400 hover:text-white flex items-center justify-center text-slate-200 transition-all duration-300 hover:scale-110"
            aria-label="Tiktok link"
          >
            <i className="fab fa-tiktok" />
          </a>
          <a
            href="#"
            className="w-12 h-12 rounded-full bg-white/[0.05] hover:bg-gradient-to-r hover:from-indigo-600 hover:to-cyan-400 hover:text-white flex items-center justify-center text-slate-200 transition-all duration-300 hover:scale-110"
            aria-label="LinkedIn link"
          >
            <i className="fab fa-linkedin-in" />
          </a>
        </div>
        <p className="text-xs md:text-sm">{T[lang].footerReserved}</p>
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => setIsDriveModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-medium text-slate-300 hover:text-white transition-all cursor-pointer"
            id="footer-drive-backup"
          >
            <i className="fab fa-google-drive text-amber-400" />
            <span>{T[lang].driveBackup}</span>
          </button>
        </div>
      </footer>

      {/* Floating Service Details Modal */}
      {selectedService && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedService(null);
            }
          }}
          className="modal-wrapper fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-[9999] transition-opacity duration-300 opacity-100"
        >
          <div className="modal-content-box bg-slate-900 border border-white/[0.12] rounded-[32px] p-8 md:p-12 max-w-[700px] w-full max-h-[90vh] overflow-y-auto relative shadow-2xl relative translate-y-0 scale-100 transition-all">
            {/* Close Close modal action buttons */}
            <button
              onClick={() => setSelectedService(null)}
              className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/[0.08] hover:bg-white/[0.16] border border-white/[0.12] text-white flex items-center justify-center transition-all cursor-pointer hover:rotate-90"
              aria-label="Close modal dialog"
            >
              <i className="fas fa-times" />
            </button>

            {/* Modal layout content */}
            <div className="text-4xl text-cyan-400 mb-6 font-semibold">
              <i className={selectedService.icon} />
            </div>

            <h2 className="text-2xl md:text-3xl font-extrabold mb-4 text-white">
              {selectedService.title[lang]}
            </h2>

            <p className="text-slate-400 text-sm md:text-base leading-[1.8] mb-6 border-b border-white/[0.08] pb-6">
              {selectedService.tagline[lang]}
            </p>

            {/* Estimated Project Completion Time & Animated Progress Bars */}
            <div className="modal-delivery-card rounded-2xl p-5 mb-8">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-lg shadow-sm">
                    <i className={selectedService.deliveryTime.icon} />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 block modal-delivery-sub">
                      {T[lang].modalEstimatedDelivery}
                    </span>
                    <div className="text-xl font-bold text-white flex items-center gap-2 modal-delivery-title mt-0.5">
                      <span>{selectedService.deliveryTime.durationText[lang]}</span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-cyan-400/10 text-cyan-300 border border-cyan-400/20">
                        {selectedService.deliveryTime.badge[lang]}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-right">
                  <div>
                    <span className="text-[11px] text-slate-400 block modal-delivery-sub">
                      {T[lang].modalAvgReadiness}
                    </span>
                    <span className="text-sm font-bold text-emerald-400 flex items-center justify-end gap-1">
                      <i className="fas fa-gauge-high text-xs" />
                      {selectedService.deliveryTime.velocity}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Master Animated Progress Bar */}
              <div className="mb-5">
                <div className="flex justify-between items-center text-xs text-slate-400 mb-1.5 modal-delivery-sub">
                  <span>{T[lang].modalEstimatedTimeline}</span>
                  <span className="font-semibold text-cyan-400">{selectedService.deliveryTime.velocity}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full modal-track-bg overflow-hidden p-0.5 border border-white/[0.08]">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-emerald-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${selectedService.deliveryTime.velocity}%` }}
                    transition={{ duration: 0.9, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Phase Milestones Breakdown */}
              <div className="space-y-3 pt-3 border-t border-white/[0.08]">
                <div className="text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-2 modal-delivery-sub">
                  {T[lang].modalMilestonePhases}
                </div>
                {selectedService.deliveryTime.phases.map((phase, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-300 font-medium flex items-center gap-1.5 modal-phase-name">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                        {phase.name[lang]}
                      </span>
                      <span className="text-slate-400 text-[11px] font-mono modal-phase-time">
                        {phase.time[lang]}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full modal-phase-track overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${phase.progress}%` }}
                        transition={{ duration: 0.7, delay: 0.15 * (idx + 1), ease: "easeOut" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* What is included checklist */}
            <div className="mb-6">
              <h4 className="text-xs md:text-sm font-bold tracking-wider uppercase text-cyan-400 mb-3 block">
                {T[lang].modalWhat}
              </h4>
              <ul className="space-y-2">
                {selectedService.what[lang].map((item, idx) => (
                  <li key={idx} className="flex gap-2.5 text-slate-300 text-sm sm:text-base text-left">
                    <span className="text-cyan-400 font-bold">→</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <hr className="border-white/[0.08] my-6" />

            {/* Opportunities catalog */}
            <div className="mb-6">
              <h4 className="text-xs md:text-sm font-bold tracking-wider uppercase text-cyan-400 mb-3 block">
                {T[lang].modalOpp}
              </h4>
              <ul className="space-y-2">
                {selectedService.opportunities[lang].map((item, idx) => (
                  <li key={idx} className="flex gap-2.5 text-slate-300 text-sm sm:text-base text-left">
                    <span className="text-cyan-400 font-bold">→</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <hr className="border-white/[0.08] my-6" />

            {/* Assumptions catalog & requirements list */}
            <div className="mb-8">
              <h4 className="text-xs md:text-sm font-bold tracking-wider uppercase-custom text-cyan-400 mb-3 block">
                {T[lang].modalAssumptions}
              </h4>
              <ul className="space-y-2">
                {selectedService.assumptions[lang].map((item, idx) => (
                  <li key={idx} className="flex gap-2.5 text-slate-400 text-sm sm:text-base text-left">
                    <span className="text-slate-500 font-bold">~</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA interaction buttons */}
            <div className="flex flex-wrap gap-4 mt-8">
              <a
                href="#contact"
                onClick={() => setSelectedService(null)}
                className="btn flex-1 text-center select-none"
              >
                {T[lang].getStarted}
              </a>
              <a
                href={`https://wa.me/94765865387?text=${encodeURIComponent(lang === 'si' ? `මම ${selectedService.title['si']} සේවාව පිළිබඳව දැනගැනීමට කැමතියි.` : `I'm interested in learning more about the ${selectedService.title['en']} service.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-btn flex-1 text-center select-none"
              >
                {T[lang].modalChat}
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Floating Scroll to Top button */}
      <button
        onClick={handleScrollToTop}
        className={`fixed bottom-6 right-6 w-12 h-12 rounded-full flex items-center justify-center text-white bg-slate-900/85 hover:bg-slate-800 border border-white/20 hover:border-cyan-400 hover:text-cyan-400 backdrop-blur-md shadow-2xl z-40 transition-all duration-300 cursor-pointer ${
          showScrollTop ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-75 pointer-events-none'
        }`}
        aria-label={T[lang].scrollToTop}
        title={T[lang].scrollToTop}
        id="scroll-to-top-btn"
      >
        <i className="fas fa-chevron-up text-lg" />
      </button>

      {/* Success Toast Banner */}
      <div 
        className={`fixed top-24 right-4 md:right-8 z-[100] max-w-sm w-full bg-slate-900 border border-green-500/50 shadow-2xl shadow-green-900/20 rounded-2xl flex items-center p-4 gap-4 transition-all duration-500 ease-out flex-row select-none pointer-events-none transform ${
          showToast ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'
        }`}
      >
        <div className="flex-shrink-0 w-10 h-10 bg-green-500/20 rounded-full flex justify-center items-center text-green-400 text-xl">
          <i className="fas fa-check"></i>
        </div>
        <div className="flex-1">
          <h4 className="text-white font-bold text-sm">{lang === 'si' ? 'පණිවිඩය සාර්ථකව යැවිණි' : 'Message Sent Successfully!'}</h4>
          <p className="text-slate-300 text-xs mt-0.5">{lang === 'si' ? 'අපි ඉක්මනින් ඔබව සම්බන්ධ කරගන්නෙමු.' : 'We will get back to you soon.'}</p>
        </div>
      </div>

      {/* Google Drive Backup / Export Modal */}
      <GoogleDriveBackupModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
        lang={lang}
      />
    </div>
  );
}
