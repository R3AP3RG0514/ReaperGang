import { z } from "astro:schema";
import { BadgeConfigSchema } from "./types/badge";
import { reference } from "astro:content";

const spotlightAuthorDetails = z
	.object({
		author: z.string(),
		author_bio_link: z.string().url(),
		author_bio_source: z.string(),
	})
	.optional()
	.describe(
		"These are used to automatically add the SpotlightAuthorDetails component to the page. Refer to https://developers.cloudflare.com/style-guide/components/spotlight-author-details/.",
	);

export const baseSchema = z.object({
	pcx_content_type: z
		.union([
			z.literal("overview"),
			z.literal("get-started"),
			z.literal("how-to"),
			z.literal("concept"),
			z.literal("reference"),
			z.literal("reference-architecture"),
			z.literal("reference-architecture-diagram"),
			z.literal("tutorial"),
			z.literal("api"),
			z.literal("troubleshooting"),
			z.literal("faq"),
			z.literal("integration-guide"),
			z.literal("changelog"),
			z.literal("configuration"),
			z.literal("navigation"),
			z.literal("example"),
			z.literal("learning-unit"),
			z.literal("design-guide"),
			z.literal("video"),
		])
		.catch((ctx) => ctx.input)
		.optional()
		.describe(
			"Refer to https://developers.cloudflare.com/style-guide/documentation-content-strategy/content-types/.",
		),
	content_type: z.string().optional(),
	tags: z.string().array().optional(),
	external_link: z
		.string()
		.optional()
		.describe(
			"Links to this page (i.e sidebar, directory listing) will instead appear as the provided link.",
		),
	difficulty: z
		.union([
			z.literal("Beginner"),
			z.literal("Intermediate"),
			z.literal("Advanced"),
		])
		.catch((ctx) => ctx.input)
		.optional()
		.describe(
			"Difficulty is displayed as a column in the ListTutorials component.",
		),
	updated: z
		.date()
		.optional()
		.describe(
			"This is used to automatically add the LastReviewed component to a page. Refer to https://developers.cloudflare.com/style-guide/components/last-reviewed/.",
		),
	spotlight: spotlightAuthorDetails,
	products: z.string().array().optional(),
	languages: z.string().array().optional(),
	summary: z.string().optional(),
	goal: z.string().array().optional(),
	operation: z.string().array().optional(),
	sidebar: z
		.object({
			order: z.number().optional(),
			label: z.string().optional(),
			group: z
				.object({
					label: z
						.string()
						.optional()
						.describe(
							"Overrides the default 'Overview' label for index pages in the sidebar. Refer to https://developers.cloudflare.com/style-guide/frontmatter/sidebar/.",
						),
					hideIndex: z
						.boolean()
						.default(false)
						.describe(
							"Hides the index page from the sidebar. Refer to https://developers.cloudflare.com/style-guide/frontmatter/sidebar/.",
						),
					badge: BadgeConfigSchema(),
				})
				.optional(),
		})
		.optional(),
	hideChildren: z
		.boolean()
		.optional()
		.describe(
			"Renders this group as a single link on the sidebar, to the index page. Refer to https://developers.cloudflare.com/style-guide/frontmatter/sidebar/.",
		),
	changelog: z
		.object({
			date: z.coerce
				.date()
				.describe(
					"An ISO-8601 date to indicate when this page should be published in RSS feeds.",
				),
			scheduled: z.coerce
				.date()
				.optional()
				.describe(
					"An ISO-8601 date to indicate this page is a future-dated entry in the RSS feed title. The publish date is still taken from the `date` field.",
				),
		})
		.strict()
		.optional()
		.describe(
			"Used for pages in the 'docs' collection that should be used as changelog entries.",
		),
});
