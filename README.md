
# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/20bdbbb4-ca26-4344-975c-46262a24524b

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/20bdbbb4-ca26-4344-975c-46262a24524b) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## Running with Docker

If you prefer to use Docker for running the application, follow these steps:

```sh
# Step 1: Build and start the container using Docker Compose
docker-compose up -d

# Step 2: Access the application in your browser
# The application will be available at http://localhost:8080
```

To stop the container:

```sh
docker-compose down
```

### Docker-specific commands

```sh
# To rebuild the image after making changes
docker-compose build

# To view container logs
docker-compose logs -f

# To restart the container
docker-compose restart
```

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/20bdbbb4-ca26-4344-975c-46262a24524b) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes it is!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
