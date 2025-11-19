import { defineField, defineType } from "sanity";

export const siteSettingsType = defineType({
    name: "siteSettings",
    title: "Site Settings",
    type: "document",
    fields: [
        defineField({
            name: 'heroEyebrow',
            title: 'Hero Eyebrow',
            type: 'string',
            description: 'Small Text above the main hero title (e.g., a tagline).',
        }),
        defineField({
            name: 'heroTitle',
            title: 'Hero Title',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'heroSubtitle',
            title: 'Hero Subtitle',
            type: 'text',
            rows: 3,
        }),
        defineField({
            name: "primaryCtaLabel",
            title: "Primary button label",
            type: "string",
            description: "Main hero button text (e.g. “Shop on Etsy”).",
        }),
        defineField({
            name: "primaryCtaHref",
            title: "Primary button link",
            type: "string",
            description:
                "URL or anchor for the main button (e.g. your Etsy shop URL).",
        }),
        defineField({
            name: "secondaryCtaLabel",
            title: "Secondary button label",
            type: "string",
            description: "Optional secondary button text (e.g. “View products”).",
        }),
        defineField({
            name: "secondaryCtaHref",
            title: "Secondary button link",
            type: "string",
            description:
                "URL or anchor for the secondary button (e.g. “#products”).",
        }),
    ],
});
