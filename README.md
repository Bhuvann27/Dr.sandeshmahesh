# Dr. Sandesh Mahesh — Obstetrics & Gynaecology (ANISE)

Public doctor website for Dr. Sandesh Mahesh, MBBS, MS, FRM, FMAS, Siddaganga Hospital, Tumakuru.
Static site (HTML/CSS/JS), Supabase for bookings, patient insights and videos.

## Design system
`css/main.css`, `css/hero.css`, `css/stories*.css`, `extra-mod/`, `js/main.js`, `js/hero-desktop.js`,
`js/stories-v7.js`, `js/booking-widget.js` and `js/site-assistant.js` are the **Dr. Amogh design system**,
kept as close to the reference as possible so future design updates can be diffed against it.

Sandesh-specific files:
- `index.html`, `stories.html`, `story.html` — content
- `css/sandesh.css` — video cards, portrait fallback, fictional-preview notice, and a clearly marked "LUXE" layer (delete that block for the pure Amogh look)
- `js/sandesh.js`, `js/videos.js`, `js/booking-db.js`, `js/patient-insights-db.js`, `js/stories.js` — data/behaviour for this doctor
- `js/supabase-config.js`, `supabase/schema.sql`, `admin/` — unchanged from before this branch

## Open items before going live
1. **Supabase**: `js/supabase-config.js` points at the same Supabase project URL as the Dr. Amogh site (separated only by doctor ID). ANISE rule is one project per doctor — move this site to its own project.
2. **Assistant**: `js/site-assistant.js` answers locally only (`endpoint = ""`). Do not point it at another doctor's function.
3. **Patient stories**: current stories are fictional previews (`is_demo`). Replace with real, consented stories.
4. **Contact details**: phone/WhatsApp 7406886226 is identical to the Dr. Amogh site — confirm it is Dr. Sandesh's.
5. **Admin** (`admin/`) has not been restyled.
