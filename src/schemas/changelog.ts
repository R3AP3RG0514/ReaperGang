import { reference, type SchemaContext } from "astro:content";
import { z } from "astro:schema";

export const changelogSchema = ({ image }: SchemaContext) =>
	z.object({
		title: z.string(),
		description: z.string(),
		date: z.coerce.date(),
		hidden: z.boolean().optional(),
		products: z
			.array(reference("products"))
			.default([])
			.describe(
				"An array of products to associate this changelog entry with. You may omit the product named after the folder this entry is in.",
			),
		preview_image: image().optional(),
		noindex: z
			.boolean()
			.optional()
			.describe(
				"If true, this property adds a `noindex` declaration to the page, which will tell internal / external search crawlers to ignore this page. Helpful for pages that are historically accurate, but no longer recommended, such as [Workers Sites](/workers/configuration/sites/).",
			),
	});
