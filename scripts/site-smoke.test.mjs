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
 assert.match(html,/assets\/site\.js\?v=077/,'Fresh versioned JavaScript on '+page);
 assert.match(html,/assets\/site\.css\?v=077/,'Fresh versioned styles on '+page);
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
assert.match(js,/outgoing\.finished\.then/,'Outgoing panel is allowed to finish before the next mounts');
assert.match(js,/panelAnimations\.get\(panel\)!==outgoing/,'Superseded panel changes cannot overwrite newer selections');
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
  assert.match(html,/assets\/site\.css\?v=077/,'New CSS version '+page);
  assert.match(html,/assets\/site\.js\?v=077/,'New JS version '+page);
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
assert.match(js,/WEBSITE V07\.7/,'Site renderer version is current');
console.log('PASS v07.6 — typography hierarchy, guide titles and responsive readability.');

/* v07.7 — editorial contrast, urban diagrams, readable dark surfaces */
const contrast=css.slice(css.lastIndexOf('KOVA v07.7 / ARCHITECTURAL CONTRAST'));
assert.ok(contrast.length>10000,'v07.7 full design layer exists');
for(const selector of [
  '.expertise-internal,', '.contact-hero{',
  '.approach-intro{','.about-founder{',
  '.information-banner{','.manifesto-section{',
  '.services-overview-grid .service-overview-card:nth-child(2)',
  '.insights-content .explainer-grid .insight-card:nth-child(4n+2)',
  '.insights-content .explainer-grid .insight-card:nth-child(4n+3)',
  '.stages-section .stage-v04 .stage-side',
  '.contact-section{'
]){
  assert.ok(contrast.includes(selector),'Contrast palette covers '+selector);
}
assert.match(contrast,/color:#f8f8f4!important/,'Dark heroes use high-contrast light headings');
assert.match(contrast,/\.about-founder \.about-body p\{\s*color:#d3d9d0/,'Founder section has readable light body copy');
assert.match(contrast,/\.insights-content \.explainer-grid \.insight-card:nth-child\(4n\+2\) p\{\s*color:#d3d9d0/,'Dark guide cards have light body copy');
assert.match(contrast,/study-parcels\.svg|study-contours\.svg|study-streetscape\.svg/,'KOVA urban drawings add quiet visual depth');
assert.match(contrast,/@media\(max-width:650px\)/,'Compact mobile contrast rules included');
assert.match(contrast,/@media\(prefers-reduced-motion:reduce\)/,'Respect reduced-motion accessibility');
for(const page of ['index','expertise','approach','insights','about','contact','privacy']){
  const html=readFileSync(page+'.html','utf8');
  assert.match(html,/assets\/site\.css\?v=077/,'Updated contrast stylesheet on '+page);
  assert.match(html,/assets\/site\.js\?v=077/,'Updated JS cache on '+page);
  assert.match(html,/assets\/font-families\.css\?v=076/,'Approved self-hosted fonts preserved on '+page);
}
console.log('PASS: v07.7 contrast across Home, Expertise, Approach, Insights, About and Contact.');
