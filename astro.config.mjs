import { defineConfig } from 'astro/config';
import svelte from "@astrojs/svelte";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import tailwind from "@astrojs/tailwind";

import mdx from "@astrojs/mdx";

// https://astro.build/config
export default defineConfig({
  integrations: [svelte(), tailwind({
    applyBaseStyles: false
  }), mdx()],
  site: 'https://dvdkm.cc',
  markdown: {
    syntaxHighlight: "prism",
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex]
  }
});