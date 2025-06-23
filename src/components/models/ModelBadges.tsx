const ModelBadges = ({ model }: { model: any }) => {
	const badges = model.properties.flatMap((property: any) => {
		if (property.property_id === "lora" && property.value === "true") {
			return {
				variant: "tip",
				text: "LoRA",
			};
		}

		if (
			property.property_id === "function_calling" &&
			property.value === "true"
		) {
			return {
				variant: "note",
				text: "Function calling",
			};
		}

		if (property.property_id === "planned_deprecation_date") {
			const timestamp = Math.floor(new Date(property.value).getTime() / 1000);

			if (Date.now() > timestamp) {
				return { variant: "danger", text: "Deprecated" };
			}

			return { variant: "danger", text: "Planned deprecation" };
		}

		return [];
	});

	return (
		<ul className="m-0 flex list-none items-center gap-2 p-0 text-xs">
			{badges.map((badge: any) => (
				<li key={badge.text}>
					<span className="sl-badge default">{badge.text}</span>
				</li>
			))}
		</ul>
	);
};

export default ModelBadges;
