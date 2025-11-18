# docker_demo
This repository is created to demonstrate commonly used docker features

**01-module:** Contains information Virtual Machine and Container and compares them.

**02-module:** Describes Docker storage (volume) types (see Storage.md), outlines Docker networking and its drivers, explains CPU and memory limits, and demonstrates common Docker CLI commands using the Nginx image (see DockerImage.md).

**03-module:** Explains Dockerfile and demonstrates how to build a docker image for local projects.

**04-module:** Includes multiple projects (express_api, typescript_api, react_app), each with its own Dockerfile, and demonstrates how Docker is used with them.

**05-module:** Demonstrates a complete Express.js application integrated with a MongoDB database, highlighting the use of MongoDB authorization, environment variables (.env), and Docker-based automation. It presents two different solutions for automating the same deployment process: initially using shell scripts to create Docker volumes, networks, and containers manually, and later adopting a Docker Compose file for a more streamlined, declarative orchestration of services.