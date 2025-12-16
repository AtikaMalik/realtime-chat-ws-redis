from celery import Celery
import os
from dotenv import load_dotenv

load_dotenv()
REDIS_URL = os.getenv('REDIS_URL')

celery_app = Celery(
    'worker',
    broker=REDIS_URL,
    backend=REDIS_URL
)

@celery_app.task
def process_message(username, message):
    print(f'[Celery] {username}: {message}')
    return f'{username}: {message}'
