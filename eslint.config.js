import pluginUnicorn from "eslint-plugin-unicorn";
import pluginTailwind from "eslint-plugin-tailwindcss";
import pluginJavaScript from "@eslint/js";
import pluginTypeScript from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import pluginAstro from "eslint-plugin-astro";
import pluginReactA11y from "eslint-plugin-jsx-a11y";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginYml from "eslint-plugin-yml";
import pluginJson from "eslint-plugin-json";

import globals from "globals";

/** @type {import('eslint').Linter.Config[]} */
export default [
	{
		languageOptions: {
			globals: {
				...globals.node,
			},
		},
	},
	pluginJavaScript.configs.recommended,
	...pluginTypeScript.configs.recommended,
	...pluginAstro.configs.recommended,
	...pluginAstro.configs["jsx-a11y-recommended"],
	{
		files: ["**/*.{jsx,mjsx,tsx,mtsx}"],
		...pluginReact.configs.flat.recommended,
		...pluginReactA11y.flatConfigs.recommended,
		...pluginReact.configs.flat["jsx-runtime"],
		...pluginReactHooks.configs["recommended-latest"],
	},
	...pluginTailwind.configs["flat/recommended"],
	pluginUnicorn.configs.recommended,
	pluginJson.configs.recommended,
	...pluginYml.configs["flat/recommended"],
	{
		settings: {
			tailwindcss: {
				whitelist: [
					"not-content",
					"sl-hidden",
					"sl-flex",
					"sl-markdown-content",
					"feedback-prompt",
					"bleed",
					"gray",
					"live-code-layout",
					"tryit-sidebar",
					"tryit-code",
				],
			},
		},
	},
	{
		ignores: [".astro/", ".wrangler/", "dist/", ".github/"],
	},
	{
		rules: {
			"no-var": "error",
			"unicorn/better-regex": "error",
			"unicorn/prevent-abbreviations": "off",
			"unicorn/filename-case": "off",
			"unicorn/text-encoding-identifier-case": "off",
			"unicorn/no-anonymous-default-export": "off",
			"unicorn/prefer-global-this": "off",
			"unicorn/explicit-length-check": "off",
			"unicorn/no-null": "off",
			"unicorn/prefer-spread": "off",
			"unicorn/no-process-exit": "off",
			"unicorn/prefer-top-level-await": "off",
			"unicorn/prefer-dom-node-text-content": "off",
			"unicorn/prefer-add-event-listener": "off",
			"unicorn/template-indent": "off",
			"unicorn/no-nested-ternary": "off",
			"unicorn/numeric-separators-style": [
				"error",
				{ onlyIfContainsSeparator: true },
			],
			"unicorn/consistent-function-scoping": [
				"error",
				{ checkArrowFunctions: false },
			],
			"@typescript-eslint/no-explicit-any": "off",
			"@typescript-eslint/no-unused-vars": [
				"error",
				{ ignoreRestSiblings: true },
			],
		},
	},
];
