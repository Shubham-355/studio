import type { CSSProperties, MouseEvent, ReactNode } from "react";
import { COMPANIES, STAGES } from "./content";
import s from "./home.module.css";

export type Layout = Record<string, string>;

type Props = {
  studioName: string;
  heroRow: boolean;
  L: Layout;
  email: string;
  copied: boolean;
  go: (to: "home" | "companies" | "how" | "contact", e?: MouseEvent) => void;
  onFounder: (i: number, on: boolean) => void;
  onCard: (on: boolean) => void;
  onCopy: () => void;
};

// Each data-w child fades and lifts in sequence as its block comes into view.
const W = ({ children, italic, className }: { children: ReactNode; italic?: boolean; className?: string }) => (
  <span data-w className={[s.word, italic && s.it, className].filter(Boolean).join(" ")}>
    {children}
  </span>
);

// A headline phrase: it never breaks inside, so the line breaks fall between phrases.
const Ph = ({ children }: { children: ReactNode }) => <span className={s.ph}>{children}</span>;

function Words({ text }: { text: string }) {
  // " / " separates phrases; "*phrase*" marks an italic phrase that animates as one unit.
  return (
    <>
      {text.split(" / ").map((ph, k) => {
        const out: ReactNode[] = [];
        ph.split(/(\*[^*]+\*)/).filter((p) => p.trim()).forEach((p, i) => {
          if (p.startsWith("*")) out.push(<W key={i} italic>{p.slice(1, -1)}</W>);
          else p.trim().split(/\s+/).forEach((w, j) => out.push(<W key={`${i}-${j}`}>{w}</W>));
        });
        return (
          <span key={k}>
            {k > 0 && " "}
            <Ph>{out.flatMap((w, i) => (i ? [" ", w] : [w]))}</Ph>
          </span>
        );
      })}
    </>
  );
}

function ArmLayer({ svg }: { svg: "thumb" | "front" }) {
  return (
    <div data-armwrap aria-hidden className={s.armWrap}>
      <div data-armmove className={s.armMove}>
        <svg data-armsvg={svg} width="1" height="1" className={s.armSvg} />
      </div>
    </div>
  );
}

export default function Copy({ studioName, heroRow, L, email, copied, go, onFounder, onCard, onCopy }: Props) {
  return (
    <main data-copylayer className={s.copyLayer} style={{ "--gx": L.gx } as CSSProperties}>
      <section
        data-copy
        data-a="-1"
        data-b=".36"
        data-hero
        className={`${s.copy} ${s.wide} ${s.hero}`}
        style={{ left: "clamp(20px,4.44vw,64px)", right: "clamp(20px,4.44vw,64px)", bottom: L.heroB, flexDirection: heroRow ? "row" : "column", alignItems: heroRow ? "last baseline" : "flex-start" }}
      >
        <h1 data-hl className={s.heroTitle} style={{ whiteSpace: heroRow ? "nowrap" : "normal" }}>
          <Ph><W>We</W> <W>make</W> <W>the</W> <W>thing</W></Ph> {heroRow && <br />}
          <Ph><W>you</W> <W italic>keep</W></Ph> <Ph><W italic>thinking</W> <W italic>about<span style={{ fontStyle: "normal" }}>.</span></W></Ph>
        </h1>
        <div data-w data-herocta className={s.ctaRow}>
          <a href="#start" onClick={(e) => go("contact", e)} data-magnet className={`${s.pill} ${s.pillMd}`}>
            Tell us about it
          </a>
        </div>
      </section>

      <section data-copy data-a="1.62" data-b="2.55" className={`${s.copy} ${s.wide}`} style={{ top: L.tA, bottom: L.b1 }}>
        <p data-hl className={s.lede} style={{ maxWidth: L.wA }}>
          <Words text="Every company we build / starts as *one idea* / and *one conversation.*" />
        </p>
      </section>

      <section data-copy data-a="2.58" data-b="3.35" className={`${s.copy} ${s.wide}`} style={{ top: L.tA, bottom: L.b1, display: "flex", flexDirection: "column", gap: 8, maxWidth: L.wA, color: "var(--text)" }}>
        <h2 data-hl className={s.display}>
          <Ph><W>Your</W> <W>idea</W> <W>has</W></Ph> <Ph><W>a</W> <W italic className={s.accent}>whole company</W></Ph> <Ph><W>inside</W> <W>it.</W></Ph>
        </h2>
        <p data-w className={s.body} style={{ maxWidth: "calc(25.3em + 52px)", fontSize: "clamp(16px,1.1vw,19px)", letterSpacing: 0, padding: "16px 26px", marginLeft: -26, color: "rgba(30,27,24,.88)", background: "radial-gradient(ellipse 64% 96% at 50% 50%,rgba(250,232,212,.95),rgba(250,232,212,.9) 62%,rgba(250,232,212,0))" }}>We find the brand, the product and the business model in it. Then we build each one.</p>
      </section>

      <section id="how-we-build" data-copy data-a="13.6" data-b="16.76" className={`${s.copy} ${s.wide}`} style={{ top: L.tBeach, color: "var(--text)" }}>
        <h2 data-hl data-bh className={s.display} style={{ maxWidth: L.wB, textShadow: "0 0 30px rgba(239,224,194,.9)" }}>
          <Words text="A pawn that / crosses the board / becomes *a queen.*" />
        </h2>
      </section>
      {STAGES.map((g, i) => (
        <div key={g.num} data-copy="m" data-id={`stg${i}`} className={`${s.copy} ${s.stageCard}`} style={{ left: 0, right: "auto", top: 0, bottom: "auto", width: "min(320px,calc(100vw - 32px))" }}>
          <span data-w className={s.stageNum}>{g.num}</span>
          <span data-w data-hl className={s.stageName}>{g.name}</span>
          <span data-w className={s.stageText}>{g.d}</span>
        </div>
      ))}

      <section id="companies" data-copy data-a="18.3" data-b="19.1" className={`${s.copy} ${s.wide}`} style={{ top: L.t1, bottom: L.b1, color: "var(--text)" }}>
        <h2 data-hl className={s.display} style={{ maxWidth: L.w1H, textShadow: "0 0 10px rgba(242,200,148,.95),0 0 22px rgba(242,200,148,.9),0 0 44px rgba(237,187,128,.75)" }}>
          <Words text="They came in *overthinking.* / They left with *companies.*" />
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
          <span data-w className={s.eyebrow} style={{ marginBottom: -2 }}>No. {c.n} · Built with its founder</span>
          <span data-w data-hl className={s.cardTitle}>{c.name}</span>
          <span data-w className={s.cardText}>{c.what} We built {c.built}</span>
          <span data-w className={s.result}>{c.result}</span>
        </article>
      ))}
      <div data-copy data-a="21.75" data-b="22.3" className={s.copy} style={{ left: 0, right: 0, bottom: L.linkB, display: "flex", justifyContent: "center" }}>
        <a data-w href="#companies" className={s.allLink}>All companies</a>
      </div>

      <section data-copy data-a="23.05" data-b="24.15" className={`${s.copy} ${s.wide}`} style={{ top: L.tRoom, bottom: "auto", color: "var(--text)" }}>
        <h2 data-hl className={s.display} style={{ maxWidth: L.wRoom, textShadow: "0 0 30px rgba(230,220,203,.9)" }}>
          <Words text="The company is yours. / *All of it.*" />
        </h2>
      </section>

      <figure data-copy data-a="25.25" data-b="26.25" className={`${s.copy} ${s.wide}`} style={{ top: L.tQuote, margin: 0, display: "flex", flexDirection: "column", gap: 24, color: "var(--cream)" }}>
        <blockquote data-hl className={s.quote} style={{ maxWidth: L.wQ }}>
          <Words text="“We came with one sentence. / Eleven months later we had a brand, / a product and a team to run both.”" />
        </blockquote>
        <figcaption data-w className={s.eyebrow}>Ines Varga, founder and CEO, Halcyon Freight</figcaption>
      </figure>

      <section id="start" data-copy data-a="26.45" data-b="27.6" className={`${s.copy} ${s.wide}`} style={{ bottom: L.bContact, display: "flex", flexDirection: "column", gap: 32, maxWidth: L.wC, color: "var(--cream)" }}>
        <h2 data-hl className={s.display} style={{ textShadow: "0 2px 36px rgba(10,16,34,.8)" }}>
          <Ph><W>Bring</W> <W>the</W> <W>idea.</W></Ph> <Ph><W italic>We’ll build the company</W></Ph> <Ph><W italic>around it.</W></Ph>
        </h2>
        <div data-w className={s.ctaRow} style={{ flex: "initial" }}>
          <a href={`mailto:${email}`} data-magnet className={`${s.pill} ${s.pillLg}`}>Start a company</a>
          <button onClick={onCopy} className={s.takeCard}>{copied ? "Copied to your clipboard" : "Or take the card"}</button>
        </div>
      </section>
      {/* the founder's hand offers a letter out of the tear: thumb behind it, fingers in front, a paper lip where the sleeve crosses the edge */}
      <ArmLayer svg="thumb" />
      <a
        data-copy="m"
        data-id="ccard"
        href={`mailto:${email}`}
        onMouseEnter={() => onCard(true)}
        onMouseLeave={() => onCard(false)}
        onFocus={() => onCard(true)}
        onBlur={() => onCard(false)}
        className={s.contactCard}
      >
        <span data-deckle aria-hidden className={s.deckleShadow} />
        <span data-deckle aria-hidden className={s.deckle} />
        <span data-sheen aria-hidden className={s.sheen} />
        <span className={s.letter}>
          <span data-w className={s.letterTo}>{email}</span>
          <span data-w className={s.letterNote}>Write any time. A founder at the studio replies within a day.</span>
        </span>
      </a>
      <ArmLayer svg="front" />
      <div data-armwrap="flap" aria-hidden className={s.armWrap}>
        <svg width="1" height="1" className={s.armSvg}><g data-armflap /></svg>
      </div>

      <footer data-copy data-a="27.75" data-b="99" className={`${s.copy} ${s.wide} ${s.footer}`} style={{ top: L.tFoot }}>
        <div data-w className={s.footCol} style={{ gap: 10 }}>
          <span className={s.footBrand}>{studioName}</span>
          <span style={{ opacity: 0.88 }}>We build companies for founders.</span>
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
          <span className={s.eyebrow} style={{ lineHeight: 2.4 }}>© 2026</span>
        </div>
      </footer>
    </main>
  );
}
