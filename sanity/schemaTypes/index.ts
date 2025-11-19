import { type SchemaTypeDefinition } from 'sanity'
import product from './product';
import filamentColor from './filamentColor';
import patterns from './patterns';
import { siteSettingsType } from './siteSettings';


export const schema: { types: SchemaTypeDefinition[] } = {
  types: [product, filamentColor, patterns, siteSettingsType],
}
