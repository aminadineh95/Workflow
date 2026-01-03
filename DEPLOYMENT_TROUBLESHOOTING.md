# Deployment Troubleshooting Guide

If your deployment shows a blank page or nothing is displayed, follow these steps:

## 1. Check GitHub Pages Configuration

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Pages**
3. Under **Source**, make sure it says **"GitHub Actions"** (NOT "Deploy from a branch")
4. If it's set to "Deploy from a branch", change it to **"GitHub Actions"**

## 2. Verify Repository Name

The repository name **MUST** match the base path in `vite.config.ts`:

- **Repository name**: `My-Workflow`
- **Base path in vite.config.ts**: `/My-Workflow/`

If your repository has a different name, you need to update `vite.config.ts`:

```typescript
// vite.config.ts
export default defineConfig({
  base: '/YOUR-REPO-NAME/',  // Change this to match your repo name
  // ...
});
```

And also update `src/App.tsx`:

```typescript
// src/App.tsx
<BrowserRouter basename="/YOUR-REPO-NAME">
  {/* ... */}
</BrowserRouter>
```

## 3. Check Workflow Status

1. Go to the **Actions** tab in your repository
2. Check if the workflow ran successfully
3. Look for any errors in the build logs
4. If the workflow failed, check the error messages

## 4. Verify Build Output

The workflow should create:
- `dist/index.html`
- `dist/404.html`
- `dist/.nojekyll`
- `dist/assets/` folder with JS and CSS files

## 5. Check Browser Console

1. Open your deployed site
2. Press `F12` to open Developer Tools
3. Go to the **Console** tab
4. Look for any JavaScript errors
5. Go to the **Network** tab
6. Check if assets are loading (look for 404 errors)

## 6. Common Issues

### Issue: Blank white page
**Solution**: 
- Check browser console for errors
- Verify base path matches repository name
- Make sure GitHub Pages source is set to "GitHub Actions"

### Issue: 404 errors for assets
**Solution**:
- Verify `base` path in `vite.config.ts` matches repository name
- Check that assets are in `dist/assets/` folder
- Ensure `.nojekyll` file exists in dist folder

### Issue: Workflow not running
**Solution**:
- Check if you pushed to `main` or `master` branch
- Verify workflow file is in `.github/workflows/deploy.yml`
- Check repository Settings → Actions → General → Workflow permissions

### Issue: "Page not found" error
**Solution**:
- Make sure `404.html` was created (workflow does this automatically)
- Verify the URL is correct: `https://[username].github.io/My-Workflow/`
- Check that the trailing slash is included in the URL

## 7. Manual Verification

After deployment, check:
1. Visit: `https://[your-username].github.io/My-Workflow/`
2. Check browser console for errors
3. Verify network requests are successful
4. Check if `index.html` loads correctly

## 8. Re-run Workflow

If nothing works:
1. Go to **Actions** tab
2. Select **Deploy to GitHub Pages** workflow
3. Click **Run workflow** → **Run workflow**
4. Wait for it to complete
5. Check the deployment URL

## 9. Check Repository Settings

Make sure in **Settings** → **Pages**:
- Source: **GitHub Actions** ✅
- Custom domain: (leave empty if not using one)
- Enforce HTTPS: ✅ (if available)

## Still Not Working?

1. Check the workflow logs in the Actions tab
2. Verify all files are committed and pushed
3. Make sure `package.json` has the correct build script
4. Try building locally: `npm run build` and check the `dist` folder

