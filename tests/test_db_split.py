import sys
import os

# Insert backend directory to path
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(__file__)), "backend"))

from app.database import db

def test_imports():
    # Verify core connection and path settings
    assert db.DB_PATH is not None
    assert db.get_db_connection is not None
    assert db.init_db is not None
    
    # Verify assets domain
    assert db.get_all_assets is not None
    assert db.get_asset_by_id is not None
    assert db.save_discovery_results is not None
    
    # Verify timeline domain
    assert db.log_timeline_event is not None
    assert db.get_timeline_events is not None
    assert db.log_terminal_command is not None
    
    # Verify passport domain
    assert db.get_asset_passport is not None
    assert db.upsert_asset_passport is not None
    
    # Verify runbooks domain
    assert db.get_runbooks is not None
    assert db.get_runbook_by_id is not None
    assert db.create_runbook_execution is not None
    
    # Verify automations domain
    assert db.get_automations is not None
    assert db.get_automation_runs_history is not None
    
    # Verify snmp domain
    assert db.get_snmp_device is not None
    assert db.get_snmp_interfaces is not None

def test_database_lifecycle():
    # Initialize connection
    db.init_db()
    
    # Fetch assets (should return empty or seeded data list)
    assets = db.get_all_assets()
    assert isinstance(assets, list)
    
    # Fetch runbooks
    runbooks = db.get_runbooks()
    assert isinstance(runbooks, list)
    assert len(runbooks) > 0 # Seeded data check
    
    # Fetch automations
    automations = db.get_automations()
    assert isinstance(automations, list)
    assert len(automations) > 0 # Seeded data check

if __name__ == "__main__":
    test_imports()
    test_database_lifecycle()
    print("All python database split tests PASSED successfully!")
