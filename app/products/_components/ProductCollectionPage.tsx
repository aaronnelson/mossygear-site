// app/products/_components/ProductCollectionPage.tsx
import Image from "next/image";
import Link from "next/link";
import { sanityClient } from "@/lib/sanityClient";
import { urlForImage } from "@/lib/sanityImage";

type PatternRef = {
  _id: string;
  name: string;
  slug?: string;
};

type ProductCollection = {
  title: string;
  eyebrow?: string;
  subtitle?: string;
  kindFilter?: string;
  categoryFilter?: string;
  systemFilter?: string;
};

type Product = {
  _id: string;
  title: string;
  slug: string;
  shortDescription?: string;
  price?: number;
  priceUnit?: string;
  currency?: string;
  image?: any;
  pattern?: PatternRef | null;
  diameterMm?: number;
  segmentHeightMm?: number;
};

const collectionBySlugQuery = `
*[_type == "productCollection" && slug.current == $slug][0]{
  title,
  eyebrow,
  subtitle,
  kindFilter,
  categoryFilter,
  systemFilter
}
`;

// Shared field selection for products
const baseProductFields = `
  _id,
  title,
  "slug": slug.current,
  shortDescription,
  price,
  priceUnit,
  currency,
  "image": images[0],
  pattern->{
    _id,
    name,
    "slug": slug.current
  },
  diameterMm,
  segmentHeightMm
`;

// Default ordering for kits / generic collections
const productsForCollectionKitsQuery = `
*[
  _type == "product" &&
  status == "active" &&
  (!defined($kind) || $kind == "" || kind == $kind) &&
  (!defined($category) || $category == "" || category == $category) &&
  (!defined($system) || $system == "" || system == $system)
] | order(_createdAt desc) {
  ${baseProductFields}
}
`;

// Ordering for segments: by size, then recency
const productsForCollectionSegmentsQuery = `
*[
  _type == "product" &&
  status == "active" &&
  (!defined($kind) || $kind == "" || kind == $kind) &&
  (!defined($category) || $category == "" || category == $category) &&
  (!defined($system) || $system == "" || system == $system)
] | order(diameterMm asc, segmentHeightMm asc, _createdAt desc) {
  ${baseProductFields}
}
`;

type Variant = "kits" | "segments" | "accessories" | "generic";

export async function ProductCollectionPage({
  collectionSlug,
  variant,
}: {
  collectionSlug: string;
  variant: Variant;
}) {
  // 1) Load collection config from Sanity
  const collection = await sanityClient.fetch<ProductCollection | null>(
    collectionBySlugQuery,
    { slug: collectionSlug }
  );

  // Sensible defaults per variant if the doc is missing something
  const fallbackTitle =
    variant === "kits"
      ? "Modular Moss Pole Kits"
      : variant === "segments"
      ? "Segments"
      : variant === "accessories"
      ? "Accessories"
      : "Products";

  const fallbackEyebrow =
    variant === "segments"
      ? "Mossygear · Components"
      : "Mossygear · Collection";

  const fallbackSubtitle =
    collectionSlug === "modular-moss-poles"
      ? "All active Modular Moss Pole starter kits in one place."
      : collectionSlug === "segments"
      ? "Individual segment shells for the Mossygear modular moss pole system."
      : "Browse active Mossygear products in this collection.";

  const title = collection?.title ?? fallbackTitle;
  const eyebrow = collection?.eyebrow ?? fallbackEyebrow;
  const subtitle = collection?.subtitle ?? fallbackSubtitle;

  const kind =
    collection?.kindFilter ??
    (variant === "kits"
      ? "kit"
      : variant === "segments"
      ? "component"
      : variant === "accessories"
      ? "accessory"
      : "");
  const category = collection?.categoryFilter ?? "";
  const system = collection?.systemFilter ?? "";

  // 2) Load products using the filters from the collection
  const query =
    variant === "segments"
      ? productsForCollectionSegmentsQuery
      : productsForCollectionKitsQuery;

  const products = await sanityClient.fetch<Product[]>(query, {
    kind,
    category,
    system,
  });

  const pillLabel =
    variant === "kits"
      ? "Kit"
      : variant === "segments"
      ? "Component"
      : variant === "accessories"
      ? "Accessory"
      : "Product";

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
        {/* Header driven from Sanity */}
        <header className="space-y-2">
          {eyebrow && (
            <p className="text-xs uppercase tracking-[0.2em] text-foreground/60">
              {eyebrow}
            </p>
          )}
          <h1 className="text-2xl md:text-3xl font-semibold">{title}</h1>
          {subtitle && (
            <p className="text-sm text-foreground/80 max-w-2xl">
              {subtitle}
            </p>
          )}
        </header>

        {/* Grid */}
        {products.length === 0 ? (
          <p className="text-sm text-foreground/60">
            No products found for this collection.
          </p>
        ) : (
          <section className="grid gap-6 md:grid-cols-3">
            {products.map((product) => (
              <article
                key={product._id}
                className="rounded-2xl bg-background/60 border border-foreground/15 p-4 flex flex-col justify-between"
              >
                <Link href={`/products/${product.slug}`}>
                  <div className="mb-4 cursor-pointer">
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
                        alt={product.title}
                        width={600}
                        height={450}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h2 className="text-base font-medium line-clamp-2">
                        {product.title}
                      </h2>
                      <span className="text-[0.6rem] uppercase tracking-[0.16em] px-2 py-0.5 rounded-full bg-foreground/10 text-foreground/80 whitespace-nowrap">
                        {pillLabel}
                      </span>
                    </div>

                    {/* Pattern + specs (for segments) */}
                    <div className="flex flex-wrap items-center gap-2 text-[0.7rem] text-foreground/60">
                      {product.pattern?.name && (
                        <span className="uppercase tracking-[0.16em]">
                          {product.pattern.name}
                        </span>
                      )}
                      {variant === "segments" &&
                        (product.diameterMm || product.segmentHeightMm) && (
                          <span className="text-foreground/50">
                            {product.diameterMm && `${product.diameterMm} mm`}
                            {product.diameterMm &&
                              product.segmentHeightMm &&
                              " · "}
                            {product.segmentHeightMm &&
                              `${product.segmentHeightMm} mm tall`}
                          </span>
                        )}
                    </div>
                  </div>
                </Link>

                <p className="text-foreground/75 text-xs mb-3 flex-1">
                  {product.shortDescription || "No description yet."}
                </p>

                <div className="flex items-center justify-between mt-auto gap-3">
                  {/* Price */}
                  <div className="flex flex-col">
                    {product.price != null && (
                      <span className="text-sm font-medium text-foreground">
                        {product.currency === "USD" && "$"}
                        {product.currency === "EUR" && "€"}
                        {product.currency === "GBP" && "£"}
                        {product.currency !== "USD" &&
                          product.currency !== "EUR" &&
                          product.currency !== "GBP" &&
                          ""}
                        {product.price.toFixed(2)}
                        {product.priceUnit && (
                          <span className="text-[0.65rem] text-foreground/60 ml-1">
                            {product.priceUnit}
                          </span>
                        )}
                      </span>
                    )}
                  </div>

                  <Link
                    href={`/products/${product.slug}`}
                    className="inline-flex items-center justify-center px-3 py-2 rounded-full bg-accent text-background text-xs font-medium whitespace-nowrap hover:bg-accent-soft transition"
                  >
                    View details
                  </Link>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
