import { type ReactNode, useState } from "react";

interface CollapsibleSectionProps {
	title: string;
	children: ReactNode;
	defaultOpen?: boolean;
}

export const CollapsibleSection = ({
	title,
	children,
	defaultOpen = false,
}: CollapsibleSectionProps) => {
	const [isOpen, setIsOpen] = useState(defaultOpen);

	return (
		<div className="mb-4 rounded-lg border">
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="flex h-full w-full cursor-pointer items-center justify-between rounded-t-lg bg-gray-50 p-4 hover:bg-gray-100"
			>
				<h3 className="text-lg font-semibold">{title}</h3>
				<span className="text-lg">{isOpen ? "▼" : "▶"}</span>
			</button>
			{isOpen && <span className="border-t">{children}</span>}
		</div>
	);
};
