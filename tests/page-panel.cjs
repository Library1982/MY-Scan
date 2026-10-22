// Run: node tests/page-panel.cjs (serve public on localhost:8000 first).
const {chromium}=require('playwright');
const {PDFDocument}=require('pdf-lib');
const fs=require('fs');const path=require('path');const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:390,height:844},serviceWorkers:'block'});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 // Use installed copies of the same engines so tests do not depend on CDN availability.
 await page.route('**/pdf-lib@*/dist/pdf-lib.min.js',r=>r.fulfill({path:path.join(path.dirname(require.resolve('pdf-lib/package.json')),'dist/pdf-lib.min.js'),contentType:'text/javascript'}));
 await page.route('**/pdfjs-dist@*/build/*',r=>r.fulfill({path:path.join(path.dirname(require.resolve('pdfjs-dist/package.json')),'build',r.request().url().endsWith('pdf.worker.min.mjs')?'pdf.worker.mjs':'pdf.mjs'),contentType:'text/javascript'}));
 const doc=await PDFDocument.create();doc.addPage([300,400]);doc.addPage([400,300]);const fixture=Buffer.from(await doc.save());
 await page.goto('http://localhost:8000/');
 await page.locator('#pdfFiles').setInputFiles({name:'two.pdf',mimeType:'application/pdf',buffer:fixture});await page.waitForFunction(()=>document.querySelector('#pdfPageCount').textContent.startsWith('2'));
 // Add a scanner draft then open the shared document.
 const png=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=200;c.height=300;c.getContext('2d').fillRect(0,0,200,300);return c.toDataURL().split(',')[1]});
 await page.locator('#files').setInputFiles({name:'scan.png',mimeType:'image/png',buffer:Buffer.from(png,'base64')});
 await page.locator('#quickPreview').click();await page.waitForFunction(()=>document.querySelectorAll('.document-page').length===3&&!document.querySelector('#editorAddMark').disabled);
 assert.equal(await page.locator('#count').textContent(),'0');assert.equal(await page.locator('#editorPages').isVisible(),false);
 await page.locator('.document-page').last().locator('.page-actions button').first().click();
 await page.locator('.document-page').first().locator('.page-actions button').last().click();await page.waitForFunction(()=>document.querySelectorAll('.document-page').length===2&&!document.querySelector('#editorAddMark').disabled);
 await page.locator('#editorAddMark').click();const box=await page.locator('#signatureCanvas').boundingBox();await page.mouse.move(box.x+20,box.y+30);await page.mouse.down();await page.mouse.move(box.x+100,box.y+50);await page.mouse.up();await page.locator('#useSignature').click();assert.equal(await page.locator('.page-mark').count(),1);
 await page.locator('#editorAddPages').click();await page.locator('#editorPageFiles').setInputFiles({name:'extra.png',mimeType:'image/png',buffer:Buffer.from(png,'base64')});await page.waitForFunction(()=>document.querySelectorAll('.document-page').length===3&&!document.querySelector('#editorAddMark').disabled);
 const downloadPromise=page.waitForEvent('download');await page.locator('#editorDownload').click();const download=await downloadPromise;const bytes=fs.readFileSync(await download.path());const result=await PDFDocument.load(bytes);assert.equal(result.getPageCount(),3);assert.deepEqual(result.getPages().map(p=>[p.getWidth(),p.getHeight()]),[[150,225],[150,225],[400,300]]);
 await page.locator('#closePdfPreview').click();await page.locator('#quickPreview').click();await page.waitForFunction(()=>!document.querySelector('#editorAddMark').disabled);assert.equal(await page.locator('.document-page').count(),3);assert.equal(await page.locator('.page-mark').count(),1);
 assert.equal(await page.evaluate(()=>document.querySelector('#pdfPreviewDialog').scrollWidth<=document.querySelector('#pdfPreviewDialog').clientWidth),true);
 await page.locator('#closePdfPreview').click();await page.locator('#lang').click();await page.locator('#pdfPreview').click();await page.waitForFunction(()=>!document.querySelector('#editorAddMark').disabled);assert.equal(await page.locator('html').getAttribute('dir'),'rtl');
 assert.deepEqual(errors,[]);console.log('PASS mixed import, scan transfer, reorder, delete, signature, add page, PDF geometry/order, reopen, mobile width, Arabic RTL');await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
