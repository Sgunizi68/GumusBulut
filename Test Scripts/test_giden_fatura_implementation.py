#!/usr/bin/env python3
"""
Test script to validate the implementation of "Giden Fatura" category type enhancement.
This script tests both backend and frontend related functionality.
"""

import sys
import os

# Add the backend directory to the Python path
backend_path = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.insert(0, backend_path)

try:
    from schemas.kategori import KategoriBase, KategoriCreate
    from db.models import Kategori
    print("✅ Successfully imported backend schemas and models")
except ImportError as e:
    print(f"❌ Error importing backend modules: {e}")
    sys.exit(1)

def test_pydantic_schema():
    """Test that the Pydantic schema accepts 'Giden Fatura' as a valid type."""
    print("\n=== Testing Pydantic Schema ===")
    
    try:
        # Test creating a category with 'Giden Fatura' type
        test_data = {
            "Kategori_Adi": "Test Giden Fatura Kategorisi",
            "Ust_Kategori_ID": 1,
            "Tip": "Giden Fatura",
            "Aktif_Pasif": True,
            "Gizli": False
        }
        
        kategori_base = KategoriBase(**test_data)
        kategori_create = KategoriCreate(**test_data)
        
        print(f"✅ KategoriBase validation passed: {kategori_base.Tip}")
        print(f"✅ KategoriCreate validation passed: {kategori_create.Tip}")
        
        # Test all valid types
        valid_types = ["Gelir", "Gider", "Bilgi", "Ödeme", "Giden Fatura"]
        for tip in valid_types:
            test_data["Tip"] = tip
            kategori = KategoriBase(**test_data)
            print(f"✅ Valid type accepted: {tip}")
        
        return True
        
    except Exception as e:
        print(f"❌ Pydantic schema test failed: {e}")
        return False

def test_typescript_types():
    """Test frontend TypeScript type definitions by reading the types file."""
    print("\n=== Testing TypeScript Types ===")
    
    try:
        types_file_path = os.path.join(os.path.dirname(__file__), 'CopyCat', 'types.ts')
        
        with open(types_file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if the KategoriTip type includes all expected values
        expected_types = ["'Gelir'", "'Gider'", "'Bilgi'", "'Ödeme'", "'Giden Fatura'"]
        
        if "export type KategoriTip = 'Gelir' | 'Gider' | 'Bilgi' | 'Ödeme' | 'Giden Fatura';" in content:
            print("✅ TypeScript KategoriTip type definition is correct")
            
            for expected_type in expected_types:
                if expected_type in content:
                    print(f"✅ Found expected type in definition: {expected_type}")
                else:
                    print(f"❌ Missing expected type: {expected_type}")
                    return False
            
            return True
        else:
            print("❌ KategoriTip type definition not found or incorrect")
            return False
            
    except Exception as e:
        print(f"❌ TypeScript types test failed: {e}")
        return False

def test_component_dropdowns():
    """Test that frontend components include the new dropdown option."""
    print("\n=== Testing Frontend Components ===")
    
    try:
        # Test KategoriForm component
        components_file_path = os.path.join(os.path.dirname(__file__), 'CopyCat', 'components.tsx')
        
        with open(components_file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if KategoriForm includes Giden Fatura option
        if '<option value="Giden Fatura">Giden Fatura</option>' in content:
            print("✅ KategoriForm component includes 'Giden Fatura' option")
        else:
            print("❌ KategoriForm component missing 'Giden Fatura' option")
            return False
        
        # Test category management page filters
        pages_file_path = os.path.join(os.path.dirname(__file__), 'CopyCat', 'pages.tsx')
        
        with open(pages_file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if filter dropdown includes Giden Fatura option
        giden_fatura_count = content.count('<option value="Giden Fatura">Giden Fatura</option>')
        if giden_fatura_count >= 1:
            print(f"✅ Category management page filter includes 'Giden Fatura' option (found {giden_fatura_count} instances)")
        else:
            print("❌ Category management page filter missing 'Giden Fatura' option")
            return False
        
        return True
        
    except Exception as e:
        print(f"❌ Frontend components test failed: {e}")
        return False

def test_database_model():
    """Test that the database model enum constraint includes 'Giden Fatura'."""
    print("\n=== Testing Database Model ===")
    
    try:
        models_file_path = os.path.join(os.path.dirname(__file__), 'backend', 'db', 'models.py')
        
        with open(models_file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if the Kategori model Tip field includes 'Giden Fatura'
        expected_enum = "Enum('Gelir', 'Gider', 'Bilgi', 'Ödeme', 'Giden Fatura')"
        if expected_enum in content:
            print("✅ Database model Tip enum includes 'Giden Fatura'")
            return True
        else:
            print("❌ Database model Tip enum missing 'Giden Fatura' or incorrect format")
            return False
            
    except Exception as e:
        print(f"❌ Database model test failed: {e}")
        return False

def main():
    """Run all tests and provide a summary."""
    print("🔧 Testing 'Giden Fatura' Category Type Implementation")
    print("=" * 60)
    
    tests = [
        ("Database Model", test_database_model),
        ("Pydantic Schema", test_pydantic_schema), 
        ("TypeScript Types", test_typescript_types),
        ("Frontend Components", test_component_dropdowns),
    ]
    
    results = []
    
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} test crashed: {e}")
            results.append((test_name, False))
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{test_name:20} {status}")
    
    print(f"\nOverall Result: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! 'Giden Fatura' category type implementation is successful.")
        return True
    else:
        print("⚠️  Some tests failed. Please review the implementation.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)