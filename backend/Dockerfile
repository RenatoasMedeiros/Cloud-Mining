# Dockerfile

# ---- Build Stage ----
# Use the official Go image to build the application
FROM golang:1.24-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy go.mod and go.sum files and download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest of the source code
COPY . .

# Build the application, creating a statically linked binary
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o minecraft-manager .


# ---- Final Stage ----
# Use a minimal 'distroless' or 'scratch' image for the final container
FROM gcr.io/distroless/static-debian12

# Set the working directory
WORKDIR /

# Copy the built binary from the 'builder' stage
COPY --from=builder /app/minecraft-manager .

# Expose the port your application listens on
EXPOSE 3000

# The command to run when the container starts
CMD ["/minecraft-manager"]