import { AttachmentBuilder, ColorResolvable, EmbedBuilder } from "discord.js";
import { DiscordBot } from "./DiscordBot";

import { colors } from "../../constants/colors";
import relativeTime from "../../helpers/relativeTime";

export class AxerLog {
	public bot: DiscordBot;
	public message: string | null = null;
	private embed!: EmbedBuilder;
	private isError = false;
	private isCrash = false;

	constructor(bot: DiscordBot, message?: string) {
		this.bot = bot;
		this.message = message || null;
	}

	private buildLog(message: string) {
		const characters = "```";

		return `${characters}bash\n${message}${characters}`;
	}

	public async send(attachment?: AttachmentBuilder) {
		try {
			const guild = await this.bot.guilds.fetch(this.bot.config.GUILD);

			const privateChannel = await guild.channels.fetch(
				this.bot.config.PRIVATE_CHANNEL
			);

			const publicChannel = await guild.channels.fetch(
				this.bot.config.PUBLIC_CHANNEL
			);

			if (privateChannel?.isTextBased()) {
				privateChannel.send({
					embeds: [this.embed],
					files: attachment ? [attachment] : [],
				});
			}

			if (!this.isError && publicChannel?.isTextBased()) {
				publicChannel.send({
					embeds: [this.embed],
				});
			}
		} catch (e) {
			console.error(e);
		}
	}

	private generateLogFile() {
		const file = Buffer.from(this.message || "Unknown Error");
		const attachment = new AttachmentBuilder(file, {
			name: `${new Date().toISOString()}.log`,
		});

		return attachment;
	}

	unhandledExeption() {
		this.embed = new EmbedBuilder()
			.setTitle("🔴 Unhandled Exeption")
			.setColor(colors.red as ColorResolvable)
			.setTimestamp();

		this.isError = true;
		this.isCrash = true;

		if (this.message) {
			const logContent = this.buildLog(
				(this.message || "Unknown error").replace(
					String(process.env.OSU_TOKEN),
					"token"
				)
			);

			if (logContent.length > 2048) {
				const attachment = this.generateLogFile();
				this.embed.setDescription(
					"Log is too big to be displayed here"
				);

				this.send(attachment);
			} else {
				this.embed.setDescription(logContent);
				this.send();
			}
		}

		return this;
	}

	restarting() {
		this.embed = new EmbedBuilder()
			.setTitle("⚠️ Restarting")
			.setDescription(
				"Axer is restarting and will be online in 10 seconds!"
			)
			.setColor(colors.gold as ColorResolvable)
			.setTimestamp()
			.addFields({
				name: "🕒 Uptime",
				value: `\`${relativeTime(
					new Date(),
					this.bot.manager.uptime
				)}\``,
			});

		return this;
	}

	online() {
		this.embed = new EmbedBuilder()
			.setTitle("🟢 Operational")
			.setDescription("Axer is operational again!")
			.setColor(colors.green as ColorResolvable)
			.setTimestamp();

		return this;
	}
}
