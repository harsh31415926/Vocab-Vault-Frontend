import React from 'react';
import { Mail, Globe, Code, Database, Layers, Smartphone, Sparkles, BookOpen, ArrowUpRight, GitBranch, BriefcaseBusiness, BrainCircuit, BarChart3 } from 'lucide-react';

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
    <div className="about-container">
      <section className="about-hero-card">
        <div className="about-hero-mark"><BookOpen size={22} /></div>
        <span className="header-eyebrow">The operating principle</span>
        <h2>Words become useful when they become <em>yours.</em></h2>
        <p>VocabVault is a private vocabulary and knowledge workspace for collecting unfamiliar words, attaching personal meaning to them, and returning often enough that they stop being unfamiliar.</p>
        <div className="about-hero-rule"><span />Built for the long game<span /></div>
      </section>

      <section className="about-card about-story-card">
        <div className="about-section-heading"><span className="section-index">01</span><div><span className="header-eyebrow">Why this exists</span><h3 className="about-title">A dictionary tells you what a word means. This remembers why you cared.</h3></div></div>
        <p className="about-text">Most people meet an ambitious word, admire it briefly, and then allow it to disappear into the fog of the internet. VocabVault gives that word an address: a definition in your language, a note from your own context, a few useful synonyms, and a place in a revision session.</p>
        <p className="about-text">It solves the small but persistent problem between <strong>“I have seen this word”</strong> and <strong>“I can actually use it.”</strong> The result is a calmer, searchable practice for building a vocabulary that compounds.</p>
        <div className="about-principles"><span>Collect deliberately</span><span>Annotate personally</span><span>Recall repeatedly</span></div>
      </section>

      <section className="about-card creator-card">
        <div className="about-section-heading"><span className="section-index">02</span><div><span className="header-eyebrow">The person responsible</span><h3 className="about-title">Harsh Sharma</h3></div></div>
        <p className="creator-lead">Engineering student. AI/ML obsessive. Future architect of systems that will probably have dashboards.</p>
        <p className="about-text">VocabVault was built by Harsh, an engineer who apparently decided that remembering words manually was an inefficient use of human potential. While most people forget ambitious vocabulary after learning it, he built an entire system to ensure his words—and, presumably, his intellectual superiority—remain permanently indexed.</p>
        <p className="about-text">His interests run from Python and machine learning through generative AI, LLMs, LangChain, LangGraph, agentic systems, retrieval-augmented generation, data science, and software engineering. Naturally, he is also interested in the convergence of AI and finance: intelligent financial systems, quantitative finance, investment-banking technology, and eventually building and managing a quantitative hedge fund. Modest, in the most technically defensible sense.</p>
        <div className="interest-grid">{interests.map((interest) => <span key={interest}>{interest}</span>)}</div>
      </section>

      <section className="about-card">
        <div className="about-section-heading"><span className="section-index">03</span><div><span className="header-eyebrow">Under the hood</span><h3 className="about-title">A small system with serious intentions.</h3></div></div>
        <div className="tech-grid">{techStack.map(({ name, icon: Icon }) => <div className="tech-chip" key={name}><Icon size={16} /><span>{name}</span></div>)}</div>
      </section>

      <section className="about-card contact-card">
        <div className="about-section-heading"><span className="section-index">04</span><div><span className="header-eyebrow">Open channels</span><h3 className="about-title">Find the engineer behind the vault.</h3></div></div>
        <div className="contact-grid">
          {contacts.map(({ label, value, icon: Icon, link }) => (
            <a className="contact-link" key={label} href={link} target={link.startsWith('mailto:') ? undefined : '_blank'} rel={link.startsWith('mailto:') ? undefined : 'noopener noreferrer'}>
              <span className="contact-icon"><Icon size={16} /></span>
              <span><small>{label}</small><strong>{value}</strong></span>
              <ArrowUpRight size={15} />
            </a>
          ))}
        </div>
      </section>
      <footer className="about-footer"><Sparkles size={14} />Made with unreasonable standards by Harsh Sharma.</footer>
    </div>
  );
}
