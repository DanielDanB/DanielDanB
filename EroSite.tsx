import * as React from "react"
import { addPropertyControls, ControlType, RenderTarget } from "framer"

// ---------------------------------------------------------------------------
// ERO / ŠERO — photography portfolio, as one Framer code component.
//
// This is the version that lives in the Framer project: one root element, a
// stylesheet scoped under .ero-root, and every editable value wired to a
// numbered group in the properties panel. Its twin is sero-mockup.html, the
// standalone page that has to render the same site; a change to one belongs in
// the other. (SeroSite.tsx is the earlier port of the same design and is kept
// for reference.)
// ---------------------------------------------------------------------------

interface PriceCard {
    priceImage: any
    priceTitle: string
    priceDescription: string
    price: string
    priceUnit: string
}

type ButtonStyleKind = "solid" | "glass"

interface NavbarGroup {
    navFollowTheme: boolean
    navLogo: any
    brandName: string
    brandSub: string
    navLabel1: string
    navLink1: string
    navLabel2: string
    navLink2: string
    navLabel3: string
    navLink3: string
    navLabel4: string
    navLink4: string
    navContactText: string
    navContactLink: string
    navBarColor: string
    navBarOpacity: number
    navAlwaysVisible: boolean
}

interface ButtonsGroup {
    btnFollowTheme: boolean
    btnBgColor: string
    btnTextColor: string
    btnOpacity: number
    btnBorderColor: string
    btnBorderRadius: number
    btnStyle: ButtonStyleKind
}

interface GlobalStyleGroup {
    palettePreset: string
    accentColor: string
    siteBgColor: string
    textColor: string
    textMutedColor: string
    fontFamily: string
    colorPhotos: boolean
    cursorMode: "viewfinder" | "default" | "custom"
    cursorViewfinderColor: string
    cursorImage: any
}

interface HeroGroup {
    heroEnabled1: boolean
    heroPhoto1: any
    heroLabel1: string
    heroEnabled2: boolean
    heroPhoto2: any
    heroLabel2: string
    heroEnabled3: boolean
    heroPhoto3: any
    heroLabel3: string
    heroEnabled4: boolean
    heroPhoto4: any
    heroLabel4: string
    heroEnabled5: boolean
    heroPhoto5: any
    heroLabel5: string
    heroEnabled6: boolean
    heroPhoto6: any
    heroLabel6: string
    heroEnabled7: boolean
    heroPhoto7: any
    heroLabel7: string
    heroEnabled8: boolean
    heroPhoto8: any
    heroLabel8: string
    heroTagText: string
    heroCtaText: string
    heroCtaLink: string
    wordmark: string
    heroTextColor: string
    heroFontFamily: string
}

interface MarqueeGroup {
    marqueeText: string
    marqueeSpeed: number
    marqueeBgColor: string
    marqueeTextColor: string
    marqueeFontFamily: string
}

interface GalleryGroup {
    sectionVisibleWork: boolean
    galleryCornerRadius: number
    galleryEnabled1: boolean
    galleryPhoto1: any
    galleryCaption1: string
    galleryEnabled2: boolean
    galleryPhoto2: any
    galleryCaption2: string
    galleryEnabled3: boolean
    galleryPhoto3: any
    galleryCaption3: string
    galleryEnabled4: boolean
    galleryPhoto4: any
    galleryCaption4: string
    galleryEnabled5: boolean
    galleryPhoto5: any
    galleryCaption5: string
    galleryEnabled6: boolean
    galleryPhoto6: any
    galleryCaption6: string
    galleryEnabled7: boolean
    galleryPhoto7: any
    galleryCaption7: string
    galleryEnabled8: boolean
    galleryPhoto8: any
    galleryCaption8: string
    galleryTextColor: string
    galleryFontFamily: string
}

interface PricingGroup {
    sectionVisibleServices: boolean
    pricingCornerRadius: number
    priceCards: PriceCard[]
    pricingTextColor: string
    pricingFontFamily: string
}

interface AboutGroup {
    sectionVisibleAbout: boolean
    aboutImage: any
    aboutQuote: string
    aboutText: string
    aboutTextColor: string
    aboutFontFamily: string
}

interface ContactGroup {
    sectionVisibleContact: boolean
    contactHeading: string
    contactText: string
    contactCtaText: string
    contactEmail: string
    contactPhone: string
    contactBg: any
    contactBgOpacity: number
    contactAddressText: string
    contactMapLink: string
    contactMapWidgetEnabled: boolean
    mapWidgetGrayscale: number
    mapWidgetTintColor: string
    socialInstagramLink: string
    socialFacebookLink: string
    contactBoxColor: string
    contactTextColor: string
    contactFontFamily: string
}

interface CookieGroup {
    cookieEnabled: boolean
    cookieTitle: string
    cookieText: string
    cookiePolicyText: string
    cookiePolicyLink: string
    cookieAcceptText: string
    cookieDeclineText: string
    cookieLayout: "bar" | "card"
    cookieBgColor: string
    cookieTextColor: string
}

interface Props {
    navbar: NavbarGroup
    buttons: ButtonsGroup
    globalStyle: GlobalStyleGroup
    hero: HeroGroup
    marquee: MarqueeGroup
    gallery: GalleryGroup
    pricing: PricingGroup
    about: AboutGroup
    contact: ContactGroup
    cookies: CookieGroup
}

const EASE = "cubic-bezier(0.16, 0.84, 0.44, 1)"
const COLORS = {
    black: "#080807",
    nearBlack: "#111110",
    white: "#f2f0e9",
    gray100: "#cfccc2",
    gray300: "#98958c",
    gray500: "#666359",
    gray700: "#2c2b26",
    glassFill: "rgba(242,240,233,0.06)",
    glassFillStrong: "rgba(242,240,233,0.13)",
    glassBorder: "rgba(242,240,233,0.15)",
}

// ---------------------------------------------------------------------------
// One-click colour themes.
//
// The whole page reads six custom properties, and those six are derived from
// four values: background, text, muted text and accent. Picking a theme in
// ③ Global Style is therefore one click, and "My own colours" is the only
// option that shows the individual colour fields.
//
// Two colours deliberately stay put in every theme: --ero-on-photo and the
// black scrims over photographs. A caption printed on a picture has to stay
// readable whatever the site background is doing.
// ---------------------------------------------------------------------------

interface ThemeTokens {
    bg: string
    text: string
    muted: string
    accent: string
    onAccent: string
}

const THEMES: Record<string, ThemeTokens> = {
    original: { bg: "#080807", text: "#f2f0e9", muted: "#98958c", accent: "#f2f0e9", onAccent: "#080807" },
    gallery: { bg: "#f4f2ec", text: "#14130f", muted: "#5f5c54", accent: "#14130f", onAccent: "#f4f2ec" },
    sand: { bg: "#1a1613", text: "#f0e6d8", muted: "#a89a8a", accent: "#c8a97e", onAccent: "#1a1613" },
    midnight: { bg: "#0a0f1a", text: "#e8edf7", muted: "#8b95a8", accent: "#7aa2f7", onAccent: "#0a0f1a" },
}

const ON_PHOTO = "#f2f0e9"

function parseColor(input: string): [number, number, number, number] | null {
    if (typeof input !== "string") return null
    const value = input.trim()
    if (!value) return null
    const hex = value.match(/^#([0-9a-fA-F]{3,8})$/)
    if (hex) {
        let h = hex[1]
        if (h.length === 3 || h.length === 4) {
            h = h
                .split("")
                .map((c) => c + c)
                .join("")
        }
        if (h.length !== 6 && h.length !== 8) return null
        return [
            parseInt(h.slice(0, 2), 16),
            parseInt(h.slice(2, 4), 16),
            parseInt(h.slice(4, 6), 16),
            h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1,
        ]
    }
    const fn = value.match(/^rgba?\(([^)]+)\)$/i)
    if (fn) {
        const parts = fn[1].split(/[\s,\/]+/).filter(Boolean)
        if (parts.length < 3) return null
        const num = (p: string, max: number) =>
            p.indexOf("%") > -1 ? (parseFloat(p) / 100) * max : parseFloat(p)
        return [
            num(parts[0], 255),
            num(parts[1], 255),
            num(parts[2], 255),
            parts[3] === undefined ? 1 : num(parts[3], 1),
        ]
    }
    return null
}

function withAlpha(color: string, alpha: number): string {
    const c = parseColor(color)
    if (!c) return color
    const a = Math.max(0, Math.min(1, alpha * c[3]))
    return `rgba(${Math.round(c[0])}, ${Math.round(c[1])}, ${Math.round(c[2])}, ${Number(a.toFixed(3))})`
}

function mixColors(from: string, to: string, amount: number): string {
    const a = parseColor(from)
    const b = parseColor(to)
    if (!a || !b) return from
    const at = Math.max(0, Math.min(1, amount))
    const ch = (i: number) => Math.round(a[i] + (b[i] - a[i]) * at)
    return `rgb(${ch(0)}, ${ch(1)}, ${ch(2)})`
}

function readableOn(color: string): string {
    const c = parseColor(color)
    if (!c) return "#080807"
    const lum = (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255
    return lum > 0.58 ? "#080807" : "#f7f6f2"
}

const COOKIE_STORAGE_KEY = "ero-cookie-consent"
const COOKIE_DEFAULTS = {
    title: "Cookies",
    text: "This site uses cookies to measure traffic and remember your preferences.",
    policyText: "Privacy policy",
    accept: "Accept all",
    decline: "Necessary only",
}

const APERTURES = ["f1.8", "f2.8", "f4", "f5.6"]
const SHUTTERS = ["1/125s", "1/250s", "1/500s", "1/1000s"]
const CATEGORIES = ["PORTRAIT", "LANDSCAPE", "ARCHITECTURE", "DETAIL"]
const SCROLL_THRESHOLD = 40
// Kept in step with the max-width: 900px block in CSS_TEXT. The hero fan and
// the viewfinder need a pointer and room; below this the hero is a swipe row.
const COMPACT_QUERY = "(max-width: 900px)"
const GALLERY_REVEAL_FALLBACK_MS = 900
const IDEAL_SIZES = {
    hero: "1200 \u00d7 1600 px",
    gallery: "1080 \u00d7 1360 px",
    pricing: "1200 \u00d7 900 px",
    about: "1000 \u00d7 1250 px",
    contactBg: "1920 \u00d7 1080 px",
}
const DEFAULT_FONT = "Inter, -apple-system, BlinkMacSystemFont, sans-serif"

function makePlaceholder(label: string): string {
    const svg =
        `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="480">` +
        `<rect width="100%" height="100%" fill="#15140f"/>` +
        `<rect x="1" y="1" width="478" height="478" fill="none" stroke="#2c2b26" stroke-width="2"/>` +
        `<text x="50%" y="50%" font-family="Arial, sans-serif" font-size="20" fill="#666359" text-anchor="middle" dominant-baseline="middle">${label}</text>` +
        `</svg>`
    return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

const HERO_PLACEHOLDER = makePlaceholder("HERO PHOTO")
const GALLERY_PLACEHOLDER = makePlaceholder("GALLERY PHOTO")
const PRICING_PLACEHOLDER = makePlaceholder("PRICING PHOTO")
const ABOUT_PLACEHOLDER = makePlaceholder("ABOUT PHOTO")
const CONTACT_PLACEHOLDER = makePlaceholder("CONTACT PHOTO")

function t(value: string | undefined | null, fallback: string): string {
    if (typeof value === "string" && value.trim().length > 0) return value
    return fallback
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

function sectionVars(textColor?: string, fontFamily?: string): React.CSSProperties & Record<string, any> {
    const style: any = {
        color: "var(--ero-text)",
        fontFamily: "var(--ero-font)",
    }
    if (textColor) {
        style["--ero-text"] = textColor
        style["--ero-text-muted"] = textColor
    }
    if (fontFamily) {
        style["--ero-font"] = fontFamily
    }
    return style
}

function SizeHint({ text }: { text: string }) {
    return (
        <div className="ero-size-hint">
            <span>Ideal Resolution</span>
            <strong>{text}</strong>
        </div>
    )
}

const DEFAULTS = {
    brandName: "ERO",
    brandSub: "PHOTOGRAPHER",
    navLabel1: "Work",
    navLink1: "#ero-work",
    navLabel2: "Services",
    navLink2: "#ero-services",
    navLabel3: "About",
    navLink3: "#ero-about",
    navLabel4: "Contact",
    navLink4: "#ero-contact",
    navContactText: "Contact",
    navContactLink: "#ero-contact",
    heroTagText: "I look for the moment when light says more than color.",
    heroCtaText: "View the work",
    heroCtaLink: "#ero-work",
    wordmark: "ERO",
    marqueeText:
        "BLACK & WHITE PHOTOGRAPHY \u2014 PRAGUE, CZ \u2014 PORTRAITS \u2014 WEDDINGS \u2014 EDITORIAL",
    aboutQuote: "I look for the moment when light says more than color.",
    aboutText:
        "I photograph people and places the way I see them in the moment no one else is looking \u2014 in the transition between light and shadow, where the true character of a photograph is born. Working in black and white gives me room to focus on shape, gesture and atmosphere without distraction.",
    contactHeading: "Let's create something unforgettable together.",
    contactText:
        "Whether it's a wedding, portrait or editorial assignment \u2014 get in touch and let's discuss the details.",
    contactCtaText: "Send an email",
    contactEmail: "hello@ero-photo.com",
    contactPhone: "+1 555 234 567",
}

function getScrollTopFromEvent(e: Event): number {
    const target = e.target as any
    if (!target) return window.scrollY || 0
    if (target === document || target === window) {
        return window.scrollY || document.documentElement.scrollTop || 0
    }
    if (typeof target.scrollTop === "number") {
        return Math.max(target.scrollTop, window.scrollY || 0)
    }
    return window.scrollY || 0
}

function EroButton({
    href,
    text,
    glassy,
}: {
    href: string
    text: string
    glassy: boolean
}) {
    return (
        <a href={href} className="ero-glass-btn ero-solid">
            <span className={`ero-btn-fill ${glassy ? "ero-btn-glassy" : ""}`} />
            <span>{text}</span>
        </a>
    )
}

function InstagramIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
        </svg>
    )
}

function FacebookIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path d="M15 3h-2.5A4.5 4.5 0 0 0 8 7.5V10H5.5v3.5H8V21h3.5v-7.5h3l.5-3.5h-3.5V7.5c0-.8.7-1.5 1.5-1.5H15V3z" />
        </svg>
    )
}

function MapPinIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path d="M12 21s-7-6.1-7-11a7 7 0 1 1 14 0c0 4.9-7 11-7 11z" />
            <circle cx="12" cy="10" r="2.4" />
        </svg>
    )
}

/**
 * Framer reads layout support from a block comment, never from line comments —
 * with `//` in front of these the placed component is treated as a fixed size
 * and Fill is greyed out in the panel.
 *
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 1440
 * @framerIntrinsicHeight 5200
 * @framerDisableUnlink
 */
export default function EroPhotographySiteV3(props: Props) {
    const { navbar, buttons, globalStyle, hero, marquee, gallery, pricing, about, contact, cookies } =
        props

    const {
        navFollowTheme,
        navLogo,
        brandName,
        brandSub,
        navLabel1,
        navLink1,
        navLabel2,
        navLink2,
        navLabel3,
        navLink3,
        navLabel4,
        navLink4,
        navContactText,
        navContactLink,
        navBarColor,
        navBarOpacity,
        navAlwaysVisible,
    } = navbar || ({} as NavbarGroup)

    const {
        btnFollowTheme,
        btnBgColor,
        btnTextColor,
        btnOpacity,
        btnBorderColor,
        btnBorderRadius,
        btnStyle,
    } = buttons || ({} as ButtonsGroup)

    const {
        palettePreset,
        accentColor,
        siteBgColor,
        textColor,
        textMutedColor,
        fontFamily,
        colorPhotos,
        cursorMode,
        cursorViewfinderColor,
        cursorImage,
    } = globalStyle || ({} as GlobalStyleGroup)

    const {
        heroEnabled1,
        heroPhoto1,
        heroLabel1,
        heroEnabled2,
        heroPhoto2,
        heroLabel2,
        heroEnabled3,
        heroPhoto3,
        heroLabel3,
        heroEnabled4,
        heroPhoto4,
        heroLabel4,
        heroEnabled5,
        heroPhoto5,
        heroLabel5,
        heroEnabled6,
        heroPhoto6,
        heroLabel6,
        heroEnabled7,
        heroPhoto7,
        heroLabel7,
        heroEnabled8,
        heroPhoto8,
        heroLabel8,
        heroTagText,
        heroCtaText,
        heroCtaLink,
        wordmark,
        heroTextColor,
        heroFontFamily,
    } = hero || ({} as HeroGroup)

    const { marqueeText, marqueeSpeed, marqueeBgColor, marqueeTextColor, marqueeFontFamily } =
        marquee || ({} as MarqueeGroup)

    const {
        sectionVisibleWork,
        galleryCornerRadius,
        galleryEnabled1,
        galleryPhoto1,
        galleryCaption1,
        galleryEnabled2,
        galleryPhoto2,
        galleryCaption2,
        galleryEnabled3,
        galleryPhoto3,
        galleryCaption3,
        galleryEnabled4,
        galleryPhoto4,
        galleryCaption4,
        galleryEnabled5,
        galleryPhoto5,
        galleryCaption5,
        galleryEnabled6,
        galleryPhoto6,
        galleryCaption6,
        galleryEnabled7,
        galleryPhoto7,
        galleryCaption7,
        galleryEnabled8,
        galleryPhoto8,
        galleryCaption8,
        galleryTextColor,
        galleryFontFamily,
    } = gallery || ({} as GalleryGroup)

    const { sectionVisibleServices, pricingCornerRadius, priceCards, pricingTextColor, pricingFontFamily } =
        pricing || ({} as PricingGroup)

    const { sectionVisibleAbout, aboutImage, aboutQuote, aboutText, aboutTextColor, aboutFontFamily } =
        about || ({} as AboutGroup)

    const {
        cookieEnabled,
        cookieTitle,
        cookieText,
        cookiePolicyText,
        cookiePolicyLink,
        cookieAcceptText,
        cookieDeclineText,
        cookieLayout,
        cookieBgColor,
        cookieTextColor,
    } = cookies || ({} as CookieGroup)

    const {
        sectionVisibleContact,
        contactHeading,
        contactText,
        contactCtaText,
        contactEmail,
        contactPhone,
        contactBg,
        contactBgOpacity,
        contactAddressText,
        contactMapLink,
        contactMapWidgetEnabled,
        mapWidgetGrayscale,
        mapWidgetTintColor,
        socialInstagramLink,
        socialFacebookLink,
        contactBoxColor,
        contactTextColor,
        contactFontFamily,
    } = contact || ({} as ContactGroup)

    const safeBrandName = t(brandName, DEFAULTS.brandName)
    const safeBrandSub = t(brandSub, DEFAULTS.brandSub)
    const safeNavContactText = t(navContactText, DEFAULTS.navContactText)
    const safeNavContactLink = t(navContactLink, DEFAULTS.navContactLink)
    const safeHeroTagText = t(heroTagText, DEFAULTS.heroTagText)
    const safeHeroCtaText = t(heroCtaText, DEFAULTS.heroCtaText)
    const safeHeroCtaLink = t(heroCtaLink, DEFAULTS.heroCtaLink)
    const safeWordmark = t(wordmark, DEFAULTS.wordmark)
    const safeMarqueeText = t(marqueeText, DEFAULTS.marqueeText)
    const safeAboutQuote = t(aboutQuote, DEFAULTS.aboutQuote)
    const safeAboutText = t(aboutText, DEFAULTS.aboutText)
    const safeContactHeading = t(contactHeading, DEFAULTS.contactHeading)
    const safeContactText = t(contactText, DEFAULTS.contactText)
    const safeContactCtaText = t(contactCtaText, DEFAULTS.contactCtaText)
    const safeContactEmail = t(contactEmail, DEFAULTS.contactEmail)
    const safeContactPhone = t(contactPhone, DEFAULTS.contactPhone)
    const safeNavLogo = resolveImageSrc(navLogo)
    const safeAboutImage = resolveImageSrc(aboutImage)
    const safeContactBg = resolveImageSrc(contactBg)
    const safeContactBgOpacity =
        typeof contactBgOpacity === "number" ? contactBgOpacity : 1
    const safeInstagramLink = typeof socialInstagramLink === "string" ? socialInstagramLink.trim() : ""
    const safeFacebookLink = typeof socialFacebookLink === "string" ? socialFacebookLink.trim() : ""
    const hasSocialLinks = Boolean(safeInstagramLink || safeFacebookLink)
    const safeMarqueeSpeed = typeof marqueeSpeed === "number" && marqueeSpeed > 0 ? marqueeSpeed : 46
    const safeGalleryRadius = typeof galleryCornerRadius === "number" ? galleryCornerRadius : 16
    const safePricingRadius = typeof pricingCornerRadius === "number" ? pricingCornerRadius : 18
    const showWork = sectionVisibleWork !== false
    const showServices = sectionVisibleServices !== false
    const showAbout = sectionVisibleAbout !== false
    const showContact = sectionVisibleContact !== false
    const safeCursorMode = cursorMode || "viewfinder"
    const safeCursorImage = resolveImageSrc(cursorImage)
    const safeCursorViewfinderColor = cursorViewfinderColor || "rgba(242,240,233,0.85)"
    const safeMapWidgetGrayscale = typeof mapWidgetGrayscale === "number" ? mapWidgetGrayscale : 1
    const safeMapWidgetTintColor = mapWidgetTintColor || "rgba(242,240,233,0.15)"

    const safeAddressText = typeof contactAddressText === "string" ? contactAddressText.trim() : ""
    const safeMapLink = typeof contactMapLink === "string" ? contactMapLink.trim() : ""
    const hasMapInfo = Boolean(safeAddressText || safeMapLink)
    const mapHref = safeMapLink
        ? safeMapLink
        : safeAddressText
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(safeAddressText)}`
        : ""
    const mapLabel = safeAddressText || "View on Map"

    const showMapWidget = Boolean(contactMapWidgetEnabled) && Boolean(safeAddressText)
    const mapEmbedSrc = safeAddressText
        ? `https://www.google.com/maps?q=${encodeURIComponent(safeAddressText)}&output=embed`
        : ""

    const heroPanels = React.useMemo(() => {
        const slots = [
            { enabled: heroEnabled1, photo: heroPhoto1, label: heroLabel1, fallback: "Portrait" },
            { enabled: heroEnabled2, photo: heroPhoto2, label: heroLabel2, fallback: "Wedding" },
            { enabled: heroEnabled3, photo: heroPhoto3, label: heroLabel3, fallback: "Landscape" },
            { enabled: heroEnabled4, photo: heroPhoto4, label: heroLabel4, fallback: "Architecture" },
            { enabled: heroEnabled5, photo: heroPhoto5, label: heroLabel5, fallback: "Photo 5" },
            { enabled: heroEnabled6, photo: heroPhoto6, label: heroLabel6, fallback: "Photo 6" },
            { enabled: heroEnabled7, photo: heroPhoto7, label: heroLabel7, fallback: "Photo 7" },
            { enabled: heroEnabled8, photo: heroPhoto8, label: heroLabel8, fallback: "Photo 8" },
        ]
        const visible = slots.filter((s) => s.enabled)
        return visible.map((s, i) => ({
            image: resolveImageSrc(s.photo),
            index: String(i + 1).padStart(2, "0"),
            label: t(s.label, s.fallback),
        }))
    }, [
        heroEnabled1, heroPhoto1, heroLabel1,
        heroEnabled2, heroPhoto2, heroLabel2,
        heroEnabled3, heroPhoto3, heroLabel3,
        heroEnabled4, heroPhoto4, heroLabel4,
        heroEnabled5, heroPhoto5, heroLabel5,
        heroEnabled6, heroPhoto6, heroLabel6,
        heroEnabled7, heroPhoto7, heroLabel7,
        heroEnabled8, heroPhoto8, heroLabel8,
    ])

    const heroPanelsKey = React.useMemo(
        () => heroPanels.map((p) => `${p.image}|${p.label}`).join("::"),
        [heroPanels]
    )

    const navItems = React.useMemo(
        () => [
            { label: t(navLabel1, DEFAULTS.navLabel1), link: t(navLink1, DEFAULTS.navLink1) },
            { label: t(navLabel2, DEFAULTS.navLabel2), link: t(navLink2, DEFAULTS.navLink2) },
            { label: t(navLabel3, DEFAULTS.navLabel3), link: t(navLink3, DEFAULTS.navLink3) },
            { label: t(navLabel4, DEFAULTS.navLabel4), link: t(navLink4, DEFAULTS.navLink4) },
        ],
        [navLabel1, navLink1, navLabel2, navLink2, navLabel3, navLink3, navLabel4, navLink4]
    )

    const safeGalleryItems = React.useMemo(() => {
        const slots = [
            { enabled: galleryEnabled1, photo: galleryPhoto1, caption: galleryCaption1, fallback: "Photo 1" },
            { enabled: galleryEnabled2, photo: galleryPhoto2, caption: galleryCaption2, fallback: "Photo 2" },
            { enabled: galleryEnabled3, photo: galleryPhoto3, caption: galleryCaption3, fallback: "Photo 3" },
            { enabled: galleryEnabled4, photo: galleryPhoto4, caption: galleryCaption4, fallback: "Photo 4" },
            { enabled: galleryEnabled5, photo: galleryPhoto5, caption: galleryCaption5, fallback: "Photo 5" },
            { enabled: galleryEnabled6, photo: galleryPhoto6, caption: galleryCaption6, fallback: "Photo 6" },
            { enabled: galleryEnabled7, photo: galleryPhoto7, caption: galleryCaption7, fallback: "Photo 7" },
            { enabled: galleryEnabled8, photo: galleryPhoto8, caption: galleryCaption8, fallback: "Photo 8" },
        ]
        const visible = slots.filter((s) => s.enabled)
        return visible.map((s) => ({
            image: resolveImageSrc(s.photo),
            caption: t(s.caption, s.fallback),
        }))
    }, [
        galleryEnabled1, galleryPhoto1, galleryCaption1,
        galleryEnabled2, galleryPhoto2, galleryCaption2,
        galleryEnabled3, galleryPhoto3, galleryCaption3,
        galleryEnabled4, galleryPhoto4, galleryCaption4,
        galleryEnabled5, galleryPhoto5, galleryCaption5,
        galleryEnabled6, galleryPhoto6, galleryCaption6,
        galleryEnabled7, galleryPhoto7, galleryCaption7,
        galleryEnabled8, galleryPhoto8, galleryCaption8,
    ])

    const galleryContentKey = React.useMemo(
        () => safeGalleryItems.map((g) => `${g.image}|${g.caption}`).join("::"),
        [safeGalleryItems]
    )

    const safePriceCards = React.useMemo(() => {
        const cards = priceCards && priceCards.length > 0 ? priceCards : []
        return cards.map((c) => ({
            image: resolveImageSrc(c && c.priceImage),
            title: t(c && c.priceTitle, "Untitled Service"),
            description: t(c && c.priceDescription, ""),
            price: t(c && c.price, "on request"),
            priceUnit: (c && c.priceUnit) || "",
        }))
    }, [priceCards])

    const rootRef = React.useRef<HTMLDivElement>(null)
    const heroRef = React.useRef<HTMLDivElement>(null)
    const leporeloRef = React.useRef<HTMLDivElement>(null)
    const galleryViewportRef = React.useRef<HTMLDivElement>(null)
    const galleryTrackRef = React.useRef<HTMLDivElement>(null)
    const filmFrameRef = React.useRef<HTMLDivElement>(null)
    // The frame itself rests at clip-path: inset(0 0 0 100%); an observer put on
    // it can report an empty rectangle for ever and the section never unrolls.
    // Its unclipped wrapper is what gets watched.
    const filmWrapRef = React.useRef<HTMLDivElement>(null)
    const aboutImgWrapRef = React.useRef<HTMLDivElement>(null)

    const [scrolled, setScrolled] = React.useState(false)
    const [menuOpen, setMenuOpen] = React.useState(false)
    const [activePanel, setActivePanel] = React.useState(0)
    const [panelStyles, setPanelStyles] = React.useState<{ grow: number; tilt: number }[]>(
        heroPanels.map(() => ({ grow: 1, tilt: 0 }))
    )

    React.useEffect(() => {
        setPanelStyles((prev) => {
            if (prev.length === heroPanels.length) return prev
            return heroPanels.map((_, i) => prev[i] || { grow: 1, tilt: 0 })
        })
        setActivePanel((prev) => (prev >= heroPanels.length ? -1 : prev))
    }, [heroPanelsKey, heroPanels.length])

    const [viewfinder, setViewfinder] = React.useState({ x: 0, y: 0, opacity: 0, text: "" })
    const [viewfinderSuppressed, setViewfinderSuppressed] = React.useState(false)
    const [galleryViewfinder, setGalleryViewfinder] = React.useState({ x: 0, y: 0, opacity: 0, text: "" })
    const [hoveredGalleryIdx, setHoveredGalleryIdx] = React.useState(-1)
    const [visibleGalleryItems, setVisibleGalleryItems] = React.useState<boolean[]>(
        safeGalleryItems.map(() => false)
    )
    const [lightbox, setLightbox] = React.useState<{ open: boolean; image: string; caption: string }>({
        open: false,
        image: "",
        caption: "",
    })
    const [filmUnrolled, setFilmUnrolled] = React.useState(false)
    const [reduceMotion, setReduceMotion] = React.useState(false)
    const [pointerFine, setPointerFine] = React.useState(true)
    const [isCompact, setIsCompact] = React.useState(false)
    const [customCursorPos, setCustomCursorPos] = React.useState({ x: 0, y: 0, opacity: 0 })
    const [cookieVisible, setCookieVisible] = React.useState(false)

    React.useEffect(() => {
        const mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)")
        const mqPointer = window.matchMedia("(pointer: fine)")
        setReduceMotion(mqReduce.matches)
        setPointerFine(mqPointer.matches)
        const mqCompact = window.matchMedia(COMPACT_QUERY)
        const checkCompact = () => setIsCompact(mqCompact.matches)
        checkCompact()
        // Safari below 14 has no addEventListener on a MediaQueryList, and the
        // resize listener costs nothing, so both paths stay.
        window.addEventListener("resize", checkCompact)
        return () => window.removeEventListener("resize", checkCompact)
    }, [])

    // The bar is always drawn on the Framer canvas so it can be styled there,
    // and only shown to a visitor who has not answered it yet. localStorage
    // throws outright in a few privacy modes, so every access is guarded.
    const isCanvas = RenderTarget.current() === RenderTarget.canvas

    React.useEffect(() => {
        if (cookieEnabled === false) {
            setCookieVisible(false)
            return
        }
        if (isCanvas) {
            setCookieVisible(true)
            return
        }
        let answered: string | null = null
        try {
            answered = window.localStorage.getItem(COOKIE_STORAGE_KEY)
        } catch (err) {
            answered = null
        }
        if (answered) {
            setCookieVisible(false)
            return
        }
        const timer = window.setTimeout(() => setCookieVisible(true), 500)
        return () => window.clearTimeout(timer)
    }, [cookieEnabled, isCanvas])

    const answerCookies = React.useCallback((answer: "accepted" | "necessary") => {
        try {
            window.localStorage.setItem(COOKIE_STORAGE_KEY, answer)
        } catch (err) {
            /* private mode: the choice simply is not remembered */
        }
        setCookieVisible(false)
    }, [])

    const useViewfinderCursor = pointerFine && !isCompact && safeCursorMode === "viewfinder"
    const useCustomCursor = pointerFine && !isCompact && safeCursorMode === "custom" && !!safeCursorImage

    React.useEffect(() => {
        if (!useCustomCursor) return
        const onMove = (e: PointerEvent) => {
            setCustomCursorPos({ x: e.clientX, y: e.clientY, opacity: 1 })
        }
        const onLeave = () => setCustomCursorPos((v) => ({ ...v, opacity: 0 }))
        window.addEventListener("pointermove", onMove)
        window.addEventListener("pointerleave", onLeave)
        return () => {
            window.removeEventListener("pointermove", onMove)
            window.removeEventListener("pointerleave", onLeave)
        }
    }, [useCustomCursor])

    React.useEffect(() => {
        const evaluate = (e?: Event) => {
            const scrollTop = e ? getScrollTopFromEvent(e) : window.scrollY || 0
            const internal = rootRef.current ? rootRef.current.scrollTop : 0
            setScrolled(Math.max(scrollTop, internal) > SCROLL_THRESHOLD)
        }
        window.addEventListener("scroll", evaluate, { passive: true, capture: true })
        const root = rootRef.current
        root?.addEventListener("scroll", evaluate, { passive: true })
        evaluate()
        return () => {
            window.removeEventListener("scroll", evaluate, { capture: true } as any)
            root?.removeEventListener("scroll", evaluate)
        }
    }, [])

    const updateFan = React.useCallback(
        (clientX: number) => {
            const el = leporeloRef.current
            if (!el) return
            const n = heroPanels.length
            if (n === 0) return
            const rect = el.getBoundingClientRect()
            const x = clientX - rect.left
            const sigma = (rect.width / n) * 0.6
            let bestIdx = 0
            let bestWeight = -1
            const weights = heroPanels.map((_, i) => {
                const center = ((i + 0.5) / n) * rect.width
                const dist = Math.abs(x - center)
                const w = Math.exp(-Math.pow(dist / sigma, 2) * 1.15)
                if (w > bestWeight) {
                    bestWeight = w
                    bestIdx = i
                }
                return w
            })
            const next = heroPanels.map((_, i) => {
                const grow = 0.2 + weights[i] * 7
                const offset = i - bestIdx
                const tilt = Math.max(-10, Math.min(10, offset * 6))
                return { grow, tilt }
            })
            setPanelStyles(next)
            setActivePanel(bestIdx)
        },
        [heroPanels]
    )

    const resetFan = React.useCallback(() => {
        setPanelStyles(heroPanels.map(() => ({ grow: 1, tilt: 0 })))
        setActivePanel(-1)
    }, [heroPanels])

    React.useEffect(() => {
        const el = leporeloRef.current
        if (!el) return
        if (isCompact || reduceMotion) {
            resetFan()
            return
        }
        const onMove = (e: PointerEvent) => updateFan(e.clientX)
        el.addEventListener("pointermove", onMove)
        el.addEventListener("pointerleave", resetFan)
        return () => {
            el.removeEventListener("pointermove", onMove)
            el.removeEventListener("pointerleave", resetFan)
        }
    }, [isCompact, reduceMotion, updateFan, resetFan])

    React.useEffect(() => {
        const heroEl = heroRef.current
        if (!heroEl || !pointerFine || isCompact) return
        const onMove = (e: PointerEvent) => {
            const idx =
                Math.floor((e.clientX / window.innerWidth) * APERTURES.length) % APERTURES.length
            setViewfinder({
                x: e.clientX,
                y: e.clientY,
                opacity: 1,
                text: `${APERTURES[idx]} ${SHUTTERS[idx]} ISO 400`,
            })
        }
        const onLeave = () => setViewfinder((v) => ({ ...v, opacity: 0 }))
        heroEl.addEventListener("pointermove", onMove)
        heroEl.addEventListener("pointerleave", onLeave)
        return () => {
            heroEl.removeEventListener("pointermove", onMove)
            heroEl.removeEventListener("pointerleave", onLeave)
        }
    }, [pointerFine, isCompact])

    React.useEffect(() => {
        const el = galleryViewportRef.current
        if (!el || !pointerFine) return
        const total = safeGalleryItems.length
        const onMove = (e: PointerEvent) => {
            let text = ""
            if (hoveredGalleryIdx >= 0) {
                const label = CATEGORIES[hoveredGalleryIdx % CATEGORIES.length]
                text = `${label} N${String(hoveredGalleryIdx + 1).padStart(2, "0")}/${String(total).padStart(2, "0")}`
            }
            setGalleryViewfinder({ x: e.clientX, y: e.clientY, opacity: 1, text })
        }
        const onLeave = () => setGalleryViewfinder((v) => ({ ...v, opacity: 0 }))
        el.addEventListener("pointermove", onMove)
        el.addEventListener("pointerleave", onLeave)
        return () => {
            el.removeEventListener("pointermove", onMove)
            el.removeEventListener("pointerleave", onLeave)
        }
    }, [pointerFine, hoveredGalleryIdx, safeGalleryItems.length])

    const galleryItemRefs = React.useRef<(HTMLDivElement | null)[]>([])

    React.useEffect(() => {
        setVisibleGalleryItems((prev) => {
            if (prev.length === safeGalleryItems.length) return prev
            return safeGalleryItems.map((_, i) => prev[i] || false)
        })
        if (!("IntersectionObserver" in window)) {
            setVisibleGalleryItems(safeGalleryItems.map(() => true))
            return
        }
        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const idx = galleryItemRefs.current.indexOf(entry.target as HTMLDivElement)
                    if (entry.isIntersecting && idx > -1) {
                        setVisibleGalleryItems((prev) => {
                            if (prev[idx]) return prev
                            const next = [...prev]
                            next[idx] = true
                            return next
                        })
                        io.unobserve(entry.target)
                    }
                })
            },
            { threshold: 0.1 }
        )
        galleryItemRefs.current.forEach((el) => el && io.observe(el))
        const fallback = window.setTimeout(() => {
            setVisibleGalleryItems((prev) => {
                if (prev.every(Boolean)) return prev
                return prev.map(() => true)
            })
        }, GALLERY_REVEAL_FALLBACK_MS)
        return () => {
            io.disconnect()
            window.clearTimeout(fallback)
        }
    }, [galleryContentKey, safeGalleryItems.length])

    React.useEffect(() => {
        const el = filmWrapRef.current || filmFrameRef.current
        if (!el || !("IntersectionObserver" in window)) return
        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setFilmUnrolled(true)
                        io.unobserve(entry.target)
                    }
                })
            },
            { threshold: 0.2 }
        )
        io.observe(el)
        const fallback = window.setTimeout(() => setFilmUnrolled(true), 1500)
        return () => {
            io.disconnect()
            window.clearTimeout(fallback)
        }
    }, [])

    React.useEffect(() => {
        if (reduceMotion) return
        const wrap = aboutImgWrapRef.current
        if (!wrap) return
        const img = wrap.querySelector("img") as HTMLImageElement | null
        if (!img) return
        let ticking = false
        const update = () => {
            const rect = wrap.getBoundingClientRect()
            const vh = window.innerHeight
            const progress = (rect.top - vh / 2 + rect.height / 2) / vh
            const offset = Math.max(-90, Math.min(90, progress * -180))
            img.style.transform = `translate3d(0, ${offset}px, 0)`
            ticking = false
        }
        const onScroll = () => {
            if (!ticking) {
                requestAnimationFrame(update)
                ticking = true
            }
        }
        window.addEventListener("scroll", onScroll, { passive: true, capture: true })
        update()
        return () => window.removeEventListener("scroll", onScroll, { capture: true } as any)
    }, [reduceMotion])

    const scrollGalleryBy = React.useCallback(
        (dir: 1 | -1) => {
            const viewport = galleryViewportRef.current
            if (!viewport) return
            const items = viewport.querySelectorAll<HTMLElement>(".ero-gallery-item")
            const first = items && items.length > 0 ? items[0] : null
            const itemWidth = first ? first.getBoundingClientRect().width : 270
            const gap = 18
            const step = itemWidth + gap
            const maxScroll = Math.max(0, viewport.scrollWidth - viewport.clientWidth)
            const current = viewport.scrollLeft
            let target = current + dir * step
            target = Math.max(0, Math.min(maxScroll, target))
            if (typeof viewport.scrollTo === "function") {
                viewport.scrollTo({ left: target, behavior: reduceMotion ? "auto" : "smooth" })
            } else {
                viewport.scrollLeft = target
            }
        },
        [reduceMotion]
    )

    const openLightbox = (item: { image: string; caption: string }) =>
        setLightbox({ open: true, image: item.image, caption: item.caption })
    const closeLightbox = () => setLightbox({ open: false, image: "", caption: "" })

    React.useEffect(() => {
        document.body.style.overflow = lightbox.open ? "hidden" : ""
    }, [lightbox.open])

    React.useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") closeLightbox()
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [])

    const toggleMenu = () => setMenuOpen((v) => !v)
    const closeMenu = () => setMenuOpen(false)

    // Artifact hosts and CMS previews inject <base href>, which makes a plain
    // href="#ero-work" resolve against a different URL and quietly do nothing.
    // Anything pointing at an id on this page is scrolled by hand instead.
    const handleInPageLink = React.useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            const node = e.target as HTMLElement | null
            const anchor = node && node.closest ? (node.closest("a") as HTMLAnchorElement | null) : null
            if (!anchor) return
            const href = anchor.getAttribute("href") || ""
            const hash = href.indexOf("#")
            if (hash < 0) return
            const id = href.slice(hash + 1)
            if (!id) return
            const target = document.getElementById(id)
            if (!target) return
            e.preventDefault()
            setMenuOpen(false)
            target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" })
        },
        [reduceMotion]
    )

    const navBarVisible = scrolled || navAlwaysVisible
    const buttonsGlassy = btnStyle === "glass"
    const hideNativeCursor = useViewfinderCursor || useCustomCursor

    // ---- the palette, resolved once ---------------------------------------
    // Everything downstream reads these, so ③ Global Style -> Color Theme is a
    // single click that carries the navbar, buttons, borders, glass panels and
    // section rules with it.
    const themeKey =
        palettePreset === "custom" ? "custom" : THEMES[palettePreset] ? palettePreset : "original"
    const themeIsCustom = themeKey === "custom"
    const baseTheme = THEMES[themeKey] || THEMES.original
    const themeBg = themeIsCustom ? siteBgColor || baseTheme.bg : baseTheme.bg
    const themeText = themeIsCustom ? textColor || baseTheme.text : baseTheme.text
    const themeMuted = themeIsCustom ? textMutedColor || baseTheme.muted : baseTheme.muted
    const themeAccent = themeIsCustom ? accentColor || baseTheme.accent : baseTheme.accent
    const themeOnAccent = themeIsCustom ? readableOn(themeAccent) : baseTheme.onAccent

    const buttonsFollowTheme = btnFollowTheme !== false
    const buttonBg = buttonsFollowTheme ? themeAccent : btnBgColor || themeAccent
    const buttonText = buttonsFollowTheme ? themeOnAccent : btnTextColor || themeOnAccent
    const buttonBorder = buttonsFollowTheme
        ? withAlpha(themeText, 0.15)
        : btnBorderColor || withAlpha(themeText, 0.15)
    const navFollowsTheme = navFollowTheme !== false
    const navBackground = navFollowsTheme ? themeBg : navBarColor || themeBg

    // width: 100% and height: auto are the other half of the block comment
    // above the export — Framer offers Fill/Fit only if the root agrees to it.
    const rootStyle: React.CSSProperties & Record<string, any> = {
        position: "relative",
        width: "100%",
        maxWidth: "100%",
        height: "auto",
        overflowX: "hidden",
        background: "var(--ero-bg)",
        color: "var(--ero-text)",
        fontFamily: "var(--ero-font)",
        WebkitFontSmoothing: "antialiased",
        "--ero-bg": themeBg,
        "--ero-text": themeText,
        "--ero-text-muted": themeMuted,
        "--ero-accent": themeAccent,
        "--ero-on-accent": themeOnAccent,
        "--ero-on-photo": ON_PHOTO,
        "--ero-surface": mixColors(themeBg, themeText, 0.07),
        "--ero-line": withAlpha(themeText, 0.16),
        "--ero-glass-fill": withAlpha(themeText, 0.06),
        "--ero-glass-strong": withAlpha(themeText, 0.13),
        "--ero-glass-border": withAlpha(themeText, 0.15),
        "--ero-scrim-soft": withAlpha(themeBg, 0.55),
        "--ero-scrim": withAlpha(themeBg, 0.92),
        "--ero-font": fontFamily || DEFAULT_FONT,
        "--ero-btn-bg": buttonBg,
        "--ero-btn-text": buttonText,
        "--ero-btn-border": buttonBorder,
        "--ero-btn-radius": `${typeof btnBorderRadius === "number" ? btnBorderRadius : 999}px`,
        "--ero-btn-opacity": typeof btnOpacity === "number" ? btnOpacity : 1,
        "--ero-gallery-radius": `${safeGalleryRadius}px`,
        "--ero-pricing-radius": `${safePricingRadius}px`,
        "--ero-cursor-color": safeCursorViewfinderColor,
        "--ero-map-grayscale": String(safeMapWidgetGrayscale),
        "--ero-map-tint": safeMapWidgetTintColor,
    }

    const cookieStyle: React.CSSProperties & Record<string, any> = {}
    if (cookieBgColor) cookieStyle["--ero-cookie-bg"] = cookieBgColor
    if (cookieTextColor) cookieStyle["--ero-cookie-text"] = cookieTextColor

    const heroSectionStyle = { ...sectionVars(heroTextColor, heroFontFamily) }
    const marqueeSectionStyle: any = {
        ...sectionVars(marqueeTextColor, marqueeFontFamily),
    }
    if (marqueeBgColor) marqueeSectionStyle["--ero-marquee-bg"] = marqueeBgColor
    const gallerySectionStyle = { ...sectionVars(galleryTextColor, galleryFontFamily) }
    const pricingSectionStyle = { ...sectionVars(pricingTextColor, pricingFontFamily) }
    const aboutSectionStyle = { ...sectionVars(aboutTextColor, aboutFontFamily) }
    const contactSectionStyle: any = { ...sectionVars(contactTextColor, contactFontFamily) }
    if (contactBoxColor) contactSectionStyle["--ero-contact-box"] = contactBoxColor

    return (
        <div
            ref={rootRef}
            className={`ero-root ${colorPhotos ? "ero-color-mode" : ""} ${useCustomCursor ? "ero-custom-cursor-active" : ""}`}
            style={rootStyle}
            onClick={handleInPageLink}
        >
            <style>{CSS_TEXT}</style>

            {useCustomCursor && (
                <img
                    src={safeCursorImage}
                    alt=""
                    className="ero-custom-cursor"
                    style={{
                        left: customCursorPos.x,
                        top: customCursorPos.y,
                        opacity: customCursorPos.opacity,
                    }}
                />
            )}

            {/* --------- NAVBAR --------- */}
            <nav className={`ero-nav ${navBarVisible ? "ero-nav-scrolled" : ""}`}>
                <div
                    className="ero-nav-bg"
                    style={{
                        background: navBackground,
                        opacity: navBarVisible ? (typeof navBarOpacity === "number" ? navBarOpacity : 0.75) : 0,
                    }}
                />
                <a href="#ero-hero" className="ero-brand" onClick={closeMenu}>
                    {safeNavLogo ? (
                        <img className="ero-logo-img" src={safeNavLogo} alt={safeBrandName} />
                    ) : (
                        <svg className="ero-aperture" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.3}>
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 2 L15 9 L9 9 Z" />
                            <path d="M22 12 L15 15 L15 9 Z" />
                            <path d="M12 22 L9 15 L15 15 Z" />
                            <path d="M2 12 L9 9 L9 15 Z" />
                        </svg>
                    )}
                    <span className="ero-brand-name">{safeBrandName}</span>
                    <span className="ero-brand-sub">{safeBrandSub}</span>
                </a>
                <ul className={`ero-nav-links ${menuOpen ? "ero-open" : ""}`}>
                    {navItems.map((item, i) => (
                        <li key={i}>
                            <a href={item.link} onClick={closeMenu}>{item.label}</a>
                        </li>
                    ))}
                    <li>
                        <a href={safeNavContactLink} className="ero-glass-btn ero-solid" onClick={closeMenu}>
                            <span className={`ero-btn-fill ${buttonsGlassy ? "ero-btn-glassy" : ""}`} />
                            <span>{safeNavContactText}</span>
                        </a>
                    </li>
                </ul>
                <button
                    type="button"
                    className="ero-menu-toggle"
                    aria-label={menuOpen ? "Close menu" : "Open menu"}
                    aria-expanded={menuOpen}
                    onClick={toggleMenu}
                >
                    <span className={menuOpen ? "ero-x" : ""} />
                </button>
            </nav>

            {/* --------- HERO --------- */}
            <section id="ero-hero" ref={heroRef} className={`ero-hero ${hideNativeCursor ? "ero-cursor-none" : ""}`} style={heroSectionStyle}>
                <div ref={leporeloRef} className="ero-leporelo">
                    {heroPanels.map((panel, i) => {
                        const style = panelStyles[i] || { grow: 1, tilt: 0 }
                        const active = i === activePanel
                        return (
                            <div
                                key={i}
                                className={`ero-panel ${active ? "ero-panel-active" : ""}`}
                                style={{
                                    flexGrow: isCompact ? undefined : style.grow,
                                    transform: isCompact ? "none" : `rotateY(${style.tilt}deg)`,
                                }}
                            >
                                <img
                                    src={panel.image || HERO_PLACEHOLDER}
                                    alt={panel.label}
                                    className={active ? "ero-img-active" : ""}
                                />
                                {!panel.image && <SizeHint text={IDEAL_SIZES.hero} />}
                                <div className="ero-panel-meta">
                                    <span className="ero-num">{panel.index}</span>
                                    <span>{panel.label}</span>
                                </div>
                            </div>
                        )
                    })}
                </div>
                <div className="ero-blend-wordmark">{safeWordmark}</div>
                <div className="ero-hero-tag ero-glass">
                    <p>{safeHeroTagText}</p>
                </div>
                <div
                    className="ero-hero-cta-wrap"
                    onPointerEnter={() => setViewfinderSuppressed(true)}
                    onPointerLeave={() => setViewfinderSuppressed(false)}
                >
                    <EroButton href={safeHeroCtaLink} text={safeHeroCtaText} glassy={buttonsGlassy} />
                </div>
                <div className="ero-swipe-hint">
                    <span>SWIPE</span>
                    <svg viewBox="0 0 24 24" fill="none">
                        <path d="M2 12h20M16 6l6 6-6 6" stroke="currentColor" strokeWidth={1.6} />
                    </svg>
                </div>
                {useViewfinderCursor && (
                    <div
                        className="ero-viewfinder"
                        style={{
                            left: viewfinder.x,
                            top: viewfinder.y,
                            opacity: viewfinderSuppressed ? 0 : viewfinder.opacity,
                        }}
                    >
                        <span className="ero-corner ero-tl" />
                        <span className="ero-corner ero-tr" />
                        <span className="ero-corner ero-bl" />
                        <span className="ero-corner ero-br" />
                        <span className="ero-exif">{viewfinder.text}</span>
                    </div>
                )}
            </section>

            {/* --------- MARQUEE --------- */}
            <div className="ero-marquee-strip" style={marqueeSectionStyle}>
                <div
                    className="ero-marquee-track"
                    style={{ animationDuration: `${safeMarqueeSpeed}s` }}
                >
                    <span>{safeMarqueeText}&nbsp;&nbsp;&nbsp;&nbsp;</span>
                    <span>{safeMarqueeText}&nbsp;&nbsp;&nbsp;&nbsp;</span>
                    <span>{safeMarqueeText}&nbsp;&nbsp;&nbsp;&nbsp;</span>
                    <span>{safeMarqueeText}&nbsp;&nbsp;&nbsp;&nbsp;</span>
                </div>
            </div>

            <main className="ero-main">
                {/* --------- SELECTED WORK / GALLERY --------- */}
                {showWork && (
                    <section id="ero-work" className="ero-wrap ero-gallery-section" style={gallerySectionStyle}>
                        <div className="ero-section-head">
                            <div>
                                <span className="ero-idx eyebrow">01</span>
                                <h2>Selected Work</h2>
                            </div>
                            <span className="ero-count">{safeGalleryItems.length} frames</span>
                        </div>
                        <div className="ero-gallery-carousel">
                            <button type="button" className="ero-gallery-nav" aria-label="Previous" onClick={() => scrollGalleryBy(-1)}>
                                <svg viewBox="0 0 24 24" fill="none">
                                    <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth={1.8} />
                                </svg>
                            </button>
                            <div ref={galleryViewportRef} className={`ero-gallery-viewport ${hideNativeCursor ? "ero-cursor-none" : ""}`}>
                                <div ref={galleryTrackRef} className="ero-gallery-track">
                                    {safeGalleryItems.map((item, i) => (
                                        <div
                                            key={i}
                                            ref={(el) => {
                                                // A callback ref must return
                                                // nothing: React 19 reads a
                                                // returned value as a cleanup
                                                // function.
                                                galleryItemRefs.current[i] = el
                                            }}
                                            className={`ero-gallery-item ${visibleGalleryItems[i] ? "ero-in-view" : ""} ${hoveredGalleryIdx === i ? "ero-hovered" : ""}`}
                                            style={{ transitionDelay: reduceMotion ? "0ms" : `${(i % 4) * 70}ms` }}
                                            tabIndex={0}
                                            role="button"
                                            onPointerEnter={() => setHoveredGalleryIdx(i)}
                                            onPointerLeave={() => setHoveredGalleryIdx(-1)}
                                            onClick={() => openLightbox(item)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" || e.key === " ") {
                                                    e.preventDefault()
                                                    openLightbox(item)
                                                }
                                            }}
                                        >
                                            <span className="ero-gallery-frame-no">
                                                N{String(i + 1).padStart(2, "0")}/{String(safeGalleryItems.length).padStart(2, "0")}
                                            </span>
                                            <img src={item.image || GALLERY_PLACEHOLDER} alt={item.caption} />
                                            {!item.image && <SizeHint text={IDEAL_SIZES.gallery} />}
                                            <span className="ero-gallery-caption">{item.caption}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <button type="button" className="ero-gallery-nav" aria-label="Next" onClick={() => scrollGalleryBy(1)}>
                                <svg viewBox="0 0 24 24" fill="none">
                                    <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth={1.8} />
                                </svg>
                            </button>
                            {useViewfinderCursor && (
                                <div
                                    className="ero-viewfinder"
                                    style={{ left: galleryViewfinder.x, top: galleryViewfinder.y, opacity: galleryViewfinder.opacity }}
                                >
                                    <span className="ero-corner ero-tl" />
                                    <span className="ero-corner ero-tr" />
                                    <span className="ero-corner ero-bl" />
                                    <span className="ero-corner ero-br" />
                                    <span className="ero-exif">{galleryViewfinder.text}</span>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* --------- PRICING --------- */}
                {showServices && (
                    <section id="ero-services" className="ero-wrap ero-pricing-section" style={pricingSectionStyle}>
                        <div className="ero-section-head">
                            <div>
                                <span className="ero-idx eyebrow">02</span>
                                <h2>Services and Pricing</h2>
                            </div>
                        </div>
                        <div className="ero-pricing-grid">
                            {safePriceCards.map((card, i) => (
                                <div key={i} className="ero-price-card">
                                    <div className="ero-price-media">
                                        <img src={card.image || PRICING_PLACEHOLDER} alt={card.title} />
                                        {!card.image && <SizeHint text={IDEAL_SIZES.pricing} />}
                                    </div>
                                    <div className="ero-price-body">
                                        <span className="ero-p-num">0{i + 1}</span>
                                        <h3>{card.title}</h3>
                                        <p>{card.description}</p>
                                        <div className="ero-p-price">
                                            {card.price}
                                            <span>{card.priceUnit}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* --------- ABOUT --------- */}
                {showAbout && (
                    <section id="ero-about" className="ero-wrap ero-about-section" style={aboutSectionStyle}>
                        <div className="ero-about-grid">
                            <div ref={aboutImgWrapRef} className="ero-about-image">
                                <img src={safeAboutImage || ABOUT_PLACEHOLDER} alt="About" />
                                {!safeAboutImage && <SizeHint text={IDEAL_SIZES.about} />}
                            </div>
                            <div className="ero-about-text">
                                <span className="ero-idx eyebrow">03</span>
                                <p className="ero-about-quote">{safeAboutQuote}</p>
                                <p>{safeAboutText}</p>
                            </div>
                        </div>
                    </section>
                )}

                {/* --------- CONTACT --------- */}
                {showContact && (
                    <section id="ero-contact" className="ero-contact-section" style={contactSectionStyle}>
                        <div className="ero-wrap">
                            <div className="ero-film-stage">
                                <div ref={filmWrapRef} className="ero-film-wrap">
                                    <div ref={filmFrameRef} className={`ero-film-frame ${filmUnrolled ? "ero-unrolled" : ""}`}>
                                        <div
                                            className="ero-contact-photo"
                                            style={{
                                                backgroundImage: `url(${safeContactBg || CONTACT_PLACEHOLDER})`,
                                                opacity: safeContactBgOpacity,
                                            }}
                                        >
                                            {!safeContactBg && <SizeHint text={IDEAL_SIZES.contactBg} />}
                                        </div>
                                        <div className="ero-perf-strip" />
                                        <div className="ero-film-label-row">
                                            <span>ERO FILM 400 BW</span>
                                            <span className="ero-frame-no">24A</span>
                                        </div>
                                        <div className="ero-contact-card ero-glass">
                                            <span className="ero-idx eyebrow">05 Contact</span>
                                            <h2>{safeContactHeading}</h2>
                                            <p>{safeContactText}</p>
                                            <EroButton href={`mailto:${safeContactEmail}`} text={safeContactCtaText} glassy={buttonsGlassy} />
                                            <div className="ero-contact-links">
                                                <a href={`mailto:${safeContactEmail}`}>{safeContactEmail}</a>
                                                <a href={`tel:${safeContactPhone.replace(/\s+/g, "")}`}>{safeContactPhone}</a>
                                                {hasMapInfo && mapHref && (
                                                    <a
                                                        href={mapHref}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="ero-address-link"
                                                    >
                                                        <MapPinIcon />
                                                        <span>{mapLabel}</span>
                                                    </a>
                                                )}
                                            </div>
                                            {hasSocialLinks && (
                                                <div className="ero-social-links">
                                                    {safeInstagramLink && (
                                                        <a
                                                            className="ero-social-icon"
                                                            href={safeInstagramLink}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            aria-label="Instagram"
                                                        >
                                                            <InstagramIcon />
                                                        </a>
                                                    )}
                                                    {safeFacebookLink && (
                                                        <a
                                                            className="ero-social-icon"
                                                            href={safeFacebookLink}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            aria-label="Facebook"
                                                        >
                                                            <FacebookIcon />
                                                        </a>
                                                    )}
                                                </div>
                                            )}
                                            {showMapWidget && (
                                                <div className="ero-map-widget">
                                                    <iframe
                                                        src={mapEmbedSrc}
                                                        title="Map"
                                                        loading="lazy"
                                                        referrerPolicy="no-referrer-when-downgrade"
                                                        allowFullScreen
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        <div className="ero-film-label-row">
                                            <span>EXP. 2026</span>
                                            <span className="ero-frame-no">f2.8 1/250s</span>
                                        </div>
                                        <div className="ero-perf-strip" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                <footer className="ero-wrap ero-footer">
                    <span>\u00a9 2026 {safeBrandName}. All rights reserved.</span>
                    <span>Prague, CZ</span>
                </footer>
            </main>

            {/* --------- LIGHTBOX --------- */}
            <div
                className={`ero-lightbox-overlay ${lightbox.open ? "ero-open" : ""}`}
                onClick={(e) => {
                    if (e.target === e.currentTarget) closeLightbox()
                }}
            >
                {lightbox.image && <img className="ero-lightbox-img" src={lightbox.image} alt="" />}
                <span className="ero-lightbox-caption">{lightbox.caption}</span>
                <button className="ero-lightbox-close" onClick={closeLightbox} aria-label="Close">
                    <svg viewBox="0 0 24 24" fill="none">
                        <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth={1.8} />
                    </svg>
                </button>
            </div>

            {/* --------- COOKIE BAR --------- */}
            {cookieEnabled !== false && (
                <div
                    className={`ero-cookie ero-cookie-${cookieLayout === "card" ? "card" : "bar"} ${
                        cookieVisible ? "ero-cookie-in" : ""
                    }`}
                    style={cookieStyle}
                    role="dialog"
                    aria-label={t(cookieTitle, COOKIE_DEFAULTS.title)}
                    aria-hidden={!cookieVisible}
                >
                    <div className="ero-cookie-copy">
                        <strong>{t(cookieTitle, COOKIE_DEFAULTS.title)}</strong>
                        <p>
                            {t(cookieText, COOKIE_DEFAULTS.text)}
                            {cookiePolicyLink ? (
                                <>
                                    {" "}
                                    <a href={cookiePolicyLink} target="_blank" rel="noopener noreferrer">
                                        {t(cookiePolicyText, COOKIE_DEFAULTS.policyText)}
                                    </a>
                                </>
                            ) : null}
                        </p>
                    </div>
                    <div className="ero-cookie-actions">
                        <button
                            type="button"
                            className="ero-cookie-btn ero-cookie-ghost"
                            tabIndex={cookieVisible ? 0 : -1}
                            onClick={() => answerCookies("necessary")}
                        >
                            {t(cookieDeclineText, COOKIE_DEFAULTS.decline)}
                        </button>
                        <button
                            type="button"
                            className="ero-cookie-btn ero-cookie-solid"
                            tabIndex={cookieVisible ? 0 : -1}
                            onClick={() => answerCookies("accepted")}
                        >
                            {t(cookieAcceptText, COOKIE_DEFAULTS.accept)}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

// ============================================================
// Property Controls \u2014 grouped into collapsible sections
// ============================================================
addPropertyControls(EroPhotographySiteV3, {
    navbar: {
        type: ControlType.Object,
        title: "\u2460 Navbar",
        controls: {
            navFollowTheme: {
                type: ControlType.Boolean,
                title: "Bar Color",
                defaultValue: true,
                enabledTitle: "Follow Theme",
                disabledTitle: "Pick My Own",
            },
            navLogo: { type: ControlType.Image, title: "Logo" },
            brandName: { type: ControlType.String, title: "Brand Name", defaultValue: DEFAULTS.brandName },
            brandSub: { type: ControlType.String, title: "Brand Subtitle", defaultValue: DEFAULTS.brandSub },
            navLabel1: { type: ControlType.String, title: "Menu 1 Label", defaultValue: DEFAULTS.navLabel1 },
            navLink1: { type: ControlType.Link, title: "Menu 1 Link", defaultValue: DEFAULTS.navLink1 },
            navLabel2: { type: ControlType.String, title: "Menu 2 Label", defaultValue: DEFAULTS.navLabel2 },
            navLink2: { type: ControlType.Link, title: "Menu 2 Link", defaultValue: DEFAULTS.navLink2 },
            navLabel3: { type: ControlType.String, title: "Menu 3 Label", defaultValue: DEFAULTS.navLabel3 },
            navLink3: { type: ControlType.Link, title: "Menu 3 Link", defaultValue: DEFAULTS.navLink3 },
            navLabel4: { type: ControlType.String, title: "Menu 4 Label", defaultValue: DEFAULTS.navLabel4 },
            navLink4: { type: ControlType.Link, title: "Menu 4 Link", defaultValue: DEFAULTS.navLink4 },
            navContactText: { type: ControlType.String, title: "Button Text", defaultValue: DEFAULTS.navContactText },
            navContactLink: { type: ControlType.Link, title: "Button Link", defaultValue: DEFAULTS.navContactLink },
            navBarColor: {
                type: ControlType.Color,
                title: "Background Color",
                defaultValue: "rgba(8,8,7,1)",
                hidden: (p: NavbarGroup) => p.navFollowTheme !== false,
            },
            navBarOpacity: { type: ControlType.Number, title: "Background Opacity", min: 0, max: 1, step: 0.05, defaultValue: 0.75 },
            navAlwaysVisible: {
                type: ControlType.Boolean,
                title: "Background",
                defaultValue: false,
                enabledTitle: "Always On",
                disabledTitle: "On Scroll Only",
            },
        },
    },

    buttons: {
        type: ControlType.Object,
        title: "\u2461 Buttons (Global)",
        controls: {
            btnFollowTheme: {
                type: ControlType.Boolean,
                title: "Button Colors",
                defaultValue: true,
                enabledTitle: "Follow Theme",
                disabledTitle: "Pick My Own",
                description:
                    "Following the theme paints every button in the accent color from \u2462 Global Style.",
            },
            btnBgColor: {
                type: ControlType.Color,
                title: "Background",
                defaultValue: "#f2f0e9",
                hidden: (p: ButtonsGroup) => p.btnFollowTheme !== false,
            },
            btnTextColor: {
                type: ControlType.Color,
                title: "Text Color",
                defaultValue: "#000000",
                hidden: (p: ButtonsGroup) => p.btnFollowTheme !== false,
            },
            btnOpacity: { type: ControlType.Number, title: "Background Opacity", min: 0, max: 1, step: 0.05, defaultValue: 1 },
            btnBorderColor: {
                type: ControlType.Color,
                title: "Border Color",
                defaultValue: "rgba(242,240,233,0.15)",
                hidden: (p: ButtonsGroup) => p.btnFollowTheme !== false,
            },
            btnBorderRadius: { type: ControlType.Number, title: "Corner Radius", min: 0, max: 999, step: 1, defaultValue: 999 },
            btnStyle: {
                type: ControlType.Enum,
                title: "Style",
                options: ["solid", "glass"],
                optionTitles: ["Solid Fill", "Glass (Frosted Blur)"],
                defaultValue: "solid",
            },
        },
    },

    globalStyle: {
        type: ControlType.Object,
        title: "\u2462 Global Style",
        controls: {
            palettePreset: {
                type: ControlType.Enum,
                title: "Color Theme",
                options: ["original", "gallery", "sand", "midnight", "custom"],
                optionTitles: [
                    "Original \u2014 Noir",
                    "Gallery \u2014 Light",
                    "Sand \u2014 Warm",
                    "Midnight \u2014 Blue",
                    "My Own Colors",
                ],
                defaultValue: "original",
                description:
                    "One click repaints the whole site \u2014 background, text, navbar, buttons, borders and panels. My Own Colors reveals the four fields below. Framer stores control values on the placed component and gives the code no way to clear them, so a theme you leave brings your last colors back when you return to My Own Colors. To start over from nothing, delete this component from the canvas and drag a fresh one out of the Assets panel.",
            },
            accentColor: {
                type: ControlType.Color,
                title: "Accent Color",
                defaultValue: "#f2f0e9",
                hidden: (p: GlobalStyleGroup) => p.palettePreset !== "custom",
            },
            siteBgColor: {
                type: ControlType.Color,
                title: "Site Background",
                defaultValue: "#080807",
                hidden: (p: GlobalStyleGroup) => p.palettePreset !== "custom",
            },
            textColor: {
                type: ControlType.Color,
                title: "Text Color (Default)",
                defaultValue: "#f2f0e9",
                hidden: (p: GlobalStyleGroup) => p.palettePreset !== "custom",
            },
            textMutedColor: {
                type: ControlType.Color,
                title: "Secondary Text Color (Default)",
                defaultValue: "#98958c",
                hidden: (p: GlobalStyleGroup) => p.palettePreset !== "custom",
            },
            fontFamily: { type: ControlType.String, title: "Font Family (Default)", defaultValue: DEFAULT_FONT },
            colorPhotos: {
                type: ControlType.Boolean,
                title: "Photo Style",
                defaultValue: false,
                enabledTitle: "Color",
                disabledTitle: "Black & White",
            },
            cursorMode: {
                type: ControlType.Enum,
                title: "Cursor Style",
                options: ["viewfinder", "default", "custom"],
                optionTitles: ["Camera Viewfinder", "Default Browser Cursor", "Custom Image"],
                defaultValue: "viewfinder",
            },
            cursorViewfinderColor: {
                type: ControlType.Color,
                title: "Viewfinder Color",
                defaultValue: "rgba(242,240,233,0.85)",
                hidden: (p: GlobalStyleGroup) => p.cursorMode !== "viewfinder",
            },
            cursorImage: {
                type: ControlType.Image,
                title: "Custom Cursor Image",
                hidden: (p: GlobalStyleGroup) => p.cursorMode !== "custom",
            },
        },
    },

    hero: {
        type: ControlType.Object,
        title: "\u2463 Hero Section",
        controls: {
            heroEnabled1: { type: ControlType.Boolean, title: "Photo 1", defaultValue: true, enabledTitle: "Shown", disabledTitle: "Hidden" },
            heroPhoto1: { type: ControlType.Image, title: "Photo", hidden: (p: HeroGroup) => !p.heroEnabled1 },
            heroLabel1: { type: ControlType.String, title: "Label", defaultValue: "Portrait", hidden: (p: HeroGroup) => !p.heroEnabled1 },

            heroEnabled2: { type: ControlType.Boolean, title: "Photo 2", defaultValue: true, enabledTitle: "Shown", disabledTitle: "Hidden" },
            heroPhoto2: { type: ControlType.Image, title: "Photo", hidden: (p: HeroGroup) => !p.heroEnabled2 },
            heroLabel2: { type: ControlType.String, title: "Label", defaultValue: "Wedding", hidden: (p: HeroGroup) => !p.heroEnabled2 },

            heroEnabled3: { type: ControlType.Boolean, title: "Photo 3", defaultValue: true, enabledTitle: "Shown", disabledTitle: "Hidden" },
            heroPhoto3: { type: ControlType.Image, title: "Photo", hidden: (p: HeroGroup) => !p.heroEnabled3 },
            heroLabel3: { type: ControlType.String, title: "Label", defaultValue: "Landscape", hidden: (p: HeroGroup) => !p.heroEnabled3 },

            heroEnabled4: { type: ControlType.Boolean, title: "Photo 4", defaultValue: true, enabledTitle: "Shown", disabledTitle: "Hidden" },
            heroPhoto4: { type: ControlType.Image, title: "Photo", hidden: (p: HeroGroup) => !p.heroEnabled4 },
            heroLabel4: { type: ControlType.String, title: "Label", defaultValue: "Architecture", hidden: (p: HeroGroup) => !p.heroEnabled4 },

            heroEnabled5: { type: ControlType.Boolean, title: "Photo 5", defaultValue: false, enabledTitle: "Shown", disabledTitle: "Hidden" },
            heroPhoto5: { type: ControlType.Image, title: "Photo", hidden: (p: HeroGroup) => !p.heroEnabled5 },
            heroLabel5: { type: ControlType.String, title: "Label", defaultValue: "Photo 5", hidden: (p: HeroGroup) => !p.heroEnabled5 },

            heroEnabled6: { type: ControlType.Boolean, title: "Photo 6", defaultValue: false, enabledTitle: "Shown", disabledTitle: "Hidden" },
            heroPhoto6: { type: ControlType.Image, title: "Photo", hidden: (p: HeroGroup) => !p.heroEnabled6 },
            heroLabel6: { type: ControlType.String, title: "Label", defaultValue: "Photo 6", hidden: (p: HeroGroup) => !p.heroEnabled6 },

            heroEnabled7: { type: ControlType.Boolean, title: "Photo 7", defaultValue: false, enabledTitle: "Shown", disabledTitle: "Hidden" },
            heroPhoto7: { type: ControlType.Image, title: "Photo", hidden: (p: HeroGroup) => !p.heroEnabled7 },
            heroLabel7: { type: ControlType.String, title: "Label", defaultValue: "Photo 7", hidden: (p: HeroGroup) => !p.heroEnabled7 },

            heroEnabled8: { type: ControlType.Boolean, title: "Photo 8", defaultValue: false, enabledTitle: "Shown", disabledTitle: "Hidden" },
            heroPhoto8: { type: ControlType.Image, title: "Photo", hidden: (p: HeroGroup) => !p.heroEnabled8 },
            heroLabel8: { type: ControlType.String, title: "Label", defaultValue: "Photo 8", hidden: (p: HeroGroup) => !p.heroEnabled8 },

            heroTagText: { type: ControlType.String, title: "Tagline", defaultValue: DEFAULTS.heroTagText },
            heroCtaText: { type: ControlType.String, title: "CTA Text", defaultValue: DEFAULTS.heroCtaText },
            heroCtaLink: { type: ControlType.Link, title: "CTA Link", defaultValue: DEFAULTS.heroCtaLink },
            wordmark: { type: ControlType.String, title: "Wordmark", defaultValue: DEFAULTS.wordmark },
            heroTextColor: { type: ControlType.Color, title: "Text Color (Override)", defaultValue: "" },
            heroFontFamily: { type: ControlType.String, title: "Font Family (Override)", defaultValue: "" },
        },
    },

    marquee: {
        type: ControlType.Object,
        title: "\u2464 Marquee Strip",
        controls: {
            marqueeText: { type: ControlType.String, title: "Text", defaultValue: DEFAULTS.marqueeText },
            marqueeSpeed: { type: ControlType.Number, title: "Speed (sec)", min: 8, max: 120, step: 1, defaultValue: 46 },
            marqueeBgColor: { type: ControlType.Color, title: "Box Color (Override)", defaultValue: "" },
            marqueeTextColor: { type: ControlType.Color, title: "Text Color (Override)", defaultValue: "" },
            marqueeFontFamily: { type: ControlType.String, title: "Font Family (Override)", defaultValue: "" },
        },
    },

    gallery: {
        type: ControlType.Object,
        title: "\u2465 Selected Work (Gallery)",
        controls: {
            sectionVisibleWork: {
                type: ControlType.Boolean,
                title: "Section",
                defaultValue: true,
                enabledTitle: "Shown",
                disabledTitle: "Hidden",
            },
            galleryCornerRadius: { type: ControlType.Number, title: "Corner Radius", min: 0, max: 60, step: 1, defaultValue: 16 },

            galleryEnabled1: { type: ControlType.Boolean, title: "Photo 1", defaultValue: true, enabledTitle: "Shown", disabledTitle: "Hidden" },
            galleryPhoto1: { type: ControlType.Image, title: "Photo", hidden: (p: GalleryGroup) => !p.galleryEnabled1 },
            galleryCaption1: { type: ControlType.String, title: "Caption", defaultValue: "Photo 1", hidden: (p: GalleryGroup) => !p.galleryEnabled1 },

            galleryEnabled2: { type: ControlType.Boolean, title: "Photo 2", defaultValue: true, enabledTitle: "Shown", disabledTitle: "Hidden" },
            galleryPhoto2: { type: ControlType.Image, title: "Photo", hidden: (p: GalleryGroup) => !p.galleryEnabled2 },
            galleryCaption2: { type: ControlType.String, title: "Caption", defaultValue: "Photo 2", hidden: (p: GalleryGroup) => !p.galleryEnabled2 },

            galleryEnabled3: { type: ControlType.Boolean, title: "Photo 3", defaultValue: true, enabledTitle: "Shown", disabledTitle: "Hidden" },
            galleryPhoto3: { type: ControlType.Image, title: "Photo", hidden: (p: GalleryGroup) => !p.galleryEnabled3 },
            galleryCaption3: { type: ControlType.String, title: "Caption", defaultValue: "Photo 3", hidden: (p: GalleryGroup) => !p.galleryEnabled3 },

            galleryEnabled4: { type: ControlType.Boolean, title: "Photo 4", defaultValue: true, enabledTitle: "Shown", disabledTitle: "Hidden" },
            galleryPhoto4: { type: ControlType.Image, title: "Photo", hidden: (p: GalleryGroup) => !p.galleryEnabled4 },
            galleryCaption4: { type: ControlType.String, title: "Caption", defaultValue: "Photo 4", hidden: (p: GalleryGroup) => !p.galleryEnabled4 },

            galleryEnabled5: { type: ControlType.Boolean, title: "Photo 5", defaultValue: true, enabledTitle: "Shown", disabledTitle: "Hidden" },
            galleryPhoto5: { type: ControlType.Image, title: "Photo", hidden: (p: GalleryGroup) => !p.galleryEnabled5 },
            galleryCaption5: { type: ControlType.String, title: "Caption", defaultValue: "Photo 5", hidden: (p: GalleryGroup) => !p.galleryEnabled5 },

            galleryEnabled6: { type: ControlType.Boolean, title: "Photo 6", defaultValue: true, enabledTitle: "Shown", disabledTitle: "Hidden" },
            galleryPhoto6: { type: ControlType.Image, title: "Photo", hidden: (p: GalleryGroup) => !p.galleryEnabled6 },
            galleryCaption6: { type: ControlType.String, title: "Caption", defaultValue: "Photo 6", hidden: (p: GalleryGroup) => !p.galleryEnabled6 },

            galleryEnabled7: { type: ControlType.Boolean, title: "Photo 7", defaultValue: true, enabledTitle: "Shown", disabledTitle: "Hidden" },
            galleryPhoto7: { type: ControlType.Image, title: "Photo", hidden: (p: GalleryGroup) => !p.galleryEnabled7 },
            galleryCaption7: { type: ControlType.String, title: "Caption", defaultValue: "Photo 7", hidden: (p: GalleryGroup) => !p.galleryEnabled7 },

            galleryEnabled8: { type: ControlType.Boolean, title: "Photo 8", defaultValue: true, enabledTitle: "Shown", disabledTitle: "Hidden" },
            galleryPhoto8: { type: ControlType.Image, title: "Photo", hidden: (p: GalleryGroup) => !p.galleryEnabled8 },
            galleryCaption8: { type: ControlType.String, title: "Caption", defaultValue: "Photo 8", hidden: (p: GalleryGroup) => !p.galleryEnabled8 },

            galleryTextColor: { type: ControlType.Color, title: "Text Color (Override)", defaultValue: "" },
            galleryFontFamily: { type: ControlType.String, title: "Font Family (Override)", defaultValue: "" },
        },
    },

    pricing: {
        type: ControlType.Object,
        title: "\u2466 Services & Pricing",
        controls: {
            sectionVisibleServices: {
                type: ControlType.Boolean,
                title: "Section",
                defaultValue: true,
                enabledTitle: "Shown",
                disabledTitle: "Hidden",
            },
            pricingCornerRadius: { type: ControlType.Number, title: "Corner Radius", min: 0, max: 60, step: 1, defaultValue: 18 },
            priceCards: {
                type: ControlType.Array,
                title: "Cards",
                control: {
                    type: ControlType.Object,
                    controls: {
                        priceImage: { type: ControlType.Image, title: "Image" },
                        priceTitle: { type: ControlType.String, title: "Title" },
                        priceDescription: { type: ControlType.String, title: "Description" },
                        price: { type: ControlType.String, title: "Price" },
                        priceUnit: { type: ControlType.String, title: "Price Unit" },
                    },
                },
                defaultValue: [
                    {
                        priceImage: "",
                        priceTitle: "Portrait Photography",
                        priceDescription:
                            "Individual or couple shoots in-studio or outdoors. 1-2 hours, best-shot selection, retouching included.",
                        price: "from $120",
                        priceUnit: "per session",
                    },
                    {
                        priceImage: "",
                        priceTitle: "Wedding Photography",
                        priceDescription:
                            "Full-day coverage, prep, ceremony and reception. Complete edited gallery within 3 weeks.",
                        price: "from $850",
                        priceUnit: "per wedding",
                    },
                    {
                        priceImage: "",
                        priceTitle: "Commercial and Product",
                        priceDescription:
                            "Photography for web, social media or catalogs. Price depends on scope and number of products/locations.",
                        price: "on request",
                        priceUnit: "",
                    },
                ],
            },
            pricingTextColor: { type: ControlType.Color, title: "Text Color (Override)", defaultValue: "" },
            pricingFontFamily: { type: ControlType.String, title: "Font Family (Override)", defaultValue: "" },
        },
    },

    about: {
        type: ControlType.Object,
        title: "\u2467 About Section",
        controls: {
            sectionVisibleAbout: {
                type: ControlType.Boolean,
                title: "Section",
                defaultValue: true,
                enabledTitle: "Shown",
                disabledTitle: "Hidden",
            },
            aboutImage: { type: ControlType.Image, title: "Image" },
            aboutQuote: { type: ControlType.String, title: "Quote", defaultValue: DEFAULTS.aboutQuote },
            aboutText: { type: ControlType.String, title: "Text", defaultValue: DEFAULTS.aboutText },
            aboutTextColor: { type: ControlType.Color, title: "Text Color (Override)", defaultValue: "" },
            aboutFontFamily: { type: ControlType.String, title: "Font Family (Override)", defaultValue: "" },
        },
    },

    contact: {
        type: ControlType.Object,
        title: "\u2468 Contact Section",
        controls: {
            sectionVisibleContact: {
                type: ControlType.Boolean,
                title: "Section",
                defaultValue: true,
                enabledTitle: "Shown",
                disabledTitle: "Hidden",
            },
            contactHeading: { type: ControlType.String, title: "Heading", defaultValue: DEFAULTS.contactHeading },
            contactText: { type: ControlType.String, title: "Text", defaultValue: DEFAULTS.contactText },
            contactCtaText: { type: ControlType.String, title: "CTA Text", defaultValue: DEFAULTS.contactCtaText },
            contactEmail: { type: ControlType.String, title: "Email", defaultValue: DEFAULTS.contactEmail },
            contactPhone: { type: ControlType.String, title: "Phone", defaultValue: DEFAULTS.contactPhone },
            contactBg: { type: ControlType.Image, title: "Background Photo" },
            contactBgOpacity: { type: ControlType.Number, title: "Photo Opacity", min: 0, max: 1, step: 0.05, defaultValue: 1 },
            contactAddressText: { type: ControlType.String, title: "Address", defaultValue: "" },
            contactMapLink: { type: ControlType.Link, title: "Map Link (optional)" },
            contactMapWidgetEnabled: {
                type: ControlType.Boolean,
                title: "Map Widget",
                defaultValue: false,
                enabledTitle: "Shown",
                disabledTitle: "Hidden",
            },
            mapWidgetGrayscale: {
                type: ControlType.Number,
                title: "Map Grayscale",
                min: 0,
                max: 1,
                step: 0.05,
                defaultValue: 1,
                hidden: (p: ContactGroup) => !p.contactMapWidgetEnabled,
            },
            mapWidgetTintColor: {
                type: ControlType.Color,
                title: "Map Frame Color",
                defaultValue: "rgba(242,240,233,0.15)",
                hidden: (p: ContactGroup) => !p.contactMapWidgetEnabled,
            },
            socialInstagramLink: { type: ControlType.Link, title: "Instagram Link" },
            socialFacebookLink: { type: ControlType.Link, title: "Facebook Link" },
            contactBoxColor: { type: ControlType.Color, title: "Contact Box Color (Override)", defaultValue: "" },
            contactTextColor: { type: ControlType.Color, title: "Text Color (Override)", defaultValue: "" },
            contactFontFamily: { type: ControlType.String, title: "Font Family (Override)", defaultValue: "" },
        },
    },

    cookies: {
        type: ControlType.Object,
        title: "\u2469 Cookie Bar",
        controls: {
            cookieEnabled: {
                type: ControlType.Boolean,
                title: "Cookie Bar",
                defaultValue: true,
                enabledTitle: "Shown",
                disabledTitle: "Hidden",
                description:
                    "Shown to a visitor until they answer it; the answer is kept in their own browser. It stays on screen here on the canvas so you can style it.",
            },
            cookieLayout: {
                type: ControlType.Enum,
                title: "Layout",
                options: ["bar", "card"],
                optionTitles: ["Full-width Bar", "Corner Card"],
                defaultValue: "bar",
                displaySegmentedControl: true,
                hidden: (p: CookieGroup) => p.cookieEnabled === false,
            },
            cookieTitle: {
                type: ControlType.String,
                title: "Title",
                defaultValue: COOKIE_DEFAULTS.title,
                hidden: (p: CookieGroup) => p.cookieEnabled === false,
            },
            cookieText: {
                type: ControlType.String,
                title: "Text",
                displayTextArea: true,
                defaultValue: COOKIE_DEFAULTS.text,
                hidden: (p: CookieGroup) => p.cookieEnabled === false,
            },
            cookiePolicyText: {
                type: ControlType.String,
                title: "Policy Link Text",
                defaultValue: COOKIE_DEFAULTS.policyText,
                hidden: (p: CookieGroup) => p.cookieEnabled === false,
            },
            cookiePolicyLink: {
                type: ControlType.Link,
                title: "Policy Link",
                hidden: (p: CookieGroup) => p.cookieEnabled === false,
            },
            cookieAcceptText: {
                type: ControlType.String,
                title: "Accept Button",
                defaultValue: COOKIE_DEFAULTS.accept,
                hidden: (p: CookieGroup) => p.cookieEnabled === false,
            },
            cookieDeclineText: {
                type: ControlType.String,
                title: "Decline Button",
                defaultValue: COOKIE_DEFAULTS.decline,
                hidden: (p: CookieGroup) => p.cookieEnabled === false,
            },
            cookieBgColor: {
                type: ControlType.Color,
                title: "Background (Override)",
                defaultValue: "",
                hidden: (p: CookieGroup) => p.cookieEnabled === false,
            },
            cookieTextColor: {
                type: ControlType.Color,
                title: "Text Color (Override)",
                defaultValue: "",
                hidden: (p: CookieGroup) => p.cookieEnabled === false,
            },
        },
    },
})

// ============================================================
// CSS
//
// Every colour here reads a custom property set on .ero-root, so the whole
// page follows ③ Global Style → Color Theme. Two exceptions, on purpose:
// --ero-on-photo and the black photo scrims stay fixed, because captions that
// sit on a photograph have to stay legible whichever theme is picked.
// ============================================================
const CSS_TEXT = `
.ero-root * { box-sizing: border-box; }
.ero-root { -webkit-text-size-adjust: 100%; overflow-wrap: break-word; }
.ero-root a { color: inherit; text-decoration: none; }
.ero-root img { display: block; max-width: 100%; }
.ero-root .eyebrow, .ero-idx { font-size: 0.72rem; letter-spacing: 0.22em; text-transform: uppercase; color: var(--ero-text-muted); display: block; margin-bottom: 0.8rem; }
.ero-root h2 { font-weight: 500; margin: 0; letter-spacing: -0.01em; }
.ero-root section[id] { scroll-margin-top: 92px; }
.ero-root :focus-visible { outline: 2px solid var(--ero-accent); outline-offset: 3px; }

.ero-cursor-none, .ero-cursor-none * { cursor: none !important; }
.ero-hero-cta-wrap, .ero-hero-cta-wrap * { cursor: pointer !important; }

.ero-custom-cursor-active, .ero-custom-cursor-active * { cursor: none !important; }
.ero-custom-cursor-active .ero-hero-cta-wrap, .ero-custom-cursor-active .ero-hero-cta-wrap * { cursor: none !important; }
.ero-custom-cursor { position: fixed; z-index: 9999; width: 40px; height: 40px; object-fit: contain; pointer-events: none; transform: translate(-50%, -50%); transition: opacity 0.2s ease; will-change: transform; }

.ero-size-hint { position: absolute; z-index: 5; top: 50%; left: 50%; transform: translate(-50%, -50%); display: flex; flex-direction: column; align-items: center; gap: 0.25rem; padding: 0.6rem 1rem; border-radius: 10px; text-align: center; pointer-events: none; background: var(--ero-scrim-soft); border: 1px dashed var(--ero-glass-border); backdrop-filter: blur(4px); }
.ero-size-hint span { font-size: 0.6rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--ero-text-muted); }
.ero-size-hint strong { font-size: 0.82rem; font-weight: 600; color: var(--ero-text); }

.ero-glass {
  background: linear-gradient(155deg, var(--ero-glass-strong), var(--ero-glass-fill) 60%);
  backdrop-filter: blur(20px) saturate(140%);
  -webkit-backdrop-filter: blur(20px) saturate(140%);
  border: 1px solid var(--ero-glass-border);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -12px 24px rgba(0,0,0,0.25), 0 10px 30px rgba(0,0,0,0.35);
}

.ero-glass-btn {
  position: relative; display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
  padding: 0.9rem 1.7rem; min-height: 44px; font-size: 0.86rem; font-weight: 500;
  cursor: pointer; overflow: hidden; isolation: isolate;
  transition: transform 0.4s ${EASE}, box-shadow 0.4s ${EASE};
  background: transparent;
  border: 1px solid var(--ero-btn-border);
  border-radius: var(--ero-btn-radius, 999px);
}
a.ero-glass-btn { color: var(--ero-btn-text); }
.ero-btn-fill {
  position: absolute; inset: 0; z-index: 0; border-radius: inherit;
  background: var(--ero-btn-bg);
  opacity: var(--ero-btn-opacity, 1);
  pointer-events: none;
}
.ero-btn-fill.ero-btn-glassy {
  backdrop-filter: blur(20px) saturate(140%);
  -webkit-backdrop-filter: blur(20px) saturate(140%);
}
.ero-glass-btn::before {
  content: ""; position: absolute; inset: 0;
  background: linear-gradient(120deg, transparent 30%, rgba(0,0,0,0.18) 48%, transparent 66%);
  transform: translateX(-120%); transition: transform 0.7s ${EASE}; z-index: 1; pointer-events: none;
}
.ero-glass-btn:hover::before { transform: translateX(120%); }
.ero-glass-btn:hover { transform: translateY(-2px); box-shadow: 0 14px 34px rgba(0,0,0,0.4); }
.ero-glass-btn > span:not(.ero-btn-fill) { position: relative; z-index: 2; display: inline-block; }

/* The bar sits on the hero photographs until it takes on a background, so its
   text follows --ero-on-photo first and the theme text only once it is solid. */
.ero-nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100; display: flex;
  align-items: center; justify-content: space-between; gap: 1rem;
  padding: 1.3rem clamp(1.1rem, 5vw, 3rem);
  padding-top: max(1.3rem, env(safe-area-inset-top));
  border-bottom: 1px solid transparent;
  color: var(--ero-on-photo);
  transition: border-color 0.4s ease, color 0.4s ease;
  isolation: isolate;
}
.ero-nav-scrolled { border-bottom-color: var(--ero-glass-border); color: var(--ero-text); }
.ero-nav-bg {
  position: absolute; inset: 0; z-index: -1;
  backdrop-filter: blur(18px) saturate(140%);
  -webkit-backdrop-filter: blur(18px) saturate(140%);
  transition: opacity 0.4s ease, background 0.4s ease;
  pointer-events: none;
}
.ero-brand { display: flex; align-items: center; gap: 0.65rem; min-width: 0; }
.ero-aperture { width: 22px; height: 22px; transition: transform 0.6s ${EASE}; flex-shrink: 0; }
.ero-logo-img { height: 26px; width: auto; max-width: 140px; object-fit: contain; transition: transform 0.6s ${EASE}; flex-shrink: 0; }
.ero-brand:hover .ero-aperture, .ero-brand:hover .ero-logo-img { transform: rotate(8deg); }
.ero-brand-name { font-weight: 500; font-size: clamp(1.05rem, 2.6vw, 1.25rem); white-space: nowrap; }
.ero-brand-sub { font-size: 0.65rem; opacity: 0.72; letter-spacing: 0.1em; margin-left: 0.5rem; white-space: nowrap; }
.ero-nav-links { list-style: none; display: flex; align-items: center; gap: clamp(1.1rem, 2.4vw, 2.1rem); margin: 0; padding: 0; }
.ero-nav-links a:not(.ero-glass-btn) { font-size: 0.88rem; opacity: 0.78; position: relative; transition: opacity 0.3s ease; }
.ero-nav-links a:not(.ero-glass-btn)::after { content: ""; position: absolute; left: 0; bottom: -5px; width: 0; height: 1px; background: currentColor; transition: width 0.35s ${EASE}; }
.ero-nav-links a:not(.ero-glass-btn):hover { opacity: 1; }
.ero-nav-links a:not(.ero-glass-btn):hover::after { width: 100%; }

.ero-menu-toggle { display: none; width: 44px; height: 44px; flex: 0 0 auto; border-radius: 50%; border: 1px solid var(--ero-glass-border); background: var(--ero-glass-fill); align-items: center; justify-content: center; cursor: pointer; position: relative; color: inherit; }
.ero-menu-toggle span { display: block; width: 16px; height: 1px; background: currentColor; position: relative; transition: transform 0.3s ease; }
.ero-menu-toggle span::before, .ero-menu-toggle span::after { content: ""; position: absolute; left: 0; width: 16px; height: 1px; background: currentColor; transition: transform 0.3s ease, top 0.3s ease; }
.ero-menu-toggle span::before { top: -5px; }
.ero-menu-toggle span::after { top: 5px; }
.ero-menu-toggle span.ero-x { background: transparent; }
.ero-menu-toggle span.ero-x::before { top: 0; transform: rotate(45deg); }
.ero-menu-toggle span.ero-x::after { top: 0; transform: rotate(-45deg); }

/* 100svh keeps the hero off the phone's collapsing address bar; the 100vh line
   above it is the fallback for browsers that never learned the unit. */
.ero-hero { position: relative; height: 100vh; height: 100svh; min-height: min(560px, 100svh); width: 100%; overflow: hidden; background: var(--ero-bg); perspective: 1400px; color: var(--ero-on-photo); }
.ero-leporelo { position: absolute; inset: 0; display: flex; width: 100%; height: 100%; transform-style: preserve-3d; }
.ero-panel { position: relative; flex: 1 1 0; min-width: 0; overflow: hidden; transition: flex-grow 0.8s ${EASE}, transform 0.8s ${EASE}; transform-origin: center center; background: var(--ero-surface); }
.ero-panel img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; filter: grayscale(1) contrast(1.12) brightness(0.8); transform: scale(1.1); transition: filter 0.8s ${EASE}, transform 0.9s ${EASE}; }
.ero-panel img.ero-img-active { filter: grayscale(1) contrast(1.22) brightness(1.03); transform: scale(1.04); }
.ero-color-mode .ero-panel img { filter: contrast(1.08) brightness(0.92); }
.ero-color-mode .ero-panel img.ero-img-active { filter: contrast(1.14) brightness(1.02); }
.ero-panel::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.62) 100%); }
.ero-panel-meta { position: absolute; left: 1.1rem; bottom: 1.2rem; right: 1.1rem; z-index: 3; display: flex; align-items: baseline; gap: 0.6rem; font-size: 0.7rem; color: var(--ero-on-photo); opacity: 0; transform: translateY(8px); transition: opacity 0.5s ease, transform 0.5s ease; white-space: nowrap; overflow: hidden; }
.ero-panel-active .ero-panel-meta { opacity: 1; transform: translateY(0); }
.ero-num { opacity: 0.7; }

.ero-blend-wordmark { position: absolute; left: 50%; top: 50%; transform: translate(-50%,-50%); font-family: Georgia, "Times New Roman", serif; font-weight: 900; font-size: clamp(3.5rem, 21vw, 15rem); letter-spacing: -0.03em; color: #fff; mix-blend-mode: difference; z-index: 4; pointer-events: none; white-space: nowrap; user-select: none; max-width: 96%; }

.ero-hero-tag { position: absolute; left: clamp(1.1rem, 5vw, 3rem); bottom: 2.4rem; z-index: 5; display: flex; flex-direction: column; gap: 0.7rem; padding: 1.1rem 1.4rem; border-radius: 14px; max-width: min(340px, 60vw); color: var(--ero-on-photo); }
.ero-hero-tag p { margin: 0; font-size: clamp(0.92rem, 1.6vw, 1.05rem); }
.ero-hero-cta-wrap { position: absolute; right: clamp(1.1rem, 5vw, 3rem); bottom: 2.4rem; z-index: 6; }
.ero-swipe-hint { display: none; position: absolute; left: 50%; bottom: 1.1rem; transform: translateX(-50%); z-index: 5; font-size: 0.62rem; letter-spacing: 0.14em; color: var(--ero-on-photo); opacity: 0.75; align-items: center; gap: 0.4rem; }
.ero-swipe-hint svg { width: 13px; height: 13px; animation: eroSwipeMove 1.6s ease-in-out infinite; }
@keyframes eroSwipeMove { 0%, 100% { transform: translateX(0); opacity: 0.5; } 50% { transform: translateX(4px); opacity: 1; } }

.ero-viewfinder { position: fixed; width: 78px; height: 78px; z-index: 70; pointer-events: none; transform: translate(-50%,-50%); transition: opacity 0.25s ease; }
.ero-corner { position: absolute; width: 16px; height: 16px; }
.ero-tl { top: 0; left: 0; border-top: 1.5px solid var(--ero-cursor-color); border-left: 1.5px solid var(--ero-cursor-color); }
.ero-tr { top: 0; right: 0; border-top: 1.5px solid var(--ero-cursor-color); border-right: 1.5px solid var(--ero-cursor-color); }
.ero-bl { bottom: 0; left: 0; border-bottom: 1.5px solid var(--ero-cursor-color); border-left: 1.5px solid var(--ero-cursor-color); }
.ero-br { bottom: 0; right: 0; border-bottom: 1.5px solid var(--ero-cursor-color); border-right: 1.5px solid var(--ero-cursor-color); }
.ero-exif { position: absolute; top: calc(100% + 10px); left: 50%; transform: translateX(-50%); font-size: 0.62rem; letter-spacing: 0.06em; color: var(--ero-cursor-color); white-space: nowrap; }

.ero-marquee-strip { position: relative; z-index: 2; background: var(--ero-marquee-bg, var(--ero-bg)); border-top: 1px solid var(--ero-line); border-bottom: 1px solid var(--ero-line); padding: 1rem 0; overflow: hidden; white-space: nowrap; }
.ero-marquee-track { display: flex; width: max-content; font-size: clamp(0.72rem, 1.6vw, 0.85rem); letter-spacing: 0.16em; color: var(--ero-text-muted); animation-name: eroMarquee; animation-timing-function: linear; animation-iteration-count: infinite; }
.ero-marquee-track span { display: inline-block; white-space: nowrap; }
@keyframes eroMarquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }

.ero-main { position: relative; z-index: 2; background: var(--ero-bg); }
/* Section classes below share their element with .ero-wrap, so they set
   padding-top/-bottom only — a padding shorthand there would cancel the
   horizontal padding and print the text against the edge of a phone. */
.ero-wrap { width: 100%; max-width: 1220px; margin: 0 auto; padding: 0 clamp(1.1rem, 5vw, 3rem); }

.ero-section-head { display: flex; justify-content: space-between; align-items: flex-end; gap: 2rem; margin-bottom: clamp(2rem, 5vw, 3.4rem); padding-bottom: 1.6rem; border-bottom: 1px solid var(--ero-line); }
.ero-section-head h2 { font-size: clamp(2rem, 5.4vw, 4.4rem); line-height: 1; }
.ero-count { font-size: 0.8rem; color: var(--ero-text-muted); white-space: nowrap; }
.ero-gallery-section { padding-top: clamp(3.5rem, 9vw, 7rem); padding-bottom: clamp(3rem, 8vw, 6rem); }

.ero-gallery-carousel { position: relative; display: flex; align-items: center; gap: 1rem; }
.ero-gallery-viewport { overflow-x: auto; overflow-y: hidden; width: 100%; -webkit-mask-image: linear-gradient(90deg, transparent 0%, black 4%, black 96%, transparent 100%); mask-image: linear-gradient(90deg, transparent 0%, black 4%, black 96%, transparent 100%); padding: 2rem 0 2.4rem; scrollbar-width: none; scroll-snap-type: x mandatory; scroll-behavior: smooth; -webkit-overflow-scrolling: touch; }
.ero-gallery-viewport::-webkit-scrollbar { display: none; }
.ero-gallery-track { display: flex; gap: 1.1rem; width: max-content; }
.ero-gallery-item { position: relative; flex: 0 0 auto; width: clamp(190px, 23vw, 300px); height: clamp(240px, 29vw, 380px); scroll-snap-align: start; border-radius: var(--ero-gallery-radius, 16px); overflow: hidden; isolation: isolate; opacity: 0; transform: translateY(28px); transition: opacity 0.7s ${EASE}, transform 0.7s ${EASE}, box-shadow 0.5s ${EASE}; cursor: pointer; background: var(--ero-surface); color: var(--ero-on-photo); }
.ero-gallery-item.ero-in-view { opacity: 1; transform: translateY(0); }
.ero-gallery-item img { width: 100%; height: 100%; object-fit: cover; filter: grayscale(1) contrast(1.1) brightness(0.9); transform: scale(1.08); transition: transform 0.6s ${EASE}, filter 0.5s ease; user-select: none; pointer-events: none; }
.ero-color-mode .ero-gallery-item img { filter: contrast(1.05) brightness(0.95); }
.ero-gallery-item::before { content: ""; position: absolute; inset: 0; z-index: 1; background: linear-gradient(180deg, transparent 45%, rgba(0,0,0,0.72) 100%); opacity: 0.6; transition: opacity 0.4s ease; }
.ero-gallery-item.ero-hovered { box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
.ero-gallery-item.ero-hovered img { transform: scale(1.13); filter: grayscale(1) contrast(1.2) brightness(1.02); }
.ero-color-mode .ero-gallery-item.ero-hovered img { filter: contrast(1.12) brightness(1.05); }
.ero-gallery-item.ero-hovered::before { opacity: 0.4; }

.ero-gallery-frame-no { position: absolute; top: 0.85rem; left: 0.95rem; z-index: 2; font-family: "IBM Plex Mono", monospace; font-size: 0.62rem; letter-spacing: 0.08em; color: var(--ero-on-photo); opacity: 0; transform: translateY(-6px); transition: opacity 0.35s ease, transform 0.35s ease; }
.ero-gallery-item.ero-hovered .ero-gallery-frame-no { opacity: 1; transform: translateY(0); }
.ero-gallery-caption { position: absolute; left: 0.95rem; bottom: 0.95rem; right: 0.95rem; z-index: 2; font-size: 0.72rem; color: var(--ero-on-photo); opacity: 0; transform: translateY(10px); transition: opacity 0.35s ease, transform 0.35s ease; }
.ero-gallery-item.ero-hovered .ero-gallery-caption { opacity: 1; transform: translateY(0); }

.ero-gallery-nav { flex: 0 0 auto; width: 52px; height: 52px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: var(--ero-glass-strong); border: 1px solid var(--ero-glass-border); color: var(--ero-text); cursor: pointer; backdrop-filter: blur(10px) saturate(140%); transition: transform 0.3s ${EASE}, background 0.3s ease; }
.ero-gallery-nav svg { width: 20px; height: 20px; }
.ero-gallery-nav:hover { background: var(--ero-glass-fill); transform: scale(1.07); }

.ero-lightbox-overlay { position: fixed; inset: 0; z-index: 200; background: rgba(0,0,0,0.88); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; opacity: 0; visibility: hidden; pointer-events: none; transition: opacity 0.35s ${EASE}, visibility 0.35s ${EASE}; }
.ero-lightbox-overlay.ero-open { opacity: 1; visibility: visible; pointer-events: auto; }
.ero-lightbox-img { max-width: min(92vw, 720px); max-height: 78svh; width: auto; height: auto; border-radius: 16px; object-fit: contain; filter: grayscale(1) contrast(1.15) brightness(1.02); box-shadow: 0 50px 100px rgba(0,0,0,0.6); transform: scale(0.92); transition: transform 0.35s ${EASE}; }
.ero-color-mode .ero-lightbox-img { filter: contrast(1.08) brightness(1); }
.ero-lightbox-overlay.ero-open .ero-lightbox-img { transform: scale(1); }
.ero-lightbox-caption { position: absolute; left: 50%; bottom: 6svh; transform: translateX(-50%); font-size: 0.78rem; color: var(--ero-on-photo); text-align: center; max-width: 80vw; }
.ero-lightbox-close { position: absolute; top: max(1.6rem, env(safe-area-inset-top)); right: clamp(1.1rem, 4vw, 2.4rem); width: 44px; height: 44px; border-radius: 50%; background: rgba(255,255,255,0.14); border: 1px solid rgba(255,255,255,0.25); display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--ero-on-photo); }
.ero-lightbox-close svg { width: 18px; height: 18px; }

.ero-pricing-section { padding-top: clamp(3.5rem, 9vw, 7rem); padding-bottom: clamp(3.5rem, 9vw, 7rem); border-top: 1px solid var(--ero-line); }
.ero-pricing-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr)); gap: clamp(1rem, 3vw, 1.6rem); margin-top: 3rem; }
.ero-price-card { display: flex; flex-direction: column; transition: transform 0.4s ${EASE}; }
.ero-price-card:hover { transform: translateY(-6px); }
.ero-price-media { position: relative; aspect-ratio: 4/3; overflow: hidden; border-radius: var(--ero-pricing-radius, 18px); border: 1px solid var(--ero-glass-border); box-shadow: 0 18px 34px rgba(0,0,0,0.35); background: var(--ero-surface); }
.ero-price-media img { width: 100%; height: 100%; object-fit: cover; filter: grayscale(1) contrast(1.1) brightness(0.95); transform: scale(1.04); transition: transform 0.6s ${EASE}, filter 0.4s ease; }
.ero-color-mode .ero-price-media img { filter: contrast(1.05) brightness(1); }
.ero-price-card:hover .ero-price-media img { transform: scale(1.1); filter: grayscale(1) contrast(1.16) brightness(1); }
.ero-color-mode .ero-price-card:hover .ero-price-media img { filter: contrast(1.1) brightness(1.05); }
.ero-price-body { display: flex; flex-direction: column; gap: 0.7rem; padding: 1.6rem 0.2rem 0; flex: 1; }
.ero-p-num { font-size: 0.68rem; color: var(--ero-text-muted); letter-spacing: 0.14em; }
.ero-price-card h3 { font-size: clamp(1.15rem, 2.4vw, 1.35rem); margin-top: 0.1rem; }
.ero-price-card p { color: var(--ero-text-muted); font-size: 0.9rem; line-height: 1.5; flex: 1; margin: 0; }
.ero-p-price { font-weight: 600; font-size: clamp(1.5rem, 3.4vw, 1.8rem); color: var(--ero-text); margin-top: 0.2rem; }
.ero-p-price span { font-weight: normal; font-size: 0.7rem; color: var(--ero-text-muted); margin-left: 0.4rem; }

.ero-about-section { padding-top: clamp(3.5rem, 8vw, 6rem); padding-bottom: clamp(3.5rem, 8vw, 6rem); border-top: 1px solid var(--ero-line); }
.ero-about-grid { display: grid; grid-template-columns: 0.8fr 1.2fr; gap: clamp(2rem, 5vw, 4.5rem); align-items: center; }
.ero-about-image { position: relative; border-radius: 6px; overflow: hidden; aspect-ratio: 4/5; background: var(--ero-surface); }
.ero-about-image img { position: absolute; top: -18%; left: 0; width: 100%; height: 136%; object-fit: cover; filter: grayscale(1) contrast(1.1) brightness(0.95); will-change: transform; transition: transform 0.05s linear; }
.ero-color-mode .ero-about-image img { filter: contrast(1.04) brightness(1); }
.ero-about-quote { font-weight: 400; font-size: clamp(1.5rem, 3vw, 2.7rem); line-height: 1.15; margin: 0.6rem 0 1.6rem; max-width: 560px; color: var(--ero-text); }
.ero-about-text p:not(.ero-about-quote) { color: var(--ero-text-muted); line-height: 1.75; font-size: clamp(0.95rem, 1.6vw, 1.02rem); max-width: 520px; }

.ero-contact-section { position: relative; padding: clamp(3.5rem, 9vw, 7rem) 0 clamp(4rem, 10vw, 8rem); overflow: hidden; }
.ero-film-stage { position: relative; }
.ero-film-wrap { position: relative; border-radius: clamp(16px, 3vw, 28px); overflow: hidden; }
.ero-film-frame { position: relative; overflow: hidden; background: linear-gradient(155deg, var(--ero-glass-strong), var(--ero-glass-fill) 60%); backdrop-filter: blur(5px) saturate(150%); border: 1px solid var(--ero-glass-border); border-radius: clamp(16px, 3vw, 28px); box-shadow: inset 0 1px 0 rgba(255,255,255,0.14), 0 30px 70px rgba(0,0,0,0.5); clip-path: inset(0 0 0 100%); transition: clip-path 1.2s ${EASE}; }
.ero-film-frame.ero-unrolled { clip-path: inset(0 0 0 0); }
.ero-contact-photo { position: absolute; inset: -24px; background-size: cover; background-position: center 55%; filter: blur(18px) grayscale(1) contrast(1.05) brightness(0.7); z-index: 0; }
.ero-color-mode .ero-contact-photo { filter: blur(18px) contrast(1) brightness(0.75); }
.ero-film-label-row { position: relative; z-index: 1; display: flex; align-items: center; justify-content: space-between; gap: 0.8rem; padding: 0.7rem clamp(0.9rem, 3vw, 1.6rem); font-size: 0.62rem; letter-spacing: 0.16em; color: var(--ero-text-muted); text-transform: uppercase; }
.ero-frame-no { color: var(--ero-text-muted); white-space: nowrap; }
.ero-perf-strip { position: relative; z-index: 1; height: 22px; background-image: radial-gradient(circle, var(--ero-bg) 0 5px, transparent 5.5px); background-size: 28px 22px; background-repeat: repeat-x; background-position: 14px center; }
.ero-contact-card { position: relative; z-index: 1; padding: clamp(2.2rem, 6vw, 5.5rem) clamp(1.2rem, 6vw, 5rem); text-align: center; display: flex; flex-direction: column; align-items: center; border-top: none; border-bottom: none; box-shadow: none; background: var(--ero-contact-box, linear-gradient(155deg, var(--ero-glass-strong), var(--ero-glass-fill) 60%)); }
.ero-contact-card h2 { font-size: clamp(1.9rem, 5vw, 3.8rem); max-width: 680px; line-height: 1.06; margin-top: 0.8rem; color: var(--ero-text); }
.ero-contact-card p { color: var(--ero-text-muted); margin: 1.3rem 0 2.2rem; font-size: clamp(0.95rem, 1.8vw, 1rem); }
.ero-contact-links { display: flex; gap: 0.4rem; flex-wrap: wrap; justify-content: center; margin-top: 1.8rem; max-width: 100%; background: var(--ero-scrim-soft); border: 1px solid var(--ero-glass-border); border-radius: 14px; padding: 0.9rem 1.2rem; backdrop-filter: blur(6px); }
.ero-contact-links a { font-size: 0.8rem; color: var(--ero-text-muted); border-bottom: 1px solid transparent; transition: color 0.3s ease, border-color 0.3s ease; padding: 0.4rem 0.6rem; }
.ero-contact-links a:hover { color: var(--ero-text); border-color: var(--ero-text); }
.ero-address-link { display: inline-flex; align-items: center; gap: 0.35rem; }
.ero-address-link svg { width: 14px; height: 14px; flex-shrink: 0; }

.ero-social-links { display: flex; gap: 0.7rem; justify-content: center; margin-top: 1.4rem; }
.ero-social-icon { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: var(--ero-glass-strong); border: 1px solid var(--ero-glass-border); color: var(--ero-text); transition: transform 0.3s ${EASE}, background 0.3s ease; }
.ero-social-icon svg { width: 18px; height: 18px; }
.ero-social-icon:hover { background: var(--ero-glass-fill); transform: translateY(-2px); }

.ero-map-widget { width: 100%; max-width: 560px; margin-top: 1.8rem; border-radius: 18px; overflow: hidden; border: 2px solid var(--ero-map-tint); box-shadow: 0 18px 34px rgba(0,0,0,0.35), inset 0 0 0 1px var(--ero-map-tint); background: var(--ero-surface); filter: grayscale(var(--ero-map-grayscale, 1)) contrast(1.05); }
.ero-map-widget iframe { display: block; width: 100%; height: clamp(200px, 30vw, 280px); border: 0; }

.ero-footer { padding-top: 2.4rem; padding-bottom: 3rem; display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap; font-size: 0.72rem; color: var(--ero-text-muted); border-top: 1px solid var(--ero-line); }

/* --------- COOKIE BAR --------- */
.ero-cookie {
  position: fixed; z-index: 190;
  left: clamp(0.7rem, 3vw, 2rem); right: clamp(0.7rem, 3vw, 2rem);
  bottom: max(clamp(0.7rem, 3vw, 2rem), env(safe-area-inset-bottom));
  display: flex; align-items: center; gap: clamp(0.9rem, 2.5vw, 2rem);
  padding: clamp(0.9rem, 2vw, 1.3rem) clamp(1rem, 2.4vw, 1.6rem);
  border-radius: 16px;
  background: var(--ero-cookie-bg, var(--ero-scrim));
  color: var(--ero-cookie-text, var(--ero-text));
  border: 1px solid var(--ero-glass-border);
  box-shadow: 0 24px 60px rgba(0,0,0,0.45);
  backdrop-filter: blur(18px) saturate(140%);
  -webkit-backdrop-filter: blur(18px) saturate(140%);
  opacity: 0; visibility: hidden; pointer-events: none;
  transform: translateY(18px);
  transition: opacity 0.45s ${EASE}, transform 0.45s ${EASE}, visibility 0.45s ${EASE};
}
.ero-cookie.ero-cookie-in { opacity: 1; visibility: visible; pointer-events: auto; transform: translateY(0); }
.ero-cookie-card { left: auto; right: auto; margin-left: clamp(0.7rem, 3vw, 2rem); max-width: 420px; flex-direction: column; align-items: flex-start; }
.ero-cookie-copy { flex: 1; min-width: 0; }
.ero-cookie-copy strong { display: block; font-size: 0.82rem; letter-spacing: 0.14em; text-transform: uppercase; margin-bottom: 0.4rem; }
.ero-cookie-copy p { margin: 0; font-size: 0.84rem; line-height: 1.55; color: inherit; opacity: 0.86; }
.ero-cookie-copy a { text-decoration: underline; text-underline-offset: 3px; }
.ero-cookie-actions { display: flex; align-items: center; gap: 0.6rem; flex: 0 0 auto; }
.ero-cookie-btn { min-height: 44px; padding: 0.7rem 1.3rem; font: inherit; font-size: 0.82rem; font-weight: 500; border-radius: var(--ero-btn-radius, 999px); cursor: pointer; white-space: nowrap; transition: transform 0.3s ${EASE}, background 0.3s ease, opacity 0.3s ease; }
.ero-cookie-btn:hover { transform: translateY(-2px); }
.ero-cookie-ghost { background: transparent; border: 1px solid var(--ero-glass-border); color: inherit; }
.ero-cookie-ghost:hover { background: var(--ero-glass-fill); }
.ero-cookie-solid { background: var(--ero-btn-bg); color: var(--ero-btn-text); border: 1px solid var(--ero-btn-border); }

/* --------- RESPONSIVE --------- */
/* Laptop */
@media (max-width: 1100px) {
  .ero-about-grid { gap: 2.6rem; }
}

/* Tablet — the hero fan needs a pointer, so it becomes a swipeable row here,
   in step with the isCompact query the component runs in JS. */
@media (max-width: 900px) {
  .ero-about-grid { grid-template-columns: 1fr; }
  .ero-about-image { max-width: 340px; }
  .ero-leporelo { flex-direction: row; overflow-x: auto; overflow-y: hidden; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; }
  .ero-panel { flex: 0 0 88%; transform: none !important; scroll-snap-align: center; }
  .ero-panel img { filter: grayscale(1) contrast(1.15) brightness(0.95); transform: scale(1); }
  .ero-color-mode .ero-panel img { filter: contrast(1.12) brightness(0.98); }
  .ero-panel-meta { opacity: 1; transform: translateY(0); }
  .ero-swipe-hint { display: flex; }
  .ero-viewfinder { display: none; }
}

/* Tablet portrait and below — the bar becomes a full-screen menu */
@media (max-width: 820px) {
  .ero-nav-links { position: fixed; inset: 0; flex-direction: column; justify-content: center; background: var(--ero-scrim); color: var(--ero-text); backdrop-filter: blur(30px); opacity: 0; visibility: hidden; transition: opacity 0.4s ease, visibility 0.4s ease; gap: 2.2rem; z-index: 99; padding: 2rem; }
  .ero-nav-links.ero-open { opacity: 1; visibility: visible; }
  .ero-nav-links a:not(.ero-glass-btn) { font-size: clamp(1.4rem, 6vw, 1.8rem); opacity: 1; }
  .ero-menu-toggle { display: flex; }
}

/* Phone */
@media (max-width: 700px) {
  .ero-section-head { flex-direction: column; align-items: flex-start; gap: 0.6rem; }
  .ero-hero-tag { right: clamp(1.1rem, 4vw, 2rem); left: clamp(1.1rem, 4vw, 2rem); bottom: 6.4rem; max-width: none; padding: 0.9rem 1.1rem; }
  .ero-hero-cta-wrap { left: clamp(1.1rem, 4vw, 2rem); right: clamp(1.1rem, 4vw, 2rem); bottom: 1.6rem; display: flex; }
  .ero-hero-cta-wrap .ero-glass-btn { width: 100%; }
  .ero-swipe-hint { bottom: 0.4rem; }
  .ero-price-body { padding-top: 1.1rem; }
  .ero-contact-links { width: 100%; }
  .ero-footer { flex-direction: column; align-items: flex-start; gap: 0.5rem; }
  .ero-cookie { flex-direction: column; align-items: stretch; text-align: left; }
  .ero-cookie-card { max-width: none; margin-left: 0; left: clamp(0.7rem, 3vw, 2rem); right: clamp(0.7rem, 3vw, 2rem); }
  .ero-cookie-actions { width: 100%; }
  .ero-cookie-btn { flex: 1; }
}

/* Small phone */
@media (max-width: 480px) {
  .ero-gallery-nav { display: none; }
  .ero-brand-sub { display: none; }
  .ero-gallery-carousel { gap: 0; }
}

/* Phone held sideways: a 100svh hero would leave no room for anything else */
@media (max-height: 560px) and (orientation: landscape) {
  .ero-hero { min-height: 0; }
  .ero-hero-tag { display: none; }
  .ero-blend-wordmark { font-size: clamp(2.5rem, 16vh, 6rem); }
  .ero-hero-cta-wrap { bottom: 1rem; }
}

/* Touch: hover is the only way these captions ever appear, so on a phone
   they simply stay on. */
@media (hover: none) {
  .ero-gallery-caption, .ero-gallery-frame-no { opacity: 1; transform: none; }
  .ero-gallery-item::before { opacity: 0.75; }
  .ero-glass-btn:hover, .ero-price-card:hover, .ero-cookie-btn:hover, .ero-social-icon:hover { transform: none; }
}

/* Very wide screens */
@media (min-width: 1700px) {
  .ero-wrap { max-width: 1440px; }
}

@media (prefers-reduced-motion: reduce) {
  .ero-root * { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }
  .ero-film-frame { clip-path: none !important; }
  .ero-gallery-item { opacity: 1 !important; transform: none !important; }
  .ero-cookie { transition: none; }
}
`
