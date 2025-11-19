// schemas/pattern.ts
import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'pattern',
  title: 'Pattern',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
      // e.g. "Dense Bamboo Askew", "Bamboo Cells", "Herringbone Weave"
    }),
    defineField({
      name: 'slug',
      title: 'Key / Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 80,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'skuCode',
      title: 'SKU Code',
      type: 'string',
      description:
        'Short code used in SKUs, e.g. AD for Askew Dense Bamboo.',
      validation: (Rule) => Rule.required().min(1).max(8),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      description: 'Optional: short description of this pattern.',
    }),
    defineField({
      name: 'previewImage',
      title: 'Preview Image',
      type: 'image',
      description: 'Optional: an image that shows this pattern up close.',
    }),
  ],
});
