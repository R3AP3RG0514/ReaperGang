import { track } from "~/util/zaraz";

export function registerTabs() {
	const elements = document.querySelectorAll<HTMLAnchorElement>(
		"starlight-tabs a[role='tab']",
	);

	if (!elements || elements.length === 0) {
		return;
	}

	for (const el of elements)
		el.addEventListener("click", () => {
			track("tab click", { selected_option: el.innerText });
		});
}
