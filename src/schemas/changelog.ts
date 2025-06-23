import { reference } from "astro:content";
import { z } from "astro:schema";

export const changelogSchema = z.object({
	title: z.string(),
	description: z.string(),
	date: z.coerce.date(),
	products: z.array(reference("products")),
	link: z
		.string()
		.optional()
		.describe(
			'Please do not use the "link" property in changelog entry frontmatter, it is reserved.',
		),
});
