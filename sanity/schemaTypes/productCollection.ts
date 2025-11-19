// sanity/schemaTypes/productCollection.ts
import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'productCollection',
  title: 'Product Collection Page',
  type: 'document',
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
      name: 'eyebrow',
      title: 'Eyebrow / Label',
      type: 'string',
      description: 'Tiny label above the heading, e.g. "Mossygear · Components".',
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle / Description',
      type: 'text',
      rows: 3,
      description: 'Short blurb under the heading.',
    }),

    // Optional filters that drive which products show up
    defineField({
      name: 'kindFilter',
      title: 'Kind filter',
      type: 'string',
      options: {
        list: [
          {title: 'Any', value: ''},
          {title: 'Kit', value: 'kit'},
          {title: 'Component', value: 'component'},
          {title: 'Accessory', value: 'accessory'},
        ],
      },
    }),
    defineField({
      name: 'categoryFilter',
      title: 'Category filter',
      type: 'string',
      options: {
        list: [
          {title: 'Any', value: ''},
          {title: 'Modular Moss Pole', value: 'moss-pole'},
          {title: 'Segment', value: 'segment'},
          {title: 'Base', value: 'base'},
          {title: 'Lid / Cap', value: 'lid'},
          {title: 'Trellis', value: 'trellis'},
          {title: 'Accessory', value: 'accessory'},
        ],
      },
    }),
    defineField({
      name: 'systemFilter',
      title: 'System filter',
      type: 'string',
      description: 'Optional: e.g. "mossy-modular". Leave blank for all systems.',
    }),
  ],
})
