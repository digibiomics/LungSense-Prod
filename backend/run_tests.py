"""
Run critical tests before deployment.
"""
import subprocess
import sys

def run_tests():
    """Run pytest with coverage."""
    print("🧪 Running LungSense Test Suite...\n")
    
    result = subprocess.run(
        ["pytest", "tests/", "-v", "--tb=short"],
        capture_output=False
    )
    
    if result.returncode == 0:
        print("\n✅ All tests passed! Ready for deployment.")
        return True
    else:
        print("\n❌ Tests failed! Fix issues before deploying.")
        return False

if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)
