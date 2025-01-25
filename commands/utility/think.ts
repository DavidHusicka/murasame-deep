import { SlashCommandBuilder } from "discord.js";
import { askDeepQuestion, askQuestion } from "../gpt";

const data = new SlashCommandBuilder()
  .setName("think")
  .setDescription("Thinks about a topic and gives a reply")
  .addStringOption((option) =>
    option
      .setName("question")
      .setDescription("Question you are asking")
      .setRequired(true),
  );
async function execute(interaction: any) {
  const question: string = interaction.options.getString("question");
  await interaction.deferReply();

  try {
    const response = await askDeepQuestion(question); // Process the question
    if (response.content?.length! < 1024) {
      await interaction.editReply({
        content: response.content,
        files: [
          {
            attachment: Buffer.from(
              response.reasoning_content || "No thoughts",
              "utf-8",
            ),
            name: "reasoning.txt",
          },
        ],
      }); // Edit the deferred reply with the response
    } else {
      await interaction.editReply({
        content:
          "I got a little carried away so here's the reply as a chokers file, tehe.",
        files: [
          {
            attachment: Buffer.from(response.content!, "utf-8"),
            name: "response.md",
          },
          {
            attachment: Buffer.from(
              response.reasoning_content || "No thoughts",
              "utf-8",
            ),
            name: "reasoning.txt",
          },
        ],
      });
    }
  } catch (error) {
    console.error(error);
    await interaction.editReply(
      "Something went wrong while processing your question.",
    );
  }
}

export { data, execute };
