import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowUpRight } from "lucide-react";
import HeroDuplicate from "@/components/HeroDuplicate";
import StatsBlock from "@/components/StatsBlock";
import HeroScrollAnimation from "@/components/ui/hero-scroll-animation";

// Below-the-fold sections: still server-rendered for SEO/no-CLS, but their
// client JS (framer-motion, etc.) is split into separate chunks instead of
// bloating the bundle every visitor has to parse before the hero is interactive.
const CasesMasonrySection = dynamic(() => import("@/components/CasesMasonrySection"));
const ClientLogosBlock = dynamic(() => import("@/components/ClientLogosBlock"));
const ContactSection = dynamic(() => import("@/components/ContactSection"));
const ServicesAnimate = dynamic(() => import("@/components/ServicesAnimate"));
const Team = dynamic(() => import("@/components/Team"));
const WorkStages = dynamic(() => import("@/components/WorkStages"));
import type { CaseItem } from "@/data/cases";
import type { CmsEditorBlock } from "@/types/cms";
import { parseSelectedHrefs } from "@/utils/cms";
import { formatTypography } from "@/utils/typography";
import "./peak-cms-theme.css";

function text(content: Record<string, unknown>, key: string) {
  const value = content[key];
  return typeof value === "string" ? formatTypography(value) : "";
}

function safeMediaUrl(value: string) {
  if (value.startsWith("/") || value.startsWith("https://")) return value;
  return "";
}

function safeLink(value: string) {
  if (value.startsWith("/") || value.startsWith("#") || /^(https:|mailto:|tel:)/.test(value)) return value;
  return "#";
}

function ActionLink({ href, label, inverse = false }: { href: string; label: string; inverse?: boolean }) {
  if (!label) return null;
  const safeHref = safeLink(href);
  const className = `peak-cms__action${inverse ? " peak-cms__action--inverse" : ""}`;
  const external = safeHref.startsWith("https://");

  return external ? (
    <a href={safeHref} target="_blank" rel="noreferrer" className={className}>
      {label}<ArrowUpRight className="peak-cms__action-icon" aria-hidden="true" />
    </a>
  ) : (
    <Link href={safeHref} className={className}>
      {label}<ArrowUpRight className="peak-cms__action-icon" aria-hidden="true" />
    </Link>
  );
}

function HeroBlock({ content }: { content: Record<string, unknown> }) {
  const backgroundUrl = safeMediaUrl(text(content, "backgroundUrl"));
  return (
    <section className="peak-cms peak-cms--hero">
      {backgroundUrl && (
        <img src={backgroundUrl} alt="" className="peak-cms__hero-media" />
      )}
      <div className="peak-cms__hero-overlay" />
      <div className="peak-cms__hero-content">
        {text(content, "eyebrow") && <p className="peak-cms__eyebrow">{text(content, "eyebrow")}</p>}
        <h1 className="peak-cms__display">
          {text(content, "title")}
        </h1>
        {text(content, "description") && (
          <p className="peak-cms__lead">
            {text(content, "description")}
          </p>
        )}
        {text(content, "buttonLabel") && (
          <div className="peak-cms__hero-action">
            <ActionLink inverse href={text(content, "buttonUrl")} label={text(content, "buttonLabel")} />
          </div>
        )}
      </div>
    </section>
  );
}

function TextBlock({ content }: { content: Record<string, unknown> }) {
  const centered = text(content, "align") === "center";
  return (
    <section className="peak-cms peak-cms--text">
      <div className={`peak-cms__inner peak-cms__text-layout${centered ? " peak-cms__text-layout--centered" : ""}`}>
        {text(content, "heading") && (
          <h2 className="peak-cms__section-title">
            {text(content, "heading")}
          </h2>
        )}
        <p className="peak-cms__body">
          {text(content, "body")}
        </p>
      </div>
    </section>
  );
}

function MediaBlock({ content }: { content: Record<string, unknown> }) {
  const url = safeMediaUrl(text(content, "mediaUrl"));
  if (!url) return null;
  const video = text(content, "mediaType") === "video" || /\.(mp4|mov|m4v|webm)(?:\?|$)/i.test(url);

  return (
    <figure className="peak-cms peak-cms--media">
      <div className="peak-cms__inner">
        <div className="peak-cms__media-shell">
          {video ? (
            <video src={url} controls playsInline preload="metadata" className="peak-cms__media" />
          ) : (
            <img src={url} alt={text(content, "alt")} className="peak-cms__media" />
          )}
        </div>
        {text(content, "caption") && <figcaption className="peak-cms__caption">{text(content, "caption")}</figcaption>}
      </div>
    </figure>
  );
}

function CtaBlock({ content }: { content: Record<string, unknown> }) {
  return (
    <section className="peak-cms peak-cms--cta">
      <div className="peak-cms__inner">
        <h2 className="peak-cms__cta-title">
          {text(content, "title")}
        </h2>
        <div className="peak-cms__cta-footer">
          {text(content, "description") && <p className="peak-cms__cta-description">{text(content, "description")}</p>}
          <ActionLink inverse href={text(content, "buttonUrl")} label={text(content, "buttonLabel")} />
        </div>
      </div>
    </section>
  );
}

export default function CmsBlockRenderer({
  blocks,
  caseItems,
}: {
  blocks: CmsEditorBlock[];
  caseItems?: CaseItem[];
}) {
  return blocks.map((block) => {
    switch (block.template.type) {
      case "hero":
        return <HeroBlock key={block.id} content={block.content} />;
      case "text":
        return <TextBlock key={block.id} content={block.content} />;
      case "media":
        return <MediaBlock key={block.id} content={block.content} />;
      case "cta":
        return <CtaBlock key={block.id} content={block.content} />;
      case "home_hero":
        return (
          <HeroDuplicate
            key={block.id}
            content={{
              title: text(block.content, "title"),
              mobileTitle: text(block.content, "mobileTitle"),
              description: text(block.content, "description"),
              buttonLabel: text(block.content, "buttonLabel"),
              buttonUrl: text(block.content, "buttonUrl"),
              desktopVideoUrl: text(block.content, "desktopVideoUrl"),
              mobileVideoUrl: text(block.content, "mobileVideoUrl"),
              posterUrl: text(block.content, "posterUrl"),
            }}
          />
        );
      case "home_stats":
        return (
          <div key={block.id} className="col-span-12 block w-[calc(100%+2*var(--page-margin))] -ml-[var(--page-margin)] border-b border-brand-gray/10 md:hidden">
            <StatsBlock />
          </div>
        );
      case "home_clients":
        return <ClientLogosBlock key={block.id} />;
      case "home_services":
        return <ServicesAnimate key={block.id} />;
      case "home_work_cases": {
        const savedHrefs = parseSelectedHrefs(block.content.selectedHrefs);
        const customCases = savedHrefs && caseItems
          ? savedHrefs.flatMap((href) => {
              const item = caseItems.find((c) => c.href === href);
              return item ? [item] : [];
            })
          : undefined;

        return (
          <HeroScrollAnimation
            key={block.id}
            cover={<WorkStages />}
            second={<CasesMasonrySection customCases={customCases} />}
          />
        );
      }
      case "home_team":
        return (
          <Team
            key={block.id}
            heading={text(block.content, "heading")}
            description={text(block.content, "description")}
          />
        );
      case "home_contact":
        return (
          <ContactSection
            key={block.id}
            title={text(block.content, "title")}
            description={text(block.content, "description")}
          />
        );
      default:
        return null;
    }
  });
}
