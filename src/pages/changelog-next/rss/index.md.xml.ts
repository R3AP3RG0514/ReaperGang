import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { getChangelogs, getRSSItems } from "~/util/changelogs";

export const GET: APIRoute = async ({ locals }) => {
	const notes = await getChangelogs({});

	const items = await getRSSItems({
		notes,
		locals,
		markdown: true,
	});

	return rss({
		title: "Changelogs",
		description: `Cloudflare changelogs - If you would like content as HTML, rather than Markdown, please use https://developers.cloudflare.com/changelog-next/index.xml`,
		site: "https://developers.cloudflare.com/changelog-next/",
		items,
	});
};
