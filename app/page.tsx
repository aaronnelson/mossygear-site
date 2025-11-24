import Image from "next/image";
import Link from "next/link";
import { sanityClient } from "@/lib/sanityClient";
import { urlForImage } from "@/lib/sanityImage";

export const dynamic = "force-dynamic";

type Product = {
  _id: string;
  name: string; // aliased from title in the query
  slug: string;
  shortDescription?: string;
  etsyUrl?: string;
  price?: number;
  status?: string; // editorial: active / draft / archived
  availabilityStatus?: string; // inStock / madeToOrder / soldOut
  tags?: string[];
  image?: any;
  kind?: string;
};

type SiteSettings = {
  heroEyebrow?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  primaryCtaLabel?: string;
  primaryCtaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
};

export default async function HomePage() {
  const [siteSettings, products] = await Promise.all([
    sanityClient.fetch<SiteSettings | null>(
      `*[_type == "siteSettings"][0]{
        heroEyebrow,
        heroTitle,
        heroSubtitle,
        primaryCtaLabel,
        primaryCtaHref,
        secondaryCtaLabel,
        secondaryCtaHref
      }`
    ),
    sanityClient.fetch<Product[]>(
      `*[_type == "product" && status == "active" && kind == "kit"] 
       | order(_createdAt desc)[0...12] {
        _id,
        "name": coalesce(title, name),
        "slug": slug.current,
        kind,
        shortDescription,
        etsyUrl,
        price,
        status,
        "availabilityStatus": availabilityStatus,
        "tags": coalesce(metadata.tags, tags),
        "image": images[0]
      }`
    ),
  ]);

  const heroEyebrow =
    siteSettings?.heroEyebrow ?? "Modular moss poles for climbing plants";

  const heroTitle =
    siteSettings?.heroTitle ?? "Snap-together moss poles for big, messy plants.";

  const heroSubtitle =
    siteSettings?.heroSubtitle ??
    "A modular support system for the plants that keep outgrowing every pole you give them.";

  const primaryCtaLabel =
    siteSettings?.primaryCtaLabel ?? "Shop starter kits";
  const primaryCtaHref =
    siteSettings?.primaryCtaHref ?? "/products/modular-moss-poles";

  const secondaryCtaLabel =
    siteSettings?.secondaryCtaLabel ?? "See how it works";
  const secondaryCtaHref =
    siteSettings?.secondaryCtaHref ?? "#see-the-system";

  const prices = products
    .map((p) => p.price)
    .filter((p): p is number => typeof p === "number");

  const minPrice = prices.length > 0 ? Math.min(...prices) : null;

  const featuredKit = products[0] ?? null;
  const remainingKits = featuredKit ? products.slice(1) : products;

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* SECTION 1 – HERO (text + big image card) */}
      <section className="px-4 py-16 md:py-24">
        <div className="max-w-6xl mx-auto grid gap-10 md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] items-center">
          {/* Left: copy */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-background/80 border border-foreground/15 px-3 py-1 shadow-sm">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
              <span className="text-[0.7rem] uppercase tracking-[0.2em] text-foreground/70">
                Mossygear · Modular moss poles
              </span>
            </div>

            <div className="space-y-3">
              {heroEyebrow && (
                <p className="text-[0.7rem] uppercase tracking-[0.2em] text-foreground/60">
                  {heroEyebrow}
                </p>
              )}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight">
                {heroTitle}
              </h1>
              <p className="text-sm md:text-base text-foreground/80 max-w-md">
                {heroSubtitle}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={primaryCtaHref}
                className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-background shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md"
              >
                {primaryCtaLabel}
              </Link>

              <a
                href={secondaryCtaHref}
                className="inline-flex items-center gap-2 rounded-full bg-background/80 border border-foreground/30 px-5 py-2.5 text-sm font-medium text-foreground transition hover:border-foreground/70"
              >
                {secondaryCtaLabel}
              </a>

              {minPrice != null && (
                <div className="inline-flex items-center gap-2 rounded-full bg-background/80 border border-foreground/20 px-3 py-1 text-[0.75rem] text-foreground/80">
                  <span className="h-1 w-1 rounded-full bg-foreground/60" />
                  <span>Kits from ${minPrice.toFixed(0)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: big hero image card */}
          <div className="w-full">
            <div className="relative w-full aspect-[4/3] rounded-[2rem] overflow-hidden bg-background/60 border border-foreground/15 shadow-xl">
              <Image
                src="/images/mossy-1.png"
                alt="Modular moss pole with a climbing plant"
                width={1200}
                height={900}
                className="w-full h-full object-cover"
                priority
              />
              <div className="absolute bottom-3 left-3 rounded-full bg-background/85 border border-foreground/20 px-3 py-1 text-[0.7rem] text-foreground/80">
                3D-printed shells · Stackable segments
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 – SEE THE SYSTEM (stake → moss segments → topper) */}
      <section
        id="see-the-system"
        className="bg-background px-4 py-12 border-t border-foreground/10"
      >
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <p className="text-[0.7rem] uppercase tracking-[0.2em] text-foreground/60">
              See the system
            </p>
            <h2 className="text-xl md:text-2xl font-semibold">
              A pole built from stake, segments, and water topper
            </h2>
            <p className="text-sm text-foreground/75 max-w-xl mx-auto">
              Each Mossygear pole starts with a stake in the soil, stacks
              moss-filled segments above the pot, and finishes with a water
              topper that helps keep the moss hydrated at the top.
            </p>
          </div>

          {/* Explainer graphic */}
          <div className="max-w-4xl mx-auto grid gap-8 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] items-center">
            {/* Left: vertical pole diagram */}
            <div className="flex justify-center">
              <div className="relative w-full max-w-sm rounded-[2rem] border border-foreground/15 bg-gradient-to-b from-background/80 via-background to-background/90 shadow-lg px-6 py-8 flex flex-col items-center gap-6">
                <div className="w-full max-w-[220px] flex flex-col items-stretch gap-3">
                  {/* Topper */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-24 h-8 rounded-2xl bg-accent/25 border border-accent/70 flex items-center justify-center text-[0.75rem] font-medium text-foreground">
                      Water topper
                    </div>
                    <p className="text-[0.7rem] text-foreground/70 text-center max-w-[180px]">
                      Holds moisture at the top so moss stays hydrated where new
                      roots form.
                    </p>
                  </div>

                  {/* Moss-filled segments */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-28 h-24 rounded-2xl border border-foreground/25 bg-[linear-gradient(135deg,rgba(34,197,94,0.25),rgba(101,163,13,0.25))] relative overflow-hidden">
                      <div className="absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_0_0,rgba(255,255,255,0.25),transparent_40%),radial-gradient(circle_at_100%_100%,rgba(0,0,0,0.15),transparent_45%)]" />
                    </div>
                    <p className="text-[0.7rem] uppercase tracking-[0.16em] text-foreground/70">
                      Moss segments
                    </p>
                    <p className="text-[0.7rem] text-foreground/70 text-center max-w-[220px]">
                      Stackable shells packed with moss or substrate, giving
                      aerial roots something to grab and grow into.
                    </p>
                  </div>

                  {/* Stake + soil */}
                  <div className="flex flex-col items-center gap-2 w-full">
                    <div className="w-full max-w-[220px] h-16 rounded-2xl border border-foreground/25 overflow-hidden flex flex-col">
                      {/* Soil layer */}
                      <div className="flex-1 bg-[radial-gradient(circle_at_0_0,rgba(255,255,255,0.15),transparent_40%),linear-gradient(to_top,#1f2933,#111827)]" />
                      {/* Stake in soil */}
                      <div className="relative h-8 bg-gradient-to-t from-foreground/40 to-foreground/20 flex items-center justify-center">
                        <div className="w-2/5 h-6 rounded-full bg-background/70 border border-foreground/40" />
                      </div>
                    </div>
                    <p className="text-[0.7rem] uppercase tracking-[0.16em] text-foreground/70">
                      Stake in soil
                    </p>
                    <p className="text-[0.7rem] text-foreground/70 text-center max-w-[220px]">
                      The core stake anchors in the pot. The rest of the system
                      builds upward from this point.
                    </p>
                  </div>
                </div>

                <p className="text-[0.75rem] text-foreground/70 text-center max-w-xs">
                  Think of it as one continuous pole: stake in the pot,
                  moss-filled segments in the middle, and a water topper keeping
                  the top layer from drying out.
                </p>
              </div>
            </div>

            {/* Right: three-step text aligned with stake → segments → topper */}
            <div className="space-y-4 text-sm">
              <div className="flex gap-3">
                <div className="mt-1 h-6 w-6 rounded-full bg-accent/15 flex items-center justify-center text-[0.7rem] font-semibold text-accent">
                  01
                </div>
                <div>
                  <h3 className="text-sm font-semibold">
                    Press the stake into the pot
                  </h3>
                  <p className="text-foreground/75">
                    Start by anchoring the core stake deep into the soil of your
                    existing pot so the whole pole feels solid and doesn&apos;t
                    twist.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="mt-1 h-6 w-6 rounded-full bg-accent/15 flex items-center justify-center text-[0.7rem] font-semibold text-accent">
                  02
                </div>
                <div>
                  <h3 className="text-sm font-semibold">
                    Stack and fill moss segments
                  </h3>
                  <p className="text-foreground/75">
                    Slide on 3D-printed segments, pack them with moss or
                    substrate, and stack them as your plant climbs to give
                    aerial roots a damp, grippy surface.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="mt-1 h-6 w-6 rounded-full bg-accent/15 flex items-center justify-center text-[0.7rem] font-semibold text-accent">
                  03
                </div>
                <div>
                  <h3 className="text-sm font-semibold">
                    Top off with a water topper
                  </h3>
                  <p className="text-foreground/75">
                    Finish with a topper that helps keep the upper moss hydrated
                    so it doesn&apos;t dry out where new growth is trying to
                    root.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/products/segments"
                  className="inline-flex items-center text-xs font-medium text-accent hover:text-accent/80"
                >
                  Explore segments &amp; components →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 – START WITH A KIT (big featured card) */}
      <section className="bg-background px-4 py-12 border-t border-foreground/10">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg md:text-xl font-semibold">
                Start with a kit
              </h2>
              <p className="text-sm text-foreground/75">
                Pick a starter kit that matches your plant and pot. Extend it
                later with extra segments.
              </p>
            </div>
            <Link
              href="/products/modular-moss-poles"
              className="text-xs font-medium text-accent hover:text-accent/80"
            >
              View all kits →
            </Link>
          </div>

          {/* Featured kit */}
          {featuredKit ? (
            <Link
              href={`/products/${featuredKit.slug}`}
              className="grid gap-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] rounded-3xl bg-background/80 border border-foreground/15 p-5 md:p-7 hover:-translate-y-1 hover:shadow-xl transition"
            >
              <div className="w-full">
                <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden">
                  <Image
                    src={
                      featuredKit.image
                        ? urlForImage(featuredKit.image)
                            .width(900)
                            .height(675)
                            .url()
                        : "/images/mossy-1.png"
                    }
                    alt={featuredKit.name}
                    width={900}
                    height={675}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="flex flex-col justify-between gap-4 text-sm">
                <div className="space-y-2">
                  <p className="text-[0.7rem] uppercase tracking-[0.18em] text-foreground/60">
                    Featured kit
                  </p>
                  <h3 className="text-lg font-semibold">
                    {featuredKit.name}
                  </h3>
                  <p className="text-foreground/75">
                    {featuredKit.shortDescription ||
                      "Modular moss pole starter kit."}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {featuredKit.price != null && (
                    <span className="text-base font-semibold">
                      ${featuredKit.price.toFixed(2)}
                    </span>
                  )}
                  {featuredKit.availabilityStatus && (
                    <span className="text-[0.75rem] text-foreground/70">
                      {featuredKit.availabilityStatus === "inStock" &&
                        "In stock"}
                      {featuredKit.availabilityStatus === "madeToOrder" &&
                        "Made to order"}
                      {featuredKit.availabilityStatus === "soldOut" &&
                        "Sold out"}
                      {!["inStock", "madeToOrder", "soldOut"].includes(
                        featuredKit.availabilityStatus
                      ) && featuredKit.availabilityStatus}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center px-4 py-2 rounded-full bg-accent text-background text-xs font-medium">
                    View kit details
                  </span>
                  {featuredKit.etsyUrl && (
                    <span className="inline-flex items-center text-xs text-foreground/70">
                      Also available on Etsy →
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ) : (
            <p className="text-sm text-foreground/60">
              No active kits yet. Add products in Sanity to feature one here.
            </p>
          )}
        </div>
      </section>

      {/* SECTION 4 – MORE STARTER KITS (horizontal strip) */}
      {remainingKits.length > 0 && (
        <section className="bg-background px-4 pb-12 border-t border-foreground/10">
          <div className="max-w-6xl mx-auto space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg md:text-xl font-semibold">
                More starter kits
              </h2>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory">
              {remainingKits.map((product) => (
                <Link
                  key={product._id}
                  href={`/products/${product.slug}`}
                  className="snap-start min-w-[220px] max-w-[260px] rounded-2xl bg-background/80 border border-foreground/15 p-3 flex flex-col hover:-translate-y-0.5 hover:shadow-md transition"
                >
                  <div className="w-full aspect-[4/3] rounded-xl overflow-hidden mb-3">
                    <Image
                      src={
                        product.image
                          ? urlForImage(product.image)
                              .width(600)
                              .height(450)
                              .url()
                          : "/images/mossy-1.png"
                      }
                      alt={product.name}
                      width={600}
                      height={450}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-xs font-medium line-clamp-2 mb-1">
                    {product.name}
                  </p>
                  <p className="text-[0.7rem] text-foreground/70 line-clamp-2 mb-2">
                    {product.shortDescription || "Starter kit"}
                  </p>
                  <div className="flex items-center justify-between mt-auto text-xs">
                    {product.price != null && (
                      <span className="font-semibold">
                        ${product.price.toFixed(0)}
                      </span>
                    )}
                    {product.etsyUrl && (
                      <span className="text-foreground/60">Etsy →</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
