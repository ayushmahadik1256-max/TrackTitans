
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, ArrowUpRight, BellRing, Building2, Check, ChevronDown,
  CircleCheck, Clock3, FileCheck2, Fingerprint, Landmark, LockKeyhole,
  Menu, Shield, ShieldCheck, Sparkles, WalletCards, X,
} from 'lucide-react';

const reveal = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: .65, ease: [.22, 1, .36, 1] } } };
const rise = { hidden: { opacity: 0, y: 18 }, show: (i) => ({ opacity: 1, y: 0, transition: { delay: i * .08, duration: .55 } }) };

function Brand() {
  return <a href="#top" className="tt-brand"><span className="tt-brand-mark"><Shield size={19} strokeWidth={2.4} /><i /></span><span>Track<span>Titans</span></span></a>;
}

function HeroVisual() {
  return <div className="tt-hero-art" aria-label="Illustration of a verified fixed deposit receipt">
    <div className="tt-art-orbit orbit-one" /><div className="tt-art-orbit orbit-two" />
    <div className="tt-art-glow" />
    <motion.div className="tt-fdr-card" animate={{ y: [0, -10, 0], rotate: [-2, 0, -2] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}>
      <div className="tt-fdr-top"><span className="tt-mini-mark"><Landmark size={15} /></span><span>SECURE DEPOSIT <b>•</b> VERIFIED</span><ShieldCheck size={17} /></div>
      <div className="tt-fdr-title">Fixed Deposit<br />Receipt</div>
      <div className="tt-fdr-number">FDR · 4821 · 2025</div>
      <div className="tt-fdr-divider" />
      <div className="tt-fdr-data"><span>DEPOSIT VALUE</span><strong>₹ 24,50,000</strong></div>
      <div className="tt-fdr-data"><span>MATURITY DATE</span><strong>18 Sep 2026</strong></div>
      <div className="tt-fdr-foot"><span className="tt-seal"><LockKeyhole size={17} /></span><span>LIEN MARKED<br /><b>Verified by bank</b></span><span className="tt-stamp">AUTHENTIC</span></div>
    </motion.div>
    <motion.div className="tt-float-chip tt-chip-verified" animate={{ y: [0, -6, 0] }} transition={{ duration: 4, repeat: Infinity }}><span className="tt-chip-icon"><CircleCheck size={17} /></span><span><b>Bank verified</b><small>Just now · SBI</small></span></motion.div>
    <motion.div className="tt-float-chip tt-chip-alert" animate={{ y: [0, 7, 0] }} transition={{ duration: 5, repeat: Infinity }}><span className="tt-chip-icon"><BellRing size={16} /></span><span><b>Maturity reminder</b><small>30 days remaining</small></span></motion.div>
    <div className="tt-art-spark spark-a">✳</div><div className="tt-art-spark spark-b">✦</div>
    <div className="tt-art-base" />
  </div>;
}

const roles = [
  { icon: Building2, title: 'Colleges', eyebrow: 'INSTITUTION', text: 'Register deposits, upload receipts and stay ahead of every maturity date.', color: 'blue', items: ['One place for every FDR', 'Renewal and refund requests'] },
  { icon: Landmark, title: 'Banks', eyebrow: 'VERIFICATION PARTNER', text: 'Verify authenticity and confirm lien marks through a clear review queue.', color: 'mint', items: ['Structured verification queue', 'Instant lien confirmation'] },
  { icon: ShieldCheck, title: 'AICTE', eyebrow: 'REGULATORY OVERSIGHT', text: 'See the full picture of secured funds, compliance and approvals in real time.', color: 'violet', items: ['Live fund visibility', 'Audit-ready oversight'] },
];

const features = [
  [BellRing, 'Expiry alerts that act early', 'Automated reminders give teams time to renew or release funds before maturity.'],
  [FileCheck2, 'Digital lien verification', 'Keep receipt records and bank confirmations together in one trusted workflow.'],
  [WalletCards, 'A secure document vault', 'Organise FDR records with controlled access and dependable cloud storage.'],
  [Clock3, 'Live portfolio visibility', 'See deposit status, upcoming maturities and locked funds at a glance.'],
  [Fingerprint, 'Role-based access', 'Give colleges, banks and administrators the right view at every step.'],
  [ShieldCheck, 'Compliance, made visible', 'Surface pending actions and exceptions early with a consistent audit trail.'],
];

const steps = ['Submitted', 'Bank verified', 'Lien marked', 'Active', 'Expiry alert', 'Refunded'];

function DashboardMock() {
  return <div className="tt-dashboard-wrap"><div className="tt-dashboard">
    <div className="tt-dash-head"><div><small>AICTE FUND OVERVIEW</small><strong>Deposit portfolio</strong></div><span className="tt-live"><i /> Live overview</span></div>
    <div className="tt-dash-metrics"><div><small>Total secured</small><b>₹ 84.6 <em>Cr</em></b><span className="tt-positive">↗ 12.8% this year</span></div><div><small>Active FDRs</small><b>2,481</b><span>Across 438 institutions</span></div><div><small>Action required</small><b className="tt-orange">08</b><span>Review this week</span></div></div>
    <div className="tt-chart-area"><div className="tt-chart-label"><strong>Funds secured over time</strong><span>Last 6 months⌄</span></div><div className="tt-chart"><div className="tt-chart-grid"><i /><i /><i /><i /></div><svg viewBox="0 0 600 150" preserveAspectRatio="none" role="img" aria-label="Rising line chart of funds secured"><defs><linearGradient id="area" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#59aaf8" stopOpacity=".25"/><stop offset="1" stopColor="#59aaf8" stopOpacity="0"/></linearGradient></defs><path d="M0,120 C50,113 59,91 103,100 S170,77 206,82 S267,48 310,66 S372,50 410,45 S474,62 510,34 S565,30 600,10 V150 H0Z" fill="url(#area)"/><path d="M0,120 C50,113 59,91 103,100 S170,77 206,82 S267,48 310,66 S372,50 410,45 S474,62 510,34 S565,30 600,10" fill="none" stroke="#3899ef" strokeWidth="3" vectorEffect="non-scaling-stroke"/></svg></div><div className="tt-months"><span>APR</span><span>MAY</span><span>JUN</span><span>JUL</span><span>AUG</span><span>SEP</span></div></div>
    <div className="tt-dash-foot"><span><i className="dot-blue"/> Bank verified</span><span><i className="dot-green"/> Active deposits</span><span><i className="dot-orange"/> Attention needed</span></div>
  </div><div className="tt-dash-toast"><span><CircleCheck size={17}/></span><div><b>Lien confirmed by SBI</b><small>FDR #4821 · a moment ago</small></div></div></div>;
}

export function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const faqs = [
    ['What is TrackTitans?', 'TrackTitans is a shared digital platform for managing institutional security deposits and their Fixed Deposit Receipts from registration through refund.'],
    ['Who can use the platform?', 'Colleges, participating banks and AICTE administrators each get role-based tools designed around their part of the deposit lifecycle.'],
    ['How does bank verification work?', 'A college submits the FDR details and receipt. The bank reviews the request, verifies the deposit and records the lien confirmation in the same workflow.'],
    ['Will the platform alert us before maturity?', 'Yes. Automated reminders help teams plan renewals or refunds before maturity dates, with clear visibility into upcoming actions.'],
  ];

  return <div className="tt-landing" id="top">
    <div className="tt-progress" />
    <header className="tt-marketing-nav"><div className="tt-nav-inner"><Brand /><nav className={menuOpen ? 'tt-nav-links is-open' : 'tt-nav-links'}><a href="#features" onClick={() => setMenuOpen(false)}>Features</a><a href="#workflow" onClick={() => setMenuOpen(false)}>How it works</a><a href="#roles" onClick={() => setMenuOpen(false)}>For everyone</a><a href="#faq" onClick={() => setMenuOpen(false)}>FAQ</a></nav><div className="tt-nav-actions"><Link className="tt-login" to="/login">Log in</Link><Link className="tt-button tt-button-nav" to="/register">Request a demo <ArrowUpRight size={15}/></Link></div><button className="tt-menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}>{menuOpen ? <X/> : <Menu/>}</button></div></header>

    <main>
      <section className="tt-hero tt-container"><div className="tt-hero-copy"><div className="tt-eyebrow"><span className="tt-eyebrow-icon"><Sparkles size={13}/></span> TRUST, TRACKED IN REAL TIME <span className="tt-eyebrow-line"/></div><h1>Every deposit.<br/><span>Tracked. Verified.<br className="tt-mobile-break"/> Secured.</span></h1><p className="tt-hero-lede">A paperless, real-time escrow platform connecting colleges, banks and AICTE — so no FDR ever expires unnoticed.</p><div className="tt-hero-actions"><Link to="/register" className="tt-button">Get started <ArrowRight size={17}/></Link><a href="#workflow" className="tt-watch"><span>▶</span> See how it works</a></div><div className="tt-trust-row"><span><Check/>100% paperless</span><i/><span><Check/>Real-time alerts</span><i/><span><Check/>Bank-grade security</span></div></div><HeroVisual/></section>

      <section className="tt-proof"><div className="tt-container tt-proof-inner"><p>BUILT FOR TRUST ACROSS THE DEPOSIT LIFECYCLE</p><div className="tt-proof-logos"><span><Building2/> Colleges</span><i/><span><Landmark/> Banks</span><i/><span><Shield/> AICTE</span><i/><span><LockKeyhole/> Secure by design</span></div></div></section>

      <section className="tt-stats tt-container"><motion.div className="tt-stats-intro" variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true }}><span className="tt-section-kicker">A clearer way forward</span><h2>Confidence at<br/>every step.</h2><p>Bring every institution and every FDR into one dependable view.</p></motion.div><div className="tt-stat-grid"><motion.div className="tt-stat" custom={0} variants={rise} initial="hidden" whileInView="show" viewport={{ once: true }}><span className="tt-stat-icon"><FileCheck2/></span><strong>2,400<span>+</span></strong><p>FDRs tracked<small>Illustrative platform metric</small></p></motion.div><motion.div className="tt-stat" custom={1} variants={rise} initial="hidden" whileInView="show" viewport={{ once: true }}><span className="tt-stat-icon mint"><ShieldCheck/></span><strong>₹84<span>Cr</span></strong><p>Funds secured<small>Illustrative platform metric</small></p></motion.div><motion.div className="tt-stat" custom={2} variants={rise} initial="hidden" whileInView="show" viewport={{ once: true }}><span className="tt-stat-icon violet"><Clock3/></span><strong>0</strong><p>Missed deadlines<small>With timely maturity alerts</small></p></motion.div></div></section>

      <section className="tt-compare-section"><div className="tt-container"><motion.div className="tt-section-heading" variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true }}><span className="tt-section-kicker">LESS CHASING. MORE CLARITY.</span><h2>From scattered paperwork<br/>to <span>one clear picture.</span></h2><p>Replace disconnected follow-ups with a shared, traceable process.</p></motion.div><div className="tt-compare"><motion.div className="tt-old-way" variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true }}><div className="tt-compare-label">THE OLD WAY <span>FRAGMENTED & MANUAL</span></div><div className="tt-paper-stack"><div className="tt-paper paper-back"><i/><i/><i/></div><div className="tt-paper paper-front"><span>FIXED DEPOSIT RECEIPT</span><i/><i/><div className="tt-paper-due">DUE DATE?</div></div><div className="tt-paper-alert">!</div></div><div className="tt-old-points"><span><X/> Scattered paper receipts</span><span><X/> Missed dates and follow-ups</span><span><X/> No shared status or audit trail</span></div></motion.div><div className="tt-compare-arrow"><ArrowRight/></div><motion.div className="tt-new-way" variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true }}><div className="tt-compare-label">THE TRACKTITANS WAY <span>CONNECTED & CLEAR</span></div><div className="tt-mini-workflow"><div className="tt-mini-node"><FileCheck2/><span>Submitted</span></div><i/><div className="tt-mini-node active"><ShieldCheck/><span>Verified</span></div><i/><div className="tt-mini-node"><BellRing/><span>On track</span></div></div><div className="tt-new-points"><span><Check/> One source of truth</span><span><Check/> Proactive maturity alerts</span><span><Check/> Clear ownership at every step</span></div></motion.div></div></div></section>

      <section id="roles" className="tt-roles-section tt-container"><motion.div className="tt-section-heading" variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true }}><span className="tt-section-kicker">ONE SHARED WORKFLOW</span><h2>Built for every side<br/>of the <span>process.</span></h2><p>Each team gets the tools and visibility it needs to move deposits forward.</p></motion.div><div className="tt-role-grid">{roles.map((role, i) => <motion.article key={role.title} className={`tt-role-card ${role.color}`} custom={i} variants={rise} initial="hidden" whileInView="show" viewport={{ once: true }} whileHover={{ y: -8, rotateX: 2 }}><div className="tt-role-icon"><role.icon size={22}/></div><span className="tt-role-eyebrow">{role.eyebrow}</span><h3>{role.title}</h3><p>{role.text}</p><div className="tt-role-divider"/>{role.items.map(item => <span className="tt-role-item" key={item}><Check size={15}/>{item}</span>)}</motion.article>)}</div></section>

      <section id="workflow" className="tt-workflow-section"><div className="tt-container"><motion.div className="tt-section-heading" variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true }}><span className="tt-section-kicker">A BETTER WAY TO MOVE</span><h2>One deposit.<br/><span>Every step accounted for.</span></h2><p>From the first upload to the final refund, progress stays visible to everyone involved.</p></motion.div><div className="tt-lifecycle"><div className="tt-life-path"/><div className="tt-life-progress"/><div className="tt-life-steps">{steps.map((step, i) => <motion.div key={step} className={`tt-life-step ${i < 3 ? 'complete' : ''}`} custom={i} variants={rise} initial="hidden" whileInView="show" viewport={{ once: true }}><span className="tt-life-node">{i < 3 ? <Check size={17}/> : <span>0{i + 1}</span>}</span><span className="tt-life-caption">{step}</span></motion.div>)}</div></div><div className="tt-lifecycle-caption"><span><i/> Clear status, shared by every team</span><span>Secure record at every step <LockKeyhole size={14}/></span></div></div></section>

      <section id="features" className="tt-features-section tt-container"><motion.div className="tt-section-heading tt-heading-split" variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true }}><div><span className="tt-section-kicker">THE DETAILS, HANDLED</span><h2>Everything in sync.<br/><span>Nothing overlooked.</span></h2></div><p>Thoughtful automation gives teams more time to focus on what matters.</p></motion.div><div className="tt-feature-grid">{features.map(([Icon, title, desc], i) => <motion.article className="tt-feature" key={title} custom={i} variants={rise} initial="hidden" whileInView="show" viewport={{ once: true }}><span className="tt-feature-icon"><Icon size={20}/></span><h3>{title}</h3><p>{desc}</p><span className="tt-feature-arrow"><ArrowUpRight size={16}/></span></motion.article>)}</div></section>

      <section className="tt-dashboard-section"><div className="tt-container tt-dash-layout"><motion.div className="tt-dash-copy" variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true }}><span className="tt-section-kicker">VISIBILITY THAT MOVES YOU FORWARD</span><h2>See the whole<br/>picture. <span>Act in time.</span></h2><p>Keep maturity dates, verification progress and secured funds in view — so the next action is always clear.</p><div className="tt-check-list"><span><Check/> Portfolio-wide fund visibility</span><span><Check/> Upcoming maturity timeline</span><span><Check/> Exceptions surfaced early</span></div><Link to="/register" className="tt-text-link">Explore the platform <ArrowRight size={16}/></Link></motion.div><motion.div className="tt-dashboard-stage" variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true }}><DashboardMock/></motion.div></div></section>

      <section className="tt-security-section"><div className="tt-container tt-security-card"><div className="tt-security-orb"><div className="tt-security-ring ring-outer"/><div className="tt-security-ring ring-inner"/><div className="tt-security-shield"><ShieldCheck size={45}/></div><span className="tt-orbit-dot"/></div><div className="tt-security-copy"><span className="tt-section-kicker">TRUST IS BUILT IN</span><h2>Every record.<br/><span>In safe hands.</span></h2><p>Purpose-built controls keep sensitive deposit information protected and every action accountable.</p><div className="tt-security-tags"><span><LockKeyhole/> Encrypted records</span><span><Fingerprint/> Role-based access</span><span><FileCheck2/> Auditable actions</span></div></div></div></section>

      <section className="tt-faq-section tt-container" id="faq"><motion.div className="tt-faq-intro" variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true }}><span className="tt-section-kicker">GOOD TO KNOW</span><h2>Questions, answered.</h2><p>A few details about making deposit management simpler.</p><a href="mailto:hello@tracktitans.in" className="tt-text-link">Talk to our team <ArrowRight size={16}/></a></motion.div><div className="tt-faq-list">{faqs.map(([q, a], i) => <div className={`tt-faq-item ${openFaq === i ? 'open' : ''}`} key={q}><button onClick={() => setOpenFaq(openFaq === i ? -1 : i)} aria-expanded={openFaq === i}><span>{q}</span><ChevronDown size={18}/></button><div className="tt-faq-answer"><p>{a}</p></div></div>)}</div></section>

      <section className="tt-cta-section tt-container"><div className="tt-cta-card"><div className="tt-cta-decoration"><div/><div/><div/></div><div className="tt-cta-copy"><span className="tt-section-kicker">A CLEARER WAY STARTS HERE</span><h2>Make every deposit<br/>one less thing to worry about.</h2><p>Bring your FDR lifecycle into focus with TrackTitans.</p><Link to="/register" className="tt-button">Request a demo <ArrowRight size={17}/></Link></div><div className="tt-cta-mark"><ShieldCheck size={74}/><span><i/><i/><i/></span></div></div></section>
    </main>

    <footer className="tt-footer"><div className="tt-container"><div className="tt-footer-top"><div className="tt-footer-brand"><Brand/><p>Every deposit, accounted for.<br/>Built for the education ecosystem.</p></div><div className="tt-footer-links"><div><b>EXPLORE</b><a href="#features">Features</a><a href="#workflow">How it works</a><a href="#roles">For institutions</a></div><div><b>GET STARTED</b><Link to="/login">Log in</Link><Link to="/register">Request a demo</Link><a href="#faq">FAQs</a></div></div></div><div className="tt-footer-bottom"><span>© 2025 TrackTitans <i/> Built for Smart India Hackathon</span><span>Designed for trust. Built for clarity.</span></div></div></footer>
  </div>;
}
