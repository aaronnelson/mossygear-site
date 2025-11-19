// schemas/product.ts
import { defineType, defineField, defineArrayMember } from 'sanity';
import { createClient } from '@sanity/client';
import { apiVersion, dataset, projectId } from '../env'; // <- adjust path if needed

// Read-only client used only for initial values in Studio
const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
});

export default defineType({
  name: 'product',
  title: 'Product',
  type: 'document',

  // This only runs when you create a NEW product document in Studio.
  initialValue: async () => {
    const colorIds: string[] = await client.fetch(
      `*[_type == "filamentColor"]._id`,
    );

    return {
      availableFilamentColors: colorIds.map((id) => ({
        _type: 'reference',
        _ref: id,
      })),
    };
  },

  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'kind',
      title: 'Product Kind',
      type: 'string',
      options: {
        list: [
          { title: 'Kit (bundle of components)', value: 'kit' },
          { title: 'Component (segment, lid, base, etc.)', value: 'component' },
          { title: 'Accessory', value: 'accessory' },
        ],
        layout: 'radio',
      },
      initialValue: 'kit',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Modular Moss Pole', value: 'moss-pole' },
          { title: 'Segment', value: 'segment' },
          { title: 'Base', value: 'base' },
          { title: 'Lid / Cap', value: 'lid' },
          { title: 'Trellis', value: 'trellis' },
          { title: 'Accessory', value: 'accessory' },
        ],
      },
    }),

    defineField({
      name: 'pattern',
      title: 'Pattern',
      type: 'reference',
      to: [{ type: 'pattern' }],
      description:
        'For patterned kits/components: choose a pattern. Leave empty for universal parts like lids.',
    }),

    defineField({
      name: 'system',
      title: 'System',
      type: 'string',
      description: 'Which system this belongs to (e.g. Mossygear Modular).',
      initialValue: 'mossy-modular',
    }),

    defineField({
      name: 'shortDescription',
      title: 'Short Description',
      type: 'text',
      rows: 3,
      description: 'Used on product cards and at the top of the PDP.',
    }),

    defineField({
      name: 'description',
      title: 'Full Description',
      type: 'array',
      of: [{ type: 'block' }],
    }),

    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [{ type: 'image' }],
      options: { layout: 'grid' },
      validation: (Rule) => Rule.min(1),
    }),

    // Pricing
    defineField({
      name: 'price',
      title: 'Base Price',
      type: 'number',
      description: 'Price for the default configuration.',
      validation: (Rule) => Rule.required().min(0),
    }),

    defineField({
      name: 'variants',
      title: 'Kit Variants',
      type: 'array',
      of: [{ type: 'productVariant' }],
      description:
        'Use this for kit options (e.g. 6" kit, 8" kit, full kit). Hidden for non-kit products.',
      hidden: ({ parent }) => parent?.kind !== 'kit',
    }),

    defineField({
      name: 'skuPrefix',
      title: 'SKU Prefix',
      type: 'string',
      initialValue: 'MP-',
      description: 'Usually "MP-". Used when generating kit SKUs.',
    }),

    defineField({
      name: 'priceUnit',
      title: 'Price Unit',
      type: 'string',
      description: 'Per kit, per segment, per pair, etc.',
      initialValue: 'per kit',
    }),

    defineField({
      name: 'sku',
      title: 'SKU',
      type: 'string',
      description: 'Internal SKU. Can mirror Etsy SKU if useful.',
    }),

    // Shared filament colors for this product
    defineField({
      name: 'availableFilamentColors',
      title: 'Available Filament Colors',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'filamentColor' }] }],
      description: 'Which filament colors this product can be printed in.',
    }),

    // Physical specs (esp. for components)
    defineField({
      name: 'diameterMm',
      title: 'Diameter (mm)',
      type: 'number',
      description: 'Outer diameter for this product / component.',
    }),

    defineField({
      name: 'segmentHeightMm',
      title: 'Segment Height (mm)',
      type: 'number',
      description: 'For segments: vertical height of one piece.',
    }),

    defineField({
      name: 'supportsIrrigation',
      title: 'Has built-in watering channel?',
      type: 'boolean',
      initialValue: false,
    }),

    // PDP configuration options (for dropdowns / swatches)
    defineField({
      name: 'options',
      title: 'Configuration Options',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'option',
          title: 'Option',
          type: 'object',
          fields: [
            defineField({
              name: 'name',
              title: 'Name',
              type: 'string',
              description: 'e.g. Diameter, Height, Pattern Variant',
            }),
            defineField({
              name: 'key',
              title: 'Key',
              type: 'string',
              description:
                'Machine-readable key, e.g. diameter, height, patternVariant',
            }),
            defineField({
              name: 'values',
              title: 'Values',
              type: 'array',
              of: [
                defineArrayMember({
                  name: 'value',
                  title: 'Value',
                  type: 'object',
                  fields: [
                    defineField({
                      name: 'label',
                      title: 'Label',
                      type: 'string',
                      description: 'e.g. 55 mm, 80 mm, Tall, Short',
                    }),
                    defineField({
                      name: 'value',
                      title: 'Value',
                      type: 'string',
                      description:
                        'Slug-ish value used in the front end (e.g. 55mm, tall).',
                    }),
                    defineField({
                      name: 'priceDelta',
                      title: 'Price adjustment',
                      type: 'number',
                      description:
                        'Optional price change if this option costs more (can be negative).',
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    }),

    // Kit contents: other products + quantity
    defineField({
      name: 'kitContents',
      title: 'Kit Contents',
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
      hidden: ({ parent }) => parent?.kind !== 'kit',
      description:
        'Default kit contents for this product. For variant-specific kits (e.g. 6" vs 8" vs full), use the kitContents field on each variant.',
    }),

    // Compatibility / cross-sell
    defineField({
      name: 'compatibleWith',
      title: 'Compatible With',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'product' }] }],
      description:
        'Other products that work with this one (extra segments, bases, toppers, etc.).',
    }),

    // Status / meta
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Active', value: 'active' },
          { title: 'Draft / Hidden', value: 'draft' },
          { title: 'Archived', value: 'archived' },
        ],
        layout: 'radio',
      },
      initialValue: 'active',
    }),

    defineField({
      name: 'etsyListingId',
      title: 'Etsy Listing ID',
      type: 'string',
      description: 'Optional: helps you map back to Etsy.',
    }),

    defineField({
      name: 'metadata',
      title: 'Metadata',
      type: 'object',
      fields: [
        defineField({
          name: 'seoTitle',
          title: 'SEO Title',
          type: 'string',
        }),
        defineField({
          name: 'seoDescription',
          title: 'SEO Description',
          type: 'text',
          rows: 2,
        }),
        defineField({
          name: 'tags',
          title: 'Tags',
          type: 'array',
          of: [{ type: 'string' }],
        }),
      ],
    }),
  ],
});
