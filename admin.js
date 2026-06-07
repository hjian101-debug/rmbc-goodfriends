const loginPanel = document.querySelector("[data-login-panel]");
const dashboard = document.querySelector("[data-dashboard]");
const loginForm = document.querySelector("[data-login-form]");
const loginMessage = document.querySelector("[data-login-message]");
const logoutButton = document.querySelector("[data-logout-button]");
const saveButton = document.querySelector("[data-save-button]");
const exportButton = document.querySelector("[data-export-button]");
const refreshButton = document.querySelector("[data-refresh-button]");
const resetButton = document.querySelector("[data-reset-button]");
const saveStatus = document.querySelector("[data-save-status]");
const addButtons = document.querySelectorAll("[data-add]");
const adminPageButtons = document.querySelectorAll("[data-admin-page]");
const adminSections = document.querySelectorAll("[data-admin-section]");
const adminGalleryCategoryButtons = document.querySelectorAll("[data-admin-gallery-category]");

const adminStorageKey = "rmbc-admin-content";
const adminPageStorageKey = "rmbc-admin-page";
const supabaseConfig = window.RMBC_SUPABASE_CONFIG || {};
const storageBucket = supabaseConfig.storageBucket || "site-media";
const studiesSheetConfig = supabaseConfig.studiesSheet || {};
let supabaseClient = null;
let hasUnsavedChanges = false;
let isSaving = false;
let activeAdminPage = "gatherings";
let activeGalleryCategory = "fellowship";

function getStudiesSheetUrl() {
  if (studiesSheetConfig.editUrl) {
    return studiesSheetConfig.editUrl;
  }

  if (studiesSheetConfig.id) {
    return `https://docs.google.com/spreadsheets/d/${studiesSheetConfig.id}/edit`;
  }

  return "";
}

function createElement(tagName, className, content) {
  const element = document.createElement(tagName);
  if (className) {
    element.className = className;
  }

  if (Array.isArray(content)) {
    element.append(...content);
  } else if (content) {
    element.textContent = content;
  }

  return element;
}

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

const photoCategories = [
  { id: "fellowship", title: "团契聚会" },
  { id: "activity", title: "活动日" },
];
const placeholderPhotoTitles = new Set(["团契照片", "Fellowship Photo"]);

let content = normalizeContent(defaultContent);

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

function normalizePhotoTitle(value) {
  const title = ensureLocalizedValue(value);
  return {
    zh: placeholderPhotoTitles.has(title.zh) ? "" : title.zh,
    en: placeholderPhotoTitles.has(title.en) ? "" : title.en,
  };
}

function normalizePhotoCategoryDescriptions(value) {
  return Object.fromEntries(
    photoCategories.map((category) => [
      category.id,
      ensureLocalizedValue(value?.[category.id]),
    ]),
  );
}

function normalizeContent(value) {
  const next = cloneContent(value && typeof value === "object" ? value : defaultContent);

  next.announcements = Array.isArray(next.announcements) ? next.announcements : defaultContent.announcements;
  next.gatherings = Array.isArray(next.gatherings) ? next.gatherings : defaultContent.gatherings;
  next.studies = Array.isArray(next.studies) ? next.studies : defaultContent.studies;
  next.gallery = Array.isArray(next.gallery) ? next.gallery : defaultContent.gallery;
  next.photoCategoryDescriptions = normalizePhotoCategoryDescriptions(next.photoCategoryDescriptions);
  next.team = Array.isArray(next.team) ? next.team : defaultContent.team;

  next.gatherings = next.gatherings.map((item) => ({
    ...item,
    day: ensureLocalizedValue(item.day),
    title: ensureLocalizedValue(item.title),
    description: ensureLocalizedValue(item.description),
    time: ensureLocalizedValue(item.time),
    location: ensureLocalizedValue(item.location),
    liveTime: ensureLocalizedValue(item.liveTime),
    liveUrl: item.liveUrl || "",
    scripture: ensureLocalizedValue(item.scripture),
  }));
  next.gallery = (Array.isArray(next.gallery) ? next.gallery : []).map((item) => ({
    ...item,
    category: photoCategories.some((category) => category.id === item.category) ? item.category : "fellowship",
    title: normalizePhotoTitle(item.title),
    caption: ensureLocalizedValue(item.caption),
    alt: ensureLocalizedValue(item.alt),
    image: item.image || "",
  }));
  next.studies = (Array.isArray(next.studies) ? next.studies : []).map((item) => ({
    ...item,
    date: item.date || "",
    title: ensureLocalizedValue(item.title),
    passage: ensureLocalizedValue(item.passage),
    scripture: ensureLocalizedValue(item.scripture),
    summary: ensureLocalizedValue(item.summary),
  }));

  return next;
}

function normalizeLoginValue(value) {
  return String(value || "")
    .normalize("NFKC")
    .trim();
}

function resolveLoginEmail(value) {
  const username = normalizeLoginValue(value).toLowerCase();
  return username.includes("@") ? username : `${username}@rmbc.local`;
}

function hasSupabaseConfig() {
  return Boolean(supabaseConfig.url && supabaseConfig.anonKey && window.supabase);
}

function getSupabaseClient() {
  if (!hasSupabaseConfig()) {
    return null;
  }

  if (!supabaseClient) {
    supabaseClient = window.supabase.createClient(supabaseConfig.url, supabaseConfig.anonKey);
  }

  return supabaseClient;
}

function setLoginMessage(message) {
  if (loginMessage) {
    loginMessage.textContent = message;
  }
}

function setSaveStatus(message, tone = "idle") {
  if (saveStatus) {
    saveStatus.textContent = message;
    saveStatus.dataset.tone = tone;
  }
}

function updateSaveButton() {
  if (!saveButton) {
    return;
  }

  saveButton.disabled = isSaving || !hasUnsavedChanges;
  saveButton.textContent = isSaving ? "保存中..." : hasUnsavedChanges ? "保存到网站" : "已保存";
}

function markUnsaved(message = "有未保存修改") {
  hasUnsavedChanges = true;
  setSaveStatus(message, "dirty");
  updateSaveButton();
}

function loadLocalContent() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(adminStorageKey));
    if (saved && typeof saved === "object") {
      return normalizeContent({
        announcements: Array.isArray(saved.announcements) ? saved.announcements : defaultContent.announcements,
        gatherings: Array.isArray(saved.gatherings) ? saved.gatherings : defaultContent.gatherings,
        studies: Array.isArray(saved.studies) ? saved.studies : defaultContent.studies,
        gallery: Array.isArray(saved.gallery) ? saved.gallery : defaultContent.gallery,
        photoCategoryDescriptions: saved.photoCategoryDescriptions || defaultContent.photoCategoryDescriptions,
        team: Array.isArray(saved.team) ? saved.team : defaultContent.team,
      });
    }
  } catch (error) {
    window.localStorage.removeItem(adminStorageKey);
  }

  return normalizeContent(defaultContent);
}

async function loadRemoteContent() {
  const client = getSupabaseClient();
  if (!client) {
    content = loadLocalContent();
    return;
  }

  const { data, error } = await client
    .from("site_content")
    .select("value")
    .eq("key", supabaseConfig.contentKey || "main")
    .maybeSingle();

  if (error) {
    throw error;
  }

  content = normalizeContent(data?.value || defaultContent);
  window.localStorage.setItem(adminStorageKey, JSON.stringify(content));
}

async function saveRemoteContent() {
  const client = getSupabaseClient();
  if (!client) {
    setSaveStatus("已保存在本机，尚未发布到网站", "dirty");
    updateSaveButton();
    return false;
  }

  isSaving = true;
  setSaveStatus("正在保存到网站...", "saving");
  updateSaveButton();

  const { error } = await client
    .from("site_content")
    .upsert({
      key: supabaseConfig.contentKey || "main",
      value: content,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    setLoginMessage("保存到 Supabase 失败，请检查网络或权限。");
    setSaveStatus("保存失败，公开网站未更新", "error");
    isSaving = false;
    updateSaveButton();
    console.error(error);
    return false;
  }

  setLoginMessage("已保存到 Supabase。");
  hasUnsavedChanges = false;
  isSaving = false;
  setSaveStatus(`已保存到网站 ${new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}`, "saved");
  updateSaveButton();
  return true;
}

function saveContent(message = "有未保存修改") {
  window.localStorage.setItem(adminStorageKey, JSON.stringify(content));
  markUnsaved(message);
}

async function showDashboard() {
  loginPanel.hidden = true;
  dashboard.hidden = false;
  setActiveAdminPage(window.localStorage.getItem(adminPageStorageKey) || activeAdminPage);
  setLoginMessage("正在读取 Supabase 内容...");
  try {
    await loadRemoteContent();
    setLoginMessage("");
    setSaveStatus("已读取数据库", "saved");
    hasUnsavedChanges = false;
    isSaving = false;
    updateSaveButton();
  } catch (error) {
    setLoginMessage("读取 Supabase 内容失败，请检查数据库表和权限。");
    setSaveStatus("读取失败", "error");
    updateSaveButton();
    console.error(error);
  }
  renderAll();
}

function showLogin() {
  loginPanel.hidden = false;
  dashboard.hidden = true;
}

function textValue(value, fallback = "") {
  return value || fallback;
}

function resizeMultilineField(field) {
  field.style.height = "auto";
  field.style.height = `${field.scrollHeight + 2}px`;
}

function createInput(labelText, value, onInput, options = {}) {
  const label = document.createElement("label");
  label.className = options.full ? "full" : "";
  label.textContent = labelText;

  const field = options.multiline ? document.createElement("textarea") : document.createElement("input");
  field.value = textValue(value);
  if (options.multiline) {
    field.rows = 1;
  }
  field.addEventListener("input", () => {
    onInput(field.value);
    if (options.multiline) {
      resizeMultilineField(field);
    }
    saveContent();
  });
  if (options.multiline) {
    window.requestAnimationFrame(() => {
      resizeMultilineField(field);
    });
  }

  label.append(field);
  return label;
}

function createEditorSubsection(title, ...children) {
  const wrapper = document.createElement("div");
  const heading = document.createElement("h4");
  const grid = document.createElement("div");

  wrapper.className = "editor-subsection full";
  heading.textContent = title;
  grid.className = "field-grid";
  grid.append(...children);
  wrapper.append(heading, grid);
  return wrapper;
}

function moveItem(collection, index, direction) {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= content[collection].length) {
    return;
  }

  const entries = content[collection];
  [entries[index], entries[nextIndex]] = [entries[nextIndex], entries[index]];
  saveContent();
  renderAll();
}

function moveGalleryItem(index, categoryId, direction) {
  const categoryIndexes = content.gallery
    .map((item, itemIndex) => ((item.category || "fellowship") === categoryId ? itemIndex : -1))
    .filter((itemIndex) => itemIndex >= 0);
  const currentPosition = categoryIndexes.indexOf(index);
  const nextPosition = currentPosition + direction;

  if (currentPosition < 0 || nextPosition < 0 || nextPosition >= categoryIndexes.length) {
    return;
  }

  const nextIndex = categoryIndexes[nextPosition];
  [content.gallery[index], content.gallery[nextIndex]] = [content.gallery[nextIndex], content.gallery[index]];
  saveContent();
  renderAll();
}

function cardHeader(title, subtitle, collection, item, index) {
  const header = document.createElement("header");
  const titleBlock = document.createElement("div");
  const heading = document.createElement("h3");
  const note = document.createElement("p");
  const actions = document.createElement("div");
  const up = document.createElement("button");
  const down = document.createElement("button");
  const remove = document.createElement("button");

  heading.textContent = title;
  note.textContent = subtitle;
  actions.className = "card-actions";
  up.className = "small-button";
  up.type = "button";
  up.textContent = "上移";
  up.disabled = index === 0;
  up.addEventListener("click", () => {
    moveItem(collection, index, -1);
  });

  down.className = "small-button";
  down.type = "button";
  down.textContent = "下移";
  down.disabled = index === content[collection].length - 1;
  down.addEventListener("click", () => {
    moveItem(collection, index, 1);
  });

  remove.className = "small-button danger-button";
  remove.type = "button";
  remove.textContent = "删除";
  remove.addEventListener("click", () => {
    if (!window.confirm(`确定删除「${title}」吗？删除后需要点击「保存到网站」才会更新公开网站。`)) {
      return;
    }

    content[collection] = content[collection].filter((entry) => entry.id !== item.id);
    saveContent();
    renderAll();
  });

  titleBlock.append(heading, note);
  actions.append(up, down, remove);
  header.append(titleBlock, actions);
  return header;
}

function galleryCardHeader(title, subtitle, item, index, categoryId, position, total) {
  const header = document.createElement("header");
  const titleBlock = document.createElement("div");
  const heading = document.createElement("h3");
  const note = document.createElement("p");
  const actions = document.createElement("div");
  const up = document.createElement("button");
  const down = document.createElement("button");
  const remove = document.createElement("button");
  const displayTitle = title || "照片";

  heading.textContent = displayTitle;
  note.textContent = subtitle;
  actions.className = "card-actions";
  up.className = "small-button";
  up.type = "button";
  up.textContent = "上移";
  up.disabled = position === 0;
  up.addEventListener("click", () => {
    moveGalleryItem(index, categoryId, -1);
  });

  down.className = "small-button";
  down.type = "button";
  down.textContent = "下移";
  down.disabled = position === total - 1;
  down.addEventListener("click", () => {
    moveGalleryItem(index, categoryId, 1);
  });

  remove.className = "small-button danger-button";
  remove.type = "button";
  remove.textContent = "删除";
  remove.addEventListener("click", () => {
    if (!window.confirm(`确定删除「${displayTitle}」吗？删除后需要点击「保存到网站」才会更新公开网站。`)) {
      return;
    }

    content.gallery = content.gallery.filter((entry) => entry.id !== item.id);
    saveContent();
    renderAll();
  });

  titleBlock.append(heading, note);
  actions.append(up, down, remove);
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

function safeFileName(fileName) {
  return String(fileName || "photo")
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "photo";
}

async function uploadImageFile(item, field, file, button, options = {}) {
  const client = getSupabaseClient();
  const label = options.label || "图片";
  if (!client) {
    setSaveStatus("请先连接 Supabase", "error");
    return;
  }

  if (!file || !file.type.startsWith("image/")) {
    setSaveStatus("请选择图片文件", "error");
    return;
  }

  if (file.size > 10 * 1024 * 1024) {
    setSaveStatus("图片不能超过 10MB", "error");
    return;
  }

  const originalText = button.textContent;
  button.disabled = true;
  button.textContent = "上传中...";
  setSaveStatus(`正在上传${label}...`, "saving");

  const folder = options.folder || "uploads";
  const path = `${folder}/${item.id}-${Date.now()}-${safeFileName(file.name)}`;
  const { error } = await client.storage.from(storageBucket).upload(path, file, {
    cacheControl: "3600",
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    button.disabled = false;
    button.textContent = originalText;
    setSaveStatus(`${label}上传失败`, "error");
    console.error(error);
    return;
  }

  const { data } = client.storage.from(storageBucket).getPublicUrl(path);
  item[field] = data.publicUrl;
  if (field === "image" && !item.alt.zh && item.title.zh) {
    item.alt.zh = item.title.zh;
  }
  if (field === "image" && !item.alt.en && item.title.en) {
    item.alt.en = item.title.en;
  }

  saveContent(`${label}已上传，有未保存修改`);
  renderAll();
}

function createImageUpload(item, options) {
  const wrapper = document.createElement("div");
  const preview = document.createElement("img");
  const controls = document.createElement("div");
  const upload = document.createElement("button");
  const fileInput = document.createElement("input");
  const field = options.field || "image";

  wrapper.className = `image-upload ${options.compact ? "avatar-upload " : ""}full`;
  preview.className = `image-preview ${options.compact ? "avatar-preview" : ""}`;
  preview.src = item[field] || options.fallback || "./assets/hero-fellowship.svg";
  preview.alt = options.alt || item.alt?.zh || item.title?.zh || item.name?.zh || "图片预览";

  controls.className = "upload-controls";
  upload.type = "button";
  upload.className = "small-button";
  upload.textContent = options.buttonText || "上传图片";
  fileInput.type = "file";
  fileInput.accept = "image/jpeg,image/png,image/webp,image/gif";
  fileInput.hidden = true;

  upload.addEventListener("click", () => {
    fileInput.click();
  });

  fileInput.addEventListener("change", async () => {
    const file = fileInput.files?.[0];
    if (file) {
      await uploadImageFile(item, field, file, upload, options);
      fileInput.value = "";
    }
  });

  controls.append(upload, fileInput);
  wrapper.append(preview, controls);
  return wrapper;
}

function createGalleryUpload(item) {
  return createImageUpload(item, {
    field: "image",
    folder: "gallery",
    label: "照片",
    buttonText: "上传照片",
    fallback: "./assets/hero-fellowship.svg",
    alt: item.alt.zh || item.title.zh || "照片预览",
  });
}

function createAvatarUpload(item) {
  return createImageUpload(item, {
    field: "avatar",
    folder: "team",
    label: "头像",
    buttonText: "上传头像",
    fallback: "./assets/avatar-welcome.svg",
    alt: item.name.zh || "头像预览",
    compact: true,
  });
}

function renderGatherings() {
  const list = document.querySelector('[data-list="gatherings"]');
  list.replaceChildren(
    ...content.gatherings.map((item, index) => {
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
        createInput("直播链接", item.liveUrl, (value) => { item.liveUrl = value; }, { full: true }),
        createInput("中文直播时间", item.liveTime.zh, (value) => { item.liveTime.zh = value; }),
        createInput("English livestream time", item.liveTime.en, (value) => { item.liveTime.en = value; }),
        createInput("中文说明", item.description.zh, (value) => { item.description.zh = value; }, { full: true, multiline: true }),
        createInput("English description", item.description.en, (value) => { item.description.en = value; }, { full: true, multiline: true }),
        createEditorSubsection(
          "查经经文",
          createInput("中文经文", item.scripture.zh, (value) => { item.scripture.zh = value; }, { full: true, multiline: true }),
          createInput("English scripture", item.scripture.en, (value) => { item.scripture.en = value; }, { full: true, multiline: true }),
        ),
      );

      card.append(
        cardHeader(item.title.zh || "聚会", item.time.zh || "", "gatherings", item, index),
        fields,
        activeToggle(item),
      );
      return card;
    }),
  );
}

function renderGallery() {
  const list = document.querySelector('[data-list="gallery"]');
  const category = photoCategories.find((entry) => entry.id === activeGalleryCategory) || photoCategories[0];
  const section = document.createElement("section");
  const heading = document.createElement("h3");
  const categoryItems = content.gallery
    .map((item, index) => ({ item, index }))
    .filter((entry) => (entry.item.category || "fellowship") === category.id);
  const description = content.photoCategoryDescriptions[category.id];

  section.className = "editor-group";
  heading.textContent = category.title;
  section.append(
    heading,
    createEditorSubsection(
      "分类说明",
      createInput("中文说明", description.zh, (value) => { description.zh = value; }, { full: true, multiline: true }),
      createInput("English description", description.en, (value) => { description.en = value; }, { full: true, multiline: true }),
    ),
  );

  if (categoryItems.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-note";
    empty.textContent = "这个分类还没有照片。点击右上角「新增照片」后，照片会直接加入这里。";
    section.append(empty);
  }

  categoryItems.forEach(({ item, index }, position) => {
    const card = document.createElement("article");
    const fields = document.createElement("div");
    card.className = "editor-card";
    fields.className = "field-grid";

    fields.append(
      createGalleryUpload(item),
      createInput("中文标题", item.title.zh, (value) => {
        item.title.zh = value;
        item.alt.zh = value;
      }),
      createInput("English title", item.title.en, (value) => {
        item.title.en = value;
        item.alt.en = value;
      }),
    );

    card.append(
      galleryCardHeader(item.title.zh || "", item.image ? category.title : "等待上传照片", item, index, category.id, position, categoryItems.length),
      fields,
      activeToggle(item),
    );
    section.append(card);
  });

  list.replaceChildren(section);
}

function renderStudies() {
  const list = document.querySelector('[data-list="studies"]');
  const sheetUrl = getStudiesSheetUrl();
  const addButton = document.querySelector('[data-add="studies"]');

  if (addButton) {
    addButton.hidden = Boolean(sheetUrl);
  }

  if (sheetUrl) {
    const card = document.createElement("article");
    const header = document.createElement("header");
    const actions = document.createElement("div");
    const columns = document.createElement("div");
    const note = document.createElement("p");
    const link = document.createElement("a");

    card.className = "editor-card sheet-admin-card";
    actions.className = "card-actions";
    columns.className = "sheet-columns";
    note.className = "empty-note";
    note.textContent = "以后查经归档直接在 Google Sheet 里新增一行。公开网站会读取显示中的内容，按日期从新到旧排列。";
    link.className = "sheet-link";
    link.href = sheetUrl;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = "打开 Google Sheet";

    header.append(
      createElement("div", null, [
        createElement("h3", null, "用 Google Sheet 管理查经归档"),
        createElement("p", null, "后台这里不再堆很多查经表单，内容统一放在表格里。"),
      ]),
      actions,
    );
    actions.append(link);
    [
      "日期",
      "中文题目",
      "English title",
      "中文经文",
      "English passage",
      "中文大致内容",
      "English summary",
      "是否显示",
    ].forEach((label) => {
      columns.append(createElement("span", null, label));
    });

    card.append(header, note, columns);
    list.replaceChildren(card);
    return;
  }

  list.replaceChildren(
    ...content.studies.map((item, index) => {
      const card = document.createElement("article");
      const fields = document.createElement("div");
      card.className = "editor-card";
      fields.className = "field-grid";

      fields.append(
        createInput("日期", item.date, (value) => { item.date = value; }),
        createInput("中文主题", item.title.zh, (value) => { item.title.zh = value; }),
        createInput("English title", item.title.en, (value) => { item.title.en = value; }),
        createInput("中文经文出处", item.passage.zh, (value) => { item.passage.zh = value; }),
        createInput("English passage", item.passage.en, (value) => { item.passage.en = value; }),
        createInput("中文经文内容", item.scripture.zh, (value) => { item.scripture.zh = value; }, { full: true, multiline: true }),
        createInput("English scripture", item.scripture.en, (value) => { item.scripture.en = value; }, { full: true, multiline: true }),
        createInput("中文查经重点", item.summary.zh, (value) => { item.summary.zh = value; }, { full: true, multiline: true }),
        createInput("English study notes", item.summary.en, (value) => { item.summary.en = value; }, { full: true, multiline: true }),
      );

      card.append(
        cardHeader(item.title.zh || "查经内容", item.date || item.passage.zh || "", "studies", item, index),
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
    ...content.team.map((item, index) => {
      const card = document.createElement("article");
      const fields = document.createElement("div");
      card.className = "editor-card";
      fields.className = "field-grid";

      fields.append(
        createAvatarUpload(item),
        createInput("中文姓名/岗位", item.name.zh, (value) => { item.name.zh = value; }),
        createInput("English name/role", item.name.en, (value) => { item.name.en = value; }),
        createInput("中文服事", item.role.zh, (value) => { item.role.zh = value; }),
        createInput("English ministry", item.role.en, (value) => { item.role.en = value; }),
        createInput("联系方式", item.contact, (value) => { item.contact = value; }),
        createInput("中文简介", item.bio.zh, (value) => { item.bio.zh = value; }, { full: true, multiline: true }),
        createInput("English bio", item.bio.en, (value) => { item.bio.en = value; }, { full: true, multiline: true }),
      );

      card.append(
        cardHeader(item.name.zh || "同工", item.role.zh || "", "team", item, index),
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
    ...content.announcements.map((item, index) => {
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
        cardHeader(item.title.zh || "公告", item.date || "", "announcements", item, index),
        fields,
        activeToggle(item),
      );
      return card;
    }),
  );
}

function renderAll() {
  renderGatherings();
  renderGallery();
  renderStudies();
  renderTeam();
  renderAnnouncements();
}

function setActiveAdminPage(page) {
  const hasPage = [...adminSections].some((section) => section.dataset.adminSection === page);
  const nextPage = hasPage ? page : "gatherings";
  activeAdminPage = nextPage;
  window.localStorage.setItem(adminPageStorageKey, nextPage);

  adminSections.forEach((section) => {
    section.hidden = section.dataset.adminSection !== nextPage;
  });

  adminPageButtons.forEach((button) => {
    const isActive = button.dataset.adminPage === nextPage;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-current", isActive ? "page" : "false");
  });

  adminGalleryCategoryButtons.forEach((button) => {
    const isActive = nextPage === "gallery" && button.dataset.adminGalleryCategory === activeGalleryCategory;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-current", isActive ? "page" : "false");
  });

  document.querySelector(".admin-nav-group")?.classList.toggle("is-open", nextPage === "gallery");
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
      liveTime: { zh: "", en: "" },
      liveUrl: "",
      scripture: { zh: "", en: "" },
    };
  }

  if (collection === "gallery") {
    return {
      id,
      active: true,
      image: "",
      category: activeGalleryCategory,
      title: { zh: "", en: "" },
      caption: { zh: "", en: "" },
      alt: { zh: "", en: "" },
    };
  }

  if (collection === "studies") {
    return {
      id,
      active: true,
      date: new Date().toISOString().slice(0, 10),
      title: { zh: "新查经内容", en: "New Bible Study" },
      passage: { zh: "", en: "" },
      scripture: { zh: "", en: "" },
      summary: { zh: "", en: "" },
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

loginForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const client = getSupabaseClient();

  if (!client) {
    setLoginMessage("请先在 supabase-config.js 填入 Supabase URL 和 anon key。");
    return;
  }

  const formData = new FormData(loginForm);
  const email = resolveLoginEmail(formData.get("username"));
  const password = normalizeLoginValue(formData.get("password"));

  setLoginMessage("正在登录...");
  const { error } = await client.auth.signInWithPassword({ email, password });

  if (error) {
    setLoginMessage("邮箱或密码不正确，或这个账号还没有创建。");
    return;
  }

  await showDashboard();
});

logoutButton?.addEventListener("click", async () => {
  const client = getSupabaseClient();
  if (client) {
    await client.auth.signOut().catch((error) => {
      console.error(error);
    });
  }
  showLogin();
});

saveButton?.addEventListener("click", async () => {
  await saveRemoteContent();
});

exportButton?.addEventListener("click", async () => {
  const data = JSON.stringify(content, null, 2);
  await navigator.clipboard.writeText(data);
  exportButton.textContent = "已复制到剪贴板";
  setSaveStatus(hasUnsavedChanges ? "数据已复制，但仍有未保存修改" : "数据已复制", hasUnsavedChanges ? "dirty" : "saved");
  window.setTimeout(() => {
    exportButton.textContent = "导出数据";
  }, 1800);
});

refreshButton?.addEventListener("click", async () => {
  if (!window.confirm("确定重新读取数据库内容吗？当前未保存的输入会被覆盖。")) {
    return;
  }

  setSaveStatus("正在读取数据库...", "saving");
  try {
    await loadRemoteContent();
    renderAll();
    hasUnsavedChanges = false;
    isSaving = false;
    setSaveStatus("已重新读取数据库", "saved");
    updateSaveButton();
  } catch (error) {
    setSaveStatus("读取失败", "error");
    updateSaveButton();
    console.error(error);
  }
});

resetButton?.addEventListener("click", () => {
  if (!window.confirm("确定恢复默认内容吗？恢复后需要点击「保存到网站」才会更新公开网站。")) {
    return;
  }

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

adminPageButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setActiveAdminPage(button.dataset.adminPage);
    renderAll();
  });
});

adminGalleryCategoryButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const category = button.dataset.adminGalleryCategory;
    if (photoCategories.some((entry) => entry.id === category)) {
      activeGalleryCategory = category;
    }
    setActiveAdminPage("gallery");
    renderAll();
  });
});

window.addEventListener("beforeunload", (event) => {
  if (!hasUnsavedChanges) {
    return;
  }

  event.preventDefault();
  event.returnValue = "";
});

async function initAdmin() {
  const client = getSupabaseClient();

  if (!client) {
    content = loadLocalContent();
    setLoginMessage("请先配置 Supabase 后再登录后台。");
    showLogin();
    return;
  }

  await client.auth.signOut({ scope: "local" }).catch(() => {});

  showLogin();
}

initAdmin();
