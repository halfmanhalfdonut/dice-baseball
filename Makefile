# Makefile for dice-baseball app tasks

.PHONY: dev build preview test clean

# Start the Vite dev server for the app
dev:
	npm --prefix app run dev

# Build the production app (generates /app/dist)
build:
	npm --prefix app run build

# Run a preview server for the built app
preview:
	npm --prefix app run preview

# Run unit tests for the app
test:
	npm --prefix app run test

# Remove build artifacts
clean:
	rm -rf app/dist

# Convenience: build and preview
bp: build preview
