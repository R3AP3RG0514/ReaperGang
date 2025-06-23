import { experimental_AstroContainer } from "astro/container";
import { getContainerRenderer } from "@astrojs/mdx";
import { loadRenderers } from "astro:container";
import type { CollectionEntry } from "astro:content";
import { render } from "astro:content";

export async function entryToString(
	entry: CollectionEntry<"docs">,
	locals: any,
) {
	if (entry.rendered) {
		return entry.rendered.html;
	}

	const renderers = await loadRenderers([getContainerRenderer()]);
	const container = await experimental_AstroContainer.create({
		renderers,
	});

	const { Content } = await render(entry);

	const html = await container.renderToString(Content, {
		params: { slug: entry.id },
		locals,
	});

	return html;
}
