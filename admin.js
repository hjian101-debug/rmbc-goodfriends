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

const adminStorageKey = "rmbc-admin-content";
const supabaseConfig = window.RMBC_SUPABASE_CONFIG || {};
const storageBucket = supabaseConfig.storageBucket || "site-media";
let supabaseClient = null;
let hasUnsavedChanges = false;
let isSaving = false;

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

function normalizeContent(value) {
  const next = cloneContent(value && typeof value === "object" ? value : defaultContent);

  next.announcements = Array.isArray(next.announcements) ? next.announcements : defaultContent.announcements;
  next.gatherings = Array.isArray(next.gatherings) ? next.gatherings : defaultContent.gatherings;
  next.gallery = Array.isArray(next.gallery) ? next.gallery : defaultContent.gallery;
  next.team = Array.isArray(next.team) ? next.team : defaultContent.team;

  next.gatherings = next.gatherings.map((item) => ({
    ...item,
    day: ensureLocalizedValue(item.day),
    title: ensureLocalizedValue(item.title),
    description: ensureLocalizedValue(item.description),
    time: ensureLocalizedValue(item.time),
    location: ensureLocalizedValue(item.location),
    scripture: ensureLocalizedValue(item.scripture),
  }));
  next.gallery = (Array.isArray(next.gallery) ? next.gallery : []).map((item) => ({
    ...item,
    title: ensureLocalizedValue(item.title),
    caption: ensureLocalizedValue(item.caption),
    alt: ensureLocalizedValue(item.alt),
    image: item.image || "",
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
        gallery: Array.isArray(saved.gallery) ? saved.gallery : defaultContent.gallery,
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
  list.replaceChildren(
    ...content.gallery.map((item, index) => {
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
        createInput("中文照片说明", item.caption.zh, (value) => { item.caption.zh = value; }, { full: true, multiline: true }),
        createInput("English photo caption", item.caption.en, (value) => { item.caption.en = value; }, { full: true, multiline: true }),
      );

      card.append(
        cardHeader(item.title.zh || "照片", item.image ? "已上传照片" : "等待上传照片", "gallery", item, index),
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

  if (collection === "gallery") {
    return {
      id,
      active: true,
      image: "",
      title: { zh: "团契照片", en: "Fellowship Photo" },
      caption: { zh: "", en: "" },
      alt: { zh: "", en: "" },
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
