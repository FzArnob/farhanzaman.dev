import discord
from discord.ext import commands

# Replace with your bot token
TOKEN = "MTQxMzc2MTg1NDU2NzYxMjUwOA.G_3IO-.LASlvDXM8aj09Zo1YNajn4dGc0YxsfH4rzGxjw"

# Set prefix for commands (e.g., !help)
intents = discord.Intents.default()
intents.members = True  # Needed for member join events

bot = commands.Bot(command_prefix="!", intents=intents)

@bot.event
async def on_ready():
    print(f"Bot {bot.user} is now running!")

@bot.event
async def on_member_join(member):
    # Choose a channel where welcome messages will be sent
    channel = discord.utils.get(member.guild.text_channels, name="general")
    if channel:
        await channel.send(f"🎉 Welcome to the server, {member.mention}! Glad to have you here.")

bot.run(TOKEN)
