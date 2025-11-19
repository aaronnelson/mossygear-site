// app/products/modular-moss-poles/page.tsx
import Image from "next/image";
import Link from "next/link";
import { sanityClient } from "@/lib/sanityClient";
import { urlForImage } from "@/lib/sanityImage";

type PatternRef = {
  _id: string;
  name: string;
  slug?: string;
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
};

const modularMossPoleKitsQuery = `
*[
  _type == "product" &&
  status == "active" &&
  kind == "kit" &&
  category == "moss-pole"
] | order(_createdAt desc) {
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
  }
}
`;

export default async function ModularMossPolesPage() {
  const products = await sanityClient.fetch<Product[]>(
    modularMossPoleKitsQuery
  );

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
        {/* Header */}
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Mossygear · Collection
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold">
            Modular Moss Pole Kits
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl">
            All active Modular Moss Pole starter kits in one place. Each kit
            includes stake, patterned segment, water topper, and universal lid,
            and is compatible with additional segments from the same system.
          </p>
        </header>

        {/* Grid */}
        {products.length === 0 ? (
          <p className="text-sm text-slate-400">
            No modular moss pole kits are active right now.
          </p>
        ) : (
          <section className="grid gap-6 md:grid-cols-3">
            {products.map((product) => (
              <article
                key={product._id}
                className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 flex flex-col justify-between"
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
                      <span className="text-[0.6rem] uppercase tracking-[0.16em] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 whitespace-nowrap">
                        Kit
                      </span>
                    </div>

                    {product.pattern?.name && (
                      <p className="text-[0.7rem] uppercase tracking-[0.16em] text-slate-400">
                        {product.pattern.name}
                      </p>
                    )}
                  </div>
                </Link>

                <p className="text-slate-300 text-xs mb-3 flex-1">
                  {product.shortDescription || "No description yet."}
                </p>

                <div className="flex items-center justify-between mt-auto gap-3">
                  {/* Price */}
                  <div className="flex flex-col">
                    {product.price != null && (
                      <span className="text-sm font-medium text-slate-50">
                        {/* You can simplify this if you only use USD */}
                        {product.currency === "USD" && "$"}
                        {product.currency === "EUR" && "€"}
                        {product.currency === "GBP" && "£"}
                        {product.currency !== "USD" &&
                          product.currency !== "EUR" &&
                          product.currency !== "GBP" &&
                          ""}
                        {product.price.toFixed(2)}
                        {product.priceUnit && (
                          <span className="text-[0.65rem] text-slate-400 ml-1">
                            {product.priceUnit}
                          </span>
                        )}
                      </span>
                    )}
                  </div>

                  <Link
                    href={`/products/${product.slug}`}
                    className="inline-flex items-center justify-center px-3 py-2 rounded-full bg-teal-400 text-slate-900 text-xs font-medium whitespace-nowrap hover:bg-teal-300 transition"
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
