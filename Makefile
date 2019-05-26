REPOSITORY = agoric/swingset-factory
TAG := $(shell sed -ne 's/.*"version": "\(.*\)".*/\1/p' package.json)

docker-install:
	install -m 755 ./ssfactory /usr/local/bin/

docker-build:
	docker build -t $(REPOSITORY):latest .
	docker tag $(REPOSITORY):latest $(REPOSITORY):$(TAG)

docker-push:
	docker push $(REPOSITORY):latest
	docker push $(REPOSITORY):$(TAG)
