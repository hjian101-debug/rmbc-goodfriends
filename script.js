const header = document.querySelector("[data-header]");
const menuButton = document.querySelector("[data-menu-button]");
const mobileNav = document.querySelector("[data-mobile-nav]");
const year = document.querySelector("[data-year]");
const languageToggle = document.querySelector("[data-language-toggle]");
const announcementSection = document.querySelector("[data-announcements-section]");
const announcementList = document.querySelector("[data-announcement-list]");
const announcementPrevious = document.querySelector("[data-announcement-previous]");
const announcementNext = document.querySelector("[data-announcement-next]");
const gatheringsLayout = document.querySelector("[data-gatherings-layout]");
const eventGrid = document.querySelector("[data-event-grid]");
const scripturePanel = document.querySelector("[data-scripture-panel]");
const gallerySection = document.querySelector("[data-gallery-section]");
const galleryGrid = document.querySelector("[data-gallery-grid]");
const galleryLinks = document.querySelectorAll("[data-gallery-link]");
const teamGrid = document.querySelector("[data-team-grid]");
const studyDirectory = document.querySelector("[data-study-directory]");
const studiesList = document.querySelector("[data-studies-list]");
const photoCategoryList = document.querySelector("[data-photo-category-list]");
const eventPosterModal = document.querySelector("[data-event-poster-modal]");
const eventPosterClose = document.querySelector("[data-event-poster-close]");
const eventPosterWebsite = document.querySelector("[data-event-poster-website]");

let eventPosterPreviousFocus = null;

const closeEventPosterModal = () => {
  if (!eventPosterModal || eventPosterModal.hidden) return;
  eventPosterModal.hidden = true;
  document.body.classList.remove("event-poster-modal-open");
  if (eventPosterPreviousFocus instanceof HTMLElement && eventPosterPreviousFocus !== document.body) {
    eventPosterPreviousFocus.focus({ preventScroll: true });
  }
};

const initEventPosterModal = () => {
  if (!eventPosterModal) return;
  eventPosterPreviousFocus = document.activeElement;
  eventPosterModal.hidden = false;
  document.body.classList.add("event-poster-modal-open");
  window.requestAnimationFrame(() => eventPosterClose?.focus({ preventScroll: true }));
};

eventPosterClose?.addEventListener("click", closeEventPosterModal);
eventPosterWebsite?.addEventListener("click", closeEventPosterModal);
eventPosterModal?.addEventListener("click", (event) => {
  if (event.target === eventPosterModal) {
    closeEventPosterModal();
  }
});

const adminStorageKey = "rmbc-admin-content";
const fellowshipContactEmail = "rmbctyler@yahoo.com";
const supabaseConfig = window.RMBC_SUPABASE_CONFIG || {};
const studiesSheetConfig = supabaseConfig.studiesSheet || {};
let supabaseClient = null;
let remoteContent = null;
let sheetStudies = null;

const siteSectionOptions = [
  { id: "quick" },
  { id: "announcements" },
  { id: "about" },
  { id: "gatherings" },
  { id: "gallery" },
  { id: "team", defaultVisible: false },
  { id: "visit" },
  { id: "contact" },
];
const defaultSiteSections = Object.fromEntries(
  siteSectionOptions.map(({ id, defaultVisible = true }) => [id, defaultVisible]),
);

const defaultContent = {
  siteSections: defaultSiteSections,
  announcements: [
    {
      id: "welcome",
      active: true,
      pinned: false,
      date: "2026-05-11",
      title: {
        zh: "欢迎来到好朋友团契",
        en: "Welcome to Good Friends Fellowship",
      },
      body: {
        zh: "如果你是第一次来，可以直接参加周五 6:00 PM 的团契查经。",
        en: "If this is your first visit, you are welcome to join Friday Bible study at 6:00 PM.",
      },
    },
  ],
  gatherings: [
    {
      id: "friday-bible-study",
      active: true,
      day: { zh: "周五", en: "Friday" },
      title: { zh: "团契查经", en: "Fellowship Bible Study" },
      description: {
        zh: "诗歌、晚餐、查经与分组分享。第一次来的朋友可以直接来，不需要准备。",
        en: "Worship, dinner, Bible study, and group sharing. First-time visitors are welcome to come as they are.",
      },
      time: { zh: "6:00 PM", en: "6:00 PM" },
      location: {
        zh: "Crest Community Church, 3431 Mt Vernon Ave, Riverside, CA 92507",
        en: "Crest Community Church, 3431 Mt Vernon Ave, Riverside, CA 92507",
      },
      scripture: { zh: "", en: "" },
    },
    {
      id: "sunday-worship",
      active: true,
      day: { zh: "周日", en: "Sunday" },
      title: { zh: "主日崇拜", en: "Sunday Worship" },
      description: {
        zh: "欢迎与我们一同敬拜，也可以在崇拜后留下来认识新朋友。",
        en: "Join us for worship, and feel free to stay afterward to meet new friends.",
      },
      time: { zh: "10:00-11:20 AM", en: "10:00-11:20 AM" },
      location: {
        zh: "RMBC, 4889 Tyler Street, Riverside, CA 92503",
        en: "RMBC, 4889 Tyler Street, Riverside, CA 92503",
      },
      liveTime: { zh: "主日直播 9:50 AM", en: "Livestream starts at 9:50 AM" },
      liveUrl: "http://tiny.cc/RMBC",
      scripture: { zh: "", en: "" },
    },
  ],
  studies: [
    {
      id: "john-3-16",
      active: true,
      date: "2026-05-29",
      title: { zh: "神爱世人", en: "For God So Loved The World" },
      passage: { zh: "约翰福音 3:16", en: "John 3:16" },
      scripture: {
        zh: "神爱世人，甚至将他的独生子赐给他们，叫一切信他的，不至灭亡，反得永生。",
        en: "For God so loved the world that he gave his only Son, that whoever believes in him should not perish but have eternal life.",
      },
      summary: {
        zh: "我们一起思想神主动的爱、信心的回应，以及福音带来的盼望。",
        en: "We reflected on God's initiating love, the response of faith, and the hope of the gospel.",
      },
    },
  ],
  gallery: [
    {
      id: "meme-friday",
      active: true,
      image: "./assets/photos/meme-friday.svg",
      category: "fellowship",
      title: { zh: "周五干饭预备", en: "Friday Dinner Ready" },
      caption: {
        zh: "临时表情包：真实聚会照片确认后再替换。",
        en: "Temporary meme card until real fellowship photos are approved.",
      },
      alt: { zh: "周五团契晚餐表情包插画", en: "Friday fellowship dinner meme illustration" },
    },
    {
      id: "meme-study",
      active: true,
      image: "./assets/photos/meme-study.svg",
      category: "fellowship",
      title: { zh: "查经脑洞打开", en: "Study Mode On" },
      caption: {
        zh: "带着问题来，也带着一点点周五晚上的精神状态。",
        en: "Bring questions, curiosity, and a very Friday-night brain.",
      },
      alt: { zh: "查经模式表情包插画", en: "Bible study mode meme illustration" },
    },
    {
      id: "meme-prayer",
      active: true,
      image: "./assets/photos/meme-prayer.svg",
      category: "fellowship",
      title: { zh: "祷告中，请稍等", en: "BRB Praying" },
      caption: {
        zh: "人生加载慢一点也没关系，我们一起祷告。",
        en: "Life can load slowly; we can pray together while it does.",
      },
      alt: { zh: "祷告中表情包插画", en: "Prayer pause meme illustration" },
    },
    {
      id: "meme-welcome",
      active: true,
      image: "./assets/photos/meme-welcome.svg",
      category: "activity",
      title: { zh: "新朋友雷达启动", en: "Welcome Radar On" },
      caption: {
        zh: "第一次来不用紧张，接待同工已经上线。",
        en: "First visit nerves are normal; the welcome team is online.",
      },
      alt: { zh: "欢迎新朋友表情包插画", en: "Welcome radar meme illustration" },
    },
  ],
  photoCategoryDescriptions: {
    fellowship: { zh: "", en: "" },
    activity: { zh: "", en: "" },
  },
  team: [
    {
      id: "prayer-care",
      active: true,
      name: { zh: "代祷关怀", en: "Prayer And Care" },
      role: { zh: "关怀同工", en: "Care Team" },
      bio: {
        zh: "关心新朋友与团契成员近况，安排探访和代祷。",
        en: "Cares for newcomers and fellowship members through prayer, follow-up, and visits.",
      },
      contact: fellowshipContactEmail,
      avatar: "./assets/avatar-prayer.svg",
    },
    {
      id: "bible-study",
      active: true,
      name: { zh: "查经带领", en: "Bible Study Leaders" },
      role: { zh: "查经同工", en: "Bible Study Team" },
      bio: {
        zh: "预备每周查经内容，带领小组讨论和回应。",
        en: "Prepares weekly Bible study and leads small-group discussion and response.",
      },
      contact: fellowshipContactEmail,
      avatar: "./assets/avatar-study.svg",
    },
    {
      id: "welcome-team",
      active: true,
      name: { zh: "新朋友接待", en: "Welcome Team" },
      role: { zh: "接待同工", en: "Welcome Team" },
      bio: {
        zh: "协助确认聚会地点、接送安排和第一次来访信息。",
        en: "Helps confirm gathering locations, rides, and first-visit details.",
      },
      contact: fellowshipContactEmail,
      avatar: "./assets/avatar-welcome.svg",
    },
  ],
};

const photoCategories = [
  { id: "fellowship", title: { zh: "团契聚会", en: "Fellowship Gatherings" } },
  { id: "activity", title: { zh: "活动日", en: "Activity Days" } },
];
const placeholderPhotoTitles = new Set(["团契照片", "Fellowship Photo"]);
const galleryCardVariants = [
  { className: "is-wide", width: 430 },
  { className: "is-medium", width: 330 },
  { className: "is-large", width: 420 },
  { className: "is-small", width: 260 },
  { className: "is-medium", width: 330 },
  { className: "is-wide", width: 430 },
];
const galleryAutoScrollSpeed = 24;
let galleryAutoScrollFrame = 0;
let galleryAutoScrollController = null;
let galleryScrollbarHideTimer = 0;
let photoLightbox = null;
let photoLightboxPreviousFocus = null;
let selectedStudyYear = "";
let selectedStudyMonth = "";

const normalizePhotoCategoryDescriptions = (value) => Object.fromEntries(
  photoCategories.map((category) => [
    category.id,
    localDescriptionValue(value?.[category.id]),
  ]),
);

const normalizeSiteSections = (value) => Object.fromEntries(
  siteSectionOptions.map(({ id }) => [
    id,
    value && Object.prototype.hasOwnProperty.call(value, id)
      ? value[id] !== false
      : defaultSiteSections[id] !== false,
  ]),
);

const isSiteSectionVisible = (sections, id) => sections?.[id] !== false;

const syncSiteSectionVisibility = (sections) => {
  document.querySelectorAll("[data-site-section]").forEach((section) => {
    section.hidden = !isSiteSectionVisible(sections, section.dataset.siteSection);
  });

  document.querySelectorAll("[data-section-link]").forEach((link) => {
    link.hidden = !isSiteSectionVisible(sections, link.dataset.sectionLink);
  });
};

const translations = {
  zh: {
    "meta.description": "RMBC 好朋友团契是 Riverside 华人教会河滨国语浸信会的青年与家庭团契，欢迎 UCR 学生、Riverside 职场、家庭和朋友参加周五中文查经、晚餐、祷告和周日礼拜。",
    "page.title": "RMBC 好朋友团契 | UCR Riverside 华人教会中文查经与 Good Friends Fellowship",
    "studies.pageTitle": "过去查经内容 | RMBC 好朋友团契 UCR Riverside",
    "photos.pageTitle": "精彩瞬间 | RMBC 好朋友团契",
    "brand.subtitle": "好朋友团契",
    "nav.about": "关于",
    "nav.gatherings": "聚会",
    "nav.studies": "查经归档",
    "nav.gallery": "照片",
    "nav.team": "同工",
    "nav.visit": "来访",
    "nav.contact": "联系",
    "hero.eyebrow": "河滨国语浸信会 Riverside Mandarin Baptist Church",
    "hero.title": "好朋友团契",
    "hero.copy": "好朋友团契是 RMBC 河滨国语浸信会的 Riverside 华人教会团契，欢迎 UCR 学生、职场、家庭和刚到 Riverside 的朋友。我们相信信仰不只是周末的安排，也是平日里有人听你说话、为你祷告、与你一起成长。",
    "hero.contactHost": "第一次来？联系接待同工",
    "quick.timeLabel": "聚会时间",
    "quick.time": "周五 6:00 PM / 周日 10:00 AM",
    "quick.locationLabel": "地点",
    "quick.location": "周五 Crest Community Church / 周日 RMBC 4889 Tyler St",
    "quick.audienceLabel": "适合对象",
    "quick.audience": "学生、职场、家庭、朋友",
    "about.title": "一个可以慢慢熟起来的地方",
    "about.copy": "在 Riverside 和 UCR 附近一起吃饭、中文查经、祷告，也一起把日子过得更有盼望。",
    "features.studyTitle": "查经与分享",
    "features.studyCopy": "用圣经回应真实生活，在轻松的对话中认识神的话。",
    "features.dinnerTitle": "晚餐与陪伴",
    "features.dinnerCopy": "一顿饭常常是关系的开始，也让忙碌的一周有个落脚点。",
    "features.prayerTitle": "祷告与关怀",
    "features.prayerCopy": "无论是学业、工作、家庭或方向，我们一起带到神面前。",
    "gatherings.title": "近期聚会",
    "gatherings.friday": "周五",
    "gatherings.sunday": "周日",
    "gatherings.bibleStudyTitle": "团契查经",
    "gatherings.bibleStudyCopy": "诗歌、晚餐、查经与分组分享。第一次来的朋友可以直接来，不需要准备。",
    "gatherings.scriptureLabel": "本周经文：",
    "gatherings.scriptureTitle": "本周经文",
    "gatherings.rhythmTitle": "聚会流程",
    "gatherings.rhythmDinner": "晚餐",
    "gatherings.rhythmStudy": "查经",
    "gatherings.rhythmShare": "分享",
    "gatherings.rhythmPrayer": "祷告",
    "gatherings.rhythmLivestream": "直播 9:50",
    "gatherings.rhythmWorship": "崇拜 10:00",
    "gatherings.rhythmDismissal": "结束 11:20",
    "gatherings.worshipTitle": "主日崇拜",
    "gatherings.worshipCopy": "欢迎与我们一同敬拜，也可以在崇拜后留下来认识新朋友。",
    "gatherings.liveLabel": "主日直播",
    "announcements.title": "团契公告",
    "announcements.pinned": "置顶",
    "gallery.title": "团契照片",
    "gallery.hint": "可左右滑动查看更多照片",
    "gallery.moments": "📸 精彩瞬间",
    "photos.title": "精彩瞬间",
    "photos.copy": "按团契聚会和活动日整理照片，回看一起走过的时间。",
    "photos.backToWall": "返回照片墙",
    "photos.empty": "还没有上传照片。",
    "studies.title": "过去查经内容",
    "studies.copy": "这里会整理 RMBC 好朋友团契过去中文查经的经文、主题和重点。",
    "studies.empty": "还没有归档的查经内容。",
    "studies.back": "返回首页",
    "studies.notes": "查经重点",
    "studies.directory": "分类目录",
    "studies.year": "年份",
    "studies.month": "月份",
    "studies.monthCount": "本月 {count} 次查经",
    "team.title": "同工团队",
    "team.prayerTitle": "代祷关怀",
    "team.prayerCopy": "关心新朋友与团契成员近况，安排探访和代祷。",
    "team.studyTitle": "查经带领",
    "team.studyCopy": "预备每周查经内容，带领小组讨论和回应。",
    "team.welcomeTitle": "新朋友接待",
    "team.welcomeCopy": "协助确认聚会地点、接送安排和第一次来访信息。",
    "team.contact": "联系同工",
    "visit.title": "第一次来，可以很简单",
    "visit.copy": "你可以穿得轻松，带着问题来，也可以只是先认识大家。若你需要接送、地址、停车信息或想先和同工联系，欢迎发消息给我们。",
    "visit.step1": "告诉我们你想来",
    "visit.step2": "确认本周地点",
    "visit.step3": "一起来吃饭和聚会",
    "contact.title": "联系好朋友团契",
    "contact.email": `团契邮箱 ${fellowshipContactEmail}`,
    "contact.welcome": "联系接待同工",
    "contact.gffMap": "好朋友团契周五地址：Crest Community Church, 3431 Mt Vernon Ave",
    "contact.rmbcMap": "RMBC 主日地址：4889 Tyler Street",
    "footer.name": "河滨国语浸信会 RMBC 好朋友团契",
    "footer.admin": "管理员登录",
    "footer.top": "回到顶部",
    "language.label": "English",
    "language.aria": "Switch to English",
  },
  en: {
    "meta.description": "RMBC Good Friends Fellowship is a Chinese Christian fellowship near UCR in Riverside, welcoming students, professionals, families, and friends for Friday Bible study, dinner, prayer, and Sunday worship.",
    "page.title": "RMBC Good Friends Fellowship | UCR Riverside Chinese Church Bible Study",
    "studies.pageTitle": "Past Bible Studies | RMBC Good Friends Fellowship UCR Riverside",
    "photos.pageTitle": "Photo Moments | RMBC Good Friends Fellowship",
    "brand.subtitle": "Good Friends Fellowship",
    "nav.about": "About",
    "nav.gatherings": "Gatherings",
    "nav.studies": "Studies",
    "nav.gallery": "Photos",
    "nav.team": "Team",
    "nav.visit": "Visit",
    "nav.contact": "Contact",
    "hero.eyebrow": "Riverside Mandarin Baptist Church",
    "hero.title": "Good Friends Fellowship",
    "hero.copy": "Good Friends Fellowship is part of RMBC, Riverside Mandarin Baptist Church, and welcomes UCR students, professionals, families, and Chinese-speaking friends in Riverside. We believe faith is not only a weekend routine, but also a life of being heard, prayed for, and encouraged to grow.",
    "hero.contactHost": "First time? Contact the welcome team",
    "quick.timeLabel": "Gathering Times",
    "quick.time": "Friday 6:00 PM / Sunday 10:00 AM",
    "quick.locationLabel": "Location",
    "quick.location": "Friday at Crest Community Church / Sunday at RMBC 4889 Tyler St",
    "quick.audienceLabel": "Who Can Come",
    "quick.audience": "Students, professionals, families, and friends",
    "about.title": "A Place To Become Friends",
    "about.copy": "A place near UCR in Riverside to share meals, study the Bible, pray together, and walk through life with hope.",
    "features.studyTitle": "Bible Study",
    "features.studyCopy": "We listen to Scripture together and connect God's word with real life.",
    "features.dinnerTitle": "Dinner And Fellowship",
    "features.dinnerCopy": "A shared meal often becomes the beginning of friendship and a restful landing place in the week.",
    "features.prayerTitle": "Prayer And Care",
    "features.prayerCopy": "We bring school, work, family, and life decisions before God together.",
    "gatherings.title": "Upcoming Gatherings",
    "gatherings.friday": "Friday",
    "gatherings.sunday": "Sunday",
    "gatherings.bibleStudyTitle": "Fellowship Bible Study",
    "gatherings.bibleStudyCopy": "Worship, dinner, Bible study, and group sharing. First-time visitors are welcome to come as they are.",
    "gatherings.scriptureLabel": "Scripture: ",
    "gatherings.scriptureTitle": "This Week's Scripture",
    "gatherings.rhythmTitle": "Gathering Rhythm",
    "gatherings.rhythmDinner": "Dinner",
    "gatherings.rhythmStudy": "Bible Study",
    "gatherings.rhythmShare": "Sharing",
    "gatherings.rhythmPrayer": "Prayer",
    "gatherings.rhythmLivestream": "Livestream 9:50",
    "gatherings.rhythmWorship": "Worship 10:00",
    "gatherings.rhythmDismissal": "Ends 11:20",
    "gatherings.worshipTitle": "Sunday Worship",
    "gatherings.worshipCopy": "Join us for worship, and feel free to stay afterward to meet new friends.",
    "gatherings.liveLabel": "Sunday livestream",
    "announcements.title": "Fellowship News",
    "announcements.pinned": "Pinned",
    "gallery.title": "Fellowship Photos",
    "gallery.hint": "Swipe horizontally to see more photos",
    "gallery.moments": "📸 Photo Moments",
    "photos.title": "Photo Moments",
    "photos.copy": "Photos organized by fellowship gatherings and activity days.",
    "photos.backToWall": "Back To Photo Wall",
    "photos.empty": "No photos have been uploaded yet.",
    "studies.title": "Past Bible Studies",
    "studies.copy": "A simple archive of passages, themes, and notes from RMBC Good Friends Fellowship Bible studies.",
    "studies.empty": "No archived Bible studies yet.",
    "studies.back": "Back Home",
    "studies.notes": "Study Notes",
    "studies.directory": "Archive Directory",
    "studies.year": "Year",
    "studies.month": "Month",
    "studies.monthCount": "{count} studies this month",
    "team.title": "Serving Team",
    "team.prayerTitle": "Prayer And Care",
    "team.prayerCopy": "Cares for newcomers and fellowship members through prayer, follow-up, and visits.",
    "team.studyTitle": "Bible Study Leaders",
    "team.studyCopy": "Prepares weekly Bible study and leads small-group discussion and response.",
    "team.welcomeTitle": "Welcome Team",
    "team.welcomeCopy": "Helps confirm gathering locations, rides, and first-visit details.",
    "team.contact": "Contact Team",
    "visit.title": "Your First Visit Can Be Simple",
    "visit.copy": "Come casually, bring your questions, or simply come to meet people. If you need a ride, address, parking details, or want to contact a servant first, send us a message.",
    "visit.step1": "Tell us you would like to come",
    "visit.step2": "Confirm this week's location",
    "visit.step3": "Join us for dinner and fellowship",
    "contact.title": "Contact Good Friends Fellowship",
    "contact.email": `Fellowship email ${fellowshipContactEmail}`,
    "contact.welcome": "Contact the welcome team",
    "contact.gffMap": "Good Friends Friday location: Crest Community Church, 3431 Mt Vernon Ave",
    "contact.rmbcMap": "RMBC Sunday location: 4889 Tyler Street",
    "footer.name": "RMBC Good Friends Fellowship",
    "footer.admin": "Admin",
    "footer.top": "Back To Top",
    "language.label": "中文",
    "language.aria": "切换到中文",
  },
};

const getSavedLanguage = () => {
  const saved = window.localStorage.getItem("rmbc-language");
  return saved === "en" || saved === "zh" ? saved : "zh";
};

const hasSupabaseConfig = () => Boolean(supabaseConfig.url && supabaseConfig.anonKey && window.supabase);

const getSupabaseClient = () => {
  if (!hasSupabaseConfig()) {
    return null;
  }

  if (!supabaseClient) {
    supabaseClient = window.supabase.createClient(supabaseConfig.url, supabaseConfig.anonKey);
  }

  return supabaseClient;
};

const normalizePublicContent = (value) => {
  if (value && typeof value === "object") {
    const team = Array.isArray(value.team) ? value.team : defaultContent.team;
    return {
      siteSections: normalizeSiteSections(value.siteSections),
      announcements: Array.isArray(value.announcements) ? value.announcements : defaultContent.announcements,
      gatherings: Array.isArray(value.gatherings) ? value.gatherings : defaultContent.gatherings,
      studies: Array.isArray(value.studies) ? value.studies : defaultContent.studies,
      gallery: Array.isArray(value.gallery) ? value.gallery : defaultContent.gallery,
      photoCategoryDescriptions: normalizePhotoCategoryDescriptions(value.photoCategoryDescriptions),
      team: team.map((item) => ({
        ...item,
        contact: item.contact === "hello@rmbc.example" ? fellowshipContactEmail : item.contact,
      })),
    };
  }

  return {
    ...defaultContent,
    siteSections: normalizeSiteSections(defaultContent.siteSections),
  };
};

const getLocalContent = () => {
  try {
    const saved = JSON.parse(window.localStorage.getItem(adminStorageKey));
    if (saved) {
      return normalizePublicContent(saved);
    }
  } catch (error) {
    window.localStorage.removeItem(adminStorageKey);
  }

  return {
    ...defaultContent,
    siteSections: normalizeSiteSections(defaultContent.siteSections),
  };
};

const getAdminContent = () => remoteContent || getLocalContent();

const normalizeStudyHeader = (value) => String(value || "")
  .normalize("NFKC")
  .trim()
  .toLowerCase()
  .replace(/[\s_/-]+/g, "");

const studyHeaderAliases = {
  date: ["日期", "date", "时间"],
  titleZh: ["中文题目", "中文主题", "题目", "主题", "chinesetitle", "zhtitle", "titlezh"],
  titleEn: ["englishtitle", "英文题目", "英文主题", "entitle", "titleen"],
  passageZh: ["中文经文", "中文经文出处", "经文", "经文出处", "chinesepassage", "zhpassage", "passagezh"],
  passageEn: ["englishpassage", "英文经文", "英文经文出处", "enpassage", "passageen"],
  scriptureZh: ["中文经文内容", "经文内容", "chinesescripture", "zhscripture", "scripturezh"],
  scriptureEn: ["esvscripture", "englishscripture", "英文经文内容", "enscripture", "scriptureen"],
  summaryZh: ["中文大致内容", "中文查经重点", "大致内容", "查经重点", "内容", "chinesesummary", "zhsummary", "summaryzh"],
  summaryEn: ["englishsummary", "englishstudynotes", "英文大致内容", "英文查经重点", "ensummary", "summaryen"],
  active: ["是否显示", "显示", "active", "show", "published"],
};

const getStudyColumnMap = (headers) => {
  const normalizedHeaders = headers.map(normalizeStudyHeader);
  return Object.fromEntries(
    Object.entries(studyHeaderAliases).map(([key, aliases]) => [
      key,
      normalizedHeaders.findIndex((header) => aliases.map(normalizeStudyHeader).includes(header)),
    ]),
  );
};

const readSheetCell = (cells, index) => {
  if (index < 0) {
    return "";
  }

  const cell = cells[index];
  if (!cell) {
    return "";
  }

  return String(cell.f ?? cell.v ?? "").trim();
};

const isVisibleSheetValue = (value) => {
  const normalized = normalizeStudyHeader(value);
  return !["no", "n", "false", "0", "否", "不显示", "隐藏", "hide", "hidden"].includes(normalized);
};

const parseSheetStudies = (response) => {
  const table = response?.table;
  const headers = (table?.cols || []).map((column) => column.label || column.id || "");
  const rows = table?.rows || [];
  const columnMap = getStudyColumnMap(headers);

  return rows
    .map((row, index) => {
      const cells = row.c || [];
      const activeValue = readSheetCell(cells, columnMap.active);
      const item = {
        id: `sheet-study-${index + 1}`,
        active: activeValue ? isVisibleSheetValue(activeValue) : true,
        date: readSheetCell(cells, columnMap.date),
        title: {
          zh: readSheetCell(cells, columnMap.titleZh),
          en: readSheetCell(cells, columnMap.titleEn),
        },
        passage: {
          zh: readSheetCell(cells, columnMap.passageZh),
          en: readSheetCell(cells, columnMap.passageEn),
        },
        scripture: {
          zh: readSheetCell(cells, columnMap.scriptureZh),
          en: readSheetCell(cells, columnMap.scriptureEn),
        },
        scriptureVersion: readSheetCell(cells, columnMap.scriptureEn) ? "ESV" : "",
        summary: {
          zh: readSheetCell(cells, columnMap.summaryZh),
          en: readSheetCell(cells, columnMap.summaryEn),
        },
      };
      const hasContent = item.date
        || item.title.zh
        || item.title.en
        || item.passage.zh
        || item.passage.en
        || item.scripture.zh
        || item.scripture.en
        || item.summary.zh
        || item.summary.en;

      return hasContent ? item : null;
    })
    .filter(Boolean);
};

const loadGoogleSheetStudies = () => new Promise((resolve) => {
  if (!studiesSheetConfig.id) {
    resolve([]);
    return;
  }

  const callbackName = `rmbcStudiesSheet${Date.now()}`;
  const sheetQuery = studiesSheetConfig.gid
    ? `gid=${encodeURIComponent(studiesSheetConfig.gid)}`
    : `sheet=${encodeURIComponent(studiesSheetConfig.sheetName || "查经归档")}`;
  const script = document.createElement("script");
  const cleanup = () => {
    delete window[callbackName];
    script.remove();
  };

  window[callbackName] = (response) => {
    try {
      resolve(parseSheetStudies(response));
    } catch (error) {
      console.warn("Unable to parse Google Sheet studies", error);
      resolve([]);
    } finally {
      cleanup();
    }
  };

  script.onerror = () => {
    console.warn("Unable to load Google Sheet studies");
    cleanup();
    resolve([]);
  };
  script.src = `https://docs.google.com/spreadsheets/d/${encodeURIComponent(studiesSheetConfig.id)}/gviz/tq?${sheetQuery}&headers=1&tqx=responseHandler:${callbackName}`;
  document.head.append(script);
});

const loadSupabaseContent = async () => {
  const client = getSupabaseClient();
  if (!client) {
    return;
  }

  const { data, error } = await client
    .from("site_content")
    .select("value")
    .eq("key", supabaseConfig.contentKey || "main")
    .maybeSingle();

  if (error) {
    console.warn("Unable to load Supabase content", error);
    return;
  }

  if (data?.value) {
    remoteContent = normalizePublicContent(data.value);
    applyLanguage(currentLanguage);
  }
};

const localText = (value, language) => {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  return value[language] || value.zh || value.en || "";
};

function localDescriptionValue(value) {
  if (value && typeof value === "object") {
    return {
      zh: value.zh || "",
      en: value.en || "",
    };
  }

  return {
    zh: value || "",
    en: "",
  };
}

const getVisiblePhotos = (content) => {
  const savedPhotos = (content.gallery || []).filter((item) => item.active !== false && item.image);
  const defaultPhotos = defaultContent.gallery.filter((item) => item.active !== false && item.image);
  return savedPhotos.length > 0 ? savedPhotos : defaultPhotos;
};

const photoTitleText = (item, language) => {
  const title = localText(item.title, language).trim();
  return placeholderPhotoTitles.has(title) ? "" : title;
};

const stopGalleryAutoScroll = () => {
  if (galleryAutoScrollFrame) {
    window.cancelAnimationFrame(galleryAutoScrollFrame);
    galleryAutoScrollFrame = 0;
  }

  if (galleryAutoScrollController) {
    galleryAutoScrollController.abort();
    galleryAutoScrollController = null;
  }
};

const startGalleryAutoScroll = () => {
  stopGalleryAutoScroll();

  if (!galleryGrid || !galleryGrid.classList.contains("is-scrollable")) {
    return;
  }

  const track = galleryGrid.querySelector(".gallery-track");
  const loops = track ? Array.from(track.querySelectorAll(".gallery-loop")) : [];
  const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (!track || loops.length < 2 || reduceMotionQuery.matches) {
    return;
  }

  galleryAutoScrollController = new AbortController();
  const { signal } = galleryAutoScrollController;
  let lastTimestamp = 0;
  let resumeAt = 0;
  let hoverPaused = false;
  let focusPaused = false;
  let scrollPosition = galleryGrid.scrollLeft;

  const loopDistance = () => Math.max(0, loops[1].offsetLeft - loops[0].offsetLeft);
  const pauseFor = (duration) => {
    resumeAt = Math.max(resumeAt, performance.now() + duration);
  };
  const normalizeScroll = () => {
    const distance = loopDistance();

    if (!distance) {
      return;
    }

    while (scrollPosition >= distance) {
      scrollPosition -= distance;
    }

    galleryGrid.scrollLeft = scrollPosition;
  };
  const tick = (timestamp) => {
    const elapsed = Math.min(50, timestamp - (lastTimestamp || timestamp));
    lastTimestamp = timestamp;

    if (!hoverPaused && !focusPaused && timestamp >= resumeAt) {
      scrollPosition += (elapsed / 1000) * galleryAutoScrollSpeed;
      normalizeScroll();
    } else {
      scrollPosition = galleryGrid.scrollLeft;
    }

    galleryAutoScrollFrame = window.requestAnimationFrame(tick);
  };
  const userPaused = (duration = 1800) => {
    scrollPosition = galleryGrid.scrollLeft;
    pauseFor(duration);
  };
  const showScrollbar = () => {
    window.clearTimeout(galleryScrollbarHideTimer);
    galleryGrid.classList.add("is-user-scrolling");
    galleryScrollbarHideTimer = window.setTimeout(() => {
      galleryGrid.classList.remove("is-user-scrolling");
    }, 1200);
  };
  const userInteracted = (duration = 1800) => {
    userPaused(duration);
    showScrollbar();
  };

  galleryGrid.addEventListener("mouseenter", () => {
    hoverPaused = true;
  }, { signal });
  galleryGrid.addEventListener("mouseleave", () => {
    hoverPaused = false;
    pauseFor(450);
  }, { signal });
  galleryGrid.addEventListener("focusin", () => {
    focusPaused = true;
  }, { signal });
  galleryGrid.addEventListener("focusout", () => {
    focusPaused = false;
    pauseFor(450);
  }, { signal });
  galleryGrid.addEventListener("pointerdown", () => userInteracted(2400), { signal });
  galleryGrid.addEventListener("touchstart", () => userInteracted(2400), { passive: true, signal });
  galleryGrid.addEventListener("touchmove", () => userInteracted(900), { passive: true, signal });
  galleryGrid.addEventListener("wheel", () => userInteracted(1600), { passive: true, signal });
  window.addEventListener("pointerup", () => userInteracted(900), { signal });
  window.addEventListener("touchend", () => userInteracted(900), { passive: true, signal });
  window.addEventListener("touchcancel", () => userInteracted(900), { passive: true, signal });
  window.addEventListener("resize", normalizeScroll, { signal });

  galleryAutoScrollFrame = window.requestAnimationFrame(tick);
};

const createElement = (tagName, className, text) => {
  const element = document.createElement(tagName);
  if (className) {
    element.className = className;
  }
  if (text) {
    element.textContent = text;
  }
  return element;
};

const englishMonthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const padMonth = (month) => String(month).padStart(2, "0");

const getStudyDateParts = (dateValue) => {
  const value = String(dateValue || "").trim();
  if (!value) {
    return null;
  }

  const googleDate = value.match(/^Date\((\d{4}),\s*(\d{1,2}),\s*(\d{1,2})\)/);
  if (googleDate) {
    const year = googleDate[1];
    const month = padMonth(Number(googleDate[2]) + 1);
    return { year, month };
  }

  const yearFirstDate = value.match(/^(\d{4})[-/.年](\d{1,2})(?:[-/.月](\d{1,2}))?/);
  if (yearFirstDate) {
    return { year: yearFirstDate[1], month: padMonth(yearFirstDate[2]) };
  }

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return {
      year: String(parsed.getFullYear()),
      month: padMonth(parsed.getMonth() + 1),
    };
  }

  return null;
};

const getMonthLabel = (month, language) => {
  const monthNumber = Number(month);
  return language === "zh" ? `${monthNumber}月` : englishMonthNames[monthNumber - 1] || month;
};

const getStudyArchiveIndex = (studies) => {
  const index = new Map();

  studies.forEach((item) => {
    const parts = getStudyDateParts(item.date);
    if (!parts) {
      return;
    }

    if (!index.has(parts.year)) {
      index.set(parts.year, new Set());
    }
    index.get(parts.year).add(parts.month);
  });

  return [...index.entries()]
    .map(([year, months]) => ({
      year,
      months: [...months].sort((a, b) => Number(b) - Number(a)),
    }))
    .sort((a, b) => Number(b.year) - Number(a.year));
};

const renderStudyDirectory = (studies, language) => {
  if (!studyDirectory) {
    return studies;
  }

  const archiveIndex = getStudyArchiveIndex(studies);
  if (archiveIndex.length === 0) {
    studyDirectory.hidden = true;
    return studies;
  }

  const years = archiveIndex.map((item) => item.year);
  if (!years.includes(selectedStudyYear)) {
    selectedStudyYear = years[0];
    selectedStudyMonth = "";
  }

  const selectedYearEntry = archiveIndex.find((item) => item.year === selectedStudyYear) || archiveIndex[0];
  if (!selectedYearEntry.months.includes(selectedStudyMonth)) {
    selectedStudyMonth = selectedYearEntry.months[0];
  }

  const yearSelect = document.createElement("select");
  const monthSelect = document.createElement("select");
  const yearLabel = createElement("label", "study-filter-field");
  const monthLabel = createElement("label", "study-filter-field");
  const selectedStudies = studies.filter((item) => {
    const parts = getStudyDateParts(item.date);
    return parts?.year === selectedStudyYear && parts?.month === selectedStudyMonth;
  });
  const countText = translations[language]["studies.monthCount"].replace("{count}", selectedStudies.length);

  yearSelect.setAttribute("aria-label", translations[language]["studies.year"]);
  monthSelect.setAttribute("aria-label", translations[language]["studies.month"]);

  archiveIndex.forEach(({ year }) => {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = language === "zh" ? `${year}年` : year;
    option.selected = year === selectedStudyYear;
    yearSelect.append(option);
  });

  selectedYearEntry.months.forEach((month) => {
    const option = document.createElement("option");
    option.value = month;
    option.textContent = getMonthLabel(month, language);
    option.selected = month === selectedStudyMonth;
    monthSelect.append(option);
  });

  yearSelect.addEventListener("change", () => {
    selectedStudyYear = yearSelect.value;
    selectedStudyMonth = "";
    renderContent(language);
  });
  monthSelect.addEventListener("change", () => {
    selectedStudyMonth = monthSelect.value;
    renderContent(language);
  });

  yearLabel.append(createElement("span", null, translations[language]["studies.year"]), yearSelect);
  monthLabel.append(createElement("span", null, translations[language]["studies.month"]), monthSelect);

  studyDirectory.hidden = false;
  studyDirectory.replaceChildren(
    createElement("p", "eyebrow", translations[language]["studies.directory"]),
    yearLabel,
    monthLabel,
    createElement("p", "study-directory-count", countText),
  );

  return selectedStudies;
};

const closePhotoLightbox = () => {
  if (!photoLightbox) {
    return;
  }

  photoLightbox.overlay.classList.remove("is-open");
  photoLightbox.overlay.setAttribute("aria-hidden", "true");
  document.body.classList.remove("photo-lightbox-open");

  if (photoLightboxPreviousFocus && document.contains(photoLightboxPreviousFocus)) {
    photoLightboxPreviousFocus.focus();
  }
  photoLightboxPreviousFocus = null;
};

const ensurePhotoLightbox = () => {
  if (photoLightbox) {
    return photoLightbox;
  }

  const overlay = document.createElement("div");
  const dialog = document.createElement("div");
  const closeButton = document.createElement("button");
  const image = document.createElement("img");
  const caption = document.createElement("p");

  overlay.className = "photo-lightbox";
  overlay.setAttribute("aria-hidden", "true");
  dialog.className = "photo-lightbox-dialog";
  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-modal", "true");
  closeButton.type = "button";
  closeButton.className = "photo-lightbox-close";
  closeButton.textContent = "×";
  image.className = "photo-lightbox-image";
  caption.className = "photo-lightbox-caption";

  closeButton.addEventListener("click", closePhotoLightbox);
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      closePhotoLightbox();
    }
  });

  dialog.append(closeButton, image, caption);
  overlay.append(dialog);
  document.body.append(overlay);

  photoLightbox = { overlay, dialog, closeButton, image, caption };
  return photoLightbox;
};

const openPhotoLightbox = ({ src, title, alt }, language) => {
  const lightbox = ensurePhotoLightbox();
  const closeLabel = language === "en" ? "Close photo" : "关闭照片";

  photoLightboxPreviousFocus = document.activeElement;
  lightbox.closeButton.setAttribute("aria-label", closeLabel);
  lightbox.image.src = src;
  lightbox.image.alt = alt || title || "Fellowship photo";
  lightbox.caption.textContent = title || "";
  lightbox.caption.hidden = !title;
  lightbox.dialog.setAttribute("aria-label", title || closeLabel);
  lightbox.overlay.classList.add("is-open");
  lightbox.overlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("photo-lightbox-open");
  lightbox.closeButton.focus();
};

const siteUrl = "https://rmbc-goodfriends.pages.dev";
const pacificTimeZone = "America/Los_Angeles";

const getPacificParts = (date) => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: pacificTimeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  return Object.fromEntries(parts.map((part) => [part.type, part.value]));
};

const formatDateOnly = (date) => date.toISOString().slice(0, 10);

const getNextPacificDate = (weekday, eventHour) => {
  const nowParts = getPacificParts(new Date());
  const today = new Date(Date.UTC(Number(nowParts.year), Number(nowParts.month) - 1, Number(nowParts.day)));
  const currentWeekday = today.getUTCDay();
  let daysAhead = (weekday - currentWeekday + 7) % 7;

  if (daysAhead === 0 && Number(nowParts.hour) >= eventHour) {
    daysAhead = 7;
  }

  today.setUTCDate(today.getUTCDate() + daysAhead);
  return formatDateOnly(today);
};

const eventPlace = (name, streetAddress, postalCode) => ({
  "@type": "Place",
  name,
  address: {
    "@type": "PostalAddress",
    streetAddress,
    addressLocality: "Riverside",
    addressRegion: "CA",
    postalCode,
    addressCountry: "US",
  },
});

const createStructuredEvent = ({
  id,
  name,
  alternateName,
  description,
  weekday,
  startHour,
  startTime,
  endTime,
  location,
  attendanceMode = "https://schema.org/OfflineEventAttendanceMode",
  virtualLocation,
}) => {
  const date = getNextPacificDate(weekday, startHour);
  return {
    "@type": "Event",
    "@id": `${siteUrl}/#${id}-${date}`,
    name,
    alternateName,
    description,
    startDate: `${date}T${startTime}:00`,
    endDate: `${date}T${endTime}:00`,
    eventAttendanceMode: attendanceMode,
    eventStatus: "https://schema.org/EventScheduled",
    image: [`${siteUrl}/assets/hero-fellowship.svg`],
    isAccessibleForFree: true,
    inLanguage: ["zh-Hans", "en"],
    location,
    ...(virtualLocation ? { virtualLocation } : {}),
    organizer: {
      "@type": "Organization",
      name: "RMBC Good Friends Fellowship",
      url: siteUrl,
    },
    offers: {
      "@type": "Offer",
      url: siteUrl,
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      validFrom: `${date}T00:00:00`,
    },
  };
};

const injectEventStructuredData = () => {
  if (!eventGrid) {
    return;
  }

  document.querySelector("[data-structured-events]")?.remove();

  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.dataset.structuredEvents = "true";
  script.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      createStructuredEvent({
        id: "friday-bible-study",
        name: "Fellowship Bible Study",
        alternateName: "团契查经",
        description: "RMBC 好朋友团契周五中文查经、晚餐、诗歌、分享和祷告，欢迎 Riverside 与 UCR 附近的新朋友参加。",
        weekday: 5,
        startHour: 18,
        startTime: "18:00",
        endTime: "21:00",
        location: eventPlace("Crest Community Church", "3431 Mt Vernon Ave", "92507"),
      }),
      createStructuredEvent({
        id: "sunday-worship",
        name: "Sunday Worship",
        alternateName: "主日崇拜",
        description: "Riverside Mandarin Baptist Church 主日崇拜，欢迎好朋友团契和新朋友一同敬拜。",
        weekday: 0,
        startHour: 10,
        startTime: "10:00",
        endTime: "11:20",
        attendanceMode: "https://schema.org/MixedEventAttendanceMode",
        virtualLocation: {
          "@type": "VirtualLocation",
          url: "http://tiny.cc/RMBC",
        },
        location: eventPlace("Riverside Mandarin Baptist Church", "4889 Tyler Street", "92503"),
      }),
    ],
  });
  document.head.append(script);
};

const routeAnnouncementWheel = (event, card = null) => {
  if (!announcementList || announcementList.scrollWidth <= announcementList.clientWidth) {
    return;
  }

  const cardCanScrollVertically = card && card.scrollHeight > card.clientHeight + 1;
  const horizontalDelta = event.shiftKey
    ? event.deltaY || event.deltaX
    : event.deltaX || (!cardCanScrollVertically ? event.deltaY : 0);
  if (!horizontalDelta) {
    return;
  }

  announcementList.scrollLeft += horizontalDelta;
  if (!event.shiftKey && event.deltaX && event.deltaY && cardCanScrollVertically) {
    card.scrollTop += event.deltaY;
  }
  event.preventDefault();
  event.stopPropagation();
};

const updateAnnouncementArrows = () => {
  if (!announcementList || !announcementPrevious || !announcementNext) return;
  const maxScrollLeft = Math.max(announcementList.scrollWidth - announcementList.clientWidth, 0);
  const hasOverflow = maxScrollLeft > 2;
  announcementPrevious.hidden = !hasOverflow || announcementList.scrollLeft <= 2;
  announcementNext.hidden = !hasOverflow || announcementList.scrollLeft >= maxScrollLeft - 2;
};

const moveAnnouncementsByTwo = (direction) => {
  const cards = announcementList?.querySelectorAll(".announcement-card");
  if (!announcementList || !cards?.length) return;
  const firstCard = cards[0];
  const styles = window.getComputedStyle(announcementList);
  const gap = Number.parseFloat(styles.columnGap || styles.gap) || 0;
  const distance = (firstCard.getBoundingClientRect().width + gap) * 2;
  announcementList.scrollBy({ left: direction * distance, behavior: "smooth" });
};

const renderContent = (language) => {
  const content = getAdminContent();
  const siteSections = normalizeSiteSections(content.siteSections);
  syncSiteSectionVisibility(siteSections);

  if (announcementList && announcementSection) {
    const activeAnnouncements = content.announcements
      .map((item, index) => {
        const timestamp = Date.parse(item.date || "");
        return {
          item,
          index,
          timestamp: Number.isNaN(timestamp) ? Number.NEGATIVE_INFINITY : timestamp,
        };
      })
      .filter(({ item }) => item.active !== false)
      .sort((a, b) => {
        const pinOrder = Number(b.item.pinned === true) - Number(a.item.pinned === true);
        if (pinOrder !== 0) return pinOrder;
        if (a.item.pinned === true) return a.index - b.index;
        return b.timestamp - a.timestamp || a.index - b.index;
      })
      .map(({ item }) => item);
    const announcementsVisible = isSiteSectionVisible(siteSections, "announcements");
    announcementSection.hidden = !announcementsVisible || activeAnnouncements.length === 0;
    announcementList.classList.toggle("is-scrollable", activeAnnouncements.length > 3);
    announcementList.setAttribute(
      "aria-label",
      language === "en" ? "Fellowship announcements" : "团契公告列表",
    );
    announcementPrevious.setAttribute("aria-label", language === "en" ? "View previous announcements" : "向左查看公告");
    announcementNext.setAttribute("aria-label", language === "en" ? "View more announcements" : "向右查看公告");
    announcementList.replaceChildren(
      ...activeAnnouncements.map((item) => {
        const article = createElement("article", "announcement-card");
        article.addEventListener("wheel", (event) => routeAnnouncementWheel(event, article), { passive: false });
        const cardHeader = createElement("div", "announcement-card-header");
        const meta = createElement("div", "announcement-meta");
        const date = createElement("span", "announcement-date", item.date || "");
        const title = createElement("h3", null, localText(item.title, language));
        meta.append(date);
        if (item.pinned === true) {
          article.classList.add("is-pinned");
          meta.append(createElement("span", "announcement-pin", translations[language]["announcements.pinned"]));
        }
        cardHeader.append(meta, title);
        article.append(
          cardHeader,
          createElement("p", null, localText(item.body, language)),
        );
        return article;
      }),
    );
    window.requestAnimationFrame(updateAnnouncementArrows);
  }

  if (eventGrid) {
    const gatheringsVisible = isSiteSectionVisible(siteSections, "gatherings");
    const activeGatherings = gatheringsVisible
      ? content.gatherings.filter((item) => item.active !== false)
      : [];
    eventGrid.replaceChildren(
      ...activeGatherings.map((item) => {
        const article = createElement("article", "event-card");
        const rhythm = document.createElement("div");
        const rhythmTitle = createElement("span", "event-rhythm-title", translations[language]["gatherings.rhythmTitle"]);
        const rhythmItems = document.createElement("div");
        const isSundayWorship = item.id === "sunday-worship";
        rhythm.className = "event-rhythm";
        rhythmItems.className = "event-rhythm-items";
        const rhythmLabels = isSundayWorship
          ? [
              translations[language]["gatherings.rhythmLivestream"],
              translations[language]["gatherings.rhythmWorship"],
              translations[language]["gatherings.rhythmDismissal"],
            ]
          : [
              translations[language]["gatherings.rhythmDinner"],
              translations[language]["gatherings.rhythmStudy"],
              translations[language]["gatherings.rhythmShare"],
              translations[language]["gatherings.rhythmPrayer"],
            ];
        rhythmLabels.forEach((label) => {
          rhythmItems.append(createElement("span", null, label));
        });
        rhythm.append(rhythmTitle, rhythmItems);

        article.append(
          createElement("time", null, localText(item.day, language)),
          createElement("h3", null, localText(item.title, language)),
          createElement("p", null, localText(item.description, language)),
          rhythm,
        );

        const details = createElement("span", null, `${localText(item.time, language)} · ${localText(item.location, language)}`);
        article.append(details);

        if (item.liveUrl) {
          const liveLink = createElement("a", "event-live-link", localText(item.liveTime, language) || translations[language]["gatherings.liveLabel"]);
          liveLink.href = item.liveUrl;
          liveLink.target = "_blank";
          liveLink.rel = "noopener";
          article.append(liveLink);
        }
        return article;
      }),
    );

    if (scripturePanel && gatheringsLayout) {
      const scriptureItems = activeGatherings
        .map((item) => ({
          title: localText(item.title, language),
          passage: localText(item.scriptureReference, language),
          scripture: localText(item.scripture, language),
          version: item.scriptureVersion || "",
        }))
        .filter((item) => item.scripture);

      gatheringsLayout.classList.toggle("has-scripture", scriptureItems.length > 0);
      scripturePanel.hidden = scriptureItems.length === 0;
      scripturePanel.replaceChildren();

      if (scriptureItems.length > 0) {
        scriptureItems.forEach((item) => {
          const card = createElement("article", "scripture-card");
          const heading = document.createElement("div");
          const list = document.createElement("div");
          const article = createElement("article", "scripture-entry");

          heading.className = "scripture-heading";
          list.className = "scripture-list";
          heading.append(
            createElement("p", "eyebrow", "Scripture"),
            createElement("h3", null, translations[language]["gatherings.scriptureTitle"]),
          );

          if (item.title) {
            article.append(createElement("span", null, item.title));
          }
          if (item.passage) {
            article.append(createElement("strong", "scripture-reference", `${item.passage}${item.version ? ` · ${item.version}` : ""}`));
          }
          article.append(createElement("p", null, item.scripture));
          if (language === "en" && item.version === "ESV") {
            article.append(createElement("small", "esv-notice", "Scripture quotations are from the ESV® Bible (The Holy Bible, English Standard Version®), © 2001 by Crossway, a publishing ministry of Good News Publishers. Used by permission. All rights reserved."));
          }
          list.append(article);
          card.append(heading, list);
          scripturePanel.append(card);
        });
      }
    }
  }

  if (gallerySection && galleryGrid) {
    const galleryVisible = isSiteSectionVisible(siteSections, "gallery");
    const savedPhotos = (content.gallery || []).filter((item) => item.active !== false && item.image);
    const defaultPhotos = defaultContent.gallery.filter((item) => item.active !== false && item.image);
    const activePhotos = galleryVisible ? getVisiblePhotos(content) : [];

    gallerySection.hidden = !galleryVisible || activePhotos.length === 0;
    galleryLinks.forEach((link) => {
      link.hidden = !galleryVisible || activePhotos.length === 0;
    });

    const renderGalleryCards = (photos, allowFallback) => {
      const shouldScroll = photos.length > 4;
      const track = document.createElement("div");
      const loopCount = shouldScroll ? 3 : 1;
      track.className = "gallery-track";
      galleryGrid.classList.toggle("is-scrollable", shouldScroll);
      galleryGrid.classList.toggle("is-single", photos.length === 1);

      Array.from({ length: loopCount }, (_, loopIndex) => {
        const loop = document.createElement("div");
        const rows = [document.createElement("div"), document.createElement("div")];
        const rowWidths = [0, 0];
        loop.className = "gallery-loop";
        rows.forEach((row) => {
          row.className = "gallery-row";
        });
        photos.forEach((item, index) => {
          const article = createElement("article", "gallery-card");
          const image = document.createElement("img");
          const title = localText(item.title, language);
          const variant = galleryCardVariants[index % galleryCardVariants.length];
          const rowIndex = rowWidths[0] <= rowWidths[1] ? 0 : 1;

          article.classList.add(variant.className);
          if (loopIndex > 0) {
            article.setAttribute("aria-hidden", "true");
          }
          image.src = item.image;
          image.alt = title || localText(item.alt, language) || "Fellowship photo";
          image.loading = "lazy";
          image.addEventListener("load", () => {
            article.classList.add(image.naturalHeight > image.naturalWidth * 1.12 ? "is-portrait" : "is-landscape");
          }, { once: true });
          image.addEventListener("error", () => {
            article.remove();
            if (!galleryGrid.querySelector(".gallery-card")) {
              const fallbackPhotos = defaultPhotos.filter((fallback) => !photos.some((photo) => photo.image === fallback.image));
              if (allowFallback && fallbackPhotos.length > 0) {
                renderGalleryCards(fallbackPhotos, false);
              } else {
                gallerySection.hidden = true;
                galleryLinks.forEach((link) => {
                  link.hidden = true;
                });
                stopGalleryAutoScroll();
              }
            }
          });

          article.append(image);
          rows[rowIndex].append(article);
          rowWidths[rowIndex] += variant.width;
        });
        loop.replaceChildren(...rows);
        track.append(loop);
      });
      galleryGrid.replaceChildren(track);
      startGalleryAutoScroll();
    };

    if (activePhotos.length === 0) {
      galleryGrid.replaceChildren();
      stopGalleryAutoScroll();
    } else {
      renderGalleryCards(activePhotos, savedPhotos.length > 0);
    }
  } else {
    galleryLinks.forEach((link) => {
      link.hidden = true;
    });
  }

  if (photoCategoryList) {
    const activePhotos = getVisiblePhotos(content);

    if (activePhotos.length === 0) {
      photoCategoryList.replaceChildren(createElement("p", "empty-state", translations[language]["photos.empty"]));
    } else {
      photoCategoryList.replaceChildren(
        ...photoCategories.map((category) => {
          const photos = activePhotos.filter((item) => (item.category || "fellowship") === category.id);
          const section = document.createElement("section");
          const heading = document.createElement("div");
          const grid = document.createElement("div");
          const description = localText(content.photoCategoryDescriptions?.[category.id], language);

          section.className = `photo-category photo-category-${category.id}`;
          heading.className = "photo-category-heading";
          grid.className = "photo-grid";
          heading.append(
            createElement("p", "eyebrow", category.id === "fellowship" ? "Fellowship" : "Activities"),
            createElement("h2", null, localText(category.title, language)),
          );
          if (description) {
            heading.append(createElement("p", "photo-category-copy", description));
          }

          if (photos.length === 0) {
            grid.append(createElement("p", "empty-state", translations[language]["photos.empty"]));
          } else {
            photos.forEach((item) => {
              const article = document.createElement("article");
              const button = document.createElement("button");
              const image = document.createElement("img");
              const title = photoTitleText(item, language);
              const alt = title || localText(item.alt, language) || "Fellowship photo";

              article.className = "photo-card";
              button.type = "button";
              button.className = "photo-card-button";
              button.setAttribute("aria-label", title ? `${title} - ${language === "en" ? "view larger" : "放大查看"}` : (language === "en" ? "View photo larger" : "放大查看照片"));
              image.src = item.image;
              image.alt = alt;
              image.loading = "lazy";
              button.addEventListener("click", () => {
                openPhotoLightbox({ src: item.image, title, alt }, language);
              });
              button.append(image);
              article.append(button);
              if (title) {
                article.append(createElement("h3", null, title));
              }
              grid.append(article);
            });
          }

          section.append(heading, grid);
          return section;
        }),
      );
    }
  }

  if (teamGrid) {
    teamGrid.replaceChildren(
      ...content.team.filter((item) => item.active !== false).map((item) => {
        const article = createElement("article", "team-card");
        const image = document.createElement("img");
        image.src = item.avatar || "./assets/avatar-welcome.svg";
        image.alt = localText(item.name, language);

        const body = document.createElement("div");
        body.append(
          createElement("h3", null, localText(item.name, language)),
          createElement("p", "team-role", localText(item.role, language)),
          createElement("p", null, localText(item.bio, language)),
        );

        if (item.contact) {
          const link = createElement("a", null, translations[language]["team.contact"]);
          link.href = item.contact.includes("@") ? `mailto:${item.contact}` : item.contact;
          body.append(link);
        }

        article.append(image, body);
        return article;
      }),
    );
  }

  if (studiesList) {
    const studiesSource = sheetStudies && sheetStudies.length > 0 ? sheetStudies : content.studies;
    const studies = (studiesSource || [])
      .filter((item) => item.active !== false)
      .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
    const visibleStudies = renderStudyDirectory(studies, language);

    if (visibleStudies.length === 0) {
      studiesList.replaceChildren(createElement("p", "empty-state", translations[language]["studies.empty"]));
    } else {
      studiesList.replaceChildren(
        ...visibleStudies.map((item) => {
          const article = createElement("article", "study-card");
          const meta = createElement("div", "study-meta");
          const title = localText(item.title, language);
          const passage = localText(item.passage, language);
          const scripture = localText(item.scripture, language);
          const summary = localText(item.summary, language);

          if (item.date) {
            meta.append(createElement("span", null, item.date));
          }
          if (passage) {
            meta.append(createElement("span", null, passage));
          }
          article.append(meta, createElement("h2", null, title || passage || translations[language]["studies.title"]));
          if (scripture) {
            article.append(createElement("blockquote", null, scripture));
            if (language === "en" && item.scriptureVersion === "ESV") {
              article.append(createElement("small", "esv-notice", "Scripture quotations are from the ESV® Bible (The Holy Bible, English Standard Version®), © 2001 by Crossway, a publishing ministry of Good News Publishers. Used by permission. All rights reserved."));
            }
          }
          if (summary) {
            article.append(createElement("h3", null, translations[language]["studies.notes"]), createElement("p", null, summary));
          }
          return article;
        }),
      );
    }
  }
};

const applyLanguage = (language) => {
  const dictionary = translations[language];
  document.documentElement.lang = language === "zh" ? "zh-Hans" : "en";
  const pageTitleKey = document.body.dataset.page === "studies"
    ? "studies.pageTitle"
    : document.body.dataset.page === "photos"
      ? "photos.pageTitle"
      : "page.title";
  document.title = dictionary[pageTitleKey];

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;
    if (key && dictionary[key]) {
      element.textContent = dictionary[key];
    }
  });

  document.querySelectorAll("[data-i18n-content]").forEach((element) => {
    const key = element.dataset.i18nContent;
    if (key && dictionary[key]) {
      element.setAttribute("content", dictionary[key]);
    }
  });

  if (languageToggle) {
    languageToggle.textContent = dictionary["language.label"];
    languageToggle.setAttribute("aria-label", dictionary["language.aria"]);
  }

  renderContent(language);
};

const syncHeader = () => {
  header.classList.toggle("is-scrolled", document.body.dataset.page === "studies" || window.scrollY > 20);
};

const initPageMotion = () => {
  const home = document.querySelector("#home");
  if (!home) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hero = home.querySelector(".hero");

  if (hero && !reducedMotion) {
    let scrollFrame = 0;
    const updateHeroDrift = () => {
      const progress = Math.min(window.scrollY / Math.max(hero.offsetHeight, 1), 1);
      hero.style.setProperty("--hero-drift", `${Math.round(progress * 34)}px`);
      scrollFrame = 0;
    };

    const requestHeroDrift = () => {
      if (scrollFrame) return;
      scrollFrame = window.requestAnimationFrame(updateHeroDrift);
    };

    updateHeroDrift();
    window.addEventListener("scroll", requestHeroDrift, { passive: true });
  }

  const gallery = home.querySelector(".gallery");
  const galleryGrid = gallery?.querySelector(".gallery-grid");
  if (gallery && galleryGrid && !reducedMotion) {
    let galleryFrame = 0;
    const updateGalleryDepth = () => {
      const rect = gallery.getBoundingClientRect();
      const viewportHeight = Math.max(window.innerHeight, 1);
      const progress = Math.min(Math.max((viewportHeight - rect.top) / (viewportHeight + rect.height), 0), 1);
      const offset = (progress - 0.5) * 24;
      galleryGrid.style.setProperty("--gallery-row-one", `${offset.toFixed(1)}px`);
      galleryGrid.style.setProperty("--gallery-row-two", `${(-offset * 0.85).toFixed(1)}px`);
      galleryFrame = 0;
    };

    const requestGalleryDepth = () => {
      if (galleryFrame) return;
      galleryFrame = window.requestAnimationFrame(updateGalleryDepth);
    };

    updateGalleryDepth();
    window.addEventListener("scroll", requestGalleryDepth, { passive: true });
  }

  const targetSelector = [
    ":scope > .section-heading",
    ":scope > .section-copy",
    ":scope > .feature-list",
    ":scope > .announcement-carousel",
    ":scope > .gallery-grid",
    ":scope > .gallery-actions",
    ":scope > .gatherings-layout",
    ":scope > .team-grid",
    ":scope > .visit-panel",
    ":scope > .contact-copy",
    ":scope > .contact-actions",
  ].join(",");

  const targets = [];
  home.querySelectorAll(":scope > .section").forEach((section) => {
    section.querySelectorAll(targetSelector).forEach((target, index) => {
      target.classList.add("soft-reveal");
      if (index === 0) target.classList.add("motion-from-left");
      target.style.setProperty("--motion-delay", `${index * 90}ms`);
      targets.push(target);
    });
  });

  if (targets.length === 0) return;
  document.documentElement.classList.add("motion-enabled");

  if (reducedMotion || !("IntersectionObserver" in window)) {
    targets.forEach((target) => target.classList.add("is-shown"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-shown");
          return;
        }

        entry.target.classList.toggle("motion-exit-up", entry.boundingClientRect.top < 0);
        entry.target.classList.remove("is-shown");
      });
    },
    {
      rootMargin: "0px 0px -10%",
      threshold: 0.08,
    },
  );

  targets.forEach((target) => observer.observe(target));
};

syncHeader();
window.addEventListener("scroll", syncHeader, { passive: true });
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeEventPosterModal();
    closePhotoLightbox();
  }
});

announcementList?.addEventListener(
  "wheel",
  (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (target?.closest(".announcement-card")) {
      return;
    }
    routeAnnouncementWheel(event);
  },
  { passive: false },
);

let announcementDrag = null;
announcementList?.addEventListener("pointerdown", (event) => {
  if (event.pointerType !== "mouse" || event.button !== 0) {
    return;
  }

  announcementDrag = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    startScrollLeft: announcementList.scrollLeft,
    active: false,
  };
});

announcementList?.addEventListener("pointermove", (event) => {
  if (!announcementDrag || event.pointerId !== announcementDrag.pointerId) {
    return;
  }

  const deltaX = event.clientX - announcementDrag.startX;
  const deltaY = event.clientY - announcementDrag.startY;
  if (!announcementDrag.active) {
    if (Math.abs(deltaX) < 6 || Math.abs(deltaX) <= Math.abs(deltaY)) {
      return;
    }
    announcementDrag.active = true;
    announcementList.setPointerCapture(event.pointerId);
  }

  announcementList.scrollLeft = announcementDrag.startScrollLeft - deltaX;
  event.preventDefault();
});

const endAnnouncementDrag = (event) => {
  if (!announcementDrag || event.pointerId !== announcementDrag.pointerId) {
    return;
  }
  if (announcementList?.hasPointerCapture(event.pointerId)) {
    announcementList.releasePointerCapture(event.pointerId);
  }
  announcementDrag = null;
};

announcementList?.addEventListener("pointerup", endAnnouncementDrag);
announcementList?.addEventListener("pointercancel", endAnnouncementDrag);
announcementList?.addEventListener("scroll", updateAnnouncementArrows, { passive: true });
window.addEventListener("resize", updateAnnouncementArrows, { passive: true });
announcementPrevious?.addEventListener("click", () => moveAnnouncementsByTwo(-1));
announcementNext?.addEventListener("click", () => moveAnnouncementsByTwo(1));

if (year) {
  year.textContent = new Date().getFullYear();
}

let currentLanguage = getSavedLanguage();
initEventPosterModal();
applyLanguage(currentLanguage);
initPageMotion();
injectEventStructuredData();
loadSupabaseContent();
loadGoogleSheetStudies().then((studies) => {
  if (studies.length > 0) {
    sheetStudies = studies;
    applyLanguage(currentLanguage);
  }
});

languageToggle?.addEventListener("click", () => {
  currentLanguage = currentLanguage === "zh" ? "en" : "zh";
  window.localStorage.setItem("rmbc-language", currentLanguage);
  applyLanguage(currentLanguage);
});

menuButton?.addEventListener("click", () => {
  const isOpen = mobileNav.classList.toggle("is-open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
});

mobileNav?.addEventListener("click", (event) => {
  if (event.target instanceof HTMLAnchorElement) {
    mobileNav.classList.remove("is-open");
    menuButton?.setAttribute("aria-expanded", "false");
  }
});
