import dedent from "dedent";
import {
	readFile,
	readdir,
	mkdir,
	writeFile,
	access,
	constants,
} from "fs/promises";
import { parse, stringify } from "yaml";
import { slug } from "github-slugger";

const files = await readdir("./src/content/changelogs/", {
	withFileTypes: true,
});

for (const file of files) {
	const withoutExt = file.name.split(".")[0];

	const content = await readFile(file.parentPath.concat(file.name), {
		encoding: "utf-8",
	});

	const { productName, productLink, productArea, entries } = parse(content);

	const productFile = "./src/content/products/".concat(file.name);
	try {
		await access(productFile, constants.F_OK);
	} catch {
		const productYaml = stringify({
			name: productName,
			product: {
				title: productName,
				url: productLink,
				group: productArea,
			},
		});

		await writeFile(productFile, productYaml, { encoding: "utf-8" });
	}

	for (const entry of entries) {
		if (!entry.description) {
			continue;
		}

		const title = entry.title ?? `Changelog for ${entry.publish_date}`;
		const description =
			entry.title ?? ` ${productName} changelog for ${entry.publish_date}`;
		const date = new Date(entry.publish_date).toISOString();
		const products = [withoutExt];

		const frontmatter = {
			title,
			description,
			date,
			products,
		};

		const body = entry.description;

		const content = dedent`
		---
		${stringify(frontmatter, { lineWidth: 0 }).trim()}
		---

		${body}
		`;

		const folder = `./src/content/changelogs-next/${withoutExt}/`;

		await mkdir(folder, {
			recursive: true,
		});

		let path = folder.concat(date.slice(0, 10));

		if (entry.title) {
			path = path.concat(`-${slug(entry.title)}`);
		}

		path = path.concat(".mdx");

		await writeFile(path, content, { encoding: "utf-8" });
	}
}
