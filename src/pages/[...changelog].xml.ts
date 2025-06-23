import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIRoute } from "astro";
import { getChangelogs } from "~/util/changelogs";

export async function getStaticPaths() {
	const changelogs = await getCollection("docs", (entry) => {
		return (
			(entry.data.pcx_content_type === "changelog" &&
				entry.data.changelog_file_name) ||
			entry.data.changelog_product_area_name
		);
	});

	return changelogs.map((entry) => {
		return {
			params: {
				changelog: entry.id + `/index`,
			},
			props: {
				entry,
			},
		};
	});
}

export const GET: APIRoute = async (context) => {
	const entry = context.props.entry;

	if (
		!entry.data.changelog_file_name &&
		!entry.data.changelog_product_area_name
	) {
		throw new Error(
			`One of changelog_file_name or changelog_product_area_name is required on ${entry.id}, to generate RSS feeds.`,
		);
	}

	const changelogs = await getChangelogs({
		filter: (changelog) => {
			return (
				entry.data.changelog_file_name?.includes(changelog.id) ||
				changelog.data.productArea === entry.data.changelog_product_area_name
			);
		},
		locals: context.locals,
		addBaseUrl: true,
	});

	if (!changelogs) {
		throw new Error(
			`Filter for ${entry.data.changelog_file_name} or ${entry.data.changelog_product_area_name} removed all results.`,
		);
	}

	const entries = changelogs.sort((a, b) => {
		return a.date < b.date ? 1 : a.date > b.date ? -1 : 0;
	});

	const rssName =
		entry.data.changelog_product_area_name || changelogs.at(0)?.product.name;
	const isArea = Boolean(entry.data.changelog_product_area_name);

	return rss({
		title: `Changelog | ${rssName}`,
		description: `Updates to ${rssName}`,
		site: "https://developers.cloudflare.com/" + entry.id + "/",
		trailingSlash: false,
		items: entries.map((entry) => {
			return {
				title: `${entry.product.name} - ${entry.title}`,
				description: entry.content,
				pubDate: new Date(entry.date),
				link: entry.link,
				customData: isArea
					? `<product>${entry.product.name}</product>`
					: undefined,
			};
		}),
	});
};
