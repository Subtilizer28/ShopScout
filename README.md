
# ShopScout

ShopScout 🛍️✨ is your smart shopping assistant, finding the best products from Flipkart and Amazon! 🚀🤖 Enjoy personalized recommendations 🎯seamless shopping experience! 💖


## Table of Contents


* [Tech Stack](#tech-stack)
* [Home Screenshot](#home)
* [Features](#features)
* [Environment Variables](#environment-variables)
    + [Client Folder](#client-folder)
    + [Server Folder](#server-folder)
* [Prerequisites](#prerequisites)
* [Deployment](#deployment)
* [Collaborators](#collaborators)
## Tech Stack

![Tech Stack - ShopScout](https://github.com/Subtilizer28/ShopScout/blob/main/assets/TechStack.png?raw=true)


## Home

![App Screenshot](https://github.com/Subtilizer28/ShopScout/blob/main/assets/Screenshot%202024-11-24%20120726.png?raw=true)


## Features

- Product Comparison: Compare similar products across multiple categories, including detailed specifications and features.
- Product Suggestions: Get tailored product recommendations based on user preferences.
- Price History Tracking: Visualize price trends with interactive charts and analyze the best purchase timing.
- Wishlist Management: Add products to a wishlist and store data persistently using cookies.
- Cross-Platform Shopping: Access direct purchase links for products on Flipkart and Amazon.
- User-Friendly Interface: Enjoy a responsive design built with React.js and Material UI, optimized for all devices.
- Secure Storage: Manage wishlists securely with cookie-based storage, ensuring privacy.


## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

### Client Folder
Create a `.env` file in the **Client** folder and add the following variable:

```plaintext
VITE_BACKEND=<backend-url>
```
The URL of your backend server. Ensure it matches the server's address (e.g., http://localhost:5000 for local development or your hosted backend URL).

### Server Folder
Create a `.env` file in the **Server** folder and add the following variable:

```plaintext
API_KEY=<gemini-api-key>
FRONTEND=<frontend-url>
```
API_KEY: The API key for accessing the Gemini API. Replace <gemini-api-key> with the actual key provided by Gemini.

FRONTEND: The URL of your frontend application (e.g., http://localhost:3000 for local development or your hosted frontend URL).
## API Reference

#### Get Price History of Product

```http
  GET /api/phistory
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `product-url` | `string` | **Required**. The url of the product |

#### Compare two products

```http
  GET /api/compare
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `link1`      | `string` | **Required**. Product url of 1st item |
| `link2`      | `string` | **Required**. Product url of 2nd item |

#### Get Suggestions for Phone/Laptop

```http
  GET /api/(psuggest or lsuggest)
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `info`      | `string` | **Required**. Info of item (refer index.js) |




## Prerequisites
- [NodeJS](https://nodejs.org/api/documentation.html) - 18 and Above
- [Docker](https://docs.docker.com/build-cloud/)
## Run Locally

Clone the project

```bash
  git clone https://github.com/Subtilizer28/ShopScout.git
```

Go to the project directory

```bash
  cd Client
  cd Server
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  node index.js
```
or
```bash
  docker build ~/shopbuild -f Dockerfile -t shopscout
  docker run shopscout
```

Start the client
```bash
  npm run dev
```


## Deployment

Clone the project

```bash
  git clone https://github.com/Subtilizer28/ShopScout.git
```

Go to the project directory

```bash
  cd Client
  cd Server
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  node index.js
  -----or-----
  docker build ~/shopbuild -f Dockerfile -t shopscout
  docker run shopscout
```

Build the client
```bash
  npm run build
```

Run the client
```bash
  npm run preview
```
## Collaborators

<p>Special thank you for all people that contributed for this project.</p>

<table> 
    <tr>
        <td align="center"> 
            <a href="https://github.com/ArlinDsouza"> 
                <img src="https://avatars.githubusercontent.com/u/177207596?v=4" width="100px;" alt="Arlin Riya Dsouza Profile Picture"/>
                <br> 
                <sub> 
                    <b>Arlin Riya Dsouza</b>
                </sub> 
            </a> 
        </td>
        <td align="center"> 
            <a href="https://github.com/Subtilizer28"> 
                <img src="https://avatars.githubusercontent.com/u/68967455?v=4" width="100px;" alt="Ashton Prince Mathias Profile Picture"/>
                <br> 
                <sub> 
                    <b>Ashton Prince Mathias</b> 
                </sub> 
            </a> 
        </td> 
        <td align="center"> 
            <a href="https://github.com/AmanCutinha"> 
                <img src="https://avatars.githubusercontent.com/u/142223028?v=4" width="100px;" alt="Aman Marian Cutinha Profile Picture"/>
                <br> 
                <sub> 
                    <b>Aman Marian Cutinha</b> 
                </sub> 
            </a> 
        </td> 
    </tr> 
</table>

## Contributing

### Step 1: Fork the Repository
1. Visit the [ShopScout repository](https://github.com/Subtilizer28/ShopScout.git).
2. Click the **Fork** button in the top-right corner of the page to create a copy of the repository under your GitHub account.

### Step 2: Clone Your Forked Repository
1. Open your forked repository on GitHub, and click the **Code** button to copy the repository's HTTPS, SSH, or GitHub CLI link.
2. Open your terminal and clone the repository to your local system using:

   ```bash
   git clone <your-forked-repo-url>

