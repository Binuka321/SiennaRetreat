# Room Booking Feature - Implementation Guide

## Overview
The room booking system now includes:
1. **Availability search** - Check which rooms are available for specific check-in/check-out dates
2. **Real-time availability status** - Display "Available" / "Not Available" on search results
3. **Booking form** - Collect user details (name, email, phone, guests, special requests)
4. **Booking management** - Store bookings in database with status tracking (pending, confirmed, cancelled)

## Database Changes

### New Model: `Booking` (`src/models/Booking.js`)
Stores all room reservations with:
- **roomId** - Reference to the Room being booked
- **User details** - userName, userEmail, userPhone
- **Dates** - checkInDate, checkOutDate
- **Room info** - roomType, roomTitle, roomPrice (captured at booking time)
- **Status** - pending, confirmed, or cancelled
- **numberOfGuests** - How many people
- **specialRequests** - Optional guest preferences

## API Endpoints

### 1. Search Available Rooms
**Endpoint:** `GET /api/rooms/search`

**Query Parameters:**
- `checkInDate` (required) - ISO date string (e.g., "2025-05-18")
- `checkOutDate` (required) - ISO date string (e.g., "2025-05-19")
- `roomType` (optional) - Filter by room type

**Response:**
```json
[
  {
    "_id": "room_id_123",
    "type": "double",
    "title": "Double Room with Garden View",
    "price": "$ 15/night",
    "details": "12 m² | 1-3 guests | Free WIFI",
    "isAvailable": true
  },
  {
    "_id": "room_id_456",
    "type": "shared",
    "title": "Family Room with Shared Bathroom",
    "price": "$ 15/night",
    "details": "12 m² | 1-3 guests | Free WIFI",
    "isAvailable": false
  }
]
```

### 2. Create a Booking
**Endpoint:** `POST /api/rooms/book`

**Request Body:**
```json
{
  "roomId": "room_id_123",
  "userName": "John Doe",
  "userEmail": "john@example.com",
  "userPhone": "+1234567890",
  "checkInDate": "2025-05-18",
  "checkOutDate": "2025-05-19",
  "numberOfGuests": 2,
  "specialRequests": "Late check-in preferred"
}
```

**Response (Success - 201):**
```json
{
  "message": "Booking confirmed successfully",
  "booking": {
    "_id": "booking_id_789",
    "roomId": "room_id_123",
    "userEmail": "john@example.com",
    "userName": "John Doe",
    "userPhone": "+1234567890",
    "checkInDate": "2025-05-18T00:00:00.000Z",
    "checkOutDate": "2025-05-19T00:00:00.000Z",
    "roomType": "double",
    "status": "confirmed",
    "numberOfGuests": 2,
    "createdAt": "2025-11-26T16:20:50.000Z"
  }
}
```

**Response (Error - 409):**
```json
{
  "message": "Room is not available for the selected dates"
}
```

### 3. Get All Bookings (Admin)
**Endpoint:** `GET /api/bookings`

**Response:**
```json
[
  {
    "_id": "booking_id_789",
    "roomId": { /* full room object */ },
    "userEmail": "john@example.com",
    "status": "confirmed",
    ...
  }
]
```

### 4. Cancel a Booking
**Endpoint:** `PUT /api/rooms/:id/cancel`

**Response:**
```json
{
  "message": "Booking cancelled successfully",
  "booking": { /* booking object with status: "cancelled" */ }
}
```

## Frontend Changes

### Updated Component: `Rooms.tsx`

**New State Variables:**
- `searchResults` - Rooms returned from search API
- `showSearchResults` - Toggle to show/hide search results
- `isLoading` - Show loading state during API calls
- `showBookingForm` - Toggle booking form modal
- `selectedRoom` - Currently selected room for booking
- `bookingData` - Form data (name, email, phone, guests, requests)
- `bookingMessage` - Success confirmation message
- `bookingError` - Error messages

**New Functions:**
1. `performSearch()` - Calls `/api/rooms/search` with selected dates and room types
2. `handleBookNow(room)` - Opens booking form for a specific room
3. `handleBookingInputChange()` - Updates booking form fields
4. `submitBooking()` - Submits booking to `/api/rooms/book`

**New UI Elements:**
1. **Search Results Section** - Displays available rooms grid with:
   - Room image, title, price, details
   - Green "✓ Available" or red "✗ Not Available" badge
   - "Book Now" button (enabled only if available)
2. **Booking Form Modal** - Collects:
   - Full name (pre-filled with Google login name)
   - Email (pre-filled, disabled)
   - Phone number (required)
   - Number of guests (1-5 selector)
   - Special requests (optional textarea)
3. **Success/Error Messages** - Alert boxes for feedback

**Flow:**
1. User selects dates, room count, and room types
2. Clicks "Search" button
3. Frontend calls `GET /api/rooms/search` with query params
4. Results show rooms with availability status
5. User clicks "Book Now" on available room
6. Booking form modal opens with pre-filled user info
7. User fills in phone and any special requests
8. Clicks "Confirm Booking"
9. Frontend calls `POST /api/rooms/book` with booking data
10. On success: Shows confirmation message with booking ID
11. On failure: Shows error message (e.g., room became unavailable)

## Availability Logic

**How Availability is Determined:**

A room is **NOT available** if there's a confirmed booking where:
- `existingBooking.checkInDate < requestedCheckOut` AND
- `existingBooking.checkOutDate > requestedCheckIn`

In other words: if any existing booking overlaps with the requested date range.

**Example:**
- Existing booking: May 18-20
- Request 1 (May 17-18): ✓ Available (no overlap)
- Request 2 (May 18-19): ✗ Not available (overlap)
- Request 3 (May 20-21): ✓ Available (no overlap, starts after checkout)
- Request 4 (May 19-22): ✗ Not available (overlap)

## Testing

### Manual Testing Steps

1. **Start Backend:**
   ```bash
   cd sienna-backend
   npm run dev
   ```

2. **Start Frontend:**
   ```bash
   cd src
   npm run dev
   ```

3. **Test Search:**
   - Log in with Google
   - Select check-in/check-out dates
   - Click "Search"
   - Should see rooms with availability status

4. **Test Booking:**
   - Click "Book Now" on an available room
   - Booking form modal should open
   - Fill in phone number
   - Click "Confirm Booking"
   - Should see success message with booking ID

5. **Test Overlap Prevention:**
   - Book a room for May 18-20
   - Try to book same room for May 19-21
   - Should get "Room is not available" error

### API Testing (cURL)

**Search rooms:**
```bash
curl "http://localhost:5000/api/rooms/search?checkInDate=2025-05-18&checkOutDate=2025-05-19"
```

**Create booking:**
```bash
curl -X POST http://localhost:5000/api/rooms/book \
  -H "Content-Type: application/json" \
  -d '{
    "roomId": "ROOM_ID_HERE",
    "userName": "John Doe",
    "userEmail": "john@example.com",
    "userPhone": "+1234567890",
    "checkInDate": "2025-05-18",
    "checkOutDate": "2025-05-19",
    "numberOfGuests": 2,
    "specialRequests": "Late check-in"
  }'
```

## File Changes Summary

### Backend:
- ✅ **Created:** `src/models/Booking.js` - New Booking model
- ✅ **Updated:** `src/controllers/roomsController.js` - Added search, book, and booking management methods
- ✅ **Updated:** `src/routes/rooms.js` - Added new route endpoints

### Frontend:
- ✅ **Updated:** `src/assets/Components/Rooms.tsx` - Complete rewrite with search, availability, and booking

## Future Enhancements

1. **Email Confirmation** - Send confirmation email to users after booking
2. **Admin Dashboard** - View, manage, and cancel bookings
3. **Payment Integration** - Accept payments during booking
4. **Calendar View** - Visual calendar showing available/booked dates
5. **Notifications** - Remind users about upcoming check-ins
6. **Reviews** - Let guests rate rooms after stay
7. **Multi-room Booking** - Allow booking multiple rooms in one transaction
8. **Discounts/Promo Codes** - Apply discounts during booking

## Troubleshooting

**Issue: "Room is not available" appears for all rooms even though they should be available**
- Check MongoDB connection is working
- Verify Booking collection exists and has correct data
- Check date format matches ISO format (YYYY-MM-DD)

**Issue: Booking form doesn't appear after clicking "Book Now"**
- Check browser console for JavaScript errors
- Ensure user is logged in with Google
- Verify room has `isAvailable: true` in search results

**Issue: Search results not showing**
- Verify backend is running on localhost:5000
- Check browser network tab for API response
- Ensure CORS is enabled (should be, with express.cors())

**Issue: Booking succeeds but room still shows as available**
- Check MongoDB has the new Booking document
- Refresh the page to see updated availability
- Check that booking status is "confirmed" (not "pending" or "cancelled")
