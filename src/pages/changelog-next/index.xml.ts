import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { getChangelogs, getRSSItems } from "~/util/changelogs";

export const GET: APIRoute = async ({ locals }) => {
	const notes = await getChangelogs({});

	const items = await getRSSItems({
		notes,
		locals,
		legacy: true,
	});

	return rss({
		title: "Cloudflare release notes",
		description: `Updates to various Cloudflare products.`,
		site: "https://developers.cloudflare.com/changelog-next/",
		trailingSlash: false,
		items,
	});
};
