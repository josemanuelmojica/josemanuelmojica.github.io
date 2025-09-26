---
title: "Colophon"
permalink: /colophon/
layout: single
author_profile: true
---

This page documents the technical details, tools, and decisions behind this digital journal.

## Technology Stack

This site is built with modern web technologies optimized for performance, accessibility, and longevity:

### Core Platform
- **[Jekyll](https://jekyllrb.com/)** - Static site generator
- **[GitHub Pages](https://pages.github.com/)** - Hosting and deployment
- **[Minimal Mistakes](https://mmistakes.github.io/minimal-mistakes/)** - Jekyll theme via remote_theme

### Jekyll Plugins
Only GitHub Pages-supported plugins are used to ensure compatibility:

- `jekyll-seo-tag` - SEO metadata and structured data
- `jekyll-sitemap` - XML sitemap generation
- `jekyll-feed` - RSS/Atom feed generation
- `jekyll-paginate` - Content pagination
- `jekyll-include-cache` - Performance optimization
- `jekyll-remote-theme` - Remote theme support

### Content Organization
- **Collections** for different content types (Essays, Daybook, Letters)
- **Custom layouts** for specific content needs
- **Include files** for reusable components
- **Front matter** for metadata and content management

## Design Philosophy

### Minimal and Focused
The design prioritizes readability and content over visual complexity. The Minimal Mistakes theme provides a clean, distraction-free reading experience.

### Performance First
- Static site generation for fast loading
- No JavaScript dependencies for core functionality
- Optimized images and minimal CSS
- Clean, semantic HTML structure

### Accessibility
- Semantic HTML markup
- Proper heading hierarchy
- Alt text for images
- Keyboard navigation support
- Screen reader compatibility

### Responsive Design
The site works seamlessly across:
- Desktop computers
- Tablets
- Mobile phones
- Various screen sizes and orientations

## Content Management

### Writing Process
- Posts written in Markdown for portability
- Git version control for change tracking
- Structured front matter for metadata
- Content warnings system for sensitive topics

### Organization System
- **Essays** - Long-form explorations
- **Daybook** - Daily observations and brief thoughts
- **Letters** - Correspondence and addressed writings
- **Topics** - Tag-based content organization
- **Timeline** - Chronological content view

## Technical Decisions

### Static Site Benefits
- **Security** - No database or server-side vulnerabilities
- **Performance** - Pre-generated HTML loads instantly
- **Reliability** - Simple hosting with high uptime
- **Portability** - Content can be easily migrated
- **Version Control** - Full history of changes

### GitHub Pages Constraints
The site is designed within GitHub Pages limitations:
- Only supported Jekyll plugins
- No custom Ruby gems
- Static content only
- Git-based deployment workflow

### Content Warning System
Custom implementation using:
- Front matter flags (`cw: true`)
- Include files for warning display
- JavaScript-free progressive disclosure
- Accessible show/hide functionality

## Privacy and Analytics

### No Tracking
This site is designed with privacy in mind:
- No Google Analytics or tracking scripts
- No cookies or local storage
- No third-party content delivery networks
- No social media widgets or tracking pixels

### Data Collection
The only data collected is through:
- GitHub Pages access logs (managed by GitHub)
- RSS feed subscriptions (anonymous)
- No personal information stored or tracked

## Version History

This colophon documents the current version of the site. Major changes and updates are tracked through Git commits in the site repository.

### Current Version
- **Built:** {{ site.time | date: "%Y-%m-%d" }}
- **Jekyll Version:** {{ jekyll.version }}
- **Theme:** Minimal Mistakes via remote_theme

## Source Code

The complete source code for this site is available on GitHub:
**[View Source](https://github.com/josemanuelmojica/josemanuelmojica.github.io)**

## Inspiration

This digital journal draws inspiration from:
- Traditional paper journals and commonplace books
- The IndieWeb movement and personal website renaissance  
- Academic and literary traditions of reflective writing
- The principles of calm technology and slow web

---

*This colophon serves as both documentation and a statement of values around technology, privacy, and digital craftsmanship.*