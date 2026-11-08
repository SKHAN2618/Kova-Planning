/* KOVA PLANNING CO. / WEBSITE V07.5
 * Brand assets: supplied official KOVA vector artwork, unmodified.
 * No analytics, backend or storage. Optional Lenis smooth scrolling (MIT) is desktop-only; native fallback remains. Content is maintained for KOVA editorial review.
 */
'use strict';
const ROOT = document.getElementById('main');
const menuBtn = document.getElementById('menu-button');
const mobileMenu = document.getElementById('mobile-drawer');
const lineArrow = '<svg class="kova-line-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path d="M7 25L25 7M10 7h15v15"/></svg>';
const pages = ['home','expertise','approach','insights','about','contact','privacy'];
const routeFile = name => name==='home' ? 'index.html' : `${name}.html`;
const routeHref = input => {let [name,query=''] = input.split('?');return routeFile(name)+(query?'?'+query:'')};
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let currentPage = '', busy = false, guideOpen = null;

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
  if (smoothScroll) smoothScroll.scrollTo(node, {immediate, duration: 1.18, offset: -(window.innerWidth < 761 ? 88 : 118), easing:t=>1-Math.pow(1-t,4), force:immediate});
  else node.scrollIntoView({behavior: immediate || reduceMotion ? 'instant' : 'smooth', block:'start'});
};
const scrollToTop = (immediate = false) => {
  if (smoothScroll) smoothScroll.scrollTo(0, {immediate, duration:1.08, easing:t=>1-Math.pow(1-t,4), force:true});
  else window.scrollTo({top:0,behavior: immediate || reduceMotion ? 'instant' : 'smooth'});
};


/* Controlled two-phase motion for planning tools. The outgoing panel recedes,
   new content arrives gently from the side, and rapid repeated selections
   cancel stale animations rather than applying an out-of-order result. */
const panelAnimations=new WeakMap();
function swapPanel(panel,markup,afterSwap,instant=false){
  if(!panel)return;
  const previous=panelAnimations.get(panel);
  if(previous){previous.cancel();panelAnimations.delete(panel);}
  const apply=()=>{
    panel.innerHTML=markup;
    smoothScroll?.resize();
  };
  const after=()=>{if(afterSwap)afterSwap()};
  if(instant||reduceMotion||typeof panel.animate!=='function'){apply();after();return;}
  try{
    const outgoing=panel.animate([
      {opacity:1,transform:'translate3d(0,0,0) scale(1)'},
      {opacity:.18,transform:'translate3d(-11px,0,0)'}
    ],{duration:220,easing:'cubic-bezier(.48,0,.86,.36)',fill:'both'});
    panelAnimations.set(panel,outgoing);
    outgoing.finished.then(()=>{
      if(panelAnimations.get(panel)!==outgoing)return;
      outgoing.cancel();
      apply();
      const incoming=panel.animate([
        {opacity:.09,transform:'translate3d(15px,0,0)'},
        {opacity:1,transform:'translate3d(0,0,0) scale(1)'}
      ],{duration:650,easing:'cubic-bezier(.16,1,.3,1)',fill:'both'});
      panelAnimations.set(panel,incoming);
      incoming.finished.then(()=>{
        if(panelAnimations.get(panel)!==incoming)return;
        incoming.cancel();panelAnimations.delete(panel);after();
      },()=>{});
    },()=>{});
  }catch(error){
    panelAnimations.delete(panel);
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
const A = (path, title, css='') => `<a class="${css}" href="${routeHref(path)}" data-route="${path.split('?')[0]}">${title}<span aria-hidden="true"><svg class="kova-line-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path d="M7 25L25 7M10 7h15v15"/></svg></span></a>`;
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
      <div class="hero-bottom"><p>Thoughtful planning begins by seeing a site's possibilities clearly. KOVA provides Auckland-based feasibility advice, resource consent and AEE support, while helping connect projects with the right design and technical specialists.</p>${A('expertise','Explore our expertise','btn btn-dark')}</div>
      <div class="hero-foot"><span>URBAN PLANNING / RESOURCE MANAGEMENT</span><span>01 — 06</span></div>
    </div>
    <div class="urban-panel"><div class="urban-title"><span>FIG. 01 / LAND & POSSIBILITY</span><span>LINE STUDY</span></div><img class="urban-site-study" src="assets/study-aerial.svg" alt="A conceptual aerial street and housing study drawn entirely in fine architectural lines"><div class="urban-bottom"><span>PLACE / POTENTIAL / CONTEXT</span><span>01</span></div></div>
  </div>
</section>
<section class="manifesto-section overlap-up">
  <div class="shell manifesto-top">${sectionHead('01','OUR PERSPECTIVE','THE THINKING BEHIND KOVA')}
    <div class="manifesto-grid"><h2>GOOD PLANNING<br>IS MORE THAN<br><span>PERMISSION.</span></h2><div><p class="lead">The decisions that shape a place begin long before construction.</p><p>Behind every proposal is a relationship between land, people and possibility. Understanding the rules, the environment and the realities of delivery helps turn an idea into an informed direction.</p>${A('approach','How we think','text-link')}</div></div>
  </div>
  <div class="manifesto-bottom shell"><span>DEFINED BY CLARITY.</span><span>SHAPED BY CONTEXT.</span><span>GUIDED BY PURPOSE.</span></div>
</section>
<section class="page-section white-panel">
  <div class="shell">${sectionHead('02','EXPERTISE','A CONSIDERED SET OF SERVICES')}
    <div class="section-intro"><h2>FROM FIRST IDEA<br>TO <span>INFORMED ACTION.</span></h2><p>Every site holds different opportunities and constraints. Good advice starts by understanding both.</p></div>
    <div class="expertise-list">
      ${[['01','Resource consents','Clarifying the planning pathway for land use, subdivision and development.','expertise?focus=resource'],['02','Building consent coordination','Connecting the building approval pathway with the drawings and specialist inputs it requires.','expertise?focus=building'],['03','Environmental assessments','Understanding how a proposal may affect its surroundings, with an assessment shaped by the site and its scale.','expertise?focus=aee'],['04','Site feasibility','Recognising the potential and limitations of a site before committing to a direction.','expertise?focus=feasibility']].map(e=>`<a href="${routeHref(e[3])}" data-route="expertise" class="expertise-row"><span>${e[0]}</span><div><h3>${e[1]}</h3><p>${e[2]}</p></div><b><svg class="kova-line-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path d="M7 25L25 7M10 7h15v15"/></svg></b></a>`).join('')}
    </div>
  </div>
</section>
<section class="founder-teaser"><div class="shell founder-teaser-inner"><div class="founder-teaser-left"><span>03 / THE THINKING BEHIND KOVA</span><h2>CITIES ARE<br><em>NEVER FINISHED.</em></h2></div><div class="founder-teaser-right"><span>FOUNDER-LED / BUILT ON CURIOSITY</span><p>Places evolve through the choices made for them. KOVA began with a curiosity about those choices and the opportunities they create for people and communities.</p>${A('about','Discover why KOVA began','text-link')}</div></div></section>
<section class="insights-preview page-section"><div class="shell">${sectionHead('04','PLANNING EXPLAINED','FIELD NOTES / KOVA')}<div class="section-intro"><h2>ASK BETTER<br><span>QUESTIONS.</span></h2><p>Practical ideas, clearly explained. Explore the questions that shape a site's possibilities, and where to look next.</p></div><div class="insight-teasers"><a href="insights.html?guide=zoning" data-route="insights"><small>EXPLAINER / 01</small><h3>Zoning is only the beginning.</h3><span>What your site rules really tell you ${lineArrow}</span></a><a href="insights.html?guide=constraints" data-route="insights"><small>EXPLAINER / 02</small><h3>Why some sites are harder to develop.</h3><span>Explore the hidden considerations ${lineArrow}</span></a></div><div class="insights-preview-more">${A('insights','Explore all our planning explainers','text-link')}</div></div></section>
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
 newhome: {n:'01',label:'New dwelling',tag:'LAND USE + BUILDING WORK',headline:'A house raises two different approval questions.',intro:'An additional dwelling or a new house can involve both planning controls and Building Code requirements. Neither approval can be inferred from the address alone.',resource:['Check zone and relevant activity rules, including current transitional provisions.','Test building envelope, site access, infrastructure and mapped constraints.','Identify potential consent triggers and any environmental effects needing assessment.'],building:['Check whether the proposed construction requires building consent.','Engage appropriate designers for detailed plans, specifications and compliance evidence.','Confirm coordination between planning and building design before construction.'],note:'Some residential assessment matters changed from 30 October 2026; current council guidance and application timing matter.'},
 subdivision: {n:'02',label:'Subdivision',tag:'PARCEL + SERVICING',headline:'Creating a new lot starts with more than a boundary line.',intro:'Subdivision usually raises a resource consent pathway and often depends on infrastructure, surveyed boundaries and conditions. Building approvals may also arise for proposed physical works.',resource:['Check applicable subdivision rules, minimum standards and policy framework.','Review access, services, natural hazards, easements and title interests.','Consider council conditions, infrastructure approvals and survey requirements.'],building:['Consider whether associated structures or other building work require a building consent.','Coordinate relevant design and engineering documentation if physical works are proposed.','Avoid assuming a subdivision approval authorises building work.'],note:'A licensed cadastral surveyor and civil engineering input may be essential. Title changes follow separate survey and land registration steps.'},
 alteration: {n:'03',label:'Extension or renovation',tag:'EXISTING BUILDING + NEW WORK',headline:'Small changes can have different statutory effects.',intro:'An addition or alteration can comply with planning rules but still need building consent. Conversely, particular land use or site effects may need planning approval.',resource:['Check whether the change breaches current land use standards or triggers an overlay.','Review height, boundary relationships, earthworks, access or vegetation where relevant.','Identify whether an existing consent, consent notice or title condition affects the site.'],building:['Check for applicable exemptions; not all renovation work needs consent.','Assess structural, fire, moisture and other Building Code issues with the right practitioner.','For restricted building work, use suitably licensed practitioners.'],note:'Even work exempt from a building consent must comply with applicable legal requirements, including the Building Code.'},
 design: {n:'04',label:'Design & drafting',tag:'COORDINATED DESIGN + APPROVALS',headline:'Good design begins with a clear brief and the right team.',intro:'Need architectural drawings? We can help develop the right brief and connect you with an architect, architectural designer or draftsperson, bringing in surveying and engineering input where the project requires it.',resourceLabel:'PLANNING STRATEGY & CONSENT PATHWAY',buildingLabel:'DESIGN, DRAFTING & SPECIALISTS',resource:['Review the site, proposal, zoning, constraints and likely consent pathway before design progresses too far.','Help align concept plans with planning standards, environmental considerations and any resource consent requirements.','Clarify which assessments, drawings and reports may be needed for a coordinated application.'],building:['Agree the design scope and identify an appropriate independent architect, architectural designer or draftsperson.','Coordinate surveying, civil, structural, geotechnical and other specialist inputs as the project requires.','Have the relevant practitioners prepare drawings and technical building-consent documentation, where applicable.'],note:'We help align the design brief, planning requirements and specialist contributions from the outset. Practitioners deliver their respective professional work within an agreed scope.'}
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

function expertise(){return `<section class="internal-hero expertise-internal"><div class="shell">${eyebrow('02','EXPERTISE','PLANNING & DEVELOPMENT')}<div class="internal-headline"><h1>UNDERSTAND<br>THE RULES.<br><em>SEE THE POTENTIAL.</em></h1><p>Every site has a context, a set of constraints and a range of possibilities. Planning brings these into focus.</p></div><div class="internal-hero-footer"><span>RESOURCE CONSENTS / BUILDING CONSENTS / AEE / FEASIBILITY</span><span>SCROLL TO EXPLORE ↓</span></div></div></section>
<section class="services-overview" id="planning-services"><div class="shell">${sectionHead('01','WHAT WE CAN HELP WITH','PRACTICAL PLANNING SUPPORT')}<div class="services-overview-head"><h2>CLARITY BEFORE<br><em>COMMITMENT.</em></h2><p>Before plans become commitments, we look closely at the land, the rules and the decisions ahead.</p></div><div class="service-overview-grid">
 <a href="#consent-explorer" class="service-overview-card"><span>01 / LAND USE & SUBDIVISION</span><h3>Resource consent advice.</h3><p>Establish what the planning framework allows, where consent may be required and what an application needs.</p><b aria-hidden="true">${lineArrow}</b></a>
 <a href="#anatomy-of-consent" class="service-overview-card"><span>02 / ASSESSMENT & EVIDENCE</span><h3>AEEs & planning reports.</h3><p>Build a clear assessment of the proposal, its effects and the evidence needed to support it.</p><b aria-hidden="true">${lineArrow}</b></a>
 <a href="expertise.html?focus=building" data-route="expertise" class="service-overview-card"><span>03 / RELATED APPROVALS</span><h3>Building consent coordination.</h3><p>Bring the right designers and technical specialists into the approval process at the right time.</p><b aria-hidden="true">${lineArrow}</b></a>
 <a href="expertise.html?focus=feasibility" data-route="expertise" class="service-overview-card"><span>04 / EARLY DEVELOPMENT THINKING</span><h3>Site feasibility & planning advice.</h3><p>Understand a site's potential, the obstacles worth resolving and the investigations that matter first.</p><b aria-hidden="true">${lineArrow}</b></a>
 </div><p class="services-overview-note">When a proposal needs architectural drawings or specialist input, <a href="#project-coordination" class="inline-coordination-link">explore how we coordinate the right team ${lineArrow}</a>.</p></div></section>
<section class="team-coordination" id="project-coordination"><div class="shell team-coordination-inner"><div><span>PLANNING-LED / COLLABORATIVE DELIVERY</span><h2>ONE PROJECT.<br><em>THE RIGHT EXPERTISE.</em></h2><img class="kova-drawing-img" src="assets/study-parcels.svg" loading="lazy" alt="Conceptual land-parcel study in fine linework"></div><div><p>Considered development is collaborative. KOVA can help identify and coordinate the architectural, surveying and engineering expertise a project needs, keeping design decisions connected to the planning pathway.</p><p>From the first brief through drawings, assessments and council submissions, our role is to keep the relevant questions and inputs aligned.</p>${A('approach','See how the process works','text-link')}</div></div></section>
<section class="tools-intro"><div class="shell"><span>EXPLORE / THE PLANNING LANDSCAPE</span><h2>THE DETAIL<br><em>BEHIND THE DECISION.</em></h2><p>Move from broad planning questions to the details that can shape an application.</p></div></section>
<section class="expertise-index" aria-label="Explore expertise sections"><div class="shell expertise-index-inner"><span>EXPLORE THIS PAGE</span><a href="#consent-explorer">01 / Consent explorer <svg class="kova-line-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path d="M7 25L25 7M10 7h15v15"/></svg></a><a href="#anatomy-of-consent">02 / Anatomy <svg class="kova-line-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path d="M7 25L25 7M10 7h15v15"/></svg></a></div></section>
<section class="knowledge-section" id="consent-explorer"><div class="shell">${sectionHead('03','CONSENT EXPLORER','INTERACTIVE / SELECT A TOPIC')}<div class="section-intro knowledge-intro"><h2>LEARN THE<br><span>LANDSCAPE.</span></h2><p>Understand how different approvals work and what they may mean for a proposal.</p></div>
  <div class="topic-nav" role="tablist" aria-label="Explore planning topics">${Object.entries(topicContent).map(([id,t])=>`<button type="button" role="tab" class="topic-tab ${id==='resource'?'active':''}" data-topic="${id}" aria-selected="${id==='resource'?'true':'false'}" aria-controls="topic-viewport"><small>${t.num}</small><span>${t.title}</span><b><svg class="kova-line-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path d="M7 25L25 7M10 7h15v15"/></svg></b></button>`).join('')}</div>
  <div id="topic-viewport" role="tabpanel" tabindex="0" aria-live="polite">${topicPanel('resource')}</div>
</div></section>
<section class="scenario-section"><div class="shell">${sectionHead('04','SCENARIO EXPLORER','THINK IN QUESTIONS, NOT ASSUMPTIONS')}<div class="scenario-header"><h2>WHAT ARE YOU<br><span>CONSIDERING?</span></h2><p>Start with your idea. Explore the questions that could shape its design, timing and approval pathway.</p></div><div class="scenario-selector" role="group" aria-label="Explore project types">${Object.entries(consentScenarios).map(([key,x])=>`<button type="button" data-scenario="${key}" class="scenario-option ${key==='newhome'?'active':''}" aria-pressed="${key==='newhome'}"><span>${x.n}</span><strong>${x.label}</strong><b><svg class="kova-line-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path d="M7 25L25 7M10 7h15v15"/></svg></b></button>`).join('')}</div><div id="scenario-viewport" class="scenario-viewport" aria-live="polite">${scenarioPanel('newhome')}</div></div></section>
<section class="anatomy-section" id="anatomy-of-consent"><div class="shell">${sectionHead('05','ANATOMY OF A CONSENT','AN INTERACTIVE TECHNICAL STUDY')}<div class="anatomy-intro"><h2>THE WHOLE<br>PICTURE IS IN<br><em>THE DETAIL.</em></h2><p>A consent application rests on decisions, evidence and context — not paperwork alone. Explore the elements of a considered assessment.</p></div><div class="anatomy-board"><div class="anatomy-drawing"><div class="anatomy-drawing-meta"><span>FIG. 02 / ANATOMY OF A CONSENT</span><span>LAND / RULES / EVIDENCE</span></div>${anatomySvg()}<div class="anatomy-drawing-bottom"><span>PLANNING ASSESSMENT / 01—07</span><span>SELECT 01—07 TO EXPLORE</span></div></div><div class="anatomy-reading"><div class="anatomy-parts" role="group" aria-label="Consent assessment topics">${anatomyNodes.map((x,i)=>`<button class="anatomy-part ${i===0?'active':''}" data-anatomy="${i}" aria-pressed="${i===0}"><span>${x.n}</span><strong>${x.short}</strong><b><svg class="kova-line-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path d="M7 25L25 7M10 7h15v15"/></svg></b></button>`).join('')}</div><div class="anatomy-detail" id="anatomy-detail" aria-live="polite">${anatomyPanel(0)}</div></div></div><div class="anatomy-bottom-note"><p>Every proposal calls for its own assessment of rules, site conditions and effects.</p></div></div></section>
<section class="knowledge-bridge"><div class="shell knowledge-bridge-inner"><div><span>NEED THE BASICS FIRST?</span><h2>ONE QUESTION<br>AT A TIME.</h2><p>For the fundamentals behind each decision, explore our concise Planning Explained guides.</p></div>${A('insights','Explore Planning Explained','text-link')}</div></section>
`;}

const approachStages = [
 {n:'01',name:'Discover',title:'Understand the brief.',lead:'A defined problem is easier to solve.',detail:'Clarify what you want to do, what decisions are being made and which site information is available. The first conversation should expose uncertainties before they become project costs.',items:['Proposed use, scale and desired outcomes','Property address, ownership and existing information','Timing, budget assumptions and decision points'],client:'Your goal, site address, any sketches, title or existing consent documents.',scope:'Structure the initial questions; agree what is in scope and what requires separate specialist advice.',deliverable:'Project brief and an initial information-request list.',specialists:'A designer, architect or solicitor may be useful at this stage, depending on the question.'},
 {n:'02',name:'Verify',title:'Establish the site context.',lead:'Check the framework before testing options.',detail:'Review the planning instruments relevant to the site and proposal. Mapping is a starting point, not proof that a hazard, rule or restriction does or does not apply.',items:['Current planning zones, overlays and designations','Title interests, existing consents and site records','Mapped hazards, access, infrastructure and gaps'],client:'Available title, survey and property reports; authorisation to request records where needed.',scope:'Identify relevant planning provisions, potential information gaps and consultation points.',deliverable:'A site context and constraints summary, with assumptions and sources recorded.',specialists:'Surveyor, lawyer, civil engineer or geotechnical specialist when the site warrants them.'},
 {n:'03',name:'Test',title:'Explore feasible pathways.',lead:'An informed option beats an expensive assumption.',detail:'Consider whether the intended activity may be permitted, require a resource consent, or need a different design pathway. A feasibility view identifies questions to resolve; it is not an approval forecast.',items:['Activity status and consent triggers','Development standards and possible infringements','Potential environmental effects and design responses'],client:'Concept dimensions, use details and practical project priorities.',scope:'Compare planning pathways and flag effects or constraints needing more analysis.',deliverable:'Options and risk register with next investigations.',specialists:'Architectural, transport, stormwater, ecology or other experts as relevant.'},
 {n:'04',name:'Develop',title:'Build the assessment.',lead:'The story should follow the evidence.',detail:'Translate the preferred design into a clear planning case. Where resource consent is required, prepare proportionate environmental-effects assessment and consider objectives, policies and assessment criteria applicable at lodgement.',items:['Description of activity and existing environment','Rules and policy assessment','Effects, mitigation and possible conditions'],client:'Updated drawings, project specifications and other confirmed proposal information.',scope:'Prepare planning components and identify evidence needed to support statements.',deliverable:'Draft planning assessment and AEE framework, tailored to the proposal.',specialists:'Technical effects must be supported by appropriately qualified specialists where required.'},
 {n:'05',name:'Coordinate',title:'Align every supporting input.',lead:'One coherent submission is better than disconnected reports.',detail:'Check consistency between site plans, written descriptions, planning assessments and specialist reports. Building consent design, engineering and legal matters remain the responsibility of appropriately qualified professionals.',items:['Consistency of drawings, scales and description','Specialist findings and proposed mitigation','Outstanding matters and documentation checks'],client:'Current design set, specialist reports and decisions on design changes.',scope:'Coordinate information and check planning narrative against supporting documents.',deliverable:'Consolidated application pack and outstanding-items register.',specialists:'Architect, surveyor, engineer, arborist, traffic or other consultants as required.'},
 {n:'06',name:'Lodge',title:'Submit with clarity.',lead:'Completeness supports a smoother assessment.',detail:'Where instructed, compile and lodge relevant resource consent documentation through the appropriate council process. Council checks completeness and may request more information or further documentation.',items:['Correct forms, plans and applicant details','AEE and required supporting assessments','Council completeness queries and fees'],client:'Applicant authorisations, final plans, required signatures and council fees.',scope:'Coordinate lodgement information and maintain a clear application record.',deliverable:'Lodged resource consent application and document register, where included in the agreed scope.',specialists:'Building consent applications require their own building-design team and approval pathway.'},
 {n:'07',name:'Respond',title:'Navigate what follows.',lead:'A decision is a milestone, not a guarantee.',detail:'During council assessment, questions, further-information requests, notification issues or conditions may arise. The response should be evidence-led and proportionate. Council remains responsible for consent decisions.',items:['Requests for further information and clarifications','Conditions, design responses and decisions','Any next approvals or implementation matters'],client:'Timely project decisions and instructions to specialist contributors.',scope:'Prepare planning responses, coordinate updated information and explain council outcomes.',deliverable:'Response record and a practical next-steps summary.',specialists:'Legal, engineering, building compliance or monitoring inputs may be required after a decision.'}
];
function stagePanel(i){let s=approachStages[i];return `<div class="stage-content stage-v04" data-stage-panel="${i}"><div class="stage-main"><span class="stage-num">${s.n} / 07 — THE PLANNING JOURNEY</span><h3>${s.title}</h3><p class="stage-lead">${s.lead}</p><p>${s.detail}</p><div class="stage-examines"><span>KEY CONSIDERATIONS</span><ul>${s.items.map(t=>`<li>${t}</li>`).join('')}</ul></div></div><div class="stage-side stage-deliverables"><div class="stage-diagram-head"><span>FIELD NOTES / ${s.n}</span><span>KOVA</span></div><div class="technical-illustration"><span class="technical-cross cross-a">+</span><span class="technical-cross cross-b">+</span><div class="technical-ring"><span>${s.n}</span></div><div class="technical-line line-a"></div><div class="technical-line line-b"></div><span class="technical-caption">KOVA / PROCESS STUDY</span></div><div class="stage-meta-block"><span>WHAT THE CLIENT PROVIDES</span><p>${s.client}</p></div><div class="stage-meta-block"><span>PLANNING SUPPORT</span><p>${s.scope}</p></div><div class="stage-meta-block"><span>TYPICAL OUTPUT</span><p>${s.deliverable}</p></div><div class="stage-meta-block"><span>OTHER PROFESSIONALS</span><p>${s.specialists}</p></div></div></div><div class="stage-controls"><button type="button" data-stage-prev="${Math.max(0,i-1)}" ${i===0?'disabled':''}>← PREVIOUS STAGE</button><div class="stage-progress" aria-label="Stage ${i+1} of 7"><span style="width:${(i+1)/approachStages.length*100}%"></span></div><button type="button" data-stage-next="${Math.min(i+1,approachStages.length-1)}" ${i===approachStages.length-1?'disabled':''}>NEXT STAGE →</button></div>`;}

function approach(){return `<section class="internal-hero approach-hero"><div class="shell">${eyebrow('03','OUR APPROACH','THOUGHTFUL BY DESIGN')}<div class="internal-headline"><h1>GOOD DECISIONS<br>BEGIN WITH<br><em>CLEAR THINKING.</em></h1><p>Good projects move forward when complex questions become clear decisions, made in the right order.</p></div><div class="internal-hero-footer"><span>STRUCTURE / CLARITY / CONTEXT</span><span>07 STAGES ↓</span></div></div></section>
<section class="approach-intro page-section"><div class="shell">${sectionHead('01','OUR METHOD','FROM UNCERTAINTY TO DIRECTION')}<div class="large-quote"><span>“</span><p>Understand the place.<br>Interrogate the possibilities.<br><em>Make the next move count.</em></p></div><div class="approach-intro-note"><p>Planning brings evidence, regulation and ambition into the same conversation. Each stage should make the next decision clearer.</p><img class="kova-drawing-img" src="assets/study-contours.svg" loading="lazy" alt="Conceptual site contours in fine linework"></div></div></section>
<section class="stages-section"><div class="shell">${sectionHead('02','SEVEN STAGES','INTERACTIVE / SELECT A STAGE')}<div class="stages-heading"><h2>A PROCESS WITH<br><span>PURPOSE.</span></h2><p>From the first conversation to council assessment, each stage has a purpose. Explore how the process unfolds and what it asks of the project.</p></div><div class="stage-tabs" role="tablist" aria-label="Planning process stages">${approachStages.map((x,i)=>`<button role="tab" type="button" data-stage="${i}" aria-selected="${i===0?'true':'false'}" class="stage-tab ${i===0?'active':''}"><small>${x.n}</small><span>${x.name}</span></button>`).join('')}</div><div id="stage-viewport" role="tabpanel" aria-live="polite">${stagePanel(0)}</div></div></section>
<section class="process-trust"><div class="shell process-trust-inner"><div><span>WHAT TO EXPECT</span><h2>NO FALSE<br>PROMISES.<br><em>CLEARER DECISIONS.</em></h2></div><div><p>Clarity is built deliberately: by knowing what is established, what remains uncertain and who is best placed to resolve it.</p><p>When a proposal needs drawings, surveying or engineering, we help coordinate appropriate specialists around the planning programme.</p>${A('expertise?view=coordination','Explore project coordination','text-link')}</div></div></section>
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
 ],sources:[[sourceLinks.resources,'Ministry for the Environment — Resource consent guide'],[sourceLinks.building,'MBIE — Building consent guidance']],next:['expertise?focus=building','Explore the two approval pathways']},
 aee:{n:'04',kind:'ENVIRONMENTAL EFFECTS',title:'What does an AEE actually explain?',sub:'A clear account of a proposal and the effects it may create.',intro:'An Assessment of Environmental Effects (AEE) is not simply a formality. It helps explain a proposed activity, what it might change, and how relevant adverse effects will be addressed.',blocks:[
  ['01 / THE PROPOSAL AND ITS CONTEXT','An AEE starts with a clear description of what is proposed and the environment where it would occur. The questions depend on the activity, site conditions and applicable planning framework.'],
  ['02 / THE EFFECTS','Relevant effects might involve neighbouring amenity, traffic, earthworks, stormwater, landscape, ecological or other matters. The effects considered must be appropriate to the proposal and current statutory requirements.'],
  ['03 / THE RESPONSE','An assessment identifies appropriate measures to avoid, remedy or mitigate adverse effects and refers to relevant plans and policies. Technical evidence may be needed from engineers or other specialists.'],
  ['04 / THE RIGHT LEVEL OF DETAIL','The extent of assessment should reflect the proposal and applicable requirements. A short, straightforward proposal does not call for the same evidence as a complex development.']
 ],sources:[[sourceLinks.resources,'Ministry for the Environment — Application and AEE guidance'],[sourceLinks.aucklandChecklist,'Auckland Council — Application checklist']],next:['expertise?view=anatomy','Explore the anatomy of a consent']},
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
  ['02 / SEPARATE THE TWO EXEMPTION TESTS','The 2026 building consent exemption can apply to qualifying new standalone, single-storey dwellings up to 70 m². The national environmental standard for detached minor residential units provides a separate resource-consent permitted pathway where its conditions are met. One exemption does not establish the other.'],
  ['03 / DESIGN, SERVICES AND NOTICES STILL MATTER','Even exempt building work must comply with the Building Code and relevant conditions. The granny-flat pathway involves licensed professionals, a project information memorandum before work and completion documentation; infrastructure and development contributions may also arise.'],
  ['04 / CHECK THE SITE BEFORE CHOOSING A PATH','Access, hazards, stormwater, wastewater, service capacity, title constraints and other planning provisions can change what is feasible. Confirm the specific pathway before commissioning final drawings or construction.']
 ],sources:[['https://www.building.govt.nz/projects-and-consents/planning-a-successful-build/scope-and-design/building-a-granny-flat-resources/homeowners','MBIE — Granny flat guidance updated October 2026'],['https://www.planning.govt.nz/implementation-and-guidance/transitional-consenting/national-direction-changes-that-affect-consenting/','Planning.govt.nz — Detached minor residential unit standards']],next:['expertise?focus=feasibility','Explore the site feasibility questions']},
 documents:{n:'08',kind:'PREPARING AN APPLICATION',title:'What plans and reports will I need?',sub:'The drawings, evidence and specialists behind a sound application.',intro:'A well-prepared consent application explains the proposal clearly enough for the right questions to be assessed. What is required depends on the site, the activity and the effects that need to be considered.',blocks:[
  ['01 / START WITH ACCURATE SITE INFORMATION','Establish property boundaries, existing buildings, access, title interests, relevant planning provisions and any known hazards. A property file, record of title and appropriate site measurements can avoid design assumptions becoming application problems.'],
  ['02 / SHOW WHAT WILL CHANGE','Site and floor plans, elevations, earthworks details, servicing layouts or subdivision drawings may be needed. Appropriate design or drafting professionals prepare the drawings; the required level of detail is driven by the proposal and the consent pathway.'],
  ['03 / EXPLAIN THE PLANNING CASE','Applications under the RMA commonly include an Assessment of Environmental Effects and a planning assessment against relevant provisions. The scope should address matters the law permits the decision-maker to consider and be proportionate to the proposal.'],
  ['04 / BRING IN SPECIALISTS WHERE THEY ADD VALUE','An engineer, surveyor, transport adviser, arborist, ecologist or other expert may need to provide evidence. The goal is not to commission every report, but to identify which inputs genuinely support informed decisions and a complete application.']
 ],sources:[['https://environment.govt.nz/publications/applying-for-a-resource-consent/consent-process/','Ministry for the Environment — Preparing an application'],['https://environment.govt.nz/guides/making-an-application-for-resource-consent/','Ministry for the Environment — Application guidance']],next:['expertise?view=coordination','How KOVA coordinates the right project inputs']},
 neighbours:{n:'09',kind:'PEOPLE & EFFECTS',title:'Will my neighbours need to approve?',sub:'Affected persons, written approvals and notification explained.',intro:'Neighbours are an important part of a place, but not every consent application requires their signature. Whether written approval or notification is relevant depends on the proposal, the current legal tests and how the council assesses effects.',blocks:[
  ['01 / APPROVAL IS NOT AUTOMATIC','A neighbour being nearby does not itself mean written approval is legally necessary. The council determines who may be affected and whether notification is required under the applicable statutory framework.'],
  ['02 / THE THREE NOTIFICATION PATHS','An application may be non-notified, limited notified to affected parties, or publicly notified. The tests depend on planning rules, national direction, adverse effects that may lawfully be considered and relevant notification provisions.'],
  ['03 / WHAT WRITTEN APPROVAL MEANS','When a person gives valid written approval, the council generally disregards effects on that person for relevant consent decisions. Those being asked to approve should understand the proposal and its effects; approval should not be treated as a casual signature.'],
  ['04 / ENGAGE THOUGHTFULLY, NOT AUTOMATICALLY','Good neighbour communication can resolve misunderstandings before they become project disputes. That is different from assuming every proposal requires consultation or that obtaining approval guarantees a consent outcome.']
 ],sources:[['https://environment.govt.nz/guides/getting-involved-in-the-resource-consent-process/','Ministry for the Environment — Affected parties and notification'],['https://www.planning.govt.nz/implementation-and-guidance/transitional-consenting/changes-to-the-rma/','Planning.govt.nz — Transitional RMA changes']],next:['expertise?focus=resource','Explore the planning assessment pathway']},
 timecost:{n:'10',kind:'PROJECT REALITIES',title:'How long will consent take, and what will it cost?',sub:'What affects council processing, fees and project programmes.',intro:'Time and cost depend on far more than the application form. A clear early brief can help identify the investigations, design work and council steps likely to shape the programme.',blocks:[
  ['01 / SEPARATE PREPARATION FROM PROCESSING','Before lodgement there may be planning reviews, drawings, specialist reports and consultations. Council statutory processing periods are not the whole project programme and should not be presented as a guaranteed completion date.'],
  ['02 / KNOW WHAT CAN PAUSE THE CLOCK','Under the current transitional RMA pathway, a standard non-notified consent commonly has a statutory 20-working-day processing timeframe, but information requests, extensions and notification can alter the elapsed time. More complex or notified proposals can take considerably longer.'],
  ['03 / BUDGET FOR DIFFERENT COST TYPES','A project can involve consultant fees, council deposits and processing charges, technical reports, application revisions and potential development contributions or engineering works. Auckland Council generally charges actual processing time against deposits rather than offering one fixed price for all applications.'],
  ['04 / REDUCE AVOIDABLE UNCERTAINTY','Check the site early, settle the project scope, identify necessary specialists and lodge an adequately supported application. Even careful preparation cannot guarantee council timing or approval, but it can make the next decisions less speculative.']
 ],sources:[['https://environment.govt.nz/publications/applying-for-a-resource-consent/timeframes/','Ministry for the Environment — Statutory processing timeframes'],['https://www.aucklandcouncil.govt.nz/en/building-and-consents/resource-consents/resource-consent-fees-deposits.html','Auckland Council — Resource consent fees and deposits']],next:['approach','Explore how the KOVA planning process works']}

};
function insightListing(){return `<div class="explainers-intro"><span>FIELD NOTES / 01—10</span><p>Start with the question in front of you. Each guide offers a clear foundation and a considered next step.</p></div><div class="insights-grid explainer-grid">${Object.entries(guides).map(([key,g])=>`<button class="insight-card" type="button" data-guide="${key}" aria-label="Read ${g.title}"><small>${g.n} / ${g.kind}</small><h3>${g.title}</h3><p>${g.sub}</p><span>READ EXPLAINER ${lineArrow}</span></button>`).join('')}</div>`;}
function guideMarkup(key){const g=guides[key];return `<article class="full-article explainer-detail"><button type="button" class="article-back" data-back-guides>← BACK TO ALL EXPLAINERS</button><header><span>PLANNING EXPLAINED / ${g.kind}</span><h2>${g.title}</h2><p>${g.sub}</p></header><div class="article-body"><div><span>THE QUESTION</span><p>${g.intro}</p></div><div>${g.blocks.map(b=>`<section><h3>${b[0]}</h3><p>${b[1]}</p></section>`).join('')}<section class="explainer-next" aria-label="Related planning service">${A(g.next[0],g.next[1],'text-link')}</section></div></div></article>`;}
function insights(){return `<section class="internal-hero insights-hero"><div class="shell">${eyebrow('04','INSIGHTS','PLANNING EXPLAINED')}<div class="internal-headline"><h1>PLANNING,<br><em>EXPLAINED.</em></h1><p>Practical explanations for the questions that shape land, development and what comes next.</p></div><div class="internal-hero-footer"><span>FIELD NOTES / CLEARER DECISIONS</span><span>EXPLORE THE GUIDES ↓</span></div></div></section>
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
 <div class="about-body"><h2>UNDERSTAND THE<br><em>POSSIBILITIES.</em></h2><p>I founded KOVA Planning Co. to bring that curiosity and considered perspective into the planning and development process.</p><p>Every site sits between opportunity and constraint. Its potential can only be understood by considering the planning framework, environment, infrastructure, practical construction questions and the people a project may affect.</p><p>Through planning advice, feasibility considerations, environmental assessments and consenting support, KOVA aims to make those relationships clearer — helping clients recognise opportunities, understand challenges and make better-informed decisions. Where needed, that also means bringing the right independent design and technical expertise into the conversation.</p><p>Because good planning is more than permission. It is asking better questions before shaping what comes next.</p></div>
</div></section>
<section class="about-future"><div class="shell">${sectionHead('04','THE FUTURE','A BELIEF IN THOUGHTFUL GROWTH')}<div class="about-future-inner"><span>SHAPING WHAT COMES NEXT.</span><h2>THE FUTURE IS NOT SIMPLY SOMETHING WE INHERIT. <em>IT IS SOMETHING WE SHAPE.</em></h2><p>For me, KOVA is an opportunity to contribute to the places, industries and communities of tomorrow — turning curiosity into clear thinking, and aspirations into considered decisions.</p>${A('approach','Explore our approach','text-link')}</div></div></section>
`;}

function contact(){return `<section class="internal-hero contact-hero"><div class="shell">${eyebrow('06','CONTACT','START A CONVERSATION')}<div class="internal-headline"><h1>WHAT'S YOUR<br><em>NEXT MOVE?</em></h1><p>Every project begins with an ambition and a few important questions. Tell us what you are considering.</p></div><div class="internal-hero-footer"><span>AUCKLAND / AOTEAROA NEW ZEALAND</span><span>ENQUIRE BELOW ↓</span></div></div></section>
<section class="contact-section page-section"><div class="shell">${sectionHead('01','PROJECT ENQUIRY','THE STARTING POINT')}<div class="contact-layout"><div class="contact-message"><h2>LET'S MAKE<br>IT <span>CLEAR.</span></h2><p>Every idea begins somewhere. Tell us about the place, the possibility and the questions you are working through, so the next step can be considered with clarity.</p><div class="contact-aside"><span>HELPFUL DETAILS</span><ul><li>Where is the site?</li><li>What are you looking to do?</li><li>What decision or approval are you unsure about?</li><li>Are there plans or existing documents?</li></ul></div><p class="contact-aside-note">Share the essentials to prepare a clear project brief you can review and save.</p></div>
<form id="enquiry-form" class="contact-form">
 <div class="form-pair"><label><span>01 / YOUR NAME *</span><input name="name" autocomplete="name" placeholder="Full name" required maxlength="120"></label><label><span>02 / EMAIL ADDRESS *</span><input name="email" type="email" autocomplete="email" placeholder="you@example.com" required maxlength="200"></label></div>
 <div class="form-pair"><label><span>03 / CONTACT NUMBER</span><input name="phone" type="tel" autocomplete="tel" placeholder="Optional" maxlength="40"></label><label><span>04 / PROJECT LOCATION</span><input name="location" placeholder="Street, suburb or region" maxlength="250"></label></div>
 <div class="kova-field"><span class="kova-field-label" id="service-label">05 / WHAT DO YOU NEED HELP WITH? *</span><select name="service" id="service-native" required aria-labelledby="service-label"><option value="" disabled selected>Select a service</option><option>Resource consent</option><option>Building consent coordination</option><option>Architectural drawings & consultant coordination</option><option>Assessment of Environmental Effects</option><option>Site feasibility</option><option>Development planning advice</option><option>General Inquiries</option></select></div>
 <label><span>06 / TELL US ABOUT YOUR PROJECT *</span><textarea name="message" placeholder="What are you planning, and what would you like to understand?" rows="5" required maxlength="4000"></textarea></label>
 <label class="consent-check"><input type="checkbox" name="ack" required><span>I understand that this prepares a draft for my review; it does not send an enquiry.</span></label>
 <button class="btn btn-dark form-submit" type="submit">Prepare my enquiry <span><svg class="kova-line-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path d="M7 25L25 7M10 7h15v15"/></svg></span></button><p class="form-under">Your enquiry stays on this device unless you choose to share the draft. It is not sent automatically. <a href="privacy.html">How we handle information</a>. Required fields marked *.</p>
 </form></div></div></section>`;}


// V06 maintains real-page navigation, clearer services, About, and an editorial Insights layout.
// V05 fixes the in-page anchor/hash collision that previously jumped visitors back Home.
// Chapter gateways replace generic "Next page" buttons: headings + arrow, with a clear destination.
const chapterGateways = {
  home:{to:'expertise',num:'02',title:'EXPERTISE.',note:'Explore the services that help turn possibility into a practical plan.'},
  expertise:{to:'approach',num:'03',title:'OUR APPROACH.',note:'Understand what happens when you work with KOVA.'},
  approach:{to:'about',num:'05',title:'ABOUT.',note:'Meet the perspective behind KOVA.'},
  insights:{to:'expertise',num:'02',title:'EXPERTISE.',note:'See how planning knowledge becomes practical project advice.'},
  about:{to:'expertise',num:'02',title:'EXPERTISE.',note:'See how that perspective informs the work.'},
  contact:{to:'home',num:'01',title:'HOME.',note:'Return to KOVA Planning Co.'}
};
function gateway(page){const g=chapterGateways[page];if(!g)return '';return `<section class="chapter-gateway" aria-label="Explore ${g.to}"><a href="${routeFile(g.to)}" data-route="${g.to}" class="chapter-gateway-link"><div class="shell chapter-gateway-inner"><div class="chapter-gateway-upper"><span>KOVA / ${g.num} — 06</span><span><svg class="kova-line-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path d="M7 25L25 7M10 7h15v15"/></svg></span></div><div class="chapter-gateway-title"><h2>${g.title}</h2><span class="chapter-gateway-arrow" aria-hidden="true"><svg class="kova-line-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path d="M7 25L25 7M10 7h15v15"/></svg></span></div><p>${g.note}</p></div></a></section>`;}

function privacy(){return `<section class="internal-hero privacy-hero">
 <div class="shell">
  <div class="eyebrow-row"><span>KOVA / PRIVACY</span><span>WEBSITE INFORMATION</span></div>
  <div class="internal-headline"><h1>PRIVACY,<br><em>WITH PURPOSE.</em></h1><p>Clear information about what happens when you visit KOVA, prepare a project enquiry or get in touch.</p></div>
  <div class="internal-hero-footer"><span>NEW ZEALAND / PRIVACY ACT 2020</span><span>REVIEWED 05 NOVEMBER 2026</span></div>
 </div>
</section>
<section class="privacy-content page-section" id="privacy-statement">
 <div class="shell">
  <div class="section-label"><span>01 / PRIVACY STATEMENT</span><span>KOVA PLANNING CO.</span></div>
  <div class="privacy-opening"><h2>YOUR INFORMATION<br><span>MATTERS.</span></h2><p>Planning involves people, places and important decisions. We believe the handling of personal information deserves the same clarity and care. This statement explains our website's current operation and how information may be handled when you correspond with KOVA outside the website.</p></div>
  <div class="privacy-chapters">
   <section class="privacy-chapter" id="privacy-identity"><div class="privacy-chapter-label"><span>01 / WHO WE ARE</span></div><div><h3>KOVA Planning Co.</h3><p>KOVA Planning Co. is a founder-led planning consultancy based in Auckland, New Zealand. This statement covers visits to our website and personal information that may be received when people make enquiries or engage with us through separate communication channels.</p></div></section>
   <section class="privacy-chapter" id="privacy-visiting"><div class="privacy-chapter-label"><span>02 / VISITING THE WEBSITE</span></div><div><h3>What happens when you browse.</h3><p>Our site is hosted using GitHub Pages. GitHub states that it logs visitors' IP addresses for security purposes. That hosting activity is separate from KOVA collecting a project enquiry. For details of GitHub's practices, see <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" target="_blank" rel="noopener noreferrer">GitHub's privacy statement</a>.</p><p>KOVA has not installed a separate website analytics service, advertising trackers or an online marketing signup system. The site serves its Space Grotesk and Instrument Sans typefaces directly from KOVA's GitHub Pages host. No separate Google Fonts connection is required. An optional smooth-scrolling library is loaded through unpkg; your browser may send that provider technical connection information, including your IP address, when requesting its script. The local enquiry draft is not transmitted to either provider. We will update this statement if our services change.</p></div></section>
   <section class="privacy-chapter" id="privacy-enquiries"><div class="privacy-chapter-label"><span>03 / PROJECT ENQUIRIES</span></div><div><h3>Drafted here. Not automatically sent.</h3><p>The current project enquiry form asks for your name, email address, optional telephone number, site location, service and project details. It prepares a draft locally in your browser that you can copy or download. Submitting this form does <strong>not</strong> transmit an enquiry to KOVA, a mailing list or a website database.</p><p>Any copy or downloaded file is controlled by you and your device. If you choose to share that draft through a separate email or messaging service, the privacy terms of that service may also apply.</p></div></section>
   <section class="privacy-chapter" id="privacy-contact"><div class="privacy-chapter-label"><span>04 / DIRECT CORRESPONDENCE</span></div><div><h3>When you contact KOVA directly.</h3><p>If you communicate with KOVA outside this website, we may receive contact details and the project information you choose to provide. That information may be used to understand your enquiry, assess the requested services, communicate about a project, coordinate appropriate specialist inputs and maintain necessary business records.</p><p>Providing information for an initial enquiry is generally voluntary, but without enough detail we may not be able to assess or respond meaningfully to the request.</p></div></section>
   <section class="privacy-chapter" id="privacy-sharing"><div class="privacy-chapter-label"><span>05 / SHARING &amp; SECURITY</span></div><div><h3>Only where there is a reason.</h3><p>Planning work can involve architectural designers, surveyors, engineers, councils and other specialists. Where appropriate for a project, relevant information may need to be shared with those involved, with suitable regard to the purpose of the work, confidentiality and applicable law.</p><p>We aim to limit access to information to those who need it, take reasonable steps to protect it, and retain it no longer than needed for legitimate purposes and legal obligations. No online method of communication is entirely risk-free; avoid sending sensitive documents unless an appropriate channel has been agreed.</p></div></section>
   <section class="privacy-chapter" id="privacy-rights"><div class="privacy-chapter-label"><span>06 / YOUR RIGHTS</span></div><div><h3>Access, correction and questions.</h3><p>Under New Zealand's Privacy Act 2020, you can ask to access personal information an organisation holds about you and ask for it to be corrected if inaccurate. If you have already communicated with KOVA, please use that existing correspondence channel to make an access, correction or privacy enquiry.</p><p><strong>Current website limitation:</strong> the online enquiry form only creates a draft; it cannot deliver privacy requests to us. We will publish a direct privacy contact channel when online enquiries are activated. In the meantime, do not assume a message has been received merely because you completed the website form.</p><p>You can learn more about your rights through the <a href="https://www.privacy.org.nz/your-rights/your-privacy-rights/" target="_blank" rel="noopener noreferrer">Office of the Privacy Commissioner</a>.</p></div></section>
   <section class="privacy-chapter" id="privacy-changes"><div class="privacy-chapter-label"><span>07 / UPDATES</span></div><div><h3>Keeping this current.</h3><p>We will review this statement when website functionality or personal information practices change. A connected online enquiry service, new analytics or different providers would require this statement to be updated before launch.</p><p class="privacy-date">LAST REVIEWED / 09 NOVEMBER 2026</p></div></section>
  </div>
  <div class="privacy-return"><a href="contact.html" data-route="contact">See how to prepare an enquiry <svg class="kova-line-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true"><path d="M7 25L25 7M10 7h15v15"/></svg></a><span>SHAPING WHAT COMES NEXT.</span></div>
 </div>
</section>`; }

const renderers = {home,expertise,approach,insights,about,contact,privacy};
const titles = {home:'Shaping What Comes Next',expertise:'Expertise',approach:'Our Approach',insights:'Insights',about:'About',contact:'Contact',privacy:'Privacy'};
const parseRoute = () => {let file=location.pathname.split('/').pop() || 'index.html';let name=file==='index.html'?'home':file.replace(/\.html$/,'');return {page:pages.includes(name)?name:'home',query:new URLSearchParams(location.search)};};
// On mobile the drawer must be a viewport overlay, not an absolutely positioned child of a sticky header.
// Moving it out of the header also prevents iOS from attaching it to the header's original document position.
document.body.appendChild(mobileMenu);
const updateMobileMenuPosition = () => {
  const header=document.getElementById('header');
  const bottom=header.getBoundingClientRect().bottom;
  mobileMenu.style.setProperty('--kova-menu-top', `${Math.max(0, Math.min(window.innerHeight, bottom))}px`);
};
const closeMenu = () => {mobileMenu.hidden=true;menuBtn.setAttribute('aria-expanded','false');menuBtn.setAttribute('aria-label','Open navigation');document.body.classList.remove('menu-open');};
const updateNav = page => {document.querySelectorAll('a[data-route]').forEach(el=>{let act=el.dataset.route===page;el.classList.toggle('is-current',act);if(act)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current')}); document.getElementById('utility-current').textContent=page==='privacy'?'INFO / PRIVACY':`${String(pages.indexOf(page)+1).padStart(2,'0')} / 06 — ${titles[page].toUpperCase()}`; document.getElementById('header-page-name').textContent=titles[page].toUpperCase(); document.title=`${titles[page]} — KOVA Planning Co.`;};
function mount(page,query){
  // Content is mounted only after outgoing motion has made it invisible.
  // Reset once, without an animated scroll-to-top that competes with the fade.
  document.documentElement.style.scrollBehavior='auto';
  ROOT.innerHTML=renderers[page]()+gateway(page);
  ROOT.setAttribute('data-page',page);
  currentPage=page;updateNav(page);
  scrollToTop(true);
  document.documentElement.scrollTop=0;document.body.scrollTop=0;
  closeMenu();
  setupReveals();
  if(page==='expertise'){
    const key=query.get('focus');
    if(key&&topicContent[key])selectTopic(key,true,true);
    const view=query.get('view');
    if(view==='anatomy'||view==='coordination'){
      scrollToTarget(document.getElementById(view==='anatomy'?'anatomy-of-consent':'project-coordination'),true);
    }
  }
  if(page==='insights'){
    const key=query.get('guide')||query.get('article');
    if(key&&guides[key])showGuide(key,false,true);
  }
  if(page==='contact')setupForm();
  requestAnimationFrame(()=>{document.documentElement.style.scrollBehavior='';smoothScroll?.resize()});
  updateProgress();
}
function go(){
  const {page,query}=parseRoute();
  if(page===currentPage){
    if(page==='expertise'&&query.has('focus'))selectTopic(query.get('focus'),true);
    if(page==='expertise'&&query.has('view'))scrollToTarget(document.getElementById(query.get('view')==='anatomy'?'anatomy-of-consent':'project-coordination'));
    if(page==='insights'&&(query.has('guide')||query.has('article')))showGuide(query.get('guide')||query.get('article'),true);
    else if(page==='insights'&&guideOpen)backToGuides();
    else if(!query.toString())scrollToTop();
    return;
  }
  if(busy)return;
  busy=true;
  closeMenu();
  const previous=pages.indexOf(currentPage),incoming=pages.indexOf(page);
  const slide=incoming>=previous?18:-18;
  document.documentElement.style.setProperty('--kova-route-x',slide+'px');
  const done=()=>{ROOT.style.opacity='';busy=false;smoothScroll?.start?.();};
  const change=()=>{mount(page,query);smoothScroll?.resize();};
  if(reduceMotion||typeof ROOT.animate!=='function'){
    change();done();return;
  }
  // Two-phase transition rather than a scroll-and-swap while the old page is
  // still visible. This removes the "jitter back to top" on page navigation.
  smoothScroll?.stop?.();
  try{
    const outgoing=ROOT.animate([
      {opacity:1,transform:'translate3d(0,0,0) scale(1)'},
      {opacity:0,transform:'translate3d('+(-slide*.3)+'px,-8px,0) scale(.993)'}
    ],{duration:275,easing:'cubic-bezier(.55,0,.85,.36)',fill:'forwards'});
    outgoing.finished.then(()=>{
      ROOT.style.opacity='0'; // Old page stays invisible during the scroll reset.
      outgoing.cancel();
      try{change()}catch(error){console.warn('KOVA navigation failed',error);done();return;}
      try{
        const arriving=ROOT.animate([
          {opacity:0,transform:'translate3d('+slide+'px,13px,0) scale(.988)'},
          {opacity:1,transform:'translate3d(0,0,0) scale(1)'}
        ],{duration:710,easing:'cubic-bezier(.16,1,.3,1)',fill:'both'});
        ROOT.style.opacity=''; // Snapshot remains hidden by the animation fill.
        arriving.finished.then(()=>{
          arriving.cancel();done();
        },()=>{done()});
      }catch(error){done()}
    },()=>{
      change();done();
    });
  }catch(error){
    change();done();
  }
}
function setupReveals(){if(reduceMotion)return;let targets=ROOT.querySelectorAll('.section-intro,.manifesto-grid,.topic-hero,.three-steps,.large-quote,.legal-grid,.principles-grid,.insights-grid,.anatomy-intro,.anatomy-board,.document-header,.sample-grid,.scenario-header,.home-intelligence-inner,.founder-teaser-inner,.services-overview-head,.insights-preview .insight-teasers,.about-body,.chapter-gateway-inner,.contact-message,.about-drawing,.approach-intro-note,.team-coordination .kova-sketch,.urban-panel');targets.forEach(x=>x.classList.add('reveal'));let io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');io.unobserve(e.target)}}),{threshold:.09,rootMargin:'0px 0px -40px 0px'});targets.forEach(x=>io.observe(x));}
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

function setupForm(){const form=document.getElementById('enquiry-form');if(!form)return;enhanceKovaSelects(form);form.addEventListener('submit',ev=>{ev.preventDefault();if(!form.querySelector('.kova-select')?.kovaValidate())return;if(!form.reportValidity())return;const d=new FormData(form);const summary=['KOVA PLANNING CO. — PROJECT ENQUIRY DRAFT','',`Name: ${safe(d.get('name'))}`,`Email: ${safe(d.get('email'))}`,`Phone: ${safe(d.get('phone'))||'Not provided'}`,`Site: ${safe(d.get('location'))||'Not provided'}`,`Service: ${safe(d.get('service'))}`,'', 'Project details:',safe(d.get('message')),'','Enquiry draft — not sent.','This draft is prepared on your device and is not delivered automatically.'].join('\n'); const dialog=document.getElementById('enquiry-dialog');dialog.setAttribute('data-lenis-prevent','');const body=document.getElementById('enquiry-dialog-body');body.innerHTML=`<div class="dialog-kicker">KOVA / ENQUIRY PREVIEW</div><h2>READY TO<br><em>TAKE THE NEXT STEP.</em></h2><p>We've prepared your project enquiry below. Nothing has been sent or saved online.</p><pre id="draft-text"></pre><div class="dialog-actions"><button type="button" class="btn btn-dark" id="copy-draft">Copy enquiry <span><svg class="kova-line-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path d="M7 25L25 7M10 7h15v15"/></svg></span></button><button type="button" class="btn btn-outline" id="download-draft">Download .txt <span>↓</span></button></div><p id="draft-status" role="status">To send this in future, the live website will need a connected email or enquiry service.</p>`;body.querySelector('#draft-text').textContent=summary;dialog.showModal();body.querySelector('#copy-draft').addEventListener('click',()=>{navigator.clipboard?.writeText(summary).then(()=>{body.querySelector('#draft-status').textContent='Copied. This draft has not been sent.'}).catch(()=>{body.querySelector('#draft-status').textContent='Copy is unavailable in this browser. You can select the enquiry text manually.'})});body.querySelector('#download-draft').addEventListener('click',()=>{let blob=new Blob([summary],{type:'text/plain;charset=utf-8'});let url=URL.createObjectURL(blob);let a=document.createElement('a');a.href=url;a.download='KOVA_Enquiry_Draft.txt';a.click();window.setTimeout(()=>URL.revokeObjectURL(url),5000)});});}
function updateProgress(){let height=document.documentElement.scrollHeight-window.innerHeight;let p=height>0?window.scrollY/height:0;document.getElementById('reading-progress').style.transform=`scaleX(${Math.min(1,Math.max(0,p))})`}
document.addEventListener('click',event=>{const link=event.target.closest('a[data-route]');if(!link||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;event.preventDefault();if(busy)return;const url=new URL(link.href,location.href);if(url.pathname===location.pathname&&url.search===location.search){scrollToTop();closeMenu();return;}history.pushState(null,'',url.pathname+url.search);go();});
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
document.addEventListener('click',ev=>{const inPage=ev.target.closest('a[href^="#"]:not([href^="#/"])');if(inPage){const target=document.getElementById(inPage.getAttribute('href').slice(1));if(target){ev.preventDefault();scrollToTarget(target);document.querySelectorAll('.expertise-index a').forEach(a=>a.classList.toggle('is-active',a===inPage));return;}}const topic=ev.target.closest('[data-topic]');if(topic)selectTopic(topic.dataset.topic,false);const stage=ev.target.closest('[data-stage]');if(stage)selectStage(+stage.dataset.stage);const next=ev.target.closest('[data-stage-next], [data-stage-prev]');if(next)selectStage(+(next.dataset.stageNext ?? next.dataset.stagePrev)); const anatomy=ev.target.closest('[data-anatomy]');if(anatomy)selectAnatomy(+anatomy.dataset.anatomy); const scenario=ev.target.closest('[data-scenario]');if(scenario)selectScenario(scenario.dataset.scenario);const guide=ev.target.closest('[data-guide]');if(guide){history.replaceState(null,'',`insights.html?guide=${guide.dataset.guide}`);showGuide(guide.dataset.guide,true)}if(ev.target.closest('[data-back-guides]'))backToGuides();if(ev.target.closest('[data-close-dialog]'))document.getElementById('enquiry-dialog').close();});
document.getElementById('enquiry-dialog').addEventListener('click',ev=>{if(ev.target.id==='enquiry-dialog')ev.currentTarget.close()});
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
let initial=parseRoute();mount(initial.page,initial.query);
if(location.hash && !location.hash.startsWith('#/'))setTimeout(()=>document.getElementById(location.hash.slice(1))?.scrollIntoView(),150);
