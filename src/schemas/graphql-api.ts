import { z } from "zod";

const kindEnum = z.enum([
	"NON_NULL",
	"LIST",
	"INPUT_OBJECT",
	"SCALAR",
	"ENUM",
	"OBJECT",
]);

const ofTypeClass: z.ZodType = z.lazy(() =>
	z.object({
		kind: kindEnum,
		name: z.string(),
		ofType: z.null().or(ofTypeClass),
	}),
);

const inputField = z.object({
	defaultValue: z.null(),
	description: z.string(),
	name: z.string(),
	type: ofTypeClass,
});

const field = z.object({
	args: z.array(inputField),
	deprecationReason: z.null().or(z.string()),
	description: z.string(),
	isDeprecated: z.boolean(),
	name: z.string(),
	type: ofTypeClass,
});

const enumValue = z.object({
	deprecationReason: z.null(),
	description: z.string(),
	isDeprecated: z.boolean(),
	name: z.string(),
});

const type = z.object({
	name: z.string(),
});

const typeElement = z.object({
	description: z.string(),
	enumValues: z.array(enumValue),
	fields: z.array(field),
	inputFields: z.array(inputField),
	interfaces: z.array(z.any()),
	kind: kindEnum,
	name: z.string(),
	possibleTypes: z.array(z.any()),
});

export const graphQLSchema = z.object({
	directives: z.array(z.any()),
	mutationType: type,
	queryType: type,
	subscriptionType: z.null(),
	types: z.array(typeElement),
});
