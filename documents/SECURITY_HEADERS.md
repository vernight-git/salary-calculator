# Security Headers Configuration

This document provides recommended security headers for deploying the German Salary Calculator.

## 🔒 Recommended Security Headers

### Content Security Policy (CSP)

```
Content-Security-Policy: default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self' data:;
  connect-src 'self';
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self'
```

**What it does:** Prevents XSS attacks by controlling which resources can be loaded.

**Note:** `'unsafe-inline'` is currently needed for React inline styles. For production, consider moving to a CSS-in-JS solution that supports CSP nonces.

### X-Frame-Options

```
X-Frame-Options: DENY
```

**What it does:** Prevents clickjacking attacks by disallowing the page from being embedded in frames.

### X-Content-Type-Options

```
X-Content-Type-Options: nosniff
```

**What it does:** Prevents MIME-sniffing attacks by ensuring browsers respect declared content types.

### Referrer-Policy

```
Referrer-Policy: strict-origin-when-cross-origin
```

**What it does:** Controls how much referrer information is shared when navigating away from the site.

### Permissions-Policy

```
Permissions-Policy: geolocation=(), microphone=(), camera=(), payment=()
```

**What it does:** Disables unused browser features to reduce attack surface.

### Strict-Transport-Security (HSTS)

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

**What it does:** Forces browsers to use HTTPS for all connections.

**Note:** Only enable this when you have a valid SSL certificate and are ready to commit to HTTPS.

## 📦 Implementation by Platform

### Netlify

Create `netlify.toml` in the project root:

```toml
[[headers]]
  for = "/*"
  [headers.values]
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "geolocation=(), microphone=(), camera=(), payment=()"
    Strict-Transport-Security = "max-age=31536000; includeSubDomains; preload"

[[headers]]
  for = "/*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/data/*"
  [headers.values]
    Cache-Control = "public, max-age=300, must-revalidate"
```

### Vercel

Create `vercel.json` in the project root:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "geolocation=(), microphone=(), camera=(), payment=()"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains; preload"
        }
      ]
    }
  ]
}
```

### Nginx

Add to your Nginx configuration:

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    # SSL configuration
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Security Headers
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=(), payment=()" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

    # Serve static files
    root /var/www/salary-calculator/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Don't cache HTML
    location ~* \.html$ {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

### Apache

Add to `.htaccess` or Apache configuration:

```apache
<IfModule mod_headers.c>
    Header set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
    Header set X-Frame-Options "DENY"
    Header set X-Content-Type-Options "nosniff"
    Header set Referrer-Policy "strict-origin-when-cross-origin"
    Header set Permissions-Policy "geolocation=(), microphone=(), camera=(), payment=()"
    Header set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
</IfModule>

# Redirect HTTP to HTTPS
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
    ExpiresByType application/json "access plus 5 minutes"
</IfModule>
```

### GitHub Pages

GitHub Pages automatically provides HTTPS. To add custom headers, you'll need to use a CDN like Cloudflare in front of GitHub Pages.

## 🧪 Testing Security Headers

### Online Tools

1. **Mozilla Observatory**: https://observatory.mozilla.org/
2. **Security Headers**: https://securityheaders.com/
3. **SSL Labs**: https://www.ssllabs.com/ssltest/

### Manual Testing

```bash
# Check headers with curl
curl -I https://yourdomain.com

# Check specific header
curl -I https://yourdomain.com | grep -i "content-security-policy"
```

### Browser DevTools

1. Open DevTools (F12)
2. Go to Network tab
3. Reload the page
4. Click on the first request (usually the HTML document)
5. Check the "Response Headers" section

## 📋 Security Checklist

Before deploying to production:

- [ ] All security headers configured
- [ ] HTTPS enabled with valid certificate
- [ ] Headers tested with online tools
- [ ] CSP tested and not blocking legitimate resources
- [ ] HSTS header added (only after HTTPS is stable)
- [ ] Subresource Integrity (SRI) considered for external resources
- [ ] Regular security audits scheduled

## 🔄 Updating CSP for New Features

If you add new features that require external resources:

1. **Test in development** with CSP in report-only mode:

   ```
   Content-Security-Policy-Report-Only: ...
   ```

2. **Monitor violations** in browser console

3. **Update CSP** to allow necessary resources

4. **Apply to production** after testing

## 📚 Additional Resources

- [MDN Web Docs - CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [OWASP Secure Headers Project](https://owasp.org/www-project-secure-headers/)
- [Content Security Policy Reference](https://content-security-policy.com/)
- [Can I Use - Security Headers](https://caniuse.com/?search=csp)

## ⚠️ Important Notes

1. **Test thoroughly** before enabling strict CSP in production
2. **Monitor errors** after enabling new security headers
3. **Keep headers updated** as security best practices evolve
4. **Document exceptions** if you need to relax any policies
5. **Regular audits** should be part of your maintenance schedule
