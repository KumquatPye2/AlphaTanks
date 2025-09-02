# GitHub Pages Custom Domain Setup for evostevo.com

## Step-by-Step Guide

### Phase 1: Enable GitHub Pages (5 minutes)

1. **Go to your repository settings:**
   - Navigate to: https://github.com/KumquatPye2/AlphaTanks/settings/pages

2. **Configure Pages:**
   - Source: "Deploy from a branch"
   - Branch: "main"
   - Folder: "/ (root)"
   - Click "Save"

3. **Wait for initial deployment:**
   - GitHub will build and deploy your site
   - Initial URL: https://kumquatpye2.github.io/AlphaTanks/
   - Takes 2-5 minutes for first deployment

### Phase 2: Add Custom Domain (10 minutes)

4. **Add custom domain in GitHub:**
   - Still in Pages settings
   - Under "Custom domain"
   - Enter: `evostevo.com`
   - Click "Save"

5. **GitHub will create CNAME file:**
   - This tells GitHub to serve your site at evostevo.com
   - File will appear in your repository automatically

### Phase 3: Update DNS Settings (15 minutes)

6. **Update DNS at your domain registrar:**
   - Log into where you bought evostevo.com (GoDaddy, Namecheap, etc.)
   - Find DNS management section
   - Update these records:

**DNS Records to Set:**
```
Type: CNAME
Name: www
Value: kumquatpye2.github.io

Type: A (4 records needed)
Name: @ (or leave blank for root domain)
Values:
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

### Phase 4: Enable HTTPS (Automatic)

7. **Wait for DNS propagation:**
   - Can take 24-48 hours
   - Usually works within 1-2 hours

8. **GitHub automatically enables SSL:**
   - Free Let's Encrypt certificate
   - HTTPS enforced automatically
   - No additional configuration needed

## Expected Timeline:

- **5 minutes:** GitHub Pages enabled
- **15 minutes:** DNS updated
- **1-2 hours:** Site accessible at evostevo.com
- **24 hours:** Fully propagated globally

## Final Result:

- **URL:** https://evostevo.com
- **HTTPS:** Automatic and free
- **Performance:** Global CDN
- **Cost:** $0
- **Maintenance:** Automatic updates from Git

## What Happens to Current evostevo.com:

- **Existing content:** Will be replaced by AlphaTanks
- **Complexity Apps:** Will no longer be accessible at evostevo.com
- **Backup:** You can access them temporarily while DNS propagates

## Testing:

While waiting for DNS:
1. **Test GitHub Pages:** https://kumquatpye2.github.io/AlphaTanks/
2. **Monitor DNS:** Use online DNS checkers
3. **Verify:** evostevo.com points to GitHub

## Advantages of This Setup:

✅ **Professional URL:** evostevo.com  
✅ **Free HTTPS:** Let's Encrypt SSL  
✅ **Fast Loading:** GitHub's global CDN  
✅ **Auto-deploy:** Push to Git = instant updates  
✅ **99.9% Uptime:** GitHub's infrastructure  
✅ **No monthly costs:** Completely free  

Ready to start? I'll guide you through each step!
