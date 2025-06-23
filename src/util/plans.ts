import { getEntry } from "astro:content";
import { getProperty } from "dot-prop";

export async function indexPlans(id: string) {
	const plans = await getEntry("plans", "index");

	if (!plans) {
		throw new Error(`[IndexPlans] Failed to find plans JSON.`);
	}

	const plan = getProperty(plans.data, id);

	if (!plan) {
		throw new Error(`[IndexPlans] Failed to find ${id} in plans JSON.`);
	}

	return plan;
}
