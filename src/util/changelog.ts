import type { RSSFeedItem } from "@astrojs/rss";
import { getCollection, getEntries, type CollectionEntry } from "astro:content";
import { entryToString } from "~/util/container";

import { unified, type PluggableList } from "unified";

import rehypeParse from "rehype-parse";
import rehypeStringify from "rehype-stringify";
import rehypeBaseUrl from "~/plugins/rehype/base-url";
import rehypeFilterElements from "~/plugins/rehype/filter-elements";

import rehypeRemark from "rehype-remark";
import remarkGfm from "remark-gfm";
import remarkStringify from "remark-stringify";

// TODO
// function toISODate(date: Date) {
// 	return date.toISOString().slice(0, 10);
// }

// type DocsToChangelogOptions = {
// 	/**
// 	 * An optional title to be prefixed before the date.
// 	 * This is only necessary if you require an extra product name.
// 	 *
// 	 * @example
// 	 * `HTTP DDoS managed ruleset`
// 	 */
// 	name?: string;
// 	/**
// 	 * Name of a product which must match a filename in the
// 	 * src/content/products/ collection, without the
// 	 * file extension.
// 	 *
// 	 * @example
// 	 * `ddos-protection`
// 	 */
// 	product: string;
// 	/**
// 	 * A changelog entry from the `getChangelogs({})` function.
// 	 * @see {@link getChangelogs}
// 	 */
// 	entry: CollectionEntry<"docs">;
// };

// function docsToChangelog({
// 	name,
// 	product,
// 	entry,
// }: DocsToChangelogOptions): CollectionEntry<"changelog"> {
// 	const { data } = entry;

// 	// `data.changelog` will exist as the existence of this
// 	// property is part of the `getChangelogs` filter.
// 	const date = data.changelog!.date;
// 	const scheduled = data.changelog!.scheduled;

// 	const iso8601 = toISODate(date);

// 	let title;
// 	if (scheduled) {
// 		title = `Scheduled for ${toISODate(scheduled)}`;
// 	} else {
// 		title = iso8601;
// 	}

// 	if (name) {
// 		title = `${name} - ${title}`;
// 	}

// 	return {
// 		...entry,
// 		collection: "changelog",
// 		data: {
// 			title,
// 			description: `${name} - ${toISODate(date)}`,
// 			date,
// 			products: [{ collection: "products", id: product }],
// 			link: `/${entry.id}/`,
// 		},
// 	};
// }

export type GetChangelogsOptions = {
	filter?: (entry: CollectionEntry<"changelog">) => boolean;
};

export async function getChangelogs({
	filter,
}: GetChangelogsOptions): Promise<Array<CollectionEntry<"changelog">>> {
	let entries = await getCollection("changelog");

	entries = entries.map((e) => {
		e.data.link = `/changelog/${e.id}/`;

		return e;
	});

	// TODO
	// const ddosHttp = await getCollection("docs", (e) => {
	// 	return (
	// 		e.id.startsWith("ddos-protection/change-log/http/") && e.data.changelog
	// 	);
	// });

	// ddosHttp
	// 	.map((e) =>
	// 		docsToChangelog({
	// 			name: "HTTP DDoS managed ruleset",
	// 			product: "ddos-protection",
	// 			entry: e,
	// 		}),
	// 	)
	// 	.forEach((e) => entries.push(e));

	// const ddosNetwork = await getCollection("docs", (e) => {
	// 	return (
	// 		e.id.startsWith("ddos-protection/change-log/network/") && e.data.changelog
	// 	);
	// });

	// ddosNetwork
	// 	.map((e) =>
	// 		docsToChangelog({
	// 			name: "Network-layer DDoS managed ruleset",
	// 			product: "ddos-protection",
	// 			entry: e,
	// 		}),
	// 	)
	// 	.forEach((e) => entries.push(e));

	// const waf = await getCollection("docs", (e) => {
	// 	return e.id.startsWith("waf/change-log/") && e.data.changelog;
	// });

	// waf
	// 	.map((e) =>
	// 		docsToChangelog({
	// 			product: "waf",
	// 			entry: e,
	// 		}),
	// 	)
	// 	.forEach((e) => entries.push(e));

	if (filter) {
		entries = entries.filter((e) => filter(e));
	}

	return entries.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

type GetRSSItemsOptions = {
	/**
	 * An array of changelog entries from the `getChangelogs({})` function.
	 * @see {@link getChangelogs}
	 */
	notes: Array<CollectionEntry<"changelog">>;
	/**
	 * `locals`, either from `Astro.locals` in custom pages or
	 * `context.locals` in endpoints.
	 * @see {@link https://docs.astro.build/en/reference/api-reference/#locals}
	 */
	locals: App.Locals;
	/**
	 * Returns Markdown in the `<content:encoded>` field instead of HTML.
	 */
	markdown?: boolean;
};

export async function getRSSItems({
	notes,
	locals,
	markdown,
}: GetRSSItemsOptions): Promise<Array<RSSFeedItem>> {
	return await Promise.all(
		notes.map(async (note) => {
			const { title, date, products, link } = note.data;

			const productEntries = await getEntries(products);
			const productTitles = productEntries.map((p) => p.data.name as string);

			const html = await entryToString(note, locals);

			const plugins: PluggableList = [
				rehypeParse,
				rehypeBaseUrl,
				rehypeFilterElements,
			];

			if (markdown) {
				plugins.push(...[rehypeRemark, remarkGfm, remarkStringify]);
			} else {
				plugins.push(...[rehypeStringify]);
			}

			const file = await unified()
				.data("settings", {
					fragment: true,
				})
				.use(plugins)
				.process(html);

			const content = String(file).trim();

			return {
				title: `${productTitles.join(", ")} - ${title}`,
				description: content,
				pubDate: date,
				categories: productTitles,
				link,
				customData: `<product>${productTitles.at(0)}</product>`,
			};
		}),
	);
}
