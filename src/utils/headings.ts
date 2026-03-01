import GithubSlugger from 'github-slugger';

const slugger = new GithubSlugger();

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

/**
 * Extract h2–h6 headings from raw markdown and return TOC items with slugs
 * matching rehype-slug (github-slugger) for correct anchor links.
 */
export function extractHeadingsFromMarkdown(markdown: string): TocItem[] {
  slugger.reset();
  const lines = markdown.split('\n');
  const items: TocItem[] = [];
  const headingRe = /^(#{2,6})\s+(.+)$/;

  for (const line of lines) {
    const match = line.match(headingRe);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = slugger.slug(text);
      items.push({ id, text, level });
    }
  }

  return items;
}
