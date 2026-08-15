import * as React from "react"
import { addPropertyControls, ControlType } from "framer"

interface ServiceItem {
    serviceTitle: string
    serviceText: string
    serviceIconKey: string
    serviceIconImage: any
}
interface MaterialItem {
    materialName: string
    materialText: string
}
interface ProcessStep {
    stepTitle: string
    stepText: string
}
interface PortfolioItem {
    portfolioImage: any
    portfolioTitle: string
    portfolioDesc: string
    portfolioSpec1Label: string
    portfolioSpec1Value: string
    portfolioSpec2Label: string
    portfolioSpec2Value: string
    portfolioSpec3Label: string
    portfolioSpec3Value: string
}
interface TestimonialItem {
    quote: string
    name: string
    role: string
}
interface FaqItem {
    question: string
    answer: string
}
interface StatItem {
    statValue: string
    statLabel: string
}
interface HeroSlide {
    heroImage: any
    heroSlideTitle: string
    heroSlideText: string
}

interface NavbarGroup {
    showNavbar: boolean
    logoText: string
    logoImage: any
    navLabel1: string
    navLink1: string
    navLabel2: string
    navLink2: string
    navLabel3: string
    navLink3: string
    navLabel4: string
    navLink4: string
    navLabel5: string
    navLink5: string
    ctaText: string
    ctaLink: string
}

interface GlobalStyleGroup {
    bgColor: string
    textColor: string
    textMutedColor: string
    accentColor: string
    accentColor2: string
    bgTintColor: string
    hoverHaloColor: string
    cardShadowColor: string
    buttonTextColor: string
    buttonBorderColor: string
    dotColor: string
    headingFont: string
    bodyFont: string
    resetColors: boolean
}

interface HeroGroup {
    showHero: boolean
    heroHeading: string
    heroHeadingHighlight: string
    heroText: string
    heroCtaText: string
    heroCtaLink: string
    slides: HeroSlide[]
    heroGalleryWidth: number
    heroGalleryHeight: number
    heroGalleryAutoplay: boolean
    heroGalleryAutoplaySpeed: number
}

interface StatsGroup {
    showStats: boolean
    stats: StatItem[]
}

interface AboutGroup {
    showAbout: boolean
    aboutTag: string
    aboutHeading: string
    aboutText: string
    aboutImage: any
    spoolColor: string
}

interface ServicesGroup {
    showServices: boolean
    servicesTag: string
    servicesHeading: string
    services: ServiceItem[]
}

interface ProcessGroup {
    showProcess: boolean
    processTag: string
    processHeading: string
    steps: ProcessStep[]
}

interface MaterialsGroup {
    showMaterials: boolean
    materialsTag: string
    materialsHeading: string
    materials: MaterialItem[]
}

interface PortfolioGroup {
    showPortfolio: boolean
    portfolioTag: string
    portfolioHeading: string
    items: PortfolioItem[]
    modalAccentColor: string
}

interface TestimonialsGroup {
    showTestimonials: boolean
    testimonialsTag: string
    testimonialsHeading: string
    testimonials: TestimonialItem[]
}

interface FaqGroup {
    showFaq: boolean
    faqTag: string
    faqHeading: string
    items: FaqItem[]
}

interface ContactGroup {
    showContact: boolean
    contactTag: string
    contactHeading: string
    contactText: string
    email: string
    phone: string
    address: string
    showMap: boolean
    mapAddress: string
    mapTintColor: string
    mapTintStrength: number
    mapGrayscale: boolean
}

interface FooterGroup {
    showFooter: boolean
    footerMotto: string
    instagramLink: string
    facebookLink: string
    linkedinLink: string
}

interface Props {
    navbar: NavbarGroup
    globalStyle: GlobalStyleGroup
    hero: HeroGroup
    stats: StatsGroup
    about: AboutGroup
    services: ServicesGroup
    process: ProcessGroup
    materials: MaterialsGroup
    portfolio: PortfolioGroup
    testimonials: TestimonialsGroup
    faq: FaqGroup
    contact: ContactGroup
    footer: FooterGroup
}

const DEFAULT_HEADING_FONT = "'Space Grotesk', sans-serif"
const DEFAULT_BODY_FONT = "Inter, sans-serif"
// Original mockup palette, used as the fallback for every color control
// and restored in full by the "Reset Colors" switch below.
const DEFAULT_BG_COLOR = "#F8F8FC"
const DEFAULT_TEXT_COLOR = "#1a1a2e"
const DEFAULT_TEXT_MUTED_COLOR = "#666666"
const DEFAULT_ACCENT_COLOR = "#6C3BFF"
const DEFAULT_ACCENT2_COLOR = "#CDB7FF"
const DEFAULT_BG_TINT_COLOR = "#8A5BFF"
const DEFAULT_HALO_COLOR = "rgba(138,91,255,0.35)"
const DEFAULT_CARD_SHADOW_COLOR = "#6C3BFF"
const DEFAULT_SPOOL_COLOR = "#6C3BFF"
const DEFAULT_BUTTON_TEXT_COLOR = "#6C3BFF"
const DEFAULT_BUTTON_BORDER_COLOR = "rgba(108,59,255,0.55)"
const DEFAULT_DOT_COLOR = "#6C3BFF"
const DEFAULT_MODAL_ACCENT_COLOR = "#6C3BFF"
const DEFAULT_MAP_TINT_COLOR = "#6C3BFF"
const REVEAL_FALLBACK_MS = 900
const BURST_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315]

// --- Stack card layering, matches the HTML mockup's render() logic ---
const STACK_OFFSETS = [
    { y: 0, scale: 1, rotate: 0, opacity: 1, z: 10 },
    { y: 18, scale: 0.94, rotate: 2, opacity: 0.85, z: 9 },
    { y: 32, scale: 0.88, rotate: -2, opacity: 0.6, z: 8 },
]
const STACK_FALLBACK = { y: 45, scale: 0.82, rotate: 0, opacity: 0, z: 1 }

function getStackStyle(offset: number): React.CSSProperties {
    const cfg = STACK_OFFSETS[offset] || STACK_FALLBACK
    return {
        transform: `translateY(${cfg.y}px) scale(${cfg.scale}) rotate(${cfg.rotate}deg)`,
        zIndex: cfg.z,
        opacity: cfg.opacity,
    }
}

function resolveImageSrc(value: any): string {
    if (!value) return ""
    if (typeof value === "string") return value
    if (typeof value === "object") {
        if (typeof value.src === "string" && value.src) return value.src
        if (typeof value.url === "string" && value.url) return value.url
    }
    return ""
}

function t(value: string | undefined | null, fallback: string): string {
    if (typeof value === "string" && value.trim().length > 0) return value
    return fallback
}

// Treat an unset/undefined "show section" flag as visible (true),
// so older instances without the control keep rendering as before.
function visible(flag: boolean | undefined): boolean {
    return flag !== false
}

function SizeHint({ text }: { text: string }) {
    return (
        <div className="lbc-size-hint">
            <span>Ideal Resolution</span>
            <strong>{text}</strong>
        </div>
    )
}

function FireworkBurst() {
    return (
        <>
            {BURST_ANGLES.map((angle, idx) => (
                <span
                    key={idx}
                    className="lbc-fw-particle"
                    style={{
                        ["--angle" as any]: `${angle}deg`,
                        animationDelay: `${idx * 12}ms`,
                    }}
                />
            ))}
        </>
    )
}

function AboutSpool({
    reduceMotion,
    spoolColor,
}: {
    reduceMotion: boolean
    spoolColor: string
}) {
    // Single-color spool: every shape uses the same `base` hue, with
    // opacity as the only depth cue (no white/black tint mixing), so the
    // whole illustration reads as one flat, editable color.
    const base = spoolColor || DEFAULT_SPOOL_COLOR

    return (
        <div
            className="lbc-spool-wrap"
            style={{
                filter: `drop-shadow(0 4px 16px color-mix(in srgb, ${base} 40%, transparent))`,
            }}
        >
            <svg viewBox="-10 0 320 340" xmlns="http://www.w3.org/2000/svg">
                <rect
                    x="0"
                    y="130"
                    width="18"
                    height="70"
                    rx="3"
                    fill={base}
                    opacity="0.85"
                />
                <circle cx="9" cy="142" r="2.5" fill={base} opacity="0.55" />
                <circle cx="9" cy="188" r="2.5" fill={base} opacity="0.55" />

                <rect
                    x="16"
                    y="158"
                    width="134"
                    height="14"
                    rx="6"
                    fill={base}
                    opacity="0.9"
                />
                <rect
                    x="16"
                    y="158"
                    width="134"
                    height="5"
                    rx="2.5"
                    fill="#FFFFFF"
                    opacity="0.2"
                />

                <path
                    d="M18,196 L120,172"
                    stroke={base}
                    strokeWidth="8"
                    strokeLinecap="round"
                    opacity="0.85"
                />

                <circle cx="150" cy="165" r="16" fill={base} />
                <circle cx="150" cy="165" r="9" fill="#FFFFFF" opacity="0.85" />

                <circle cx="150" cy="165" r="76" fill={base} opacity="0.1" />

                <g
                    className={`lbc-spool-reel ${reduceMotion ? "is-paused" : ""}`}
                    style={{ transformOrigin: "150px 165px" }}
                >
                    <circle
                        cx="150"
                        cy="165"
                        r="70"
                        fill="none"
                        stroke={base}
                        strokeWidth="1.4"
                        opacity="0.35"
                    />
                    <circle
                        cx="150"
                        cy="165"
                        r="64"
                        fill="none"
                        stroke={base}
                        strokeWidth="1.2"
                        opacity="0.5"
                    />
                    <circle
                        cx="150"
                        cy="165"
                        r="58"
                        fill="none"
                        stroke={base}
                        strokeWidth="1.4"
                        opacity="0.35"
                    />
                    <circle
                        cx="150"
                        cy="165"
                        r="52"
                        fill="none"
                        stroke={base}
                        strokeWidth="1.2"
                        opacity="0.5"
                    />
                    <circle
                        cx="150"
                        cy="165"
                        r="46"
                        fill="none"
                        stroke={base}
                        strokeWidth="1.4"
                        opacity="0.35"
                    />
                    <circle
                        cx="150"
                        cy="165"
                        r="40"
                        fill="none"
                        stroke={base}
                        strokeWidth="1.2"
                        opacity="0.5"
                    />
                    <circle
                        cx="150"
                        cy="165"
                        r="34"
                        fill="none"
                        stroke={base}
                        strokeWidth="1.4"
                        opacity="0.35"
                    />
                    <circle
                        cx="150"
                        cy="165"
                        r="24"
                        fill="#FFFFFF"
                        opacity="0.9"
                        stroke={base}
                        strokeWidth="2.5"
                    />
                    <path
                        d="M150,151 L162,158 L162,172 L150,179 L138,172 L138,158 Z"
                        fill="none"
                        stroke={base}
                        strokeWidth="1.8"
                    />
                </g>

                <circle
                    cx="150"
                    cy="165"
                    r="76"
                    fill="none"
                    stroke={base}
                    strokeWidth="3.5"
                />

                <path
                    className="lbc-filament-strand"
                    d="M150,89 Q225,94.00 300,90"
                    fill="none"
                    stroke={base}
                    strokeWidth="3"
                    strokeLinecap="round"
                    opacity="0.8"
                >
                    {!reduceMotion && (
                        <animate
                            attributeName="d"
                            dur="4s"
                            repeatCount="indefinite"
                            calcMode="spline"
                            keyTimes="0.0;0.1;0.2;0.3;0.4;0.5;0.6;0.7;0.8;0.9;1.0"
                            keySplines="0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1"
                            values="M150,89 Q225,94.00 300,90;M150,89 Q225,96.35 300,90;M150,89 Q225,97.80 300,90;M150,89 Q225,97.80 300,90;M150,89 Q225,96.35 300,90;M150,89 Q225,94.00 300,90;M150,89 Q225,91.65 300,90;M150,89 Q225,90.20 300,90;M150,89 Q225,90.20 300,90;M150,89 Q225,91.65 300,90;M150,89 Q225,94.00 300,90"
                        />
                    )}
                </path>
            </svg>
        </div>
    )
}

function ServiceIcon({ iconKey }: { iconKey: string }) {
    if (iconKey === "printer") {
        return (
            <svg
                className="icon-outline"
                width="28"
                height="28"
                viewBox="0 0 24 24"
            >
                <path d="M4 4h16" strokeLinecap="round" />
                <path d="M4 4v14M20 4v14" strokeLinecap="round" />
                <rect
                    x="10"
                    y="6.5"
                    width="4"
                    height="2.5"
                    rx="0.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path d="M12 9v3" strokeLinecap="round" />
                <path
                    d="M8 15h8v3.5a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V15Z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path d="M8 17h8" strokeLinecap="round" />
            </svg>
        )
    }
    if (iconKey === "design") {
        return (
            <svg
                className="icon-outline"
                width="28"
                height="28"
                viewBox="0 0 24 24"
            >
                <text
                    x="12"
                    y="6"
                    textAnchor="middle"
                    fontSize="6.5"
                    fontWeight="700"
                    fill="currentColor"
                    stroke="none"
                    fontFamily="Inter, sans-serif"
                >
                    3D
                </text>
                <path
                    d="M12 9l6 3.4v6.8L12 22.6l-6-3.4v-6.8L12 9Z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    transform="scale(0.85) translate(2,-1)"
                />
                <path
                    d="M6 12.4l6 3.4 6-3.4M12 15.8v6.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    transform="scale(0.85) translate(2,-1)"
                />
            </svg>
        )
    }
    if (iconKey === "prototype") {
        return (
            <svg
                className="icon-outline"
                width="28"
                height="28"
                viewBox="0 0 24 24"
            >
                <path
                    d="M9 2h6M10 2v6.5L5.5 17a2 2 0 0 0 1.8 3h9.4a2 2 0 0 0 1.8-3L14 8.5V2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path d="M7.5 14h9" strokeLinecap="round" />
                <circle
                    cx="10.5"
                    cy="16.5"
                    r="0.6"
                    fill="currentColor"
                    stroke="none"
                />
                <circle
                    cx="14"
                    cy="17.5"
                    r="0.6"
                    fill="currentColor"
                    stroke="none"
                />
                <circle
                    cx="12"
                    cy="19"
                    r="0.6"
                    fill="currentColor"
                    stroke="none"
                />
            </svg>
        )
    }
    if (iconKey === "manufacturing") {
        return (
            <svg
                className="icon-outline"
                width="28"
                height="28"
                viewBox="0 0 24 24"
            >
                <rect
                    x="10"
                    y="6"
                    width="7"
                    height="6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path d="M10 9h7" strokeLinecap="round" />
                <path
                    d="M2 16a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v0Z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <circle cx="6" cy="20" r="1.3" strokeLinecap="round" />
                <circle cx="18" cy="20" r="1.3" strokeLinecap="round" />
                <path d="M6 18v-2M18 18v-2" strokeLinecap="round" />
            </svg>
        )
    }
    if (iconKey === "scan") {
        return (
            <svg
                className="icon-outline"
                width="28"
                height="28"
                viewBox="0 0 24 24"
            >
                <rect
                    x="3"
                    y="4"
                    width="7"
                    height="7"
                    rx="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path d="M6.5 7.5v0" strokeLinecap="round" />
                <path
                    d="M10.5 5l3-1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M10.5 9.5l3 1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <circle cx="15.5" cy="6.5" r="2.3" strokeLinecap="round" />
                <path d="M17.2 8.2l1.3 1.3" strokeLinecap="round" />
                <path
                    d="M4 15l4 6M12 15l0 6M20 15l-4 6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path d="M2 15h20" strokeLinecap="round" />
            </svg>
        )
    }
    if (iconKey === "wrench") {
        return (
            <svg
                className="icon-outline"
                width="28"
                height="28"
                viewBox="0 0 24 24"
            >
                <path
                    d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94L5.34 21.66a2 2 0 0 1-2.83-2.83L10.7 10.66a6 6 0 0 1 7.94-7.94Z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        )
    }
    if (iconKey === "consulting") {
        return (
            <svg
                className="icon-outline"
                width="28"
                height="28"
                viewBox="0 0 24 24"
            >
                <path
                    d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        )
    }
    return (
        <svg
            className="icon-outline"
            width="28"
            height="28"
            viewBox="0 0 24 24"
        >
            <path d="M4 4h16" strokeLinecap="round" />
            <path d="M4 4v14M20 4v14" strokeLinecap="round" />
            <rect
                x="10"
                y="6.5"
                width="4"
                height="2.5"
                rx="0.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path d="M12 9v3" strokeLinecap="round" />
            <path
                d="M8 15h8v3.5a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V15Z"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path d="M8 17h8" strokeLinecap="round" />
        </svg>
    )
}

function SpecClockIcon() {
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    )
}

function SpecWeightIcon() {
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 2 3 7l9 5 9-5-9-5z" />
            <path d="M3 7v10l9 5 9-5V7" />
            <path d="M12 12v10" />
        </svg>
    )
}

function SpecMaterialIcon() {
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
        </svg>
    )
}

function InstagramIcon() {
    return (
        <svg className="icon-outline" width="20" height="20" viewBox="0 0 24 24">
            <rect
                x="2"
                y="2"
                width="20"
                height="20"
                rx="5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <circle cx="12" cy="12" r="4" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="17.5" cy="6.5" r="0.9" fill="var(--lbc-accent)" stroke="none" />
        </svg>
    )
}

function LinkedInIcon() {
    return (
        <svg className="icon-outline" width="20" height="20" viewBox="0 0 24 24">
            <path
                d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <rect x="2" y="9" width="4" height="12" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="4" cy="4" r="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}

function FacebookIcon() {
    return (
        <svg className="icon-outline" width="20" height="20" viewBox="0 0 24 24">
            <path
                d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}

// ============================================================
// CSS (defined before the component so it is never referenced
// before initialization). Sizes ~121.5% of original,
// hover halo driven by --lbc-halo-color, resting card shadows driven by
// --lbc-card-shadow (glass cards, material/portfolio stack cards, modal
// nav arrows).
// ============================================================
const CSS_TEXT = `
.lbc-root { position: relative; box-sizing: border-box; }
.lbc-root * { box-sizing: border-box; }
.lbc-root a { text-decoration: none; color: inherit; }
.lbc-root img { display: block; max-width: 100%; }
.lbc-root h1, .lbc-root h2, .lbc-root h3 { font-family: var(--lbc-heading-font); font-weight: 500; margin: 0; }

.icon-outline { stroke: var(--lbc-accent); fill: none; stroke-width: 1.75; display: inline-block; vertical-align: middle; transition: filter .25s ease, opacity .25s ease; }

.lbc-reveal { opacity: 0; transform: translateY(24px); transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1); }
.lbc-reveal.is-visible { opacity: 1; transform: translateY(0); }

.lbc-size-hint { position: absolute; inset: 0; z-index: 3; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.32rem; text-align: center; pointer-events: none; background: rgba(108,59,255,0.08); border: 1px dashed rgba(108,59,255,0.35); border-radius: inherit; }
.lbc-size-hint span { font-size: 0.73rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--lbc-accent); }
.lbc-size-hint strong { font-size: 1.03rem; font-weight: 600; color: var(--lbc-text); }

.lbc-glass {
  background: rgba(255,255,255,0.45);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid rgba(255,255,255,0.35);
  border-radius: 26px;
  box-shadow: 0 3px 10px color-mix(in srgb, var(--lbc-card-shadow) 20%, transparent), 0 20px 44px color-mix(in srgb, var(--lbc-card-shadow) 18%, transparent), inset 0 1px 1px rgba(255,255,255,0.6);
  position: relative;
  transition: transform .3s ease, box-shadow .3s ease;
}
.lbc-glass:hover { transform: translateY(-5px) scale(1.02); box-shadow: 0 0 54px var(--lbc-halo-color), 0 20px 44px color-mix(in srgb, var(--lbc-card-shadow) 18%, transparent); }

.lbc-tag { font-size: 0.97rem; text-transform: uppercase; letter-spacing: 3px; color: var(--lbc-accent); margin-bottom: 14px; display: block; }
.lbc-text-gradient { background: linear-gradient(135deg, var(--lbc-accent), var(--lbc-accent2)); -webkit-background-clip: text; background-clip: text; color: transparent; }

.lbc-btn {
  padding: 14px 34px; font-size: 1.03rem; font-weight: 500; color: var(--lbc-btn-text-color);
  cursor: pointer; display: inline-block; border-radius: 999px;
  background: rgba(255,255,255,0.5); border: 1.5px solid var(--lbc-btn-border-color);
  transition: transform .25s ease, box-shadow .25s ease, background .25s ease;
}
.lbc-btn:hover { transform: translateY(-2px); background: rgba(255,255,255,0.75); box-shadow: 0 4px 14px var(--lbc-btn-border-color); }

.lbc-nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 50; display: flex; align-items: center; justify-content: space-between;
  padding: 20px 59px; background: rgba(255,255,255,0.65); backdrop-filter: blur(14px) saturate(180%);
  -webkit-backdrop-filter: blur(14px) saturate(180%); border-bottom: 1px solid rgba(255,255,255,0.45);
  box-shadow: 0 4px 24px color-mix(in srgb, var(--lbc-card-shadow) 14%, transparent); isolation: isolate;
}
.lbc-logo { font-size: 1.58rem; font-weight: 600; font-family: var(--lbc-heading-font); display: flex; align-items: center; }
.lbc-logo-img { height: 42px; width: auto; max-width: 220px; object-fit: contain; }
.lbc-nav-links { display: flex; gap: 39px; list-style: none; margin: 0; padding: 0; }
.lbc-nav-links a { color: var(--lbc-text-muted); font-size: 1.1rem; transition: color .2s; }
.lbc-nav-links a:hover { color: var(--lbc-accent); }

.lbc-hamburger { display: none; flex-direction: column; justify-content: center; gap: 5px; width: 39px; height: 39px; background: none; border: none; cursor: pointer; z-index: 60; }
.lbc-hamburger span { display: block; width: 100%; height: 2.9px; background: var(--lbc-accent); border-radius: 2px; transition: transform .3s ease, opacity .3s ease; }
.lbc-hamburger.is-open span:nth-child(1) { transform: translateY(9px) rotate(45deg); }
.lbc-hamburger.is-open span:nth-child(2) { opacity: 0; }
.lbc-hamburger.is-open span:nth-child(3) { transform: translateY(-9px) rotate(-45deg); }

.lbc-mobile-menu {
  position: fixed; inset: 0; z-index: 55; background: rgba(255,255,255,0.9); backdrop-filter: blur(30px) saturate(160%);
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 39px;
  opacity: 0; visibility: hidden; transform: translateY(-16px); transition: opacity .35s ease, transform .35s ease, visibility .35s ease;
}
.lbc-mobile-menu.is-open { opacity: 1; visibility: visible; transform: translateY(0); }
.lbc-mobile-menu ul { list-style: none; display: flex; flex-direction: column; align-items: center; gap: 34px; margin: 0; padding: 0; }
.lbc-mobile-menu ul a { font-size: 1.7rem; font-weight: 500; color: var(--lbc-text); }

.lbc-hero {
  min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; position: relative; overflow: hidden; padding: 170px 29px 97px;
  background:
    radial-gradient(circle at 20% 20%, color-mix(in srgb, var(--lbc-bg-tint) 3%, transparent), transparent 45%),
    radial-gradient(circle at 80% 30%, color-mix(in srgb, var(--lbc-bg-tint) 2.5%, transparent), transparent 50%),
    radial-gradient(circle at 50% 90%, color-mix(in srgb, var(--lbc-bg-tint) 4%, transparent), transparent 55%);
}
.lbc-hero-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 73px; align-items: center; max-width: 1337px; width: 100%; margin: 0 auto; position: relative; z-index: 2; }
.lbc-hero-textbox { padding: 59px 53px; text-align: left; min-width: 0; }
.lbc-hero-textbox h1 { font-size: clamp(2.19rem, 6.3vw, 3.65rem); line-height: 1.15; }
.lbc-hero-textbox p { max-width: 729px; margin: 29px 0 0; font-weight: 300; color: var(--lbc-text-muted); font-size: 1.27rem; }
.lbc-cta { margin-top: 49px; display: flex; gap: 20px; flex-wrap: wrap; }

.lbc-hero-gallery-box { padding: 39px 24px; display: flex; flex-direction: column; align-items: center; gap: 10px; min-width: 0; width: 100%; }
.lbc-material-stack-wrapper { display: flex; align-items: center; justify-content: center; gap: 14px; max-width: 100%; width: 100%; margin: 0 auto; }
.lbc-material-stack { position: relative; width: min(364px, 60vw); height: min(364px, 60vw); flex-shrink: 1; perspective: 900px; }
.lbc-material-stack.lbc-hero-stack { width: min(var(--lbc-hero-stack-w, 364px), 60vw); height: min(var(--lbc-hero-stack-h, 364px), 60vw); }
.lbc-material-stack-card {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 29px;
  background: linear-gradient(135deg, var(--lbc-accent2), var(--lbc-accent));
  box-shadow: 0 16px 41px color-mix(in srgb, var(--lbc-card-shadow) 32%, transparent);
  transition: transform .5s cubic-bezier(0.16,1,0.3,1), opacity .5s ease, box-shadow .3s ease, z-index 0s;
  background-size: cover; background-position: center;
  transform-origin: center bottom;
}
.lbc-material-stack-card:hover { box-shadow: 0 0 54px var(--lbc-halo-color), 0 16px 41px color-mix(in srgb, var(--lbc-card-shadow) 32%, transparent); }
.lbc-material-card-inner { height: 100%; display: flex; flex-direction: column; justify-content: flex-end; padding: 34px; color: #fff; }
.lbc-material-card-inner h3 { font-size: 1.7rem; margin-bottom: 10px; }
.lbc-material-card-inner p { font-size: 1.1rem; font-weight: 300; opacity: 0.9; margin: 0; }
.lbc-material-stack-card.has-image { background-color: #fff; border: 1px solid var(--lbc-accent); box-shadow: 0 16px 41px color-mix(in srgb, var(--lbc-card-shadow) 22%, transparent); cursor: pointer; }
.lbc-material-stack-card.has-image:hover { box-shadow: 0 0 54px var(--lbc-halo-color); }
.lbc-material-stack-card.has-image .lbc-material-card-inner { display: none; }

.lbc-stack-nav { width: 49px; height: 49px; border-radius: 50%; background: rgba(255,255,255,0.6); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.6); color: var(--lbc-accent); font-size: 1.58rem; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: transform .2s ease, background .2s ease; }
.lbc-stack-nav:hover { transform: scale(1.08); background: rgba(255,255,255,0.85); }
.lbc-stack-dots { display: flex; justify-content: center; gap: 10px; margin-top: 24px; }
.lbc-stack-dot { width: 10px; height: 10px; border-radius: 50%; background: color-mix(in srgb, var(--lbc-dot-color) 25%, transparent); cursor: pointer; transition: background .25s ease, transform .25s ease; }
.lbc-stack-dot.active { background: var(--lbc-dot-color); transform: scale(1.3); }

.lbc-stats { padding: 73px 29px; }
.lbc-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; max-width: 1337px; margin: 0 auto; }
.lbc-stat-card { padding: 44px 24px; text-align: center; }
.lbc-stat-val { font-size: 2.67rem; font-weight: 500; font-family: var(--lbc-heading-font); color: var(--lbc-accent); }
.lbc-stat-lbl { font-size: 0.97rem; color: var(--lbc-text-muted); margin-top: 10px; }

.lbc-about-section { padding: 97px 29px; }
.lbc-about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 73px; align-items: center; max-width: 1337px; margin: 0 auto; }
.lbc-about-model { position: relative; height: 413px; display: flex; align-items: center; justify-content: center; overflow: visible; }
.lbc-about-img { width: 100%; height: 100%; object-fit: cover; border-radius: 29px; }
.lbc-about-text { color: var(--lbc-text-muted); font-weight: 300; line-height: 1.7; margin-top: 20px; max-width: 608px; font-size: 1.1rem; }

.lbc-spool-wrap { width: 100%; max-width: 364px; height: 100%; margin: 0 auto; }
.lbc-spool-wrap svg { width: 100%; height: 100%; overflow: visible; }
.lbc-spool-reel { animation: lbcSpoolSpin 7s linear infinite; }
.lbc-spool-reel.is-paused { animation: none; }
@keyframes lbcSpoolSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.lbc-section-head { text-align: center; max-width: 729px; margin: 0 auto 73px; }
.lbc-section-head h2 { font-size: clamp(2.19rem, 6vw, 3.16rem); }

.lbc-services-section, .lbc-process-section, .lbc-materials-section, .lbc-portfolio-section, .lbc-testimonials-section, .lbc-faq-section, .lbc-contact-section { padding: 97px 29px; }
.lbc-services-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 29px; max-width: 1337px; margin: 0 auto; }
.lbc-service-card { padding: 49px 39px; text-align: left; }
.lbc-service-icon { width: 68px; height: 68px; border-radius: 22px; border: 1px solid rgba(108,59,255,.25); background: transparent; display: flex; align-items: center; justify-content: center; margin-bottom: 24px; transition: transform .25s ease; }
.lbc-service-card:hover .lbc-service-icon { transform: scale(1.08); }
.lbc-service-icon-img { width: 32px; height: 32px; object-fit: contain; }
.lbc-service-card h3 { font-size: 1.46rem; margin-bottom: 13px; }
.lbc-service-card p { font-size: 1.1rem; color: var(--lbc-text-muted); font-weight: 300; line-height: 1.6; margin: 0; }

.lbc-timeline { max-width: 851px; margin: 0 auto; position: relative; padding-left: 73px; display: flex; flex-direction: column; gap: 44px; }
.lbc-timeline-line-bg { position: absolute; width: 5px; background: var(--lbc-accent2); opacity: 0.4; z-index: 0; border-radius: 4px; }
.lbc-timeline-line-progress { position: absolute; width: 5px; background: var(--lbc-accent); z-index: 0; border-radius: 4px; transition: height 0.15s linear; }
.lbc-timeline-step { position: relative; z-index: 2; }
.lbc-timeline-num {
  position: absolute; left: -73px; top: 50%; transform: translateY(-50%); width: 44px; height: 44px; border-radius: 50%;
  background: var(--lbc-accent); border: none; color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.03rem; font-weight: 600; z-index: 2; overflow: visible;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.lbc-timeline-num.active { transform: translateY(-50%) scale(1.12); box-shadow: 0 8px 22px color-mix(in srgb, var(--lbc-card-shadow) 45%, transparent); }
.lbc-timeline-card { padding: 22px 29px; opacity: 0.4; transform: scale(0.94) translateX(-6px); transition: opacity 0.5s ease, transform 0.5s cubic-bezier(0.16,1,0.3,1), box-shadow .3s ease; }
.lbc-timeline-card.is-expanded { opacity: 1; transform: scale(1) translateX(0); }
.lbc-timeline-card h3 { font-size: 1.27rem; margin-bottom: 7px; }
.lbc-timeline-card p { font-size: 1.07rem; color: var(--lbc-text-muted); font-weight: 300; margin: 0; }

.lbc-fw-particle {
  position: absolute; top: 50%; left: 50%; width: 7px; height: 7px; border-radius: 50%;
  pointer-events: none; opacity: 0; transform: translate(-50%,-50%);
  background: var(--lbc-accent2); box-shadow: 0 0 6px var(--lbc-accent);
  animation: lbcFwBurst 0.8s ease-out forwards; z-index: 5;
}
@keyframes lbcFwBurst {
  0% { opacity: 1; transform: translate(-50%,-50%) rotate(var(--angle)) translateX(0) scale(1); }
  70% { opacity: 1; transform: translate(-50%,-50%) rotate(var(--angle)) translateX(27px) scale(0.4); }
  100% { opacity: 0; transform: translate(-50%,-50%) rotate(var(--angle)) translateX(29px) scale(0.2); }
}

.lbc-testimonial-wrap { display: flex; gap: 29px; max-width: 1094px; margin: 0 auto; flex-wrap: wrap; justify-content: center; }
.lbc-testimonial-card { flex: 1 1 389px; padding: 49px 39px; text-align: center; }
.lbc-stars { color: var(--lbc-accent); font-size: 1.22rem; margin-bottom: 17px; }
.lbc-testimonial-card p { font-style: italic; font-weight: 300; color: var(--lbc-text-muted); font-size: 1.1rem; }
.lbc-t-name { margin-top: 20px; font-weight: 500; font-size: 1.1rem; }
.lbc-t-role { font-size: 0.97rem; color: var(--lbc-text-muted); }

.lbc-faq-wrap { max-width: 790px; margin: 0 auto; display: flex; flex-direction: column; gap: 17px; }
.lbc-faq-item { overflow: hidden; }
.lbc-faq-q { padding: 27px 34px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; font-weight: 500; gap: 14px; font-size: 1.15rem; }
.lbc-faq-toggle { color: var(--lbc-accent); font-size: 1.46rem; flex-shrink: 0; }
.lbc-faq-a { padding: 0 34px; max-height: 0; overflow: hidden; opacity: 0; transition: max-height .4s ease, padding .4s ease, opacity .3s ease; font-size: 1.07rem; color: var(--lbc-text-muted); font-weight: 300; line-height: 1.6; }
.lbc-faq-item.open .lbc-faq-a { padding: 0 34px 27px; max-height: 292px; opacity: 1; }

.lbc-contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 29px; max-width: 1215px; margin: 0 auto; }
.lbc-contact-form { padding: 44px; display: flex; flex-direction: column; gap: 20px; min-width: 0; }
.lbc-form-field input, .lbc-form-field textarea {
  width: 100%; border: 1.5px solid rgba(108,59,255,.35); background: rgba(255,255,255,.55); border-radius: 16px;
  padding: 17px 22px; font-family: var(--lbc-body-font); font-size: 1.1rem; outline: none; transition: border-color .2s ease, background .2s ease;
}
.lbc-form-field input:focus, .lbc-form-field textarea:focus { border-color: rgba(108,59,255,.7); background: rgba(255,255,255,.7); }
.lbc-submit-btn-wrap { align-self: flex-start; }
.lbc-btn-fill { display: none; }
.lbc-contact-info { padding: 44px; display: flex; flex-direction: column; gap: 24px; justify-content: center; font-size: 1.12rem; min-width: 0; }
.lbc-contact-info a { color: var(--lbc-accent); }

.lbc-map-box { position: relative; max-width: 1215px; margin: 29px auto 0; height: 340px; overflow: hidden; }
.lbc-map-frame { position: absolute; inset: 0; }
.lbc-map-frame iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; display: block; }
.lbc-map-tint { position: absolute; inset: 0; pointer-events: none; mix-blend-mode: color; z-index: 2; }

.lbc-footer { padding: 73px 29px; text-align: center; }
.lbc-footer-card { max-width: 1094px; margin: 0 auto; padding: 61px; display: flex; flex-direction: column; align-items: center; gap: 17px; }
.lbc-flogo { font-size: 1.58rem; font-weight: 600; font-family: var(--lbc-heading-font); }
.lbc-fmotto { color: var(--lbc-text-muted); font-weight: 300; font-size: 1.1rem; }
.lbc-socials { display: flex; gap: 20px; align-items: center; }
.lbc-socials a { display: inline-flex; align-items: center; justify-content: center; transition: transform .25s ease; }
.lbc-socials a:hover { transform: scale(1.08); }
.lbc-socials a:hover .icon-outline { filter: drop-shadow(0 0 8px color-mix(in srgb, var(--lbc-accent) 55%, transparent)); opacity: .85; }

.lbc-product-modal {
  position: fixed; inset: 0; z-index: 210; background: rgba(26,26,46,0.45); backdrop-filter: blur(20px) saturate(160%);
  -webkit-backdrop-filter: blur(20px) saturate(160%);
  display: flex; align-items: center; justify-content: center; opacity: 0; visibility: hidden;
  transition: opacity .3s ease, visibility .3s ease; padding: 29px;
}
.lbc-product-modal.is-open { opacity: 1; visibility: visible; }
.lbc-product-modal-inner { position: relative; max-width: 996px; width: 100%; }
.lbc-product-card {
  background: rgba(255,255,255,0.92); backdrop-filter: blur(30px) saturate(180%); -webkit-backdrop-filter: blur(30px) saturate(180%);
  border-radius: 39px; border: 1px solid rgba(255,255,255,0.6); box-shadow: 0 24px 65px color-mix(in srgb, var(--lbc-modal-accent) 35%, transparent), inset 0 1px 1px rgba(255,255,255,0.7);
  max-width: 996px; width: 100%; max-height: 88vh; overflow: hidden; display: grid; grid-template-columns: 1fr 1fr;
  position: relative; transform: scale(0.85) translateY(24px); transition: transform .45s cubic-bezier(0.16,1,0.3,1);
}
.lbc-product-modal.is-open .lbc-product-card { transform: scale(1) translateY(0); }
.lbc-product-card-image { background-size: cover; background-position: center; background-repeat: no-repeat; background-color: #fff; min-height: 389px; }
.lbc-product-card-body { padding: 53px 49px; display: flex; flex-direction: column; justify-content: center; gap: 24px; overflow-y: auto; }
.lbc-product-card-body h3 { font-size: 2.07rem; font-weight: 500; line-height: 1.2; }
.lbc-product-desc { font-size: 1.15rem; color: var(--lbc-text-muted); font-weight: 300; line-height: 1.6; margin: 0; }
.lbc-product-specs { display: flex; flex-direction: column; gap: 17px; margin-top: 10px; }
.lbc-product-spec-row { display: flex; align-items: center; gap: 17px; padding: 17px 22px; background: color-mix(in srgb, var(--lbc-modal-accent) 6%, transparent); border: 1px solid color-mix(in srgb, var(--lbc-modal-accent) 18%, transparent); border-radius: 20px; }
.lbc-product-spec-icon { width: 46px; height: 46px; border-radius: 14px; background: color-mix(in srgb, var(--lbc-modal-accent) 12%, transparent); display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: var(--lbc-modal-accent); }
.lbc-product-spec-label { font-size: 0.87rem; text-transform: uppercase; letter-spacing: 1px; color: #888; margin-bottom: 3px; }
.lbc-product-spec-value { font-size: 1.22rem; font-weight: 600; color: var(--lbc-text); }
.lbc-product-card-close {
  position: absolute; top: 24px; right: 24px; width: 49px; height: 49px; border-radius: 50%;
  background: color-mix(in srgb, var(--lbc-modal-accent) 10%, transparent); border: 1px solid color-mix(in srgb, var(--lbc-modal-accent) 25%, transparent); color: var(--lbc-modal-accent);
  font-size: 1.58rem; cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: background .2s ease, transform .2s ease; z-index: 5;
}
.lbc-product-card-close:hover { background: color-mix(in srgb, var(--lbc-modal-accent) 20%, transparent); transform: scale(1.08); }
.lbc-product-modal-nav {
  position: absolute; top: 50%; transform: translateY(-50%); z-index: 220; width: 68px; height: 68px; font-size: 2.43rem;
  background: rgba(255,255,255,0.95); border: 2px solid var(--lbc-modal-accent); color: var(--lbc-modal-accent); border-radius: 50%;
  font-weight: 600; box-shadow: 0 8px 24px color-mix(in srgb, var(--lbc-modal-accent) 40%, transparent); cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: background .2s ease, transform .2s ease, box-shadow .2s ease;
}
.lbc-product-modal-nav:hover { background: var(--lbc-modal-accent); color: #fff; transform: translateY(-50%) scale(1.1); box-shadow: 0 10px 30px color-mix(in srgb, var(--lbc-modal-accent) 55%, transparent); }
.lbc-product-modal-nav.prev { left: -88px; }
.lbc-product-modal-nav.next { right: -88px; }

@media (max-width: 900px) {
  .lbc-hero-grid { grid-template-columns: 1fr; gap: 44px; }
  .lbc-about-grid, .lbc-contact-grid { grid-template-columns: 1fr; }
  .lbc-stats-grid, .lbc-services-grid { grid-template-columns: repeat(2, 1fr); }
  .lbc-material-stack { width: min(340px, 55vw); height: min(340px, 55vw); }
  .lbc-material-stack.lbc-hero-stack { width: min(var(--lbc-hero-stack-w, 340px), 55vw); height: min(var(--lbc-hero-stack-h, 340px), 55vw); }
  .lbc-product-modal-nav.prev { left: 14px; }
  .lbc-product-modal-nav.next { right: 14px; }
}

@media (max-width: 768px) {
  .lbc-product-modal-nav { width: 59px; height: 59px; font-size: 2.07rem; }
  .lbc-product-modal-nav.prev { left: 10px; }
  .lbc-product-modal-nav.next { right: 10px; }
  .lbc-product-card { grid-template-columns: 1fr; max-height: 92vh; overflow-y: auto; }
  .lbc-product-card-image { min-height: 267px; }
  .lbc-product-card-body { padding: 39px 34px; }
}

@media (max-width: 700px) {
  .lbc-root { width: 100vw !important; max-width: 100vw !important; margin-left: calc(50% - 50vw) !important; }
  .lbc-nav { padding: 17px 24px; }
  .lbc-nav-links, .lbc-nav .lbc-btn-nav { display: none; }
  .lbc-hamburger { display: flex; }
  .lbc-stats-grid, .lbc-services-grid { grid-template-columns: 1fr; }
  .lbc-hero { padding: 146px 20px 73px; }
  .lbc-hero-textbox { padding: 39px 29px; }
  .lbc-hero-gallery-box { padding: 29px 14px; }
  .lbc-material-stack-wrapper { gap: 10px; }
  .lbc-material-stack { width: min(267px, 52vw); height: min(267px, 52vw); }
  .lbc-material-stack.lbc-hero-stack { width: min(var(--lbc-hero-stack-w, 267px), 52vw); height: min(var(--lbc-hero-stack-h, 267px), 52vw); }
  .lbc-stack-nav { width: 41px; height: 41px; font-size: 1.34rem; }
  .lbc-timeline { padding-left: 59px; }
  .lbc-timeline-num { left: -59px; width: 39px; height: 39px; font-size: 0.95rem; }
  section, .lbc-stats, .lbc-about-section, .lbc-services-section, .lbc-process-section, .lbc-materials-section, .lbc-portfolio-section, .lbc-testimonials-section, .lbc-faq-section, .lbc-contact-section, .lbc-footer { padding-left: 24px; padding-right: 24px; }
  .lbc-map-box { height: 267px; }
}

@media (max-width: 380px) {
  .lbc-material-stack { width: min(219px, 48vw); height: min(219px, 48vw); }
  .lbc-material-stack.lbc-hero-stack { width: min(var(--lbc-hero-stack-w, 219px), 48vw); height: min(var(--lbc-hero-stack-h, 219px), 48vw); }
  .lbc-stack-nav { width: 37px; height: 37px; font-size: 1.22rem; }
  .lbc-material-stack-wrapper { gap: 7px; }
}

@media (prefers-reduced-motion: reduce) {
  .lbc-reveal { opacity: 1 !important; transform: none !important; transition: none !important; }
  .lbc-timeline-card { opacity: 1 !important; transform: none !important; }
  .lbc-timeline-line-progress { transition: none !important; }
  .lbc-fw-particle { display: none !important; }
  .lbc-spool-reel { animation: none !important; }
}
`

// @framerSupportedLayoutWidth any
// @framerSupportedLayoutHeight any
export default function LbcLabSite(props: Props) {
    const {
        navbar,
        globalStyle,
        hero,
        stats,
        about,
        services,
        process,
        materials,
        portfolio,
        testimonials,
        faq,
        contact,
        footer,
    } = props

    const {
        showNavbar,
        logoText,
        logoImage,
        navLabel1,
        navLink1,
        navLabel2,
        navLink2,
        navLabel3,
        navLink3,
        navLabel4,
        navLink4,
        navLabel5,
        navLink5,
        ctaText,
        ctaLink,
    } = navbar || ({} as NavbarGroup)

    const {
        bgColor,
        textColor,
        textMutedColor,
        accentColor,
        accentColor2,
        bgTintColor,
        hoverHaloColor,
        cardShadowColor,
        buttonTextColor,
        buttonBorderColor,
        dotColor,
        headingFont,
        bodyFont,
        resetColors,
    } = globalStyle || ({} as GlobalStyleGroup)

    const {
        showHero,
        heroHeading,
        heroHeadingHighlight,
        heroText,
        heroCtaText,
        heroCtaLink,
        slides,
        heroGalleryWidth,
        heroGalleryHeight,
        heroGalleryAutoplay,
        heroGalleryAutoplaySpeed,
    } = hero || ({} as HeroGroup)

    const { showStats, stats: statItems } = stats || ({} as StatsGroup)
    const {
        showAbout,
        aboutTag,
        aboutHeading,
        aboutText,
        aboutImage,
        spoolColor,
    } = about || ({} as AboutGroup)
    const {
        showServices,
        servicesTag,
        servicesHeading,
        services: serviceItems,
    } = services || ({} as ServicesGroup)
    const { showProcess, processTag, processHeading, steps } =
        process || ({} as ProcessGroup)
    const {
        showMaterials,
        materialsTag,
        materialsHeading,
        materials: materialItems,
    } = materials || ({} as MaterialsGroup)
    const {
        showPortfolio,
        portfolioTag,
        portfolioHeading,
        items: portfolioItems,
        modalAccentColor,
    } = portfolio || ({} as PortfolioGroup)
    const {
        showTestimonials,
        testimonialsTag,
        testimonialsHeading,
        testimonials: testimonialItems,
    } = testimonials || ({} as TestimonialsGroup)
    const { showFaq, faqTag, faqHeading, items: faqItems } =
        faq || ({} as FaqGroup)
    const {
        showContact,
        contactTag,
        contactHeading,
        contactText,
        email,
        phone,
        address,
        showMap,
        mapAddress,
        mapTintColor,
        mapTintStrength,
        mapGrayscale,
    } = contact || ({} as ContactGroup)
    const { showFooter, footerMotto, instagramLink, facebookLink, linkedinLink } =
        footer || ({} as FooterGroup)

    const safeSlides = React.useMemo(
        () => (slides && slides.length > 0 ? slides : []),
        [slides]
    )
    const safeStats = React.useMemo(
        () => (statItems && statItems.length > 0 ? statItems : []),
        [statItems]
    )
    const safeServices = React.useMemo(
        () => (serviceItems && serviceItems.length > 0 ? serviceItems : []),
        [serviceItems]
    )
    const safeSteps = React.useMemo(
        () => (steps && steps.length > 0 ? steps : []),
        [steps]
    )
    const safeMaterials = React.useMemo(
        () => (materialItems && materialItems.length > 0 ? materialItems : []),
        [materialItems]
    )
    const safePortfolio = React.useMemo(
        () =>
            portfolioItems && portfolioItems.length > 0 ? portfolioItems : [],
        [portfolioItems]
    )
    const safeTestimonials = React.useMemo(
        () =>
            testimonialItems && testimonialItems.length > 0
                ? testimonialItems
                : [],
        [testimonialItems]
    )
    const safeFaq = React.useMemo(
        () => (faqItems && faqItems.length > 0 ? faqItems : []),
        [faqItems]
    )

    const navItems = React.useMemo(
        () => [
            { label: t(navLabel1, "About"), link: t(navLink1, "#about") },
            { label: t(navLabel2, "Services"), link: t(navLink2, "#services") },
            { label: t(navLabel3, "Process"), link: t(navLink3, "#process") },
            {
                label: t(navLabel4, "Materials"),
                link: t(navLink4, "#materials"),
            },
            {
                label: t(navLabel5, "Portfolio"),
                link: t(navLink5, "#portfolio"),
            },
        ],
        [
            navLabel1,
            navLink1,
            navLabel2,
            navLink2,
            navLabel3,
            navLink3,
            navLabel4,
            navLink4,
            navLabel5,
            navLink5,
        ]
    )

    const rootRef = React.useRef<HTMLDivElement>(null)
    const [menuOpen, setMenuOpen] = React.useState(false)
    const [activeSlide, setActiveSlide] = React.useState(0)
    const [activeMaterial, setActiveMaterial] = React.useState(0)
    const [activePortfolio, setActivePortfolio] = React.useState(0)
    const [openFaqIdx, setOpenFaqIdx] = React.useState(-1)
    const [productModal, setProductModal] = React.useState<{
        open: boolean
        index: number
    }>({ open: false, index: 0 })
    const [reduceMotion, setReduceMotion] = React.useState(false)
    const [heroAutoplayPaused, setHeroAutoplayPaused] = React.useState(false)

    const toggleMenu = () => setMenuOpen((v) => !v)
    const closeMenu = () => setMenuOpen(false)

    const nextSlide = React.useCallback(() => {
        setActiveSlide((i) =>
            safeSlides.length > 0 ? (i + 1) % safeSlides.length : 0
        )
    }, [safeSlides.length])
    const prevSlide = React.useCallback(() => {
        setActiveSlide((i) =>
            safeSlides.length > 0
                ? (i - 1 + safeSlides.length) % safeSlides.length
                : 0
        )
    }, [safeSlides.length])

    // --- Hero gallery autoplay (pauses on hover/focus, disabled with reduced motion) ---
    React.useEffect(() => {
        if (reduceMotion) return
        if (heroGalleryAutoplay === false) return
        if (heroAutoplayPaused) return
        if (safeSlides.length <= 1) return
        const speedSec =
            typeof heroGalleryAutoplaySpeed === "number" &&
            heroGalleryAutoplaySpeed > 0
                ? heroGalleryAutoplaySpeed
                : 5
        const id = window.setInterval(() => {
            setActiveSlide((i) => (i + 1) % safeSlides.length)
        }, speedSec * 1000)
        return () => window.clearInterval(id)
    }, [
        reduceMotion,
        heroGalleryAutoplay,
        heroGalleryAutoplaySpeed,
        heroAutoplayPaused,
        safeSlides.length,
    ])

    const nextMaterial = React.useCallback(() => {
        setActiveMaterial((i) =>
            safeMaterials.length > 0 ? (i + 1) % safeMaterials.length : 0
        )
    }, [safeMaterials.length])
    const prevMaterial = React.useCallback(() => {
        setActiveMaterial((i) =>
            safeMaterials.length > 0
                ? (i - 1 + safeMaterials.length) % safeMaterials.length
                : 0
        )
    }, [safeMaterials.length])

    const nextPortfolio = React.useCallback(() => {
        setActivePortfolio((i) =>
            safePortfolio.length > 0 ? (i + 1) % safePortfolio.length : 0
        )
    }, [safePortfolio.length])
    const prevPortfolio = React.useCallback(() => {
        setActivePortfolio((i) =>
            safePortfolio.length > 0
                ? (i - 1 + safePortfolio.length) % safePortfolio.length
                : 0
        )
    }, [safePortfolio.length])

    const toggleFaq = (i: number) =>
        setOpenFaqIdx((prev) => (prev === i ? -1 : i))

    const openProductModal = (index: number) =>
        setProductModal({ open: true, index })
    const closeProductModal = () =>
        setProductModal((p) => ({ ...p, open: false }))
    const nextProduct = React.useCallback(() => {
        setProductModal((p) =>
            safePortfolio.length > 0
                ? { ...p, index: (p.index + 1) % safePortfolio.length }
                : p
        )
    }, [safePortfolio.length])
    const prevProduct = React.useCallback(() => {
        setProductModal((p) =>
            safePortfolio.length > 0
                ? {
                      ...p,
                      index:
                          (p.index - 1 + safePortfolio.length) %
                          safePortfolio.length,
                  }
                : p
        )
    }, [safePortfolio.length])

    React.useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (!productModal.open) return
            if (e.key === "Escape") closeProductModal()
            if (e.key === "ArrowRight") nextProduct()
            if (e.key === "ArrowLeft") prevProduct()
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [productModal.open, nextProduct, prevProduct])

    React.useEffect(() => {
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
        setReduceMotion(mq.matches)
    }, [])

    // --- Scroll reveal for Services cards ---
    const [visibleServices, setVisibleServices] = React.useState<boolean[]>([])
    const serviceCardRefs = React.useRef<(HTMLDivElement | null)[]>([])
    const servicesContentKey = React.useMemo(
        () =>
            safeServices
                .map((s) => `${s.serviceIconKey}|${s.serviceTitle}`)
                .join("::"),
        [safeServices]
    )

    React.useEffect(() => {
        setVisibleServices((prev) => {
            if (prev.length === safeServices.length) return prev
            return safeServices.map((_, i) => prev[i] || false)
        })

        if (reduceMotion || !("IntersectionObserver" in window)) {
            setVisibleServices(safeServices.map(() => true))
            return
        }

        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const idx = serviceCardRefs.current.indexOf(
                        entry.target as HTMLDivElement
                    )
                    if (entry.isIntersecting && idx > -1) {
                        setVisibleServices((prev) => {
                            if (prev[idx]) return prev
                            const next = [...prev]
                            next[idx] = true
                            return next
                        })
                        io.unobserve(entry.target)
                    }
                })
            },
            { threshold: 0.15 }
        )
        serviceCardRefs.current.forEach((el) => el && io.observe(el))

        const fallback = window.setTimeout(() => {
            setVisibleServices((prev) => {
                if (prev.every(Boolean)) return prev
                return prev.map(() => true)
            })
        }, REVEAL_FALLBACK_MS)

        return () => {
            io.disconnect()
            window.clearTimeout(fallback)
        }
    }, [servicesContentKey, safeServices.length, reduceMotion])

    // --- Process timeline scroll-linked progress line ---
    const timelineRef = React.useRef<HTMLDivElement>(null)
    const numRefs = React.useRef<(HTMLDivElement | null)[]>([])
    const [lineProgress, setLineProgress] = React.useState(0)
    const [lineBounds, setLineBounds] = React.useState({
        top: 22,
        bottom: 22,
        x: 22,
    })
    const [burstedSteps, setBurstedSteps] = React.useState<Set<number>>(
        new Set()
    )

    const processContentKey = React.useMemo(
        () => safeSteps.map((s) => `${s.stepTitle}|${s.stepText}`).join("::"),
        [safeSteps]
    )

    React.useEffect(() => {
        const measure = () => {
            const el = timelineRef.current
            const nums = numRefs.current.filter(Boolean) as HTMLDivElement[]
            if (!el || nums.length === 0) return
            const containerRect = el.getBoundingClientRect()
            const firstRect = nums[0].getBoundingClientRect()
            const lastRect = nums[nums.length - 1].getBoundingClientRect()
            const top = firstRect.top + firstRect.height / 2 - containerRect.top
            const bottomCenter =
                lastRect.top + lastRect.height / 2 - containerRect.top
            const bottom = Math.max(0, containerRect.height - bottomCenter)
            const x = firstRect.left + firstRect.width / 2 - containerRect.left
            setLineBounds({ top, bottom, x })
        }
        measure()
        window.addEventListener("resize", measure)
        const t1 = window.setTimeout(measure, 200)
        return () => {
            window.removeEventListener("resize", measure)
            window.clearTimeout(t1)
        }
    }, [processContentKey, safeSteps.length])

    React.useEffect(() => {
        if (reduceMotion) {
            setLineProgress(1)
            return
        }
        let ticking = false
        const update = () => {
            const el = timelineRef.current
            if (!el) {
                ticking = false
                return
            }
            const rect = el.getBoundingClientRect()
            const vh = window.innerHeight
            const start = vh * 0.8
            const end = vh * 0.25
            const total = rect.height + (start - end)
            const scrolled = start - rect.top
            const progress =
                total > 0 ? Math.max(0, Math.min(1, scrolled / total)) : 0
            setLineProgress(progress)
            ticking = false
        }
        const onScroll = () => {
            if (!ticking) {
                requestAnimationFrame(update)
                ticking = true
            }
        }
        window.addEventListener("scroll", onScroll, {
            passive: true,
            capture: true,
        })
        update()
        return () =>
            window.removeEventListener("scroll", onScroll, {
                capture: true,
            } as any)
    }, [reduceMotion, safeSteps.length])

    React.useEffect(() => {
        if (safeSteps.length === 0) return
        safeSteps.forEach((_, i) => {
            const threshold = (i + 0.5) / safeSteps.length
            if (lineProgress >= threshold) {
                setBurstedSteps((prev) =>
                    prev.has(i) ? prev : new Set(prev).add(i)
                )
            }
        })
    }, [lineProgress, safeSteps.length])

    // "Reset Colors" override: Framer code components can't rewrite their
    // own property-control values, so this switch instead makes every base
    // color fall back to the original purple palette at render time,
    // regardless of what the individual color controls below are set to.
    const useDefaultColors = resetColors === true

    const rootStyle: React.CSSProperties & Record<string, any> = {
        position: "relative",
        width: "100%",
        height: "100%",
        background: "var(--lbc-bg)",
        color: "var(--lbc-text)",
        fontFamily: "var(--lbc-body-font)",
        "--lbc-bg": useDefaultColors
            ? DEFAULT_BG_COLOR
            : bgColor || DEFAULT_BG_COLOR,
        "--lbc-text": useDefaultColors
            ? DEFAULT_TEXT_COLOR
            : textColor || DEFAULT_TEXT_COLOR,
        "--lbc-text-muted": useDefaultColors
            ? DEFAULT_TEXT_MUTED_COLOR
            : textMutedColor || DEFAULT_TEXT_MUTED_COLOR,
        "--lbc-accent": useDefaultColors
            ? DEFAULT_ACCENT_COLOR
            : accentColor || DEFAULT_ACCENT_COLOR,
        "--lbc-accent2": useDefaultColors
            ? DEFAULT_ACCENT2_COLOR
            : accentColor2 || DEFAULT_ACCENT2_COLOR,
        "--lbc-bg-tint": useDefaultColors
            ? DEFAULT_BG_TINT_COLOR
            : bgTintColor || DEFAULT_BG_TINT_COLOR,
        "--lbc-halo-color": useDefaultColors
            ? DEFAULT_HALO_COLOR
            : hoverHaloColor || DEFAULT_HALO_COLOR,
        "--lbc-card-shadow": useDefaultColors
            ? DEFAULT_CARD_SHADOW_COLOR
            : cardShadowColor || DEFAULT_CARD_SHADOW_COLOR,
        "--lbc-btn-text-color": useDefaultColors
            ? DEFAULT_BUTTON_TEXT_COLOR
            : buttonTextColor || DEFAULT_BUTTON_TEXT_COLOR,
        "--lbc-btn-border-color": useDefaultColors
            ? DEFAULT_BUTTON_BORDER_COLOR
            : buttonBorderColor || DEFAULT_BUTTON_BORDER_COLOR,
        "--lbc-dot-color": useDefaultColors
            ? DEFAULT_DOT_COLOR
            : dotColor || DEFAULT_DOT_COLOR,
        "--lbc-modal-accent": modalAccentColor || DEFAULT_MODAL_ACCENT_COLOR,
        "--lbc-heading-font": headingFont || DEFAULT_HEADING_FONT,
        "--lbc-body-font": bodyFont || DEFAULT_BODY_FONT,
    }

    const activeProduct =
        safePortfolio.length > 0 ? safePortfolio[productModal.index] : undefined
    const activeProductImg = activeProduct
        ? resolveImageSrc(activeProduct.portfolioImage)
        : ""

    return (
        <div ref={rootRef} className="lbc-root" style={rootStyle}>
            <style>{CSS_TEXT}</style>

            {/* --------- NAVBAR --------- */}
            {visible(showNavbar) && (
                <>
                    <nav className="lbc-nav">
                        <div className="lbc-logo">
                            {resolveImageSrc(logoImage) ? (
                                <img
                                    src={resolveImageSrc(logoImage)}
                                    alt={logoText || "Logo"}
                                    className="lbc-logo-img"
                                />
                            ) : (
                                logoText || "LBC LAB"
                            )}
                        </div>
                        <ul className="lbc-nav-links">
                            {navItems.map((item, i) => (
                                <li key={i}>
                                    <a href={item.link}>{item.label}</a>
                                </li>
                            ))}
                        </ul>
                        <a
                            href={ctaLink || "#contact"}
                            className="lbc-btn lbc-btn-nav"
                        >
                            {ctaText || "Get a Quote"}
                        </a>
                        <button
                            type="button"
                            className={`lbc-hamburger ${menuOpen ? "is-open" : ""}`}
                            aria-label="Menu"
                            onClick={toggleMenu}
                        >
                            <span />
                            <span />
                            <span />
                        </button>
                    </nav>

                    <div
                        className={`lbc-mobile-menu ${menuOpen ? "is-open" : ""}`}
                    >
                        <ul>
                            {navItems.map((item, i) => (
                                <li key={i}>
                                    <a href={item.link} onClick={closeMenu}>
                                        {item.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                        <a
                            href={ctaLink || "#contact"}
                            className="lbc-btn"
                            onClick={closeMenu}
                        >
                            {ctaText || "Get a Quote"}
                        </a>
                    </div>
                </>
            )}

            {/* --------- HERO --------- */}
            {visible(showHero) && (
                <section className="lbc-hero">
                    <div className="lbc-hero-grid">
                        <div className="lbc-glass lbc-hero-textbox">
                            <h1>
                                {heroHeading || "The future of manufacturing"}{" "}
                                <span className="lbc-text-gradient">
                                    {heroHeadingHighlight || "starts in 3D"}
                                </span>
                            </h1>
                            <p>
                                {heroText ||
                                    "LBC LAB designs, prototypes, and manufactures precise 3D models, functional parts, and custom products with a focus on quality, speed, and innovation."}
                            </p>
                            <div className="lbc-cta">
                                <a
                                    href={heroCtaLink || "#contact"}
                                    className="lbc-btn lbc-btn-glass"
                                >
                                    {heroCtaText || "Get a Free Quote"}
                                </a>
                            </div>
                        </div>
                        <div className="lbc-glass lbc-hero-gallery-box">
                            <div
                                className="lbc-material-stack-wrapper"
                                onMouseEnter={() =>
                                    setHeroAutoplayPaused(true)
                                }
                                onMouseLeave={() =>
                                    setHeroAutoplayPaused(false)
                                }
                                onFocus={() => setHeroAutoplayPaused(true)}
                                onBlur={() => setHeroAutoplayPaused(false)}
                            >
                                <button
                                    type="button"
                                    className="lbc-stack-nav prev"
                                    aria-label="Previous"
                                    onClick={prevSlide}
                                >
                                    &#8249;
                                </button>
                                <div
                                    className="lbc-material-stack lbc-hero-stack"
                                    style={{
                                        ["--lbc-hero-stack-w" as any]:
                                            heroGalleryWidth
                                                ? `${heroGalleryWidth}px`
                                                : undefined,
                                        ["--lbc-hero-stack-h" as any]:
                                            heroGalleryHeight
                                                ? `${heroGalleryHeight}px`
                                                : undefined,
                                    }}
                                >
                                    {safeSlides.length === 0 && (
                                        <div
                                            className="lbc-material-stack-card"
                                            style={getStackStyle(0)}
                                        >
                                            <div className="lbc-material-card-inner">
                                                <h3>Project Photo</h3>
                                                <p>
                                                    Space ready for a photo
                                                    from the printer.
                                                </p>
                                            </div>
                                            <SizeHint text="1000 × 1000 px" />
                                        </div>
                                    )}
                                    {safeSlides.map((s, i) => {
                                        const img = resolveImageSrc(
                                            s.heroImage
                                        )
                                        const total = safeSlides.length
                                        const offset =
                                            total > 0
                                                ? (i - activeSlide + total) %
                                                  total
                                                : 0
                                        return (
                                            <div
                                                key={i}
                                                className={`lbc-material-stack-card ${img ? "has-image" : ""}`}
                                                style={{
                                                    ...getStackStyle(offset),
                                                    ...(img
                                                        ? {
                                                              backgroundImage: `url(${img})`,
                                                          }
                                                        : {}),
                                                }}
                                            >
                                                {!img && (
                                                    <div className="lbc-material-card-inner">
                                                        <h3>
                                                            {t(
                                                                s.heroSlideTitle,
                                                                `Project Photo ${i + 1}`
                                                            )}
                                                        </h3>
                                                        <p>
                                                            {t(
                                                                s.heroSlideText,
                                                                "Space ready for a photo from the printer."
                                                            )}
                                                        </p>
                                                    </div>
                                                )}
                                                {!img && offset === 0 && (
                                                    <SizeHint text="1000 × 1000 px" />
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                                <button
                                    type="button"
                                    className="lbc-stack-nav next"
                                    aria-label="Next"
                                    onClick={nextSlide}
                                >
                                    &#8250;
                                </button>
                            </div>
                            {safeSlides.length > 1 && (
                                <div className="lbc-stack-dots">
                                    {safeSlides.map((_, i) => (
                                        <span
                                            key={i}
                                            className={`lbc-stack-dot ${i === activeSlide ? "active" : ""}`}
                                            onClick={() => setActiveSlide(i)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* --------- STATS --------- */}
            {visible(showStats) && safeStats.length > 0 && (
                <section className="lbc-stats">
                    <div className="lbc-stats-grid">
                        {safeStats.map((s, i) => (
                            <div key={i} className="lbc-glass lbc-stat-card">
                                <div className="lbc-stat-val">
                                    {s.statValue}
                                </div>
                                <div className="lbc-stat-lbl">
                                    {s.statLabel}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* --------- ABOUT --------- */}
            {visible(showAbout) && (
                <section id="about" className="lbc-about-section">
                    <div className="lbc-about-grid">
                        <div className="lbc-about-model">
                            {resolveImageSrc(aboutImage) ? (
                                <img
                                    src={resolveImageSrc(aboutImage)}
                                    alt="About"
                                    className="lbc-about-img"
                                />
                            ) : (
                                <AboutSpool
                                    reduceMotion={reduceMotion}
                                    spoolColor={
                                        spoolColor || DEFAULT_SPOOL_COLOR
                                    }
                                />
                            )}
                        </div>
                        <div>
                            <span className="lbc-tag">
                                {aboutTag || "About Us"}
                            </span>
                            <h2>
                                {aboutHeading || "Precision meets innovation"}
                            </h2>
                            <p className="lbc-about-text">
                                {aboutText ||
                                    "LBC LAB combines advanced 3D printing technology with engineering precision. From the first concept to the final part, we support every project with a focus on detail, speed, and reliability."}
                            </p>
                        </div>
                    </div>
                </section>
            )}

            {/* --------- SERVICES --------- */}
            {visible(showServices) && safeServices.length > 0 && (
                <section id="services" className="lbc-services-section">
                    <div className="lbc-section-head">
                        <span className="lbc-tag">
                            {servicesTag || "What We Do"}
                        </span>
                        <h2>{servicesHeading || "Our Services"}</h2>
                    </div>
                    <div className="lbc-services-grid">
                        {safeServices.map((s, i) => (
                            <div
                                key={i}
                                ref={(el) => (serviceCardRefs.current[i] = el)}
                                className={`lbc-glass lbc-service-card lbc-reveal ${visibleServices[i] ? "is-visible" : ""}`}
                                style={{
                                    transitionDelay: reduceMotion
                                        ? "0ms"
                                        : `${(i % 3) * 100}ms`,
                                }}
                            >
                                <div className="lbc-service-icon">
                                    {resolveImageSrc(s.serviceIconImage) ? (
                                        <img
                                            src={resolveImageSrc(
                                                s.serviceIconImage
                                            )}
                                            alt=""
                                            className="lbc-service-icon-img"
                                        />
                                    ) : (
                                        <ServiceIcon
                                            iconKey={
                                                s.serviceIconKey || "printer"
                                            }
                                        />
                                    )}
                                </div>
                                <h3>{s.serviceTitle}</h3>
                                <p>{s.serviceText}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* --------- PROCESS --------- */}
            {visible(showProcess) && safeSteps.length > 0 && (
                <section id="process" className="lbc-process-section">
                    <div className="lbc-section-head">
                        <span className="lbc-tag">
                            {processTag || "How It Works"}
                        </span>
                        <h2>{processHeading || "Our Process"}</h2>
                    </div>
                    <div ref={timelineRef} className="lbc-timeline">
                        <div
                            className="lbc-timeline-line-bg"
                            style={{
                                left: lineBounds.x,
                                top: lineBounds.top,
                                bottom: lineBounds.bottom,
                                transform: "translateX(-50%)",
                            }}
                        />
                        <div
                            className="lbc-timeline-line-progress"
                            style={{
                                left: lineBounds.x,
                                top: lineBounds.top,
                                height: `calc((100% - ${lineBounds.top + lineBounds.bottom}px) * ${lineProgress})`,
                                transform: "translateX(-50%)",
                            }}
                        />
                        {safeSteps.map((s, i) => {
                            const threshold = (i + 0.5) / safeSteps.length
                            const active = lineProgress >= threshold
                            const bursted = burstedSteps.has(i)
                            return (
                                <div key={i} className="lbc-timeline-step">
                                    <div
                                        ref={(el) => (numRefs.current[i] = el)}
                                        className={`lbc-timeline-num ${active ? "active" : ""}`}
                                    >
                                        {i + 1}
                                        {!reduceMotion && bursted && (
                                            <FireworkBurst />
                                        )}
                                    </div>
                                    <div
                                        className={`lbc-glass lbc-timeline-card ${active ? "is-expanded" : ""}`}
                                    >
                                        <h3>{s.stepTitle}</h3>
                                        {s.stepText && <p>{s.stepText}</p>}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </section>
            )}

            {/* --------- MATERIALS --------- */}
            {visible(showMaterials) && safeMaterials.length > 0 && (
                <section id="materials" className="lbc-materials-section">
                    <div className="lbc-section-head">
                        <span className="lbc-tag">
                            {materialsTag || "Materials"}
                        </span>
                        <h2>{materialsHeading || "What We Print With"}</h2>
                    </div>
                    <div
                        className="lbc-hero-gallery-box"
                        style={{
                            background: "none",
                            backdropFilter: "none",
                            border: "none",
                            boxShadow: "none",
                        }}
                    >
                        <div className="lbc-material-stack-wrapper">
                            <button
                                type="button"
                                className="lbc-stack-nav prev"
                                aria-label="Previous material"
                                onClick={prevMaterial}
                            >
                                &#8249;
                            </button>
                            <div className="lbc-material-stack">
                                {safeMaterials.map((m, i) => {
                                    const total = safeMaterials.length
                                    const offset =
                                        total > 0
                                            ? (i - activeMaterial + total) %
                                              total
                                            : 0
                                    return (
                                        <div
                                            key={i}
                                            className="lbc-material-stack-card"
                                            style={getStackStyle(offset)}
                                        >
                                            <div className="lbc-material-card-inner">
                                                <h3>{m.materialName}</h3>
                                                <p>{m.materialText}</p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                            <button
                                type="button"
                                className="lbc-stack-nav next"
                                aria-label="Next material"
                                onClick={nextMaterial}
                            >
                                &#8250;
                            </button>
                        </div>
                        {safeMaterials.length > 1 && (
                            <div className="lbc-stack-dots">
                                {safeMaterials.map((_, i) => (
                                    <span
                                        key={i}
                                        className={`lbc-stack-dot ${i === activeMaterial ? "active" : ""}`}
                                        onClick={() => setActiveMaterial(i)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* --------- PORTFOLIO --------- */}
            {visible(showPortfolio) && safePortfolio.length > 0 && (
                <section id="portfolio" className="lbc-portfolio-section">
                    <div className="lbc-section-head">
                        <span className="lbc-tag">
                            {portfolioTag || "Our Work"}
                        </span>
                        <h2>{portfolioHeading || "Portfolio"}</h2>
                    </div>
                    <div
                        className="lbc-hero-gallery-box"
                        style={{
                            background: "none",
                            backdropFilter: "none",
                            border: "none",
                            boxShadow: "none",
                        }}
                    >
                        <div className="lbc-material-stack-wrapper">
                            <button
                                type="button"
                                className="lbc-stack-nav prev"
                                aria-label="Previous project"
                                onClick={prevPortfolio}
                            >
                                &#8249;
                            </button>
                            <div className="lbc-material-stack">
                                {safePortfolio.map((p, i) => {
                                    const img = resolveImageSrc(
                                        p.portfolioImage
                                    )
                                    const total = safePortfolio.length
                                    const offset =
                                        total > 0
                                            ? (i - activePortfolio + total) %
                                              total
                                            : 0
                                    return (
                                        <div
                                            key={i}
                                            className={`lbc-material-stack-card ${img ? "has-image" : ""}`}
                                            style={{
                                                ...getStackStyle(offset),
                                                ...(img
                                                    ? {
                                                          backgroundImage: `url(${img})`,
                                                      }
                                                    : {}),
                                            }}
                                            onClick={() =>
                                                img && openProductModal(i)
                                            }
                                        >
                                            {!img && (
                                                <div className="lbc-material-card-inner">
                                                    <h3>
                                                        {t(
                                                            p.portfolioTitle,
                                                            `Project ${i + 1}`
                                                        )}
                                                    </h3>
                                                    <p>
                                                        {t(
                                                            p.portfolioDesc,
                                                            "Space for a project description."
                                                        )}
                                                    </p>
                                                </div>
                                            )}
                                            {!img && offset === 0 && (
                                                <SizeHint text="800 × 800 px" />
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                            <button
                                type="button"
                                className="lbc-stack-nav next"
                                aria-label="Next project"
                                onClick={nextPortfolio}
                            >
                                &#8250;
                            </button>
                        </div>
                        {safePortfolio.length > 1 && (
                            <div className="lbc-stack-dots">
                                {safePortfolio.map((_, i) => (
                                    <span
                                        key={i}
                                        className={`lbc-stack-dot ${i === activePortfolio ? "active" : ""}`}
                                        onClick={() => setActivePortfolio(i)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* --------- TESTIMONIALS --------- */}
            {visible(showTestimonials) && safeTestimonials.length > 0 && (
                <section className="lbc-testimonials-section">
                    <div className="lbc-section-head">
                        <span className="lbc-tag">
                            {testimonialsTag || "Testimonials"}
                        </span>
                        <h2>{testimonialsHeading || "What Clients Say"}</h2>
                    </div>
                    <div className="lbc-testimonial-wrap">
                        {safeTestimonials.map((tst, i) => (
                            <div
                                key={i}
                                className="lbc-glass lbc-testimonial-card"
                            >
                                <div className="lbc-stars">★★★★★</div>
                                <p>&ldquo;{tst.quote}&rdquo;</p>
                                <div className="lbc-t-name">{tst.name}</div>
                                <div className="lbc-t-role">{tst.role}</div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* --------- FAQ --------- */}
            {visible(showFaq) && safeFaq.length > 0 && (
                <section className="lbc-faq-section">
                    <div className="lbc-section-head">
                        <span className="lbc-tag">{faqTag || "FAQ"}</span>
                        <h2>{faqHeading || "Frequently Asked Questions"}</h2>
                    </div>
                    <div className="lbc-faq-wrap">
                        {safeFaq.map((f, i) => (
                            <div
                                key={i}
                                className={`lbc-glass lbc-faq-item ${openFaqIdx === i ? "open" : ""}`}
                            >
                                <div
                                    className="lbc-faq-q"
                                    onClick={() => toggleFaq(i)}
                                >
                                    <span>{f.question}</span>
                                    <span className="lbc-faq-toggle">
                                        {openFaqIdx === i ? "−" : "+"}
                                    </span>
                                </div>
                                <div className="lbc-faq-a">{f.answer}</div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* --------- CONTACT --------- */}
            {visible(showContact) && (
                <section id="contact" className="lbc-contact-section">
                    <div className="lbc-section-head">
                        <span className="lbc-tag">
                            {contactTag || "Contact"}
                        </span>
                        <h2>
                            {contactHeading ||
                                "Let's Build Something Together"}
                        </h2>
                        <p>
                            {contactText ||
                                "Send us your idea and we will get back to you shortly."}
                        </p>
                    </div>
                    <div className="lbc-contact-grid">
                        <div className="lbc-glass lbc-contact-form">
                            <div className="lbc-form-field">
                                <input type="text" placeholder="Your Name" />
                            </div>
                            <div className="lbc-form-field">
                                <input
                                    type="email"
                                    placeholder="Your Email"
                                />
                            </div>
                            <div className="lbc-form-field">
                                <textarea
                                    placeholder="Tell us about your project"
                                    rows={4}
                                />
                            </div>
                            <div className="lbc-submit-btn-wrap">
                                <a
                                    href={`mailto:${email || "hello@lbclab.com"}`}
                                    className="lbc-btn"
                                >
                                    <span className="lbc-btn-fill" />
                                    <span className="lbc-btn-label">
                                        Send Message
                                    </span>
                                </a>
                            </div>
                        </div>
                        <div className="lbc-glass lbc-contact-info">
                            <div>
                                <strong>Email</strong>
                                <br />
                                <a
                                    href={`mailto:${email || "hello@lbclab.com"}`}
                                >
                                    {email || "hello@lbclab.com"}
                                </a>
                            </div>
                            <div>
                                <strong>Phone</strong>
                                <br />
                                <a
                                    href={`tel:${(phone || "").replace(/\s+/g, "")}`}
                                >
                                    {phone || "+1 555 234 567"}
                                </a>
                            </div>
                            <div>
                                <strong>Address</strong>
                                <br />
                                {address || "123 Maker Street, Prague, CZ"}
                            </div>
                        </div>
                    </div>

                    {visible(showMap) && (
                        <div className="lbc-glass lbc-map-box">
                            <div
                                className="lbc-map-frame"
                                style={{
                                    filter:
                                        mapGrayscale !== false
                                            ? "grayscale(1) contrast(1.05) brightness(1.05)"
                                            : "none",
                                }}
                            >
                                <iframe
                                    title="Map"
                                    src={`https://www.google.com/maps?q=${encodeURIComponent(
                                        mapAddress ||
                                            address ||
                                            "123 Maker Street, Prague, CZ"
                                    )}&output=embed`}
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                />
                            </div>
                            <div
                                className="lbc-map-tint"
                                style={{
                                    background:
                                        mapTintColor || DEFAULT_MAP_TINT_COLOR,
                                    opacity:
                                        typeof mapTintStrength === "number"
                                            ? mapTintStrength
                                            : 0.45,
                                }}
                            />
                        </div>
                    )}
                </section>
            )}

            {/* --------- FOOTER --------- */}
            {visible(showFooter) && (
                <footer className="lbc-footer">
                    <div className="lbc-glass lbc-footer-card">
                        <div className="lbc-flogo">
                            {resolveImageSrc(logoImage) ? (
                                <img
                                    src={resolveImageSrc(logoImage)}
                                    alt={logoText || "Logo"}
                                    className="lbc-logo-img"
                                />
                            ) : (
                                logoText || "LBC LAB"
                            )}
                        </div>
                        <div className="lbc-fmotto">
                            {footerMotto || "Precision. Speed. Innovation."}
                        </div>
                        <div className="lbc-socials">
                            {instagramLink && (
                                <a
                                    href={instagramLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Instagram"
                                >
                                    <InstagramIcon />
                                </a>
                            )}
                            {linkedinLink && (
                                <a
                                    href={linkedinLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="LinkedIn"
                                >
                                    <LinkedInIcon />
                                </a>
                            )}
                            {facebookLink && (
                                <a
                                    href={facebookLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Facebook"
                                >
                                    <FacebookIcon />
                                </a>
                            )}
                        </div>
                    </div>
                </footer>
            )}

            {/* --------- PRODUCT MODAL (Portfolio popup) --------- */}
            <div
                className={`lbc-product-modal ${productModal.open ? "is-open" : ""}`}
                onClick={(e) => {
                    if (e.target === e.currentTarget) closeProductModal()
                }}
            >
                <div className="lbc-product-modal-inner">
                    {safePortfolio.length > 1 && (
                        <button
                            type="button"
                            className="lbc-product-modal-nav prev"
                            aria-label="Previous product"
                            onClick={(e) => {
                                e.stopPropagation()
                                prevProduct()
                            }}
                        >
                            &#8249;
                        </button>
                    )}
                    <div className="lbc-product-card">
                        <button
                            className="lbc-product-card-close"
                            onClick={closeProductModal}
                            aria-label="Close"
                        >
                            &times;
                        </button>
                        <div
                            className="lbc-product-card-image"
                            style={
                                activeProductImg
                                    ? {
                                          backgroundImage: `url(${activeProductImg})`,
                                      }
                                    : undefined
                            }
                        />
                        <div className="lbc-product-card-body">
                            <h3>
                                {activeProduct
                                    ? activeProduct.portfolioTitle
                                    : ""}
                            </h3>
                            {activeProduct && activeProduct.portfolioDesc && (
                                <p className="lbc-product-desc">
                                    {activeProduct.portfolioDesc}
                                </p>
                            )}
                            <div className="lbc-product-specs">
                                {activeProduct &&
                                    activeProduct.portfolioSpec1Value && (
                                        <div className="lbc-product-spec-row">
                                            <div className="lbc-product-spec-icon">
                                                <SpecClockIcon />
                                            </div>
                                            <div>
                                                <div className="lbc-product-spec-label">
                                                    {activeProduct.portfolioSpec1Label ||
                                                        "Print Time"}
                                                </div>
                                                <div className="lbc-product-spec-value">
                                                    {
                                                        activeProduct.portfolioSpec1Value
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                {activeProduct &&
                                    activeProduct.portfolioSpec2Value && (
                                        <div className="lbc-product-spec-row">
                                            <div className="lbc-product-spec-icon">
                                                <SpecWeightIcon />
                                            </div>
                                            <div>
                                                <div className="lbc-product-spec-label">
                                                    {activeProduct.portfolioSpec2Label ||
                                                        "Weight"}
                                                </div>
                                                <div className="lbc-product-spec-value">
                                                    {
                                                        activeProduct.portfolioSpec2Value
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                {activeProduct &&
                                    activeProduct.portfolioSpec3Value && (
                                        <div className="lbc-product-spec-row">
                                            <div className="lbc-product-spec-icon">
                                                <SpecMaterialIcon />
                                            </div>
                                            <div>
                                                <div className="lbc-product-spec-label">
                                                    {activeProduct.portfolioSpec3Label ||
                                                        "Material"}
                                                </div>
                                                <div className="lbc-product-spec-value">
                                                    {
                                                        activeProduct.portfolioSpec3Value
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    )}
                            </div>
                        </div>
                    </div>
                    {safePortfolio.length > 1 && (
                        <button
                            type="button"
                            className="lbc-product-modal-nav next"
                            aria-label="Next product"
                            onClick={(e) => {
                                e.stopPropagation()
                                nextProduct()
                            }}
                        >
                            &#8250;
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

// ============================================================
// Property Controls
// ============================================================
addPropertyControls(LbcLabSite, {
    navbar: {
        type: ControlType.Object,
        title: "① Navbar",
        controls: {
            showNavbar: {
                type: ControlType.Boolean,
                title: "Show Section",
                defaultValue: true,
            },
            logoText: {
                type: ControlType.String,
                title: "Logo Text",
                defaultValue: "LBC LAB",
            },
            logoImage: {
                type: ControlType.Image,
                title: "Logo Image (optional, replaces logo text)",
            },
            navLabel1: {
                type: ControlType.String,
                title: "Menu 1",
                defaultValue: "About",
            },
            navLink1: {
                type: ControlType.Link,
                title: "Link 1",
                defaultValue: "#about",
            },
            navLabel2: {
                type: ControlType.String,
                title: "Menu 2",
                defaultValue: "Services",
            },
            navLink2: {
                type: ControlType.Link,
                title: "Link 2",
                defaultValue: "#services",
            },
            navLabel3: {
                type: ControlType.String,
                title: "Menu 3",
                defaultValue: "Process",
            },
            navLink3: {
                type: ControlType.Link,
                title: "Link 3",
                defaultValue: "#process",
            },
            navLabel4: {
                type: ControlType.String,
                title: "Menu 4",
                defaultValue: "Materials",
            },
            navLink4: {
                type: ControlType.Link,
                title: "Link 4",
                defaultValue: "#materials",
            },
            navLabel5: {
                type: ControlType.String,
                title: "Menu 5",
                defaultValue: "Portfolio",
            },
            navLink5: {
                type: ControlType.Link,
                title: "Link 5",
                defaultValue: "#portfolio",
            },
            ctaText: {
                type: ControlType.String,
                title: "Button Text",
                defaultValue: "Get a Quote",
            },
            ctaLink: {
                type: ControlType.Link,
                title: "Button Link",
                defaultValue: "#contact",
            },
        },
    },

    globalStyle: {
        type: ControlType.Object,
        title: "② Global Style",
        controls: {
            resetColors: {
                type: ControlType.Boolean,
                title: "↺ Reset Colors",
                defaultValue: false,
                enabledTitle: "Purple Defaults",
                disabledTitle: "Custom",
                description:
                    "Turn on to use the original purple palette everywhere on the site. The color controls below are hidden while this is on (their saved values aren't lost, just not used) — turn it back off to edit your own colors again.",
            },
            bgColor: {
                type: ControlType.Color,
                title: "Background",
                defaultValue: DEFAULT_BG_COLOR,
                hidden: (props: GlobalStyleGroup) => props.resetColors === true,
            },
            textColor: {
                type: ControlType.Color,
                title: "Text Color",
                defaultValue: DEFAULT_TEXT_COLOR,
                hidden: (props: GlobalStyleGroup) => props.resetColors === true,
            },
            textMutedColor: {
                type: ControlType.Color,
                title: "Secondary Text",
                defaultValue: DEFAULT_TEXT_MUTED_COLOR,
                hidden: (props: GlobalStyleGroup) => props.resetColors === true,
            },
            accentColor: {
                type: ControlType.Color,
                title: "Accent Color",
                defaultValue: DEFAULT_ACCENT_COLOR,
                hidden: (props: GlobalStyleGroup) => props.resetColors === true,
            },
            accentColor2: {
                type: ControlType.Color,
                title: "Accent Color 2",
                defaultValue: DEFAULT_ACCENT2_COLOR,
                hidden: (props: GlobalStyleGroup) => props.resetColors === true,
            },
            bgTintColor: {
                type: ControlType.Color,
                title: "Background Tint",
                defaultValue: DEFAULT_BG_TINT_COLOR,
                description:
                    "Soft purple glow behind the hero section, like in the original mockup.",
                hidden: (props: GlobalStyleGroup) => props.resetColors === true,
            },
            hoverHaloColor: {
                type: ControlType.Color,
                title: "Hover Halo Color",
                defaultValue: DEFAULT_HALO_COLOR,
                hidden: (props: GlobalStyleGroup) => props.resetColors === true,
            },
            cardShadowColor: {
                type: ControlType.Color,
                title: "Card Shadow Color",
                defaultValue: DEFAULT_CARD_SHADOW_COLOR,
                hidden: (props: GlobalStyleGroup) => props.resetColors === true,
            },
            buttonTextColor: {
                type: ControlType.Color,
                title: "Button Color",
                defaultValue: DEFAULT_BUTTON_TEXT_COLOR,
                hidden: (props: GlobalStyleGroup) => props.resetColors === true,
            },
            buttonBorderColor: {
                type: ControlType.Color,
                title: "Button Border Color",
                defaultValue: DEFAULT_BUTTON_BORDER_COLOR,
                hidden: (props: GlobalStyleGroup) => props.resetColors === true,
            },
            dotColor: {
                type: ControlType.Color,
                title: "Carousel Dot Color",
                defaultValue: DEFAULT_DOT_COLOR,
                hidden: (props: GlobalStyleGroup) => props.resetColors === true,
            },
            headingFont: {
                type: ControlType.String,
                title: "Heading Font",
                defaultValue: DEFAULT_HEADING_FONT,
            },
            bodyFont: {
                type: ControlType.String,
                title: "Body Font",
                defaultValue: DEFAULT_BODY_FONT,
            },
        },
    },

    hero: {
        type: ControlType.Object,
        title: "③ Hero",
        controls: {
            showHero: {
                type: ControlType.Boolean,
                title: "Show Section",
                defaultValue: true,
            },
            heroHeading: {
                type: ControlType.String,
                title: "Heading",
                defaultValue: "The future of manufacturing",
            },
            heroHeadingHighlight: {
                type: ControlType.String,
                title: "Heading Highlight",
                defaultValue: "starts in 3D",
            },
            heroText: {
                type: ControlType.String,
                title: "Text",
                defaultValue:
                    "LBC LAB designs, prototypes, and manufactures precise 3D models, functional parts, and custom products with a focus on quality, speed, and innovation.",
            },
            heroCtaText: {
                type: ControlType.String,
                title: "CTA Text",
                defaultValue: "Get a Free Quote",
            },
            heroCtaLink: {
                type: ControlType.Link,
                title: "CTA Link",
                defaultValue: "#contact",
            },
            slides: {
                type: ControlType.Array,
                title: "Gallery Slides",
                control: {
                    type: ControlType.Object,
                    controls: {
                        heroImage: { type: ControlType.Image, title: "Photo" },
                        heroSlideTitle: {
                            type: ControlType.String,
                            title: "Title",
                        },
                        heroSlideText: {
                            type: ControlType.String,
                            title: "Text",
                        },
                    },
                },
                defaultValue: [
                    {
                        heroImage: "",
                        heroSlideTitle: "Project Photo 1",
                        heroSlideText:
                            "Space ready for a photo from the printer.",
                    },
                    {
                        heroImage: "",
                        heroSlideTitle: "Project Photo 2",
                        heroSlideText: "A finished part will be shown here.",
                    },
                    {
                        heroImage: "",
                        heroSlideTitle: "Project Photo 3",
                        heroSlideText: "Space for another project photo.",
                    },
                ],
            },
            heroGalleryWidth: {
                type: ControlType.Number,
                title: "Gallery Width (px)",
                min: 100,
                max: 900,
                step: 1,
                defaultValue: 364,
            },
            heroGalleryHeight: {
                type: ControlType.Number,
                title: "Gallery Height (px)",
                min: 100,
                max: 900,
                step: 1,
                defaultValue: 364,
            },
            heroGalleryAutoplay: {
                type: ControlType.Boolean,
                title: "Auto-Rotate Photos",
                defaultValue: true,
            },
            heroGalleryAutoplaySpeed: {
                type: ControlType.Number,
                title: "Auto-Rotate Speed (s)",
                min: 2,
                max: 15,
                step: 0.5,
                defaultValue: 5,
                hidden: (props: HeroGroup) =>
                    props.heroGalleryAutoplay === false,
            },
        },
    },

    stats: {
        type: ControlType.Object,
        title: "④ Stats",
        controls: {
            showStats: {
                type: ControlType.Boolean,
                title: "Show Section",
                defaultValue: true,
            },
            stats: {
                type: ControlType.Array,
                title: "Stat Cards",
                control: {
                    type: ControlType.Object,
                    controls: {
                        statValue: { type: ControlType.String, title: "Value" },
                        statLabel: { type: ControlType.String, title: "Label" },
                    },
                },
                defaultValue: [
                    { statValue: "500+", statLabel: "Printed Projects" },
                    { statValue: "99%", statLabel: "Customer Satisfaction" },
                    { statValue: "24h", statLabel: "Express Production" },
                    { statValue: "0.05mm", statLabel: "Print Accuracy" },
                ],
            },
        },
    },

    about: {
        type: ControlType.Object,
        title: "⑤ About",
        controls: {
            showAbout: {
                type: ControlType.Boolean,
                title: "Show Section",
                defaultValue: true,
            },
            aboutTag: {
                type: ControlType.String,
                title: "Tag",
                defaultValue: "About Us",
            },
            aboutHeading: {
                type: ControlType.String,
                title: "Heading",
                defaultValue:
                    "Precision manufacturing powered by technology and craftsmanship",
            },
            aboutText: {
                type: ControlType.String,
                title: "Text",
                defaultValue:
                    "LBC LAB combines advanced 3D printing technology with engineering precision. From the first concept to the final part, we support every project with a focus on detail, speed, and reliability.",
            },
            aboutImage: {
                type: ControlType.Image,
                title: "Image (optional, replaces spool animation)",
            },
            spoolColor: {
                type: ControlType.Color,
                title: "Spool Color",
                defaultValue: DEFAULT_SPOOL_COLOR,
            },
        },
    },

    services: {
        type: ControlType.Object,
        title: "⑥ Services",
        controls: {
            showServices: {
                type: ControlType.Boolean,
                title: "Show Section",
                defaultValue: true,
            },
            servicesTag: {
                type: ControlType.String,
                title: "Tag",
                defaultValue: "Services",
            },
            servicesHeading: {
                type: ControlType.String,
                title: "Heading",
                defaultValue: "Everything you need, from idea to part",
            },
            services: {
                type: ControlType.Array,
                title: "Service Cards",
                control: {
                    type: ControlType.Object,
                    controls: {
                        serviceIconKey: {
                            type: ControlType.Enum,
                            title: "Built-in Icon",
                            options: [
                                "printer",
                                "design",
                                "prototype",
                                "manufacturing",
                                "scan",
                                "wrench",
                                "consulting",
                            ],
                            optionTitles: [
                                "3D Printer",
                                "CAD 3D Design",
                                "Prototype Tag",
                                "Manufacturing",
                                "3D Scanner",
                                "Wrench",
                                "Consulting",
                            ],
                            defaultValue: "printer",
                            description:
                                "Used unless a Custom Icon image is uploaded below.",
                        },
                        serviceIconImage: {
                            type: ControlType.Image,
                            title: "Custom Icon",
                            description:
                                "Upload your own icon to replace the built-in one — use this to adapt the site for any business (e.g. a fork & knife for a restaurant, a car part for a mechanic).",
                        },
                        serviceTitle: {
                            type: ControlType.String,
                            title: "Title",
                        },
                        serviceText: {
                            type: ControlType.String,
                            title: "Text",
                        },
                    },
                },
                defaultValue: [
                    {
                        serviceIconKey: "printer",
                        serviceTitle: "Professional 3D Printing",
                        serviceText:
                            "Highly precise printing using modern FDM, SLA, and SLS technologies.",
                    },
                    {
                        serviceIconKey: "design",
                        serviceTitle: "CAD Modeling",
                        serviceText:
                            "Design and optimization of 3D models from concept to production documentation.",
                    },
                    {
                        serviceIconKey: "prototype",
                        serviceTitle: "Functional Prototypes",
                        serviceText:
                            "Fast verification of shape, function, and mechanical properties.",
                    },
                    {
                        serviceIconKey: "manufacturing",
                        serviceTitle: "Custom Manufacturing",
                        serviceText:
                            "Production of custom parts in small and medium series.",
                    },
                    {
                        serviceIconKey: "scan",
                        serviceTitle: "Optical 3D Scanning",
                        serviceText:
                            "Precise digitization of parts and models using an industrial optical scanner.",
                    },
                    {
                        serviceIconKey: "wrench",
                        serviceTitle: "Spare Parts",
                        serviceText:
                            "Fast production of spare parts, even for products that are no longer manufactured.",
                    },
                    {
                        serviceIconKey: "consulting",
                        serviceTitle: "Consulting",
                        serviceText:
                            "Expert advice on choosing the right technology, material, and design.",
                    },
                ],
            },
        },
    },

    process: {
        type: ControlType.Object,
        title: "⑦ Process",
        controls: {
            showProcess: {
                type: ControlType.Boolean,
                title: "Show Section",
                defaultValue: true,
            },
            processTag: {
                type: ControlType.String,
                title: "Tag",
                defaultValue: "Process",
            },
            processHeading: {
                type: ControlType.String,
                title: "Heading",
                defaultValue: "From idea to finished part",
            },
            steps: {
                type: ControlType.Array,
                title: "Steps",
                control: {
                    type: ControlType.Object,
                    controls: {
                        stepTitle: { type: ControlType.String, title: "Title" },
                        stepText: { type: ControlType.String, title: "Text" },
                    },
                },
                defaultValue: [
                    { stepTitle: "Contact", stepText: "" },
                    { stepTitle: "Design", stepText: "" },
                    { stepTitle: "Visualization", stepText: "" },
                    { stepTitle: "Production", stepText: "" },
                    { stepTitle: "Quality Control", stepText: "" },
                    { stepTitle: "Delivery", stepText: "" },
                ],
            },
        },
    },

    materials: {
        type: ControlType.Object,
        title: "⑧ Materials",
        controls: {
            showMaterials: {
                type: ControlType.Boolean,
                title: "Show Section",
                defaultValue: true,
            },
            materialsTag: {
                type: ControlType.String,
                title: "Tag",
                defaultValue: "Materials",
            },
            materialsHeading: {
                type: ControlType.String,
                title: "Heading",
                defaultValue: "Materials for every application",
            },
            materials: {
                type: ControlType.Array,
                title: "Materials",
                control: {
                    type: ControlType.Object,
                    controls: {
                        materialName: {
                            type: ControlType.String,
                            title: "Name",
                        },
                        materialText: {
                            type: ControlType.String,
                            title: "Description",
                        },
                    },
                },
                defaultValue: [
                    {
                        materialName: "PLA",
                        materialText:
                            "Easy to print, ideal for prototypes and aesthetic models.",
                    },
                    {
                        materialName: "PETG",
                        materialText:
                            "Durable and tough, suitable for functional parts.",
                    },
                    {
                        materialName: "ABS",
                        materialText:
                            "High heat resistance, used in technical applications.",
                    },
                    {
                        materialName: "ASA",
                        materialText:
                            "UV-stable alternative to ABS for outdoor use.",
                    },
                    {
                        materialName: "TPU",
                        materialText:
                            "Flexible, rubber-like material for elastic parts.",
                    },
                    {
                        materialName: "Carbon Fiber",
                        materialText:
                            "Extremely strong and lightweight, for demanding structures.",
                    },
                ],
            },
        },
    },

    portfolio: {
        type: ControlType.Object,
        title: "⑨ Portfolio",
        controls: {
            showPortfolio: {
                type: ControlType.Boolean,
                title: "Show Section",
                defaultValue: true,
            },
            portfolioTag: {
                type: ControlType.String,
                title: "Tag",
                defaultValue: "Portfolio",
            },
            portfolioHeading: {
                type: ControlType.String,
                title: "Heading",
                defaultValue: "Our Work",
            },
            items: {
                type: ControlType.Array,
                title: "Portfolio Items",
                control: {
                    type: ControlType.Object,
                    controls: {
                        portfolioImage: {
                            type: ControlType.Image,
                            title: "Photo",
                        },
                        portfolioTitle: {
                            type: ControlType.String,
                            title: "Title",
                        },
                        portfolioDesc: {
                            type: ControlType.String,
                            title: "Description",
                            displayTextArea: true,
                        },
                        portfolioSpec1Label: {
                            type: ControlType.String,
                            title: "Spec 1 Label",
                            defaultValue: "Print Time",
                            description:
                                "e.g. Print Time, Delivery Time, Color.",
                        },
                        portfolioSpec1Value: {
                            type: ControlType.String,
                            title: "Spec 1 Value",
                            description:
                                "Shown next to the label above. Leave blank to hide this row.",
                        },
                        portfolioSpec2Label: {
                            type: ControlType.String,
                            title: "Spec 2 Label",
                            defaultValue: "Weight",
                            description: "e.g. Weight, Size, Capacity.",
                        },
                        portfolioSpec2Value: {
                            type: ControlType.String,
                            title: "Spec 2 Value",
                            description:
                                "Shown next to the label above. Leave blank to hide this row.",
                        },
                        portfolioSpec3Label: {
                            type: ControlType.String,
                            title: "Spec 3 Label",
                            defaultValue: "Material",
                            description: "e.g. Material, Category, Finish.",
                        },
                        portfolioSpec3Value: {
                            type: ControlType.String,
                            title: "Spec 3 Value",
                            description:
                                "Shown next to the label above. Leave blank to hide this row.",
                        },
                    },
                },
                defaultValue: [
                    {
                        portfolioImage: "",
                        portfolioTitle: "Mounting Brackets",
                        portfolioDesc:
                            "Series production of black mounting brackets for industrial use.",
                        portfolioSpec1Label: "Print Time",
                        portfolioSpec1Value: "6 h 20 min",
                        portfolioSpec2Label: "Weight",
                        portfolioSpec2Value: "180 g",
                        portfolioSpec3Label: "Material",
                        portfolioSpec3Value: "PETG",
                    },
                    {
                        portfolioImage: "",
                        portfolioTitle: "Custom L-Bracket",
                        portfolioDesc:
                            "Precision L-shaped bracket designed for tight tolerance assembly.",
                        portfolioSpec1Label: "Print Time",
                        portfolioSpec1Value: "3 h 45 min",
                        portfolioSpec2Label: "Weight",
                        portfolioSpec2Value: "95 g",
                        portfolioSpec3Label: "Material",
                        portfolioSpec3Value: "PLA",
                    },
                    {
                        portfolioImage: "",
                        portfolioTitle: "Precision Machine Parts",
                        portfolioDesc:
                            "Set of green parts with metal threaded inserts for high precision.",
                        portfolioSpec1Label: "Print Time",
                        portfolioSpec1Value: "5 h 10 min",
                        portfolioSpec2Label: "Weight",
                        portfolioSpec2Value: "140 g",
                        portfolioSpec3Label: "Material",
                        portfolioSpec3Value: "PETG",
                    },
                    {
                        portfolioImage: "",
                        portfolioTitle: "Blue Shaft Coupling",
                        portfolioDesc:
                            "Precisely printed shaft coupling available in two sizes.",
                        portfolioSpec1Label: "Print Time",
                        portfolioSpec1Value: "2 h 30 min",
                        portfolioSpec2Label: "Weight",
                        portfolioSpec2Value: "60 g",
                        portfolioSpec3Label: "Material",
                        portfolioSpec3Value: "PLA",
                    },
                    {
                        portfolioImage: "",
                        portfolioTitle: "Blue Part with Bushing",
                        portfolioDesc:
                            "Precision functional part with a metal threaded insert.",
                        portfolioSpec1Label: "Print Time",
                        portfolioSpec1Value: "4 h 05 min",
                        portfolioSpec2Label: "Weight",
                        portfolioSpec2Value: "110 g",
                        portfolioSpec3Label: "Material",
                        portfolioSpec3Value: "PETG",
                    },
                ],
            },
            modalAccentColor: {
                type: ControlType.Color,
                title: "Popup Accent Color",
                defaultValue: DEFAULT_MODAL_ACCENT_COLOR,
            },
        },
    },

    testimonials: {
        type: ControlType.Object,
        title: "⑩ Testimonials",
        controls: {
            showTestimonials: {
                type: ControlType.Boolean,
                title: "Show Section",
                defaultValue: true,
            },
            testimonialsTag: {
                type: ControlType.String,
                title: "Tag",
                defaultValue: "Testimonials",
            },
            testimonialsHeading: {
                type: ControlType.String,
                title: "Heading",
                defaultValue: "What Clients Say",
            },
            testimonials: {
                type: ControlType.Array,
                title: "Testimonials",
                control: {
                    type: ControlType.Object,
                    controls: {
                        quote: { type: ControlType.String, title: "Quote" },
                        name: { type: ControlType.String, title: "Name" },
                        role: { type: ControlType.String, title: "Role" },
                    },
                },
                defaultValue: [
                    {
                        quote: "LBC LAB delivered our prototype in record time with amazing precision.",
                        name: "Jane Doe",
                        role: "Product Manager",
                    },
                    {
                        quote: "Excellent communication and top quality parts every time.",
                        name: "John Smith",
                        role: "Founder, Startup Co.",
                    },
                ],
            },
        },
    },

    faq: {
        type: ControlType.Object,
        title: "⑪ FAQ",
        controls: {
            showFaq: {
                type: ControlType.Boolean,
                title: "Show Section",
                defaultValue: true,
            },
            faqTag: {
                type: ControlType.String,
                title: "Tag",
                defaultValue: "FAQ",
            },
            faqHeading: {
                type: ControlType.String,
                title: "Heading",
                defaultValue: "Frequently Asked Questions",
            },
            items: {
                type: ControlType.Array,
                title: "Questions",
                control: {
                    type: ControlType.Object,
                    controls: {
                        question: {
                            type: ControlType.String,
                            title: "Question",
                        },
                        answer: { type: ControlType.String, title: "Answer" },
                    },
                },
                defaultValue: [
                    {
                        question: "What file formats do you accept?",
                        answer: "We accept STL, STEP, OBJ, and most common 3D file formats.",
                    },
                    {
                        question: "How long does production take?",
                        answer: "Most prototypes are ready within 24-48 hours depending on complexity.",
                    },
                    {
                        question: "Do you offer design services?",
                        answer: "Yes, our engineers can design or optimize your model from scratch.",
                    },
                ],
            },
        },
    },

    contact: {
        type: ControlType.Object,
        title: "⑫ Contact",
        controls: {
            showContact: {
                type: ControlType.Boolean,
                title: "Show Section",
                defaultValue: true,
            },
            contactTag: {
                type: ControlType.String,
                title: "Tag",
                defaultValue: "Contact",
            },
            contactHeading: {
                type: ControlType.String,
                title: "Heading",
                defaultValue: "Let's Build Something Together",
            },
            contactText: {
                type: ControlType.String,
                title: "Text",
                defaultValue:
                    "Send us your idea and we will get back to you shortly.",
            },
            email: {
                type: ControlType.String,
                title: "Email",
                defaultValue: "hello@lbclab.com",
            },
            phone: {
                type: ControlType.String,
                title: "Phone",
                defaultValue: "+1 555 234 567",
            },
            address: {
                type: ControlType.String,
                title: "Address",
                defaultValue: "123 Maker Street, Prague, CZ",
            },
            showMap: {
                type: ControlType.Boolean,
                title: "Show Map",
                defaultValue: true,
            },
            mapAddress: {
                type: ControlType.String,
                title: "Map Address",
                defaultValue: "123 Maker Street, Prague, CZ",
                description:
                    "Enter a real address (not a Google Maps link) to place the pin.",
            },
            mapGrayscale: {
                type: ControlType.Boolean,
                title: "Recolor Base Map",
                defaultValue: true,
            },
            mapTintColor: {
                type: ControlType.Color,
                title: "Map Tint Color",
                defaultValue: DEFAULT_MAP_TINT_COLOR,
            },
            mapTintStrength: {
                type: ControlType.Number,
                title: "Map Tint Strength",
                min: 0,
                max: 1,
                step: 0.05,
                defaultValue: 0.45,
            },
        },
    },

    footer: {
        type: ControlType.Object,
        title: "⑬ Footer",
        controls: {
            showFooter: {
                type: ControlType.Boolean,
                title: "Show Section",
                defaultValue: true,
            },
            footerMotto: {
                type: ControlType.String,
                title: "Motto",
                defaultValue: "Precision. Speed. Innovation.",
            },
            instagramLink: { type: ControlType.Link, title: "Instagram Link" },
            facebookLink: { type: ControlType.Link, title: "Facebook Link" },
            linkedinLink: { type: ControlType.Link, title: "LinkedIn Link" },
        },
    },
})
