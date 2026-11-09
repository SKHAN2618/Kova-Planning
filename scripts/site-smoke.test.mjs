import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import vm from 'node:vm';

const js=readFileSync('assets/site.js','utf8');
new vm.Script(js,{filename:'assets/site.js'});
const callbacks={};
const nodes=new Map();
const createNode=id=>({
 id, innerHTML:'', textContent:'', hidden:true, dataset:{},
 style:{setProperty(){}},
 classList:{add(){},remove(){},toggle(){},contains(){return false}},
 appendChild(){}, setAttribute(){}, removeAttribute(){},
 addEventListener(type,fn){(callbacks[id+':'+type]??=[]).push(fn)},
 getAttribute(){return 'false'}, getBoundingClientRect(){return {bottom:88}},
 querySelector(){return null},querySelectorAll(){return []},
 scrollIntoView(){}
});
const byId=id=>{
 if(!nodes.has(id))nodes.set(id,createNode(id));
 return nodes.get(id);
};
const anatomyButtons=Array.from({length:7},(_,i)=>Object.assign(createNode('anatomy-'+i),{dataset:{anatomy:String(i)}}));
const document={
 getElementById:byId,
 querySelectorAll(selector){
   if(selector==='[data-anatomy]')return anatomyButtons;
   return [];
 },
 querySelector(selector){
   if(selector==='.insights-content'||selector==='.knowledge-section')return createNode('scroll-target');
   return null;
 },
 body:createNode('body'),
 documentElement:{style:{setProperty(){}},scrollHeight:1900,scrollTop:0},
 addEventListener(type,fn){(callbacks['document:'+type]??=[]).push(fn)}
};
const window={
 innerWidth:390,innerHeight:844,scrollY:0,
 matchMedia(){return {matches:true}},scrollTo(){},
 setTimeout(fn){fn();return 0},addEventListener(){}
};
const history={pushState(){},replaceState(){}};
const location={pathname:'/Kova-Planning/index.html',search:'',hash:''};
const context=vm.createContext({
 document,window,history,location,navigator:{clipboard:{}},
 URL,URLSearchParams,console,
 requestAnimationFrame(fn){fn()},
 IntersectionObserver:class{}
});
new vm.Script(js,{filename:'assets/site.js'}).runInContext(context,{timeout:5000});
const api=vm.runInContext('({mount,anatomyNodes,guides,selectAnatomy,showGuide,backToGuides,selectTopic,selectStage,selectScenario})',context);
const click=selectorAndNode=>{
 const event={button:0,defaultPrevented:false,target:{closest(selector){return selectorAndNode[selector]||null}},preventDefault(){this.defaultPrevented=true}};
 for(const handler of callbacks['document:click']||[])handler(event);
};
assert.equal((callbacks['document:click']||[]).length>=2,true,'Delegated clicks should be registered');
api.mount('expertise',new URLSearchParams());
assert.match(byId('main').innerHTML,/id="anatomy-of-consent"/);
assert.equal((byId('main').innerHTML.match(/class="anatomy-part(?:\s|")/g)||[]).length,7,'Seven anatomy topic controls');
for(let i=0;i<7;i++){
 click({'[data-anatomy]':{dataset:{anatomy:String(i)}}});
 assert.ok(byId('anatomy-detail').innerHTML.includes(api.anatomyNodes[i].title),'Anatomy topic '+i);
}
click({'[data-scenario]':{dataset:{scenario:'subdivision'}}});
assert.ok(byId('scenario-viewport').innerHTML.length>100,'Scenario explorer');
click({'[data-topic]':{dataset:{topic:'resource'}}});
assert.ok(byId('topic-viewport').innerHTML.length>100,'Consent topic selection');
api.mount('approach',new URLSearchParams());
click({'[data-stage]':{dataset:{stage:'5'}}});
assert.ok(byId('stage-viewport').innerHTML.length>100,'Seven-stage approach selection');
api.mount('insights',new URLSearchParams());
assert.equal(Object.keys(api.guides).length,10,'Ten explainer topics');
assert.equal((byId('main').innerHTML.match(/data-guide="/g)||[]).length,10,'Ten explainer cards in JS HTML');
for(const [key,guide] of Object.entries(api.guides)){
 click({'[data-guide]':{dataset:{guide:key}}});
 assert.ok(byId('insights-viewport').innerHTML.includes(guide.title),'Explainer '+key+' opens');
 click({'[data-back-guides]':createNode('back-guides')});
 assert.match(byId('insights-viewport').innerHTML,/data-guide="zoning"/,'Guide return navigation');
}
const expert=readFileSync('expertise.html','utf8');
const insights=readFileSync('insights.html','utf8');
const contact=readFileSync('contact.html','utf8');
assert.match(expert,/data-anatomy="6"/,'Last anatomy option is present in static HTML');
assert.equal((insights.match(/data-guide="/g)||[]).length,10,'Static HTML contains all ten explainers');
assert.match(contact,/>General Inquiries</,'General enquiries option');
for(const page of ['index','expertise','approach','insights','about','contact','privacy']){
 const html=readFileSync(page+'.html','utf8');
 assert.match(html,/assets\/site\.js\?v=080/,'Fresh versioned JavaScript on '+page);
 assert.match(html,/assets\/site\.css\?v=080/,'Fresh versioned styles on '+page);
}
console.log('PASS: syntax, seven anatomy controls, ten guide open/return interactions, consent topics, scenarios, approach stages, mobile-safe delegation and versioned assets.');

const css=readFileSync('assets/site.css','utf8');
assert.match(js,/new window\.Lenis/, 'Desktop smooth scrolling with native fallback');
assert.match(js,/outgoing\.finished\.then/, 'Outgoing page finishes before content changes');
assert.match(css,/KOVA V07\.0/, 'KOVA v07 motion and contrast design system');
for(const page of ['index','expertise','approach','insights','about','contact','privacy']){
  const html=readFileSync(page+'.html','utf8');
  assert.match(html,/lenis@1\.3\.27/, 'Pinned scroll library on '+page);
}

const homepage=readFileSync('index.html','utf8');
assert.match(homepage,/Explore all our planning explainers/,'Static homepage CTA is timeless');
assert.match(js,/Explore all our planning explainers/,'Dynamic homepage CTA matches');
assert.doesNotMatch(homepage,/Explore all 10 planning explainers/,'No numeric CTA in static markup');
assert.doesNotMatch(js,/Explore all 10 planning explainers/,'No numeric CTA in dynamic markup');
assert.match(css,/KOVA v07\.1 — responsive spacing audit/,'v07.1 CSS is present');
assert.match(css,/\.insights-preview \.insight-teasers>a:nth-child\(2\)\{/,'Dark card uses an explicit gutter');
assert.match(css,/@media\(max-width:760px\)/,'Tablet card spacing included');
assert.match(css,/@media\(max-width:650px\)/,'Phone card spacing included');
assert.match(css,/@media\(max-width:380px\)/,'Compact phone spacing included');
assert.match(css,/\.contact-layout\{grid-template-columns:minmax\(0,1fr\)/,'Tablet contact stacks gracefully');
console.log('PASS: KOVA v07.1 responsive card spacing, CTA and page asset versions.');

/* v07.2 / smooth navigation, font and architectural motion regressions */
assert.match(js,/ROOT\.animate/,'Two-phase page fade uses Web Animations');
assert.match(js,/reduceMotion\|\|typeof ROOT\.animate/,'Reduced motion and older browsers retain direct navigation');
assert.match(js,/function enhanceNavLetters/,'Staggered menu-letter hover effect');
assert.doesNotMatch(js,/const transition = document\.getElementById\('page-transition'\)/,'Obsolete blackout curtain removed from runtime');
assert.match(css,/KOVA v07\.2 \/ SILK/,'v07.2 design language included');
assert.match(css,/--font:'Instrument Sans'/,'Instrument Sans is the website body font');
assert.match(css,/--font-display:'Space Grotesk'/,'Space Grotesk gives headlines character');
assert.match(css,/::view-transition-new\(kova-content\)/,'New page fades in through View Transitions');
assert.match(css,/@keyframes kova-letter-ripple/,'Navigation ripple is defined');
assert.match(css,/\.about-drawing\.reveal img/,'Architectural drawing entrance implemented');
for(const page of ['index','expertise','approach','insights','about','contact','privacy']){
  const html=readFileSync(page+'.html','utf8');
  assert.match(html,/assets\/fonts\/instrument-sans-latin-wght-normal\.woff2/,'Instrument Sans preload on '+page);
  assert.match(html,/assets\/fonts\/space-grotesk-latin-wght-normal\.woff2/,'Space Grotesk preload on '+page);
  assert.doesNotMatch(html,/id="page-transition"/,'Blackout overlay removed from '+page);
}
const privacy=readFileSync('privacy.html','utf8');
assert.match(privacy,/No separate Google Fonts connection is required/,'Third-party font and script disclosed');
assert.match(js,/No separate Google Fonts connection is required/,'Interactive privacy copy remains in sync');
console.log('PASS: v07.2 font, transitions, accessible navigation ripple and architectural motion.');

/* Native transition and nav ripple lifecycle test: exercises runtime, not only source strings. */
const rippleLabels=['Home','Expertise','Our Approach','Insights','About'];
const rippleLinks=rippleLabels.map(label=>({
  textContent:label,innerHTML:'',querySelector(){return null},
  setAttribute(name,value){this[name]=value}
}));
const nativeDoc={
  ...document,
  transitions:0,
  querySelector(selector){
    if(selector==='.desktop-nav')return {querySelectorAll:()=>rippleLinks};
    return document.querySelector(selector);
  },
  startViewTransition(callback){
    this.transitions++;
    callback();
    return {finished:Promise.resolve()};
  }
};
const nativeWindow={...window,matchMedia(){return {matches:false}}};
const nativeLocation={...location,pathname:'/Kova-Planning/index.html'};
const nativeContext=vm.createContext({
  document:nativeDoc,window:nativeWindow,history,location:nativeLocation,
  navigator:{clipboard:{}},URL,URLSearchParams,console,
  requestAnimationFrame(fn){fn()},
  IntersectionObserver:class{observe(){} unobserve(){}}
});
new vm.Script(js,{filename:'assets/site.js'}).runInContext(nativeContext,{timeout:5000});
assert.ok(rippleLinks.every(link=>link.innerHTML.includes('nav-letter')),'Navigation text is wrapped in ripple spans');
assert.ok(rippleLinks.every((link,i)=>link['aria-label']===rippleLabels[i]),'Navigation retains accessible labels');
assert.match(rippleLinks[2].innerHTML,/nav-space/,'Multiword navigation spacing retained');
const activeMain=byId('main');
const navigationAnimations=[];
activeMain.animate=(keyframes,options)=>{
  navigationAnimations.push({keyframes,options});
  return {finished:Promise.resolve(),cancel(){}};
};
const oldMarkup=activeMain.innerHTML;
nativeLocation.pathname='/Kova-Planning/expertise.html';
vm.runInContext('go()',nativeContext,{timeout:5000});
assert.equal(navigationAnimations.length,1,'Old page fades before new content is mounted');
assert.equal(activeMain.innerHTML,oldMarkup,'Old content remains until exit fade is complete');
await Promise.resolve();
assert.match(activeMain.innerHTML,/id="anatomy-of-consent"/,'New page mounts after exit fade');
assert.equal(navigationAnimations.length,2,'New page has a separate entrance animation');
assert.equal(nativeDoc.transitions,0,'Legacy immediate view-transition swap is no longer used');
await Promise.resolve();
console.log('PASS: two-stage page lifecycle and accessible navigation ripple.');

/* v07.3 breathing transitions, panel swaps and scrolling checks */
assert.match(js,/const panelAnimations=new WeakMap\(\)/,'Rapid panel changes are tracked');
assert.match(js,/function swapPanel\(/,'Central two-stage panel animator exists');
assert.match(js,/Promise\.allSettled\(effects\.map\(/,'Incoming animation and height easing settle together after the old panel exits');
assert.match(js,/panelAnimations\.get\(panel\)!==state/,'Superseded panel transitions cannot overwrite newer selections');
assert.match(js,/swapPanel\(vp,guideMarkup\(key\)/,'Guide detail transitions use the shared animation');
assert.match(js,/showGuide\(key,false,true\)/,'Directly linked guides render without delayed swaps');
assert.match(js,/selectTopic\(key,true,true\)/,'Directly linked consent topics render without delayed swaps');
assert.match(js,/lerp: 0\.073, wheelMultiplier: 0\.88/,'Desktop wheel easing has been softened');
assert.match(js,/syncTouch: false/,'iOS native kinetic scrolling remains intact');
assert.match(css,/KOVA v07\.3 \/ BREATH/,'v07.3 motion and font design system exists');
assert.match(css,/@keyframes kova-breathe-in/,'Breathe-in entrance animation exists');
assert.match(css,/@keyframes kova-breathe-out/,'Breathe-out exit animation exists');
assert.match(css,/@media\(hover:none\) and \(pointer:coarse\)/,'Touch hardware avoids expensive scrolling blur');
console.log('PASS: v07.3 refined navigation, animated panel exchanges and scrolling guardrails.');

/* v07.4 / scroll-reset-before-reveal and font specimen safeguards */
assert.match(js,/ROOT\.style\.opacity='0'/,'Old page remains hidden during the scroll reset');
assert.match(js,/outgoing\.finished\.then\(\(\)=>/,'Content swaps only after outgoing opacity reaches zero');
assert.match(js,/arriving\.finished\.then/,'Incoming page has a distinct completion lifecycle');
assert.match(js,/scrollToTarget\(document\.querySelector\('\.knowledge-section'\),instant\)/,'Deep-link focus positions without animated top jumping');
assert.match(css,/KOVA v07\.4 \/ EDITORIAL NAVIGATION/,'Soft tab-selection and page-reset styles included');
assert.match(css,/#main\{view-transition-name:none!important/,'Obsolete snapshot transition disabled');
for(const page of ['index','expertise','approach','insights','about','contact','privacy']){
  const html=readFileSync(page+'.html','utf8');
  assert.match(html,/assets\/site\.css\?v=080/,'New CSS version '+page);
  assert.match(html,/assets\/site\.js\?v=080/,'New JS version '+page);
}
const typeStudy=readFileSync('type-study.html','utf8');
assert.match(typeStudy,/assets\/font-families\.css\?v=076/,'Font specimen uses local shared families');
assert.match(typeStudy,/id="font-audit"/,'Font specimen tests actual downloaded faces');
assert.match(typeStudy,/TRY YOUR OWN HEADLINE/,'Editable typography sample');
assert.match(typeStudy,/PREVIEW ON CHARCOAL/,'Dark and light type comparison');
console.log('PASS: v07.4 staged navigation, scroll reset and typography examples.');

/* v07.5 — local font files, source consistency and genuine font diagnostics */
const fontCSS=readFileSync('assets/font-families.css','utf8');
const fonts=[
  'space-grotesk-latin-wght-normal.woff2',
  'space-grotesk-latin-ext-wght-normal.woff2',
  'instrument-sans-latin-wght-normal.woff2',
  'instrument-sans-latin-ext-wght-normal.woff2',
  'instrument-sans-latin-wght-italic.woff2',
  'instrument-sans-latin-ext-wght-italic.woff2'
];
for(const file of fonts){
  assert.ok(existsSync('assets/fonts/'+file),'Local WOFF2 asset exists: '+file);
  const header=readFileSync('assets/fonts/'+file).toString('ascii',0,4);
  assert.equal(header,'wOF2','Valid WOFF2 signature: '+file);
  assert.ok(fontCSS.includes(file),'Shared @font-face points to '+file);
}
assert.match(fontCSS,/font-family:'Space Grotesk'/,'Display family defined locally');
assert.match(fontCSS,/font-family:'Instrument Sans'/,'Body family defined locally');
assert.match(fontCSS,/unicode-range:/,'Extended Latin glyph coverage is configured');
assert.ok(existsSync('assets/fonts/OFL-InstrumentSans.txt'),'Body font license supplied');
assert.ok(existsSync('assets/fonts/OFL-SpaceGrotesk.txt'),'Display font license supplied');
assert.doesNotMatch(css,/font-family\s*:\s*Arial/i,'No element explicitly uses Arial');
assert.doesNotMatch(css,/--font(?:-display)?\s*:[^;]*Arial/i,'Approved stacks never fall back to hard-coded Arial');
assert.match(js,/function checkKovaFonts\(/,'Every page can inspect actual loaded fonts');
assert.match(js,/fonts\.load\(/,'Font checks use browser FontFaceSet rather than guessing from CSS');
for(const page of ['index','expertise','approach','insights','about','contact','privacy']){
  const html=readFileSync(page+'.html','utf8');
  assert.match(html,/assets\/font-families\.css\?v=076/,'Local face CSS linked on '+page);
  assert.doesNotMatch(html,/fonts\.googleapis\.com|fonts\.gstatic\.com/,'No external font host on '+page);
}
assert.doesNotMatch(typeStudy,/fonts\.googleapis\.com|fonts\.gstatic\.com/,'Type study also loads fonts locally');
assert.match(typeStudy,/auditKovaFonts/,'Typography preview reports font status');
console.log('PASS: 6 local WOFF2 fonts, 2 OFL licenses, 7 pages, no Arial overrides or Google Fonts requests.');

/* v07.6 — matching the KOVA editorial display treatment */
assert.match(css,/KOVA v07\.6 \/ THE SAME VOICE/,'Coordinated card typography ships');
for(const selector of [
  '.insights-preview .insight-teasers a>h3',
  '.explainer-grid .insight-card h3',
  '.service-overview-card h3',
  '.topic-hero h3',
  '.stage-v04 .stage-main h3',
  '.scenario-title h3',
  '.anatomy-detail h3',
  '.full-article header h2'
]){
  assert.ok(css.slice(css.lastIndexOf('KOVA v07.6 / THE SAME VOICE')).includes(selector),'Display font applies to '+selector);
}
assert.match(css,/text-transform:uppercase/,'Feature cards have uppercase editorial styling');
assert.match(typeStudy,/02 \/ EDITORIAL CARD TITLES/,'Font studio demonstrates matching card type');
assert.match(typeStudy,/ZONING IS ONLY/,'The zoning sample is shown with the correct styling');
assert.match(js,/WEBSITE V07\.9/,'Site renderer version is current');
console.log('PASS v07.6 — typography hierarchy, guide titles and responsive readability.');

/* v07.7 — editorial contrast, urban diagrams, readable dark surfaces */
const contrast=css.slice(css.lastIndexOf('KOVA v07.7 / ARCHITECTURAL CONTRAST'));
assert.ok(contrast.length>10000,'v07.7 full design layer exists');
for(const selector of [
  '.expertise-internal,', '.contact-hero{',
  '.approach-intro{','.about-founder{',
  '.information-banner{','.manifesto-section{',
  '.service-overview-grid .service-overview-card:nth-child(2)',
  '.insights-content .explainer-grid .insight-card:nth-child(4n+2)',
  '.insights-content .explainer-grid .insight-card:nth-child(4n+3)',
  '.stages-section .stage-v04 .stage-side',
  '.contact-section{'
]){
  assert.ok(contrast.includes(selector),'Contrast palette covers '+selector);
}
assert.match(contrast,/\.expertise-internal \.internal-headline h1,[\s\S]*?color:#[0-9a-fA-F]{6}!important/,'Dark heroes retain explicitly legible headline colours');
assert.match(contrast,/\.about-founder \.about-body p\{\s*color:#[0-9a-fA-F]{6}/,'Founder section has custom high-contrast body copy');
assert.match(contrast,/\.insights-content \.explainer-grid \.insight-card:nth-child\(4n\+2\) p\{\s*color:#[0-9a-fA-F]{6}/,'Dark guide cards have custom readable body colour');
assert.match(contrast,/study-parcels\.svg|study-contours\.svg|study-streetscape\.svg/,'KOVA urban drawings add quiet visual depth');
assert.match(contrast,/@media\(max-width:650px\)/,'Compact mobile contrast rules included');
assert.match(contrast,/@media\(prefers-reduced-motion:reduce\)/,'Respect reduced-motion accessibility');
for(const page of ['index','expertise','approach','insights','about','contact','privacy']){
  const html=readFileSync(page+'.html','utf8');
  assert.match(html,/assets\/site\.css\?v=080/,'Updated contrast stylesheet on '+page);
  assert.match(html,/assets\/site\.js\?v=080/,'Updated JS cache on '+page);
  assert.match(html,/assets\/font-families\.css\?v=076/,'Approved self-hosted fonts preserved on '+page);
}
console.log('PASS: v07.7 contrast across Home, Expertise, Approach, Insights, About and Contact.');

/* v07.8 / site-wide cool monochrome palette and assets */
const coolCSS=css.slice(css.lastIndexOf('KOVA v07.8 / FULL COOL MONOCHROME'));
assert.ok(coolCSS.length>650,'Full cool palette and dark illustration handling is present');
for(const token of [
  '--kova-cool-paper:#F5F8FA',
  '--kova-cool-mist:#E8EDF1',
  '--kova-cool-concrete:#D0D9E0',
  '--kova-cool-steel:#93A1AC',
  '--kova-cool-graphite:#252C33',
  '--kova-cool-ink:#171D23'
]){
  assert.ok(coolCSS.includes(token),'Site-wide palette includes '+token);
}
assert.match(css,/--kova-contrast-deep:#[0-9a-fA-F]{6}/,'Previous warm contrast anchors are remapped');
assert.doesNotMatch(css,/#252925\b|#222522\b|#e6e6e1\b|#fafbf6\b/i,'Warm v07.7 palette tokens no longer remain');
assert.match(js,/WEBSITE V07\.9/,'Live route renderer is version 07.8');
const coolArtwork=['study-aerial.svg','study-contours.svg','study-parcels.svg','study-streetscape.svg'];
for(const asset of coolArtwork){
  const drawing=readFileSync('assets/'+asset,'utf8');
  assert.match(drawing,/<svg/,'Original drawing remains valid SVG: '+asset);
  assert.doesNotMatch(drawing,/#292929\b|#898989\b|#999999\b/i,'Warm neutral strokes replaced in '+asset);
}
const studioCool=readFileSync('type-study.html','utf8');
assert.match(studioCool,/Typeface Specimens — v07\.8/,'Typography studio uses the cool palette');
assert.match(studioCool,/auditKovaFonts/,'Typography studio font diagnostics remain intact');
for(const page of ['index','expertise','approach','insights','about','contact','privacy']){
  const html=readFileSync(page+'.html','utf8');
  assert.match(html,/assets\/site\.css\?v=080/,'Current cool stylesheet linked on '+page);
  assert.match(html,/assets\/site\.js\?v=080/,'Current runtime linked on '+page);
  assert.match(html,/content="#F5F8FA"/,'Cool device theme on '+page);
}
console.log('PASS: v07.8 cool paper, concrete, steel and graphite across site, drawings, studio and mobile themes.');

/* v07.8 / guard against warm palette regressions at future releases */
function parseRGB(color){
  let raw=color.slice(1);
  if(raw.length===3||raw.length===4)raw=[...raw].map(ch=>ch+ch).join('');
  return [0,2,4].map(i=>parseInt(raw.slice(i,i+2),16));
}
const semanticErrors=new Set(['#6a3030','#7a4646']);
for(const item of css.matchAll(/#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{4}|[0-9a-f]{3})(?![\w-])/gi)){
  const rgb=parseRGB(item[0]);
  if(semanticErrors.has(item[0].toLowerCase()))continue;
  assert.ok(rgb[0]<=rgb[1]+1&&rgb[1]<=rgb[2]+1,
    'Main website has no beige, olive or warm-grey token: '+item[0]);
}
for(const item of css.matchAll(/rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/gi)){
  const r=Number(item[1]),g=Number(item[2]),b=Number(item[3]);
  assert.ok(r<=g+1&&g<=b+1,
    'RGB(A) surfaces follow the cool-grey palette: '+item[0]);
}
assert.match(css,/filter:grayscale\(1\) contrast\(1\.05\)/,
  'Raster architectural backgrounds are neutralised');
console.log('PASS: site-wide hexadecimal, RGB(A), raster and theme colour audit.');


/* v08.0 — mobile gutter retained; overlaid text is forbidden. */
const fluidCSS=css.slice(css.lastIndexOf('KOVA v07.9 / APPLE-LEVEL MOTION REFINEMENT'));
const slowCSS=css.slice(css.lastIndexOf('KOVA v08.0 / SLOW, SINGLE-PANEL TRANSITIONS'));
assert.match(fluidCSS,/\.expertise-index-inner\.shell\{/,'01 shortcut still has proper mobile gutter');
assert.match(fluidCSS,/padding-left:max\(22px,var\(--gutter,22px\)\)!important/,'Mobile shortcut retains its edge padding');
assert.match(slowCSS,/#topic-viewport,#stage-viewport/,'Single-panel styling applies to dynamic content');
assert.doesNotMatch(css,/\.kova-panel-ghost\s*\{/,'Overlay styling is removed');
assert.doesNotMatch(js,/ghost\.innerHTML|appendChild\(ghost\)/,'JS never duplicates outgoing paragraphs');
assert.match(js,/ONE PANEL AT A TIME/,'Single-panel motion replaces concurrent ghost snapshots');
assert.match(js,/const slide=incoming>=previous\?12:-12/,'Subtle route transitions remain');
console.log('PASS: no overlapping content, correct iPhone gutter and single-panel animation styles.');

/* v08.0 — exercise actual fade-out -> replace -> slow fade-in and height tween. */
{
  const begin=js.indexOf('const panelAnimations=new WeakMap();');
  const finish=js.indexOf('const sourceLinks = {',begin);
  assert.ok(begin>=0&&finish>begin,'Panel motion source is extractable');
  const motionSource=js.slice(begin,finish);
  const animations=[];
  let refreshes=0;
  let naturalHeight=320;
  let writes=0;
  const panel={
    style:{opacity:'',height:'',overflow:''},
    querySelector(){return null},
    getBoundingClientRect(){
      const explicit=this.style.height;
      return {height:explicit&&explicit!=='auto'?Number.parseFloat(explicit):naturalHeight};
    },
    animate(frames,options){
      let resolve,reject;
      const finished=new Promise((yes,no)=>{resolve=yes;reject=no});
      const animation={
        frames,options,finished,cancelled:false,
        resolve(){resolve()},
        cancel(){if(!this.cancelled){this.cancelled=true;reject(new Error('cancelled'))}}
      };
      animations.push(animation);
      return animation;
    }
  };
  let html='<article>FIRST</article>';
  Object.defineProperty(panel,'innerHTML',{
    get(){return html},
    set(value){html=value;writes++;naturalHeight=value.includes('LONG')?510:260}
  });
  const swap=new Function('window','reduceMotion','smoothScroll',motionSource+'return swapPanel;')(
    {getComputedStyle(){return {opacity:'.6'}}},false,{resize(){refreshes++}}
  );
  let firstCallbacks=0,lastCallbacks=0;
  swap(panel,'<article>LONG SECOND</article>',()=>firstCallbacks++);
  assert.equal(panel.innerHTML,'<article>FIRST</article>','Old panel remains until exit finishes');
  assert.equal(animations.length,1,'Only outgoing content animates initially');
  assert.equal(animations[0].options.duration,325,'Outgoing content eases out without a ghost');
  assert.equal(writes,0,'No DOM replacement during fade-out');
  animations[0].resolve();
  await Promise.resolve();await Promise.resolve();
  assert.equal(panel.innerHTML,'<article>LONG SECOND</article>','New content appears after old is gone');
  assert.equal(animations.length,3,'Incoming fade and height easing run together, after exit');
  assert.equal(animations[1].options.duration,735,'Long new fade-in is slow and deliberate');
  assert.equal(animations[2].frames[1].height,'510px','Panel grows to measured natural height');
  assert.equal(firstCallbacks,0,'Callback waits for complete arrival');
  // A rapid tap during entrance cancels both current animations before
  // initiating a new, serial transition.
  swap(panel,'<article>THIRD</article>',()=>lastCallbacks++);
  assert.equal(animations[1].cancelled,true,'Rapid tap cancels in-progress fade-in');
  assert.equal(animations[2].cancelled,true,'Rapid tap cancels in-progress height tween');
  assert.equal(panel.innerHTML,'<article>LONG SECOND</article>','New selection still waits for exit');
  animations[3].resolve();
  await Promise.resolve();await Promise.resolve();
  assert.equal(panel.innerHTML,'<article>THIRD</article>','Only latest selection is installed');
  assert.equal(animations.length,6,'New arrival includes a fresh measured height transition');
  assert.equal(animations[5].frames[1].height,'260px','Shorter panels shrink smoothly too');
  animations[4].resolve();animations[5].resolve();
  await Promise.resolve();await Promise.resolve();await Promise.resolve();await Promise.resolve();
  assert.equal(firstCallbacks,0,'Superseded callback is never invoked');
  assert.equal(lastCallbacks,1,'Latest arrival callback fires once');
  assert.equal(panel.style.opacity,'','Visibility style is cleaned up');
  assert.equal(panel.style.height,'','Height is released after the transition');
  assert.equal(refreshes,1,'Scroll geometry refreshes once after the final animation');
  swap(panel,'<article>FOURTH</article>',null,true);
  assert.equal(panel.innerHTML,'<article>FOURTH</article>','Direct links and reduced-motion remain immediate');
  console.log('PASS: slow serial fade, no text overlap, smooth growth/shrink, rapid taps and cleanup.');
}
