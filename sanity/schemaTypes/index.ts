import { type SchemaTypeDefinition } from 'sanity'
import product from './product';
import filamentColor from './filamentColor';
import patterns from './patterns';
import { siteSettingsType } from './siteSettings';
import productCollection from './productCollection';



export const schema: { types: SchemaTypeDefinition[] } = {
  types: [product, filamentColor, productCollection, patterns, siteSettingsType],
}
