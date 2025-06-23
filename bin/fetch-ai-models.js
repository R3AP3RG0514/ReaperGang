import fs from "node:fs";

fetch("https://ai.cloudflare.com/api/models")
	.then((res) => res.json())
	.then((data) => {
		for (const model of data.models) {
			const fileName = model.name.split("/")[2];
			fs.writeFileSync(
				`./src/content/workers-ai-models/${fileName}.json`,
				JSON.stringify(model, undefined, 4),
				"utf-8",
			);
		}
	});
