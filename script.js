const header = document.querySelector("[data-header]");
const menuButton = document.querySelector("[data-menu-button]");
const mobileNav = document.querySelector("[data-mobile-nav]");
const year = document.querySelector("[data-year]");
const languageToggle = document.querySelector("[data-language-toggle]");

const translations = {
  zh: {
    "meta.description": "河滨国语浸信会 RMBC 好朋友团契，欢迎学生、职场新人、家庭和朋友一起认识信仰、彼此陪伴。",
    "page.title": "RMBC 好朋友团契",
    "brand.subtitle": "好朋友团契",
    "nav.about": "关于",
    "nav.gatherings": "聚会",
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
    "gatherings.worshipTitle": "主日崇拜",
    "gatherings.worshipCopy": "欢迎与我们一同敬拜，也可以在崇拜后留下来认识新朋友。",
    "team.title": "同工团队",
    "team.note": "后续可以把照片、姓名、服事内容和联系方式替换成真实资料。",
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
    "contact.copy": "把下面的联系方式换成团契实际同工信息后，就可以正式发布。",
    "contact.email": "团契邮箱 hello@rmbc.example",
    "contact.welcome": "联系接待同工",
    "contact.wechat": "微信群二维码稍后添加",
    "contact.map": "查看地图",
    "footer.name": "河滨国语浸信会 RMBC 好朋友团契",
    "footer.top": "回到顶部",
    "language.label": "English",
    "language.aria": "Switch to English",
  },
  en: {
    "meta.description": "RMBC Good Friends Fellowship welcomes students, professionals, families, and friends to grow in faith and community.",
    "page.title": "RMBC Good Friends Fellowship",
    "brand.subtitle": "Good Friends Fellowship",
    "nav.about": "About",
    "nav.gatherings": "Gatherings",
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
    "gatherings.worshipTitle": "Sunday Worship",
    "gatherings.worshipCopy": "Join us for worship, and feel free to stay afterward to meet new friends.",
    "team.title": "Serving Team",
    "team.note": "Photos, names, ministry roles, and contact details can be updated with real team information later.",
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
    "contact.copy": "Replace the placeholders below with real fellowship contact details before sharing widely.",
    "contact.email": "Fellowship email hello@rmbc.example",
    "contact.welcome": "Contact the welcome team",
    "contact.wechat": "WeChat QR code coming soon",
    "contact.map": "View Map",
    "footer.name": "RMBC Good Friends Fellowship",
    "footer.top": "Back To Top",
    "language.label": "中文",
    "language.aria": "切换到中文",
  },
};

const getSavedLanguage = () => {
  const saved = window.localStorage.getItem("rmbc-language");
  return saved === "en" || saved === "zh" ? saved : "zh";
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
