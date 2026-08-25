# Supabase Setup

This site uses Supabase for shared website content and admin login.

## 1. Create the Supabase project

Create a free project at https://supabase.com.

## 2. Create the database table

Open Supabase Dashboard > SQL Editor, paste the contents of `supabase-setup.sql`, and run it.

The table stores one JSON content record:

- `key`: `main`
- `value`: announcements, gatherings, gallery, and team content

The same SQL also creates a public Storage bucket:

- `site-media`: public image files uploaded from the admin dashboard

## 3. Create the admin account

Open Authentication > Users, then add an admin user with this email:

- `gff@rmbc.local`

The write policy in `supabase-setup.sql` only allows this Supabase Auth user to edit site content. Keep public signups disabled unless you intentionally add more admin users and update the policy.

## 4. Add project keys

Open Project Settings > API Keys and copy:

- Project URL
- publishable key

Paste them into `supabase-config.js`:

```js
window.RMBC_SUPABASE_CONFIG = {
  url: "https://your-project.supabase.co",
  anonKey: "your-publishable-key",
  contentKey: "main",
  storageBucket: "site-media",
};
```

The publishable key is designed to be used in browser code. Row Level Security in `supabase-setup.sql` controls what visitors and logged-in admins can do.

## 5. First save

After configuring Supabase, open `admin.html`, log in with the admin email/password, make any small edit, and the current content will be saved into Supabase.

## 6. Enable automatic English translation and ESV scripture

The admin dashboard calls the authenticated Edge Function in
`supabase/functions/content-assistant`. It provides two actions:

- translate Chinese titles, descriptions, announcements, captions, and team information into English
- convert a Chinese Bible reference such as `以弗所书 2:1-3` to its English reference and retrieve the official ESV text

Create an OpenAI API key and request an ESV API key at https://api.esv.org/.
Store both as Supabase Edge Function secrets; never put them in
`supabase-config.js` or any browser file.

```bash
supabase secrets set OPENAI_API_KEY=... ESV_API_KEY=...
supabase functions deploy content-assistant
```

`OPENAI_MODEL` is optional and defaults to `gpt-5-mini`:

```bash
supabase secrets set OPENAI_MODEL=gpt-5-mini
```

Only the authenticated `gff@rmbc.local` administrator can call this function.
English fields remain editable so the administrator can review every result
before clicking **保存到网站**.

For the Google Sheet Bible-study archive, use these columns in this order:

1. 日期
2. 中文题目
3. English title
4. 中文经文出处
5. English passage
6. 中文大致内容
7. English summary
8. 是否显示

The dashboard's Bible-study helper copies one tab-separated row in exactly
this order for pasting into the existing sheet. It also provides a separate
button for copying the retrieved ESV reference and text.
