import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
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
 documentElement:{style:{},scrollHeight:1900,scrollTop:0},
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
 assert.match(html,/assets\/site\.js\?v=072/,'Fresh versioned JavaScript on '+page);
 assert.match(html,/assets\/site\.css\?v=072/,'Fresh versioned styles on '+page);
}
console.log('PASS: syntax, seven anatomy controls, ten guide open/return interactions, consent topics, scenarios, approach stages, mobile-safe delegation and versioned assets.');

const css=readFileSync('assets/site.css','utf8');
assert.match(js,/new window\.Lenis/, 'Desktop smooth scrolling with native fallback');
assert.match(js,/document\.startViewTransition/, 'Native page transition crossfades content');
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
assert.match(js,/document\.startViewTransition/,'Native crossfade navigation enabled');
assert.match(js,/typeof ROOT\.animate/,'Graceful legacy-browser animation fallback');
assert.match(js,/function enhanceNavLetters/,'Staggered menu-letter hover effect');
assert.doesNotMatch(js,/const transition = document\.getElementById\('page-transition'\)/,'Obsolete blackout curtain removed from runtime');
assert.match(css,/KOVA v07\.2 \/ SILK/,'v07.2 design language included');
assert.match(css,/--font:'Geist'/,'Geist is the website-wide font');
assert.match(css,/::view-transition-new\(kova-content\)/,'New page fades in through View Transitions');
assert.match(css,/@keyframes kova-letter-ripple/,'Navigation ripple is defined');
assert.match(css,/\.about-drawing\.reveal img/,'Architectural drawing entrance implemented');
for(const page of ['index','expertise','approach','insights','about','contact','privacy']){
  const html=readFileSync(page+'.html','utf8');
  assert.match(html,/fonts\.googleapis\.com\/css2\?family=Geist/,'Geist font linked on '+page);
  assert.doesNotMatch(html,/id="page-transition"/,'Blackout overlay removed from '+page);
}
const privacy=readFileSync('privacy.html','utf8');
assert.match(privacy,/Google Fonts and an optional smooth-scrolling library/,'Third-party font and script disclosed');
assert.match(js,/Google Fonts and an optional smooth-scrolling library/,'Interactive privacy copy remains in sync');
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
nativeLocation.pathname='/Kova-Planning/expertise.html';
vm.runInContext('go()',nativeContext,{timeout:5000});
assert.equal(nativeDoc.transitions,1,'Native transition invoked exactly once');
assert.match(byId('main').innerHTML,/id="anatomy-of-consent"/,'Native transition installs the next page');
console.log('PASS: runtime View Transition lifecycle and accessible nav ripple.');
