import Markdown from "react-markdown";

type Props = {
	title: string;
	description: string;
	href: string;
	svg: string;
};

export default function LinkCard2({ title, description, href, svg }: Props) {
	return (
		<a
			href={href}
			className="not-content flex flex-col gap-4 rounded border border-cl1-gray-8 bg-cl1-white p-6 no-underline dark:border-cl1-gray-2 dark:bg-cl1-gray-0"
		>
			<div>
				{svg && (
					<div
						className="flex h-10 w-10 items-center justify-center rounded bg-cl1-orange-9 fill-cl1-brand-orange dark:bg-cl1-orange-0"
						dangerouslySetInnerHTML={{ __html: svg }}
					/>
				)}
			</div>
			<div className="flex flex-col gap-2 text-black">
				<p className="font-semibold">{title}</p>
				<div className="text-sm">
					<Markdown disallowedElements={["a"]} unwrapDisallowed={true}>
						{description}
					</Markdown>
				</div>
			</div>
		</a>
	);
}
