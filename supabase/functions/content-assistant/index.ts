const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAIL = "gff@rmbc.local";
const MAX_ITEMS = 12;
const MAX_TEXT_LENGTH = 12000;

const bibleBooks = {
  "创世记": "Genesis", "創世記": "Genesis", "出埃及记": "Exodus", "出埃及記": "Exodus",
  "利未记": "Leviticus", "利未記": "Leviticus", "民数记": "Numbers", "民數記": "Numbers",
  "申命记": "Deuteronomy", "申命記": "Deuteronomy", "约书亚记": "Joshua", "約書亞記": "Joshua",
  "士师记": "Judges", "士師記": "Judges", "路得记": "Ruth", "路得記": "Ruth",
  "撒母耳记上": "1 Samuel", "撒母耳記上": "1 Samuel", "撒母耳记下": "2 Samuel", "撒母耳記下": "2 Samuel",
  "列王纪上": "1 Kings", "列王紀上": "1 Kings", "列王纪下": "2 Kings", "列王紀下": "2 Kings",
  "历代志上": "1 Chronicles", "歷代志上": "1 Chronicles", "历代志下": "2 Chronicles", "歷代志下": "2 Chronicles",
  "以斯拉记": "Ezra", "以斯拉記": "Ezra", "尼希米记": "Nehemiah", "尼希米記": "Nehemiah",
  "以斯帖记": "Esther", "以斯帖記": "Esther", "约伯记": "Job", "約伯記": "Job",
  "诗篇": "Psalms", "詩篇": "Psalms", "箴言": "Proverbs", "传道书": "Ecclesiastes", "傳道書": "Ecclesiastes",
  "雅歌": "Song of Solomon", "以赛亚书": "Isaiah", "以賽亞書": "Isaiah", "耶利米书": "Jeremiah", "耶利米書": "Jeremiah",
  "耶利米哀歌": "Lamentations", "以西结书": "Ezekiel", "以西結書": "Ezekiel", "但以理书": "Daniel", "但以理書": "Daniel",
  "何西阿书": "Hosea", "何西阿書": "Hosea", "约珥书": "Joel", "約珥書": "Joel", "阿摩司书": "Amos", "阿摩司書": "Amos",
  "俄巴底亚书": "Obadiah", "俄巴底亞書": "Obadiah", "约拿书": "Jonah", "約拿書": "Jonah", "弥迦书": "Micah", "彌迦書": "Micah",
  "那鸿书": "Nahum", "那鴻書": "Nahum", "哈巴谷书": "Habakkuk", "哈巴谷書": "Habakkuk", "西番雅书": "Zephaniah", "西番雅書": "Zephaniah",
  "哈该书": "Haggai", "哈該書": "Haggai", "撒迦利亚书": "Zechariah", "撒迦利亞書": "Zechariah", "玛拉基书": "Malachi", "瑪拉基書": "Malachi",
  "马太福音": "Matthew", "馬太福音": "Matthew", "马可福音": "Mark", "馬可福音": "Mark", "路加福音": "Luke", "约翰福音": "John", "約翰福音": "John",
  "使徒行传": "Acts", "使徒行傳": "Acts", "罗马书": "Romans", "羅馬書": "Romans", "哥林多前书": "1 Corinthians", "哥林多前書": "1 Corinthians",
  "哥林多后书": "2 Corinthians", "哥林多後書": "2 Corinthians", "加拉太书": "Galatians", "加拉太書": "Galatians", "以弗所书": "Ephesians", "以弗所書": "Ephesians",
  "腓立比书": "Philippians", "腓立比書": "Philippians", "歌罗西书": "Colossians", "歌羅西書": "Colossians", "帖撒罗尼迦前书": "1 Thessalonians", "帖撒羅尼迦前書": "1 Thessalonians",
  "帖撒罗尼迦后书": "2 Thessalonians", "帖撒羅尼迦後書": "2 Thessalonians", "提摩太前书": "1 Timothy", "提摩太前書": "1 Timothy", "提摩太后书": "2 Timothy", "提摩太後書": "2 Timothy",
  "提多书": "Titus", "提多書": "Titus", "腓利门书": "Philemon", "腓利門書": "Philemon", "希伯来书": "Hebrews", "希伯來書": "Hebrews",
  "雅各书": "James", "雅各書": "James", "彼得前书": "1 Peter", "彼得前書": "1 Peter", "彼得后书": "2 Peter", "彼得後書": "2 Peter",
  "约翰一书": "1 John", "約翰一書": "1 John", "约翰二书": "2 John", "約翰二書": "2 John", "约翰三书": "3 John", "約翰三書": "3 John",
  "犹大书": "Jude", "猶大書": "Jude", "启示录": "Revelation", "啟示錄": "Revelation",
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
  });
}

async function requireAdmin(request) {
  const authorization = request.headers.get("Authorization") || "";
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!authorization || !supabaseUrl || !anonKey) return false;

  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { Authorization: authorization, apikey: anonKey },
  });
  if (!response.ok) return false;
  const user = await response.json();
  return String(user.email || "").toLowerCase() === ADMIN_EMAIL;
}

function englishReference(input) {
  let reference = String(input || "")
    .trim()
    .replace(/[：﹕]/g, ":")
    .replace(/[–—－~～至]/g, "-")
    .replace(/第/g, "")
    .replace(/章/g, ":")
    .replace(/节|節/g, "")
    .replace(/\s+/g, " ");

  const book = Object.keys(bibleBooks)
    .sort((a, b) => b.length - a.length)
    .find((name) => reference.startsWith(name));
  if (book) reference = `${bibleBooks[book]} ${reference.slice(book.length).trim()}`;
  if (!/^[1-3]?\s?[A-Za-z]/.test(reference)) {
    throw new Error("无法识别经卷名称，请输入完整出处，例如：以弗所书 2:1-3。");
  }
  return reference.replace(/\s*:\s*/g, ":").replace(/\s*-\s*/g, "-");
}

async function translate(items) {
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) throw new Error("尚未设置免费的 GEMINI_API_KEY。");
  if (!Array.isArray(items) || items.length === 0 || items.length > MAX_ITEMS) {
    throw new Error("翻译内容数量不正确。");
  }
  const normalized = items.map((item) => ({
    id: String(item.id || ""),
    text: String(item.text || "").slice(0, MAX_TEXT_LENGTH),
    context: String(item.context || "").slice(0, 300),
  }));
  if (normalized.some((item) => !item.id || !item.text)) throw new Error("翻译内容不能为空。");

  const model = Deno.env.get("GEMINI_MODEL") || "gemma-4-31b-it";
  const prompt = [
    "Translate the following Simplified or Traditional Chinese church fellowship content into natural, welcoming American English.",
    "Preserve meaning, paragraph breaks, dates, times, addresses, URLs, emoji, Markdown, and Bible references.",
    "Do not add facts, commentary, or quotation marks.",
    "Return only valid JSON in this exact shape: {\"translations\":[{\"id\":\"original id\",\"text\":\"English translation\"}]}",
    "Translate every item and preserve each id exactly.",
    JSON.stringify(normalized),
  ].join("\n\n");
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 8192,
      },
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || "免费翻译服务暂时不可用。");
  const text = (data?.candidates?.[0]?.content?.parts || [])
    .map((part) => part.text || "")
    .join("")
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");
  if (!text) throw new Error("免费翻译服务没有返回内容。");
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (_error) {
    throw new Error("免费翻译服务返回格式不正确，请重试一次。");
  }
  const allowedIds = new Set(normalized.map((item) => item.id));
  return {
    translations: Object.fromEntries(
      (parsed.translations || [])
        .filter((item) => allowedIds.has(item.id) && typeof item.text === "string")
        .map((item) => [item.id, item.text]),
    ),
  };
}

async function scripture(reference) {
  const apiKey = Deno.env.get("ESV_API_KEY");
  if (!apiKey) throw new Error("尚未设置 ESV_API_KEY。");
  const query = englishReference(reference);
  const url = new URL("https://api.esv.org/v3/passage/text/");
  url.searchParams.set("q", query);
  url.searchParams.set("include-passage-references", "false");
  url.searchParams.set("include-footnotes", "false");
  url.searchParams.set("include-footnote-body", "false");
  url.searchParams.set("include-headings", "false");
  url.searchParams.set("include-short-copyright", "false");
  url.searchParams.set("include-copyright", "false");
  const response = await fetch(url, { headers: { Authorization: `Token ${apiKey}` } });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.detail || "ESV 经文读取失败。");
  const text = (data.passages || []).join("\n").trim();
  if (!text) throw new Error("没有找到这段 ESV 经文。");
  return { reference: data.canonical || query, text, version: "ESV" };
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    if (!(await requireAdmin(request))) return json({ error: "需要管理员登录。" }, 401);
    const body = await request.json();
    if (body.action === "translate") return json(await translate(body.items));
    if (body.action === "scripture") return json(await scripture(body.reference));
    return json({ error: "不支持的操作。" }, 400);
  } catch (error) {
    return json({ error: error?.message || "服务暂时不可用。" }, 400);
  }
});
