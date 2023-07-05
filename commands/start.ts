import { axerhelper } from "..";
import { SlashCommand } from "../struct/commands/SlashCommand";

export default new SlashCommand()
	.setName("start")
	.setDescription("Starts axer")
	.setExecutable(async (command) => {
		axerhelper.manager.startAxer();

		command.editReply("✅");
	});
