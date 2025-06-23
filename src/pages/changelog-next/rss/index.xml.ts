import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { getChangelogs, getRSSItems } from "~/util/changelogs";

export const GET: APIRoute = async ({ locals }) => {
	const notes = await getChangelogs({});

	const items = await getRSSItems({
		notes,
		locals,
	});

	return rss({
		title: "Changelogs",
		description: `Cloudflare changelogs - If you would like content as Markdown, rather than HTML, please use https://developers.cloudflare.com/changelog-next/index.md.xml`,
		site: "https://developers.cloudflare.com/changelog-next/",
		items,
	});
};
