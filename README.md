exnaton-challenge-demo
comprehensive README.md file tailored specifically to this project structure and implementation details. It’s structured clearly to guide reviewers through what i built and how it works.

Exnaton Coding Challenge - Energy Data Platform

This project is a complete implementation of Exnaton's technical challenge, involving the ingestion, analysis, storage, and exposure of smart meter energy data via a backend API, with deployment-ready configurations. The guide provides the comprehensive step-by-step solution for the Exnaton energy data management covering data exploration, backend development and deployment strategies.

---

Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Features](#features)
- [Task Breakdown](#task-breakdown)
  - [Task A: Data Exploration](#task-a-data-exploration)
  - [Task B: Backend Implementation](#task-b-backend-implementation)
  - [Task C: Deployment & Scalability](#task-c-deployment--scalability)
- [Tech Stack](#tech-stack)
- [API Documentation](#api-documentation)
- [Setup Guide](#setup-guide)
- [Kubernetes & Production Deployment](#kubernetes--production-deployment)
- [Performance Considerations](#performance-considerations)

---


This project processes and serves smart meter data for multiple tenants. It supports querying energy readings over time, analyzing usage patterns, and visualizing consumption data. It is ready for scalable deployment and multi-tenant operation.

---

Project Structure


exnaton-challenge/
├── prisma/                  # Prisma ORM schema and migrations
├── routes/                 # Express API routes
├── services/               # Data ingestion and analysis logic
├── data/                   # Raw JSON input data
├── tests/                  # API test cases
├── k8s/                    # Kubernetes deployment manifests
├── scripts/                # Setup and initialization scripts
├── docker-compose.yml      # Docker multi-service setup
├── Dockerfile              # Application container
├── nginx.conf              # NGINX load balancer config
├── server.js               # Express app entry point
├── package.json            # Dependencies and scripts
└── README.md               # Project documentation


Features

 - Energy data analysis (daily patterns, autocorrelation, 15-min intervals)
- RESTful API to query and aggregate energy usage
- PostgreSQL + TimescaleDB for scalable time-series storage
- Fully containerized with Docker & Kubernetes
- Multi-tenant support
- Swagger UI for API testing
- Production-ready deployment scripts

---

Task Breakdown

Task A: Data Exploration

- Data Format:
  - Smart meter data in JSON format
  - 15-minute intervals (ISO 8601 timestamps)
  - Values tagged by hexadecimal fields

- Hypothesis:
  - Meter 1: Primary residential/commercial usage
  - Meter 2: Solar/battery/backup (mostly idle)

- Findings:
  - Regular daily energy cycles
  - Meter 2 shows intermittent readings
  - Autocorrelation suggests consistent human activity patterns

Task B: Backend Implementation

- Framework: Node.js + Express
- Database: PostgreSQL (TimescaleDB optimized)
- ORM: Prisma for schema and querying
- Endpoints:
  - 'GET /api/energy': Fetch readings by 'muid', time range, and aggregation
  - 'POST /api/ingest': Load JSON meter data into the database
- Swagger UI: Available at `/docs`

API Example

GET /api/energy?muid=95ce...\&start=2023-02-01\&end=2023-02-28\&interval=da

Task C: Deployment & Scalability

- Dockerized Setup:
  - 'docker-compose' for local development
  - Includes PostgreSQL, Node backend, NGINX
- Kubernetes (K8s):
  - Separate deployment files for app and DB
  - Ready for Helm migration or production clusters

   Multi-Tenancy Support
- tenant_id included in schema (extendable)
- Isolation via query scoping or DB schemas

---

Tech Stack

| Layer         | Technology              |
|--------------|--------------------------|
| Language      | JavaScript (Node.js)    |
| Web Framework | Express.js              |
| Database      | PostgreSQL + TimescaleDB|
| ORM           | Prisma                  |
| Container     | Docker, Docker Compose  |
| Orchestration | Kubernetes              |
| API Docs      | Swagger (OpenAPI)       |

---

API Documentation

Once the server is running, visit:


[http://localhost:3000/docs](http://localhost:3000/docs)

````

Swagger UI provides interactive documentation with request/response schemas, parameter descriptions, and live testing.

---

Setup Guide

 EC2 & Local Setup

Follow these steps on EC2 (or locally):

1. Clone Repo
```bash
git clone https://github.com/Dhorix/exnaton-challenge-demo.git
cd exnaton-challenge-demo
````

2. Install Node.js & Docker

```bash
# Node.js 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Docker
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER

# Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose
```

3. Start App

```bash
# Build and start containers
docker-compose up --build
```

App will be available at:
 http://localhost:3000

---

Kubernetes & Production Deployment

Apply K8s Resources

```bash
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/deployment.yaml
```

Expose Services

* Configure Ingress or LoadBalancer for external traffic
* Optional: add horizontal pod autoscaler

---

Performance Considerations

Bottlenecks:

* Time-series aggregation on large queries
* JSON parsing in ingestion
* Cross-tenant database access

Mitigation:

* TimescaleDB hypertables & indexes
* Caching frequent queries (e.g. Redis)
* Materialized views for daily/monthly aggregates

---

Status: Complete & Ready for Review

This challenge demonstrates practical skills across data engineering, backend architecture, DevOps, and system design — aligned with Exnaton's goals of building understandable and accessible energy systems.


```
