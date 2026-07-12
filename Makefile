.PHONY: dev prod down clean logs

dev:
	docker compose -f docker-compose.dev.yml up 

prod:
	docker compose up --build -d

down:
	docker compose down

clean:
	docker compose down -v

logs:
	docker compose logs -f