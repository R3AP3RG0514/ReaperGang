import { z } from "astro:schema";
import { getCollection } from "astro:content";
import { type CollectionEntry } from "astro:content";

export async function getChangelogs(opts?: {
	filter?: Parameters<typeof getCollection<"changelogs">>[1];
	wranglerOnly?: boolean;
	deprecationsOnly?: boolean;
}) {
	let changelogs;

	if (opts?.wranglerOnly) {
		changelogs = [await getWranglerChangelog()];
	} else if (opts?.filter) {
		changelogs = await getCollection("changelogs", opts.filter);
	} else {
		changelogs = await getCollection("changelogs");
	}

	if (!changelogs) {
		throw new Error(
			`[getChangelogs] Unable to find any changelogs with ${JSON.stringify(opts)}`,
		);
	}

	if (opts?.deprecationsOnly) {
		changelogs = changelogs.filter((x) => x.id === "api-deprecations");
	} else {
		changelogs = changelogs.filter((x) => x.id !== "api-deprecations");
	}

	const warpIdx = changelogs.findIndex((e) => e.id === "warp");

	if (warpIdx !== -1) {
		const releases = await getWARPReleases();

		changelogs[warpIdx].data.entries.push(...releases);
	}

	const products = [...new Set(changelogs.flatMap((x) => x.data.productName))];
	const productAreas = [
		...new Set(changelogs.flatMap((x) => x.data.productArea)),
	];

	const mapped = changelogs.flatMap((product) => {
		return product.data.entries.map((entry) => {
			return {
				product: product.data.productName,
				link: product.data.link,
				date: entry.publish_date,
				description: entry.description,
				title: entry.title,
				scheduled: entry.scheduled,
				productLink: product.data.productLink,
				productAreaName: product.data.productArea,
				productAreaLink: product.data.productAreaLink,
				individual_page: entry.individual_page && entry.link,
			};
		});
	});

	const grouped = Object.entries(Object.groupBy(mapped, (entry) => entry.date));
	const entries = grouped.sort().reverse();

	return { products, productAreas, changelogs: entries };
}

export async function getWranglerChangelog(): Promise<
	CollectionEntry<"changelogs">
> {
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
			productName: "wrangler",
			productLink: "/workers/wrangler/",
			productArea: "Developer platform",
			productAreaLink: "/workers/platform/changelog/platform/",
			entries: releases.map((release) => {
				return {
					publish_date: release.published_at.toISOString().substring(0, 10),
					title: release.name.split("@")[1],
					link: `https://github.com/cloudflare/workers-sdk/releases/tag/wrangler%40${release.name.split("@")[1]}`,
					description: release.body,
				};
			}),
		},
	};
}

export async function getWARPReleases(): Promise<
	CollectionEntry<"changelogs">["data"]["entries"]
> {
	const releases = await getCollection("warp-releases");

	return releases.map(({ data }) => {
		const date = data.releaseDate.toISOString().substring(0, 10);

		return {
			publish_date: date,
			title: `WARP client for ${data.platformName} (version ${data.version})`,
			link: `/cloudflare-one/changelog/warp/#${date}`,
			description: data.releaseNotes,
		};
	});
}
