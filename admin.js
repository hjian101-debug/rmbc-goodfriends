const loginPanel = document.querySelector("[data-login-panel]");
const dashboard = document.querySelector("[data-dashboard]");
const loginForm = document.querySelector("[data-login-form]");
const loginMessage = document.querySelector("[data-login-message]");
const logoutButton = document.querySelector("[data-logout-button]");
const exportButton = document.querySelector("[data-export-button]");
const resetButton = document.querySelector("[data-reset-button]");
const addButtons = document.querySelectorAll("[data-add]");

const adminStorageKey = "rmbc-admin-content";
const adminUsername = "gff";
const adminPassword = "gff123";

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

let content = loadContent();

function cloneContent(value) {
  return JSON.parse(JSON.stringify(value));
}

function ensureLocalizedValue(value) {
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

function normalizeContent(value) {
  const next = cloneContent(value);

  next.gatherings = next.gatherings.map((item) => ({
    ...item,
    day: ensureLocalizedValue(item.day),
    title: ensureLocalizedValue(item.title),
    description: ensureLocalizedValue(item.description),
    time: ensureLocalizedValue(item.time),
    location: ensureLocalizedValue(item.location),
    scripture: ensureLocalizedValue(item.scripture),
  }));

  return next;
}

function normalizeLoginValue(value) {
  return String(value || "")
    .normalize("NFKC")
    .trim();
}

function loadContent() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(adminStorageKey));
    if (saved && typeof saved === "object") {
      return normalizeContent({
        announcements: Array.isArray(saved.announcements) ? saved.announcements : defaultContent.announcements,
        gatherings: Array.isArray(saved.gatherings) ? saved.gatherings : defaultContent.gatherings,
        team: Array.isArray(saved.team) ? saved.team : defaultContent.team,
      });
    }
  } catch (error) {
    window.localStorage.removeItem(adminStorageKey);
  }

  return normalizeContent(defaultContent);
}

function saveContent() {
  window.localStorage.setItem(adminStorageKey, JSON.stringify(content));
}

function showDashboard() {
  loginPanel.hidden = true;
  dashboard.hidden = false;
  renderAll();
}

function showLogin() {
  loginPanel.hidden = false;
  dashboard.hidden = true;
}

function textValue(value, fallback = "") {
  return value || fallback;
}

function createInput(labelText, value, onInput, options = {}) {
  const label = document.createElement("label");
  label.className = options.full ? "full" : "";
  label.textContent = labelText;

  const field = options.multiline ? document.createElement("textarea") : document.createElement("input");
  field.value = textValue(value);
  field.addEventListener("input", () => {
    onInput(field.value);
    saveContent();
  });

  label.append(field);
  return label;
}

function cardHeader(title, subtitle, collection, item) {
  const header = document.createElement("header");
  const titleBlock = document.createElement("div");
  const heading = document.createElement("h3");
  const note = document.createElement("p");
  const actions = document.createElement("div");
  const remove = document.createElement("button");

  heading.textContent = title;
  note.textContent = subtitle;
  actions.className = "card-actions";
  remove.className = "small-button danger-button";
  remove.type = "button";
  remove.textContent = "删除";
  remove.addEventListener("click", () => {
    content[collection] = content[collection].filter((entry) => entry.id !== item.id);
    saveContent();
    renderAll();
  });

  titleBlock.append(heading, note);
  actions.append(remove);
  header.append(titleBlock, actions);
  return header;
}

function activeToggle(item) {
  const label = document.createElement("label");
  const input = document.createElement("input");
  label.className = "status-row";
  input.type = "checkbox";
  input.checked = item.active !== false;
  input.addEventListener("change", () => {
    item.active = input.checked;
    saveContent();
  });
  label.append(input, document.createTextNode("在公开网站显示"));
  return label;
}

function renderGatherings() {
  const list = document.querySelector('[data-list="gatherings"]');
  list.replaceChildren(
    ...content.gatherings.map((item) => {
      const card = document.createElement("article");
      const fields = document.createElement("div");
      card.className = "editor-card";
      fields.className = "field-grid";

      fields.append(
        createInput("中文日期", item.day.zh, (value) => { item.day.zh = value; }),
        createInput("English day", item.day.en, (value) => { item.day.en = value; }),
        createInput("中文标题", item.title.zh, (value) => { item.title.zh = value; }),
        createInput("English title", item.title.en, (value) => { item.title.en = value; }),
        createInput("中文时间", item.time.zh, (value) => { item.time.zh = value; }),
        createInput("English time", item.time.en, (value) => { item.time.en = value; }),
        createInput("中文地点", item.location.zh, (value) => { item.location.zh = value; }, { full: true }),
        createInput("English location", item.location.en, (value) => { item.location.en = value; }, { full: true }),
        createInput("中文查经经文", item.scripture.zh, (value) => { item.scripture.zh = value; }, { full: true }),
        createInput("English scripture", item.scripture.en, (value) => { item.scripture.en = value; }, { full: true }),
        createInput("中文说明", item.description.zh, (value) => { item.description.zh = value; }, { full: true, multiline: true }),
        createInput("English description", item.description.en, (value) => { item.description.en = value; }, { full: true, multiline: true }),
      );

      card.append(
        cardHeader(item.title.zh || "聚会", item.time.zh || "", "gatherings", item),
        fields,
        activeToggle(item),
      );
      return card;
    }),
  );
}

function renderTeam() {
  const list = document.querySelector('[data-list="team"]');
  list.replaceChildren(
    ...content.team.map((item) => {
      const card = document.createElement("article");
      const fields = document.createElement("div");
      card.className = "editor-card";
      fields.className = "field-grid";

      fields.append(
        createInput("中文姓名/岗位", item.name.zh, (value) => { item.name.zh = value; }),
        createInput("English name/role", item.name.en, (value) => { item.name.en = value; }),
        createInput("中文服事", item.role.zh, (value) => { item.role.zh = value; }),
        createInput("English ministry", item.role.en, (value) => { item.role.en = value; }),
        createInput("联系方式", item.contact, (value) => { item.contact = value; }),
        createInput("头像网址", item.avatar, (value) => { item.avatar = value; }),
        createInput("中文简介", item.bio.zh, (value) => { item.bio.zh = value; }, { full: true, multiline: true }),
        createInput("English bio", item.bio.en, (value) => { item.bio.en = value; }, { full: true, multiline: true }),
      );

      card.append(
        cardHeader(item.name.zh || "同工", item.role.zh || "", "team", item),
        fields,
        activeToggle(item),
      );
      return card;
    }),
  );
}

function renderAnnouncements() {
  const list = document.querySelector('[data-list="announcements"]');
  list.replaceChildren(
    ...content.announcements.map((item) => {
      const card = document.createElement("article");
      const fields = document.createElement("div");
      card.className = "editor-card";
      fields.className = "field-grid";

      fields.append(
        createInput("日期", item.date, (value) => { item.date = value; }),
        createInput("中文标题", item.title.zh, (value) => { item.title.zh = value; }),
        createInput("English title", item.title.en, (value) => { item.title.en = value; }),
        createInput("中文公告", item.body.zh, (value) => { item.body.zh = value; }, { full: true, multiline: true }),
        createInput("English announcement", item.body.en, (value) => { item.body.en = value; }, { full: true, multiline: true }),
      );

      card.append(
        cardHeader(item.title.zh || "公告", item.date || "", "announcements", item),
        fields,
        activeToggle(item),
      );
      return card;
    }),
  );
}

function renderAll() {
  renderGatherings();
  renderTeam();
  renderAnnouncements();
}

function createEmptyItem(collection) {
  const id = `${collection}-${Date.now()}`;

  if (collection === "gatherings") {
    return {
      id,
      active: true,
      day: { zh: "周五", en: "Friday" },
      title: { zh: "新聚会", en: "New Gathering" },
      description: { zh: "", en: "" },
      time: { zh: "", en: "" },
      location: { zh: "", en: "" },
      scripture: { zh: "", en: "" },
    };
  }

  if (collection === "team") {
    return {
      id,
      active: true,
      name: { zh: "新同工", en: "New Team Member" },
      role: { zh: "", en: "" },
      bio: { zh: "", en: "" },
      contact: "",
      avatar: "./assets/avatar-welcome.svg",
    };
  }

  return {
    id,
    active: true,
    date: new Date().toISOString().slice(0, 10),
    title: { zh: "新公告", en: "New Announcement" },
    body: { zh: "", en: "" },
  };
}

loginForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(loginForm);
  const username = normalizeLoginValue(formData.get("username")).toLowerCase();
  const password = normalizeLoginValue(formData.get("password"));

  if (username === adminUsername && password === adminPassword) {
    loginMessage.textContent = "";
    showDashboard();
    return;
  }

  loginMessage.textContent = "账号或密码不正确。";
});

logoutButton?.addEventListener("click", () => {
  showLogin();
});

exportButton?.addEventListener("click", async () => {
  const data = JSON.stringify(content, null, 2);
  await navigator.clipboard.writeText(data);
  exportButton.textContent = "已复制到剪贴板";
  window.setTimeout(() => {
    exportButton.textContent = "导出数据";
  }, 1800);
});

resetButton?.addEventListener("click", () => {
  content = normalizeContent(defaultContent);
  saveContent();
  renderAll();
});

addButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const collection = button.dataset.add;
    content[collection].push(createEmptyItem(collection));
    saveContent();
    renderAll();
  });
});

showLogin();
