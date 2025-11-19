// app/products/[slug]/page.tsx
import { notFound } from "next/navigation";
import { sanityClient } from "@/lib/sanityClient";
import ProductPageClient from "./ProductPageClient";

export type FilamentColor = {
  _id: string;
  name: string;
  slug?: string;
  hex?: string;
  inStock?: boolean;
};

export type KitComponent = {
  _id: string;
  title: string;
  slug?: string;
  kind?: string;
  category?: string;
  pattern?: {
    _id: string;
    name: string;
    slug?: string;
    skuCode?: string;
  } | null;
};

export type KitContentItem = {
  quantity?: number;
  required?: boolean;
  component?: KitComponent | null;
};

export type ProductVariant = {
  _key: string;
  label: string;
  code?: string;
  price?: number;
  sku?: string;
  kitContents?: KitContentItem[] | null;
};

export type Product = {
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
  skuPrefix?: string;
  sku?: string;
  etsyListingId?: string;
  pattern?: {
    _id: string;
    name: string;
    slug?: string;
    skuCode?: string;
  } | null;
  availableFilamentColors?: FilamentColor[];
  // product-level default kit contents
  kitContents?: KitContentItem[] | null;
  // kit variants (only used when kind === "kit")
  variants?: ProductVariant[] | null;
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
  skuPrefix,
  sku,
  etsyListingId,
  pattern->{
    _id,
    name,
    "slug": slug.current,
    skuCode
  },
  availableFilamentColors[]->{
    _id,
    name,
    "slug": slug.current,
    hex,
    inStock
  },
  // product-level default kit contents
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
        "slug": slug.current,
        skuCode
      }
    }
  },
  // kit variants with their own kit contents
  variants[]{
    _key,
    label,
    code,
    price,
    sku,
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
          "slug": slug.current,
          skuCode
        }
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

  return (
    <main className="min-h-screen bg-background text-foreground">
      <ProductPageClient product={product} />
    </main>
  );
}
