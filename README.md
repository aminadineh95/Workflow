# Amin Adineh Workflow

A Windows 11-inspired web-based operating system environment built as a test machine for future online OS development.

## About

This project is an experimental web OS that simulates a desktop environment with various applications including file explorer, calculator, notepad, browser, and more. It serves as a testing platform for developing concepts and features for future online operating systems.

## Features

- 🖥️ Windows 11-style desktop interface
- 📁 File Explorer with folder navigation
- 🧮 Calculator app
- 📝 Notepad for text editing
- 🌐 Built-in browser
- ⚙️ System settings with customization options
- 🔒 Lock screen with authentication
- 📊 Task Manager
- 🗑️ Recycle Bin
- ⌨️ Keyboard shortcuts support
- 🎨 Multiple wallpaper options

## Technologies

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui

## Development

```sh
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Deployment

This project is configured for automatic deployment to GitHub Pages using GitHub Actions.

### Automatic Deployment

The project uses GitHub Actions to automatically build and deploy to GitHub Pages when you push to the `main` or `master` branch.

**Setup Instructions:**

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Pages**
3. Under **Source**, select **GitHub Actions** (not "Deploy from a branch")
4. The workflow will automatically run on every push to `main`/`master` branch

### Manual Deployment

You can also trigger the deployment manually:

1. Go to **Actions** tab in your repository
2. Select **Deploy to GitHub Pages** workflow
3. Click **Run workflow** → **Run workflow**

### Build Configuration

- **Base Path**: `/My-Workflow/` (configured in `vite.config.ts`)
- **Build Output**: `dist/` directory
- **Node Version**: 20 (configured in workflow)

The workflow will:
- Install dependencies using `npm ci`
- Build the project for production
- Create a 404.html for SPA routing
- Deploy to GitHub Pages automatically

### Accessing Your Deployed Site

Once deployed, your site will be available at:
```
https://[your-username].github.io/My-Workflow/
```

Make sure the repository name matches the base path in `vite.config.ts`.

---

**© 2024 Amin Adineh Workflow**

*This workflow is a test machine for future online OSes*
