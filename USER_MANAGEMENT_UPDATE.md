# User Management Tab - Updates

## Changes Made

### ✅ Added Sub-Users
- Sub-users now appear in the User Management table
- Sub-users are mapped to their owner (parent user)
- Sub-users have a light blue background for easy identification

### ✅ Removed Columns
- ❌ Email column removed
- ❌ Created At column removed

### ✅ New Columns Added
- ✅ Owner ID - Shows the parent user ID for sub-users
- ✅ Owner Name - Shows the parent user's full name for sub-users

## Table Structure

| Column | Description | Example |
|--------|-------------|---------|
| ID | User or Sub-user ID | 123 |
| Full Name | User's full name | John Doe |
| Role | User role badge | patient / sub_user / practitioner |
| Owner ID | Parent user ID (for sub-users only) | 45 or — |
| Owner Name | Parent user name (for sub-users only) | Jane Smith or — |
| Status | Active/Inactive badge | Active |
| Actions | Toggle button | Activate / Deactivate |

## Visual Indicators

### User Types
- **Regular Users** - White background
- **Sub-Users** - Light blue background (bg-blue-50)

### Role Badges
- **Regular Users** - Default badge (blue)
- **Sub-Users** - Secondary badge (gray)

## API Changes

### Updated Endpoint
```
GET /api/admin/super/users
```

**Response Format:**
```json
{
  "status": "success",
  "data": {
    "users": [
      {
        "id": 1,
        "type": "user",
        "full_name": "John Doe",
        "role": "patient",
        "owner_id": null,
        "owner_name": null,
        "is_active": true
      },
      {
        "id": 10,
        "type": "sub_user",
        "full_name": "Jane Doe",
        "role": "sub_user",
        "owner_id": 1,
        "owner_name": "John Doe",
        "is_active": true
      }
    ]
  }
}
```

### New Endpoint
```
POST /api/admin/super/sub-users/{sub_user_id}/toggle
```

**Purpose:** Toggle sub-user active/inactive status

## How It Works

### Data Flow
1. Backend fetches all users from `users` table
2. For each user, backend fetches their sub-users from `sub_users` table
3. Sub-users are inserted right after their owner in the list
4. Frontend displays all users and sub-users in one table

### Owner Mapping
- Sub-users have `owner_user_id` field in database
- This maps to the parent user's ID
- Frontend displays both Owner ID and Owner Name for clarity

### Toggle Functionality
- **Regular Users:** Uses `/api/admin/super/users/{id}/toggle`
- **Sub-Users:** Uses `/api/admin/super/sub-users/{id}/toggle`
- Frontend automatically detects type and calls correct endpoint

## Example View

```
ID  | Full Name    | Role         | Owner ID | Owner Name   | Status   | Actions
----|--------------|--------------|----------|--------------|----------|----------
1   | John Doe     | patient      | —        | —            | Active   | Deactivate
10  | Jane Doe     | sub_user     | 1        | John Doe     | Active   | Deactivate  [Blue BG]
11  | Bob Doe      | sub_user     | 1        | John Doe     | Inactive | Activate    [Blue BG]
2   | Dr. Smith    | practitioner | —        | —            | Active   | Deactivate
3   | Admin User   | super_admin  | —        | —            | Active   | Deactivate
```

## Benefits

### ✅ Better Organization
- See parent-child relationships at a glance
- Sub-users grouped with their owners

### ✅ Cleaner Interface
- Removed unnecessary email column (privacy)
- Removed created_at column (not needed for management)

### ✅ Clear Ownership
- Owner ID and Name columns show relationships
- Easy to identify which sub-users belong to which user

### ✅ Visual Distinction
- Blue background makes sub-users stand out
- Role badges differentiate user types

## Testing

### Test Checklist
- [ ] Users display correctly
- [ ] Sub-users display with blue background
- [ ] Owner ID shows correct parent user ID
- [ ] Owner Name shows correct parent user name
- [ ] Regular users show "—" for owner fields
- [ ] Toggle works for users
- [ ] Toggle works for sub-users
- [ ] Status updates correctly after toggle

## Files Modified

### Backend
- `backend/app/routes/admin.py`
  - Updated `get_all_users_management()` to include sub-users
  - Added `toggle_sub_user_status()` endpoint

### Frontend
- `frontend/client/pages/SuperAdminDashboard.tsx`
  - Updated UserRow interface
  - Updated table columns
  - Added blue background for sub-users
  - Updated toggle function to handle both types

## Summary

The User Management tab now provides a comprehensive view of all users and their sub-users in a single table, with clear ownership mapping and visual distinction between user types. Email and created_at columns have been removed for a cleaner, more focused interface.
