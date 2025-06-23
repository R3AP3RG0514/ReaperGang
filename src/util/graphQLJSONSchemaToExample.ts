import type { JSONSchema } from "json-schema-to-typescript";

function pick3(arr: unknown[]) {
	return arr.slice(0, 3);
}
export function graphQLJSONSchemaToExample(
	group: "organizations" | "zones" | "accounts",
	name: string,
	description: string,
	input: JSONSchema,
	output: JSONSchema,
) {
	const queryName = description
		.split(" ")
		.map((n: string) => n.charAt(0).toUpperCase() + String(n).slice(1))
		.join("")
		.replaceAll(".", "")
		.replaceAll("-", "");

	const groupMapping = {
		accounts: "account",
		zones: "zone",
		organizations: "organization",
	};

	const outputSections = Object.keys(output.properties || {}).reduce(
		(outputQuery, key) => {
			const type = output.properties?.[key].type;

			let outputQueryType = "";
			if (type === "object") {
				const propertiesKeys = Object.keys(
					output.properties?.[key].properties || {},
				);

				const timeKey = propertiesKeys.find((k) => k.includes("time"));

				if (timeKey) {
					outputQueryType = `{
								${timeKey}
								${propertiesKeys
									.filter((el) => !el.includes("time") || !el.includes("date"))
									.splice(0, 2)
									.join("\n\t\t\t\t\t\t\t\t")}
							}`;
				} else {
					outputQueryType = `{
								${propertiesKeys.splice(0, 3).join("\n\t\t\t\t\t\t\t\t")}
							}`;
				}
			}

			if (!outputQuery) {
				return `${key} ${outputQueryType}`;
			}
			return `${outputQuery}
							${key} ${outputQueryType}`;
		},
		"",
	);

	const gqlQuery = `
		query Get${queryName}($${group}Tag: string!, $datetimeStart: Time, $datetimeEnd: Time) {
				viewer {
					${group}(filter: {${groupMapping[group]}Tag: $${group}Tag}) {
						${name}(
							limit: 100,
							filter: {
								datetime_geq: $datetimeStart,
								datetime_leq: $datetimeEnd
							}) {
							${outputSections}
						}
					}
				}
			}
		`;

	return gqlQuery;
}
