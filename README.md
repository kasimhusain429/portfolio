# Premium Portfolio (React + Vite)

Modern, dark-first personal portfolio built with:

- React (JavaScript)
- Tailwind CSS
- Framer Motion
- React Icons
- EmailJS (contact form)
- React Router

## Quick Start

Install dependencies:

```bash
npm install
```

Run dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## EmailJS Setup (Contact Form)

1. Copy `.env.example` to `.env`
2. Fill in your EmailJS keys:

```env
VITE_EMAILJS_SERVICE_ID=...
VITE_EMAILJS_TEMPLATE_ID=...
VITE_EMAILJS_PUBLIC_KEY=...
```

The form sends:

- `from_name`
- `reply_to`
- `message`

## Resume

Place your resume at:

`public/resume.pdf`

The hero section downloads it from `/resume.pdf`.

## Customize Content

- Update name/brand text in:
  - `src/components/Navbar.jsx`
  - `src/components/Hero.jsx`
  - `src/components/Footer.jsx`
  - `index.html`
- Update project list in:
  - `src/data/projects.js`

## Deploy

Deploy to Vercel/Netlify:

- Build command: `npm run build`
- Output directory: `dist`
- Add the same `.env` variables in your hosting dashboard
