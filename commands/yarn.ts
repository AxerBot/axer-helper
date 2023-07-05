import { AttachmentBuilder } from "discord.js";
import { axerhelper } from "..";
import { SlashCommand } from "../struct/commands/SlashCommand";

export default new SlashCommand()
	.setName("yarn")
	.setDescription("Install dependencies")
	.setExecutable(async (command) => {
		const yarn = axerhelper.manager.runYarnInstall();

		if (!yarn.stderr || !yarn.stdout || !command.channel)
			return command.editReply(":x: No output");

		yarn.stderr.on("data", (message) =>
			command.channel?.send(`\`\`\`bash\n${message}\`\`\``)
		);

		yarn.stdout.on("data", (message) =>
			command.channel?.send(`\`\`\`bash\n${message}\`\`\``)
		);

		yarn.on("exit", (code, message) => {
			if (code == 0) {
				command.editReply("✅");
			} else {
				command.editReply(`\`\`\`bash\n${message}\`\`\``);
			}
		});
	});
