# Deploy AlphaTanks as Main Site at evostevo.com

## Strategy: Replace Current Site on DiscountASP.NET

### Step 1: Backup Current Site (Important!)
Before uploading AlphaTanks, save the current "Complexity Web Apps" site:

**Download these files from your hosting:**
- `index.html` (the complexity homepage)
- `bootstrap.css`
- Any folders: `chaos/`, `BooleanNetwork/`, `CA/`, `Autocatalytic/`, `Life/`, `blog/`

**Save to a backup folder** in case you want to restore them later.

### Step 2: Upload AlphaTanks to Root Directory
Upload all files from your `ftp-upload` folder to the root directory (where the current index.html is):

**Files to upload:**
- `index.html` (AlphaTanks version - will replace complexity homepage)
- All JavaScript files (main.js, game-engine.js, etc.)
- `core/` directory
- `refactored/` directory  
- `favicon.svg`
- `web.config`

### Step 3: Result
- **Main site:** `http://evostevo.com` → AlphaTanks
- **Direct access** to your tank evolution app
- **Uses your existing hosting** and domain

### Step 4: Optional - Preserve Complexity Apps
If you want to keep the complexity apps accessible:

**Option A:** Upload them to `/complexity/` subdirectory
- Access at: `http://evostevo.com/complexity/`

**Option B:** Create a link in AlphaTanks to the apps
- Add a "Other Projects" section in AlphaTanks interface

## File Upload Process:

### Via FTP (Recommended):
1. **Connect to your DiscountASP.NET FTP**
2. **Download existing files** (backup)
3. **Delete old index.html**
4. **Upload all AlphaTanks files**
5. **Maintain folder structure** (core/, refactored/)

### Via File Manager:
1. **Access DiscountASP.NET file manager**
2. **Backup existing files**
3. **Upload AlphaTanks ZIP**
4. **Extract in root directory**
5. **Delete any conflicting files**

## DNS Considerations:
- **No DNS changes needed** - evostevo.com already points correctly
- **HTTP access:** `http://evostevo.com` will work immediately
- **HTTPS access:** Would require SSL add-on ($10/month) or custom setup

## Testing Plan:
1. **Upload files**
2. **Test:** `http://evostevo.com`
3. **Verify:** All features work
4. **Check:** No broken links or 404 errors

Would you like me to help you with the specific upload process?
