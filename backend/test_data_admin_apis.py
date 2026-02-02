"""
Test script for Data Admin Dashboard APIs
Run this after starting the FastAPI server to test the new endpoints.
"""
import requests
import json

# Configuration
BASE_URL = "http://localhost:8000"
DATA_ADMIN_TOKEN = "your_data_admin_jwt_token_here"

headers = {
    "Authorization": f"Bearer {DATA_ADMIN_TOKEN}",
    "Content-Type": "application/json"
}

def test_dashboard_summary():
    """Test the dashboard summary endpoint."""
    print("🔍 Testing Dashboard Summary...")
    response = requests.get(f"{BASE_URL}/admin/dashboard/summary", headers=headers)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Total Cases: {data['data']['total_cases']}")
        print(f"✅ ML-Ready Cases: {data['data']['ml_ready_cases']}")
        print(f"✅ Training Readiness: {data['data']['training_readiness_percentage']}%")
    else:
        print(f"❌ Error: {response.text}")
    print()

def test_dataset_explorer():
    """Test the dataset explorer endpoint."""
    print("🔍 Testing Dataset Explorer...")
    params = {
        "page": 1,
        "limit": 10,
        "training_ready_only": True
    }
    response = requests.get(f"{BASE_URL}/admin/dashboard/dataset", headers=headers, params=params)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Found {len(data['data']['rows'])} training samples")
        print(f"✅ Total Count: {data['data']['pagination']['total_count']}")
        if data['data']['rows']:
            sample = data['data']['rows'][0]
            print(f"✅ Sample Catalog: {sample['catalog_number']}")
            print(f"✅ Sample Diagnosis: {sample['primary_diagnosis']}")
    else:
        print(f"❌ Error: {response.text}")
    print()

def test_label_insights():
    """Test the label insights endpoint."""
    print("🔍 Testing Label Insights...")
    response = requests.get(f"{BASE_URL}/admin/dashboard/insights", headers=headers)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        insights = data['data']
        print(f"✅ Diagnosis Types: {len(insights['diagnosis_distribution'])}")
        print(f"✅ Practitioners: {len(insights['practitioner_performance'])}")
        print(f"✅ Missing Confidence: {insights['data_quality_flags']['missing_confidence']}")
    else:
        print(f"❌ Error: {response.text}")
    print()

def test_export_functionality():
    """Test the export functionality."""
    print("🔍 Testing Export Functionality...")
    export_data = {
        "model_type": "cough_audio",
        "confidence_min": 0.7,
        "export_format": "json",
        "include_files": True
    }
    response = requests.post(f"{BASE_URL}/admin/dashboard/export", headers=headers, json=export_data)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        metadata = data['data']['dataset_metadata']
        print(f"✅ Dataset Name: {metadata['name']}")
        print(f"✅ Total Samples: {metadata['total_samples']}")
        print(f"✅ Created By: {metadata['created_by']}")
    else:
        print(f"❌ Error: {response.text}")
    print()

def main():
    """Run all tests."""
    print("🚀 Testing Data Admin Dashboard APIs")
    print("=" * 50)
    
    try:
        test_dashboard_summary()
        test_dataset_explorer()
        test_label_insights()
        test_export_functionality()
        
        print("✅ All tests completed!")
        print("\n📋 API Endpoints Summary:")
        print("1. GET /admin/dashboard/summary - Top-level training readiness")
        print("2. GET /admin/dashboard/dataset - Dataset explorer with filters")
        print("3. GET /admin/dashboard/insights - Label distribution & bias insights")
        print("4. POST /admin/dashboard/export - Export training batches")
        
    except requests.exceptions.ConnectionError:
        print("❌ Connection Error: Make sure the FastAPI server is running on localhost:8000")
    except Exception as e:
        print(f"❌ Unexpected Error: {e}")

if __name__ == "__main__":
    main()