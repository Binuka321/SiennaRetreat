const http = require('http');

// Test 1: GET all rooms
console.log('Testing GET /api/rooms...');
http.get('http://localhost:5000/api/rooms', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log(`✅ GET /api/rooms: ${res.statusCode}`);
    console.log('Response:', data.slice(0, 100) + '...');
  });
}).on('error', (err) => {
  console.log('❌ GET /api/rooms failed:', err.message);
});

// Test 2: GET search endpoint (after 1 second delay)
setTimeout(() => {
  console.log('\nTesting GET /api/rooms/search?checkInDate=2025-05-18&checkOutDate=2025-05-19...');
  http.get('http://localhost:5000/api/rooms/search?checkInDate=2025-05-18&checkOutDate=2025-05-19', (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      console.log(`✅ GET /api/rooms/search: ${res.statusCode}`);
      console.log('Response:', data.slice(0, 100) + '...');
    });
  }).on('error', (err) => {
    console.log('❌ GET /api/rooms/search failed:', err.message);
  });
}, 1000);

// Test 3: POST booking endpoint (after 2 second delay)
setTimeout(() => {
  console.log('\nTesting POST /api/rooms/book...');
  const postData = JSON.stringify({
    roomId: "invalid_id",
    userName: "Test User",
    userEmail: "test@example.com",
    userPhone: "+1234567890",
    checkInDate: "2025-05-18",
    checkOutDate: "2025-05-19",
    numberOfGuests: 1
  });

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/rooms/book',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': postData.length
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      console.log(`✅ POST /api/rooms/book: ${res.statusCode}`);
      console.log('Response:', data.slice(0, 100) + '...');
      console.log('\n✓ All endpoint tests completed!');
    });
  }).on('error', (err) => {
    console.log('❌ POST /api/rooms/book failed:', err.message);
  });

  req.write(postData);
  req.end();
}, 2000);
