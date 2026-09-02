import React from 'react';
import { motion } from 'motion/react';
import { Mail, Globe, Code, Database, Layers, Smartphone, Sparkles, BookOpen, ArrowUpRight, GitBranch, BriefcaseBusiness, BrainCircuit, BarChart3, ArrowDown, LockKeyhole } from 'lucide-react';

const reveal = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.18 },
  transition: { duration: 0.42, ease: 'easeOut' },
};

export default function AboutView() {
  const interests = ['Python', 'Machine Learning', 'Deep Learning', 'Generative AI', 'Large Language Models', 'LangChain', 'LangGraph', 'Agentic AI', 'RAG systems', 'Data Science', 'Software engineering', 'AI × finance'];
  const techStack = [
    { name: 'React interface', icon: Code },
    { name: 'API-connected vault', icon: Database },
    { name: 'Active recall workflow', icon: BrainCircuit },
    { name: 'Responsive by default', icon: Smartphone },
    { name: 'Searchable knowledge graph', icon: Layers },
    { name: 'Measured progress', icon: BarChart3 },
  ];
  const contacts = [
    { label: 'Email', value: 'harsh3h3@gmail.com', icon: Mail, link: 'mailto:harsh3h3@gmail.com' },
    { label: 'LinkedIn', value: 'harshsharma-engineer', icon: BriefcaseBusiness, link: 'https://www.linkedin.com/in/harshsharma-engineer/' },
    { label: 'GitHub', value: 'harsh31415926', icon: GitBranch, link: 'https://github.com/harsh31415926' },
    { label: 'Portfolio', value: 'harsh31415926-github-io.vercel.app', icon: Globe, link: 'https://harsh31415926-github-io.vercel.app/' },
  ];

  return (
    <motion.div className="about-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
      <motion.section className="about-hero-card" {...reveal}>
        <div className="about-hero-topline"><span className="about-index-mark">00</span><span className="about-hero-mark"><BookOpen size={22} /></span><span className="about-private-note"><LockKeyhole size={12} /> Private by design</span></div>
        <span className="header-eyebrow">The main focus</span>
        <h2>Just get 8.5 <em>IELTS band</em></h2>
        <p>VocabVault is a private vocabulary saver created by your friend "HARSH SHARMA" just to make you smarter and learn a word per day, believe me getting 8.5 is kinda easy buddsy .</p>
        <div className="about-hero-rule"><span />Built for my best friends only<span /></div>
      </motion.section>

      <div className="about-manifesto-intro" aria-label="VocabVault philosophy">
        <span className="header-eyebrow">A working philosophy</span>
        <p>Language compounds quietly. The system only needs to make returning feel inevitable.</p>
      </div>

      <motion.section className="about-card about-story-card" {...reveal}>
        <div className="about-section-heading"><span className="section-index">01</span><div><span className="header-eyebrow">Why I created this</span><h3 className="about-title">I want all of you to be the most proficient in the English language |IELTS 8.5| </h3></div></div>
        <p className="about-text">Most people meet a new word, love it, and then allow it to disappear in the thousands of english Vocabularies. VocabVault gives that word an address: whenever you forget that just come to the VocabVault and search it, you will find it everytime.</p>
        <p className="about-text">It solves the small but persistent problem between <strong>“I have seen this word”</strong> and <strong>“I can actually use it.”</strong> The result is a calmer, searchable practice for building a vocabulary that can enhance you.</p>
        <div className="about-principles"><span>Collect deliberately</span><span>Annotate personally</span><span>Recall repeatedly</span></div>
      </motion.section>

      <motion.section className="about-flow-section" {...reveal}>
        <div className="about-section-heading"><span className="section-index">→</span><div><span className="header-eyebrow">The compounding loop</span><h3 className="about-title">Small inputs. A more capable mind.</h3></div></div>
        <div className="about-flow" aria-label="The idea to the result">
          <div><span>01</span><strong>The idea</strong><p>Notice a word worth keeping.</p></div>
          <ArrowDown className="about-flow-arrow" size={15} />
          <div><span>02</span><strong>The system</strong><p>Give it a precise, personal address.</p></div>
          <ArrowDown className="about-flow-arrow" size={15} />
          <div><span>03</span><strong>The habit</strong><p>Return before unfamiliar becomes forgotten.</p></div>
          <ArrowDown className="about-flow-arrow" size={15} />
          <div><span>04</span><strong>The result</strong><p>Use better language with less effort.</p></div>
        </div>
      </motion.section>

      <motion.section className="about-card about-personal-card" {...reveal}>
        <div className="about-section-heading"><span className="section-index">02</span><div><span className="header-eyebrow">Built for the people I care about</span><h3 className="about-title">A smaller circle. A higher standard.</h3></div></div>
        <div className="about-personal-copy">
          <span className="about-quote-mark">“</span>
          <div>
            <p>This is not another vocabulary product built for everyone.</p>
            <p>It was made for a much smaller circle — the people I genuinely care about, especially my best friends.</p>
            <p>If this helps even a few of them speak better, write better, think more clearly, or finally remember the words they keep forgetting, then it has already served its purpose.</p>
          </div>
        </div>
      </motion.section>

      <motion.section className="about-card creator-card" {...reveal}>
        <div className="about-section-heading"><span className="section-index">03</span><div><span className="header-eyebrow">The person responsible</span><h3 className="about-title">Harsh Sharma</h3></div></div>
        <p className="creator-lead">Engineering student, who wants to get atleast 9 IELTS band, becuase he can .</p>
        <p className="about-text">VocabVault was built by Harsh, an engineer who apparently decided that remembering words manually was a waste of human potential. While most people forget ambitious vocabulary after learning it, I built an entire system to ensure our words—and, presumably, our intellectual superiority—remain permanently indexed.</p>
        <p className="about-text">My interests span AI with a strong focus on the convergence of AI and finance—quantitative finance, and eventually building a quantitative hedge fund—while continuously improving my English communication and vocabulary, and I want IELTS band 9 also.</p>
        <div className="interest-grid">{interests.map((interest) => <span key={interest}>{interest}</span>)}</div>
      </motion.section>

      <motion.section className="about-card" {...reveal}>
        <div className="about-section-heading"><span className="section-index">04</span><div><span className="header-eyebrow">Under the hood</span><h3 className="about-title">A small system with serious intentions.</h3></div></div>
        <div className="tech-grid">{techStack.map(({ name, icon: Icon }) => <div className="tech-chip" key={name}><Icon size={16} /><span>{name}</span></div>)}</div>
      </motion.section>

      <motion.section className="about-card contact-card" {...reveal}>
        <div className="about-section-heading"><span className="section-index">05</span><div><span className="header-eyebrow">Open channels</span><h3 className="about-title">Find the engineer behind the vault.</h3></div></div>
        <div className="contact-grid">
          {contacts.map(({ label, value, icon: Icon, link }) => (
            <a className="contact-link" key={label} href={link} target={link.startsWith('mailto:') ? undefined : '_blank'} rel={link.startsWith('mailto:') ? undefined : 'noopener noreferrer'}>
              <span className="contact-icon"><Icon size={16} /></span>
              <span><small>{label}</small><strong>{value}</strong></span>
              <ArrowUpRight size={15} />
            </a>
          ))}
        </div>
      </motion.section>
      <footer className="about-footer"><Sparkles size={14} />Made for the legends by Harsh Sharma.</footer>
    </motion.div>
  );
}
