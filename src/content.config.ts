import { z, defineCollection } from "astro:content";
import { docsLoader, i18nLoader } from "@astrojs/starlight/loaders";
import { docsSchema, i18nSchema } from "@astrojs/starlight/schema";
import {
	appsSchema,
	changelogsSchema,
	baseSchema,
	notificationsSchema,
	pagesBuildEnvironmentSchema,
	pagesFrameworkPresetsSchema,
	compatibilityFlagsSchema,
	glossarySchema,
	learningPathsSchema,
	videosSchema,
	workersAiSchema,
} from "~/schemas";
import { glob } from "astro/loaders";

const partialSchema = z.object({
	params: z.string().array().optional(),
});

export const collections = {
	docs: defineCollection({
		loader: docsLoader(),
		schema: docsSchema({
			extend: baseSchema,
		}),
	}),
	i18n: defineCollection({ loader: i18nLoader(), schema: i18nSchema() }),
	changelogs: defineCollection({
		loader: glob({
			pattern: ["**\/*.yml", "**\/*.yaml"],
			base: "src/content/changelogs",
		}),
		schema: changelogsSchema,
	}),
	"compatibility-flags": defineCollection({
		loader: glob({
			pattern: ["**\/*.md", "**\/*.mdx"],
			base: "src/content/compatibility-flags",
		}),
		schema: compatibilityFlagsSchema,
	}),
	partials: defineCollection({
		loader: glob({
			pattern: ["**\/*.md", "**\/*.mdx"],
			base: "src/content/partials",
		}),
		schema: partialSchema,
	}),
	glossary: defineCollection({
		loader: glob({
			pattern: ["**\/*.yml", "**\/*.yaml"],
			base: "src/content/glossary",
		}),
		schema: glossarySchema,
	}),
	plans: defineCollection({
		// untyped due to https://github.com/colinhacks/zod/issues/2195
		loader: glob({
			pattern: "**\/*.json",
			base: "src/content/plans",
		}),
	}),
	"pages-framework-presets": defineCollection({
		loader: glob({
			pattern: ["**\/*.yml", "**\/*.yaml"],
			base: "src/content/pages-framework-presets",
		}),
		schema: pagesFrameworkPresetsSchema,
	}),
	"pages-build-environment": defineCollection({
		loader: glob({
			pattern: ["**\/*.yml", "**\/*.yaml"],
			base: "src/content/pages-build-environment",
		}),
		schema: pagesBuildEnvironmentSchema,
	}),
	notifications: defineCollection({
		loader: glob({
			pattern: ["**\/*.yml", "**\/*.yaml"],
			base: "src/content/notifications",
		}),
		schema: notificationsSchema,
	}),
	"learning-paths": defineCollection({
		loader: glob({
			pattern: "**\/*.json",
			base: "src/content/learning-paths",
		}),
		schema: learningPathsSchema,
	}),
	products: defineCollection({
		loader: glob({
			pattern: ["**\/*.yml", "**\/*.yaml"],
			base: "src/content/products",
		}),
	}),
	"workers-ai-models": defineCollection({
		loader: glob({
			pattern: "**\/*.json",
			base: "src/content/workers-ai-models",
		}),
		schema: workersAiSchema,
	}),
	videos: defineCollection({
		loader: glob({
			pattern: ["**\/*.yml", "**\/*.yaml"],
			base: "src/content/videos",
		}),
		schema: videosSchema,
	}),
	apps: defineCollection({
		loader: glob({
			pattern: ["**\/*.yml", "**\/*.yaml"],
			base: "src/content/apps",
		}),
		schema: appsSchema,
	}),
};
