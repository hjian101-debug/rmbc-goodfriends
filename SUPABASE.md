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
