import { LoggerService } from "../general/LoggerService";
import { DiscordBot } from "./DiscordBot";
import { ChildProcess, exec } from "child_process";
import { AxerLog } from "./AxerLog";

export enum ErrorTypes {
	Close,
	Exit,
	Error,
}

export class AxerManager {
	private logger = new LoggerService("AxerManager");
	private process!: ChildProcess;
	public bot: DiscordBot;
	private shouldRestart = true;
	public uptime = new Date();
	public isRunning = false;

	constructor(bot: DiscordBot) {
		this.bot = bot;
	}

	public startAxer() {
		this.logger.printInfo("Starting AxerBot...");

		this.executeAxer();
	}

	public rebuild() {
		this.compile.bind(this);
		this.pullGitChanges.bind(this);
		this.executeAxer.bind(this);

		return new Promise((resolve, reject) => {
			this.logger.printInfo("Rebuilding...");

			const git = this.pullGitChanges();
			if (!git.stderr) return;
			git.stderr.on("data", reject);

			git.on("exit", (code) => {
				if (code == 0) {
					const tsc = this.compile();
					if (!tsc.stderr) return;
					tsc.stderr.on("data", reject);

					tsc.on("exit", (code) => {
						if (code == 0) {
							this.executeAxer();
							resolve(true);
						} else {
							reject();
						}
					});
				} else {
					reject();
				}
			});
		});
	}

	public stopAxer() {
		this.logger.printInfo("Shutting down axer...");

		this.shouldRestart = false;
		this.process.kill(0);
	}

	public runYarnInstall() {
		return exec(`yarn`, {
			cwd: this.bot.config.AXER_PATH,
		});
	}

	private pullGitChanges() {
		return exec(`git pull`, {
			cwd: this.bot.config.AXER_PATH,
		});
	}

	private compile() {
		return exec(`tsc`, {
			cwd: this.bot.config.AXER_PATH,
		});
	}

	private executeAxer() {
		this.process = exec(
			process.env.NODE_ENV != "production"
				? `yarn dev:full`
				: `node dist/index.js`,
			{
				cwd: this.bot.config.AXER_PATH,
			}
		);

		this.executeAxer.bind(this);

		this.process.on("spawn", () => new AxerLog(this.bot).online().send());
		this.process.on("disconnect", () => {
			if (!this.shouldRestart) return;

			new AxerLog(this.bot).restarting().send();
			setTimeout(() => this.executeAxer(), 5000);
		});

		if (this.process.stdout && this.process.stderr) {
			this.process.stderr.on("data", (message: string) => {
				new AxerLog(this.bot, message).unhandledExeption().send();
			});

			this.process.stdout.on("data", console.log);
		}

		this.uptime = new Date();
		this.isRunning = true;

		return this;
	}
}
