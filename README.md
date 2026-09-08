# Gamage Marketing - Digital Agency Website

A modern, highly interactive, and bilingual (English & Sinhala) landing page for Gamage Marketing — a digital marketing and branding agency. Built entirely with React, Vite, Tailwind CSS, and Framer Motion.

## 🌟 Features

- **Bilingual Support (English & Sinhala):** Seamlessly switch between languages with instant updates and `localStorage` persistence across browser sessions.
- **Persistent Theme Switching (Dark & Light Mode):** Dynamic theme switcher supporting dark and light modes, with automatic system preference detection (`prefers-color-scheme`) and session persistence.
- **Service Detail Modal with Dynamic Completion Progress Bars:** Interactive service modals showing detailed deliverables, opportunities, working assumptions, and dynamically animated milestone progress bars, readiness scores, and turnaround timelines for each service.
- **Interactive Project Cost Estimator:** A built-in calculator allowing clients to estimate project costs based on selected service modules.
- **Advanced Contact Form:** Capture lead-specific requirements through a comprehensive and stylish form with real-time feedback toast notifications.
- **High-Performance Animations:** Premium scroll effects, parallax sections, and smooth micro-interactions powered by Motion (`motion/react`).
- **Responsive & Mobile-First:** Carefully crafted to perform smoothly across smartphones, tablets, laptops, and ultra-wide desktops.
- **Cloudflare Ready:** Pre-configured with `wrangler.toml` for one-command deployment to Cloudflare Pages and Workers.
- **Google Analytics Integration:** Built-in React-GA4 event tracking.

## 🛠️ Technologies Used

- **Framework:** [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Icons:** FontAwesome (via CDN)
- **Analytics:** `react-ga4`

## 🚀 Getting Started

Follow these steps to set up the project locally:

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/gamage-marketing.git
   cd gamage-marketing
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables (Optional):**
   If you have specific Analytics IDs, update the `ReactGA.initialize('G-XXXXXXXXXX')` string in `App.tsx` or set it up via a `.env` file. (Currently uses `G-RZHZQ9SL61`).

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

## ☁️ Cloudflare Deployment

The application is pre-configured with `wrangler.toml` for seamless deployment to Cloudflare Pages or Cloudflare Workers:

1. **Authenticate with Wrangler (one-time setup):**
   ```bash
   npx wrangler login
   ```

2. **Deploy directly to Cloudflare Pages:**
   ```bash
   npm run deploy:pages
   ```

   Or deploy using standard Wrangler:
   ```bash
   npm run deploy
   ```

3. **Cloudflare Configuration (`wrangler.toml`):**
   - Project name: `gamagemarketing`
   - Compatibility date: `2024-09-23`
   - Static build directory: `dist`

## 📂 Project Structure

- `src/App.tsx` - The main application file containing all components, state logic, and translation objects.
- `src/index.css` - Global CSS styles and Tailwind module imports.
- `src/main.tsx` - React application bootstrapper.
- `package.json` - Project metadata and dependencies.

## 📄 License

This project is open-source and free to use. (You can update this to an MIT license or proprietary license based on your business model).

---
*Built with modern web technologies to maximize digital presence and performance.*
