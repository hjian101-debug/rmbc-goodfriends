const header = document.querySelector("[data-header]");
const menuButton = document.querySelector("[data-menu-button]");
const mobileNav = document.querySelector("[data-mobile-nav]");
const year = document.querySelector("[data-year]");
const languageToggle = document.querySelector("[data-language-toggle]");
const announcementSection = document.querySelector("[data-announcements-section]");
const announcementList = document.querySelector("[data-announcement-list]");
const gatheringsLayout = document.querySelector("[data-gatherings-layout]");
const eventGrid = document.querySelector("[data-event-grid]");
const scripturePanel = document.querySelector("[data-scripture-panel]");
const gallerySection = document.querySelector("[data-gallery-section]");
const galleryGrid = document.querySelector("[data-gallery-grid]");
const galleryLinks = document.querySelectorAll("[data-gallery-link]");
const teamGrid = document.querySelector("[data-team-grid]");

const adminStorageKey = "rmbc-admin-content";
const supabaseConfig = window.RMBC_SUPABASE_CONFIG || {};
let supabaseClient = null;
let remoteContent = null;

const defaultContent = {
  announcements: [
    {
      id: "welcome",
      active: true,
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
      time: { zh: "10:00 AM", en: "10:00 AM" },
      location: { zh: "RMBC", en: "RMBC" },
      scripture: { zh: "", en: "" },
    },
  ],
  gallery: [
    {
      id: "meme-friday",
      active: true,
      image: "./assets/photos/meme-friday.svg",
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
      title: { zh: "新朋友雷达启动", en: "Welcome Radar On" },
      caption: {
        zh: "第一次来不用紧张，接待同工已经上线。",
        en: "First visit nerves are normal; the welcome team is online.",
      },
      alt: { zh: "欢迎新朋友表情包插画", en: "Welcome radar meme illustration" },
    },
  ],
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
      contact: "hello@rmbc.example",
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
      contact: "hello@rmbc.example",
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
      contact: "hello@rmbc.example",
      avatar: "./assets/avatar-welcome.svg",
    },
  ],
};

const translations = {
  zh: {
    "meta.description": "RMBC 好朋友团契是河滨国语浸信会 Riverside Mandarin Baptist Church 的团契，欢迎 Riverside 学生、职场、家庭和朋友参加周五查经、周日礼拜，一起认识信仰、彼此陪伴。",
    "page.title": "RMBC 好朋友团契 | Riverside Mandarin Baptist Church Good Friends Fellowship",
    "brand.subtitle": "好朋友团契",
    "nav.about": "关于",
    "nav.gatherings": "聚会",
    "nav.gallery": "照片",
    "nav.team": "同工",
    "nav.visit": "来访",
    "nav.contact": "联系",
    "hero.eyebrow": "河滨国语浸信会 Riverside Mandarin Baptist Church",
    "hero.title": "好朋友团契",
    "hero.copy": "在 Riverside 一起吃饭、查经、祷告，也一起把日子过得更有盼望。",
    "hero.firstVisit": "第一次来",
    "hero.thisWeek": "本周聚会",
    "quick.timeLabel": "聚会时间",
    "quick.time": "周五 6:00 PM / 周日 10:00 AM",
    "quick.locationLabel": "地点",
    "quick.location": "周五 Crest Community Church / 周日 RMBC",
    "quick.audienceLabel": "适合对象",
    "quick.audience": "学生、职场、家庭、朋友",
    "about.title": "一个可以慢慢熟起来的地方",
    "about.copy": "好朋友团契欢迎刚到 Riverside 的朋友，也欢迎已经在这里生活很久的人。我们相信信仰不只是周末的安排，也是平日里有人听你说话、为你祷告、与你一起成长。",
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
    "gatherings.worshipTitle": "主日崇拜",
    "gatherings.worshipCopy": "欢迎与我们一同敬拜，也可以在崇拜后留下来认识新朋友。",
    "announcements.title": "团契公告",
    "gallery.title": "团契照片",
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
    "contact.email": "团契邮箱 hello@rmbc.example",
    "contact.welcome": "联系接待同工",
    "contact.map": "查看地图",
    "footer.name": "河滨国语浸信会 RMBC 好朋友团契",
    "footer.admin": "管理员登录",
    "footer.top": "回到顶部",
    "language.label": "English",
    "language.aria": "Switch to English",
  },
  en: {
    "meta.description": "RMBC Good Friends Fellowship is a fellowship of Riverside Mandarin Baptist Church, welcoming students, professionals, families, and friends in Riverside for Friday Bible study and Sunday worship.",
    "page.title": "RMBC Good Friends Fellowship | Riverside Mandarin Baptist Church",
    "brand.subtitle": "Good Friends Fellowship",
    "nav.about": "About",
    "nav.gatherings": "Gatherings",
    "nav.gallery": "Photos",
    "nav.team": "Team",
    "nav.visit": "Visit",
    "nav.contact": "Contact",
    "hero.eyebrow": "Riverside Mandarin Baptist Church",
    "hero.title": "Good Friends Fellowship",
    "hero.copy": "A place in Riverside to share meals, study the Bible, pray together, and walk through life with hope.",
    "hero.firstVisit": "First Visit",
    "hero.thisWeek": "This Week",
    "quick.timeLabel": "Gathering Times",
    "quick.time": "Friday 6:00 PM / Sunday 10:00 AM",
    "quick.locationLabel": "Location",
    "quick.location": "Friday at Crest Community Church / Sunday at RMBC",
    "quick.audienceLabel": "Who Can Come",
    "quick.audience": "Students, professionals, families, and friends",
    "about.title": "A Place To Become Friends",
    "about.copy": "Good Friends Fellowship welcomes people who are new to Riverside as well as those who have lived here for years. We believe faith is not only a weekend routine, but also a life of being heard, prayed for, and encouraged to grow.",
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
    "gatherings.worshipTitle": "Sunday Worship",
    "gatherings.worshipCopy": "Join us for worship, and feel free to stay afterward to meet new friends.",
    "announcements.title": "Fellowship News",
    "gallery.title": "Fellowship Photos",
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
    "contact.email": "Fellowship email hello@rmbc.example",
    "contact.welcome": "Contact the welcome team",
    "contact.map": "View Map",
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
    return {
      announcements: Array.isArray(value.announcements) ? value.announcements : defaultContent.announcements,
      gatherings: Array.isArray(value.gatherings) ? value.gatherings : defaultContent.gatherings,
      gallery: Array.isArray(value.gallery) ? value.gallery : defaultContent.gallery,
      team: Array.isArray(value.team) ? value.team : defaultContent.team,
    };
  }

  return defaultContent;
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

  return defaultContent;
};

const getAdminContent = () => remoteContent || getLocalContent();

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

const renderContent = (language) => {
  const content = getAdminContent();

  if (announcementList && announcementSection) {
    const activeAnnouncements = content.announcements.filter((item) => item.active !== false);
    announcementSection.hidden = activeAnnouncements.length === 0;
    announcementList.replaceChildren(
      ...activeAnnouncements.map((item) => {
        const article = createElement("article", "announcement-card");
        article.append(
          createElement("span", null, item.date || ""),
          createElement("h3", null, localText(item.title, language)),
          createElement("p", null, localText(item.body, language)),
        );
        return article;
      }),
    );
  }

  if (eventGrid) {
    const activeGatherings = content.gatherings.filter((item) => item.active !== false);
    eventGrid.replaceChildren(
      ...activeGatherings.map((item) => {
        const article = createElement("article", "event-card");
        article.append(
          createElement("time", null, localText(item.day, language)),
          createElement("h3", null, localText(item.title, language)),
          createElement("p", null, localText(item.description, language)),
        );

        article.append(createElement("span", null, `${localText(item.time, language)} · ${localText(item.location, language)}`));
        return article;
      }),
    );

    if (scripturePanel && gatheringsLayout) {
      const scriptureItems = activeGatherings
        .map((item) => ({
          title: localText(item.title, language),
          scripture: localText(item.scripture, language),
        }))
        .filter((item) => item.scripture);

      gatheringsLayout.classList.toggle("has-scripture", scriptureItems.length > 0);
      scripturePanel.hidden = scriptureItems.length === 0;
      scripturePanel.replaceChildren();

      if (scriptureItems.length > 0) {
        const heading = document.createElement("div");
        const list = document.createElement("div");
        heading.className = "scripture-heading";
        list.className = "scripture-list";
        heading.append(
          createElement("p", "eyebrow", "Scripture"),
          createElement("h3", null, translations[language]["gatherings.scriptureTitle"]),
        );

        scriptureItems.forEach((item) => {
          const article = createElement("article", "scripture-entry");
          if (item.title) {
            article.append(createElement("span", null, item.title));
          }
          article.append(createElement("p", null, item.scripture));
          list.append(article);
        });

        scripturePanel.append(heading, list);
      }
    }
  }

  if (gallerySection && galleryGrid) {
    const savedPhotos = content.gallery.filter((item) => item.active !== false && item.image);
    const defaultPhotos = defaultContent.gallery.filter((item) => item.active !== false && item.image);
    const activePhotos = savedPhotos.length > 0 ? savedPhotos : defaultPhotos;

    gallerySection.hidden = activePhotos.length === 0;
    galleryLinks.forEach((link) => {
      link.hidden = activePhotos.length === 0;
    });

    const renderGalleryCards = (photos, allowFallback) => {
      galleryGrid.replaceChildren(
        ...photos.map((item) => {
          const article = createElement("article", "gallery-card");
          const image = document.createElement("img");
          const body = document.createElement("div");
          const title = localText(item.title, language);
          const caption = localText(item.caption, language);

          image.src = item.image;
          image.alt = title || localText(item.alt, language) || "Fellowship photo";
          image.loading = "lazy";
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
              }
            }
          });

          article.append(image);
          if (title || caption) {
            if (title) {
              body.append(createElement("h3", null, title));
            }
            if (caption) {
              body.append(createElement("p", null, caption));
            }
            article.append(body);
          }

          return article;
        }),
      );
    };

    renderGalleryCards(activePhotos, savedPhotos.length > 0);
  } else {
    galleryLinks.forEach((link) => {
      link.hidden = true;
    });
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
};

const applyLanguage = (language) => {
  const dictionary = translations[language];
  document.documentElement.lang = language === "zh" ? "zh-Hans" : "en";
  document.title = dictionary["page.title"];

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
  header.classList.toggle("is-scrolled", window.scrollY > 20);
};

syncHeader();
window.addEventListener("scroll", syncHeader, { passive: true });

if (year) {
  year.textContent = new Date().getFullYear();
}

let currentLanguage = getSavedLanguage();
applyLanguage(currentLanguage);
loadSupabaseContent();

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
