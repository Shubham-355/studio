import type { MouseEvent, ReactNode } from "react";
import { COMPANIES, STAGES } from "./content";
import s from "./home.module.css";

export type Layout = Record<string, string>;

type Props = {
  studioName: string;
  email: string;
  narrow: boolean;
  heroRow: boolean;
  L: Layout;
  copied: boolean;
  go: (to: "home" | "companies" | "how" | "contact", e?: MouseEvent) => void;
  onFounder: (i: number, on: boolean) => void;
  copyEmail: () => void;
};

// Each data-w child fades and lifts in sequence as its block comes into view.
const W = ({ children, italic, className }: { children: ReactNode; italic?: boolean; className?: string }) => (
  <span data-w className={[s.word, italic && s.it, className].filter(Boolean).join(" ")}>
    {children}
  </span>
);

function Words({ text }: { text: string }) {
  // "*phrase*" marks an italic phrase that animates as one unit.
  const parts = text.split(/(\*[^*]+\*)/).filter(Boolean);
  const out: ReactNode[] = [];
  parts.forEach((p, i) => {
    if (p.startsWith("*")) out.push(<W key={i} italic>{p.slice(1, -1)}</W>, " ");
    else p.trim().split(/\s+/).forEach((w, j) => out.push(<W key={`${i}-${j}`}>{w}</W>, " "));
  });
  return <>{out}</>;
}

function Caption({ a, b, L, children }: { a: string; b: string; L: Layout; children: ReactNode }) {
  return (
    <div data-copy data-a={a} data-b={b} className={s.copy} style={{ left: L.capL, right: L.capR, top: L.capT, bottom: L.capB }}>
      <span data-w className={s.caption}>{children}</span>
    </div>
  );
}

export default function Copy({ studioName, email, narrow, heroRow, L, copied, go, onFounder, copyEmail }: Props) {
  const mailto = `mailto:${email}`;
  return (
    <main data-copylayer className={s.copyLayer}>
      <section
        data-copy
        data-a="-1"
        data-b=".62"
        data-hero
        className={`${s.copy} ${s.wide} ${s.hero}`}
        style={{ bottom: L.heroB, flexDirection: heroRow ? "row" : "column", alignItems: heroRow ? "baseline" : "flex-start" }}
      >
        <h1 className={s.heroTitle}>
          <W>We</W> <W italic>build</W> <W>companies.</W>
        </h1>
        <div data-w data-herocta className={s.ctaRow}>
          <a href="#start" onClick={(e) => go("contact", e)} data-magnet className={`${s.pill} ${s.pillMd}`}>
            Start a company
          </a>
          <a href="#companies" onClick={(e) => go("companies", e)} className={s.underline}>
            See the companies
          </a>
        </div>
      </section>

      <section data-copy data-a="2.0" data-b="2.95" className={`${s.copy} ${s.wide}`} style={{ top: L.t1, bottom: L.b1 }}>
        <p className={s.lede} style={{ maxWidth: L.w1 }}>
          <Words text="Every company we build starts as *one idea* and *one conversation.*" />
        </p>
      </section>
      <Caption a="2.0" b="4.45" L={L}>Oil on canvas, 2026. An apple, alone on the board.</Caption>

      <section data-copy data-a="3.25" data-b="4.45" className={`${s.copy} ${s.wide}`} style={{ top: L.t1, bottom: L.b1, display: "flex", flexDirection: "column", gap: 24, maxWidth: L.w2, color: "var(--ink)" }}>
        <h2 className={s.display} style={{ fontSize: "clamp(44px,5.6vw,92px)" }}>
          <W>Your</W> <W>idea</W> <W>has</W> <W>a</W> <W italic className={s.accent}>whole company</W> <W>inside</W> <W>it.</W>
        </h2>
        <p data-w className={s.body}>We find the brand, the product and the business model in it. Then we build each one.</p>
      </section>
      <Caption a="5.6" b="12.2" L={L}>Oil on canvas, 2026. Inside the apple, it was summer.</Caption>

      <section id="how-we-build" data-copy data-a="13.85" data-b="16.7" className={`${s.copy} ${s.wide}`} style={{ top: L.tBeach, color: "var(--ink)" }}>
        <h2 className={s.display} style={{ maxWidth: L.w2, fontSize: "clamp(40px,4.8vw,80px)", textShadow: "0 0 30px rgba(239,224,194,.9)" }}>
          <Words text="A pawn that crosses the board becomes *a queen.*" />
        </h2>
      </section>
      {STAGES.map((g, i) => (
        <div key={g.num} data-copy="m" data-id={`stg${i}`} className={`${s.copy} ${s.stageCard}`} style={{ left: L.mL, right: L.mR, top: L.mT, bottom: L.mB }}>
          <span data-w className={s.stageNum}>{g.num}</span>
          <span data-w className={s.cardTitle}>{g.name}</span>
          <span data-w className={s.stageText}>{g.d}</span>
        </div>
      ))}
      <Caption a="13.85" b="16.7" L={L}>Oil on sand, 2026. Five moves to the last rank.</Caption>

      <section id="companies" data-copy data-a="18.3" data-b="19.1" className={`${s.copy} ${s.wide}`} style={{ top: L.t1, bottom: L.b1, color: "var(--ink)" }}>
        <h2 className={s.display} style={{ maxWidth: L.w1, fontSize: "clamp(44px,5.6vw,92px)", textShadow: "0 0 30px rgba(237,187,128,.8)" }}>
          <Words text="They came in *overthinking.* They left with *companies.*" />
        </h2>
      </section>
      {COMPANIES.map((c, i) => (
        <article
          key={c.name}
          data-copy="m"
          data-id={`card${i}`}
          tabIndex={0}
          onFocus={() => onFounder(i, true)}
          onBlur={() => onFounder(i, false)}
          onMouseEnter={() => onFounder(i, true)}
          onMouseLeave={() => onFounder(i, false)}
          className={`${s.copy} ${s.companyCard}`}
          style={{ left: L.mL, right: L.mR, top: L.mT, bottom: L.mB }}
        >
          <span data-w className={s.eyebrow}>No. {c.n} · Built with its founder</span>
          <span data-w className={s.cardTitle}>{c.name}</span>
          <span data-w style={{ fontSize: 15, lineHeight: 1.45 }}>{c.what} We built {c.built}</span>
          <span data-w className={s.result}>{c.result}</span>
        </article>
      ))}
      <div data-copy data-a="21.75" data-b="22.3" className={s.copy} style={{ left: 0, right: 0, bottom: L.linkB, display: "flex", justifyContent: "center" }}>
        <a data-w href="#companies" className={s.allLink}>All companies</a>
      </div>
      <Caption a="18.3" b="22.3" L={L}>Oil on canvas, 2026. Four founders, late afternoon.</Caption>

      <section data-copy data-a="23.05" data-b="24.15" className={`${s.copy} ${s.wide}`} style={{ top: L.tRoom, bottom: "auto", color: "var(--ink)" }}>
        <h2 className={s.display} style={{ maxWidth: L.wRoom, fontSize: "clamp(44px,5.2vw,88px)", textShadow: "0 0 30px rgba(230,220,203,.9)" }}>
          <Words text="The company is yours. *All of it.*" />
        </h2>
      </section>
      <Caption a="23.05" b="24.15" L={L}>Oil on canvas, 2026. A queen, indoors.</Caption>

      <figure data-copy data-a="25.25" data-b="26.25" className={`${s.copy} ${s.wide}`} style={{ top: L.tQuote, margin: 0, display: "flex", flexDirection: "column", gap: 24, color: "var(--paper)" }}>
        <blockquote className={s.quote} style={{ maxWidth: L.w1 }}>
          <W>“We came with one sentence.</W> <W>Eleven months later we had a brand,</W> <W>a product and a team to run both.”</W>
        </blockquote>
        <figcaption data-w className={s.eyebrow}>Ines Varga, founder and CEO, Halcyon Freight</figcaption>
      </figure>

      <section id="start" data-copy data-a="26.45" data-b="27.6" className={`${s.copy} ${s.wide}`} style={{ bottom: L.bContact, display: "flex", flexDirection: "column", gap: 28, maxWidth: L.wC, color: "var(--paper)" }}>
        <h2 className={s.display} style={{ fontSize: "clamp(44px,5vw,84px)", textShadow: "0 2px 36px rgba(10,16,34,.8)" }}>
          <W>Bring</W> <W>the</W> <W>idea.</W> <W italic>We’ll build the company</W> <W italic>around it.</W>
        </h2>
        <div data-w className={s.ctaRow} style={{ flex: "initial" }}>
          <a href={mailto} data-magnet className={`${s.pill} ${s.pillLg}`}>Start a company</a>
          <button onClick={copyEmail} className={s.textBtn}>{copied ? "Copied to your clipboard" : "Or take the card"}</button>
        </div>
      </section>
      <div data-copy="m" data-id="ccard" className={s.contactCard} style={{ width: L.cardW, transformOrigin: narrow ? "50% 0" : "0 0" }}>
        <span data-w style={{ fontSize: 14, lineHeight: 1.45 }}>Write any time. A founder at the studio replies within a day.</span>
      </div>
      <canvas data-paint="thumb3" data-thumb aria-hidden style={{ position: "absolute", left: 0, top: 0, width: 360, height: 340, transformOrigin: "0 0", visibility: "hidden", pointerEvents: "none" }} />
      <Caption a="26.45" b="27.6" L={L}>Oil on canvas, 2026. An invitation.</Caption>

      <footer data-copy data-a="27.75" data-b="99" className={`${s.copy} ${s.wide} ${s.footer}`} style={{ top: L.tFoot }}>
        <div data-w className={s.footCol} style={{ gap: 10 }}>
          <span className={s.footBrand}>{studioName}</span>
          <span style={{ fontWeight: 400 }}>We build companies for founders.</span>
        </div>
        <div data-w className={s.footCol}>
          <a href="#companies" onClick={(e) => go("companies", e)}>Companies</a>
          <a href="#how-we-build" onClick={(e) => go("how", e)}>How we build</a>
          <a href="#studio">Studio</a>
        </div>
        <div data-w className={s.footCol}>
          <a href="#">LinkedIn</a>
          <a href="#">Instagram</a>
          <a href="#">GitHub</a>
        </div>
        <div data-w className={s.footCol}>
          <span>© 2026</span>
        </div>
      </footer>
    </main>
  );
}
