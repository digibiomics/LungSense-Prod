# Data Admin Dashboard API Documentation

## Overview
The Data Admin Dashboard provides comprehensive ML training data management capabilities for the LungSense platform. It follows the principle: **"Every row represents a potential ML training sample"**.

## 🔐 Authentication & Authorization
- **Required Role**: `DATA_ADMIN` or `SUPER_ADMIN`
- **Authentication**: JWT Bearer token in Authorization header
- **Data Privacy**: All patient data is anonymized (catalog numbers only)

## 📊 API Endpoints

### 1️⃣ Dashboard Summary
**GET** `/admin/dashboard/summary`

**Purpose**: System-wide training readiness overview

**Response**:
```json
{
  "status": "success",
  "data": {
    "total_cases": 1240,
    "ml_ready_cases": 820,
    "training_readiness_percentage": 66.1,
    "label_status": {
      "draft": 420,
      "final": 820
    },
    "modality_breakdown": {
      "cough_audio": 510,
      "breath_audio": 430,
      "xray": 620,
      "multi_modal": 280
    }
  }
}
```

**Key Metrics**:
- **Total Cases**: All cases in system
- **ML-Ready Cases**: Cases with final reviews + files + diagnoses
- **Training Readiness %**: Percentage ready for ML training
- **Modality Breakdown**: Cases per model type

---

### 2️⃣ Dataset Explorer
**GET** `/admin/dashboard/dataset`

**Purpose**: Core table showing all potential training samples with comprehensive filtering

**Query Parameters**:
- `model_type` (optional): `cough_audio`, `breath_audio`, `xray`, `multi_modal`
- `diagnosis` (optional): Filter by primary diagnosis (partial match)
- `severity` (optional): `mild`, `moderate`, `severe`
- `confidence_min` (optional): Minimum confidence score (0.0-1.0)
- `training_ready_only` (optional): Show only training-eligible samples
- `practitioner_id` (optional): Filter by reviewing practitioner
- `page` (default: 1): Page number for pagination
- `limit` (default: 50, max: 500): Items per page

**Response Structure**:
```json
{
  "status": "success",
  "data": {
    "rows": [
      {
        "catalog_number": "LS4A7B9C2D",
        "model_types": ["cough_audio", "xray"],
        "files_present": true,
        "file_count": 2,
        "practitioner_id": 15,
        "symptoms": ["Persistent cough", "Chest pain"],
        "primary_diagnosis": "Pneumonia",
        "differential_diagnoses": "Bronchitis, COPD exacerbation",
        "severity": "moderate",
        "confidence_score": 0.85,
        "review_status": "final",
        "training_ready": true,
        "review_date": "2026-01-29T10:30:00Z",
        "notes_present": true,
        "label_complete": true,
        "eligible_for_training": true,
        "exclusion_reason": null,
        "created_at": "2026-01-28T14:20:00Z",
        "case_status": "reviewed"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total_count": 820,
      "total_pages": 17
    },
    "filters_applied": {
      "model_type": "cough_audio",
      "training_ready_only": true
    }
  }
}
```

**Column Definitions**:

| Column | Purpose | Notes |
|--------|---------|-------|
| `catalog_number` | Anonymized case ID | Format: LS{10_CHARS} |
| `model_types` | Available modalities | Array of file types |
| `files_present` | Has uploaded files | Boolean |
| `practitioner_id` | Reviewing doctor | Internal ID only |
| `primary_diagnosis` | Final diagnosis | ML training label |
| `confidence_score` | Practitioner confidence | 0.0-1.0 scale |
| `training_ready` | ML training eligible | Boolean flag |
| `exclusion_reason` | Why not training-ready | If applicable |

---

### 3️⃣ Label Distribution & Insights
**GET** `/admin/dashboard/insights`

**Purpose**: Analyze label distribution and identify training biases

**Query Parameters**:
- `model_type` (optional): Filter insights by model type

**Response**:
```json
{
  "status": "success",
  "data": {
    "diagnosis_distribution": [
      {"diagnosis": "Pneumonia", "count": 245},
      {"diagnosis": "Asthma", "count": 180},
      {"diagnosis": "COPD", "count": 120}
    ],
    "severity_distribution": [
      {"severity": "mild", "count": 320},
      {"severity": "moderate", "count": 280},
      {"severity": "severe", "count": 85}
    ],
    "confidence_histogram": [
      {"bin": "High (0.7-1.0)", "count": 450},
      {"bin": "Medium (0.3-0.7)", "count": 280},
      {"bin": "Low (0-0.3)", "count": 90}
    ],
    "practitioner_performance": [
      {
        "practitioner_id": 15,
        "practitioner_name": "Dr. Smith",
        "cases_reviewed": 125,
        "avg_confidence": 0.82
      }
    ],
    "data_quality_flags": {
      "missing_confidence": 45,
      "missing_differential_dx": 120,
      "missing_severity": 30
    }
  }
}
```

**Use Cases**:
- **Identify Class Imbalance**: "Pneumonia samples are 3× higher than Asthma"
- **Quality Assessment**: Find missing labels or low confidence scores
- **Practitioner Analysis**: Detect labeling inconsistencies
- **Training Strategy**: Inform data collection priorities

---

### 4️⃣ Training Batch Export
**POST** `/admin/dashboard/export`

**Purpose**: Export filtered training datasets with versioning

**Request Body**:
```json
{
  "model_type": "cough_audio",
  "diagnosis_filter": "pneumonia",
  "confidence_min": 0.7,
  "export_format": "json",
  "include_files": true
}
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "dataset_metadata": {
      "name": "cough_audio_20260129_143022",
      "created_at": "2026-01-29T14:30:22Z",
      "created_by": "data_admin@lungsense.com",
      "filters": {
        "model_type": "cough_audio",
        "confidence_min": 0.7
      },
      "total_samples": 312
    },
    "samples": [
      {
        "catalog_number": "LS4A7B9C2D",
        "diagnosis": "Pneumonia",
        "differential_diagnoses": "Bronchitis, COPD",
        "severity": "moderate",
        "confidence_score": 0.85,
        "clinical_notes": "Patient presents with...",
        "files": [
          {
            "modality": "cough_audio",
            "file_type": "wav",
            "s3_bucket": "lungsense-audio",
            "s3_key": "cases/LS4A7B9C2D/cough.wav",
            "file_size": 2048576,
            "duration_seconds": 15.3
          }
        ]
      }
    ]
  }
}
```

---

## 🔍 Powerful Filtering System

### Model-First Architecture
The dashboard is organized around ML model types:
- **Cough Model**: `cough_audio` files
- **Chest Sound Model**: `breath_audio` files  
- **X-ray Model**: `xray` files
- **Multi-modal**: Cases with multiple file types

### Filter Combinations
Build training cohorts without SQL:
```
# High-confidence pneumonia cases for cough model
GET /admin/dashboard/dataset?model_type=cough_audio&diagnosis=pneumonia&confidence_min=0.8

# Multi-modal cases reviewed by specific practitioner
GET /admin/dashboard/dataset?model_type=multi_modal&practitioner_id=15

# Training-ready severe cases only
GET /admin/dashboard/dataset?severity=severe&training_ready_only=true
```

## 🛡️ Security & Privacy Guardrails

### Data Admin Permissions
✅ **CAN DO**:
- Filter and analyze anonymized data
- Export training datasets
- View label distributions
- Flag data quality issues

❌ **CANNOT DO**:
- See patient identity (names, emails, etc.)
- Modify diagnoses or labels
- Delete cases or files
- Access raw patient data

### Anonymization
- Only catalog numbers visible (LS4A7B9C2D format)
- Practitioner names shown for review consistency
- No patient demographics exposed
- File paths included for ML training access

## 🚀 Frontend Integration Guide

### Dashboard Layout Structure
```
┌─────────────────────────────────────────┐
│ 📊 TOP SUMMARY CARDS                    │
│ Total: 1,240 | ML-Ready: 820 | 66.1%   │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ 🔀 MODEL SELECTOR TABS                  │
│ [Cough] [Chest] [X-ray] [Multi-modal]  │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ 🔍 FILTERS PANEL    │ 📋 DATASET TABLE  │
│ • Model Type        │ Catalog | Files   │
│ • Diagnosis         │ LS4A7B  | ✅ 2    │
│ • Severity          │ LS9X2M  | ❌ 0    │
│ • Confidence        │ ...               │
│ • Training Ready    │                   │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ 📊 INSIGHTS CHARTS                      │
│ Diagnosis Distribution | Confidence     │
└─────────────────────────────────────────┘
```

### Recommended Frontend Flow
1. **Load Summary** → Show training readiness at-a-glance
2. **Model Selection** → Filter entire dashboard by model type
3. **Apply Filters** → Build specific training cohorts
4. **Review Insights** → Identify data quality issues
5. **Export Dataset** → Generate versioned training batches

## 🧪 Testing

Run the test script:
```bash
cd backend
python test_data_admin_apis.py
```

Make sure to:
1. Start FastAPI server: `uvicorn app.app:app --reload`
2. Update `DATA_ADMIN_TOKEN` in test script
3. Have sample data in database

## 📈 Performance Considerations

- **Pagination**: Default 50 items, max 500 per page
- **Indexing**: Catalog numbers, practitioner IDs, modalities indexed
- **Caching**: Consider Redis for frequently accessed insights
- **Export Limits**: Large exports should be async (future enhancement)

## 🔄 Future Enhancements

1. **Real-time Updates**: WebSocket for live dashboard updates
2. **Advanced Analytics**: ML model performance tracking
3. **Automated Quality Checks**: Flag suspicious labels automatically
4. **Batch Processing**: Async export for large datasets
5. **Audit Logging**: Track all data admin actions

---

This dashboard provides everything needed for effective ML training data management while maintaining strict privacy and security standards.