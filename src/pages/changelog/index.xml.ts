import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { getChangelogs } from "~/util/changelogs";

export const GET: APIRoute = async (context) => {
	const changelogs = await getChangelogs({
		locals: context.locals,
		addBaseUrl: true,
	});

	const entries = changelogs.sort((a, b) => {
		return a.date < b.date ? 1 : a.date > b.date ? -1 : 0;
	});

	return rss({
		title: `Cloudflare product changelog`,
		description: `Updates to various Cloudflare products.`,
		site: "https://developers.cloudflare.com/changelog/",
		trailingSlash: false,
		items: entries.map((entry) => {
			return {
				title: `${entry.product.name} - ${entry.title}`,
				description: entry.content,
				pubDate: new Date(entry.date),
				link: entry.link,
				customData: `<product>${entry.product.name}</product>`,
			};
		}),
	});
};
