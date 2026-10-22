const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const PDFLib=require('pdf-lib');const {createCanvas}=require('@napi-rs/canvas');
(async()=>{
 const code=fs.readFileSync(__dirname+'/../public/merge.js','utf8');
 const fixture=await PDFLib.PDFDocument.create();fixture.addPage([300,400]);fixture.addPage([400,300]);const bytes=await fixture.save();
 const c=createCanvas(40,20);c.getContext('2d').fillRect(0,0,40,20);
 const mark={data:c.toDataURL('image/png'),x:.1,y:.2,w:.25,h:.1};
 const context={loadEngine:async()=>PDFLib,sources:[{id:1,bytes}],pages:[{source:1,index:1,view:{width:400,height:300,transform:[1,0,0,-1,0,300]},marks:[mark]},{source:1,index:0}],Math,Map};let functions="";
 for(const name of ['pdfMarkPlacement','applyMarks','makePdf']){const start=code.indexOf((name==='pdfMarkPlacement'?'function ':'async function ')+name+'(');const end=code.indexOf('\n',start);functions+=code.slice(start,end)+"\n"}
 Object.assign(context,new Function("loadEngine","sources","pages",functions+"return {makePdf,pdfMarkPlacement}")(context.loadEngine,context.sources,context.pages));
 const output=await PDFLib.PDFDocument.load(await context.makePdf());assert.deepEqual(output.getPages().map(p=>[p.getWidth(),p.getHeight()]),[[400,300],[300,400]]);
 const placement=context.pdfMarkPlacement(context.pages[0].view,mark);assert.equal(placement.x,40);assert.ok(Math.abs(placement.y-210)<1e-8);assert.equal(placement.width,100);assert.equal(placement.angle,0);assert.ok(output.getPage(0).node.Resources().toString().includes('Image'));
 for(const transform of [[0,1,1,0,0,0],[-1,0,0,1,400,0],[0,-1,-1,0,300,400]]){const p=context.pdfMarkPlacement({width:400,height:300,transform},mark);assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.width>0&&p.height>0)}
 console.log('PASS actual PDF output order, dimensions, embedded signature image, rotated placement');
})().catch(e=>{console.error(e);process.exit(1)});
