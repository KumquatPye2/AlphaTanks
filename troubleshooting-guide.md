# DiscountASP.NET Troubleshooting Guide

## URL Issue Analysis

**Your URL:** `http://www.evostevo.com/AlphaTanks`
**Error:** "Internal server error"

## Possible Issues & Solutions:

### 1. URL Structure Problem
**Issue:** The `/AlphaTanks` path suggests files are in a subfolder
**Solution:** Check where you uploaded the files

### 2. HTTPS vs HTTP
**Issue:** DiscountASP.NET may force HTTPS
**Try:** `https://www.evostevo.com/AlphaTanks`

### 3. Missing Default Document
**Issue:** Server can't find index.html
**Solution:** Verify file locations

### 4. Web.config Issues
**Issue:** IIS configuration problems
**Solution:** Check web.config syntax

## Debugging Steps:

### Step 1: Try Different URLs
Test these URLs in order:

1. `https://evostevo.com` (root domain)
2. `https://www.evostevo.com` (www subdomain)
3. `https://evostevo.com/index.html` (direct file)
4. `https://www.evostevo.com/index.html` (www + direct file)
5. `https://evostevo.com/AlphaTanks/` (subfolder with trailing slash)
6. `https://www.evostevo.com/AlphaTanks/` (www + subfolder + slash)
7. `https://evostevo.com/AlphaTanks/index.html` (direct file in subfolder)

### Step 2: Check File Locations
The files should be in one of these locations:
- **Root deployment:** Files directly in `wwwroot/` or `public_html/`
- **Subfolder deployment:** Files in `wwwroot/AlphaTanks/` or `public_html/AlphaTanks/`

### Step 3: Verify Web.config
The web.config file might be causing issues.

## Quick Fixes:

### Fix 1: Remove Web.config Temporarily
If web.config is causing issues, try without it first.

### Fix 2: Check File Permissions
Ensure files have read permissions for IIS.

### Fix 3: Use Simple HTML Test
Create a simple test.html file to verify basic hosting works.
