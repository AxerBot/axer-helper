import { ActivityType, Client, Interaction } from "discord.js";
import { CommandsManager } from "../commands/CommandsManager";
import { LoggerService } from "../general/LoggerService";
import { AxerManager } from "./AxerManager";
import configData from "./../../config.json";

export class DiscordBot extends Client {
	private logger = new LoggerService("DiscordBot");
	public commands = new CommandsManager(this);
	public manager = new AxerManager(this);
	public config = configData;

	constructor() {
		super({
			intents: [
				"GuildMembers",
				"GuildVoiceStates",
				"Guilds",
				"MessageContent",
			],
		});
	}

	async initialize() {
		this.logger.printWarning("Initializing...");

		this.updateStatus.bind(this);

		this.login(this.config.TOKEN)
			.then(() => {
				this.logger.printSuccess(
					`Connected to discord as ${this.user?.username}`
				);

				this.commands.initializeCommands();
				this.on("interactionCreate", this.handleInteraction.bind(this));

				setInterval(() => this.updateStatus(), 5000);
			})
			.catch((error) =>
				this.logger.printError("Cannot connect to discord:", error)
			);
	}

	private updateStatus() {
		if (this.user)
			this.user.setPresence({
				status: "online",
				activities: [
					{
						name: `${this.guilds.cache.size} servers | /help`,
						type: ActivityType.Playing,
					},
				],
			});
	}

	handleInteraction(interaction: Interaction) {
		if (interaction.isChatInputCommand())
			this.commands.handleCommandInteraction(interaction);
	}
}
