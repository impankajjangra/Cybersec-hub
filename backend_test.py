#!/usr/bin/env python3

import requests
import json
import time
import sys
from datetime import datetime

class CyberSecAPITester:
    def __init__(self, base_url="https://osint-hub-20.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.scan_id = None

    def log_test(self, name, status, details=""):
        """Log test result"""
        self.tests_run += 1
        status_icon = "✅" if status else "❌"
        print(f"{status_icon} {name}")
        if details:
            print(f"   {details}")
        if status:
            self.tests_passed += 1
        print()

    def test_api_root(self):
        """Test root API endpoint"""
        try:
            response = requests.get(f"{self.api_url}/")
            success = response.status_code == 200 and "CyberSec Hub API" in response.text
            details = f"Status: {response.status_code}, Response: {response.json()}" if success else f"Status: {response.status_code}"
            self.log_test("API Root Endpoint", success, details)
            return success
        except Exception as e:
            self.log_test("API Root Endpoint", False, f"Error: {str(e)}")
            return False

    def test_dashboard_stats(self):
        """Test dashboard stats endpoint"""
        try:
            response = requests.get(f"{self.api_url}/dashboard/stats")
            success = response.status_code == 200
            if success:
                data = response.json()
                required_keys = ['total_scans', 'total_threats', 'active_scans', 'recent_scans', 'recent_threats']
                has_all_keys = all(key in data for key in required_keys)
                success = has_all_keys
                details = f"Stats: {json.dumps(data, indent=2)}" if success else "Missing required keys"
            else:
                details = f"Status: {response.status_code}"
            self.log_test("Dashboard Stats", success, details)
            return success
        except Exception as e:
            self.log_test("Dashboard Stats", False, f"Error: {str(e)}")
            return False

    def test_network_scan_start(self):
        """Test starting a network scan"""
        try:
            scan_data = {
                "target": "scanme.nmap.org",
                "scan_type": "quick"
            }
            response = requests.post(f"{self.api_url}/scan/network", json=scan_data)
            success = response.status_code == 200
            if success:
                data = response.json()
                self.scan_id = data.get('scan_id')
                success = 'scan_id' in data and data.get('status') == 'started'
                details = f"Scan ID: {self.scan_id}, Status: {data.get('status')}"
            else:
                details = f"Status: {response.status_code}, Error: {response.text}"
            self.log_test("Network Scan Start", success, details)
            return success
        except Exception as e:
            self.log_test("Network Scan Start", False, f"Error: {str(e)}")
            return False

    def test_network_scan_status(self, max_wait=30):
        """Test retrieving network scan status"""
        if not self.scan_id:
            self.log_test("Network Scan Status", False, "No scan ID available")
            return False
        
        try:
            # Wait for scan to complete
            print("⏳ Waiting for scan to complete...")
            start_time = time.time()
            while time.time() - start_time < max_wait:
                response = requests.get(f"{self.api_url}/scan/{self.scan_id}")
                if response.status_code != 200:
                    details = f"Status: {response.status_code}"
                    self.log_test("Network Scan Status", False, details)
                    return False
                
                data = response.json()
                scan_status = data.get('status')
                
                if scan_status == 'completed':
                    success = 'results' in data and 'hosts' in data['results']
                    if success:
                        host_count = len(data['results']['hosts'])
                        details = f"Scan completed successfully, Found {host_count} hosts"
                    else:
                        details = "Scan completed but missing results"
                    self.log_test("Network Scan Status", success, details)
                    return success
                elif scan_status == 'failed':
                    details = f"Scan failed: {data.get('error', 'Unknown error')}"
                    self.log_test("Network Scan Status", False, details)
                    return False
                
                time.sleep(2)
            
            # Timeout
            self.log_test("Network Scan Status", False, f"Scan timeout after {max_wait}s")
            return False
            
        except Exception as e:
            self.log_test("Network Scan Status", False, f"Error: {str(e)}")
            return False

    def test_osint_lookup(self):
        """Test OSINT lookup functionality"""
        try:
            osint_data = {
                "query": "google.com",
                "query_type": "domain"
            }
            response = requests.post(f"{self.api_url}/osint/lookup", json=osint_data)
            success = response.status_code == 200
            if success:
                data = response.json()
                results = data.get('results', {})
                required_sections = ['whois', 'dns', 'shodan', 'virustotal']
                has_sections = all(section in results for section in required_sections)
                success = has_sections
                details = f"OSINT sections: {list(results.keys())}"
            else:
                details = f"Status: {response.status_code}, Error: {response.text}"
            self.log_test("OSINT Lookup", success, details)
            return success
        except Exception as e:
            self.log_test("OSINT Lookup", False, f"Error: {str(e)}")
            return False

    def test_threat_detection(self):
        """Test threat detection"""
        if not self.scan_id:
            self.log_test("Threat Detection", False, "No scan ID available")
            return False
        
        try:
            threat_data = {
                "scan_id": self.scan_id
            }
            response = requests.post(f"{self.api_url}/threats/detect", json=threat_data)
            success = response.status_code == 200
            if success:
                data = response.json()
                required_keys = ['threat_level', 'classification', 'confidence', 'details']
                has_all_keys = all(key in data for key in required_keys)
                success = has_all_keys
                if success:
                    threat_count = data['details'].get('total_threats', 0)
                    details = f"Threat Level: {data['threat_level']}, Threats: {threat_count}, Confidence: {data['confidence']:.2f}"
                else:
                    details = "Missing required keys in response"
            else:
                details = f"Status: {response.status_code}, Error: {response.text}"
            self.log_test("Threat Detection", success, details)
            return success
        except Exception as e:
            self.log_test("Threat Detection", False, f"Error: {str(e)}")
            return False

    def test_telegram_config(self):
        """Test Telegram configuration"""
        try:
            # Test GET config first
            response = requests.get(f"{self.api_url}/telegram/config")
            success = response.status_code == 200
            if not success:
                self.log_test("Telegram Config GET", False, f"Status: {response.status_code}")
                return False
            
            # Test POST config
            config_data = {
                "chat_id": "123456789",
                "enabled": True
            }
            response = requests.post(f"{self.api_url}/telegram/config", json=config_data)
            success = response.status_code == 200
            if success:
                data = response.json()
                success = data.get('status') == 'configured'
                details = f"Config status: {data.get('status')}"
            else:
                details = f"Status: {response.status_code}, Error: {response.text}"
            self.log_test("Telegram Config", success, details)
            return success
        except Exception as e:
            self.log_test("Telegram Config", False, f"Error: {str(e)}")
            return False

    def test_telegram_send(self):
        """Test Telegram message sending"""
        try:
            message_data = {
                "chat_id": "123456789",
                "message": "Test message from CyberSec Hub API test"
            }
            response = requests.post(f"{self.api_url}/telegram/send", json=message_data)
            # Note: This might fail if chat_id is invalid, but API should handle gracefully
            success = response.status_code in [200, 400]  # 400 is acceptable for invalid chat_id
            if response.status_code == 200:
                data = response.json()
                details = f"Message status: {data.get('status')}"
            elif response.status_code == 400:
                details = "Expected 400 - invalid chat_id (normal for test)"
                success = True  # This is expected behavior
            else:
                details = f"Status: {response.status_code}, Error: {response.text}"
            self.log_test("Telegram Send", success, details)
            return success
        except Exception as e:
            self.log_test("Telegram Send", False, f"Error: {str(e)}")
            return False

    def test_scan_history(self):
        """Test scan history endpoint"""
        try:
            response = requests.get(f"{self.api_url}/history")
            success = response.status_code == 200
            if success:
                data = response.json()
                has_required_keys = 'scans' in data and 'total' in data
                success = has_required_keys
                if success:
                    scan_count = len(data['scans'])
                    details = f"Found {scan_count} scans in history"
                else:
                    details = "Missing required keys in response"
            else:
                details = f"Status: {response.status_code}, Error: {response.text}"
            self.log_test("Scan History", success, details)
            return success
        except Exception as e:
            self.log_test("Scan History", False, f"Error: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all API tests"""
        print(f"🚀 Starting CyberSec Hub API Tests")
        print(f"📡 Base URL: {self.base_url}")
        print(f"⏰ Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 60)
        print()

        # Test sequence - order matters for some tests
        tests = [
            self.test_api_root,
            self.test_dashboard_stats,
            self.test_network_scan_start,
            self.test_network_scan_status,
            self.test_osint_lookup,
            self.test_threat_detection,
            self.test_telegram_config,
            self.test_telegram_send,
            self.test_scan_history,
        ]

        for test in tests:
            test()

        # Print summary
        print("=" * 60)
        print(f"📊 TEST SUMMARY")
        print(f"✅ Passed: {self.tests_passed}/{self.tests_run}")
        print(f"❌ Failed: {self.tests_run - self.tests_passed}/{self.tests_run}")
        success_rate = (self.tests_passed / self.tests_run) * 100 if self.tests_run > 0 else 0
        print(f"📈 Success Rate: {success_rate:.1f}%")
        print(f"⏰ Finished at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

        return self.tests_passed == self.tests_run

def main():
    """Main test function"""
    tester = CyberSecAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())