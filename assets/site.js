/* KOVA PLANNING CO. / WEBSITE V08.2
 * Brand assets: supplied official KOVA vector artwork, unmodified.
 * No site analytics. Form enquiries are processed by Formspree. Optional Lenis smooth scrolling (MIT) is desktop-only; native fallback remains. Content is maintained for KOVA editorial review.
 */
'use strict';
const ROOT = document.getElementById('main');
const menuBtn = document.getElementById('menu-button');
const mobileMenu = document.getElementById('mobile-drawer');
const lineArrow = '<svg class="kova-line-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path d="M7 25L25 7M10 7h15v15"/></svg>';
const pages = ['home','expertise','approach','work','insights','about','contact','privacy'];
const routeFile = name => name==='home' ? 'index.html' : `${name}.html`;
const routeHref = input => {
  const [route,hash=''] = input.split('#');
  const [name,query=''] = route.split('?');
  const focus = new URLSearchParams(query).get('focus');
  const anchor = hash || (name==='expertise'&&focus ? 'service-'+focus : '');
  return routeFile(name)+(query?'?'+query:'')+(anchor?'#'+anchor:'');
};
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let currentPage = '', busy = false, guideOpen = null, queuedRoute = null;

// Desktop-only scroll easing; touch devices and reduced-motion settings stay native.
const smoothScroll = (() => {
  if (reduceMotion || !window.matchMedia('(min-width: 901px) and (pointer: fine)').matches || typeof window.Lenis !== 'function') return null;
  try {
    return new window.Lenis({
      autoRaf: true, lerp: 0.073, wheelMultiplier: 0.88, smoothWheel: true, syncTouch: false,
      anchors: false, allowNestedScroll: true, stopInertiaOnNavigate: true,
      prevent: node => !!node.closest?.('[data-lenis-prevent], .enquiry-dialog, .mobile-drawer, .kova-select-menu')
    });
  } catch (error) { console.warn('KOVA: native scrolling enabled.', error); return null; }
})();
const scrollToTarget = (node, immediate = false) => {
  if (!node) return;
  if (smoothScroll && !immediate) smoothScroll.scrollTo(node, {immediate, duration: 1.18, offset: -(window.innerWidth < 761 ? 88 : 118), easing:t=>1-Math.pow(1-t,4), force:immediate});
  else node.scrollIntoView({behavior: immediate || reduceMotion ? 'instant' : 'smooth', block:'start'});
};
const scrollToTop = (immediate = false) => {
  if (smoothScroll && !immediate) smoothScroll.scrollTo(0, {immediate, duration:1.08, easing:t=>1-Math.pow(1-t,4), force:true});
  else window.scrollTo({top:0,behavior: immediate || reduceMotion ? 'instant' : 'smooth'});
};


/* KOVA v08.0 / ONE PANEL AT A TIME.
   Never composite two different paragraphs or headings over each other.
   Fade the current panel down, swap its content invisibly, and then ease the
   single new panel in. A measured height tween prevents a sudden layout jump.
   Rapid taps abort the old sequence and always select the latest request. */
const panelAnimations=new WeakMap();
function swapPanel(panel,markup,afterSwap,instant=false){
  if(!panel)return;
  const previous=panelAnimations.get(panel);
  let fromOpacity=1;
  if(previous){
    // Preserve the current visual opacity if a second selection arrives
    // during a transition, rather than flashing the old panel to 100%.
    try{
      const current=parseFloat(window.getComputedStyle?.(panel)?.opacity);
      if(Number.isFinite(current))fromOpacity=Math.max(.04,Math.min(1,current));
    }catch(error){}
    previous.cancel();
    panelAnimations.delete(panel);
  }
  const after=()=>{smoothScroll?.resize();if(afterSwap)afterSwap()};
  const apply=()=>{panel.innerHTML=markup;};
  if(markup===panel.innerHTML){after();return;}
  if(instant||reduceMotion||typeof panel.animate!=='function'){
    apply();after();return;
  }
  const state={
    effects:[],
    cancel(){
      for(const effect of this.effects){
        try{effect.cancel()}catch(error){}
      }
      this.effects.length=0;
      panel.style.opacity='';
      panel.style.height='';
      panel.style.overflow='';
    }
  };
  panelAnimations.set(panel,state);
  try{
    // Exit is deliberately not sliding the whole panel; transforming
    // large columns produces blurred lettering on mobile Safari.
    const leaving=panel.animate([
      {opacity:fromOpacity},
      {opacity:0}
    ],{duration:325,easing:'cubic-bezier(.42,0,.7,.28)',fill:'both'});
    state.effects.push(leaving);
    leaving.finished.then(()=>{
      if(panelAnimations.get(panel)!==state)return;
      panel.style.opacity='0';
      const oldHeight=panel.getBoundingClientRect?.().height||0;
      leaving.cancel();
      state.effects.length=0;
      // Keep the old panel invisible while replacing and measuring content.
      // Briefly use auto height to measure *shorter* new panels accurately too;
      // otherwise scrollHeight is pinned to the old height and snaps at end.
      panel.style.height='auto';
      panel.style.overflow='visible';
      apply();
      const newHeight=oldHeight>0?(panel.getBoundingClientRect?.().height||oldHeight):0;
      if(oldHeight>0){
        panel.style.height=oldHeight+'px';
        panel.style.overflow='hidden';
      }
      const effects=[];
      const arriving=panel.animate([
        {opacity:0},
        {opacity:1}
      ],{duration:735,easing:'cubic-bezier(.22,1,.36,1)',fill:'both'});
      effects.push(arriving);
      state.effects.push(arriving);
      if(oldHeight>0&&newHeight>0&&Math.abs(newHeight-oldHeight)>3){
        const heightTween=panel.animate([
          {height:oldHeight+'px'},
          {height:newHeight+'px'}
        ],{duration:735,easing:'cubic-bezier(.22,1,.36,1)',fill:'both'});
        effects.push(heightTween);
        state.effects.push(heightTween);
      }
      // The heading can settle gently, but old and new text never overlap.
      const title=panel.querySelector?.('.topic-hero h3,.stage-main h3,.scenario-title h3,.anatomy-detail h3,.explainer-detail h2');
      if(title&&typeof title.animate==='function'){
        const titleTween=title.animate([
          {opacity:.72,transform:'translate3d(0,6px,0)'},
          {opacity:1,transform:'translate3d(0,0,0)'}
        ],{duration:770,easing:'cubic-bezier(.22,1,.36,1)',fill:'both'});
        effects.push(titleTween);
        state.effects.push(titleTween);
      }
      // The arriving animation owns visibility until the final cleanup.
      panel.style.opacity='';
      Promise.allSettled(effects.map(effect=>effect.finished)).then(()=>{
        if(panelAnimations.get(panel)!==state)return;
        state.cancel();
        panelAnimations.delete(panel);
        after();
      });
    },()=>{});
    leaving.finished.catch(()=>{});
  }catch(error){
    if(panelAnimations.get(panel)===state)panelAnimations.delete(panel);
    state.cancel();
    apply();after();
  }
}

const sourceLinks = {
 transition: 'https://www.planning.govt.nz/implementation-and-guidance/transitional-consenting/how-consenting-works-during-the-transition/',
 changes: 'https://www.planning.govt.nz/implementation-and-guidance/transitional-consenting/changes-to-the-rma/',
 resources: 'https://environment.govt.nz/guides/making-an-application-for-resource-consent/',
 building: 'https://www.building.govt.nz/projects-and-consents/apply-for-building-consent',
 exemptions: 'https://www.building.govt.nz/projects-and-consents/planning-a-successful-build/scope-and-design/check-if-you-need-consents',
 aucklandChecklist: 'https://www.aucklandcouncil.govt.nz/building-and-consents/resource-consents/Documents/checklist-resource-consent-application-under-district-unitary-plan.pdf',
 aeeTemplate: 'https://www.aucklandcouncil.govt.nz/building-and-consents/resource-consents/prepare-resource-consent-application/Documents/assessment-environmental-effects-template.pdf',
 buildingStages: 'https://www.building.govt.nz/getting-started/stages-of-the-building-process',
 unitary: 'https://unitaryplanmaps.aucklandcouncil.govt.nz/upviewer/',
 aucklandPlan: 'https://unitaryplanmaps.aucklandcouncil.govt.nz/upviewer/',
 auckland: 'https://ourauckland.aucklandcouncil.govt.nz/news/2026/10/rm-reform/'
};
const A = (path, title, css='') => `<a class="${css}" href="${routeHref(path)}" data-route="${path.split(/[?#]/)[0]}">${title}<span aria-hidden="true"><svg class="kova-line-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path d="M7 25L25 7M10 7h15v15"/></svg></span></a>`;
const eyebrow = (num,title,extra='') => `<div class="eyebrow-row"><span>${num} / ${title}</span><span>${extra}</span></div>`;
const sectionHead = (number, name, extra='') => `<div class="section-label"><span>${number} / ${name}</span><span>${extra}</span></div>`;
const band = (label, title, body, target='contact', linkText='Discuss a project') => `<section class="contact-band"><div class="shell contact-band-inner"><div>${eyebrow('KOVA',label)}<h2>${title}</h2><p>${body}</p></div>${A(target,linkText,'btn btn-light')}</div></section>`;
const logoWave = `<img src="assets/kova-wave.svg" alt="" loading="lazy">`;

// Restrained architectural line studies. Only strokes: no filled geometry or image plates.
// Primary strokes 1.6px, guide marks 0.8px; actual widths are defined consistently in site.css.
function drawingSvg(){return `<svg class="urban-svg kova-ink-drawing" viewBox="0 0 760 740" role="img" aria-label="Minimal line study of urban land parcels and a road" preserveAspectRatio="xMidYMid meet">
  <g class="ink-secondary"><path d="M93 168H658M93 562H658"/><path d="M113 157v22m526-22v22M113 551v22m526-22v22"/></g>
  <g class="ink-primary"><path d="M166 214H554V516H166Z"/><path d="M166 319H554M325 214V516M437 319V516"/><path d="M166 390H325"/><path d="M113 182V565M604 182V565"/><path d="M113 182Q116 151 148 151H572Q605 151 604 182"/></g>
  <g class="ink-secondary"><path d="M183 233H308V301H183ZM343 233H534V301H343Z"/><path d="M347 341H419V496H347ZM454 340H534V496H454Z"/><path d="M234 406V497M184 406H306"/><path d="M88 344H143M578 439H630"/></g>
 </svg>`;}
function sketchSvg(kind='growth'){
 const drawings={
 growth:`<g class="ink-primary"><path d="M64 316Q158 284 222 220T408 158T592 104"/><path d="M88 382Q206 326 282 290T490 215"/><path d="M144 140H303V239H144Z"/><path d="M322 250H476V354H322Z"/></g><g class="ink-secondary"><path d="M117 111H329V267H117Z"/><path d="M298 228H509V374H298Z"/><path d="M111 393Q259 357 397 296T616 195"/></g>`,
 process:`<g class="ink-primary"><path d="M80 300H210V180H345V300H486V175H600"/><path d="M79 344H600"/><path d="M135 251L185 202M272 244L316 202M406 246L461 196"/></g><g class="ink-secondary"><path d="M80 319H600M210 168V145M345 309V330M486 162V143"/><path d="M97 158L183 158M365 165H459M518 156H596"/></g>`,
 parcels:`<g class="ink-primary"><path d="M86 132H565V361H86Z"/><path d="M86 242H565M269 132V361M415 242V361"/><path d="M86 361Q110 404 149 414H555"/></g><g class="ink-secondary"><path d="M110 155H249V219H110Z"/><path d="M288 158H542V219H288Z"/><path d="M289 260H395V340H289Z"/><path d="M432 260H542V340H432Z"/><path d="M55 100H590M55 390H589"/></g>`,
 approach:`<g class="ink-primary"><path d="M58 346H601"/><path d="M103 346V228H236V346M260 346V178H402V346M422 346V234H555V346"/><path d="M102 227Q190 174 256 184T425 235"/></g><g class="ink-secondary"><path d="M83 366H620M130 252H210M284 208H375M445 259H532"/><path d="M236 369V389M403 369V389"/></g>`
 };
 return `<svg class="kova-sketch kova-sketch-${kind}" viewBox="0 0 680 470" role="img" aria-label="Minimal architectural line study" preserveAspectRatio="xMidYMid meet">${drawings[kind]||drawings.growth}</svg>`;
}

function home(){return `
<section class="hero hero-home">
  <div class="hero-split shell-fluid">
    <div class="hero-left"><div class="hero-kicker"><span class="line-short"></span> AUCKLAND / INDEPENDENT PLANNING CONSULTANCY</div>
      <h1>SHAPING<br>WHAT COMES<br><em>NEXT.</em></h1>
      <div class="hero-bottom"><p>Auckland planning advice for site feasibility, resource consent and building consent coordination. Know what your site can support and what to check before you commit.</p>${A('contact','Discuss a project','btn btn-dark')}</div>
      <div class="hero-foot"><span>URBAN PLANNING / RESOURCE MANAGEMENT</span><span>01 — 07</span></div>
    </div>
    <div class="urban-panel"><div class="urban-title"><span>FIG. 01 / LAND & POSSIBILITY</span><span>LINE STUDY</span></div><img class="urban-site-study" src="assets/study-aerial.svg" alt="A conceptual aerial street and housing study drawn entirely in fine architectural lines"><div class="urban-bottom"><span>PLACE / POTENTIAL / CONTEXT</span><span>01</span></div></div>
  </div>
</section>
<section class="manifesto-section overlap-up">
  <div class="shell manifesto-top">${sectionHead('01','OUR PERSPECTIVE','THE THINKING BEHIND KOVA')}
    <div class="manifesto-grid"><h2>GOOD PLANNING<br>IS MORE THAN<br><span>PERMISSION.</span></h2><div><p class="lead">The decisions that shape a place begin long before construction.</p><p>We check the planning rules, site constraints and approvals that can change your project before you commit to a design.</p>${A('approach','How we think','text-link')}</div></div>
  </div>
  <div class="manifesto-bottom shell"><span>DEFINED BY CLARITY.</span><span>SHAPED BY CONTEXT.</span><span>GUIDED BY PURPOSE.</span></div>
</section>
<section class="page-section white-panel">
  <div class="shell">${sectionHead('02','EXPERTISE','A CONSIDERED SET OF SERVICES')}
    <div class="section-intro"><h2>FROM FIRST IDEA<br>TO <span>INFORMED ACTION.</span></h2><p>Checking an address or ready to move a proposal forward? Start with the decision in front of you.</p></div>
    <div class="home-start-links" aria-label="Choose a starting point"><a href="expertise.html?focus=feasibility#service-feasibility" data-route="expertise">I’m checking a site <span aria-hidden="true">↗</span></a><a href="expertise.html#planning-services" data-route="expertise">I’m planning a project <span aria-hidden="true">↗</span></a></div><div class="expertise-list">
      ${[['01','Resource consents','Identify which rules trigger consent, prepare the planning assessment and coordinate lodgement where agreed.','expertise?focus=resource'],['02','Building consent coordination','Coordinate the drawings, technical reports and planning conditions needed for the building consent process.','expertise?focus=building'],['03','Environmental assessments','Prepare an Assessment of Environmental Effects (AEE) that explains the proposal, its effects and how they are addressed.','expertise?focus=aee'],['04','Site feasibility','Get a desktop assessment of zoning, site risks, consent pathways and what to check next.','expertise?focus=feasibility']].map(e=>`<a href="${routeHref(e[3])}" data-route="expertise" class="expertise-row"><span>${e[0]}</span><div><h3>${e[1]}</h3><p>${e[2]}</p></div><b><svg class="kova-line-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path d="M7 25L25 7M10 7h15v15"/></svg></b></a>`).join('')}
    </div>
  </div>
</section>
<section class="founder-teaser"><div class="shell founder-teaser-inner"><div class="founder-teaser-left"><span>03 / THE THINKING BEHIND KOVA</span><h2>CITIES ARE<br><em>NEVER FINISHED.</em></h2></div><div class="founder-teaser-right"><span>FOUNDER-LED / BUILT ON CURIOSITY</span><p>Places evolve through the choices made for them. KOVA began with a curiosity about those choices and the opportunities they create for people and communities.</p>${A('about','Discover why KOVA began','text-link')}</div></div></section>
`;}

const topicContent = {
 resource: {
 num:'01', title:'Resource consent', eyebrow:'LAND USE & DEVELOPMENT APPROVAL', sub:'The planning permission question.',
 lead:'Resource consent is generally required where a proposed activity needs approval under the relevant planning framework. The first task is to work out what is permitted, what needs consent, and which effects and policies are relevant.',
 when:['Land use or development that triggers relevant district plan rules','Subdivision of land','Earthworks, vegetation clearance or other activities requiring approval','Activities affecting natural resources where regional rules apply'],
 prepared:['A clearly described proposal and relevant site and design plans','Assessment of the applicable rules, policies and planning matters','An Assessment of Environmental Effects (AEE) proportionate to the proposal','Relevant technical assessments and supporting information where required'],
 note:'During the transition to the Planning Act 2026 and Natural Environment Act 2026, councils continue to receive and decide resource consent applications under the amended Resource Management Act 1991.',
 help:'Planning rule reviews, application strategy, planning assessment, AEE preparation and coordination of relevant specialist inputs.',
 src:sourceLinks.transition
 },
 building: {
 num:'02', title:'Building consent', eyebrow:'BUILDING ACT & BUILDING CODE', sub:'The building performance question.',
 lead:'Building consent is a separate approval for building work. It considers whether the proposed work, as shown in the submitted plans and specifications, meets the requirements of the New Zealand Building Code.',
 when:['New buildings, substantial alterations and many additions','Building work affecting structural, weather-tightness or fire-safety requirements','Work requiring plans, technical specifications or professional design input','Other work that is not covered by an applicable exemption'],
 prepared:['Architectural or building design drawings and specifications','Structural, fire, geotechnical or other technical documentation when relevant','Required producer statements or design certificates where appropriate','Application material prepared by the relevant building design professionals'],
 note:'Some low-risk building work is exempt from building consent, but the Building Code still applies. Building consent decisions are made by authorised building consent authorities, not by planning consultants.',
 help:'Early identification of building-approval interfaces, coordination with designers and engineers, and alignment between planning and building documentation. Specialist design and certification remain with the appropriate practitioners.',
 src:sourceLinks.building
 },
 aee: {
 num:'03', title:'Environmental effects', eyebrow:'ASSESSMENT OF ENVIRONMENTAL EFFECTS', sub:'The evidence behind the proposal.',
 lead:'An AEE explains the environmental effects of a proposed activity, including relevant positive and adverse effects, and the measures proposed to avoid, remedy or mitigate adverse effects. It forms part of a resource consent application.',
 when:['A resource consent application is being prepared','Council needs to understand the scale and significance of effects','Effects such as earthworks, amenity, transport, flooding or ecology may be relevant','The applicable planning framework identifies specific assessment matters'],
 prepared:['A clear description of the proposal and its receiving environment','Identification and assessment of relevant effects','Mitigation measures and conditions, where appropriate','Specialist inputs where particular effects need technical evidence'],
 note:'The level of detail depends on the type of activity and the scale and significance of its effects. An AEE should be proportionate, rather than unnecessarily long.',
 help:'A structured planning narrative linking the proposal, relevant assessment matters, evidence and recommended mitigation.',
 src:sourceLinks.resources
 },
 feasibility: {
 num:'04', title:'Site feasibility', eyebrow:'DUE DILIGENCE & DEVELOPMENT POTENTIAL', sub:'Understanding before committing.',
 lead:'A feasibility assessment is an early planning review of what a site may support, what could constrain development, and which questions need deeper investigation before investment or design decisions are made.',
 when:['Before purchasing or committing to a property','Before briefing a designer or architect','When considering subdivision, extensions or development options','When site constraints or overlays may affect a proposal'],
 prepared:['Current zoning, overlays and relevant planning provisions','High-level review of site dimensions, access, services and records','Potential consenting triggers and information gaps','A summary of options, constraints and recommended next steps'],
 note:'A preliminary feasibility view is not a guarantee that a development will be approved. Property-specific legal, engineering, title and infrastructure issues may require specialist checks.',
 help:'Early-stage planning review, zoning and overlay investigation, and identifying what to test before a design progresses.',
 src:sourceLinks.auckland
 }
};
function topicPanel(key){const t=topicContent[key];return `<div class="topic-panel" id="topic-${key}">
  <div class="topic-hero"><div><small>${t.num} / ${t.eyebrow}</small><h3>${t.title}<span>.</span></h3><p class="topic-sub">${t.sub}</p></div><div class="topic-lead">${t.lead}</div></div>
  <div class="topic-columns"><div><h4>When might this matter?</h4><ul>${t.when.map(v=>`<li>${v}</li>`).join('')}</ul></div><div><h4>What information is involved?</h4><ul>${t.prepared.map(v=>`<li>${v}</li>`).join('')}</ul></div></div>
  <div class="topic-bottom"><div><span>IMPORTANT DISTINCTION</span><p>${t.note}</p></div><div><span>HOW KOVA CAN SUPPORT</span><p>${t.help}</p></div></div>

</div>`;}
/* Interactive consent learning modules */
const consentScenarios = {
 newhome: {n:'01',label:'New dwelling',tag:'LAND USE + BUILDING WORK',headline:'A house raises two different approval questions.',intro:'An additional dwelling or a new house can involve both planning controls and Building Code requirements. Neither approval can be inferred from the address alone.',resource:['Check zone and relevant activity rules, including current transitional provisions.','Test building envelope, site access, infrastructure and mapped constraints.','Identify potential consent triggers and any environmental effects needing assessment.'],building:['Check whether the proposed construction requires building consent.','KOVA can bring in the designers needed for detailed plans, specifications and compliance evidence.','Confirm coordination between planning and building design before construction.'],note:'Some residential assessment matters changed from 30 October 2026; current council guidance and application timing matter.'},
 subdivision: {n:'02',label:'Subdivision',tag:'PARCEL + SERVICING',headline:'Creating a new lot starts with more than a boundary line.',intro:'Subdivision usually raises a resource consent pathway and often depends on infrastructure, surveyed boundaries and conditions. Building approvals may also arise for proposed physical works.',resource:['Check applicable subdivision rules, minimum standards and policy framework.','Review access, services, natural hazards, easements and title interests.','Consider council conditions, infrastructure approvals and survey requirements.'],building:['Consider whether associated structures or other building work require a building consent.','Coordinate relevant design and engineering documentation if physical works are proposed.','Avoid assuming a subdivision approval authorises building work.'],note:'A licensed cadastral surveyor and civil engineering input may be essential. Title changes follow separate survey and land registration steps.'},
 alteration: {n:'03',label:'Extension or renovation',tag:'EXISTING BUILDING + NEW WORK',headline:'Small changes can have different statutory effects.',intro:'An addition or alteration can comply with planning rules but still need building consent. Conversely, particular land use or site effects may need planning approval.',resource:['Check whether the change breaches current land use standards or triggers an overlay.','Review height, boundary relationships, earthworks, access or vegetation where relevant.','Identify whether an existing consent, consent notice or title condition affects the site.'],building:['Check for applicable exemptions; not all renovation work needs consent.','Assess structural, fire, moisture and other Building Code issues with the right practitioner.','For restricted building work, use suitably licensed practitioners.'],note:'Even work exempt from a building consent must comply with applicable legal requirements, including the Building Code.'},
 design: {n:'04',label:'Design & drafting',tag:'COORDINATED DESIGN + APPROVALS',headline:'Good design begins with a clear brief and the right team.',intro:'Need architectural drawings? We agree the brief, bring in the right independent designer and coordinate survey or engineering inputs as needed.',resourceLabel:'PLANNING STRATEGY & CONSENT PATHWAY',buildingLabel:'DESIGN, DRAFTING & SPECIALISTS',resource:['Review the site, proposal, zoning, constraints and likely consent pathway before design progresses too far.','Help align concept plans with planning standards, environmental considerations and any resource consent requirements.','Clarify which assessments, drawings and reports may be needed for a coordinated application.'],building:['Agree the design scope and identify an appropriate independent architect, architectural designer or draftsperson.','Coordinate surveying, civil, structural, geotechnical and other specialist inputs as the project requires.','Have the relevant practitioners prepare drawings and technical building-consent documentation, where applicable.'],note:'We help align the design brief, planning requirements and specialist contributions from the outset. Practitioners deliver their respective professional work within an agreed scope.'}
};
function scenarioPanel(key){const s=consentScenarios[key];return `<div class="scenario-panel"><div class="scenario-title"><span>${s.n} / ${s.tag}</span><h3>${s.headline}</h3><p>${s.intro}</p></div><div class="scenario-cards"><div><div class="scenario-card-label"><span>01 /</span> ${s.resourceLabel||'RESOURCE CONSENT — QUESTIONS TO CHECK'}</div><ul>${s.resource.map(x=>`<li>${x}</li>`).join('')}</ul></div><div><div class="scenario-card-label"><span>02 /</span> ${s.buildingLabel||'BUILDING CONSENT — QUESTIONS TO CHECK'}</div><ul>${s.building.map(x=>`<li>${x}</li>`).join('')}</ul></div></div><p class="scenario-caution">${s.note}</p></div>`;}
function selectScenario(key){if(!consentScenarios[key])return;const vp=document.getElementById('scenario-viewport');if(!vp)return;swapPanel(vp,scenarioPanel(key));document.querySelectorAll('[data-scenario]').forEach(b=>{const on=b.dataset.scenario===key;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on))})}

const anatomyNodes = [
 {n:'01',short:'The site',title:'Establish the physical and legal context.',lead:'Planning begins with the property—not the proposed drawing.',why:'The assessment should describe the location, site, surrounding environment and the legal interests that matter to the proposal.',items:['Site address, legal description, title and relevant interests','Existing activity, built form, neighbouring context and access','Known constraints or matters needing further investigation'],caution:'A desktop map does not confirm precise boundaries, ownership interests or site conditions.'},
 {n:'02',short:'The proposal',title:'Define exactly what is being sought.',lead:'A clear activity description keeps the assessment grounded.',why:'The drawings and narrative must describe the same proposal, including uses, scale, layout and any associated works.',items:['Proposed use, footprint, intensity and staging','Plans, elevations, earthworks, servicing and access','Associated activities and other approvals potentially required'],caution:'Material design changes may require the planning assessment and technical evidence to be updated.'},
 {n:'03',short:'The rules',title:'Identify the applicable planning framework.',lead:'The operative controls and application date both matter.',why:'Zoning, overlays, regional and district provisions, national direction and current transitional amendments can change the questions to be assessed.',items:['Relevant zoning, overlays and precinct provisions','Activity status, standards and potential infringements','Objectives, policies and statutory assessment matters'],caution:'Mapped layers alone do not resolve every applicable rule, legal interpretation or transition provision.'},
 {n:'04',short:'The effects',title:'Explain what might change in the environment.',lead:'An AEE connects the design to its actual and potential effects.',why:'The assessment considers effects relevant to the consent sought, and measures that could avoid, remedy or mitigate adverse effects.',items:['Built-form, land use and neighbouring-environment effects where relevant','Natural hazards, traffic, ecology, earthworks or infrastructure effects','Mitigation, management methods and potential conditions'],caution:'The scope of effects depends on current statutory requirements, including any matters excluded from consideration.'},
 {n:'05',short:'The evidence',title:'Support claims with the right expertise.',lead:'Credibility comes from transparent assumptions and defensible inputs.',why:'Where an issue requires specialist investigation, appropriately qualified technical professionals should provide the evidence.',items:['Engineering, drainage, flood or geotechnical information if relevant','Traffic, ecology, arboriculture, heritage or acoustic reports if needed','Clear reference to data sources, modelling assumptions and limitations'],caution:'A planning summary cannot replace an engineering report, survey, legal advice or technical certification.'},
 {n:'06',short:'The application',title:'Assemble a coherent resource consent package.',lead:'Good documentation reduces preventable confusion.',why:'A complete submission should connect applicant details, plans, activity description, assessment, technical reports and required authorisations.',items:['Relevant council application form and declarations','Plans, AEE, rule/policy analysis and specialist documentation','Title documents, authorisations and other required information'],caution:'Council can request additional information and may reject an incomplete application under applicable requirements.'},
 {n:'07',short:'The decision',title:'Understand the council assessment pathway.',lead:'The application is assessed—not simply filed.',why:'Council considers the relevant statutory tests and may request more information, consider notification, determine the application and impose conditions.',items:['Requests for further information and applicant responses','Notification and affected-person questions where relevant','Decision, conditions, monitoring and other approvals'],caution:'An application is not a guarantee of approval. Building consent and other approvals remain separate.'}
];
function anatomySvg(){return `<svg class="anatomy-svg kova-ink-drawing" viewBox="0 0 640 650" role="img" aria-label="Minimal site and consent assessment line study">
<g class="ink-primary"><path d="M80 170H545V490H80Z"/><path d="M80 332H545"/><path d="M275 170V490M405 332V490"/><path d="M80 170Q110 130 146 130H532"/><path d="M80 512H545"/></g>
<g class="ink-secondary"><path d="M104 194H253V311H104Z"/><path d="M296 194H522V311H296Z"/><path d="M104 351H252V469H104Z"/><path d="M296 351H388V469H296Z"/><path d="M425 351H524V469H425Z"/><path d="M60 147H565M60 538H565"/></g>
</svg>${anatomyNodes.map((n,i)=>{let pos=[[18,25],[43,20],[72,25],[54,45],[25,65],[67,72],[35,85]][i];return `<button type="button" class="anatomy-hotspot ${i===0?'active':''}" style="left:${pos[0]}%;top:${pos[1]}%" data-anatomy="${i}" aria-label="${n.n} ${n.short}" aria-pressed="${i===0}">${n.n}</button>`}).join('')}`;}

function anatomyPanel(i){const n=anatomyNodes[i];return `<div class="anatomy-detail-inner"><span>${n.n} / ASSESSMENT COMPONENT</span><h3>${n.title}</h3><p class="anatomy-lead">${n.lead}</p><p>${n.why}</p><div class="anatomy-list-label">TYPICAL QUESTIONS & INFORMATION</div><ul>${n.items.map(x=>`<li>${x}</li>`).join('')}</ul><div class="anatomy-caution"><span>THE IMPORTANT DISTINCTION</span><p>${n.caution}</p></div></div>`;}
function selectAnatomy(i){if(!anatomyNodes[i])return;document.querySelectorAll('[data-anatomy]').forEach(b=>{let on=+b.dataset.anatomy===i;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on))});swapPanel(document.getElementById('anatomy-detail'),anatomyPanel(i))}

function expertise(){return `<section class="internal-hero expertise-internal"><div class="shell">${eyebrow('02','EXPERTISE','PLANNING & DEVELOPMENT')}<div class="internal-headline"><h1>UNDERSTAND<br>THE RULES.<br><em>SEE THE POTENTIAL.</em></h1><p>We assess Auckland sites, prepare resource consent applications and AEEs, and coordinate the specialist inputs needed for building consent.</p></div><div class="internal-hero-footer"><span>RESOURCE CONSENTS / BUILDING CONSENTS / AEE / FEASIBILITY</span><span>SCROLL TO EXPLORE ↓</span></div></div></section>
<section class="services-overview" id="planning-services"><div class="shell">${sectionHead('01','WHAT WE CAN HELP WITH','PRACTICAL PLANNING SUPPORT')}<div class="services-overview-head"><h2>CLARITY BEFORE<br><em>COMMITMENT.</em></h2><p>See what each service covers, what you need to provide and where independent specialist input may be needed.</p></div><div class="service-overview-grid">
 <a href="expertise.html?focus=resource#service-resource" data-route="expertise" class="service-overview-card"><span>01 / LAND USE & SUBDIVISION</span><h3>Resource consent advice.</h3><p>Identify the consent pathway, prepare the planning documents and coordinate lodgement where agreed.</p><b aria-hidden="true">${lineArrow}</b></a>
 <a href="expertise.html?focus=aee#service-aee" data-route="expertise" class="service-overview-card"><span>02 / ASSESSMENT & EVIDENCE</span><h3>AEEs & planning reports.</h3><p>Get a written assessment of the proposal, relevant effects and the evidence supporting any mitigation.</p><b aria-hidden="true">${lineArrow}</b></a>
 <a href="expertise.html?focus=building#service-building" data-route="expertise" class="service-overview-card"><span>03 / RELATED APPROVALS</span><h3>Building consent coordination.</h3><p>Set the documentation scope and coordinate inputs from the designers and technical specialists.</p><b aria-hidden="true">${lineArrow}</b></a>
 <a href="expertise.html?focus=feasibility#service-feasibility" data-route="expertise" class="service-overview-card"><span>04 / EARLY DEVELOPMENT THINKING</span><h3>Site feasibility & planning advice.</h3><p>Get a Desktop Planning Assessment before buying, selling or committing to design.</p><b aria-hidden="true">${lineArrow}</b></a>
 </div><aside class="coordination-callout" aria-label="Specialist coordination"><div><h3>One point of contact for planning and specialist coordination.</h3><p>KOVA leads the planning work and brings in independent designers, surveyors and engineers when needed. We coordinate their inputs into one application package, so you know who is doing what and what comes next.</p></div><a href="#project-coordination" class="text-link">How coordination works <span aria-hidden="true">↓</span></a></aside></div></section>
<section class="page-section service-scopes" id="service-scope"><div class="shell"><div class="section-label"><span>SERVICE SCOPE</span><span>DELIVERABLES / INPUTS / COORDINATION</span></div><div class="section-intro"><h2>WHAT YOU<br><span>RECEIVE.</span></h2><p>Start with the service that matches the decision you need to make.</p></div><div class="scope-grid"><article id="service-feasibility" class="scope-card"><span class="scope-number">01 / BEFORE YOU COMMIT</span><h3 tabindex="-1">Site feasibility</h3><dl><dt>What you receive</dt><dd><strong>Desktop Planning Assessment.</strong> A written review of applicable zoning and planning provisions, mapped hazards and overlays, likely approval pathways, practical constraints and the checks to prioritise next. Where relevant, we distinguish current rules from proposed changes.</dd><dt>What we need from you</dt><dd>The site address, the decision you need to make, and any plans, title records or reports you already have.</dd><dt>What we can coordinate</dt><dd>If your decision depends on servicing capacity, title restrictions or what can fit on the site, we can bring in the right advisers to test those questions before you commit.</dd><dd class="scope-more"><a href="work.html" data-route="work">See the Popes Road case study <span aria-hidden="true">↗</span></a></dd><dd class="scope-more"><a href="guides/site-constraints.html">Read the site constraints guide <span aria-hidden="true">↗</span></a></dd></dl></article><article id="service-resource" class="scope-card"><span class="scope-number">02 / LAND USE &amp; SUBDIVISION</span><h3 tabindex="-1">Resource consent</h3><dl><dt>What you receive</dt><dd><strong>Application and planning assessment.</strong> A review of relevant rules and consent triggers, a planning assessment and AEE as applicable, and an application package. Where agreed, KOVA coordinates lodgement and responses to council requests.</dd><dt>What we need from you</dt><dd>The site address, a description of the proposal, and any concept plans, prior consents or council correspondence.</dd><dt>What we can coordinate</dt><dd>We can bring in designers and technical specialists, then coordinate their drawings and reports with the planning assessment. Where agreed, we manage lodgement and responses to Council.</dd><dd class="scope-more"><a href="#anatomy-of-consent">See what goes into an application <span aria-hidden="true">↗</span></a></dd></dl></article><article id="service-aee" class="scope-card"><span class="scope-number">03 / PLANNING EVIDENCE</span><h3 tabindex="-1">Assessment of Environmental Effects</h3><dl><dt>What you receive</dt><dd><strong>Written assessment for lodgement.</strong> A clear account of the proposal, its relevant effects and any proposed mitigation. We identify where more evidence is needed and incorporate specialist findings into the planning assessment.</dd><dt>What we need from you</dt><dd>Current drawings, site information, the proposed works and any existing technical reports.</dd><dt>What we can coordinate</dt><dd>We can coordinate traffic, ecology, stormwater or other specialist assessments as needed, then integrate their findings into the AEE we prepare.</dd></dl></article><article id="service-building" class="scope-card"><span class="scope-number">04 / RELATED APPROVALS</span><h3 tabindex="-1">Building consent coordination</h3><dl><dt>What you receive</dt><dd><strong>Documentation and specialist coordination.</strong> An agreed list of drawings and reports, coordination with relevant specialists, and checks that the building consent package aligns with the planning approvals and consent conditions where relevant.</dd><dt>What we need from you</dt><dd>The site address, proposed building work, current drawings, and any existing resource consent or other approval documents.</dd><dt>What we can coordinate</dt><dd>We can bring in the designers, engineers and other specialists needed to put the building consent package together. They prepare the drawings, reports and certification, and KOVA coordinates those inputs with the planning approvals and conditions.</dd><dd class="scope-more"><a href="guides/resource-vs-building-consent.html">Compare resource and building consent <span aria-hidden="true">↗</span></a></dd></dl></article></div></div></section>
<section class="team-coordination" id="project-coordination"><div class="shell team-coordination-inner"><div><span>PLANNING-LED / COLLABORATIVE DELIVERY</span><h2 tabindex="-1">PROJECT<br><em>COORDINATION.</em></h2><img class="kova-drawing-img" src="assets/study-parcels.svg" loading="lazy" alt="Conceptual land-parcel study in fine linework"></div><div><p>KOVA leads the planning work and can coordinate the full application package. We define what the project needs, bring in the right people and check that their work supports the same proposal.</p><p>You have one point of contact for planning and coordination. Independent specialists prepare their own drawings, reports and certification. Council decides the application.</p>${A('approach','See how the process works','text-link')}</div></div></section>
<section class="tools-intro"><div class="shell"><span>EXPLORE / THE PLANNING LANDSCAPE</span><h2>THE DETAIL<br><em>BEHIND THE DECISION.</em></h2><p>Move from broad planning questions to the details that can shape an application.</p></div></section>

<section class="knowledge-section" id="consent-explorer"><div class="shell">${sectionHead('03','CONSENT EXPLORER','INTERACTIVE / SELECT A TOPIC')}<div class="section-intro knowledge-intro"><h2>LEARN THE<br><span>LANDSCAPE.</span></h2><p>Understand how different approvals work and what they may mean for a proposal.</p></div>
  <div class="topic-nav" role="tablist" aria-label="Explore planning topics">${Object.entries(topicContent).map(([id,t])=>`<button type="button" role="tab" class="topic-tab ${id==='resource'?'active':''}" data-topic="${id}" aria-selected="${id==='resource'?'true':'false'}" aria-controls="topic-viewport"><small>${t.num}</small><span>${t.title}</span><b><svg class="kova-line-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path d="M7 25L25 7M10 7h15v15"/></svg></b></button>`).join('')}</div>
  <div id="topic-viewport" role="tabpanel" tabindex="0" aria-live="polite">${topicPanel('resource')}</div>
</div></section>
<section class="scenario-section"><div class="shell">${sectionHead('04','SCENARIO EXPLORER','THINK IN QUESTIONS, NOT ASSUMPTIONS')}<div class="scenario-header"><h2>WHAT ARE YOU<br><span>CONSIDERING?</span></h2><p>Start with your idea. Explore the questions that could shape its design, timing and approval pathway.</p></div><div class="scenario-selector" role="group" aria-label="Explore project types">${Object.entries(consentScenarios).map(([key,x])=>`<button type="button" data-scenario="${key}" class="scenario-option ${key==='newhome'?'active':''}" aria-pressed="${key==='newhome'}"><span>${x.n}</span><strong>${x.label}</strong><b><svg class="kova-line-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path d="M7 25L25 7M10 7h15v15"/></svg></b></button>`).join('')}</div><div id="scenario-viewport" class="scenario-viewport" aria-live="polite">${scenarioPanel('newhome')}</div></div></section>

<section class="anatomy-section" id="anatomy-of-consent"><div class="shell">${sectionHead('05','ANATOMY OF A CONSENT','AN INTERACTIVE TECHNICAL STUDY')}<div class="anatomy-intro"><h2 tabindex="-1">WHAT GOES INTO<br><em>A RESOURCE CONSENT APPLICATION?</em></h2><p>Explore the seven parts of the application itself, from the site and proposal to the supporting evidence and conditions.</p></div><div class="anatomy-board"><div class="anatomy-drawing"><div class="anatomy-drawing-meta"><span>FIG. 02 / ANATOMY OF A CONSENT</span><span>LAND / RULES / EVIDENCE</span></div>${anatomySvg()}<div class="anatomy-drawing-bottom"><span>PLANNING ASSESSMENT / 01—07</span><span>SELECT 01—07 TO EXPLORE</span></div></div><div class="anatomy-reading"><div class="anatomy-parts" role="group" aria-label="Consent assessment topics">${anatomyNodes.map((x,i)=>`<button class="anatomy-part ${i===0?'active':''}" data-anatomy="${i}" aria-pressed="${i===0}"><span>${x.n}</span><strong>${x.short}</strong><b><svg class="kova-line-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path d="M7 25L25 7M10 7h15v15"/></svg></b></button>`).join('')}</div><div class="anatomy-detail" id="anatomy-detail" aria-live="polite">${anatomyPanel(0)}</div></div></div><div class="anatomy-bottom-note"><p>Every proposal calls for its own assessment of rules, site conditions and effects. Read more in <a class="context-guide-link" href="insights.html" data-route="insights">Planning Explained</a>.</p></div></div></section>
`;}

const approachStages = [
 {n:'01',name:'Discover',title:'Understand the brief.',lead:'A defined problem is easier to solve.',detail:'Clarify what you want to do, what decisions are being made and which site information is available. The first conversation should expose uncertainties before they become project costs.',items:['Proposed use, scale and desired outcomes','Property address, ownership and existing information','Timing, budget assumptions and decision points'],client:'Your goal, site address, any sketches, title or existing consent documents.',scope:'Agree the planning scope, the specialist inputs needed and when we can bring them in.',deliverable:'Project brief and an initial information-request list.',specialists:'We identify which specialists the project needs and when to bring them in.'},
 {n:'02',name:'Verify',title:'Establish the site context.',lead:'Check the framework before testing options.',detail:'Review the planning instruments relevant to the site and proposal. Mapping is a starting point, not proof that a hazard, rule or restriction does or does not apply.',items:['Current planning zones, overlays and designations','Title interests, existing consents and site records','Mapped hazards, access, infrastructure and gaps'],client:'Available title, survey and property reports; authorisation to request records where needed.',scope:'Identify relevant planning provisions, potential information gaps and consultation points.',deliverable:'A site context and constraints summary, with assumptions and sources recorded.',specialists:'We can coordinate survey, servicing and hazard checks when site records or maps leave questions open.'},
 {n:'03',name:'Test',title:'Explore feasible pathways.',lead:'An informed option beats an expensive assumption.',detail:'Consider whether the intended activity may be permitted, require a resource consent, or need a different design pathway. A feasibility view identifies questions to resolve; it is not an approval forecast.',items:['Activity status and consent triggers','Development standards and possible infringements','Potential environmental effects and design responses'],client:'Concept dimensions, use details and practical project priorities.',scope:'Compare planning pathways and flag effects or constraints needing more analysis.',deliverable:'Options and risk register with next investigations.',specialists:'We bring in design, surveying or engineering advice as needed to test the options before you commit.'},
 {n:'04',name:'Develop',title:'Build the assessment.',lead:'The story should follow the evidence.',detail:'Translate the preferred design into a clear planning case. Where resource consent is required, prepare proportionate environmental-effects assessment and consider objectives, policies and assessment criteria applicable at lodgement.',items:['Description of activity and existing environment','Rules and policy assessment','Effects, mitigation and possible conditions'],client:'Updated drawings, project specifications and other confirmed proposal information.',scope:'Prepare planning components and identify evidence needed to support statements.',deliverable:'Draft planning assessment and AEE framework, tailored to the proposal.',specialists:'We prepare the planning assessment and coordinate the drawings and technical reports that support it.'},
 {n:'05',name:'Coordinate',title:'Align every supporting input.',lead:'One coherent submission is better than disconnected reports.',detail:'Check consistency between site plans, written descriptions, planning assessments and specialist reports. We bring in the appropriate specialists where their input is needed. Each remains responsible for their own design, technical or legal advice.',items:['Consistency of drawings, scales and description','Specialist findings and proposed mitigation','Outstanding matters and documentation checks'],client:'Current design set, specialist reports and decisions on design changes.',scope:'Coordinate information and check planning narrative against supporting documents.',deliverable:'Consolidated application pack and outstanding-items register.',specialists:'We work with the specialists to check that drawings, reports and the planning assessment describe the same proposal.'},
 {n:'06',name:'Lodge',title:'Submit with clarity.',lead:'Completeness supports a smoother assessment.',detail:'Where instructed, compile and lodge relevant resource consent documentation through the appropriate council process. Council checks completeness and may request more information or further documentation.',items:['Correct forms, plans and applicant details','AEE and required supporting assessments','Council completeness queries and fees'],client:'Applicant authorisations, final plans, required signatures and council fees.',scope:'Coordinate lodgement information and maintain a clear application record.',deliverable:'Lodged resource consent application and document register, where included in the agreed scope.',specialists:'Where lodgement is in scope, we submit the coordinated package and follow up with the specialists if anything is missing.'},
 {n:'07',name:'Respond',title:'Navigate what follows.',lead:'A decision is a milestone, not a guarantee.',detail:'During council assessment, questions, further-information requests, notification issues or conditions may arise. The response should be evidence-led and proportionate. Council remains responsible for consent decisions.',items:['Requests for further information and clarifications','Conditions, design responses and decisions','Any next approvals or implementation matters'],client:'Timely project decisions and agreement on any additional specialist work.',scope:'Prepare planning responses, coordinate updated information and explain council outcomes.',deliverable:'Response record and a practical next-steps summary.',specialists:'When Council raises a technical question, we bring the relevant specialist back in and coordinate one response.'}
];
function stagePanel(i){let s=approachStages[i];return `<div class="stage-content stage-v04" data-stage-panel="${i}"><div class="stage-main"><span class="stage-num">${s.n} / 07 — THE PLANNING JOURNEY</span><h3>${s.title}</h3><p class="stage-lead">${s.lead}</p><p>${s.detail}</p><div class="stage-examines"><span>KEY CONSIDERATIONS</span><ul>${s.items.map(t=>`<li>${t}</li>`).join('')}</ul></div></div><div class="stage-side stage-deliverables"><div class="stage-diagram-head"><span>FIELD NOTES / ${s.n}</span><span>KOVA</span></div><div class="technical-illustration"><span class="technical-cross cross-a">+</span><span class="technical-cross cross-b">+</span><div class="technical-ring"><span>${s.n}</span></div><div class="technical-line line-a"></div><div class="technical-line line-b"></div><span class="technical-caption">KOVA / PROCESS STUDY</span></div><div class="stage-meta-block"><span>WHAT THE CLIENT PROVIDES</span><p>${s.client}</p></div><div class="stage-meta-block"><span>PLANNING SUPPORT</span><p>${s.scope}</p></div><div class="stage-meta-block"><span>TYPICAL OUTPUT</span><p>${s.deliverable}</p></div><div class="stage-meta-block"><span>SPECIALIST INPUTS WE COORDINATE</span><p>${s.specialists}</p></div></div></div><div class="stage-controls"><button type="button" data-stage-prev="${Math.max(0,i-1)}" ${i===0?'disabled':''}>← PREVIOUS STAGE</button><div class="stage-progress" aria-label="Stage ${i+1} of 7"><span style="width:${(i+1)/approachStages.length*100}%"></span></div><button type="button" data-stage-next="${Math.min(i+1,approachStages.length-1)}" ${i===approachStages.length-1?'disabled':''}>NEXT STAGE →</button></div>`;}

function approach(){return `<section class="internal-hero approach-hero"><div class="shell">${eyebrow('03','OUR APPROACH','THOUGHTFUL BY DESIGN')}<div class="internal-headline"><h1>GOOD DECISIONS<br>BEGIN WITH<br><em>CLEAR THINKING.</em></h1><p>Good projects move forward when complex questions become clear decisions, made in the right order.</p></div><div class="internal-hero-footer"><span>STRUCTURE / CLARITY / CONTEXT</span><span>07 STAGES ↓</span></div></div></section>
<section class="approach-intro page-section"><div class="shell">${sectionHead('01','OUR METHOD','FROM UNCERTAINTY TO DIRECTION')}<div class="large-quote"><span>“</span><p>Understand the place.<br>Interrogate the possibilities.<br><em>Make the next move count.</em></p></div><div class="approach-intro-note"><p>Planning brings evidence, regulation and ambition into the same conversation. Each stage should make the next decision clearer.</p><img class="kova-drawing-img" src="assets/study-contours.svg" loading="lazy" alt="Conceptual site contours in fine linework"></div></div></section>
<section class="stages-section"><div class="shell">${sectionHead('02','SEVEN STAGES','INTERACTIVE / SELECT A STAGE')}<div class="stages-heading"><h2>A PROCESS WITH<br><span>PURPOSE.</span></h2><p>From the first conversation to council assessment, each stage has a purpose. Explore how the process unfolds and what it asks of the project.</p></div><div class="stage-tabs" role="tablist" aria-label="Planning process stages">${approachStages.map((x,i)=>`<button role="tab" type="button" data-stage="${i}" aria-selected="${i===0?'true':'false'}" class="stage-tab ${i===0?'active':''}"><small>${x.n}</small><span>${x.name}</span></button>`).join('')}</div><div id="stage-viewport" role="tabpanel" aria-live="polite">${stagePanel(0)}</div></div></section>

<section class="process-trust"><div class="shell process-trust-inner"><div><span>WHAT TO EXPECT</span><h2>NO FALSE<br>PROMISES.<br><em>CLEARER DECISIONS.</em></h2></div><div><p>Clarity is built deliberately: by knowing what is established, what remains uncertain and who is best placed to resolve it.</p><p>We lead the planning work and bring in designers, surveyors and engineers when needed. We coordinate their work with the planning assessment so the application is ready to progress as one package.</p>${A('expertise?view=coordination#project-coordination','Explore project coordination','text-link')}</div></div></section>
`;}

const guides = {
 zoning:{n:'01',kind:'SITE RULES',title:'Zoning is only the beginning.',sub:'Why a zoning label is the first question, not the final answer.',intro:'Zoning provides a useful starting point, but it does not tell the full development story. The detail lies in what the proposal triggers and which other controls apply.',blocks:[
  ['01 / START WITH THE ZONE','The zone identifies intended land uses and development outcomes. Its rules may address matters such as building height, setbacks, site coverage and density. But a permitted outcome depends on the whole proposal meeting the relevant provisions.'],
  ['02 / CHECK OVERLAYS AND OTHER CONTROLS','Overlays, precinct provisions, qualifying matters and regional controls may introduce further restrictions or assessment requirements. A site can look straightforward on a zoning map while being affected by other rules.'],
  ['03 / CONSIDER THE REAL SITE','Access, topography, stormwater, existing structures and legal interests can influence what can practically be achieved, even when the zone looks favourable.'],
  ['04 / MAKE AN INFORMED FIRST MOVE','Before investing in detailed designs, review the current planning provisions alongside key physical and title information. Record uncertainties rather than assuming the maximum theoretical yield is achievable.']
 ],sources:[[sourceLinks.resources,'Ministry for the Environment — Resource consent applications'],[sourceLinks.unitary,'Auckland Council — Unitary Plan map viewer']],next:['expertise?focus=feasibility','See how KOVA approaches site feasibility']},
 constraints:{n:'02',kind:'SITE FEASIBILITY',title:'Why some sites are harder to develop.',sub:'The difference between having an idea and knowing whether it can work.',intro:'Two properties with similar zoning can have very different development prospects. Planning decisions become more useful when they reflect the real conditions of the site.',blocks:[
  ['01 / LAND AND ACCESS','Slope, lot shape, vehicle access, servicing corridors and existing buildings can affect the scale and layout of a proposal. The site is a physical place, not just an address.'],
  ['02 / HAZARDS AND INFRASTRUCTURE','Flood hazards, overland flow paths, drainage, wastewater capacity and ground conditions may call for technical input. The availability of services should be checked rather than assumed.'],
  ['03 / LEGAL AND PLANNING LIMITS','Easements, covenants, consent notices and existing approvals may influence options alongside zoning and other planning rules. Some matters require legal or engineering advice.'],
  ['04 / PRIORITISE THE UNKNOWN','A useful early review does not promise an approval. It identifies the issues most likely to affect cost, design or timing, and recommends the next investigation before commitments increase.']
 ],sources:[[sourceLinks.resources,'Ministry for the Environment — Applying for consent'],[sourceLinks.unitary,'Auckland Council — Unitary Plan map viewer']],next:['expertise?focus=feasibility','Explore site feasibility support']},
 consents:{n:'03',kind:'APPROVALS',title:'Resource consent vs building consent.',sub:'Two approvals that answer different questions.',intro:'These terms are often used together, but they assess different things. Recognising the difference early helps keep planning and design work on the right path.',blocks:[
  ['01 / RESOURCE CONSENT','A resource consent concerns land use, subdivision or an activity that needs approval under applicable resource-management controls. It can involve rules, policies, environmental effects and supporting specialist evidence.'],
  ['02 / BUILDING CONSENT','A building consent relates to the construction work and whether submitted plans and specifications meet Building Code requirements. Some work may be exempt from a building consent, but Building Code obligations can still apply.'],
  ['03 / BOTH, ONE OR NEITHER','A proposal may need both approvals, just one, or neither. Permitted development under planning controls is not automatically exempt from building consent, and a resource consent does not replace technical building approval.'],
  ['04 / THE PRACTICAL QUESTION','Identify the proposed activity, its location, the applicable rules and the building work involved before settling your documentation pathway. Planning and building professionals have distinct roles.']
 ],sources:[[sourceLinks.resources,'Ministry for the Environment — Resource consent guide'],[sourceLinks.building,'MBIE — Building consent guidance']],next:['expertise?focus=building','See what building consent coordination covers']},
 aee:{n:'04',kind:'ENVIRONMENTAL EFFECTS',title:'What does an AEE actually explain?',sub:'A clear account of a proposal and the effects it may create.',intro:'An Assessment of Environmental Effects (AEE) is not simply a formality. It helps explain a proposed activity, what it might change, and how relevant adverse effects will be addressed.',blocks:[
  ['01 / THE PROPOSAL AND ITS CONTEXT','An AEE starts with a clear description of what is proposed and the environment where it would occur. The questions depend on the activity, site conditions and applicable planning framework.'],
  ['02 / THE EFFECTS','Relevant effects might involve neighbouring amenity, traffic, earthworks, stormwater, landscape, ecological or other matters. The effects considered must be appropriate to the proposal and current statutory requirements.'],
  ['03 / THE RESPONSE','An assessment identifies appropriate measures to avoid, remedy or mitigate adverse effects and refers to relevant plans and policies. KOVA can coordinate technical evidence from engineers or other specialists where it is needed.'],
  ['04 / THE RIGHT LEVEL OF DETAIL','The extent of assessment should reflect the proposal and applicable requirements. A short, straightforward proposal does not call for the same evidence as a complex development.']
 ],sources:[[sourceLinks.resources,'Ministry for the Environment — Application and AEE guidance'],[sourceLinks.aucklandChecklist,'Auckland Council — Application checklist']],next:['expertise?focus=aee','See what KOVA includes in an AEE']},
 needconsent:{n:'05',kind:'PLANNING PERMISSION',title:'Do I actually need resource consent?',sub:'How to distinguish a permitted activity from one requiring approval.',intro:'Not every change to a property needs resource consent. The question is whether the entire proposal meets the relevant rules and any applicable national direction, not whether similar work has happened next door.',blocks:[
  ['01 / DEFINE THE ACTIVITY','Describe exactly what you want to do: a new building, a changed use, extra earthworks, a second dwelling or something else. Different parts of one proposal can trigger different planning rules.'],
  ['02 / TEST THE FULL RULE SET','Check the applicable zone, activity classification and development standards, together with overlays, precincts, regional rules and relevant national environmental standards. A permitted activity must meet all applicable conditions for that pathway.'],
  ['03 / CONSIDER THE OTHER APPROVALS','Even if resource consent is not required, the project may need building consent, specialist design, landowner approvals or checks for existing title restrictions. A planning exemption is not a blanket development approval.'],
  ['04 / CONFIRM THE DECISION','Record which rules were checked and where uncertainty remains. For some permitted activities a council certificate of compliance can provide formal confirmation; investigate this before relying on informal assumptions.']
 ],sources:[['https://www.building.govt.nz/projects-and-consents/planning-a-successful-build/scope-and-design/check-if-you-need-consents/resource-consent','MBIE — Do you need resource consent?'],['https://www.planning.govt.nz/implementation-and-guidance/transitional-consenting/how-consenting-works-during-the-transition/','Planning.govt.nz — Transitional consenting']],next:['expertise?focus=resource','Explore resource consent advice']},
 subdivision:{n:'06',kind:'LAND & TITLES',title:'Can I subdivide my property?',sub:'Why creating another lot involves more than drawing a boundary.',intro:'Subdivision begins with an idea about land, but achieving separate titles can involve planning, surveying, infrastructure and legal work. A promising layout is only the start of that pathway.',blocks:[
  ['01 / IS THE SITE SUITABLE?','Check applicable subdivision controls, minimum dimensions where relevant, access, building placement, hazard exposure and the practical service connections for each proposed lot. Zoning alone does not establish subdivisibility.'],
  ['02 / WHO NEEDS TO BE INVOLVED?','A licensed cadastral surveyor will be needed for the survey and title process. Depending on the site, engineering, transport, drainage, legal and planning specialists may be needed to resolve the proposal and its consent conditions.'],
  ['03 / FROM CONSENT TO NEW TITLES','Subdivision normally involves a consent pathway, an approved survey plan under section 223 RMA and certification of conditions under section 224(c), followed by registration with Land Information New Zealand. The details depend on the proposal and current legislation.'],
  ['04 / THE FIRST USEFUL DECISION','A concept layout and feasibility review can establish whether the likely number of lots, access requirements and infrastructure costs justify more detailed survey and design work.']
 ],sources:[['https://www.linz.govt.nz/guidance/land-registration/land-registration-guide/subdivisions/subdivision-registration-requirements','LINZ — Subdivision registration requirements'],['https://www.codc.govt.nz/services/planning/subdivision-consent','Council example — Subdivision consent stages']],next:['expertise?focus=feasibility','Explore early subdivision feasibility']},
 granny:{n:'07',kind:'SMALL DWELLINGS',title:'Can I add a second dwelling?',sub:'Understanding the rules for minor dwellings and granny flats.',intro:'A second dwelling can create options for family or investment, but the applicable rules depend on the design, site and intended use. New small-dwelling exemptions have specific conditions; they are not automatic permission to build anywhere.',blocks:[
  ['01 / CHECK WHAT IS PROPOSED','A small detached standalone dwelling is not necessarily treated the same way as a house extension, a converted garage or an additional full-sized home. Start with the floor area, height, site position, services and how the dwelling will be used.'],
  ['02 / SEPARATE THE TWO EXEMPTION TESTS','A qualifying new standalone, single storey dwelling of up to 70 m² may meet the building consent exemption. The national environmental standard provides a separate permitted activity pathway for qualifying detached minor residential units. Passing one set of checks does not mean the other is met.'],
  ['03 / DESIGN, SERVICES AND NOTICES STILL MATTER','Even exempt building work must comply with the Building Code and relevant conditions. The granny-flat pathway involves licensed professionals, a project information memorandum before work and completion documentation; infrastructure and development contributions may also arise.'],
  ['04 / CHECK THE SITE BEFORE CHOOSING A PATH','Access, hazards, stormwater, wastewater, service capacity, title constraints and other planning provisions can change what is feasible. Confirm the specific pathway before commissioning final drawings or construction.']
 ],sources:[['https://www.building.govt.nz/projects-and-consents/planning-a-successful-build/scope-and-design/building-a-granny-flat-resources/homeowners','MBIE — Granny flat guidance updated October 2026'],['https://www.planning.govt.nz/implementation-and-guidance/transitional-consenting/national-direction-changes-that-affect-consenting/','Planning.govt.nz — Detached minor residential unit standards']],next:['expertise?focus=feasibility','Explore the site feasibility questions']},
 documents:{n:'08',kind:'PREPARING AN APPLICATION',title:'What plans and reports will I need?',sub:'The drawings, evidence and specialists behind a sound application.',intro:'A well-prepared consent application explains the proposal clearly enough for the right questions to be assessed. What is required depends on the site, the activity and the effects that need to be considered.',blocks:[
  ['01 / START WITH ACCURATE SITE INFORMATION','Establish property boundaries, existing buildings, access, title interests, relevant planning provisions and any known hazards. A property file, record of title and appropriate site measurements can avoid design assumptions becoming application problems.'],
  ['02 / SHOW WHAT WILL CHANGE','Site and floor plans, elevations, earthworks details, servicing layouts or subdivision drawings may be needed. Appropriate design or drafting professionals prepare the drawings; the required level of detail is driven by the proposal and the consent pathway.'],
  ['03 / EXPLAIN THE PLANNING CASE','Applications under the RMA commonly include an Assessment of Environmental Effects and a planning assessment against relevant provisions. The scope should address matters the law permits the decision-maker to consider and be proportionate to the proposal.'],
  ['04 / BRING IN SPECIALISTS WHERE THEY ADD VALUE','An engineer, surveyor, transport adviser, arborist, ecologist or other expert may need to provide evidence. KOVA can identify the reports needed and coordinate the specialists who prepare them so the documents support one application.']
 ],sources:[['https://environment.govt.nz/publications/applying-for-a-resource-consent/consent-process/','Ministry for the Environment — Preparing an application'],['https://environment.govt.nz/guides/making-an-application-for-resource-consent/','Ministry for the Environment — Application guidance']],next:['expertise?focus=resource','See what a resource consent application includes']},
 neighbours:{n:'09',kind:'PEOPLE & EFFECTS',title:'Will my neighbours need to approve?',sub:'Affected persons, written approvals and notification explained.',intro:'Neighbours are an important part of a place, but not every consent application requires their signature. Whether written approval or notification is relevant depends on the proposal, the current legal tests and how the council assesses effects.',blocks:[
  ['01 / APPROVAL IS NOT AUTOMATIC','A neighbour being nearby does not itself mean written approval is legally necessary. The council determines who may be affected and whether notification is required under the applicable statutory framework.'],
  ['02 / THE THREE NOTIFICATION PATHS','An application may be non-notified, limited notified to affected parties, or publicly notified. The tests depend on planning rules, national direction, adverse effects that may lawfully be considered and relevant notification provisions.'],
  ['03 / WHAT WRITTEN APPROVAL MEANS','When a person gives valid written approval, the council generally disregards effects on that person for relevant consent decisions. Those being asked to approve should understand the proposal and its effects; approval should not be treated as a casual signature.'],
  ['04 / ENGAGE THOUGHTFULLY, NOT AUTOMATICALLY','Good neighbour communication can resolve misunderstandings before they become project disputes. That is different from assuming every proposal requires consultation or that obtaining approval guarantees a consent outcome.']
 ],sources:[['https://environment.govt.nz/guides/getting-involved-in-the-resource-consent-process/','Ministry for the Environment — Affected parties and notification'],['https://www.planning.govt.nz/implementation-and-guidance/transitional-consenting/changes-to-the-rma/','Planning.govt.nz — Transitional RMA changes']],next:['expertise?focus=resource','Explore the planning assessment pathway']},
 timecost:{n:'10',kind:'PROJECT REALITIES',title:'How long will consent take, and what will it cost?',sub:'What affects council processing, fees and project programmes.',intro:'Time and cost depend on far more than the application form. A clear early brief can help identify the investigations, design work and council steps likely to shape the programme.',blocks:[
  ['01 / SEPARATE PREPARATION FROM PROCESSING','Before lodgement there may be planning reviews, drawings, specialist reports and consultations. Council statutory processing periods are not the whole project programme and should not be presented as a guaranteed completion date.'],
  ['02 / KNOW WHAT CAN PAUSE THE CLOCK','Under the current transitional RMA pathway, a standard non-notified consent commonly has a statutory 20-working-day processing timeframe, but information requests, extensions and notification can alter the elapsed time. More complex or notified proposals can take considerably longer.'],
  ['03 / BUDGET FOR DIFFERENT COST TYPES','A project can involve consultant fees, council deposits and processing charges, technical reports, application revisions and potential development contributions or engineering works. Check the current council fee schedule and ask which charges are fixed, are deposits, or depend on the actual processing work.'],
  ['04 / REDUCE AVOIDABLE UNCERTAINTY','Check the site early, settle the project scope, identify necessary specialists and lodge an adequately supported application. Even careful preparation cannot guarantee council timing or approval, but it can make the next decisions less speculative.']
 ],sources:[['https://environment.govt.nz/publications/applying-for-a-resource-consent/timeframes/','Ministry for the Environment — Statutory processing timeframes'],['https://www.aucklandcouncil.govt.nz/en/building-and-consents/resource-consents/resource-consent-fees-deposits.html','Auckland Council — Resource consent fees and deposits']],next:['expertise?focus=resource','See what KOVA can scope for a resource consent']}

};
const guideSlugs = {"zoning": "zoning", "constraints": "site-constraints", "consents": "resource-vs-building-consent", "aee": "assessment-of-environmental-effects", "needconsent": "do-i-need-resource-consent", "subdivision": "subdivision", "granny": "second-dwellings", "documents": "consent-plans-and-reports", "neighbours": "neighbour-approval", "timecost": "consent-time-and-cost"};
function insightListing(){return `<div class="explainers-intro"><span>FIELD NOTES / 01—10</span><p>Start with the question in front of you. Each guide offers a clear foundation and a considered next step.</p></div><div class="insights-grid explainer-grid">${Object.entries(guides).map(([key,g])=>`<a class="insight-card" href="guides/${guideSlugs[key]}.html" aria-label="Read ${g.title}"><small>${g.n} / ${g.kind}</small><h3>${g.title}</h3><p>${g.sub}</p><span>READ EXPLAINER ${lineArrow}</span></a>`).join('')}</div>`;}
const guideSources = {
  "zoning": [
    [
      "https://unitaryplanmaps.aucklandcouncil.govt.nz/upviewer/",
      "Auckland Council · Unitary Plan maps"
    ],
    [
      "https://environment.govt.nz/publications/understanding-the-rma-and-how-to-get-involved/when-you-need-a-resource-consent/",
      "Ministry for the Environment · When you need resource consent"
    ]
  ],
  "constraints": [
    [
      "https://unitaryplanmaps.aucklandcouncil.govt.nz/upviewer/",
      "Auckland Council · Unitary Plan maps"
    ],
    [
      "https://www.linz.govt.nz/products-services/land-records/types-land-records/property-title",
      "LINZ · Property titles"
    ]
  ],
  "consents": [
    [
      "https://environment.govt.nz/publications/applying-for-a-resource-consent/",
      "Ministry for the Environment · Applying for resource consent"
    ],
    [
      "https://www.building.govt.nz/projects-and-consents/apply-for-building-consent",
      "MBIE · Applying for building consent"
    ]
  ],
  "aee": [
    [
      "https://environment.govt.nz/guides/making-an-application-for-resource-consent/",
      "Ministry for the Environment · Resource consent applications and AEEs"
    ]
  ],
  "needconsent": [
    [
      "https://environment.govt.nz/publications/understanding-the-rma-and-how-to-get-involved/when-you-need-a-resource-consent/",
      "Ministry for the Environment · When you need resource consent"
    ],
    [
      "https://www.planning.govt.nz/implementation-and-guidance/transitional-consenting/how-consenting-works-during-the-transition/",
      "Planning.govt.nz · Consenting during the transition"
    ]
  ],
  "subdivision": [
    [
      "https://www.linz.govt.nz/guidance/land-registration/land-registration-guide/subdivisions/subdivision-registration-requirements",
      "LINZ · Subdivision registration requirements"
    ],
    [
      "https://unitaryplanmaps.aucklandcouncil.govt.nz/upviewer/",
      "Auckland Council · Unitary Plan maps"
    ]
  ],
  "granny": [
    [
      "https://www.building.govt.nz/projects-and-consents/planning-a-successful-build/scope-and-design/check-if-you-need-consents/building-work-that-doesnt-need-a-building-consent/granny-flats-exemption-guidance-and-resources",
      "MBIE · Granny flats building consent exemption"
    ],
    [
      "https://environment.govt.nz/acts-and-regulations/legislation/nes-dmru/",
      "Ministry for the Environment · Detached minor residential unit standards"
    ]
  ],
  "documents": [
    [
      "https://environment.govt.nz/guides/making-an-application-for-resource-consent/",
      "Ministry for the Environment · Application guidance"
    ],
    [
      "https://environment.govt.nz/publications/applying-for-a-resource-consent/consent-process/",
      "Ministry for the Environment · The consent process"
    ]
  ],
  "neighbours": [
    [
      "https://environment.govt.nz/publications/information-for-affected-persons/what-does-giving-written-approval-involve/",
      "Ministry for the Environment · Written approval"
    ],
    [
      "https://www.planning.govt.nz/implementation-and-guidance/transitional-consenting/how-consenting-works-during-the-transition/",
      "Planning.govt.nz · Consenting during the transition"
    ]
  ],
  "timecost": [
    [
      "https://environment.govt.nz/publications/applying-for-a-resource-consent/timeframes/",
      "Ministry for the Environment · Processing timeframes"
    ],
    [
      "https://www.planning.govt.nz/implementation-and-guidance/transitional-consenting/how-consenting-works-during-the-transition/",
      "Planning.govt.nz · Consenting during the transition"
    ]
  ]
};
const guideReviewed = '2026-11-16';
function officialGuideLinks(key){return `<section class="explainer-sources"><h3>Official sources</h3><ul>${guideSources[key].map(([href,label])=>`<li><a href="${href}">${label}</a></li>`).join('')}</ul></section>`;}
function guideMarkup(key){const g=guides[key];return `<article class="full-article explainer-detail"><button type="button" class="article-back" data-back-guides>← BACK TO ALL EXPLAINERS</button><header><span>PLANNING EXPLAINED / ${g.kind}</span><h2>${g.title}</h2><p>${g.sub}</p><p class="guide-reviewed">Reviewed <time datetime="${guideReviewed}">16 November 2026</time></p></header><div class="article-body"><div><span>THE QUESTION</span><p>${g.intro}</p></div><div>${g.blocks.map(b=>`<section><h3>${b[0]}</h3><p>${b[1]}</p></section>`).join('')}${officialGuideLinks(key)}<section class="explainer-next" aria-label="Related planning service">${A(g.next[0],g.next[1],'text-link')}</section></div></div></article>`;}
function insights(){return `<section class="internal-hero insights-hero"><div class="shell">${eyebrow('04','PLANNING EXPLAINED','PRACTICAL AUCKLAND GUIDES')}<div class="internal-headline"><h1>PLANNING,<br><em>EXPLAINED.</em></h1><p>Practical explanations for the questions that shape land, development and what comes next.</p></div><div class="internal-hero-footer"><span>FIELD NOTES / CLEARER DECISIONS</span><span>EXPLORE THE GUIDES ↓</span></div></div></section>
<section class="page-section insights-content"><div class="shell">${sectionHead('01','THE EXPLAINERS','SHORT / USEFUL / GROUNDED')}<div class="section-intro"><h2>START WITH<br><span>THE QUESTION.</span></h2><p>Better decisions start with better questions. Explore the essentials, then follow the details where they matter.</p></div><div id="insights-viewport">${insightListing()}</div></div></section>
<section class="information-banner"><div class="shell info-banner-inner"><div><span>IMPORTANT CONTEXT</span><h2>EVERY SITE<br><em>IS DIFFERENT.</em></h2></div><p>Planning begins with context. What applies to a particular property depends on current rules, site conditions and any necessary specialist assessments.</p></div></section>
`;}

function about(){return `
<section class="internal-hero about-hero"><div class="shell">${eyebrow('05','ABOUT','THE THINKING BEHIND KOVA')}<div class="internal-headline"><h1>CITIES ARE<br>NEVER <em>FINISHED.</em></h1><p>An enduring curiosity about how places grow — and the decisions that shape what they become.</p></div><div class="internal-hero-footer"><span>FOUNDER-LED / AUCKLAND, AOTEAROA</span><span>EXPLORE OUR STORY ↓</span></div></div></section>
<section class="about-intro-panel"><div class="shell about-intro-grid">
 <div class="about-column-id"><span>THE KOVA PERSPECTIVE</span><div class="about-symbol" aria-label="KOVA abstract planning emblem">${logoWave}</div><small>PLACE / PEOPLE / POSSIBILITY</small></div>
 <div class="about-intro-copy"><span class="about-chapter-index">01 / THE PERSPECTIVE</span><h2>THE FUTURE OF A PLACE BEGINS LONG BEFORE CONSTRUCTION.</h2><p class="about-lead">Cities are living, evolving environments. They grow through the ambitions of individuals, the changing needs of communities and the development of industries.</p><p>Every building, street and neighbourhood begins with an idea, an opportunity and a series of decisions about what a place could become. The thinking that turns possibility into reality is what makes planning meaningful.</p></div>
</div></section>
<section class="about-chapter about-founder"><div class="shell about-chapter-grid">
 <div class="about-aside"><span>02 / THE FOUNDER</span><div class="about-founder-name">SHEHAAB KHAN<small>FOUNDER / KOVA PLANNING CO.</small></div><div class="about-credential">BACHELOR OF URBAN PLANNING <span>(HONOURS)</span><small>UNIVERSITY OF AUCKLAND</small></div></div>
 <div class="about-body"><h2>CURIOUS ABOUT<br><em>WHAT COULD BE.</em></h2><p>It was this relationship between possibility and reality that drew me to urban planning.</p><p>I completed a <strong>Bachelor of Urban Planning (Honours) at the University of Auckland</strong>, developing a deeper appreciation for the connections between people, land, infrastructure, industry and the built environment.</p><p>What interests me is the thought behind development: why cities grow the way they do, how challenges are navigated and how an initial idea can become something meaningful.</p><blockquote>Behind every development is something more than land and construction. There is an ambition to create something that did not exist before.</blockquote></div>
</div></section>
<section class="about-chapter about-purpose"><div class="shell about-chapter-grid">
 <div class="about-aside"><span>03 / THE PURPOSE</span><div class="about-drawing"><img class="kova-drawing-img" src="assets/study-streetscape.svg" loading="lazy" alt="Conceptual streetscape drawn in fine architectural linework"></div></div>
 <div class="about-body"><h2>UNDERSTAND THE<br><em>POSSIBILITIES.</em></h2><p>I founded KOVA Planning Co. to bring that curiosity and considered perspective into the planning and development process.</p><p>Every site sits between opportunity and constraint. Its potential can only be understood by considering the planning framework, environment, infrastructure, practical construction questions and the people a project may affect.</p><p>KOVA helps clients understand what a site can support, what approvals are needed and what to check before committing. We lead the planning work and bring in independent designers, surveyors and engineers when needed, giving clients one point of contact for the application package.</p><p>Because good planning is more than permission. It is asking better questions before shaping what comes next.</p></div>
</div></section>

`;}

function contact(){return `<section class="internal-hero contact-hero"><div class="shell">${eyebrow('06','CONTACT','START A CONVERSATION')}<div class="internal-headline"><h1>WHAT'S YOUR<br><em>NEXT MOVE?</em></h1><p>Every project begins with an ambition and a few important questions. Tell us what you are considering.</p></div><div class="internal-hero-footer"><span>AUCKLAND / AOTEAROA NEW ZEALAND</span><span>ENQUIRE BELOW ↓</span></div></div></section>
<section class="contact-section page-section"><div class="shell">${sectionHead('01','PROJECT ENQUIRY','THE STARTING POINT')}<div class="contact-layout"><div class="contact-message"><h2>LET'S MAKE<br>IT <span>CLEAR.</span></h2><p>Every idea begins somewhere. Tell us about the place, the possibility and the questions you are working through, so the next step can be considered with clarity.</p><div class="contact-aside"><span>HELPFUL DETAILS</span><ul><li>Where is the site?</li><li>What are you looking to do?</li><li>What decision or approval are you unsure about?</li><li>Are there plans or existing documents?</li></ul></div><p class="contact-aside-note">If you have them, include the site address and any plans or documents when you describe your project.</p></div>
<form id="enquiry-form" class="contact-form" method="post" action="https://formspree.io/f/meagavgw">
 <div class="form-pair"><label><span>01 / YOUR NAME *</span><input name="name" autocomplete="name" placeholder="Full name" required maxlength="120"></label><label><span>02 / EMAIL ADDRESS *</span><input name="email" type="email" autocomplete="email" placeholder="you@example.com" required maxlength="200"></label></div>
 <div class="form-pair"><label><span>03 / CONTACT NUMBER</span><input name="phone" type="tel" autocomplete="tel" placeholder="Optional" maxlength="40"></label><label><span>04 / PROJECT LOCATION</span><input name="location" placeholder="Street, suburb or region" maxlength="250"></label></div>
 <div class="kova-field"><span class="kova-field-label" id="service-label">05 / WHAT DO YOU NEED HELP WITH? *</span><select name="service" id="service-native" required aria-labelledby="service-label"><option value="" disabled selected>Select a service</option><option>Resource consent</option><option>Building consent coordination</option><option>Architectural drawings & consultant coordination</option><option>Assessment of Environmental Effects</option><option>Site feasibility</option><option>Development planning advice</option><option>General Inquiries</option></select></div>
 <label><span>06 / TELL US ABOUT YOUR PROJECT *</span><textarea name="message" placeholder="What are you planning, and what would you like to understand?" rows="5" required maxlength="4000"></textarea></label>
 
 <button class="btn btn-dark form-submit" type="submit">Send enquiry <span><svg class="kova-line-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path d="M7 25L25 7M10 7h15v15"/></svg></span></button><p class="form-under">We’ll use your details to respond to your enquiry. <a href="privacy.html" data-route="privacy">Read our privacy statement</a>.<span class="form-required">* Required fields</span></p><p id="enquiry-status" class="enquiry-status" role="status" aria-live="polite"></p>
 </form></div></div></section>`;}


// V06 maintains real-page navigation, clearer services, About, and an editorial Insights layout.
// V05 fixes the in-page anchor/hash collision that previously jumped visitors back Home.
// Chapter gateways replace generic "Next page" buttons: headings + arrow, with a clear destination.

function privacy(){return `<section class="internal-hero privacy-hero">
 <div class="shell">
  <div class="eyebrow-row"><span>KOVA / PRIVACY</span><span>WEBSITE INFORMATION</span></div>
  <div class="internal-headline"><h1>PRIVACY,<br><em>WITH PURPOSE.</em></h1><p>Clear information about what happens when you visit KOVA, send a project enquiry or get in touch.</p></div>
  <div class="internal-hero-footer"><span>NEW ZEALAND / PRIVACY ACT 2020</span><span>REVIEWED 17 NOVEMBER 2026</span></div>
 </div>
</section>
<section class="privacy-content page-section" id="privacy-statement">
 <div class="shell">
  <div class="section-label"><span>01 / PRIVACY STATEMENT</span><span>KOVA PLANNING CO.</span></div>
  <div class="privacy-opening"><h2>YOUR INFORMATION<br><span>MATTERS.</span></h2><p>Planning involves people, places and important decisions. We believe the handling of personal information deserves the same clarity and care. This statement explains our website's current operation and how information may be handled when you correspond with KOVA outside the website.</p></div>
  <div class="privacy-chapters">
   <section class="privacy-chapter" id="privacy-identity"><div class="privacy-chapter-label"><span>01 / WHO WE ARE</span></div><div><h3>KOVA Planning Co.</h3><p>KOVA Planning Co. is a founder-led planning consultancy based in Auckland, New Zealand. This statement covers visits to our website and personal information that may be received when people make enquiries or engage with us through separate communication channels.</p></div></section>
   <section class="privacy-chapter" id="privacy-visiting"><div class="privacy-chapter-label"><span>02 / VISITING THE WEBSITE</span></div><div><h3>What happens when you browse.</h3><p>Our site is hosted using GitHub Pages. GitHub states that it logs visitors' IP addresses for security purposes. That hosting activity is separate from KOVA collecting a project enquiry. For details of GitHub's practices, see <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" target="_blank" rel="noopener noreferrer">GitHub's privacy statement</a>.</p><p>KOVA has not installed a separate website analytics service, advertising trackers or an online marketing signup system. The site serves its Space Grotesk and Instrument Sans typefaces directly from KOVA's GitHub Pages host. No separate Google Fonts connection is required. An optional smooth-scrolling library is loaded through unpkg; your browser may send that provider technical connection information, including your IP address, when requesting its script. We will update this statement if our services change.</p></div></section>
   <section class="privacy-chapter" id="privacy-enquiries"><div class="privacy-chapter-label"><span>03 / PROJECT ENQUIRIES</span></div><div><h3>When you submit an enquiry.</h3><p>The form asks for your name, email, optional phone number and site location, the service you are interested in and a brief description of your project. We use this information to assess your enquiry and get back to you.</p><p>Formspree processes your submission and forwards it to KOVA’s enquiry inbox. Formspree may store submissions, and your information may be processed outside New Zealand. See <a href="https://formspree.io/legal/privacy-policy/">Formspree’s privacy policy</a>. Please leave out sensitive documents or details that are not needed for a first enquiry.</p></div></section>
   <section class="privacy-chapter" id="privacy-contact"><div class="privacy-chapter-label"><span>04 / DIRECT CORRESPONDENCE</span></div><div><h3>When you contact KOVA directly.</h3><p>If you communicate with KOVA outside this website, we may receive contact details and the project information you choose to provide. That information may be used to understand your enquiry, assess the requested services, communicate about a project, coordinate appropriate specialist inputs and maintain necessary business records.</p><p>Providing information for an initial enquiry is generally voluntary, but without enough detail we may not be able to assess or respond meaningfully to the request.</p></div></section>
   <section class="privacy-chapter" id="privacy-sharing"><div class="privacy-chapter-label"><span>05 / SHARING &amp; SECURITY</span></div><div><h3>Only where there is a reason.</h3><p>Planning work can involve architectural designers, surveyors, engineers, councils and other specialists. Where appropriate for a project, relevant information may need to be shared with those involved, with suitable regard to the purpose of the work, confidentiality and applicable law.</p><p>We aim to limit access to information to those who need it, take reasonable steps to protect it, and retain it no longer than needed for legitimate purposes and legal obligations. No online method of communication is entirely risk-free; avoid sending sensitive documents unless an appropriate channel has been agreed.</p></div></section>
   <section class="privacy-chapter" id="privacy-rights"><div class="privacy-chapter-label"><span>06 / YOUR RIGHTS</span></div><div><h3>Access, correction and questions.</h3><p>Under New Zealand's Privacy Act 2020, you can ask to access personal information an organisation holds about you and ask for it to be corrected if inaccurate. If you have already communicated with KOVA, please use that existing correspondence channel to make an access, correction or privacy enquiry.</p><p>If you do not already have a correspondence channel with KOVA, you can use the <a href="contact.html" data-route="contact">contact form</a> for privacy questions and requests. Please do not include sensitive documents in the form.</p><p>You can learn more about your rights through the <a href="https://www.privacy.org.nz/your-rights/your-privacy-rights/" target="_blank" rel="noopener noreferrer">Office of the Privacy Commissioner</a>.</p></div></section>
   <section class="privacy-chapter" id="privacy-changes"><div class="privacy-chapter-label"><span>07 / UPDATES</span></div><div><h3>Keeping this current.</h3><p>We will review this statement when website functionality or personal information practices change. We will update this statement if our enquiry or website providers change.</p><p class="privacy-date">LAST REVIEWED / 17 NOVEMBER 2026</p></div></section>
  </div>
  <div class="privacy-return"><a href="contact.html" data-route="contact">Contact KOVA <svg class="kova-line-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true"><path d="M7 25L25 7M10 7h15v15"/></svg></a><span>SHAPING WHAT COMES NEXT.</span></div>
 </div>
</section>`; }

function work(){return `<section class="work-study" id="popes-road"><div class="shell">
  <div class="work-index"><span>OUR WORK / 01</span><span>PLANNING &amp; CONCEPT FEASIBILITY</span></div>
  <header class="work-heading">
    <h1>POPES ROAD,<br><em>TAKANINI.</em></h1>
    <p>A desktop planning assessment and a concept feasibility study looked at what could be done with the existing property before committing to design.</p>
  </header>

  <figure class="work-figure">
    <div class="work-sheet-title"><span>FIG. 01 / SITE FEASIBILITY STUDY</span><span>ILLUSTRATIVE ONLY</span></div>
    <img src="assets/work-feasibility.svg?v=3" width="1040" height="484" fetchpriority="high" alt="Illustrative site diagram. A hatched hazard area, a building footprint and a dashed access route show three different questions a feasibility assessment might consider.">
    <figcaption>
      <ol class="work-key"><li><span>01</span> Mapped hazards</li><li><span>02</span> Building footprint</li><li><span>03</span> Vehicle access</li></ol>
      <p>Fictional parcel. The drawing does not depict the Popes Road property and is not to scale.</p>
    </figcaption>
  </figure>

  <div class="work-findings">
    <div class="work-finding-lead"><span class="work-kicker">THE TAKEAWAY</span><h2>Start with what’s already there.</h2><p>The assessment identified improvements to the existing property as the clearest option to investigate. Flooding was the main constraint. The review did not establish subdivision potential, an entitlement to another dwelling or a date for urban rezoning.</p></div>
    <div class="work-details">
      <section><span class="work-kicker">01 / DESKTOP PLANNING ASSESSMENT</span><h3>What the planning rules and site constraints meant.</h3><p>We reviewed zoning, mapped flooding, access, servicing and airport height controls. The report distinguished the rules in force at the time from proposed changes and longer term growth plans.</p></section>
      <section><span class="work-kicker">02 / CONCEPT FEASIBILITY STUDY</span><h3>How four options might fit.</h3><p>We compared refurbishing the existing home, extending it, adding a minor dwelling and replacing the main house. Indicative layouts tested siting and scale, and showed where survey, flood analysis, safe access and servicing checks would inform detailed design.</p></section>
    </div>
  </div>
</div></section>
<section class="work-study" id="kaipara-road" aria-labelledby="kaipara-road-title"><div class="shell">
  <div class="work-index"><span>OUR WORK / 02</span><span>RESOURCE CONSENT APPROVED</span></div>
  <header class="work-heading">
    <h2 id="kaipara-road-title" style="font:500 clamp(2.25rem,6.3vw,5.5rem)/.94 'Space Grotesk',sans-serif;letter-spacing:-.055em">KAIPARA ROAD,<br><span style="color:#4e6371">CLEVEDON.</span></h2>
    <p>KOVA assessed site feasibility and engaged surveyors to support the resource consent process.</p>
  </header>
  <figure class="work-figure">
    <div class="work-sheet-title"><span>FIG. 02 / SURVEY &amp; ACCESS STUDY</span><span>ILLUSTRATIVE ONLY</span></div>
    <img src="assets/work-survey.svg" width="1040" height="484" loading="lazy" alt="Fictional survey plan with a parcel boundary, survey points and a dashed access route to an open area.">
    <figcaption><ol class="work-key"><li><span>01</span> Site boundary</li><li><span>02</span> Survey points</li><li><span>03</span> Access route</li></ol><p>Fictional study drawing. It does not depict the Kaipara Road property and is not to scale.</p></figcaption>
  </figure>
  <div class="work-findings">
    <div class="work-finding-lead"><span class="work-kicker">THE OUTCOME</span><h2>From feasibility to approval.</h2><p>Resource consent was granted. The project brought the early planning assessment and survey inputs into the consent process.</p></div>
    <div class="work-details">
      <section><span class="work-kicker">01 / SITE FEASIBILITY</span><h3>Understand the site before progressing.</h3><p>KOVA looked at the site from a planning perspective to identify what needed to be checked before progressing to consent.</p></section>
      <section><span class="work-kicker">02 / SURVEY &amp; CONSENT</span><h3>Bring survey information into the planning process.</h3><p>KOVA engaged surveyors and coordinated their input as the project moved from feasibility into the resource consent process.</p></section>
    </div>
  </div>
</div></section>
<section class="work-study" id="sandstone-road" aria-labelledby="sandstone-road-title"><div class="shell">
  <div class="work-index"><span>OUR WORK / 03</span><span>RESOURCE CONSENT APPROVED</span></div>
  <header class="work-heading">
    <h2 id="sandstone-road-title" style="font:500 clamp(2.25rem,6.3vw,5.5rem)/.94 'Space Grotesk',sans-serif;letter-spacing:-.055em">SANDSTONE ROAD,<br><span style="color:#4e6371">WHITFORD.</span></h2>
    <p>KOVA took the project from site feasibility through the resource consent process, with survey and geotechnical input.</p>
  </header>
  <figure class="work-figure">
    <div class="work-sheet-title"><span>FIG. 03 / GROUND &amp; LEVELS STUDY</span><span>ILLUSTRATIVE ONLY</span></div>
    <img src="assets/work-ground.svg" width="1040" height="484" loading="lazy" alt="Fictional site section showing sloping ground, a stepped building setting and conceptual ground investigation points.">
    <figcaption><ol class="work-key"><li><span>01</span> Ground profile</li><li><span>02</span> Building setting</li><li><span>03</span> Investigation points</li></ol><p>Fictional study drawing. It does not depict the Sandstone Road property and is not to scale.</p></figcaption>
  </figure>
  <div class="work-findings">
    <div class="work-finding-lead"><span class="work-kicker">THE OUTCOME</span><h2>Planning, survey and geotechnical input.</h2><p>Resource consent was granted. Survey and geotechnical specialists supported the project as it moved from the initial feasibility assessment to the consent decision.</p></div>
    <div class="work-details">
      <section><span class="work-kicker">01 / SITE FEASIBILITY</span><h3>Set the direction for the consent work.</h3><p>KOVA assessed the site at desktop feasibility stage and identified where specialist input was needed before progressing.</p></section>
      <section><span class="work-kicker">02 / SPECIALIST COORDINATION</span><h3>Bring levels and ground conditions into the assessment.</h3><p>KOVA brought in surveyors and geotechnical specialists and coordinated their inputs through the resource consent process.</p></section>
    </div>
  </div>
  <div class="work-end">
    <a class="text-link" href="contact.html" data-route="contact">Discuss a similar site <span aria-hidden="true">↗</span></a>
  </div>
</div></section>`; }

const renderers = {home,expertise,approach,work,insights,about,contact,privacy};
const titles = {home:'Shaping What Comes Next',expertise:'Expertise',approach:'Our Approach',work:'Our Work',insights:'Planning Explained',about:'About',contact:'Contact',privacy:'Privacy'};
const parseRoute = () => {
  const file=location.pathname.split('/').pop() || 'index.html';
  const name=file==='index.html'?'home':file.replace(/\.html$/,'');
  const query=new URLSearchParams(location.search);
  const hash=location.hash.slice(1);
  if((name==='approach'&&hash==='anatomy-of-consent')||(name==='expertise'&&query.get('view')==='anatomy')){
    history.replaceState(null,'','expertise.html#anatomy-of-consent');
    return {page:'expertise',query:new URLSearchParams(),hash:'anatomy-of-consent'};
  }
  return {page:pages.includes(name)?name:'home',query,hash};
};
function landAt(hash,instant=true){
  const target=hash&&document.getElementById(hash);
  if(!target)return false;
  const heading=target.querySelector?.('h2[tabindex="-1"],h3[tabindex="-1"]');
  heading?.focus?.({preventScroll:true});
  scrollToTarget(target,instant);
  return true;
}
// On mobile the drawer must be a viewport overlay, not an absolutely positioned child of a sticky header.
// Moving it out of the header also prevents iOS from attaching it to the header's original document position.
document.body.appendChild(mobileMenu);
const updateMobileMenuPosition = () => {
  const header=document.getElementById('header');
  const bottom=header.getBoundingClientRect().bottom;
  mobileMenu.style.setProperty('--kova-menu-top', `${Math.max(0, Math.min(window.innerHeight, bottom))}px`);
};
const closeMenu = () => {mobileMenu.hidden=true;menuBtn.setAttribute('aria-expanded','false');menuBtn.setAttribute('aria-label','Open navigation');document.body.classList.remove('menu-open');};
const updateNav = page => {document.querySelectorAll('a[data-route]').forEach(el=>{let act=el.dataset.route===page&&!!el.closest?.('.desktop-nav, .mobile-drawer');el.classList.toggle('is-current',act);if(act&&el.closest?.('nav, .header-cta'))el.setAttribute('aria-current','page');else el.removeAttribute('aria-current')}); document.getElementById('utility-current').textContent=page==='privacy'?'INFO / PRIVACY':`${String(pages.indexOf(page)+1).padStart(2,'0')} / 07 — ${titles[page].toUpperCase()}`; document.getElementById('header-page-name').textContent=titles[page].toUpperCase(); document.title=`${titles[page]} — KOVA Planning Co.`;};
function mount(page,query,hash=''){
  // Content is mounted only after outgoing motion has made it invisible.
  // Reset once, without an animated scroll-to-top that competes with the fade.
  document.documentElement.style.scrollBehavior='auto';
  ROOT.innerHTML=renderers[page]();
  ROOT.setAttribute('data-page',page);
  currentPage=page;updateNav(page);
  scrollToTop(true);
  document.documentElement.scrollTop=0;document.body.scrollTop=0;
  closeMenu();
  setupReveals();
  if(page==='expertise'){
    const key=query.get('focus');
    if(key&&Object.hasOwn(topicContent,key))openService(key,true);
    else if(query.get('view')==='coordination')landAt('project-coordination');
    else if(hash)landAt(hash);
  }else if(hash)landAt(hash);
  if(page==='insights'){
    const key=query.get('guide')||query.get('article');
    if(key&&guides[key])showGuide(key,false,true);
  }
  if(page==='contact')setupForm();
  requestAnimationFrame(()=>{document.documentElement.style.scrollBehavior='';smoothScroll?.resize()});
  updateProgress();
}
function go(){
  if(busy){queuedRoute=()=>go();return;}
  const {page,query,hash}=parseRoute();
  if(page===currentPage){
    if(page==='expertise'&&query.has('focus'))openService(query.get('focus'),true);
    else if(page==='expertise'&&query.get('view')==='coordination')landAt('project-coordination');
    else if(hash)landAt(hash);
    else if(page==='insights'&&(query.has('guide')||query.has('article')))showGuide(query.get('guide')||query.get('article'),true);
    else if(page==='insights'&&guideOpen)backToGuides();
    else if(!query.toString())scrollToTop();
    return;
  }
  busy=true;
  closeMenu();
  const done=()=>{busy=false;smoothScroll?.start?.();const queued=queuedRoute;queuedRoute=null;queued?.();};
  const change=()=>{mount(page,query,hash);smoothScroll?.resize();};
  if(reduceMotion||typeof ROOT.animate!=='function'){
    try{change();}finally{done();}
    return;
  }
  smoothScroll?.stop?.();
  const animations=[];
  const fade=(from,to)=>{
    const animation=ROOT.animate([{opacity:from},{opacity:to}],{
      duration:320,easing:'cubic-bezier(.4,0,.2,1)',fill:'both'
    });
    animations.push(animation);
    return animation;
  };
  const run=async()=>{
    let mounted=false;
    try{
      const outgoing=fade(1,0);
      await outgoing.finished;
      mounted=true;
      change();
      const incoming=fade(0,1);
      outgoing.cancel();
      await incoming.finished;
    }catch(error){
      if(!mounted)change();
      else console.warn('KOVA page fade interrupted',error);
    }finally{
      animations.forEach(animation=>animation.cancel());
      done();
    }
  };
  void run();
}
let revealObserver;
function setupReveals(){
  revealObserver?.disconnect();
  if(reduceMotion||typeof IntersectionObserver!=='function')return;
  const targets=ROOT.querySelectorAll('.section-intro,.manifesto-grid,.topic-hero,.three-steps,.large-quote,.legal-grid,.principles-grid,.insights-grid,.anatomy-intro,.anatomy-board,.document-header,.sample-grid,.scenario-header,.home-intelligence-inner,.founder-teaser-inner,.services-overview-head,.about-body,.chapter-gateway-inner,.contact-message,.about-drawing,.approach-intro-note,.team-coordination .kova-sketch,.urban-panel');
  // Keep observing after entry. Rearm only beyond the viewport, so the fade
  // can replay in either direction without blanking text at the screen edge.
  revealObserver=new IntersectionObserver(entries=>{
    for(const entry of entries){
      entry.target.classList.toggle('is-visible',entry.isIntersecting);
    }
  },{threshold:0,rootMargin:'24px 0px'});
  for(const target of targets){
    target.classList.add('reveal');
    revealObserver.observe(target);
  }
}
function openService(key,instant=false){
  if(!Object.hasOwn(topicContent,key))return;
  selectTopic(key,false,true);
  landAt('service-'+key,instant);
}
function selectTopic(key,scroll,instant=false){if(!topicContent[key])return;const viewport=document.getElementById('topic-viewport');if(!viewport)return;swapPanel(viewport,topicPanel(key),scroll?()=>scrollToTarget(document.querySelector('.knowledge-section'),instant):null,instant);document.querySelectorAll('.topic-tab').forEach(b=>{let on=b.dataset.topic===key;b.classList.toggle('active',on);b.setAttribute('aria-selected',String(on))});}
function selectStage(idx){const viewport=document.getElementById('stage-viewport');if(!viewport)return;swapPanel(viewport,stagePanel(idx));document.querySelectorAll('.stage-tab').forEach(b=>{let on=+b.dataset.stage===idx;b.classList.toggle('active',on);b.setAttribute('aria-selected',String(on))});}
function showGuide(key,scroll,instant=false){if(!guides[key])return;const vp=document.getElementById('insights-viewport');if(!vp)return;guideOpen=key;swapPanel(vp,guideMarkup(key),scroll?()=>scrollToTarget(document.querySelector('.insights-content')):null,instant);}
function backToGuides(){guideOpen=null;const vp=document.getElementById('insights-viewport');swapPanel(vp,insightListing(),()=>scrollToTarget(document.querySelector('.insights-content')));history.replaceState(null,'','insights.html');}
function safe(s){return String(s||'').trim();}

// KOVA SELECT / reusable, branded dropdown for all present and future select elements.
// Enhances standard <select> elements, retaining their real value for FormData.
function enhanceKovaSelects(root){
  root.querySelectorAll('select:not([data-kova-native])').forEach((native,index)=>{
    if(native.dataset.kovaEnhanced) return;
    native.dataset.kovaEnhanced='true';
    const originalRequired=native.required;
    native.required=false; // selection is validated against the branded control before creating the enquiry.
    native.classList.add('kova-select-native');
    native.tabIndex=-1;
    native.setAttribute('aria-hidden','true');
    const wrap=document.createElement('div');
    wrap.className='kova-select';
    native.parentNode.insertBefore(wrap,native);
    wrap.appendChild(native);
    const id=native.id||`kova-select-${index}`;
    native.id=id;
    const fieldLabel=native.closest('.kova-field')?.querySelector('.kova-field-label');
    const button=document.createElement('button');
    button.type='button';
    button.className='kova-select-trigger';
    button.id=`${id}-trigger`;
    button.setAttribute('role','combobox');
    button.setAttribute('aria-haspopup','listbox');
    button.setAttribute('aria-expanded','false');
    button.setAttribute('aria-controls',`${id}-options`);
    button.setAttribute('aria-required',String(originalRequired));
    if(fieldLabel?.id) button.setAttribute('aria-labelledby',`${fieldLabel.id} ${id}-value`);
    const value=document.createElement('span');value.className='kova-select-value is-placeholder';value.id=`${id}-value`;
    const chevron=document.createElement('span');chevron.className='kova-select-chevron';chevron.setAttribute('aria-hidden','true');
    button.append(value,chevron);
    const menu=document.createElement('div');
    menu.className='kova-select-menu';menu.id=`${id}-options`;
    menu.setAttribute('role','listbox');menu.setAttribute('aria-hidden','true');
    if(fieldLabel?.id) menu.setAttribute('aria-labelledby',fieldLabel.id);
    menu.tabIndex=-1;
    const choices=Array.from(native.options).filter(option=>option.value!==''&&!option.disabled);
    const items=choices.map((opt,i)=>{
      const item=document.createElement('button');
      item.type='button';item.setAttribute('role','option');item.tabIndex=-1;
      item.id=`${id}-option-${i}`;item.dataset.value=opt.value;
      item.className='kova-select-option';
      const n=document.createElement('span');n.className='kova-select-number';n.textContent=String(i+1).padStart(2,'0');
      const t=document.createElement('span');t.className='kova-select-option-text';t.textContent=opt.text;
      const mark=document.createElement('span');mark.className='kova-select-check';mark.setAttribute('aria-hidden','true');mark.innerHTML='<svg class="kova-line-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path d="M7 25L25 7M10 7h15v15"/></svg>';
      item.append(n,t,mark); menu.appendChild(item);
      item.addEventListener('click',()=>choose(i));
      item.addEventListener('mousemove',()=>{active=i;markActive()});
      return item;
    });
    const error=document.createElement('p');error.className='kova-select-error';error.id=`${id}-error`;error.hidden=true;error.textContent='Please select a service to continue.';
    wrap.append(button,menu,error);
    let open=false,active=0;
    function markActive(){items.forEach((el,i)=>el.classList.toggle('is-highlighted',open&&i===active));if(open&&active>=0)button.setAttribute('aria-activedescendant',items[active].id);else button.removeAttribute('aria-activedescendant')}
    function sync(){
      const selected=native.options[native.selectedIndex];
      value.textContent=native.value?selected?.text:'Select a service';
      value.classList.toggle('is-placeholder',!native.value);
      wrap.classList.toggle('has-value',!!native.value);
      items.forEach(el=>{const selected=el.dataset.value===native.value;el.classList.toggle('is-selected',selected);el.setAttribute('aria-selected',String(selected))});
    }
    function setInvalid(invalid){wrap.classList.toggle('is-invalid',invalid);error.hidden=!invalid;button.setAttribute('aria-invalid',String(invalid));if(invalid)button.setAttribute('aria-describedby',error.id);else button.removeAttribute('aria-describedby')}
    function show(focus=false){
      if(open)return;
      // Only one KOVA dropdown is open at a time.
      document.querySelectorAll('.kova-select.is-open').forEach(other=>other!==wrap&&other.dispatchEvent(new Event('kova-close')));
      open=true;
      const spaceBelow=innerHeight-button.getBoundingClientRect().bottom;
      wrap.classList.toggle('opens-up',spaceBelow<Math.min(345,choices.length*49+24)&&button.getBoundingClientRect().top>spaceBelow);
      wrap.classList.add('is-open');
      button.setAttribute('aria-expanded','true');menu.setAttribute('aria-hidden','false');
      active=items.findIndex(i=>i.dataset.value===native.value);
      markActive();
    }
    function hide(restore=false){
      if(!open)return;
      open=false;wrap.classList.remove('is-open');
      button.setAttribute('aria-expanded','false');menu.setAttribute('aria-hidden','true');
      markActive();if(restore)button.focus({preventScroll:true});
    }
    function choose(i){if(!choices[i])return; native.value=choices[i].value;native.dispatchEvent(new Event('change',{bubbles:true}));setInvalid(false);sync();hide(true)}
    button.addEventListener('click',()=>open?hide():show(false));
    button.addEventListener('keydown',ev=>{
      // Keep DOM focus on the combobox; tell assistive tech which option is active.
      if(open&&(ev.key==='Enter'||ev.key===' ')){ev.preventDefault();choose(Math.max(0,active));return}
      if(['ArrowDown','ArrowUp','Home','End',' '].includes(ev.key)){
        ev.preventDefault();if(!open)show(false);
        if(ev.key==='End')active=items.length-1;
        else if(ev.key==='Home')active=0;
        else if(ev.key==='ArrowUp')active=active<=0?items.length-1:active-1;
        else if(ev.key==='ArrowDown')active=Math.min(items.length-1,active+1);
        markActive();items[active]?.scrollIntoView({block:'nearest'});
      }else if(ev.key==='Escape'&&open){ev.preventDefault();hide(true)}
    });
    menu.addEventListener('keydown',ev=>{
      if(ev.key==='Escape'){ev.preventDefault();hide(true);return}
      if(ev.key==='Tab'){hide();return}
      if(['ArrowDown','ArrowUp','Home','End','Enter',' '].includes(ev.key)){
        ev.preventDefault();
        if(ev.key==='Enter'||ev.key===' '){choose(active);return}
        if(ev.key==='End')active=items.length-1;
        else if(ev.key==='Home')active=0;
        else active=(active+(ev.key==='ArrowDown'?1:-1)+items.length)%items.length;
        markActive();items[active]?.focus({preventScroll:true});items[active]?.scrollIntoView({block:'nearest'});
      }
    });
    wrap.addEventListener('kova-close',()=>hide());
    document.addEventListener('pointerdown',ev=>{if(open&&!wrap.contains(ev.target))hide()});
    wrap.addEventListener('focusout',()=>setTimeout(()=>{if(open&&!wrap.contains(document.activeElement))hide()},0));
    native.addEventListener('change',sync);
    sync();
    wrap.kovaValidate=()=>{
      if(!originalRequired||native.value)return true;
      setInvalid(true);button.focus({preventScroll:false});show(false);return false;
    };
  });
}

function setupForm(){
  const form=document.getElementById('enquiry-form');
  if(!form)return;
  enhanceKovaSelects(form);
  const status=form.querySelector('#enquiry-status');
  const button=form.querySelector('button[type="submit"]');
  const label=button.firstChild;
  let sending=false;
  form.addEventListener('submit',async ev=>{
    ev.preventDefault();
    if(sending || form.querySelector('.kova-select')?.kovaValidate?.()===false || !form.reportValidity())return;
    sending=true;
    button.disabled=true;
    label.textContent='Sending… ';
    status.dataset.state='pending';
    status.textContent='Sending your enquiry…';
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),12000);
    try{
      const response=await fetch(form.action,{
        method:'POST',body:new FormData(form),headers:{Accept:'application/json'},signal:controller.signal
      });
      if(!response.ok)throw Error('Submission was not accepted');
      const result=await response.json();
      if(result.ok!==true)throw Error('Submission was not confirmed');
      form.reset();
      form.querySelector('select')?.dispatchEvent(new Event('change',{bubbles:true}));
      status.dataset.state='success';
      status.textContent='Enquiry submitted. Thanks for getting in touch with KOVA.';
    }catch{
      status.dataset.state='error';
      status.textContent='We could not confirm your submission. Your details are still here. Please try again.';
    }finally{
      clearTimeout(timeout);
      sending=false;
      button.disabled=false;
      label.textContent='Send enquiry ';
    }
  });
}
function updateProgress(){let height=document.documentElement.scrollHeight-window.innerHeight;let p=height>0?window.scrollY/height:0;document.getElementById('reading-progress').style.transform=`scaleX(${Math.min(1,Math.max(0,p))})`}
function navigateTo(url){
  if(busy){queuedRoute=()=>navigateTo(url);return;}
  if(url.pathname===location.pathname&&url.search===location.search&&url.hash===location.hash){
    if(!url.hash)scrollToTop();else landAt(url.hash.slice(1));
    closeMenu();
    return;
  }
  history.pushState(null,'',url.pathname+url.search+url.hash);
  go();
}
document.addEventListener('click',event=>{
  const link=event.target.closest('a[data-route]');
  if(!link||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  event.preventDefault();
  navigateTo(new URL(link.href,location.href));
});
menuBtn.addEventListener('click',()=>{
  const isOpen=menuBtn.getAttribute('aria-expanded')==='true';
  if(isOpen){closeMenu();return;}
  updateMobileMenuPosition();
  mobileMenu.hidden=false;
  mobileMenu.scrollTop=0;
  menuBtn.setAttribute('aria-expanded','true');
  menuBtn.setAttribute('aria-label','Close navigation');
  document.body.classList.add('menu-open');
});
document.addEventListener('click',ev=>{const inPage=ev.target.closest('a[href^="#"]:not([href^="#/"])');if(inPage){const target=document.getElementById(inPage.getAttribute('href').slice(1));if(target){ev.preventDefault();if(inPage.classList?.contains('skip')){target.focus?.({preventScroll:true});scrollToTarget(target);}else landAt(target.id,false);document.querySelectorAll('.expertise-index a').forEach(a=>a.classList.toggle('is-active',a===inPage));return;}}const topic=ev.target.closest('[data-topic]');if(topic)selectTopic(topic.dataset.topic,false);const stage=ev.target.closest('[data-stage]');if(stage)selectStage(+stage.dataset.stage);const next=ev.target.closest('[data-stage-next], [data-stage-prev]');if(next)selectStage(+(next.dataset.stageNext ?? next.dataset.stagePrev)); const anatomy=ev.target.closest('[data-anatomy]');if(anatomy)selectAnatomy(+anatomy.dataset.anatomy); const scenario=ev.target.closest('[data-scenario]');if(scenario)selectScenario(scenario.dataset.scenario);const guide=ev.target.closest('[data-guide]');if(guide){history.replaceState(null,'',`insights.html?guide=${guide.dataset.guide}`);showGuide(guide.dataset.guide,true)}if(ev.target.closest('[data-back-guides]'))backToGuides();});
document.addEventListener('keydown',ev=>{
  const tab=ev.target.closest?.('[data-topic],[data-stage]');
  if(!tab||!['ArrowLeft','ArrowRight','Home','End'].includes(ev.key))return;
  const group=tab.closest('[role="tablist"]');
  const tabs=Array.from(group.querySelectorAll('[role="tab"]'));
  const i=tabs.indexOf(tab);
  const next=ev.key==='Home'?0:ev.key==='End'?tabs.length-1:(i+(ev.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;
  ev.preventDefault();
  tabs[next].focus();
  tabs[next].click();
});
document.addEventListener('keydown',ev=>{if(ev.key==='Escape')closeMenu()});window.addEventListener('resize',()=>{if(window.innerWidth>860)closeMenu();else if(!mobileMenu.hidden)updateMobileMenuPosition()});window.addEventListener('scroll',updateProgress,{passive:true});window.addEventListener('popstate',go);
// Letter-by-letter editorial ripple for desktop nav. Accessible name remains
// on each link while decorative letters are hidden from screen readers.
function enhanceNavLetters(){
  if(reduceMotion)return;
  const nav=document.querySelector('.desktop-nav');
  if(!nav)return;
  nav.querySelectorAll('a[data-route]').forEach(link=>{
    if(link.querySelector('.nav-word'))return;
    const label=link.textContent.trim();
    if(!label)return;
    const letters=Array.from(label).map((char,i)=>
      char===' ' ? '<span class="nav-letter nav-space" style="--letter-index:'+i+'">&nbsp;</span>'
      : '<span class="nav-letter" style="--letter-index:'+i+'">'+char.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]))+'</span>'
    ).join('');
    link.setAttribute('aria-label',label);
    link.innerHTML='<span class="nav-word" aria-hidden="true">'+letters+'</span>';
  });
}
enhanceNavLetters();

/* Audit the actual loaded faces, not only CSS font-family names. This does
   not block navigation or conceal text when an offline/system fallback is used. */
function checkKovaFonts(){
  const fonts=document.fonts;
  const root=document.documentElement;
  if(!fonts?.load||!root?.dataset)return;
  root.dataset.kovaFonts='loading';
  Promise.all([
    fonts.load('500 32px "Space Grotesk"','SHAPING WHAT COMES NEXT.'),
    fonts.load('400 16px "Instrument Sans"','Auckland resource consent')
  ]).then(results=>{
    root.dataset.kovaFonts=results.every(faces=>faces.length>0)?'ready':'fallback';
  }).catch(()=>{root.dataset.kovaFonts='fallback'});
}
checkKovaFonts();
document.getElementById('year').textContent=new Date().getFullYear();
const legacyRoute=location.hash.match(/^#\/([a-z]+)(\?.*)?$/);if(legacyRoute && pages.includes(legacyRoute[1]))history.replaceState(null,'',routeFile(legacyRoute[1])+(legacyRoute[2]||''));
let initial=parseRoute();mount(initial.page,initial.query,initial.hash);
