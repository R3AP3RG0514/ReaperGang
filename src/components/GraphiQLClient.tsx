import { createGraphiQLFetcher } from "@graphiql/toolkit";
import GraphiQL from "graphiql";
import "graphiql/graphiql.css";
import "~/tailwind.css";
import { useEffect, useState } from "react";
import { use } from "marked";

const fetcher = createGraphiQLFetcher({
	url: "https://api.cloudflare.com/client/v4/graphql",
});

export function GraphiQLClient({ schema }: { schema: any }) {
	const [query, setQuery] = useState("");
	useEffect(() => {
		const search = window.location.search;
		const params = new URLSearchParams(search);

		setQuery(atob(params.get("query") || ""));
	}, []);

	const [authToken, setAuthToken] = useState("");
	return (
		<div className="flex h-screen flex-col">
			<div className="flex items-center">
				<label
					htmlFor="password"
					className="text-sm/6 font-medium text-gray-900"
				>
					Auth Token:
				</label>
				<div>
					<input
						id="password"
						name="password"
						type="password"
						onChange={(e) => setAuthToken(e.target.value)}
						className="w-full rounded-md border-2 border-gray-200 bg-white px-2 py-2 dark:border-gray-700 dark:bg-gray-800"
					/>
				</div>
			</div>
			<div className="flex-1">
				<GraphiQL
					fetcher={fetcher}
					schema={schema}
					query={query}
					headers={JSON.stringify({
						authorization: `Bearer ${authToken}`,
					})}
				/>
			</div>
		</div>
	);
}
