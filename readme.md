# Gmail Automation Backend

This is a Node.js/TypeScript backend application that automates the processing and handling of emails received in a Gmail inbox.


## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
- [Usage](#usage)
  - [Authentication](#authentication)
  - [Email Processing](#email-processing)
- [Customization](#customization)
  - [Automate Module](#automate-module)
  - [Gmail/Google Services](#gmail-google-services)
- [Error Handling](#error-handling)

## Overview
The Gmail Automation Backend is designed to provide a scalable and automated solution for managing email responses. It integrates with the Gmail API and utilizes OpenAI's GPT-3.5 to categorize incoming emails and generate appropriate responses. The application is built using Node.js, TypeScript, and Redis (via BullMQ) for queue management.

## Features
- Google OAuth 2.0 authentication
- Periodic email fetching and processing
- Automated email categorization using OpenAI's GPT-3.5
- Automated email response generation based on the email content and category
- Scalable email processing using a worker-based architecture

## Architecture
The backend application is composed of the following key components:

1. **index.ts**: The main entry point of the application, which sets up the Express server and handles the Google OAuth 2.0 flow.
2. **worker.ts**: Implements the email fetching and response sending processes using BullMQ workers.
3. **automate/automate.ts**: Contains the logic for email categorization and response generation using the OpenAI API.
4. **services**: Encapsulates the implementation of Gmail and Google OAuth 2.0 services.
5. **models**: Defines the data models used throughout the application.
6. **config** and **constants**: Manage configuration and constant values used in the application.


## Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- Redis server (for queue management)
- Google Cloud Platform account with Gmail API enabled
- OpenAI API key

### Installation
1. Clone the repository:

    ```
    https://github.com/shreyashkr17/ReachInBox-Assignment

2. Install dependencies:

    ```
    cd ReachInBox-Assignment
    npm install

### Configuration
1. Create a `.env` file in the root directory and add the following environment variables

    ```
    GOOGLE_CLIENT_ID=your-google-client-id
    GOOGLE_CLIENT_SECRET=your-google-client-secret
    GOOGLE_REDIRECT_URI=http://localhost:8080/auth/google/callback
    OPENAI_SECRECT_KEY=your-openai-api-key
    REDIS_PASSWORD=your-redis-password

2. Update the Redis connection details in the `config/config.ts` file if necessary.

## Usage

### Authentication
1. Start the application:

    ```
    npm start

2. Visit `http://localhost:5000/` in your browser to initiate the Google OAuth 2.0 flow.
3. After successful authentication, the application will display the user's information.

### Email Processing
The application automatically fetches and processes emails from the user's Gmail inbox every 5 minutes (this interval can be configured). The email processing workflow includes:
1. Fetching new emails from the Gmail inbox.
2. Categorizing the emails using OpenAI's GPT-3.5 model.
3. Generating appropriate responses based on the email category.
4. Sending the generated responses back to the original senders.

## Customization

### Automate Module
The `automate/automate.ts` file contains the logic for email categorization and response generation. You can customize the categorization rules and the response templates to fit your specific needs.

### Gmail/Google Services
The `services` folder contains the implementation of the Gmail and Google OAuth 2.0 services. You can extend or modify these services to add more functionality, such as handling different Gmail actions or integrating with other Google APIs.

## Error Handling
The application includes basic error handling, but you may want to add more robust error handling and logging mechanisms to handle various failure scenarios, such as:
- Google API authentication failures
- OpenAI API call errors
- Redis connection issues
- Email processing failures
