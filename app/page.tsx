import Image from "next/image";
import { sanityClient } from "@/lib/sanityClient";
import { urlForImage } from "@/lib/sanityImage";
import Link from "next/link";

export const dynamic = "force-dynamic";

type Product = {
  _id: string;
  name: string;              // aliased from title in the query
  slug: string;
  shortDescription?: string; // new: plain text used for the card
  etsyUrl?: string;
  price?: number;
  currency?: string;
  status?: string;
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
      `*[_type == "product" && status == "active"] | order(_createdAt desc) {
        _id,
        "name": coalesce(title, name),
        "slug": slug.current,
        kind,         
        shortDescription,
        etsyUrl,
        price,
        currency,
        status,
        "tags": coalesce(metadata.tags, tags),
        "image": images[0] 
      }`
    ),
  ]);

  const heroEyebrow =
    siteSettings?.heroEyebrow ?? "you're the boss";
  const heroTitle =
    siteSettings?.heroTitle ?? "Product site coming soon.";
  const heroSubtitle =
    siteSettings?.heroSubtitle ??
    "This is your custom Next.js landing page, not the default starter screen. We'll turn this into a real product site step by step.";

  const primaryCtaLabel =
    siteSettings?.primaryCtaLabel ?? "Shop on Etsy";
  const primaryCtaHref =
    siteSettings?.primaryCtaHref ?? "https://www.etsy.com";

  const secondaryCtaLabel =
    siteSettings?.secondaryCtaLabel ?? "View products";
  const secondaryCtaHref =
    siteSettings?.secondaryCtaHref ?? "/products/modular-moss-poles";

  return (
    <main className="min-h-screen bg-slate-900 text-slate-50 flex flex-col">
      {/* Hero */}
      <section className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          {heroEyebrow && (
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400 mb-3">
              {heroEyebrow}
            </p>
          )}
          <h1 className="text-4xl font-semibold mb-3">
            {heroTitle}
          </h1>
          <p className="text-slate-300 mb-6">
            {heroSubtitle}
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            {primaryCtaLabel && primaryCtaHref && (
              <a
                href={primaryCtaHref}
                className="inline-flex items-center px-5 py-2.5 rounded-full bg-teal-400 text-slate-900 text-sm font-medium hover:bg-teal-300 transition"
              >
                {primaryCtaLabel}
              </a>
            )}

            {secondaryCtaLabel && secondaryCtaHref && (
              <a
                href={secondaryCtaHref}
                className="inline-flex items-center px-5 py-2.5 rounded-full border border-slate-600 text-sm font-medium text-slate-100 hover:border-slate-300 hover:text-slate-50 transition"
              >
                {secondaryCtaLabel}
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Product grid section */}
      <section id="products" className="border-t border-slate-800 bg-slate-950 px-4 py-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg font-semibold mb-4">Featured products</h2>

          <div className="grid gap-6 md:grid-cols-3">
            {products.map((product) => (
              <article
                key={product._id}
                className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 flex flex-col justify-between"
              >
                <Link href={`/products/${product.slug}`}>
                  <div className="mb-4">
                    <div className="w-full aspect-[4/3] rounded-xl overflow-hidden mb-3">
                      <Image
                        src={
                          product.image
                            ? urlForImage(product.image).width(600).height(450).url()
                            : "/images/mossy-1.png"
                        }
                        alt={product.name}
                        width={600}
                        height={450}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-base font-medium line-clamp-2">
                        {product.name}
                      </h3>

                      {product.kind && (
                        <span className="text-[0.6rem] uppercase tracking-[0.16em] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 whitespace-nowrap">
                          {product.kind === "kit" && "Kit"}
                          {product.kind === "component" && "Component"}
                          {product.kind === "accessory" && "Accessory"}
                          {!["kit", "component", "accessory"].includes(product.kind) &&
                            product.kind}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
                <p className="text-slate-300 text-xs mb-3 flex-1">
                  {product.shortDescription || "No description yet."}
                </p>

                {/* Tags (optional) */}
                {product.tags && product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {product.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-800 text-[0.65rem] text-slate-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between mt-auto gap-3">
                  {/* Price + status */}
                  <div className="flex flex-col">
                    {product.price != null && (
                      <span className="text-sm font-medium text-slate-50">
                        {product.currency === "USD" && "$"}
                        {product.currency === "EUR" && "€"}
                        {product.currency === "GBP" && "£"}
                        {product.currency !== "USD" &&
                          product.currency !== "EUR" &&
                          product.currency !== "GBP" &&
                          ""}
                        {product.price.toFixed(2)}
                        {product.currency && ["USD", "EUR", "GBP"].includes(product.currency)
                          ? ""
                          : product.currency
                          ? ` ${product.currency}`
                          : ""}
                      </span>
                    )}
                    {product.status && (
                      <span className="text-[0.65rem] text-slate-400">
                        {product.status === "inStock" && "In stock"}
                        {product.status === "madeToOrder" && "Made to order"}
                        {product.status === "soldOut" && "Sold out"}
                        {!["inStock", "madeToOrder", "soldOut"].includes(
                          product.status
                        ) && product.status}
                      </span>
                    )}
                  </div>

                  {/* Etsy button */}
                  {product.etsyUrl && (
                    <a
                      href={product.etsyUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center px-3 py-2 rounded-full bg-teal-400 text-slate-900 text-xs font-medium whitespace-nowrap hover:bg-teal-300 transition"
                    >
                      View on Etsy
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
