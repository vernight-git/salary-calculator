# Deployment Guide

## Overview

The German Salary Calculator is a static React application that can be deployed to any static hosting service. No server-side processing is required.

## Prerequisites

- Node.js 20 or later
- npm (comes with Node.js)

## Build for Production

```bash
# Install dependencies
npm ci

# Run tests
npm test

# Run linting
npm run lint

# Type check
npm run typecheck

# Build for production
npm run build
```

The production-ready files will be in the `dist/` directory.

## Deployment Options

### Option 1: GitHub Pages

1. Enable GitHub Pages in repository settings
2. Set source to GitHub Actions
3. Push code to trigger the CI/CD pipeline
4. The build artifacts will be automatically deployed

### Option 2: Netlify

1. Connect your GitHub repository to Netlify
2. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Deploy

**Netlify Configuration** (`netlify.toml`):
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Content-Security-Policy = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;"
```

### Option 3: Vercel

1. Import project from GitHub
2. Vercel will auto-detect Vite and configure build settings
3. Deploy

### Option 4: AWS S3 + CloudFront

1. Build the application: `npm run build`
2. Create an S3 bucket for static website hosting
3. Upload contents of `dist/` folder to S3
4. Configure CloudFront distribution with S3 as origin
5. Enable HTTPS with ACM certificate

### Option 5: Docker + Nginx

**Dockerfile:**
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf:**
```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Security headers
    add_header X-Frame-Options "DENY";
    add_header X-Content-Type-Options "nosniff";
    add_header Referrer-Policy "strict-origin-when-cross-origin";

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## Environment Variables

This application does not require environment variables. All configuration is in `public/data/config.json`.

## Post-Deployment Checklist

- [ ] Verify HTTPS is enabled
- [ ] Check that all security headers are present
- [ ] Test the calculator with various inputs
- [ ] Verify language switching works
- [ ] Test on mobile devices
- [ ] Check browser console for errors
- [ ] Verify configuration file loads correctly
- [ ] Test all tax classes
- [ ] Verify bonus calculations

## Updating Tax Parameters

To update tax brackets, rates, or allowances:

1. Edit `public/data/config.json`
2. Deploy the updated file
3. No rebuild is necessary (static file)

For Netlify/Vercel: Push to GitHub and redeploy  
For S3: Upload new config.json to the bucket  
For Docker: Rebuild and redeploy container

## Monitoring

### Recommended Tools

- **Error Tracking:** Sentry, Rollbar, or similar
- **Analytics:** Google Analytics, Plausible, or similar
- **Uptime Monitoring:** UptimeRobot, Pingdom
- **Performance:** Lighthouse CI

### Health Checks

Since this is a static app, health checks should verify:
- HTTP 200 response on root path
- config.json loads successfully
- JavaScript bundle loads

## Rollback Procedure

If issues arise after deployment:

1. **GitHub Pages:** Revert the commit and push
2. **Netlify/Vercel:** Use built-in rollback feature in dashboard
3. **S3:** Restore previous version from S3 versioning
4. **Docker:** Deploy previous container image tag

## Troubleshooting

### Build Fails

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Config Not Loading

- Verify `public/data/config.json` exists
- Check browser console for 404 errors
- Ensure JSON is valid

### 404 on Refresh

Configure server to serve `index.html` for all routes (SPA routing).

## Support

For issues or questions:
- Check GitHub Issues
- Review test documentation in `documents/`
- Refer to production readiness assessment

## Next Steps After Deployment

1. Monitor error rates
2. Collect user feedback
3. Update tax parameters annually
4. Review security assessments quarterly
