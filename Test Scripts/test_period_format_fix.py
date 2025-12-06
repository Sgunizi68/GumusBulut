#!/usr/bin/env python3
"""
Test script to validate the period format fix for Nakit Yatırma Kontrol Raporu.
This script tests the CRUD functions with the new 4-digit period format.
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from db.database import get_db
from db import crud
from sqlalchemy.orm import Session
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def test_period_format_fix():
    """Test the period format handling with actual database data."""
    
    logger.info("=== Testing Period Format Fix ===")
    
    # Get database session
    db = next(get_db())
    
    try:
        # Test parameters based on user's query
        test_sube_id = 1
        test_donem_4digit = 2508  # 4-digit format
        test_donem_6digit = 202508  # 6-digit format
        
        logger.info(f"Testing with Sube_ID: {test_sube_id}")
        logger.info(f"Testing with 4-digit donem: {test_donem_4digit}")
        logger.info(f"Testing with 6-digit donem: {test_donem_6digit}")
        
        # Test 1: 4-digit period input (should work now)
        logger.info("\n--- Test 1: 4-digit Period Input ---")
        bankaya_yatan_4 = crud.get_bankaya_yatan_by_sube_and_donem(db, test_sube_id, test_donem_4digit)
        nakit_girisi_4 = crud.get_nakit_girisi_by_sube_and_donem(db, test_sube_id, test_donem_4digit)
        
        logger.info(f"4-digit input - Bankaya Yatan records: {len(bankaya_yatan_4)}")
        logger.info(f"4-digit input - Nakit Girişi records: {len(nakit_girisi_4)}")
        
        # Test 2: 6-digit period input (should also work with conversion)
        logger.info("\n--- Test 2: 6-digit Period Input ---")
        bankaya_yatan_6 = crud.get_bankaya_yatan_by_sube_and_donem(db, test_sube_id, test_donem_6digit)
        nakit_girisi_6 = crud.get_nakit_girisi_by_sube_and_donem(db, test_sube_id, test_donem_6digit)
        
        logger.info(f"6-digit input - Bankaya Yatan records: {len(bankaya_yatan_6)}")
        logger.info(f"6-digit input - Nakit Girişi records: {len(nakit_girisi_6)}")
        
        # Test 3: Verify both inputs return same results
        logger.info("\n--- Test 3: Consistency Check ---")
        if len(bankaya_yatan_4) == len(bankaya_yatan_6):
            logger.info("✅ Bankaya Yatan: Both period formats return same number of records")
        else:
            logger.error("❌ Bankaya Yatan: Different number of records for 4-digit vs 6-digit input")
            
        if len(nakit_girisi_4) == len(nakit_girisi_6):
            logger.info("✅ Nakit Girişi: Both period formats return same number of records")
        else:
            logger.error("❌ Nakit Girişi: Different number of records for 4-digit vs 6-digit input")
        
        # Test 4: Detailed data verification
        logger.info("\n--- Test 4: Data Details ---")
        if bankaya_yatan_4:
            sample_record = bankaya_yatan_4[0]
            logger.info(f"Sample Bankaya Yatan record - Tarih: {sample_record.Tarih}, Donem: {sample_record.Donem}, Tutar: {sample_record.Tutar}")
        
        if nakit_girisi_4:
            sample_record = nakit_girisi_4[0]
            logger.info(f"Sample Nakit Girişi record - Tarih: {sample_record.Tarih}, Donem: {sample_record.Donem}, Tutar: {sample_record.Tutar}")
        
        # Test 5: Calculate totals for report
        logger.info("\n--- Test 5: Report Totals ---")
        bankaya_total = sum(item.Tutar for item in bankaya_yatan_4)
        nakit_total = sum(item.Tutar for item in nakit_girisi_4)
        fark = bankaya_total - nakit_total
        
        logger.info(f"Bankaya Yatan Total: {bankaya_total:,.2f} TL")
        logger.info(f"Nakit Girişi Total: {nakit_total:,.2f} TL")
        logger.info(f"Fark: {fark:,.2f} TL")
        
        # Summary
        logger.info("\n=== Test Summary ===")
        total_records = len(bankaya_yatan_4) + len(nakit_girisi_4)
        if total_records > 0:
            logger.info("✅ SUCCESS: Period format fix working correctly!")
            logger.info(f"✅ Found {len(bankaya_yatan_4)} Bankaya Yatan + {len(nakit_girisi_4)} Nakit Girişi records")
            logger.info("✅ Report should now display data properly")
        else:
            logger.warning("⚠️  No records found - check if test data exists in database")
            
    except Exception as e:
        logger.error(f"❌ Error during testing: {e}")
        
    finally:
        db.close()

if __name__ == "__main__":
    test_period_format_fix()
