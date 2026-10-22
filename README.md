# MYORYX Scan
Editable camera scanner and image-to-PDF web app. All document processing runs locally in the browser; there is no backend or paid API.

## Features
Camera capture with phone-camera fallback; multiple image upload; crop; rotate; grayscale and black-and-white filters; brightness; page ordering; PDF download and supported device sharing; Arabic/English interface.

## Edit
- `public/index.html`: layout, labels, styling
- `public/app.js`: scanner, editing, translations, PDF generation
- `public/manifest.json`: app name and install settings
- `public/icon.svg`: app icon
- `public/sw.js`: basic offline cache (bump cache version when changing assets)

## Local preview
Run `python -m http.server 8000 --directory public`, then open http://localhost:8000. Camera access requires HTTPS or localhost. Accessing a development computer through an ordinary HTTP LAN address will not enable camera access.

## GitHub
Create a repository named `MYORYX-Scan`. Upload the contents of this project folder at the repository root, keeping the `public` folder intact.

## Render
Create a **Static Site**, connect the GitHub repository, leave the build command blank, and set publish directory to `public`. A `render.yaml` is also included for Blueprint deployment. HTTPS enables phone camera access.

## Vercel
Import the repository. Framework: Other. No build command. Output directory: `public`.

## Android
Open the HTTPS website in Chrome. Use Add to home screen when available. This source is a web app, not an APK. A native Android package can be added later.

## Current limitations
Automatic light-paper boundary proposals with manual crop review. Auto sizing matches image proportions (A4-like ratio or image fit); it does not measure physical paper. No perspective correction or searchable PDF text layer. Arabic/English OCR uses Tesseract.js 5.1.1 downloaded from jsDelivr, plus engine and language files; processing occurs on device. Extracted text is editable and exportable to TXT. JPG export/share applies to the selected page. The optional MYORYX watermark adds a footer band to PDF and JPG, keeping the original content unobscured. Device sharing falls back to download when unsupported. Images are resized to a maximum dimension of 2200 pixels. Pages are kept in memory and lost when the app reloads. Save the PDF before closing. Camera, device sharing, and home-screen installation require testing on the target phone. Offline use depends on successful initial caching and host access requirements.

## Validation
JavaScript syntax checked. Generated two-page PDF opened successfully with a PDF parser, with embedded JPEGs and A4 dimensions.


## Unified page panel
Prepare a photo using the scanner tools, then choose **All pages**. Prepared scans move into the document once; imported PDFs and images join the same output sequence. Scanner drafts clear only after successful PDF parsing. Returning to the panel preserves annotations, order and deletions. To scan more, use **Scan more**, prepare the scan, then return to **All pages**.

Each full-page preview includes Move up, Move down and Delete. Select a page for Signature / image, draw a handwritten signature or upload a PNG/JPG, then drag and resize it. Add pages inserts PDFs/images before or after the selected page. Download and Share use the same ordered document, preserving original PDF pages and applying annotations in PDF coordinates. Scan crop/filter changes should be completed before transferring the scan. Document contents remain in memory until reload.

## Panel validation
Install development dependencies with `npm install`. `npm test` verifies PDF order, page dimensions, embedded annotation images and rotated placement. For the browser regression, run `npx playwright install chromium`, serve `public` on localhost:8000, then run `npm run test:browser`. The browser regression covers mixed inputs, transfer, reorder/delete, drawn signatures, inserted images, downloads, reopening, mobile width and Arabic RTL. It uses local PDF engine packages to avoid CDN dependence during testing. Production retains the existing CDN versions.
