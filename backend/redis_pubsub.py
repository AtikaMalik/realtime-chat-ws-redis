import redis.asyncio as redis
import os
from dotenv import load_dotenv

load_dotenv()
REDIS_URL = os.getenv('REDIS_URL')

redis_client = redis.from_url(REDIS_URL)

async def publish_message(channel: str, message: str):
    await redis_client.publish(channel, message)

async def subscribe(channel: str):
    pubsub = redis_client.pubsub()
    await pubsub.subscribe(channel)
    async for msg in pubsub.listen():
        if msg['type'] == 'message':
            yield msg['data'].decode()
