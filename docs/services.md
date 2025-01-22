# Services Endpoints Documentation

This document provides detailed information about the `/api/services` endpoints, including their purposes, request structures, and expected responses.

## Base URL

`/api/services`

## Endpoints

### 1. **Get All Services**

- **Endpoint:** `GET /`
- **Description:** Fetches all value-added services provided by Safe Haven.
- **Headers:**
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
  - `ClientID: <Safe_Haven_Client_IBS_ID>`
- **Response:**
  - **200 OK:**
    ```json
    {
      "success": true,
      "message": "Services fetched successfully",
      "data": [
        {
          "id": "service1",
          "name": "Service One",
          "description": "Description of Service One"
        },
        {
          "id": "service2",
          "name": "Service Two",
          "description": "Description of Service Two"
        }
        // ... more services
      ]
    }
    ```
  - **500 Internal Server Error:**
    ```json
    {
      "success": false,
      "message": "Internal Server Error"
    }
    ```
- **Notes:**
  - Ensure that the `Authorization` header contains a valid Bearer token.
  - The `ClientID` should match the one provided by Safe Haven.

### 2. **Get Service by ID**

- **Endpoint:** `GET /:id`
- **Description:** Retrieves details of a specific service using its ID.
- **Parameters:**
  - `:id` (string) – The unique identifier of the service.
- **Headers:**
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
  - `ClientID: <Safe_Haven_Client_IBS_ID>`
- **Response:**
  - **200 OK:**
    ```json
    {
      "success": true,
      "message": "Service fetched successfully",
      "data": {
        "id": "service1",
        "name": "Service One",
        "description": "Detailed description of Service One",
        "categories": [
          {
            "id": "category1",
            "name": "Category One"
          },
          {
            "id": "category2",
            "name": "Category Two"
          }
          // ... more categories
        ]
      }
    }
    ```
  - **404 Not Found:**
    ```json
    {
      "success": false,
      "message": "Service not found"
    }
    ```
  - **500 Internal Server Error:**
    ```json
    {
      "success": false,
      "message": "Internal Server Error"
    }
    ```
- **Notes:**
  - The `:id` parameter should be a valid service ID.
  - Ensure that the `Authorization` header contains a valid Bearer token.

### 3. **Get Service Categories**

- **Endpoint:** `GET /:id/service-categories`
- **Description:** Fetches all categories associated with a specific service.
- **Parameters:**
  - `:id` (string) – The unique identifier of the service.
- **Headers:**
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
  - `ClientID: <Safe_Haven_Client_IBS_ID>`
- **Response:**
  - **200 OK:**
    ```json
    {
      "success": true,
      "message": "Service categories fetched successfully",
      "data": [
        {
          "id": "category1",
          "name": "Category One",
          "description": "Description of Category One"
        },
        {
          "id": "category2",
          "name": "Category Two",
          "description": "Description of Category Two"
        }
        // ... more categories
      ]
    }
    ```
  - **404 Not Found:**
    ```json
    {
      "success": false,
      "message": "Service not found"
    }
    ```
  - **500 Internal Server Error:**
    ```json
    {
      "success": false,
      "message": "Internal Server Error"
    }
    ```
- **Notes:**
  - The `:id` parameter should be a valid service ID.
  - Ensure that the `Authorization` header contains a valid Bearer token.

### 4. **Verify Entity**

- **Endpoint:** `POST /verify`
- **Description:** Verifies information for power, TV, or data services.
- **Headers:**
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
  - `ClientID: <Safe_Haven_Client_IBS_ID>`
- **Request Body:**
  ```json
  {
    "serviceCategoryId": "category1",
    "entityNumber": "1234567890"
  }
  ```
- **Response:**
  - **200 OK:**
    ```json
    {
      "success": true,
      "message": "Entity verification successful",
      "data": {
        "entityName": "John Doe",
        "serviceCategoryId": "category1",
        "entityNumber": "1234567890"
      }
    }
    ```
  - **400 Bad Request:**
    ```json
    {
      "success": false,
      "message": "Invalid request parameters"
    }
    ```
  - **500 Internal Server Error:**
    ```json
    {
      "success
    ```
