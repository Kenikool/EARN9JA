# GitHub Pages Setup Guide for Earn9ja Legal Documents

This guide will help you host your legal documents (Privacy Policy, Terms of Service, Data Protection Policy) on GitHub Pages for free.

## Step 1: Create GitHub Repository

1. Go to https://github.com and sign in (or create an account)
2. Click the "+" icon in the top right → "New repository"
3. Fill in the details:
   - **Repository name:** `earn9ja-legal`
   - **Description:** "Legal documents for Earn9ja mobile app"
   - **Visibility:** Public
   - **Initialize:** Check "Add a README file"
4. Click "Create repository"

## Step 2: Upload Legal Documents

### Option A: Via GitHub Web Interface (Easiest)

1. In your new repository, click "Add file" → "Upload files"
2. Drag and drop these files from the `legal-docs` folder:
   - `privacy-policy.md`
   - `terms-of-service.md`
   - `data-protection.md`
3. Add commit message: "Add legal documents"
4. Click "Commit changes"

### Option B: Via Git Command Line

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/earn9ja-legal.git
cd earn9ja-legal

# Copy legal documents
cp /path/to/legal-docs/*.md .

# Commit and push
git add .
git commit -m "Add legal documents"
git push origin main
```

## Step 3: Enable GitHub Pages

1. In your repository, click "Settings" (top menu)
2. Scroll down to "Pages" in the left sidebar
3. Under "Source":
   - Branch: Select `main`
   - Folder: Select `/ (root)`
4. Click "Save"
5. Wait 1-2 minutes for deployment

## Step 4: Access Your Documents

Your documents will be available at:

```
https://YOUR_USERNAME.github.io/earn9ja-legal/privacy-policy
https://YOUR_USERNAME.github.io/earn9ja-legal/terms-of-service
https://YOUR_USERNAME.github.io/earn9ja-legal/data-protection
```

**Note:** GitHub Pages automatically converts `.md` files to HTML.

## Step 5: Customize Appearance (Optional)

### Add a Theme

1. In your repository, create a file named `_config.yml`
2. Add this content:

```yaml
title: Earn9ja Legal Documents
description: Privacy Policy, Terms of Service, and Data Protection
theme: jekyll-theme-cayman
```

Available themes:

- `jekyll-theme-cayman` (recommended)
- `jekyll-theme-minimal`
- `jekyll-theme-slate`
- `jekyll-theme-architect`

### Create a Homepage

1. Edit the `README.md` file
2. Add this content:

```markdown
# Earn9ja Legal Documents

Welcome to the legal documentation for Earn9ja, a task-earning mobile application.

## Documents

- [Privacy Policy](privacy-policy.md)
- [Terms of Service](terms-of-service.md)
- [Data Protection Policy](data-protection.md)

## About Earn9ja

Earn9ja is a mobile platform that connects Nigerian users with earning opportunities through:

- Completing sponsored tasks
- Watching advertisements
- Participating in surveys
- Referring friends

## Contact

For questions about these documents:

- Email: [email protected]
- Support: In-app support chat

---

Last Updated: January 2, 2025
```

## Step 6: Use Custom Domain (Optional)

If you own a domain (e.g., `earn9ja.com`):

### Add Custom Domain

1. In repository Settings → Pages
2. Under "Custom domain", enter: `legal.earn9ja.com`
3. Click "Save"

### Configure DNS

Add a CNAME record in your domain registrar:

```
Type: CNAME
Name: legal
Value: YOUR_USERNAME.github.io
TTL: 3600
```

### Enable HTTPS

1. Wait for DNS propagation (up to 24 hours)
2. In GitHub Pages settings, check "Enforce HTTPS"

## Step 7: Update Your App

### Add Links to Your App

In your React Native app, update the legal document links:

```typescript
// constants/legal.ts
export const LEGAL_URLS = {
  privacyPolicy: "https://YOUR_USERNAME.github.io/earn9ja-legal/privacy-policy",
  termsOfService:
    "https://YOUR_USERNAME.github.io/earn9ja-legal/terms-of-service",
  dataProtection:
    "https://YOUR_USERNAME.github.io/earn9ja-legal/data-protection",
};
```

### Display in App

```typescript
import { Linking } from "react-native";
import { LEGAL_URLS } from "../constants/legal";

// Open privacy policy
const openPrivacyPolicy = () => {
  Linking.openURL(LEGAL_URLS.privacyPolicy);
};

// In your component
<TouchableOpacity onPress={openPrivacyPolicy}>
  <Text>Privacy Policy</Text>
</TouchableOpacity>;
```

## Step 8: Maintain Documents

### Update Documents

1. Edit files directly on GitHub (click file → pencil icon)
2. Or update locally and push changes:

```bash
git pull origin main
# Edit files
git add .
git commit -m "Update privacy policy"
git push origin main
```

Changes appear within 1-2 minutes.

### Version Control

GitHub automatically tracks all changes:

- View history: Click file → "History"
- Compare versions: Click any commit
- Revert changes: Click "Revert" on any commit

## Step 9: Add to App Store Listings

### Google Play Store

In your app listing:

- **Privacy Policy URL:** `https://YOUR_USERNAME.github.io/earn9ja-legal/privacy-policy`

### Apple App Store

In App Store Connect:

- **Privacy Policy URL:** `https://YOUR_USERNAME.github.io/earn9ja-legal/privacy-policy`
- **Terms of Service URL:** `https://YOUR_USERNAME.github.io/earn9ja-legal/terms-of-service`

## Troubleshooting

### Documents Not Loading

- Wait 2-3 minutes after enabling Pages
- Check Settings → Pages for deployment status
- Ensure files have `.md` extension
- Clear browser cache

### 404 Error

- Verify file names match URLs exactly
- Check that Pages is enabled
- Ensure branch is set to `main`

### Styling Issues

- Add `_config.yml` with a theme
- Use proper Markdown formatting
- Test locally with Jekyll (optional)

## Alternative: Use a Simple HTML Page

If you prefer HTML over Markdown:

1. Rename files: `privacy-policy.md` → `privacy-policy.html`
2. Convert Markdown to HTML (use https://markdowntohtml.com)
3. Add basic styling:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Privacy Policy - Earn9ja</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
        line-height: 1.6;
      }
      h1 {
        color: #2c3e50;
      }
      h2 {
        color: #34495e;
        margin-top: 30px;
      }
    </style>
  </head>
  <body>
    <!-- Your content here -->
  </body>
</html>
```

## Benefits of GitHub Pages

✅ **Free hosting**  
✅ **HTTPS by default**  
✅ **Version control**  
✅ **Easy updates**  
✅ **Professional URLs**  
✅ **No server maintenance**  
✅ **99.9% uptime**

## Next Steps

1. ✅ Create repository
2. ✅ Upload documents
3. ✅ Enable Pages
4. ✅ Test URLs
5. ✅ Update app with links
6. ✅ Add to app store listings
7. ✅ Notify users of policy locations

## Support

Need help? Contact:

- GitHub Support: https://support.github.com
- GitHub Pages Docs: https://docs.github.com/pages

---

**Created for Earn9ja**  
Last Updated: January 2, 2025
