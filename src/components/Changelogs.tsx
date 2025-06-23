import { useState } from "react";
import type { Changelogs } from "~/util/changelogs";

type Changelog = Changelogs[0];
type Product = Changelog["product"];
type Area = Product["area"];

function RSSFeed({
	selectedProduct,
	selectedProductRssUrl,
	selectedArea,
	selectedAreaRssUrl,
}: {
	selectedProduct?: Product;
	selectedProductRssUrl: string;
	selectedArea?: Area;
	selectedAreaRssUrl?: string;
}) {
	const name = selectedProduct?.name ?? "changelog";

	return (
		<>
			<p>
				Subscribe to all {name} posts via{" "}
				<a href={selectedProductRssUrl}>RSS</a>.
			</p>
			{selectedArea && (
				<p>
					Subscribe to all {selectedArea.name} posts via{" "}
					<a href={selectedAreaRssUrl}>RSS</a>.
				</p>
			)}
			<p>
				Unless otherwise noted, all dates refer to the release date of the
				change.
			</p>
		</>
	);
}

function Filters({
	changelogs,
	selectedProduct,
	updateSelectedProduct,
	selectedArea,
	updateSelectedArea,
}: {
	changelogs: Changelogs;
	selectedProduct?: Product;
	updateSelectedProduct: (product: string) => void;
	selectedArea?: Area;
	updateSelectedArea: (area: string) => void;
}) {
	const products = [...new Set(changelogs.flatMap((c) => c.product.name))];

	const areas = [...new Set(changelogs.flatMap((c) => c.product.area.name))];

	return (
		<div className="flex flex-col gap-2 md:flex-row">
			<label>
				Product
				<select
					className="ml-2"
					autoComplete="off"
					value={selectedProduct?.name ?? "all"}
					onChange={(e) => updateSelectedProduct(e.target.value)}
				>
					<option key="all" value="all">
						All
					</option>
					{products.map((product) => (
						<option key={product} value={product}>
							{product}
						</option>
					))}
				</select>
			</label>
			<label className="!mt-0">
				Product area
				<select
					className="ml-2"
					autoComplete="off"
					value={selectedArea?.name ?? "all"}
					onChange={(e) => updateSelectedArea(e.target.value)}
				>
					<option key="all" value="all">
						All
					</option>
					{areas.map((area) => (
						<option key={area} value={area}>
							{area}
						</option>
					))}
				</select>
			</label>
		</div>
	);
}

function Badge({ product }: { product: Product }) {
	return (
		<a href={product.link}>
			<span className="sl-badge caution">{product.name}</span>
		</a>
	);
}

function Content({ changelog }: { changelog: Changelog }) {
	if (changelog.individual_page) {
		return (
			<p>
				For more details, refer to the dedicated page for{" "}
				<a href={changelog.link}>{changelog.product.name}</a>
			</p>
		);
	} else {
		return (
			<div
				dangerouslySetInnerHTML={{ __html: changelog.content }}
				suppressHydrationWarning={true}
			/>
		);
	}
}

export default function Changelogs({ changelogs }: { changelogs: Changelogs }) {
	const [selectedProduct, setSelectedProduct] = useState<Product>();
	const [selectedArea, setSelectedArea] = useState<Area>();

	const [selectedProductRssUrl, setSelectedProductRssUrl] = useState(
		"/changelog/index.xml",
	);
	const [selectedAreaRssUrl, setSelectedAreaRssUrl] = useState<string>();

	const filtered = changelogs.filter((changelog) => {
		if (selectedArea || selectedProduct) {
			return (
				changelog.product.area.name === selectedArea?.name ||
				changelog.product.name === selectedProduct?.name
			);
		}

		return true;
	});

	const grouped = Object.entries(
		Object.groupBy(filtered, (entry) => entry.date),
	)
		.sort()
		.reverse();

	function updateSelectedProduct(product: string) {
		if (product === "all") {
			setSelectedProduct(undefined);
			return;
		}

		const data = changelogs.find((c) => c.product.name === product)!.product;

		setSelectedProduct(data);
		setSelectedProductRssUrl(data.changelog + "index.xml");

		if (selectedArea && selectedArea.name !== data.area.name) {
			setSelectedArea(undefined);
		}
	}

	function updateSelectedArea(area: string) {
		if (area === "all") {
			setSelectedArea(undefined);
			return;
		}

		const data = changelogs.find((c) => c.product.area.name === area)!.product
			.area;

		setSelectedArea(data);
		setSelectedAreaRssUrl(data.changelog + "index.xml");

		if (selectedProduct && selectedProduct.name !== data.name) {
			setSelectedProduct(undefined);
		}
	}

	return (
		<>
			<RSSFeed
				selectedProduct={selectedProduct}
				selectedProductRssUrl={selectedProductRssUrl}
				selectedArea={selectedArea}
				selectedAreaRssUrl={selectedAreaRssUrl}
			/>
			<p>
				Looking for API deprecations? They can be found on our{" "}
				<a href="/fundamentals/api/reference/deprecations/">
					dedicated deprecations page
				</a>
				.
			</p>
			<hr className="my-4" />
			<Filters
				changelogs={changelogs}
				selectedProduct={selectedProduct}
				updateSelectedProduct={updateSelectedProduct}
				selectedArea={selectedArea}
				updateSelectedArea={updateSelectedArea}
			/>
			{grouped.map(([date, entries], idx, arr) => (
				<div key={date}>
					<div className="!mt-8 flex gap-x-4">
						<div>
							<h4 className="sticky top-[--sl-nav-height] text-nowrap bg-[--sl-color-bg]">
								{date}
							</h4>
						</div>
						<div className="!mt-0">
							{entries?.map((entry, idx, arr) => (
								<div key={idx}>
									<div>
										<h4 className="sticky top-[--sl-nav-height] bg-[--sl-color-bg]">
											{entry.title}
										</h4>
										{!selectedProduct && <Badge product={entry.product} />}
										<div className="mt-4">
											<Content changelog={entry} />
										</div>
									</div>
									{idx !== arr.length - 1 && <hr className="my-4" />}
								</div>
							))}
						</div>
					</div>
					{idx !== arr.length - 1 && <hr className="my-4" />}
				</div>
			))}
		</>
	);
}
