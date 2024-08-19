# Spaghetti Bytes

Spaghetti Bytes is a technical blog where I share articles on software engineering, data engineering, computer science, and related topics. Through this blog, I aim to provide bite-sized content that reflects my experiences and growth in the field of computing.

## Overview

The name "Spaghetti Bytes" is a play on words referring to "spaghetti code," a programming practice to avoid. This blog stands in opposition to such practices by offering well-structured content. The term "Bytes" evokes the world of computing, while "bites" refers to the small, digestible pieces of content found in the articles.

### Blog Purpose

- **Share Experiences and Knowledge**: Documenting my experiences in technology, the challenges faced, and the solutions applied.
- **Track Personal Progress**: Displaying my personal goals and tracking my progress in learning new technologies and concepts.
- **Engineering Practice**: Using the blog as a practical exercise to improve and apply my computer engineering skills.

## Technologies Used

- **Frontend**: React, Tailwind CSS, DaisyUI
- **Backend**: Express.js, Node.js
- **Database**: MongoDB (managed via Mongoose)
- **Deployment**: Vercel

## Project Structure

The project is divided into two main directories: `/client` for the frontend and `/server` for the backend.

### Client Structure

```bash
├── node_modules
├── package.json
├── package-lock.json
├── public
├── src
└── tailwind.config.js
```

#### `/src`

```bash
├── Api.js
├── App.js
├── Assets
├── Components
├── index.css
├── index.js
├── Pages
└── reportWebVitals.js
```

- **`/Assets`**: Contains all graphical assets and animations used in the application.
- **`/Components`**: Contains all the React components used across various pages and sections of the site.
- **`/Pages`**: Houses the main pages of the application.
- **`Api.js`**: Manages API calls from the frontend to the backend.
- **`tailwind.config.js`**: Contains the Tailwind CSS configuration used for styling the frontend.

### Server Structure

```bash
├── controllers
├── index.js
├── models
├── node_modules
├── package.json
├── package-lock.json
├── routes
└── server.js
```

- **`controllers`**: Contains the business logic for handling CRUD operations and other application-specific functionalities.
- **`models`**: Defines the data models used in the MongoDB database via Mongoose. The models include:
  - `Goal.js`: Model for managing personal goals.
  - `Story.js`: Model for managing blog posts (stories).
  - `User.js`: Model for managing users, used for authentication and access control.
- **`routes`**: Defines the API endpoints that the frontend uses to interact with the server.
- **`server.js`**: The main entry point of the server, responsible for handling HTTP requests.

## Frontend Features

The frontend application offers several main sections and features:

### Blog

This section displays the published stories. These stories can also be automatically shared on Medium.com.

### Goals

This section displays my personal goals and their progress. Users can view the steps taken towards each goal.

### Contacts

The contacts section allows users to send me messages via email. It uses `emailjs` for email management.

### Login

Only administrators can access this section to write, edit, or delete stories and goals.

## Frontend Components

### `/Pages`

- **`Blog.js`**: Main page for viewing stories.
- **`Contacts.js`**: Page for managing contacts and sending emails.
- **`GoalPublisher.js`**: Page for creating and publishing new goals.
- **`Goals.js`**: Page for viewing progress on goals.
- **`Home.js`**: Main homepage of the blog, provides an overview of the content.
- **`Login.js`**: Login page for administrator access.
- **`StoryManager.js`**: Page for managing existing stories.
- **`StoryPublisher.js`**: Page for creating and publishing new stories.
- **`StoryVisualizer.js`**: Page for detailed story viewing.
- **`TableGoals.js`**: Summary table of goals and their statuses.
- **`TableManager.js`**: Table for managing existing stories.

### `/Components`

- **`Footer.js`**: Footer component, present on all pages.
- **`Navbar.js`**: Main navigation bar, includes links to various sections of the site.
- **`StoryCard.js`**: Component for displaying story previews.
- **`StoryEditor.js`**: Editor for writing and editing stories.
- **`Wall.js`**: Component for displaying a "wall" of content, useful for a quick overview.

## Backend Features

The backend handles all necessary operations to support the frontend, including:

- **Story Management**: Creating, editing, deleting, and retrieving stories from the database.
- **Goal Management**: Creating, editing, deleting, and retrieving personal goals.
- **Authentication and Authorization**: Managing users and controlling access to the administrative section.
- **MongoDB Database Connection**: The backend uses Mongoose to interact with MongoDB, handling all CRUD operations.

## Installation Instructions

### Client Setup

1. Navigate to the `client` directory.

   ```bash
   cd client

2. Install dependencies

    ```bash
    npm install

### Server Setup

1. Navigate to the `server` directory.

    ```bash
    cd server

2. Install dependencies

    ```bash
    npm install

3. Start the server using Nodemon

    ```bash
    nodemon server.js

## Frontend Overview

The frontend of Spaghetti Bytes is built with React, Tailwind CSS, and DaisyUI. Below is an overview of the key pages and components:

### Pages

- **`Home.js`**: The landing page of the blog, providing an introduction and navigation to the other sections.
  
- **`Blog.js`**: Displays a list of all published stories. Users can read detailed articles on various software engineering and data engineering topics.

- **`Contacts.js`**: A contact form allowing visitors to reach out via email. This feature is powered by EmailJS.

- **`GoalPublisher.js`**: An admin-only page where new goals can be created and added to the goals section.

- **`Goals.js`**: Displays a list of personal goals, detailing their progress and completion status.

- **`Login.js`**: The login page for administrators. Only the site admin can access content management features.

- **`StoryManager.js`**: An admin-only page for managing existing stories, including editing or deleting them.

- **`StoryPublisher.js`**: An admin-only page used to create and publish new stories. There is an option to share stories directly on Medium.com.

- **`StoryVisualizer.js`**: Provides a detailed view of a single story when selected from the blog list.

- **`TableGoals.js`**: Admin page displaying all goals in a tabular format, allowing for management of goal progress.

- **`TableManager.js`**: Admin page displaying all published stories in a tabular format, providing an overview for management purposes.

### Components

- **`Footer.js`**: The footer component that appears at the bottom of every page, containing site information and navigation links.

- **`Navbar.js`**: The navigation bar component at the top of each page, providing easy access to different sections of the site.

- **`StoryCard.js`**: A card component used to display brief previews of stories on the blog page.

- **`StoryEditor.js`**: A rich-text editor component used in the `StoryPublisher.js` page to create and edit stories.

- **`Wall.js`**: A component that might be used for showcasing featured content or announcements on the home page.

## Backend Overview

The backend of Spaghetti Bytes is powered by Node.js, Express.js, and MongoDB. Below is a detailed breakdown of its structure:

### Models

- **`Goal.js`**: Defines the schema for storing personal goals. Each goal includes a title, description, steps for completion, and a timestamp for when it was created.

    ```javascript
    const goalSchema = new mongoose.Schema({
      title: { type: String, required: true },
      description: { type: String, required: true },
      steps: [stepSchema],
      createdAt: { type: Date, default: Date.now },
    });
    ```

- **`Story.js`**: Defines the schema for blog stories. Each story contains a title, summary, tags, the content itself, an option to mark it as shared on Medium, and a creation timestamp.

    ```javascript
    const storySchema = new mongoose.Schema({
      title: { type: String, required: true },
      summary: { type: String, required: true },
      tags: { type: [String], required: true },
      content: { type: Object, required: true },
      sharedOnMedium: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now },
    });
    ```

- **`User.js`**: Defines the schema for user accounts, including username, email, and a hashed password. This schema is used for authentication purposes.

    ```javascript
    const userSchema = new mongoose.Schema({
        username: {type: String, required: true},
        email: {type: String, required: true, unique: true},
        password: {type: String, required: true}
    });
    ```

### Controllers

The controllers in the backend handle the logic for processing requests and interacting with the database. Key controllers include:

- **`GoalController.js`**: Manages operations related to goals, including creating, retrieving, updating, and deleting goals.

- **`StoryController.js`**: Manages operations related to blog stories, including creating, retrieving, updating, and deleting stories.

- **`UserController.js`**: Handles user authentication, including login and registration functionalities.

### Routes

The routes in the backend connect the frontend API requests to the appropriate controller functions. The main routes include:

- **`/api/goals`**: Routes for managing goals.
- **`/api/stories`**: Routes for managing stories.
- **`/api/users`**: Routes for user authentication and management.

## Deployment

The project is deployed using Vercel, which simplifies the process of deploying both the frontend and backend. The `vercel.json` configuration file manages the deployment setup:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/server.js",
      "use": "@vercel/node"
    },
    {
      "src": "client/package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "build" }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/client/$1"
    }
  ]
}
```

## Contribution

This project is not intended to receive contributions, but I am open to discussions with anyone interested. If you would like to share feedback, ideas, or have a conversation about the content, feel free to reach out via the contact section on the blog.
