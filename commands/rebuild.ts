import { AttachmentBuilder } from "discord.js";
import { axerhelper } from "..";
import { SlashCommand } from "../struct/commands/SlashCommand";

export default new SlashCommand()
	.setName("rebuild")
	.setDescription("Rebuild axerbot")
	.setExecutable(async (command) => {
		axerhelper.manager
			.rebuild()
			.then(() => {
				command.editReply("✅");
			})
			.catch((e) => {
				console.error(e);

				const log = new AttachmentBuilder(Buffer.from(e), {
					name: "error.log",
				});

				command.editReply({
					files: [log],
				});
			});
	});
