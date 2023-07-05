import { axerhelper } from "..";
import { SlashCommand } from "../struct/commands/SlashCommand";

export default new SlashCommand()
	.setName("stop")
	.setDescription("Stop axer")
	.setExecutable(async (command) => {
		if (!axerhelper.manager.isRunning)
			return command.editReply("Axer isn't running!");

		axerhelper.manager.stopAxer();

		command.editReply("✅");
	});
