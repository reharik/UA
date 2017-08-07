SHELL:=/bin/bash

dockerUp:
	docker-compose -p ua up

dockerDown:
	docker-compose -p ua down --rmi local --remove-orphans

lint:
	cd api && npm run lint

db:
	psql -h localhost -d ua -U ua -p 5400