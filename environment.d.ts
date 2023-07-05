declare global {
	namespace NodeJS {
		interface ProcessEnv {
			DEV_NODE_ENV: "development" | "production";
			DEV_OSU_CLIENT_SECRET: string;
			DEV_OSU_CLIENT_ID: string;
			DEV_MONGO_CONNECTION: string;
			DEV_TOKEN: string;
			DEV_AXER_PATH: string;
			DEV_CHANNEL: string;
			DEV_GUILD: string;
		}
	}
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
