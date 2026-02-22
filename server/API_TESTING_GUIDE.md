# API Testing Guide - cURL & Postman Examples

## Quick Reference

### Base URL

```
http://localhost:5000
```

### Health Check

```bash
curl http://localhost:5000/health
```

---

## Test 1: Upload CSV File

### Using cURL

**From data directory:**

```bash
cd d:\InsuredMine

curl -X POST \
  -F "file=@data-sheet - Node js Assesment (2) (1).csv" \
  http://localhost:5000/api/upload
```

**Expected Response (200 OK):**

```json
{
  "success": true,
  "message": "File uploaded and processed successfully",
  "data": {
    "summary": {
      "agents": 1,
      "users": 1200,
      "lobs": 8,
      "carriers": 15,
      "policies": 1200,
      "totalRecords": 1200
    }
  }
}
```

### Using Postman

1. Method: **POST**
2. URL: `http://localhost:5000/api/upload`
3. Body: Click **form-data**
4. Add field: `file` (type: **File**)
5. Select your CSV file
6. Click **Send**

---

## Test 2: Search Policies by Username

### Using cURL

**Search for "Lura":**

```bash
curl "http://localhost:5000/api/policies/search?username=Lura"
```

**Search for "Alex":**

```bash
curl "http://localhost:5000/api/policies/search?username=Alex"
```

**Search for "Seth":**

```bash
curl "http://localhost:5000/api/policies/search?username=Seth"
```

**Pretty print with jq:**

```bash
curl -s "http://localhost:5000/api/policies/search?username=Lura" | jq .
```

**Expected Response (200 OK):**

```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "firstname": "Lura Lucca",
    "email": "madler@yahoo.ca",
    "phone": "8677356559"
  },
  "policies": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "policy_number": "YEEX9MOIBU7X",
      "policy_type": "Single",
      "premium_amount": 1180.83,
      "company_name": "Integon Gen Ins Corp",
      "category_name": "Commercial Auto",
      "start_date": "2018-11-02T00:00:00.000Z",
      "end_date": "2019-11-02T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

### Using Postman

1. Method: **GET**
2. URL: `http://localhost:5000/api/policies/search`
3. Params: `username` = `Lura`
4. Click **Send**

### Using JavaScript/Node.js

```javascript
const username = "Lura";
fetch(`http://localhost:5000/api/policies/search?username=${username}`)
  .then((res) => res.json())
  .then((data) => console.log(JSON.stringify(data, null, 2)));
```

---

## Test 3: Get Aggregated Policies

### Using cURL

**Get all aggregated data:**

```bash
curl http://localhost:5000/api/policies/aggregated
```

**Pretty print all data:**

```bash
curl -s http://localhost:5000/api/policies/aggregated | jq .
```

**Get first 3 users:**

```bash
curl -s http://localhost:5000/api/policies/aggregated | jq '.data[0:3]'
```

**Get specific user by index:**

```bash
curl -s http://localhost:5000/api/policies/aggregated | jq '.data[0]'
```

**Get top 5 by premium:**

```bash
curl -s http://localhost:5000/api/policies/aggregated | jq '.data | sort_by(.total_premium) | reverse | .[0:5]'
```

**Get count of users:**

```bash
curl -s http://localhost:5000/api/policies/aggregated | jq '.count'
```

**Expected Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "firstname": "Seth Norred",
      "email": "library@msn.com",
      "phone": "2424171702",
      "total_policies": 2,
      "total_premium": 13503.2,
      "policies": [
        {
          "policy_number": "ALAYNA MEEKINS",
          "policy_type": "Single",
          "premium_amount": 9013.42,
          "company_name": "Nationwide Mut Fire Ins Co_Copy",
          "category_name": "Commercial Auto"
        }
      ]
    }
  ],
  "count": 1200
}
```

### Using Postman

1. Method: **GET**
2. URL: `http://localhost:5000/api/policies/aggregated`
3. Click **Send**

### Using JavaScript/Node.js

```javascript
// Get all aggregated policies
fetch("http://localhost:5000/api/policies/aggregated")
  .then((res) => res.json())
  .then((data) => {
    console.log(`Total users: ${data.count}`);
    console.log("Top 5 by premium:");
    data.data.slice(0, 5).forEach((user) => {
      console.log(
        `${user.firstname}: ${user.total_policies} policies, $${user.total_premium.toFixed(2)}`,
      );
    });
  });
```

---

## Test 4: Schedule a Message

### Using cURL

**Schedule message for Monday at 10:00:**

```bash
curl -X POST http://localhost:5000/api/messages/schedule \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Policy renewal reminder",
    "day": "Monday",
    "time": "10:00"
  }'
```

**Schedule message for Friday at 14:30:**

```bash
curl -X POST http://localhost:5000/api/messages/schedule \
  -H "Content-Type: application/json" \
  -d '{
    "message": "End of week summary report",
    "day": "Friday",
    "time": "14:30"
  }'
```

**Schedule message for Sunday at 23:59:**

```bash
curl -X POST http://localhost:5000/api/messages/schedule \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Week reset notification",
    "day": "Sunday",
    "time": "23:59"
  }'
```

**Pretty print response:**

```bash
curl -s -X POST http://localhost:5000/api/messages/schedule \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Test message",
    "day": "Tuesday",
    "time": "09:00"
  }' | jq .
```

**Expected Response (200 OK):**

```json
{
  "success": true,
  "message": "Message scheduled successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "message": "Policy renewal reminder",
    "scheduled_day": "Monday",
    "scheduled_time": "10:00",
    "scheduled_date": "2024-02-26T10:00:00.000Z",
    "is_sent": false,
    "created_at": "2024-02-20T10:15:00.000Z"
  }
}
```

### Using Postman

1. Method: **POST**
2. URL: `http://localhost:5000/api/messages/schedule`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):

```json
{
  "message": "Policy renewal reminder",
  "day": "Monday",
  "time": "10:00"
}
```

5. Click **Send**

### Using JavaScript/Node.js

```javascript
const scheduleMessage = async (message, day, time) => {
  const response = await fetch("http://localhost:5000/api/messages/schedule", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, day, time }),
  });
  const data = await response.json();
  console.log(data);
};

// Schedule message
scheduleMessage("Renewal reminder", "Monday", "10:00");
```

### Valid Day Values

- Monday
- Tuesday
- Wednesday
- Thursday
- Friday
- Saturday
- Sunday

(Case-insensitive: "monday", "MONDAY", "Monday" all work)

### Valid Time Format

- 24-hour format: HH:MM
- Examples:
  - "09:00" (9 AM)
  - "14:30" (2:30 PM)
  - "23:59" (11:59 PM)
  - "00:00" (midnight)

---

## Error Testing

### Missing Required Parameters

**Test 1: Missing username in search**

```bash
curl "http://localhost:5000/api/policies/search"
```

Expected: 400 Bad Request

**Test 2: Missing message in schedule**

```bash
curl -X POST http://localhost:5000/api/messages/schedule \
  -H "Content-Type: application/json" \
  -d '{"day": "Monday", "time": "10:00"}'
```

Expected: 400 Bad Request

**Test 3: Missing file in upload**

```bash
curl -X POST http://localhost:5000/api/upload
```

Expected: 400 Bad Request

### Invalid Data

**Test 4: Invalid day name**

```bash
curl -X POST http://localhost:5000/api/messages/schedule \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Test",
    "day": "InvalidDay",
    "time": "10:00"
  }'
```

Expected: 500 Error

**Test 5: Invalid time format**

```bash
curl -X POST http://localhost:5000/api/messages/schedule \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Test",
    "day": "Monday",
    "time": "25:99"
  }'
```

Expected: 500 Error

---

## Advanced Testing

### Batch Upload Multiple Files

```bash
# Create test CSV files
for i in {1..3}; do
  cp data-sheet.csv test_$i.csv
done

# Upload all
for file in test_*.csv; do
  curl -X POST -F "file=@$file" http://localhost:5000/api/upload
done
```

### Load Testing with Apache Bench

```bash
# Install: apt-get install apache2-utils

# Test API performance
ab -n 100 -c 10 "http://localhost:5000/api/policies/aggregated"

# Test search endpoint
ab -n 100 -c 10 "http://localhost:5000/api/policies/search?username=Lura"

# Results show:
# - Requests per second
# - Time per request
# - Response times
```

### Monitoring CPU Usage

```bash
# In one terminal - create CPU load
node -e "setInterval(() => {for(let i=0; i<1e9; i++);}, 100);"

# In another terminal - watch server logs
# You should see CPU usage increase and server restart at 70%
```

### Scheduled Message Testing

```bash
# Schedule message for next minute
NOW=$(date +%H:%M)
NEXT_MIN=$(($(date +%M) + 1))
DAY=$(date +%A)

curl -X POST http://localhost:5000/api/messages/schedule \
  -H "Content-Type: application/json" \
  -d "{
    \"message\": \"Test message\",
    \"day\": \"$DAY\",
    \"time\": \"$(date +%H):$NEXT_MIN\"
  }"

# Watch server logs - message should be marked as sent within 60 seconds
```

---

## Postman Collection JSON

Save this as `insurance-api.postman_collection.json`:

```json
{
  "info": {
    "name": "Insurance API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "url": "http://localhost:5000/health"
      }
    },
    {
      "name": "Upload CSV",
      "request": {
        "method": "POST",
        "url": "http://localhost:5000/api/upload"
      }
    },
    {
      "name": "Search Policies",
      "request": {
        "method": "GET",
        "url": {
          "raw": "http://localhost:5000/api/policies/search?username=Lura",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "policies", "search"],
          "query": [{ "key": "username", "value": "Lura" }]
        }
      }
    },
    {
      "name": "Aggregated Policies",
      "request": {
        "method": "GET",
        "url": "http://localhost:5000/api/policies/aggregated"
      }
    },
    {
      "name": "Schedule Message",
      "request": {
        "method": "POST",
        "header": [{ "key": "Content-Type", "value": "application/json" }],
        "body": {
          "mode": "raw",
          "raw": "{\"message\":\"Policy renewal\",\"day\":\"Monday\",\"time\":\"10:00\"}"
        },
        "url": "http://localhost:5000/api/messages/schedule"
      }
    }
  ]
}
```

Import into Postman: `File → Import → Paste Raw Text`

---

## Response Status Codes

| Code | Meaning               | Scenario                   |
| ---- | --------------------- | -------------------------- |
| 200  | OK                    | Request successful         |
| 400  | Bad Request           | Missing/invalid parameters |
| 500  | Internal Server Error | Database/processing error  |

---

## Tips & Tricks

### 1. Save responses to file

```bash
curl http://localhost:5000/api/policies/aggregated > aggregated.json
```

### 2. Pretty print responses

```bash
curl -s http://localhost:5000/api/policies/aggregated | jq .
```

### 3. Filter JSON results

```bash
# Get all user emails
curl -s http://localhost:5000/api/policies/aggregated | jq '.data[].email'

# Get total premiums
curl -s http://localhost:5000/api/policies/aggregated | jq '.data[].total_premium'

# Get high-premium users (>10000)
curl -s http://localhost:5000/api/policies/aggregated | jq '.data[] | select(.total_premium > 10000)'
```

### 4. Measure response time

```bash
time curl http://localhost:5000/api/policies/aggregated > /dev/null
```

### 5. Test with different usernames

```bash
for user in "Lura" "Alex" "Seth" "John"; do
  echo "=== Searching for $user ==="
  curl -s "http://localhost:5000/api/policies/search?username=$user" | jq '.count'
done
```

---

## Troubleshooting API Calls

### Server not responding

```bash
# Check if server is running
curl http://localhost:5000/health
# Expected: {"status":"ok","timestamp":"..."}
```

### Connection refused

```bash
# Server not running on port 5000
# Start server: npm start
```

### Unexpected response

```bash
# Check server logs in terminal
# Look for error messages or exceptions
```

### Database errors

```bash
# Check MongoDB connection
# Verify MONGODB_URI in .env
# Ensure MongoDB is running: mongod
```

---

**All tests can be run immediately after server startup!** 🚀
