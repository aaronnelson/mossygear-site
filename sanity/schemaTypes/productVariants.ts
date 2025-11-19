// schemas/productVariant.ts
import { defineField, defineType, defineArrayMember } from 'sanity';

export const productVariant = defineType({
  name: 'productVariant',
  title: 'Variant',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      validation: (Rule) => Rule.required(),
      description: 'e.g. "6 inch kit", "8 inch kit", "Full kit (6 + 8 inch)".',
    }),
    defineField({
      name: 'code',
      title: 'Variant Code',
      type: 'string',
      description: 'Middle part of SKU, e.g. S6K, S8K, SFK.',
    }),
    defineField({
      name: 'lengthInches',
      title: 'Length (inches)',
      type: 'number',
    }),
    defineField({
      name: 'sku',
      title: 'SKU Override (optional)',
      type: 'string',
      description:
        'If set, this exact SKU will be used. If empty, it will be auto-generated from code + pattern.',
    }),
    defineField({
      name: 'price',
      title: 'Price',
      type: 'number',
      description: 'If empty, the base product price will be used.',
    }),
    defineField({
      name: 'etsyVariantId',
      title: 'Etsy Variant ID (optional)',
      type: 'string',
    }),
    defineField({
      name: 'includes6Segment',
      title: 'Includes 6" segment',
      type: 'boolean',
    }),
    defineField({
      name: 'includes8Segment',
      title: 'Includes 8" segment',
      type: 'boolean',
    }),

    // 🔽 NEW: variant-specific kit contents
    defineField({
    name: 'kitContents',
    title: 'Kit Contents (for this variant)',
    type: 'array',
    of: [
        defineArrayMember({
        name: 'kitItem',
        title: 'Kit Item',
        type: 'object',
        fields: [
            defineField({
            name: 'component',
            title: 'Component Product',
            type: 'reference',
            to: [{ type: 'product' }],
            description: 'Pick a component (segment, base, lid, etc.).',
            }),
            defineField({
            name: 'quantity',
            title: 'Quantity',
            type: 'number',
            initialValue: 1,
            validation: (Rule) => Rule.min(1),
            }),
            defineField({
            name: 'required',
            title: 'Required',
            type: 'boolean',
            initialValue: true,
            description:
                'If unchecked, this item is an optional add-on in the kit.',
            }),
        ],
        preview: {
            select: {
            title: 'component.title',
            quantity: 'quantity',
            },
            prepare({ title, quantity }) {
            return {
                title: title || 'No component selected',
                subtitle: `Qty: ${quantity ?? 1}`,
            };
            },
        },
        }),
    ],
    description:
        'If set, this replaces the product-level kit contents for this variant.',
    }),
  ],
});
