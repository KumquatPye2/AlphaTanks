# FTP Deployment Guide for DiscountASP.NET

## When File Manager Isn't Available

If you can't find a web-based file manager, FTP is the most reliable method for DiscountASP.NET.

### Step 1: Get Your FTP Credentials

Look in your DiscountASP.NET control panel for:
- **"FTP Accounts"**
- **"FTP Access"** 
- **"FTP Details"**
- **"Account Information"**

You'll need:
- **FTP Server/Host:** Usually `ftp.yourdomain.com` or an IP address
- **Username:** Your account username or domain-specific username
- **Password:** Your FTP password (may be different from control panel password)
- **Port:** Usually 21 (standard) or 22 (SFTP)

### Step 2: Download an FTP Client

**Recommended Free Options:**
- **FileZilla** (Windows/Mac/Linux) - https://filezilla-project.org/
- **WinSCP** (Windows only) - https://winscp.net/
- **Cyberduck** (Windows/Mac) - https://cyberduck.io/

### Step 3: Connect via FTP

**Using FileZilla:**
1. Open FileZilla
2. Enter your FTP details:
   - Host: `ftp.yourdomain.com`
   - Username: [your FTP username]
   - Password: [your FTP password]
   - Port: 21
3. Click "Quickconnect"

### Step 4: Navigate to Website Directory

Once connected, look for:
- `wwwroot/`
- `public_html/`
- `httpdocs/`
- Your domain name folder
- `www/`

### Step 5: Upload Your Files

**Method A: Upload ZIP and Extract Locally**
1. First, extract `AlphaTanks-DiscountASP.zip` on your computer
2. Upload all the extracted files via FTP
3. Maintain the folder structure (core/, refactored/ folders)

**Method B: Upload ZIP (if web extraction available)**
1. Upload `AlphaTanks-DiscountASP.zip` to the root directory
2. Log back into control panel to find extraction option
3. Or contact support for extraction

### File Structure After Upload:
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

## Quick FTP Upload Script

If you're comfortable with PowerShell, here's a script to help:
