import { z } from "astro:schema";
import { getCollection, getEntry } from "astro:content";
import { type CollectionEntry } from "astro:content";
import { entryToString } from "./container";
import { Marked } from "marked";
import { baseUrl } from "marked-base-url";

export type Changelogs = Awaited<ReturnType<typeof getChangelogs>>;
export type Filter = (entry: CollectionEntry<"changelogs">) => boolean;

export async function getChangelogs({
	filter,
	locals,
	addBaseUrl,
}: {
	filter?: Filter;
	locals: App.Locals;
	addBaseUrl?: boolean;
}) {
	let changelogs = await getCollection("changelogs");
	changelogs.push(wranglerChangelogs);

	if (filter) {
		changelogs = changelogs.filter((c) => filter(c));
	}

	const marked = new Marked();
	if (addBaseUrl) {
		marked.use(baseUrl("https://developers.cloudflare.com/"));
	}

	const data = changelogs.map((c) => c.data);

	return await Promise.all(
		data.flatMap((changelog) => {
			return changelog.entries.map(async (entry) => {
				let title: string;
				let link: string;
				let content: string;

				if (!entry.title) {
					if (entry.scheduled && entry.scheduled_date) {
						title = `${changelog.productName} - Scheduled changes for ${entry.scheduled_date}`;
					} else {
						title = `${changelog.productName} - ${entry.publish_date}`;
					}
				} else {
					title = entry.title;
				}

				if (entry.individual_page) {
					if (!entry.link) throw new Error("");

					const page = await getEntry("docs", entry.link.slice(1, -1));
					if (!page) throw new Error("");

					link = entry.link;
					content = await entryToString(page, locals);
				} else {
					if (!entry.description) throw new Error("");

					link = changelog.link + `#${entry.publish_date}`;
					content = marked.parse(entry.description, { async: false });
				}

				return {
					product: {
						name: changelog.productName,
						link: changelog.productLink,
						changelog: changelog.link,
						area: {
							name: changelog.productArea,
							changelog: changelog.productAreaLink,
						},
					},
					title,
					date: entry.publish_date,
					individual_page: entry.individual_page,
					scheduled: entry.scheduled,
					scheduled_date: entry.scheduled_date,
					link,
					content,
				};
			});
		}),
	);
}

// Stored as a const so it is only run once.
const wranglerChangelogs = await getWranglerChangelog();

async function getWranglerChangelog(): Promise<CollectionEntry<"changelogs">> {
	const response = await fetch(
		"https://api.github.com/repos/cloudflare/workers-sdk/releases?per_page=100",
	);

	if (!response.ok) {
		throw new Error(
			`[GetWranglerChangelog] Received ${response.status} response from GitHub API.`,
		);
	}

	const json = await response.json();

	let releases = z
		.object({
			published_at: z.coerce.date(),
			name: z.string(),
			body: z.string(),
		})
		.array()
		.parse(json);

	releases = releases.filter((x) => x.name.startsWith("wrangler@"));

	return {
		id: "wrangler",
		collection: "changelogs",
		data: {
			link: "/workers/platform/changelog/wrangler/",
			productName: "Wrangler",
			productLink: "/workers/wrangler/",
			productArea: "Developer platform",
			productAreaLink: "/workers/platform/changelog/platform/",
			entries: releases.map((release) => {
				return {
					publish_date: release.published_at.toISOString().substring(0, 10),
					title: `Wrangler - ${release.name.split("@")[1]}`,
					link: `https://github.com/cloudflare/workers-sdk/releases/tag/wrangler%40${release.name.split("@")[1]}`,
					description: release.body,
				};
			}),
		},
	};
}
