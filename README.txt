IFA MESFIN — CINEMATIC PORTFOLIO

FILES
- index.html: website structure and project content
- styles.css: visual design, responsive layouts, animations
- enhance.css / enhance.js: 3D scroll effects, direction-aware reveals, 3D archive ring, case-study viewer, recommendations
- data.js: project data generated from the assets folders
- assets/thumbs: optimized WebP previews; assets/analysis: asset report (open assets-analysis.html)
- script.js: loader, scroll reveals, mobile navigation, project filters, image viewer, cursor, contact form
- assets/page-000.jpg through page-008.jpg: original full-page artwork extracted from PORTFOLIO EFAMESFIN.pdf

RUN LOCALLY
1. Keep the assets folder next to index.html.
2. Open index.html in a modern browser, or serve the folder with a local static server.

IMPORTANT CUSTOMIZATION
The PDF does not provide a verified email address in machine-readable text. To enable the contact form's email-draft action, open enhance.js and set:
const CONTACT_EMAIL = 'your-confirmed-email@example.com';
at the top of the file. Also replace the three SAMPLE recommendation cards in index.html (#coverflow) with real client quotes. Replace it only with the designer's real address. The form does not currently submit to a backend.

NOTES
- All nine original PDF pages are included as the authentic portfolio gallery assets.
- Portfolio labels are descriptive website labels; open each image to view the original page artwork.
- Google Fonts are loaded from Google Fonts when an internet connection is available. System fallbacks are included.
- This is a static frontend. It does not include a server, CMS, or database.

UPDATE — ARCHIVE & WORK FIXES
- Work slider: slower, eased track (was ~2.8x scroll speed, now ~1.7x with glide); narrow/tablet/touch screens (<=1024px or coarse pointer) use a swipe/drag slider with previous/next SVG arrows and a synced progress bar; resize/rotation keeps position and stays interactive; trailing spacer so the last image is never clipped.
- Archive ring: radius measured with offsetWidth (stable spacing at every size), wider consistent gap, eased rotation that starts on the first card and ends on the last.
- Viewer: custom cursor now sits above it, real scroll-lock on <html>, no scrollIntoView shifting, safer swipe, clean wrap from last to first image.
