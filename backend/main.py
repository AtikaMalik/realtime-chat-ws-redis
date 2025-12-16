from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from redis_pubsub import publish_message, subscribe
from celery_worker import process_message
import asyncio
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_methods=['*'],
    allow_headers=['*']
)

@app.websocket('/ws')
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    channel = 'chat'

    async def send_messages():
        async for msg in subscribe(channel):
            await websocket.send_text(msg)

    asyncio.create_task(send_messages())

    while True:
        data = await websocket.receive_text()
        data_json = json.loads(data)
        username = data_json.get('username')
        message = data_json.get('message')

        await publish_message(channel, f'{username}: {message}')
        process_message.delay(username, message)
