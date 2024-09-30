# Penta Crossword

A daily 5x5 crossword puzzle game with limited attempts.

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up your environment variables (copy `.env.example` to `.env.local` and fill in the values)

## Running the project

Development mode:
```
npm run dev
```

Build for production:
```
npm run build
```

Start production server:
```
npm start
```

## Additional Information

- This project uses Next.js, Tailwind CSS, and Supabase.
- Make sure to set up your Supabase project and update the environment variables accordingly.


### FILETREE
```
  ├─ src/
  │  ├─ app/
  │  │  ├─ fonts/
  │  │  │  ├─ GeistMonoVF.woff
  │  │  │  └─ GeistVF.woff
  │  │  ├─ favicon.ico
  │  │  ├─ globals.css
  │  │  ├─ layout.tsx
  │  │  └─ page.tsx
  │  ├─ components/
  │  │  ├─ ui/
  │  │  │  ├─ button.tsx
  │  │  │  ├─ card.tsx
  │  │  │  ├─ input.tsx
  │  │  │  ├─ label.tsx
  │  │  │  ├─ table.tsx
  │  │  │  └─ tabs.tsx
  │  │  ├─ About.tsx
  │  │  ├─ DailyCrossword.tsx
  │  │  ├─ Leaderboard.tsx
  │  │  ├─ LoginSignup.tsx
  │  │  └─ Profile.tsx
  │  └─ lib/
  │     ├─ database.types.ts
  │     ├─ mailer.ts
  │     ├─ supabase.ts
  │     ├─ supabaseClient.ts
  │     ├─ supabaseServer.ts
  │     └─ utils.ts
  ├─ supabase/
  │  ├─].temp/ (ignored)
  │  ├─ .gitignore
  │  ├─ config.toml
  │  └─ seed.sql
  ├─ .env
  ├─].env.local (ignored)
  ├─ .eslintrc.json
  ├─ .gitignore
  ├─ components.json
  ├─]next-env.d.ts (ignored)
  ├─ next.config.js
  ├─ next.config.mjs
  ├─ package-lock.json
  ├─ package.json
  ├─ postcss.config.mjs
  ├─ README.md
  ├─ tailwind.config.ts
  └─ tsconfig.json
```
