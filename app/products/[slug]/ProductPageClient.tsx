"use client";

import { useState, useMemo } from "react";
import { PortableText } from "@portabletext/react";
import { ProductGallery } from "./ProductGallery";
import type {
  Product,
  KitContentItem,
  ProductVariant,
} from "./page";

type Props = {
  product: Product;
};

function getVariantSku(
  product: Product,
  variant?: ProductVariant
): string | undefined {
  // If there's no variant or it's not a kit, just use product-level SKU
  if (!variant) {
    return product.sku;
  }

  // If the variant has an explicit SKU, that wins
  if (variant.sku && variant.sku.trim().length > 0) {
    return variant.sku.trim();
  }

  const prefix = (product.skuPrefix ?? "MP-").trim();
  const code = (variant.code ?? "").trim();
  const patternCode = product.pattern?.skuCode
    ? product.pattern.skuCode.trim().toUpperCase()
    : "";

  if (!code || !patternCode) {
    // Fallback: not enough info to generate, use product SKU if present
    return product.sku;
  }

  return `${prefix}${code}-${patternCode}`;
}

export default function ProductPageClient({ product }: Props) {
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
    kitContents,
    variants,
    kind,
    category,
    etsyListingId,
    availabilityStatus, // ⬅️ pull it from product
  } = product;

  const isKit = kind === "kit";

  const variantList: ProductVariant[] = useMemo(
    () =>
      isKit && Array.isArray(variants) ? variants.filter(Boolean) : [],
    [isKit, variants]
  );

  const initialVariantKey =
    variantList.length > 0 ? variantList[0]._key : null;

  const [selectedVariantKey, setSelectedVariantKey] = useState<
    string | null
  >(initialVariantKey);

  const selectedVariant: ProductVariant | undefined = useMemo(() => {
    if (!isKit || variantList.length === 0) return undefined;
    if (!selectedVariantKey) return variantList[0];
    return (
      variantList.find((v) => v._key === selectedVariantKey) ??
      variantList[0]
    );
  }, [isKit, variantList, selectedVariantKey]);

  // Prefer variant-level kit contents; fall back to product-level; always an array
  const rawKitContents: KitContentItem[] | null | undefined =
    isKit &&
    selectedVariant?.kitContents &&
    Array.isArray(selectedVariant.kitContents) &&
    selectedVariant.kitContents.length > 0
      ? selectedVariant.kitContents
      : kitContents;

  const safeKitContents: KitContentItem[] = Array.isArray(rawKitContents)
    ? rawKitContents
    : [];

  const inStockColors = availableFilamentColors.filter(
    (c) => c.inStock !== false
  );
  const outOfStockColors = availableFilamentColors.filter(
    (c) => c.inStock === false
  );

  // Use variant price if present, otherwise product-level
  const effectivePrice =
    isKit && selectedVariant?.price != null
      ? selectedVariant.price
      : price;

  // 🔑 Final display SKU: auto-generated for kit variants when possible
  const displaySku = isKit
    ? getVariantSku(product, selectedVariant)
    : sku;

  // Build Etsy URL from listing ID, if available
  const etsyUrl = etsyListingId
    ? `https://www.etsy.com/listing/${etsyListingId}`
    : undefined;

  // Human-friendly availability label
  const availabilityLabel =
    availabilityStatus === "inStock"
      ? "In stock"
      : availabilityStatus === "madeToOrder"
      ? "Made to order"
      : availabilityStatus === "soldOut"
      ? "Sold out"
      : undefined;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Simple breadcrumb */}
      <div className="text-xs text-foreground/60 mb-4">
        <span className="text-foreground/50">Products</span>
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
                <span className="text-[0.6rem] uppercase tracking-[0.18em] px-2 py-0.5 rounded-full bg-background/60 border border-foreground/25 text-foreground/90">
                  {kind === "kit" && "Kit"}
                  {kind === "component" && "Component"}
                  {kind === "accessory" && "Accessory"}
                  {!["kit", "component", "accessory"].includes(kind) &&
                    kind}
                </span>
              )}
            </div>

            {pattern?.name && (
              <p className="text-xs uppercase tracking-[0.2em] text-foreground/60 mb-2">
                {pattern.name}
              </p>
            )}

            {shortDescription && (
              <p className="text-sm text-foreground/80">
                {shortDescription}
              </p>
            )}
          </div>

          {/* Variant selector (kits only) */}
          {isKit && variantList.length > 0 && (
            <section className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">
                Kit configuration
              </label>
              <select
                className="w-full rounded-lg border border-foreground/25 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/60"
                value={selectedVariantKey ?? ""}
                onChange={(e) =>
                  setSelectedVariantKey(
                    e.target.value || initialVariantKey
                  )
                }
              >
                {variantList.map((variant) => (
                  <option key={variant._key} value={variant._key}>
                    {variant.label}
                  </option>
                ))}
              </select>
              {selectedVariant && (
                <p className="text-[0.7rem] text-foreground/60">
                  Showing contents for:{" "}
                  <strong>{selectedVariant.label}</strong>
                </p>
              )}
            </section>
          )}

          <div className="space-y-2">
            {effectivePrice != null && (
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-semibold text-accent">
                  ${effectivePrice.toFixed(2)}
                </span>
                {priceUnit && (
                  <span className="text-xs text-foreground/60">
                    {priceUnit}
                  </span>
                )}
              </div>
            )}
            {displaySku && (
              <p className="text-xs text-foreground/60">
                SKU: {displaySku}
              </p>
            )}
            {availabilityLabel && (
              <p className="text-xs text-foreground/60">
                {availabilityLabel}
              </p>
            )}
          </div>

          {/* Filament colors */}
          {inStockColors.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60 mb-2">
                Filament Colors
              </h2>
              <div className="flex flex-wrap gap-2">
                {inStockColors.map((color) => (
                  <button
                    key={color._id}
                    type="button"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/60 border border-foreground/25 text-xs text-foreground"
                  >
                    {color.hex && (
                      <span
                        className="w-3 h-3 rounded-full border border-foreground/20"
                        style={{ backgroundColor: color.hex }}
                      />
                    )}
                    <span>{color.name}</span>
                  </button>
                ))}
              </div>
              {outOfStockColors.length > 0 && (
                <p className="mt-2 text-[0.65rem] text-foreground/60">
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
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-accent text-background text-sm font-medium hover:bg-accent-soft transition"
              >
                View on Etsy
              </a>
            )}
            <button
              type="button"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-full border border-foreground/30 text-foreground text-sm font-medium hover:border-foreground/60 hover:text-foreground transition"
            >
              Add to cart (placeholder)
            </button>
          </div>

          {/* Rich description */}
          {description && (
            <section className="pt-4 border-t border-foreground/15">
              <h2 className="text-sm font-semibold mb-2">Details</h2>
              <div className="prose prose-invert prose-sm max-w-none">
                <PortableText value={description} />
              </div>
            </section>
          )}

          {/* Kit contents (variant-aware) */}
          {isKit && safeKitContents.length > 0 && (
            <section className="pt-4 border-t border-foreground/15">
              <h2 className="text-sm font-semibold mb-2">
                What&apos;s in this kit
              </h2>
              <ul className="space-y-1 text-sm text-foreground">
                {safeKitContents.map((item, idx) => {
                  if (!item.component) return null;
                  const c = item.component;
                  const qty = item.quantity ?? 1;

                  return (
                    <li
                      key={`${c._id}-${idx}`}
                      className="flex items-baseline gap-2"
                    >
                      <span className="text-foreground/60 text-xs w-8">
                        x{qty}
                      </span>
                      <div>
                        <p>
                          {c.title}
                          {c.category && (
                            <span className="text-foreground/60 text-xs">
                              {" "}
                              · {c.category}
                            </span>
                          )}
                        </p>
                        {c.pattern?.name && (
                          <p className="text-[0.65rem] text-foreground/70">
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
  );
}
