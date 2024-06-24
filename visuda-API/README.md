# Login Auth with JWT

## Features

- Register
- Login
- Get New Acces Token
- Logout


## Tech

This server is built using:

- [Express.JS](https://expressjs.com/) - A framework of nodeJS that is used to create a server!
- [Visual Studio Code](https://code.visualstudio.com/) - Awesome text editor
- [Node .js](https://nodejs.org/) - Evented I/O for the backend
- [Mysql](https://www.mysql.com/) - Storage data
- [XAMPP](https://www.apachefriends.org/index.html) - Console for database
- [Knex](https://knexjs.org/) - Query builder
- [JWT](https://jwt.io/) - Token authentication
- [Bcrypt](https://www.npmjs.com/package/bcrypt) - For hashing and encrypted data


## Installation

login-auth requires [Node.js](https://nodejs.org/) v18+ to run.

1. Install the dependencies and devDependencies and start the server.

```sh
cd user-auth-jwt
npm install
```

2. Change the atribute at file .env by following this:

| Properti | value |
| ------ | ------ |
| PORT | 8080 |
| DB_PORT | (customize with your database client port) |
| DB_CLIENT | (customize with your database client) |
| DB_HOST | (if you want to run on local then you can use localhost or adjust to the host you want to use.) |
| DB_USERNAME | (your database username) |
| DB_PASSWORD | (your database password) |
| DB_DATABASE | (your database name) |
| ACCES_TOKEN_KEY | (your secret key for access token) |
| REFRESH_TOKEN_KEY | (your secret key for refresh token) |

3. Open XAMPP console and then start Apache and MySql.
4. Open MySql admin and login to your MySql account (default login can enter username:'root' & password:'Just leave it blank')
5. Create a database with the same name in the .env file earlier.
6. Enter the SQL column and enter the query in the db.sql file then run it by clicking “go”.
7. Run the server
```sh
npm run dev 
```
## Login Auth Testing
- Postman collection [here](https://elements.getpostman.com/redirect?entityId=24348936-6656032c-9d34-4955-b9de-5b5c553a4658&entityType=collection)

