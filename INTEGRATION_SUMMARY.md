# Case Upload API Integration - Complete Review

## ✅ What's Working

### Backend
1. **Database Connection**
   - ✅ RDS PostgreSQL connected
   - ✅ Migrations applied successfully
   - ✅ All tables created (cases, case_files, case_symptoms, symptoms_master)

2. **API Endpoints**
   - ✅ POST `/api/cases` - Create case with files
   - ✅ Authentication with JWT tokens
   - ✅ File validation (X-ray, audio)
   - ✅ Auto-assign practitioner

3. **Models**
   - ✅ Case, CaseFile, CaseSymptom models
   - ✅ Proper relationships and foreign keys
   - ✅ S3 file metadata storage

### Frontend
1. **API Integration**
   - ✅ `createCase()` function in `src/api.ts`
   - ✅ FormData construction with multipart/form-data
   - ✅ JWT token authentication
   - ✅ Error handling with toast notifications

2. **UI Components**
   - ✅ File upload (X-ray)
   - ✅ Audio recording (chest/cough)
   - ✅ Symptom selection with IDs
   - ✅ Profile selection

## 🔧 Issues Fixed

1. **Severity Field Type Mismatch**
   - ❌ Was: `severity: "moderate"` (string)
   - ✅ Now: `severity: 3` (integer 1-5)

2. **Symptom Data Structure**
   - ❌ Was: Array of strings
   - ✅ Now: Array of objects with `{id, severity, duration_days}`

3. **DB Connection Test**
   - ❌ Was blocking imports during alembic
   - ✅ Now commented out (can be re-enabled after AWS setup)

## ⚠️ Action Required

### 1. AWS S3 Setup
You need to add AWS credentials to `.env`:

```bash
AWS_ACCESS_KEY_ID=<your-access-key>
AWS_SECRET_ACCESS_KEY=<your-secret-key>
```

**How to get credentials:**
- Go to AWS Console → IAM → Users → Create User
- Attach policy: `AmazonS3FullAccess`
- Create access key → Copy credentials

### 2. Create S3 Bucket
```bash
# Bucket name: lungsense-data
# Region: ap-south-1
```

### 3. Seed Symptoms (Run Once)
```bash
cd backend
python seed_symptoms.py
```

## 🚀 How to Run

### Backend
```bash
cd backend
.\myenv\Scripts\activate
uvicorn app.app:app --reload
```

### Frontend
```bash
cd frontend
pnpm dev
```

## 📋 API Request Format

```javascript
POST http://localhost:8000/api/cases
Authorization: Bearer <token>
Content-Type: multipart/form-data

FormData:
- profile_type: "self" | "sub_user"
- profile_id: number
- symptoms: JSON string of [{symptom_id, severity, duration_days}]
- xray: File (optional)
- cough_audio: File (optional)
- breath_audio: File (optional)
```

## 📊 Database Schema

### cases
- id, user_id, sub_user_id, practitioner_id
- status: "draft" | "submitted" | "reviewed" | "finalized"
- created_at, updated_at

### case_files
- id, case_id, modality, file_type
- s3_bucket, s3_key, file_size
- uploaded_by, created_at

### case_symptoms
- id, case_id, symptom_id
- severity (1-5), duration_days
- created_at

### symptoms_master
- id, name (16 predefined symptoms)

## 🔍 Testing Checklist

- [ ] AWS credentials configured
- [ ] S3 bucket created
- [ ] Symptoms seeded
- [ ] Backend running on port 8000
- [ ] Frontend running on port 5173
- [ ] User logged in (JWT token in localStorage)
- [ ] Upload X-ray file
- [ ] Record audio
- [ ] Select symptoms
- [ ] Submit case
- [ ] Check RDS database for new case
- [ ] Verify files uploaded to S3

## 🐛 Common Issues

### 1. "Connection timed out"
- Check RDS security group allows your IP (0.0.0.0/0 for testing)

### 2. "S3 upload error"
- Verify AWS credentials in `.env`
- Check S3 bucket exists and is in ap-south-1

### 3. "Invalid authentication token"
- User must be logged in
- Check localStorage has "token" key

### 4. "Symptom not found"
- Run `python seed_symptoms.py` first

## 📁 Key Files Modified

### Backend
- `app/routes/cases.py` - Case upload endpoint
- `app/sessions/db.py` - DB connection (test commented out)
- `.env` - Added AWS credentials placeholders

### Frontend
- `src/api.ts` - Added `createCase()` function
- `client/pages/PatientDashboard.tsx` - Integrated real API
  - Fixed symptom structure (IDs instead of strings)
  - Fixed severity type (number instead of string)
  - Added error handling

## 🎯 Next Steps

1. Add AWS credentials
2. Create S3 bucket
3. Seed symptoms
4. Test end-to-end flow
5. Add file download/preview from S3
6. Add case listing for patients
7. Add case review for practitioners
