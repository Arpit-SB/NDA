# NDA COMMAND

## Structure
NDA-COMMAND/
├── index.html
├── css/style.css
├── js/data.js
├── js/app.js
└── assets/nda-hero.jpg

## Setup
1. Create the folders exactly as shown.
2. Paste each supplied file into its location.
3. Put your NDA image at `assets/nda-hero.jpg`.
4. Open `index.html`.

## Demo login
Student: student@nda.local / student123
Admin: admin@nda.local / admin123

## Important
This starter uses localStorage, so registration/uploads are only stored in the same browser/device.
For real multi-user deployment, connect Supabase Auth + Database + Storage and enforce admin permissions with database RLS.
Do NOT store real passwords or a Supabase service-role key in frontend JavaScript.
