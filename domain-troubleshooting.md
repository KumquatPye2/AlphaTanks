# Domain Configuration Troubleshooting for evostevo.com

## Error Analysis
**Error:** ERR_CONNECTION_RESET
**Meaning:** The domain is not pointing to any active web server

## This is NOT an AlphaTanks application issue - it's a hosting/DNS configuration problem.

## Immediate Diagnostic Steps:

### 1. Check Domain Status
Open Command Prompt/PowerShell and run:
```
nslookup evostevo.com
```

This will show you:
- If the domain resolves to an IP address
- What IP address it points to
- If DNS is configured correctly

### 2. Check DiscountASP.NET Control Panel

Look for these sections in your DiscountASP.NET control panel:
- **Domain Management**
- **DNS Settings** 
- **Name Servers**
- **Domain Pointer/Redirect**
- **Website Status**

### 3. Verify Hosting Account Status
- Is your hosting account active?
- Is the domain properly added to your hosting account?
- Are there any pending setup tasks?

## Common Causes & Solutions:

### Cause 1: Domain Not Added to Hosting Account
**Solution:** Add `evostevo.com` to your DiscountASP.NET hosting account
- Look for "Add Domain" or "Domain Management"
- Add both `evostevo.com` AND `www.evostevo.com`

### Cause 2: DNS Not Configured
**Solution:** Point domain to DiscountASP.NET nameservers
- Get nameservers from DiscountASP.NET (usually something like `ns1.discountasp.net`)
- Update DNS at your domain registrar (where you bought the domain)

### Cause 3: Hosting Not Active
**Solution:** Verify hosting account is provisioned and active
- Check hosting account status
- Look for setup completion emails from DiscountASP.NET

### Cause 4: Wrong Directory
**Solution:** Files might be uploaded to wrong location
- Verify files are in the correct website directory for `evostevo.com`

## Quick Tests:

### Test 1: Check DiscountASP.NET IP
Try accessing your hosting directly by IP address (if provided by DiscountASP.NET)

### Test 2: Try Subdomain
If DiscountASP.NET gave you a temporary subdomain, try that first:
- Something like `youraccount.discountasp.net`

### Test 3: Check Other Sites on Same Hosting
If you have other websites on the same account, do they work?

## What You Need to Check in DiscountASP.NET:

1. **Domain Status:** Is `evostevo.com` listed and active?
2. **DNS Settings:** Are nameservers pointing correctly?
3. **Website Files:** Are files uploaded to the correct domain folder?
4. **Account Status:** Is hosting account fully activated?

## Likely Resolution Steps:

1. **Verify domain is added** to your DiscountASP.NET hosting account
2. **Update DNS** at your domain registrar to point to DiscountASP.NET nameservers
3. **Wait for DNS propagation** (can take 24-48 hours)
4. **Upload files** to the correct directory once domain is active

## Contact DiscountASP.NET Support

This is exactly the type of issue their support team handles daily. Contact them with:

**Subject:** "Domain evostevo.com not resolving - ERR_CONNECTION_RESET"

**Message:** 
"Hi, I'm trying to set up my website at evostevo.com but getting ERR_CONNECTION_RESET errors. The domain doesn't seem to be connecting to my hosting account. Can you help me verify:
1. Is evostevo.com properly added to my hosting account?
2. What nameservers should I use for this domain?
3. Is my hosting account fully activated?
4. Where should I upload my website files?"

## Important Note:
Your AlphaTanks application files are ready and will work fine once the hosting/DNS issue is resolved. This is purely a hosting configuration problem, not an application problem.
