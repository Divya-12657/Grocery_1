import discord
intents = discord.Intents.default()
import os

client=discord.Client(intents=intents)

@client.event
async def on_ready():
  print('We have logged in as {0.user}'.format(client))

@client.event
async def on_message(message):
  if message.author == client.user:
    return
  if message.content.startswith('$hello'):
    await message.channel.send('Hello!')


client.run('MTAxNjY3MjE4MzI3MzE0NDQzMA.GQ-imx.Oxlv-92Lt0xArbhE3YlAzJ6ynuF9n22A8jXJrg')
