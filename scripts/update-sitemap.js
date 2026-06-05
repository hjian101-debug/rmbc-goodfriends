const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const siteUrl = "https://rmbc-goodfriends.pages.dev";
const today = new Date().toISOString().slice(0, 10);

const pageConfig = new Map([
  ["index.html", { loc: "/", priority: "1.0" }],
  ["studies.html", { loc: "/studies.html", priority: "0.7" }],
  ["photos.html", { loc: "/photos.html", priority: "0.7" }],
]);

const pages = [...pageConfig.entries()]
  .filter(([fileName]) => fs.existsSync(path.join(root, fileName)))
  .map(([fileName, config]) => ({
    loc: `${siteUrl}${config.loc}`,
    priority: config.priority,
  }));

const urls = pages
  .map(({ loc, priority }) => `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`)
  .join("\n");

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

fs.writeFileSync(path.join(root, "sitemap.xml"), sitemap);
console.log(`Updated sitemap.xml with ${pages.length} page(s) for ${today}`);
