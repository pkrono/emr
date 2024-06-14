# Project Name

EMR system is a billing and inventory management

## Description
A ready-to-use EMR system is a billing and inventory management system with Node.js, Express, and PostgreSQL.

## Getting started
This project will run on **NodeJs** using **PostgreSQL** as database. Project is open for suggestions, Bug reports and pull requests.

### Prerequisites

- Node.js **v22+**
- PostgreSQL **14**

## How to install

### Using Git (recommended)

1.  Clone the project from github.

```sh
git clone https://github.com/pkrono/emr.git
cd emr
```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Set up your `.env` file:
    Create a `.env` file in the root directory of your project and add the following variables:

    ```plaintext
    DB_USER=your_db_user
    DB_HOST=your_db_host
    DB_NAME=your_db_name
    DB_PASSWORD=your_db_password
    DB_PORT=your_db_port

    PORT=your_server_port

    EMAIL_USER=your_email@example.com
    EMAIL_PASS=your_email_password
    REPLENISHMENT_EMAIL=replenishment_notification@example.com

    PrivateKey=your_jwt_private_key
    ```
4. create the table in `db.sql`

## Project structure

```sh
.
project-root/
├── app.js
├── config/
│   └── db.js
├── controllers/
│   ├── authController.js
│   ├── checkoutController.js
│   ├── drugController.js
│   └── userController.js
├── middleware/
│   └── auth.js
├── models/
│   ├── validation.js
│   └── userModel.js
├── routes/
│   ├── auth.js
│   ├── checkout.js
│   ├── drugs.js
│   └── users.js
├── services/
│   └── emailService.js
├── .env
├── package.json
└── package-lock.json

```

### Running the Application
1. Start the server:
    ```sh
    nodemon start
    ```
2. The server will be running on `http://localhost:<PORT>`.

### API Endpoints

#### Authentication
- `POST /api/auth` - Authenticate a user

#### Users
- `POST /api/users` - Register a new user

#### Drugs
- `GET /api/drugs` - Get all active drugs
- `GET /api/drugs/:id` - Get details of a specific drug
- `POST /api/drugs` - Add new drugs
- `PUT /api/drugs/:id` - Update drug information
- `DELETE /api/drugs/:id` - Delete a drug

#### Checkout
- `POST /api/checkout` - Process a checkout
