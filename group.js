const config = window.RMBC_SUPABASE_CONFIG || {};
const db = window.supabase?.createClient(config.url, config.anonKey);
const page = document.body.dataset.page;

function normalize(value) {
  return String(value || "").normalize("NFKC").trim();
}

function setMessage(element, text, tone = "") {
  if (!element) return;
  element.textContent = text;
  element.dataset.tone = tone;
}

function faithLabel(status) {
  return status === "seeker" ? "慕道友" : "基督徒";
}

async function initializeJoin() {
  const form = document.querySelector("[data-join-form]");
  const message = document.querySelector("[data-join-message]");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const fields = new FormData(form);
    const name = normalize(fields.get("name"));
    const faithStatus = fields.get("faith_status");
    if (!name || !faithStatus) return;

    setMessage(message, "正在提交…");
    const { error } = await db.from("group_people").insert({
      name,
      kind: "new_friend",
      faith_status: faithStatus,
    });
    if (error) {
      const duplicate = error.code === "23505";
      setMessage(message, duplicate ? "这个姓名已经报名，请联系管理员确认。" : "提交失败，请稍后重试。", "error");
      return;
    }
    form.reset();
    setMessage(message, `提交成功！欢迎你，${name}。请等待分组。`, "success");
  });
}

let people = [];
let groups = [];
let leaders = [];
let movingName = null;
const attendanceStorageKey = "rmbc-group-selected-members";

function savedMembers() {
  try {
    const value = JSON.parse(window.localStorage.getItem(attendanceStorageKey) || "[]");
    return new Set(Array.isArray(value) ? value : []);
  } catch {
    return new Set();
  }
}

function saveSelectedMembers() {
  window.localStorage.setItem(attendanceStorageKey, JSON.stringify(selectedMembers()));
}

function adminMessage(text, tone = "") {
  setMessage(document.querySelector("[data-message]"), text, tone);
}

async function loadPeople() {
  const { data, error } = await db
    .from("group_people")
    .select("name,kind,faith_status,created_at")
    .order("created_at", { ascending: true });
  if (error) throw error;
  people = data || [];
  renderPeople();
}

function renderPeople() {
  const members = people.filter((person) => person.kind === "member");
  const friends = people.filter((person) => person.kind === "new_friend");
  const memberContainer = document.querySelector("[data-members]");
  const existingBoxes = [...memberContainer.querySelectorAll('input[type="checkbox"]')];
  const selected = existingBoxes.length
    ? new Set(existingBoxes.filter((box) => box.checked).map((box) => box.value))
    : savedMembers();
  memberContainer.replaceChildren();

  members.forEach((person) => {
    const card = document.createElement("div");
    card.className = "member-card";
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.name = "members";
    checkbox.value = person.name;
    checkbox.checked = selected.has(person.name);
    checkbox.addEventListener("change", () => {
      saveSelectedMembers();
      updateLeaderSelects();
    });
    const faithNote = document.createElement("span");
    faithNote.className = "faith-note";
    faithNote.textContent = `（${faithLabel(person.faith_status)}）`;
    label.append(checkbox, document.createTextNode(person.name), faithNote);
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "danger member-delete";
    remove.textContent = "删除";
    remove.addEventListener("click", () => removePerson(person.name));
    card.append(label, remove);
    memberContainer.append(card);
  });

  const friendContainer = document.querySelector("[data-friends]");
  friendContainer.replaceChildren();
  document.querySelector("[data-friend-count]").textContent = friends.length;
  if (!friends.length) {
    const empty = document.createElement("p");
    empty.className = "hint";
    empty.textContent = "目前还没有新朋友报名。";
    friendContainer.append(empty);
  }
  friends.forEach((person) => {
    const row = document.createElement("div");
    row.className = "friend-row";
    const identity = document.createElement("span");
    identity.append(document.createTextNode(person.name + " "));
    const badge = document.createElement("span");
    badge.className = "badge";
    badge.textContent = faithLabel(person.faith_status);
    identity.append(badge);
    const actions = document.createElement("span");
    actions.className = "row-actions";
    const promote = document.createElement("button");
    promote.type = "button";
    promote.textContent = "加入常来名单";
    promote.addEventListener("click", () => promotePerson(person.name));
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "danger";
    remove.textContent = "删除";
    remove.addEventListener("click", () => removePerson(person.name));
    actions.append(promote, remove);
    row.append(identity, actions);
    friendContainer.append(row);
  });
  saveSelectedMembers();
  updateLeaderSelects();
}

function selectedMembers() {
  return [...document.querySelectorAll('[data-members] input[type="checkbox"]:checked')].map((box) => box.value);
}

function updateLeaderSelects() {
  const count = Math.max(0, Number(document.querySelector('[name="group_count"]').value) || 0);
  const container = document.querySelector("[data-leader-selects]");
  const previous = [...container.querySelectorAll("select")].map((select) => select.value);
  const attendees = selectedMembers();
  container.replaceChildren();
  for (let index = 0; index < count; index += 1) {
    const label = document.createElement("label");
    label.append(document.createTextNode(`第 ${index + 1} 组组长`));
    const select = document.createElement("select");
    select.name = "leaders";
    select.required = true;
    const blank = document.createElement("option");
    blank.value = "";
    blank.textContent = "请选择组长";
    select.append(blank);
    attendees.forEach((name) => {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      option.selected = previous[index] === name;
      select.append(option);
    });
    label.append(select);
    container.append(label);
  }
}

function buildBalancedGroups(attendees, selectedLeaders, count) {
  const status = new Map(people.map((person) => [person.name, person.faith_status]));
  const result = selectedLeaders.map((leader) => [leader]);
  const christianCounts = selectedLeaders.map((leader) => status.get(leader) === "seeker" ? 0 : 1);
  const leaderSet = new Set(selectedLeaders);
  const remaining = attendees.filter((name) => !leaderSet.has(name));
  const christians = remaining.filter((name) => status.get(name) !== "seeker").sort(() => Math.random() - 0.5);
  const seekers = remaining.filter((name) => status.get(name) === "seeker").sort(() => Math.random() - 0.5);

  christians.forEach((name) => {
    const target = [...Array(count).keys()].sort((a, b) =>
      christianCounts[a] - christianCounts[b] || result[a].length - result[b].length
    )[0];
    result[target].push(name);
    christianCounts[target] += 1;
  });
  seekers.forEach((name) => {
    const target = [...Array(count).keys()].sort((a, b) =>
      result[a].length - result[b].length || christianCounts[a] - christianCounts[b]
    )[0];
    result[target].push(name);
  });
  return result;
}

function renderGroups() {
  const status = new Map(people.map((person) => [person.name, person.faith_status]));
  const grid = document.querySelector("[data-group-grid]");
  grid.replaceChildren();
  groups.forEach((names, index) => {
    const group = document.createElement("section");
    group.className = "group";
    group.dataset.group = String(index);
    group.addEventListener("dragover", (event) => { event.preventDefault(); group.classList.add("drag-over"); });
    group.addEventListener("dragleave", () => group.classList.remove("drag-over"));
    group.addEventListener("drop", (event) => {
      event.preventDefault();
      group.classList.remove("drag-over");
      if (movingName) movePerson(movingName, index);
    });
    const heading = document.createElement("h3");
    const christianCount = names.filter((name) => status.get(name) !== "seeker").length;
    heading.textContent = `第 ${index + 1} 组：${names.length} 人 · 基督徒 ${christianCount} 人`;
    const list = document.createElement("div");
    list.className = "group-list";
    names.forEach((name) => {
      const isLeader = leaders[index] === name;
      const row = document.createElement("div");
      row.className = `group-member${isLeader ? " is-leader" : ""}`;
      row.draggable = !isLeader;
      if (!isLeader) row.addEventListener("dragstart", () => { movingName = name; });
      const identity = document.createElement("span");
      identity.textContent = name;
      if (isLeader) {
        const badge = document.createElement("span");
        badge.className = "badge leader-badge";
        badge.textContent = "组长";
        identity.append(" ", badge);
      }
      row.append(identity);
      if (!isLeader) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "move-button";
        button.textContent = "换组";
        button.addEventListener("click", () => openMoveSheet(name));
        row.append(button);
      }
      list.append(row);
    });
    group.append(heading, list);
    grid.append(group);
  });
  document.querySelector("[data-results]").hidden = false;
  document.querySelector("[data-results]").scrollIntoView({ behavior: "smooth" });
}

function openMoveSheet(name) {
  movingName = name;
  document.querySelector("[data-move-name]").textContent = name;
  const options = document.querySelector("[data-move-options]");
  options.replaceChildren();
  groups.forEach((_, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = `第 ${index + 1} 组`;
    button.addEventListener("click", () => movePerson(name, index));
    options.append(button);
  });
  document.querySelector("[data-sheet]").hidden = false;
}

function closeMoveSheet() {
  document.querySelector("[data-sheet]").hidden = true;
  movingName = null;
}

function movePerson(name, target) {
  const source = groups.findIndex((group) => group.includes(name));
  if (source < 0 || source === target || leaders.includes(name)) return closeMoveSheet();
  groups[source] = groups[source].filter((person) => person !== name);
  groups[target].push(name);
  closeMoveSheet();
  renderGroups();
}

async function removePerson(name) {
  if (!window.confirm(`确定要删除 ${name} 吗？`)) return;
  const { error } = await db.from("group_people").delete().eq("name", name);
  if (error) return adminMessage("删除失败，请重试。", "error");
  await loadPeople();
}

async function promotePerson(name) {
  const { error } = await db.from("group_people").update({ kind: "member" }).eq("name", name);
  if (error) return adminMessage("更新失败，请重试。", "error");
  await loadPeople();
}

async function showDashboard() {
  document.querySelector("[data-login]").hidden = true;
  document.querySelector("[data-dashboard]").hidden = false;
  adminMessage("正在读取名单…");
  try {
    await loadPeople();
    adminMessage("名单已从 Supabase 读取。", "success");
  } catch (error) {
    console.error(error);
    adminMessage("无法读取分组名单，请确认数据库已经设置。", "error");
  }
}

async function initializeAdmin() {
  const loginPanel = document.querySelector("[data-login]");
  const dashboard = document.querySelector("[data-dashboard]");
  const loginMessage = document.querySelector("[data-login-message]");
  const { data: { session } } = await db.auth.getSession();
  if (session) await showDashboard();
  else { loginPanel.hidden = false; dashboard.hidden = true; }

  document.querySelector("[data-login-form]").addEventListener("submit", async (event) => {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const username = normalize(fields.get("username")).toLowerCase();
    const email = username.includes("@") ? username : `${username}@rmbc.local`;
    setMessage(loginMessage, "正在登录…");
    const { error } = await db.auth.signInWithPassword({ email, password: normalize(fields.get("password")) });
    if (error) return setMessage(loginMessage, "账号或密码不正确。", "error");
    await showDashboard();
  });

  document.querySelector("[data-logout]").addEventListener("click", async () => {
    await db.auth.signOut();
    dashboard.hidden = true;
    loginPanel.hidden = false;
  });
  document.querySelector("[data-add-friend]").addEventListener("submit", async (event) => {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const record = { name: normalize(fields.get("name")), kind: "new_friend", faith_status: fields.get("faith_status") };
    const { error } = await db.from("group_people").upsert(record);
    if (error) return adminMessage("添加失败，请检查姓名是否已存在。", "error");
    event.currentTarget.reset();
    await loadPeople();
    adminMessage(`已添加 ${record.name}。`, "success");
  });
  document.querySelector("[data-select-all]").addEventListener("click", () => {
    document.querySelectorAll('[data-members] input[type="checkbox"]').forEach((box) => { box.checked = true; });
    saveSelectedMembers();
    updateLeaderSelects();
  });
  document.querySelector("[data-select-none]").addEventListener("click", () => {
    document.querySelectorAll('[data-members] input[type="checkbox"]').forEach((box) => { box.checked = false; });
    saveSelectedMembers();
    updateLeaderSelects();
  });
  document.querySelector("[data-delete-mode]").addEventListener("click", (event) => {
    const section = document.querySelector("[data-members]").closest("section");
    const enabled = section.classList.toggle("delete-mode");
    event.currentTarget.textContent = enabled ? "完成删除" : "删除成员";
  });
  document.querySelector('[name="group_count"]').addEventListener("input", updateLeaderSelects);
  document.querySelector("[data-clear-friends]").addEventListener("click", async () => {
    if (!window.confirm("确定要清空全部新朋友吗？")) return;
    const { error } = await db.from("group_people").delete().eq("kind", "new_friend");
    if (error) return adminMessage("清空失败，请重试。", "error");
    await loadPeople();
  });
  document.querySelector("[data-group-form]").addEventListener("submit", (event) => {
    event.preventDefault();
    const count = Number(new FormData(event.currentTarget).get("group_count"));
    leaders = [...document.querySelectorAll('[data-leader-selects] select')].map((select) => select.value);
    if (leaders.length !== count || leaders.some((name) => !name) || new Set(leaders).size !== count) {
      return adminMessage("请为每一组选择一位不同的组长。", "error");
    }
    const attendees = [...new Set([...selectedMembers(), ...people.filter((person) => person.kind === "new_friend").map((person) => person.name)])];
    groups = buildBalancedGroups(attendees, leaders, count);
    adminMessage("分组完成。", "success");
    renderGroups();
  });
  document.querySelector("[data-close-sheet]").addEventListener("click", closeMoveSheet);
  document.querySelector("[data-sheet]").addEventListener("click", (event) => {
    if (event.target === event.currentTarget) closeMoveSheet();
  });
}

if (page === "home") {
  const joinUrl = `${window.location.origin}/group-join`;
  document.querySelector("[data-join-url]").textContent = joinUrl;
  new window.QRCode(document.querySelector("[data-qr]"), {
    text: joinUrl,
    width: 260,
    height: 260,
    correctLevel: window.QRCode.CorrectLevel.M,
  });
} else if (!db) {
  document.body.textContent = "Supabase 尚未配置。";
} else if (page === "join") {
  initializeJoin();
} else if (page === "admin") {
  initializeAdmin();
}
