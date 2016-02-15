BIN = ./node_modules/.bin
SRC = $(wildcard src/* src/*/*)

build: index.js

index.js: src/index.js $(SRC)
	$(BIN)/rollup $< -c > $@

clean:
	rm index.js

test: index.js
	tape test/index.js

.PHONY: build clean test
