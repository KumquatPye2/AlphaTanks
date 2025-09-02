# AlphaTanks Deployment Guide for DiscountASP.NET

## Overview
This guide will help you deploy your AlphaTanks application to DiscountASP.NET hosting. The application is a static web application that runs entirely in the browser.

## Pre-Deployment Checklist
- ✅ Application cleaned and optimized for production
- ✅ Deployment package created (`AlphaTanks-DiscountASP.zip`)
- ✅ Web.config file configured for IIS
- ✅ All dependencies included

## Deployment Steps

### Step 1: Access Your DiscountASP.NET Control Panel
1. Log in to your DiscountASP.NET customer portal
2. Navigate to your hosting control panel
3. Look for "File Manager" or "FTP Access"

### Step 2: Upload Files

#### Option A: Using File Manager (Recommended)
1. Open the File Manager in your control panel
2. Navigate to your website's root directory (usually `wwwroot` or `public_html`)
3. Upload the `AlphaTanks-DiscountASP.zip` file
4. Extract the ZIP file contents directly in the root directory
5. Delete the ZIP file after extraction

#### Option B: Using FTP
1. Get your FTP credentials from the control panel
2. Use an FTP client (FileZilla, WinSCP, etc.)
3. Connect to your FTP server
4. Navigate to the root web directory
5. Upload all files from the `deploy` folder
6. Maintain the folder structure (core/, refactored/ directories)

### Step 3: Verify File Structure
After upload, your root directory should contain:
```
wwwroot/ (or public_html/)
├── index.html
├── main.js
├── game-engine.js
├── evolution-engine.js
├── tank-ai.js
├── config.js
├── api-key-manager.js
├── multi-provider-api-key-manager.js
├── multi-provider-llm-client.js
├── deepseek-client.js
├── asi-arch-integration.js
├── asi-arch-modules.js
├── asi-arch-visualizer.js
├── enhanced-asi-arch.js
├── llm-enhanced-asi-arch.js
├── enhanced-obstacle-system.js
├── hill-control.js
├── tactical-evolution-display.js
├── favicon.svg
├── web.config
├── core/
│   ├── analyst-insights.js
│   ├── cognition-insights.js
│   ├── constants.js
│   ├── dashboard-ui.js
│   ├── data-collector.js
│   ├── engineer-insights.js
│   ├── eval-queue.js
│   ├── researcher-insights.js
│   └── utils.js
└── refactored/
    ├── ai/
    ├── common/
    └── game/
```

### Step 4: Configure Domain (if needed)
1. If using a subdomain, ensure it points to the correct directory
2. If using the main domain, ensure files are in the primary web directory
3. Wait for DNS propagation if you've made domain changes

### Step 5: Test Your Deployment
1. Navigate to your domain (e.g., https://yourdomain.com)
2. Verify the application loads correctly
3. Test the tank evolution functionality
4. Check browser console for any errors

## Important Configuration Notes

### Web.config File
The included `web.config` file configures:
- MIME types for `.svg` and `.js` files
- Default document (index.html)
- 404 error handling (redirects to index.html for SPA behavior)

### HTTPS Configuration
DiscountASP.NET typically provides SSL certificates. Ensure your site is accessed via HTTPS for:
- Better security
- Required for some browser APIs
- Better SEO ranking

### API Configuration
The application includes multiple API providers:
- DeepSeek AI (primary)
- OpenAI (fallback)
- Anthropic (fallback)
- All configured for client-side operation

## Troubleshooting

### Common Issues

**1. 404 Errors for JavaScript Files**
- Ensure all `.js` files are uploaded
- Check that file extensions are preserved
- Verify the `web.config` MIME type settings

**2. Application Not Loading**
- Check that `index.html` is in the root directory
- Verify the default document is set to `index.html`
- Check browser console for JavaScript errors

**3. API Not Working**
- The app works in "Mock Mode" by default
- Users can add their own API keys in the interface
- No server-side configuration required

**4. Missing Favicon**
- Ensure `favicon.svg` is uploaded to the root directory
- Check browser cache if favicon doesn't appear immediately

### Performance Optimization
- DiscountASP.NET typically provides good caching
- The application is optimized for static hosting
- Total size is under 1MB for fast loading

### Support
- DiscountASP.NET support can help with hosting-specific issues
- Application-specific issues: Check browser console for errors
- GitHub repository: https://github.com/KumquatPye2/AlphaTanks

## Security Notes
- Application runs entirely client-side
- No server-side vulnerabilities
- API keys are stored locally in browser
- No sensitive data transmitted to server

## Backup and Updates
- Keep the deployment ZIP file for future reference
- For updates: Replace files via File Manager or FTP
- Consider using Git for version control of your local files

## Success Criteria
✅ Application loads at your domain  
✅ Tank evolution simulation runs  
✅ All UI controls responsive  
✅ No console errors  
✅ Favicon displays correctly  
✅ HTTPS certificate active  

---

**Deployment completed successfully!** 🎉

Your AlphaTanks application should now be live at your DiscountASP.NET domain.
