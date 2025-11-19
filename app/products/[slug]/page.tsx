// app/products/[slug]/page.tsx
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import { sanityClient } from "@/lib/sanityClient";
import { ProductGallery } from "./ProductGallery";

type FilamentColor = {
  _id: string;
  name: string;
  slug?: string;
  hex?: string;
  inStock?: boolean;
};

type KitComponent = {
  _id: string;
  title: string;
  slug?: string;
  kind?: string;
  category?: string;
  pattern?: {
    _id: string;
    name: string;
    slug?: string;
  } | null;
};

type KitContentItem = {
  quantity?: number;
  required?: boolean;
  component?: KitComponent | null;
};

type Product = {
  _id: string;
  title: string;
  slug: string;
  kind?: string;
  category?: string;
  shortDescription?: string;
  description?: any;
  images?: any[];
  price?: number;
  priceUnit?: string;
  sku?: string;
  etsyListingId?: string;
  pattern?: {
    _id: string;
    name: string;
    slug?: string;
  } | null;
  availableFilamentColors?: FilamentColor[];
  kitContents?: KitContentItem[];
  diameterMm?: number;
  segmentHeightMm?: number;
  supportsIrrigation?: boolean;
};

const productBySlugQuery = `
*[_type == "product" && slug.current == $slug][0]{
  _id,
  title,
  "slug": slug.current,
  kind,
  category,
  shortDescription,
  description,
  images,
  price,
  priceUnit,
  sku,
  etsyListingId,
  pattern->{
    _id,
    name,
    "slug": slug.current
  },
  availableFilamentColors[]->{
    _id,
    name,
    "slug": slug.current,
    hex,
    inStock
  },
  kitContents[]{
    quantity,
    required,
    component->{
      _id,
      title,
      "slug": slug.current,
      kind,
      category,
      pattern->{
        _id,
        name,
        "slug": slug.current
      }
    }
  },
  diameterMm,
  segmentHeightMm,
  supportsIrrigation
}
`;

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // Next 16: params is a Promise, so unwrap it
  const { slug } = await params;

  const product = await sanityClient.fetch<Product | null>(
    productBySlugQuery,
    { slug }
  );

  if (!product) {
    return notFound();
  }

  const {
    title,
    shortDescription,
    description,
    images = [],
    price,
    priceUnit,
    sku,
    pattern,
    availableFilamentColors = [],
    kitContents = [],
    kind,
    category,
    etsyListingId,
  } = product;

  const inStockColors = availableFilamentColors.filter(
    (c) => c.inStock !== false
  );
  const outOfStockColors = availableFilamentColors.filter(
    (c) => c.inStock === false
  );

  const isKit = kind === "kit";

  // Build Etsy URL from listing ID, if available
  const etsyUrl = etsyListingId
    ? `https://www.etsy.com/listing/${etsyListingId}`
    : undefined;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Simple breadcrumb */}
        <div className="text-xs text-slate-400 mb-4">
          <span className="text-slate-500">Products</span>
          {category && <span> · {category}</span>}
          {pattern?.name && <span> · {pattern.name}</span>}
        </div>

        <div className="grid gap-10 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          {/* Image / gallery column */}
          <div>
            <ProductGallery images={images} title={title} />
          </div>

          {/* Info / purchase column */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl md:text-3xl font-semibold">
                  {title}
                </h1>
                {kind && (
                  <span className="text-[0.6rem] uppercase tracking-[0.18em] px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-200">
                    {kind === "kit" && "Kit"}
                    {kind === "component" && "Component"}
                    {kind === "accessory" && "Accessory"}
                    {!["kit", "component", "accessory"].includes(kind) && kind}
                  </span>
                )}
              </div>

              {pattern?.name && (
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-2">
                  {pattern.name}
                </p>
              )}

              {shortDescription && (
                <p className="text-sm text-slate-200">{shortDescription}</p>
              )}
            </div>

            <div className="space-y-2">
              {price != null && (
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-semibold text-teal-300">
                    ${price.toFixed(2)}
                  </span>
                  {priceUnit && (
                    <span className="text-xs text-slate-400">
                      {priceUnit}
                    </span>
                  )}
                </div>
              )}
              {sku && (
                <p className="text-xs text-slate-500">SKU: {sku}</p>
              )}
            </div>

            {/* Filament colors */}
            {inStockColors.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 mb-2">
                  Filament Colors
                </h2>
                <div className="flex flex-wrap gap-2">
                  {inStockColors.map((color) => (
                    <button
                      key={color._id}
                      type="button"
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700 text-xs"
                    >
                      {color.hex && (
                        <span
                          className="w-3 h-3 rounded-full border border-slate-700"
                          style={{ backgroundColor: color.hex }}
                        />
                      )}
                      <span>{color.name}</span>
                    </button>
                  ))}
                </div>
                {outOfStockColors.length > 0 && (
                  <p className="mt-2 text-[0.65rem] text-slate-500">
                    Currently unavailable:{" "}
                    {outOfStockColors.map((c) => c.name).join(", ")}
                  </p>
                )}
              </section>
            )}

            {/* Purchase CTAs */}
            <div className="flex flex-wrap gap-3">
              {etsyUrl && (
                <a
                  href={etsyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-teal-400 text-slate-900 text-sm font-medium hover:bg-teal-300 transition"
                >
                  View on Etsy
                </a>
              )}
              <button
                type="button"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-full border border-slate-700 text-slate-100 text-sm font-medium hover:border-slate-400 hover:text-slate-50 transition"
              >
                Add to cart (placeholder)
              </button>
            </div>

            {/* Rich description */}
            {description && (
              <section className="pt-4 border-t border-slate-800">
                <h2 className="text-sm font-semibold mb-2">Details</h2>
                <div className="prose prose-invert prose-sm max-w-none">
                  <PortableText value={description} />
                </div>
              </section>
            )}

            {/* Kit contents */}
            {isKit && kitContents.length > 0 && (
              <section className="pt-4 border-t border-slate-800">
                <h2 className="text-sm font-semibold mb-2">
                  What&apos;s in this kit
                </h2>
                <ul className="space-y-1 text-sm text-slate-200">
                  {kitContents.map((item, idx) => {
                    if (!item.component) return null;
                    const c = item.component;
                    const qty = item.quantity ?? 1;

                    return (
                      <li
                        key={`${c._id}-${idx}`}
                        className="flex items-baseline gap-2"
                      >
                        <span className="text-slate-400 text-xs w-8">
                          x{qty}
                        </span>
                        <div>
                          <p>
                            {c.title}
                            {c.category && (
                              <span className="text-slate-500 text-xs">
                                {" "}
                                · {c.category}
                              </span>
                            )}
                          </p>
                          {c.pattern?.name && (
                            <p className="text-[0.65rem] text-slate-500">
                              Pattern: {c.pattern.name}
                            </p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
