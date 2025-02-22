# DailyTodo: The Minimalist's To-Do List

Ever struggled with to-do lists because they were either too sophisticated and full of unnecessary features? Well, DailyTodo is perfect for you. With a simple task and deadline system, you don't have to worry about settings at all.

## Tech Stack

* Next.js (React)
* AWS DynamoDB (database for lists/tasks)
* Prisma with PostgreSQL (database for user/session/account/etc.)
* Auth.js (formerly NextAuth, for authentication using Google OAuth2)

## Installation

If you'd like to run DailyTodo locally, you'll need to:

1.  Clone the repository:
    ```bash
    git clone [your-repository-url]
    ```
2.  Set up your environment variables:
    * You'll need to configure your AWS DynamoDB credentials.
    * You'll also need to set up your PostgreSQL database connection string.
    * Finally, you'll need to obtain and configure your Google OAuth2 client ID and secret.
    * These are sensitive values. Make sure you do not commit them to your repository.
3.  Install dependencies:
    ```bash
    npm install
    ```
4.  Run the development server:
    ```bash
    npm run dev
    ```

**Note:** Due to the sensitive nature of database and authentication credentials, detailed setup instructions are omitted. You will need to configure these yourself.

## Usage Instructions

* Create, remove, and edit tasks and to-do lists.
* Filter between completed and pending tasks.
* Change your display name.

DailyTodo focuses on simplicity. You only need to input the task and deadline.

## Contributing

Feel free to clone, fork, and modify this project as you see fit. Contributions are welcome, but no specific guidelines are provided.

## License

This project is open for anyone to clone, fork, and use as they wish. No formal license is currently specified.
