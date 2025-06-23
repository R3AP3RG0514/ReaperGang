import rehypeExternalLinks, { type Options } from "rehype-external-links";

export const rehypeExternalLinksOptions = {
	content: (element) => {
		if (
			element.children.length === 1 &&
			element.children[0].type === "element" &&
			element.children[0].tagName === "img"
		) {
			return;
		}

		return {
			type: "text",
			value: " ↗",
		};
	},
	contentProperties: {
		class: "external-link",
	},
	properties: {
		target: "_blank",
	},
	rel: ["noopener"],
} as const satisfies Options;

export default function () {
	return rehypeExternalLinks(rehypeExternalLinksOptions);
}
