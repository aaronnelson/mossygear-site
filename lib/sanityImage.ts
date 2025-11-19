// lib/sanityImage.ts
import imageUrlBuilder from '@sanity/image-url';
import { dataset, projectId } from '@/sanity/env';

const builder = imageUrlBuilder({
  projectId,
  dataset,
});

export function urlForImage(source: any) {
  return builder.image(source);
}
