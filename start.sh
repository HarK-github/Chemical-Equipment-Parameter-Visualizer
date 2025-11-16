cp .env.example .env

docker-compose up --build

docker-compose exec backend python manage.py createsuperuser
