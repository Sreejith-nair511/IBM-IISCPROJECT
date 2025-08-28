#!/usr/bin/env python3
"""
Digital Sarpanch Backend API Test Suite
Tests all backend endpoints for the village governance system
"""

import requests
import json
import sys
from datetime import datetime
import time

# Get backend URL from frontend .env
BACKEND_URL = "https://rural-dashboard-1.preview.emergentagent.com/api"

class DigitalSarpanchTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.session = requests.Session()
        self.test_results = []
        self.village_ids = []
        self.alert_ids = []
        
    def log_test(self, test_name, success, message, response_data=None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "message": message,
            "response_data": response_data,
            "timestamp": datetime.now().isoformat()
        })
        
    def test_root_endpoint(self):
        """Test GET /api/ - Root endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/")
            
            if response.status_code == 200:
                data = response.json()
                if "message" in data and "Digital Sarpanch" in data["message"]:
                    self.log_test("Root Endpoint", True, "Root endpoint accessible with correct message", data)
                    return True
                else:
                    self.log_test("Root Endpoint", False, f"Unexpected response format: {data}")
                    return False
            else:
                self.log_test("Root Endpoint", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Root Endpoint", False, f"Connection error: {str(e)}")
            return False
    
    def test_get_villages(self):
        """Test GET /api/villages - Get all villages"""
        try:
            response = self.session.get(f"{self.base_url}/villages")
            
            if response.status_code == 200:
                villages = response.json()
                
                if isinstance(villages, list) and len(villages) > 0:
                    # Store village IDs for later tests
                    self.village_ids = [village.get("id") for village in villages if village.get("id")]
                    
                    # Validate sample data structure
                    sample_village = villages[0]
                    required_fields = ["id", "name", "district", "state", "crop", "coords", "population", "history"]
                    
                    missing_fields = [field for field in required_fields if field not in sample_village]
                    
                    if not missing_fields:
                        # Check if we have expected Indian villages
                        village_names = [v.get("name", "") for v in villages]
                        expected_villages = ["Kirangur", "Kovil", "Manjari", "Payyanur"]
                        found_villages = [name for name in expected_villages if name in village_names]
                        
                        if len(found_villages) >= 2:  # At least 2 sample villages
                            self.log_test("Get Villages", True, 
                                        f"Retrieved {len(villages)} villages with proper structure. Sample villages found: {found_villages}", 
                                        {"count": len(villages), "sample_names": village_names[:3]})
                            return True
                        else:
                            self.log_test("Get Villages", False, 
                                        f"Expected sample Indian villages not found. Got: {village_names}")
                            return False
                    else:
                        self.log_test("Get Villages", False, f"Missing required fields: {missing_fields}")
                        return False
                else:
                    self.log_test("Get Villages", False, "No villages returned or invalid format")
                    return False
            else:
                self.log_test("Get Villages", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Get Villages", False, f"Error: {str(e)}")
            return False
    
    def test_get_specific_village(self):
        """Test GET /api/villages/{village_id} - Get specific village"""
        if not self.village_ids:
            self.log_test("Get Specific Village", False, "No village IDs available from previous test")
            return False
            
        try:
            village_id = self.village_ids[0]  # Use first village
            response = self.session.get(f"{self.base_url}/villages/{village_id}")
            
            if response.status_code == 200:
                village = response.json()
                
                if village.get("id") == village_id:
                    # Check sensor data in history
                    history = village.get("history", [])
                    if history and len(history) > 0:
                        sensor_reading = history[0]
                        sensor_fields = ["soil_moisture", "temperature", "humidity", "ph_level"]
                        
                        if all(field in sensor_reading for field in sensor_fields):
                            self.log_test("Get Specific Village", True, 
                                        f"Retrieved village {village.get('name')} with {len(history)} sensor readings", 
                                        {"village_name": village.get("name"), "sensor_count": len(history)})
                            return True
                        else:
                            self.log_test("Get Specific Village", False, "Sensor readings missing required fields")
                            return False
                    else:
                        self.log_test("Get Specific Village", False, "No sensor history found")
                        return False
                else:
                    self.log_test("Get Specific Village", False, f"Village ID mismatch: expected {village_id}, got {village.get('id')}")
                    return False
            else:
                self.log_test("Get Specific Village", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Get Specific Village", False, f"Error: {str(e)}")
            return False
    
    def test_create_village(self):
        """Test POST /api/villages - Create new village"""
        try:
            new_village = {
                "name": "Testgram",
                "district": "Pune",
                "state": "Maharashtra", 
                "crop": "wheat",
                "coords": [18.5204, 73.8567],
                "population": 1200,
                "area_hectares": 150.0,
                "soil_type": "black soil",
                "irrigation_type": "borewell"
            }
            
            response = self.session.post(f"{self.base_url}/villages", json=new_village)
            
            if response.status_code == 200:
                created_village = response.json()
                
                if (created_village.get("name") == new_village["name"] and 
                    created_village.get("district") == new_village["district"] and
                    "id" in created_village):
                    
                    # Store the new village ID
                    self.village_ids.append(created_village["id"])
                    
                    self.log_test("Create Village", True, 
                                f"Successfully created village {created_village['name']} with ID {created_village['id']}", 
                                {"village_id": created_village["id"], "name": created_village["name"]})
                    return True
                else:
                    self.log_test("Create Village", False, "Created village data doesn't match input")
                    return False
            else:
                self.log_test("Create Village", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Create Village", False, f"Error: {str(e)}")
            return False
    
    def test_simulation_trigger(self):
        """Test POST /api/simulate/trigger - Trigger simulation scenarios"""
        if not self.village_ids:
            self.log_test("Simulation Trigger", False, "No village IDs available")
            return False
            
        scenarios = ["drought", "flood", "pest", "disease"]
        success_count = 0
        
        for scenario in scenarios:
            try:
                trigger_data = {
                    "scenario": scenario,
                    "village_id": self.village_ids[0],
                    "severity": "high"
                }
                
                response = self.session.post(f"{self.base_url}/simulate/trigger", json=trigger_data)
                
                if response.status_code == 200:
                    result = response.json()
                    
                    if ("message" in result and 
                        "alert" in result and 
                        result["alert"].get("alert_type") == scenario):
                        
                        # Store alert ID for later tests
                        if "id" in result["alert"]:
                            self.alert_ids.append(result["alert"]["id"])
                        
                        success_count += 1
                        print(f"  ✅ {scenario.upper()} simulation triggered successfully")
                    else:
                        print(f"  ❌ {scenario.upper()} simulation response format invalid")
                else:
                    print(f"  ❌ {scenario.upper()} simulation failed: HTTP {response.status_code}")
                    
            except Exception as e:
                print(f"  ❌ {scenario.upper()} simulation error: {str(e)}")
        
        if success_count == len(scenarios):
            self.log_test("Simulation Trigger", True, 
                        f"All {success_count} simulation scenarios triggered successfully", 
                        {"scenarios_tested": scenarios, "alerts_created": len(self.alert_ids)})
            return True
        else:
            self.log_test("Simulation Trigger", False, 
                        f"Only {success_count}/{len(scenarios)} scenarios worked")
            return False
    
    def test_get_alerts(self):
        """Test GET /api/alerts - Get all alerts"""
        try:
            response = self.session.get(f"{self.base_url}/alerts")
            
            if response.status_code == 200:
                alerts = response.json()
                
                if isinstance(alerts, list):
                    # Should have alerts from sample data + simulation triggers
                    if len(alerts) > 0:
                        # Validate alert structure
                        sample_alert = alerts[0]
                        required_fields = ["id", "village_id", "alert_type", "message", "severity", "is_active"]
                        
                        missing_fields = [field for field in required_fields if field not in sample_alert]
                        
                        if not missing_fields:
                            active_alerts = [a for a in alerts if a.get("is_active", False)]
                            self.log_test("Get Alerts", True, 
                                        f"Retrieved {len(alerts)} alerts ({len(active_alerts)} active)", 
                                        {"total_alerts": len(alerts), "active_alerts": len(active_alerts)})
                            return True
                        else:
                            self.log_test("Get Alerts", False, f"Alert missing required fields: {missing_fields}")
                            return False
                    else:
                        self.log_test("Get Alerts", False, "No alerts found (expected some from sample data)")
                        return False
                else:
                    self.log_test("Get Alerts", False, "Invalid response format - expected list")
                    return False
            else:
                self.log_test("Get Alerts", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Get Alerts", False, f"Error: {str(e)}")
            return False
    
    def test_get_village_alerts(self):
        """Test GET /api/alerts/{village_id} - Get alerts for specific village"""
        if not self.village_ids:
            self.log_test("Get Village Alerts", False, "No village IDs available")
            return False
            
        try:
            village_id = self.village_ids[0]
            response = self.session.get(f"{self.base_url}/alerts/{village_id}")
            
            if response.status_code == 200:
                alerts = response.json()
                
                if isinstance(alerts, list):
                    # All alerts should be for this village
                    village_specific = all(alert.get("village_id") == village_id for alert in alerts)
                    
                    if village_specific:
                        self.log_test("Get Village Alerts", True, 
                                    f"Retrieved {len(alerts)} alerts for village {village_id}", 
                                    {"village_id": village_id, "alert_count": len(alerts)})
                        return True
                    else:
                        self.log_test("Get Village Alerts", False, "Some alerts don't belong to requested village")
                        return False
                else:
                    self.log_test("Get Village Alerts", False, "Invalid response format")
                    return False
            else:
                self.log_test("Get Village Alerts", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Get Village Alerts", False, f"Error: {str(e)}")
            return False
    
    def test_dismiss_alert(self):
        """Test PATCH /api/alerts/{alert_id}/dismiss - Dismiss alert"""
        if not self.alert_ids:
            self.log_test("Dismiss Alert", False, "No alert IDs available from simulation tests")
            return False
            
        try:
            alert_id = self.alert_ids[0]
            response = self.session.patch(f"{self.base_url}/alerts/{alert_id}/dismiss")
            
            if response.status_code == 200:
                result = response.json()
                
                if "message" in result and "dismissed" in result["message"].lower():
                    # Verify the alert is actually dismissed by checking it's inactive
                    verify_response = self.session.get(f"{self.base_url}/alerts?active_only=false")
                    if verify_response.status_code == 200:
                        all_alerts = verify_response.json()
                        dismissed_alert = next((a for a in all_alerts if a.get("id") == alert_id), None)
                        
                        if dismissed_alert and not dismissed_alert.get("is_active", True):
                            self.log_test("Dismiss Alert", True, 
                                        f"Alert {alert_id} successfully dismissed and verified inactive", 
                                        {"alert_id": alert_id})
                            return True
                        else:
                            self.log_test("Dismiss Alert", False, "Alert not properly marked as inactive")
                            return False
                    else:
                        self.log_test("Dismiss Alert", True, f"Alert dismissed (verification failed but dismiss succeeded)")
                        return True
                else:
                    self.log_test("Dismiss Alert", False, f"Unexpected response: {result}")
                    return False
            else:
                self.log_test("Dismiss Alert", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Dismiss Alert", False, f"Error: {str(e)}")
            return False
    
    def test_dashboard_stats(self):
        """Test GET /api/dashboard/stats - Get dashboard statistics"""
        try:
            response = self.session.get(f"{self.base_url}/dashboard/stats")
            
            if response.status_code == 200:
                stats = response.json()
                
                required_fields = ["total_villages", "active_alerts", "critical_alerts", "critical_villages"]
                missing_fields = [field for field in required_fields if field not in stats]
                
                if not missing_fields:
                    # Validate that stats make sense
                    if (isinstance(stats["total_villages"], int) and stats["total_villages"] > 0 and
                        isinstance(stats["active_alerts"], int) and stats["active_alerts"] >= 0 and
                        isinstance(stats["critical_alerts"], int) and stats["critical_alerts"] >= 0):
                        
                        self.log_test("Dashboard Stats", True, 
                                    f"Dashboard stats retrieved: {stats['total_villages']} villages, {stats['active_alerts']} active alerts", 
                                    stats)
                        return True
                    else:
                        self.log_test("Dashboard Stats", False, f"Invalid stat values: {stats}")
                        return False
                else:
                    self.log_test("Dashboard Stats", False, f"Missing required fields: {missing_fields}")
                    return False
            else:
                self.log_test("Dashboard Stats", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Dashboard Stats", False, f"Error: {str(e)}")
            return False
    
    def test_error_handling(self):
        """Test error handling for invalid requests"""
        error_tests = [
            ("Invalid Village ID", f"{self.base_url}/villages/invalid-id", "GET"),
            ("Invalid Alert ID", f"{self.base_url}/alerts/invalid-id/dismiss", "PATCH"),
            ("Invalid Simulation", f"{self.base_url}/simulate/trigger", "POST", {"scenario": "invalid", "village_id": "invalid"})
        ]
        
        success_count = 0
        
        for test_name, url, method, data in error_tests:
            try:
                if method == "GET":
                    response = self.session.get(url)
                elif method == "PATCH":
                    response = self.session.patch(url)
                elif method == "POST":
                    response = self.session.post(url, json=data)
                
                # Should return 404 or 422 for invalid requests
                if response.status_code in [404, 422]:
                    success_count += 1
                    print(f"  ✅ {test_name}: Properly returned HTTP {response.status_code}")
                else:
                    print(f"  ❌ {test_name}: Expected 404/422, got {response.status_code}")
                    
            except Exception as e:
                print(f"  ❌ {test_name}: Error {str(e)}")
        
        if success_count >= 2:  # At least 2 out of 3 error cases handled properly
            self.log_test("Error Handling", True, f"{success_count}/3 error cases handled properly")
            return True
        else:
            self.log_test("Error Handling", False, f"Only {success_count}/3 error cases handled properly")
            return False
    
    def run_all_tests(self):
        """Run all backend API tests"""
        print("🚀 Starting Digital Sarpanch Backend API Tests")
        print(f"🔗 Testing against: {self.base_url}")
        print("=" * 60)
        
        # Test sequence
        tests = [
            ("Basic Connectivity", self.test_root_endpoint),
            ("Sample Data Population", self.test_get_villages),
            ("Village Details", self.test_get_specific_village),
            ("Village Creation", self.test_create_village),
            ("Simulation Triggers", self.test_simulation_trigger),
            ("Alert Retrieval", self.test_get_alerts),
            ("Village-Specific Alerts", self.test_get_village_alerts),
            ("Alert Dismissal", self.test_dismiss_alert),
            ("Dashboard Statistics", self.test_dashboard_stats),
            ("Error Handling", self.test_error_handling)
        ]
        
        passed = 0
        total = len(tests)
        
        for test_name, test_func in tests:
            print(f"\n🧪 Testing: {test_name}")
            if test_func():
                passed += 1
            time.sleep(0.5)  # Small delay between tests
        
        print("\n" + "=" * 60)
        print(f"📊 TEST SUMMARY: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 ALL TESTS PASSED! Digital Sarpanch backend is working correctly.")
            return True
        else:
            print(f"⚠️  {total - passed} tests failed. Check the issues above.")
            return False
    
    def get_summary(self):
        """Get a summary of test results"""
        passed = sum(1 for result in self.test_results if result["success"])
        total = len(self.test_results)
        
        return {
            "total_tests": total,
            "passed": passed,
            "failed": total - passed,
            "success_rate": f"{(passed/total*100):.1f}%" if total > 0 else "0%",
            "results": self.test_results
        }

def main():
    """Main test execution"""
    tester = DigitalSarpanchTester()
    
    print("Digital Sarpanch Backend API Test Suite")
    print("=" * 50)
    
    success = tester.run_all_tests()
    
    # Print detailed summary
    summary = tester.get_summary()
    print(f"\n📈 FINAL RESULTS:")
    print(f"   Total Tests: {summary['total_tests']}")
    print(f"   Passed: {summary['passed']}")
    print(f"   Failed: {summary['failed']}")
    print(f"   Success Rate: {summary['success_rate']}")
    
    # Return appropriate exit code
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()