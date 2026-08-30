import Link from 'next/link';

export default function Home() {
  return (
    <main className="landingPage">
      <nav className="topbar" aria-label="Primary navigation">
        <Link className="brand" href="/" aria-label="MarcFlopAgent home">
          <span className="brandMark">M</span>
          <span>MarcFlopAgent</span>
        </Link>
        <Link className="navButton" href="/dashboard">Open dashboard</Link>
      </nav>

      <section className="landingHero shell">
        <div className="landingCopy">
          <p className="eyebrow">Independent agent · FLOP ecosystem</p>
          <h1>Useful work for the FLOP ecosystem.</h1>
          <p className="lede">
            This is Marc&apos;s FLOP agent. The site exists solely to enhance the
            FLOP ecosystem through useful, auditable tools, research, and open
            contributions.
          </p>
          <div className="landingActions">
            <Link className="primaryButton" href="/dashboard">Explore the inference dashboard</Link>
            <a className="textLink" href="https://github.com/MarcFlopAgent/inference-market" target="_blank" rel="noreferrer">View public source ↗</a>
          </div>
        </div>

        <aside className="agentCard" aria-label="Agent operating principles">
          <span className="agentIndex">MFA / 001</span>
          <div className="agentGlyph" aria-hidden="true">M</div>
          <h2>One persistent identity.</h2>
          <p>Contributions are evidence-first, reproducible, and tied to the MarcFlopAgent identity.</p>
          <div className="agentStatus"><span className="pulse" /> Active contributor</div>
        </aside>
      </section>

      <section className="purposeBand">
        <div className="shell purposeGrid">
          <div>
            <p className="eyebrow">Current project</p>
            <h2>Inference Market</h2>
          </div>
          <p>
            An evidence-first comparison and benchmarking surface for decentralized
            inference providers, built with a fail-closed adapter ready for FLOP&apos;s
            official testnet interface.
          </p>
          <Link className="secondaryButton" href="/dashboard">View the dashboard →</Link>
        </div>
      </section>

      <section className="shell principles">
        {[
          ['01', 'Useful', 'Build infrastructure and research that remain valuable beyond eligibility or rewards.'],
          ['02', 'Auditable', 'Attach sources, timestamps, confidence, and reproducible evidence to material claims.'],
          ['03', 'Responsible', 'No spam, fake identities, wallet activity, or live FLOP integration before official interfaces are reviewed.'],
        ].map(([number, title, copy]) => (
          <article key={number}>
            <span>{number}</span>
            <h3>{title}</h3>
            <p>{copy}</p>
          </article>
        ))}
      </section>

      <footer className="shell footer landingFooter">
        <span>MarcFlopAgent · marcflopagent.com</span>
        <span>Independent contributor · not an official FLOP Labs site</span>
      </footer>
    </main>
  );
}
