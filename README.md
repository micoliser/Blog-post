# Blog-post

# Blog-post

A simple blogging platform built with Node.js, Express, MongoDB, EJS, and Passport authentication (local, Google, Facebook).

## Features

- User authentication (local, Google, Facebook)
- Create, view, and delete blog posts
- Responsive, modern UI

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14+ recommended)
- [MongoDB](https://www.mongodb.com/try/download/community) (running locally or remotely)
- npm (comes with Node.js)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/micoliser/Blog-post.git
   cd Blog-post
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your environment variables:

   ```
   SECRET=your_session_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   FACEBOOK_APP_ID=your_facebook_app_id
   FACEBOOK_APP_SECRET=your_facebook_app_secret
   BASE_URL=http://localhost:3005
   ```

4. Start MongoDB (if running locally):

   ```bash
   mongod
   ```

5. Start the app:

   ```bash
   npm start
   ```

   or

   ```bash
   node app.js
   ```

6. Visit [http://localhost:3005](http://localhost:3005) in your browser.

## Deployment

For production deployment, use a process manager like PM2 and a reverse proxy like Nginx. See the documentation for details.

## Contributing

Contributions are welcome!  
**Contributor:** [micoliser](https://github.com/micoliser)

---

Feel free to open issues or submit pull requests.
