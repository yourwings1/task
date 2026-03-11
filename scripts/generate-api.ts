import { generate } from "openapi-typescript-codegen";

await generate({
	input: "./scripts/swagger.json", // или 'http://localhost:3000/api-json'
	output: "./src/api",
	httpClient: "axios",
	useOptions: true,
	useUnionTypes: false,
});
