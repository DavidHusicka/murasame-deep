import {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  MessageFlags,
} from "discord.js";
import { token } from "./config.json";
import commands from "./commands/commands";
import { askDeepQuestion, askQuestion } from "./commands/gpt";

declare module "discord.js" {
  export interface Client {
    commands: Collection<any, any>;
  }
}

/*
async function main() {
  const completion = await openai.chat.completions.create({
    messages: [systemPrompt, userPrompt],
    model: model,
  });

}

main();
*/

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageTyping,
  ],
});

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.login(token);

client.commands = new Collection();

for (const command of commands) {
  client.commands.set(command.data.name, command);
}

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "There was an error while executing this command!",
        flags: MessageFlags.Ephemeral,
      });
    } else {
      await interaction.reply({
        content: "There was an error while executing this command!",
        flags: MessageFlags.Ephemeral,
      });
    }
  }
});

const idUsernameMap = new Map<string, string>();
idUsernameMap.set("1037436415283318814", "Murasame");
idUsernameMap.set("341221857699037184", "Michal");
idUsernameMap.set("604931611028488193", "Dudi");
idUsernameMap.set("733323038401101834", "Vojta");
idUsernameMap.set("310819758432059404", "Tom");
idUsernameMap.set("285112688994942978", "Sebo");
idUsernameMap.set("440144734984601600", "Llyfr");
idUsernameMap.set("410089967138897931", "Kapus");
idUsernameMap.set("276002535872135179", "Pavel");
idUsernameMap.set("216922655180193794", "Dominik");
idUsernameMap.set("288688668208660481", "Twink Pavel");
idUsernameMap.set("153480398054227978", "Soti");
idUsernameMap.set("428563555256893442", "Kuba");
idUsernameMap.set("794923933991305228", "Zakk");
idUsernameMap.set("", "");

client.on("messageCreate", async (message) => {
  // Ignore messages from bots
  if (message.author.bot) return;

  // Check if the bot is mentioned
  if (message.mentions.has(client.user)) {
    console.log(message.content);
    let messageContent = message.content;
    for (const [id, username] of idUsernameMap) {
      messageContent = messageContent.replace(`<@!${id}>`, username);
    }
    message.channel.sendTyping();
    let reply: string;
    let thoughts: string | undefined;
    if (messageContent.startsWith("think")) {
      const rep = (await askDeepQuestion(messageContent.slice(6))) || "";
      reply = rep.content || "";
      thoughts = rep.reasoning_content;
    } else {
      reply = (await askQuestion(messageContent)) || "";
    }
    let attachments = [];
    let content: string;
    if (reply!.length < 1000) {
      content = reply!;
    } else {
      content =
        "I got a little carried away so here's the reply as a chonkers file, tehe.";
      attachments.push({
        attachment: Buffer.from(reply!, "utf-8"),
        name: "response.md",
      });
    }
    if (thoughts) {
      attachments.push({
        attachment: Buffer.from(thoughts, "utf-8"),
        name: "reasoning.txt",
      });
    }
    message.reply({
      content: content,
      files: [
        {
          attachment: Buffer.from(reply!, "utf-8"),
          name: "response.md",
        },
      ],
    });
  }
});
