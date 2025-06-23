type Kind = "LIST" | "SCALAR" | "ENUM" | "OBJECT" | "INPUT_OBJECT";
interface SchemaType {
	name: string;
	kind: Kind;
}

type GraphQLFieldType = {
	kind: Kind;
	name: string;
	ofType: GraphQLFieldType;
};

export interface Field {
	name: string;
	description: string;
	type: GraphQLFieldType;
	defaultValue: null;
}

interface EnumValue {
	name: string;
	description: string;
}

interface SchemaData {
	types: {
		name: string;
		enumValues?: EnumValue[];
		inputFields?: Field[];
		fields?: Field[];
	}[];
}

function unpackType(type: GraphQLFieldType) {
	const types = [];
	let currentType = type;

	while (currentType) {
		types.push({
			kind: currentType.kind,
			name: currentType.name,
		});
		currentType = currentType.ofType;
	}

	return types;
}

// Type handlers
class TypeHandlers {
	constructor(private schema: SchemaData) {}

	handleEnum(field: Field, enumType: SchemaType) {
		const enumData = this.schema.types.find(
			(type) => type.name === enumType.name,
		);

		return {
			type: "string",
			description: field.description,
			oneOf: enumData?.enumValues?.map((value) => ({
				const: value.name,
				title: value.name,
				description: value.description,
			})),
		};
	}

	handleScalar(field: Field, scalar: SchemaType) {
		if (
			["float32", "float64", "uint64", "uint8", "bytes"].includes(scalar.name)
		) {
			return {
				type: "number",
				description: field.description,
			};
		}

		if (["Date", "Time", "DateTime"].includes(scalar.name)) {
			return {
				type: "string",
				description: `${field.description} i.e. 2025-01-01T00:00:00Z`,
			};
		}

		return {
			type: scalar.name,
			description: field.description,
		};
	}

	wrapWithArray(baseType: any, field: Field) {
		return {
			type: "array",
			description: field.description,
			items: {
				description: field.description,
				...baseType,
			},
		};
	}
}

export class GraphQLToJSONSchemaBuilder {
	private typeHandlers: TypeHandlers;

	constructor(private schema: SchemaData) {
		this.typeHandlers = new TypeHandlers(schema);
	}

	private buildType(input: Field[], name: string | undefined) {
		return {
			type: "object",
			title: name || "Parameters",
			properties: this.buildProperties(input),
		};
	}

	private buildProperties(fields: Field[]) {
		return fields.reduce(
			(acc, field) => {
				const types = unpackType(field.type);
				const fieldType = this.determineFieldType(field, types);

				if (fieldType) {
					acc[field.name] = fieldType;
				}

				return acc;
			},
			{} as Record<string, any>,
		);
	}

	private determineFieldType(field: Field, types: SchemaType[]) {
		const { list, scalar, object, inputObject, enumType } =
			this.categorizeTypes(types);

		if (enumType) {
			const enumField = this.typeHandlers.handleEnum(field, enumType);
			return list
				? this.typeHandlers.wrapWithArray(enumField, field)
				: enumField;
		}

		if (scalar) {
			const scalarField = this.typeHandlers.handleScalar(field, scalar);
			return list
				? this.typeHandlers.wrapWithArray(scalarField, field)
				: scalarField;
		}

		if (object) {
			return this.handleObjectType(field, object, list);
		}

		if (inputObject) {
			return this.handleInputObjectType(field, inputObject, list);
		}

		return null;
	}

	private categorizeTypes(types: SchemaType[]) {
		return {
			list: types.find((type) => type.kind === "LIST"),
			scalar: types.find((type) => type.kind === "SCALAR"),
			object: types.find((type) => type.kind === "OBJECT"),
			inputObject: types.find((type) => type.kind === "INPUT_OBJECT"),
			enumType: types.find((type) => type.kind === "ENUM"),
		};
	}

	private handleObjectType(
		field: Field,
		object: SchemaType,
		isList: SchemaType | undefined,
	) {
		const objectType = this.schema.types.find(
			(type) => type.name === object.name,
		);

		if (!objectType?.fields) return null;

		const baseType = this.buildType(objectType.fields, field.name);
		return isList ? this.typeHandlers.wrapWithArray(baseType, field) : baseType;
	}

	private handleInputObjectType(
		field: Field,
		inputObject: SchemaType,
		isList: SchemaType | undefined,
	) {
		const inputObjectData = this.schema.types.find(
			(type) => type.name === inputObject.name,
		);

		if (!inputObjectData?.inputFields) return null;

		if (field.name === "AND" || field.name === "OR") {
			return null;
		}

		const baseType = this.buildType(inputObjectData.inputFields, field.name);
		return isList ? this.typeHandlers.wrapWithArray(baseType, field) : baseType;
	}

	buildCompleteInputType(input: Field[], name?: string) {
		return this.buildType(input, name);
	}

	buildCompleteResponseType(query: any, name?: string) {
		const types = unpackType(query.type);

		const objectTypeName = types.find((type) => type.kind === "OBJECT")?.name;

		const type = this.schema.types.find((type) => type.name === objectTypeName);
		if (!type) {
			return;
		}
		return this.buildType(type.fields || [], name || type.name);
	}
}
