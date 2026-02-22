# Insurance API Server

A comprehensive Node.js API server for managing insurance data with MongoDB, featuring worker threads for file processing, CPU monitoring, and scheduled messaging.

## Features

✅ **File Upload & Processing**

- CSV/XLSX file upload using multipart/form-data
- Worker threads for CPU-efficient processing
- Automatic data extraction and MongoDB storage

✅ **Data Management**

- 6 MongoDB collections: Agent, User, Account, LOB, Carrier, Policy
- Structured relationships between collections
- Full CRUD operations

✅ **Policy APIs**

- Search policies by username
- Aggregated policy statistics by user
- Premium calculations and policy summaries

✅ **CPU Monitoring**

- Real-time CPU usage tracking
- Automatic server restart at 70% threshold
- 5-second monitoring intervals

✅ **Scheduled Messages**

- Schedule messages for specific day and time
- Automatic message processing
- Database persistence

## Prerequisites

- Node.js v16 or higher
- MongoDB v4.4 or higher
- npm or yarn

## Installation

```bash
cd server
npm install
```

## Configuration

Create a `.env` file in the server directory:

```env
MONGODB_URI=mongodb://localhost:27017/insurance_db
PORT=5000
NODE_ENV=development
```

## Running the Server

### Development Mode (with auto-reload)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

## API Endpoints

### 1. File Upload API

**Endpoint:** `POST /api/upload`

**Description:** Upload and process CSV/XLSX file with worker threads

**Request:**

```bash
curl -X POST -F "file=@data.csv" http://localhost:5000/api/upload
```

**Response:**

```json
{
  "success": true,
  "message": "File uploaded and processed successfully",
  "data": {
    "summary": {
      "agents": 5,
      "users": 42,
      "lobs": 8,
      "carriers": 12,
      "policies": 156,
      "totalRecords": 200
    }
  }
}
```

### 2. Search Policies by Username

**Endpoint:** `GET /api/policies/search?username=<firstname>`

**Description:** Find all policies for a specific user

**Request:**

```bash
curl http://localhost:5000/api/policies/search?username=John
```

**Response:**

```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "firstname": "John",
    "email": "john@example.com",
    "phone": "555-1234"
  },
  "policies": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "policy_number": "ABC123456",
      "policy_type": "Commercial Auto",
      "premium_amount": 1500,
      "company_name": "Nationwide",
      "category_name": "Commercial Auto",
      "start_date": "2023-01-01",
      "end_date": "2024-01-01"
    }
  ],
  "count": 5
}
```

### 3. Get Aggregated Policies

**Endpoint:** `GET /api/policies/aggregated`

**Description:** Get summarized policy information grouped by user

**Request:**

```bash
curl http://localhost:5000/api/policies/aggregated
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "firstname": "John Doe",
      "email": "john@example.com",
      "phone": "555-1234",
      "total_policies": 5,
      "total_premium": 7500,
      "policies": [
        {
          "policy_number": "ABC123456",
          "policy_type": "Commercial Auto",
          "premium_amount": 1500,
          "company_name": "Nationwide",
          "category_name": "Commercial Auto"
        }
      ]
    }
  ],
  "count": 42
}
```

### 4. Schedule a Message

**Endpoint:** `POST /api/messages/schedule`

**Description:** Schedule a message to be inserted into the database at a specific time

**Request:**

```bash
curl -X POST http://localhost:5000/api/messages/schedule \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Renewal reminder",
    "day": "Monday",
    "time": "14:30"
  }'
```

**Response:**

```json
{
  "success": true,
  "message": "Message scheduled successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "message": "Renewal reminder",
    "scheduled_day": "Monday",
    "scheduled_time": "14:30",
    "scheduled_date": "2024-02-26T14:30:00.000Z",
    "is_sent": false
  }
}
```

## Database Collections

### Agent

```javascript
{
  agent_name: String (unique, indexed),
  created_at: Date
}
```

### User

```javascript
{
  firstname: String (indexed),
  dob: Date,
  address: String,
  phone: String,
  state: String,
  zip: String,
  email: String (unique, indexed),
  gender: String,
  userType: String,
  created_at: Date
}
```

### UserAccount

```javascript
{
  account_name: String (indexed),
  account_type: String,
  user_id: ObjectId (ref: User),
  created_at: Date
}
```

### LOB (Line of Business)

```javascript
{
  category_name: String (unique, indexed),
  created_at: Date
}
```

### Carrier

```javascript
{
  company_name: String (unique, indexed),
  created_at: Date
}
```

### Policy

```javascript
{
  policy_number: String (unique, indexed),
  policy_start_date: Date,
  policy_end_date: Date,
  category_id: ObjectId (ref: LOB),
  company_id: ObjectId (ref: Carrier),
  user_id: ObjectId (ref: User, indexed),
  premium_amount: Number,
  policy_type: String,
  created_at: Date
}
```

### ScheduledMessage

```javascript
{
  message: String,
  scheduled_day: String,
  scheduled_time: String,
  scheduled_date: Date,
  is_sent: Boolean,
  sent_at: Date,
  created_at: Date
}
```

## Worker Threads

The file upload process uses Node.js worker threads to:

- Parse CSV/XLSX files in a separate thread
- Prevent blocking the main event loop
- Handle large datasets efficiently
- Return structured data for database insertion

Worker file: `src/workers/csvProcessor.js`

## CPU Monitoring

The server continuously monitors CPU usage:

- **Threshold:** 70%
- **Check Interval:** 5 seconds
- **Action:** Graceful shutdown when threshold exceeded

The monitoring can be configured in `src/server.js`:

```javascript
const cpuMonitor = new CPUMonitorService(70, 5000);
```

## Services

### FileUploadService

Handles CSV file processing with worker threads and database insertion.

### PolicyService

Provides methods to search and aggregate policy data.

### CPUMonitorService

Monitors CPU usage and triggers callbacks when threshold is exceeded.

### ScheduledMessageService

Manages scheduled message creation and processing.

## Project Structure

```
server/
├── src/
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API route handlers
│   ├── services/        # Business logic
│   ├── workers/         # Worker thread implementations
│   ├── middleware/      # Custom middleware
│   └── server.js        # Main application file
├── uploads/             # Uploaded files directory
├── package.json
├── .env
└── README.md
```

## Error Handling

All endpoints include comprehensive error handling with appropriate HTTP status codes:

- `400` - Bad Request
- `500` - Internal Server Error

## Production Recommendations

1. Use environment variables for sensitive data
2. Implement request validation middleware
3. Add authentication/authorization
4. Enable CORS if needed
5. Use connection pooling for MongoDB
6. Implement rate limiting
7. Add logging and monitoring
8. Use PM2 or similar for process management

## Troubleshooting

### MongoDB Connection Error

```
Ensure MongoDB is running: mongod
```

### Port Already in Use

```
Change PORT in .env or kill process using port 5000
```

### File Upload Errors

```
Check file format (CSV/XLSX only) and ensure uploads directory exists
```

### CPU Monitoring Too Sensitive

```
Adjust threshold in src/server.js line for CPUMonitorService initialization
```

## License

MIT
