# Codimite.ai — Migration ROI Calculator

Interactive ROI calculator for enterprise platform migrations (Slack → Zoom Chat, Gong → Zoom Revenue Accelerator, Miro → Zoom Whiteboards, and custom).

## Deploy to GitHub Pages (5 minutes)

### Step 1: Create a GitHub repo
1. Go to https://github.com/new
2. Name it `codimite-roi-calculator` (or whatever you want)
3. Set it to **Public** (required for free GitHub Pages)
4. Don't add a README (this project already has one)

### Step 2: Push this code
```bash
cd codimite-roi-calculator
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/codimite-roi-calculator.git
git push -u origin main
```

### Step 3: Enable GitHub Pages
1. Go to your repo → **Settings** → **Pages**
2. Under **Source**, select **GitHub Actions**
3. The included workflow (`.github/workflows/deploy.yml`) will auto-build and deploy

### Step 4: Access your site
Your calculator will be live at:
```
https://YOUR_USERNAME.github.io/codimite-roi-calculator/
```

> **Note:** If you name your repo something other than `codimite-roi-calculator`, update the `base` value in `vite.config.js` to match.

## Local Development

```bash
npm install
npm run dev
```

Opens at http://localhost:5173

## Custom Domain (optional)

To use `roi.codimite.ai` instead of the github.io URL:

1. In your repo → Settings → Pages → Custom domain, enter `roi.codimite.ai`
2. Add a CNAME DNS record: `roi.codimite.ai` → `YOUR_USERNAME.github.io`
3. Create a file called `public/CNAME` containing `roi.codimite.ai`
4. Update `base` in `vite.config.js` to `'/'`

## Tech Stack
- React 18
- Recharts (charts)
- Vite (build)
- GitHub Pages (hosting)
