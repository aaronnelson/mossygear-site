// schemas/filamentColor.ts
import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'filamentColor',
  title: 'Filament Color',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
      // e.g. "Olive Green", "Bug Eyes", "Glow in the Dark"
    }),
    defineField({
      name: 'slug',
      title: 'Key / Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 50,
      },
      validation: (Rule) => Rule.required(),
      // e.g. "olive-green", "bug-eyes"
    }),
    defineField({
      name: 'hex',
      title: 'Hex Code (optional)',
      type: 'string',
      description: 'For color swatches in the UI, e.g. #556B2F.',
    }),
    defineField({
      name: 'material',
      title: 'Material (optional)',
      type: 'string',
      description: 'PLA, PETG, etc., if you want to track that.',
    }),
    defineField({
      name: 'inStock',
      title: 'In Stock / Available',
      type: 'boolean',
      initialValue: true,
      description: 'Uncheck to hide this color from purchase options.',
    }),
    defineField({
      name: 'notes',
      title: 'Notes (optional)',
      type: 'text',
      rows: 2,
      description: 'Extra info like "speckled", "silk", brand, etc.',
    }),
  ],
})
