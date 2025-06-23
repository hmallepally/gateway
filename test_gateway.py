#!/usr/bin/env python3

import requests
import json
import sys

def test_api_gateway():
    """Comprehensive test of API Gateway functionality"""
    print('🧪 Testing API Gateway functionality...')
    
    base_url = 'http://localhost:8000'
    results = []
    
    try:
        response = requests.get(f'{base_url}/health')
        if response.status_code == 200:
            print(f'✅ Health check: {response.status_code} - {response.json()}')
            results.append(('Health Check', True))
        else:
            print(f'❌ Health check failed: {response.status_code}')
            results.append(('Health Check', False))
    except Exception as e:
        print(f'❌ Health check failed: {e}')
        results.append(('Health Check', False))

    try:
        gateway_request = {
            'headers': {'Content-Type': 'application/json'},
            'body': {
                'bomVersionId': 'CREDIT_CARD:PREMIUM:1.0',
                'customerId': 'CUST_12345',
                'applicationId': 'APP_67890',
                'requestType': 'Scoring',
                'productId': 'CREDIT_CARD',
                'subproductId': 'PREMIUM'
            },
            'method': 'POST'
        }
        
        response = requests.post(f'{base_url}/api/gateway/process', json=gateway_request)
        if response.status_code == 200:
            result = response.json()
            print(f'✅ Gateway processing: {response.status_code}')
            print(f'   Status: {result.get("status_code", "N/A")}')
            print(f'   Body keys: {list(result.get("body", {}).keys())}')
            
            body = result.get('body', {})
            if 'parameters' in body:
                print(f'   ✅ Parameters augmented: {body["parameters"]}')
                results.append(('Parameter Augmentation', True))
            else:
                print(f'   ⚠️  No parameters found in response')
                results.append(('Parameter Augmentation', False))
                
            results.append(('Gateway Processing', True))
        else:
            print(f'❌ Gateway test failed: {response.status_code} - {response.text}')
            results.append(('Gateway Processing', False))
            results.append(('Parameter Augmentation', False))
    except Exception as e:
        print(f'❌ Gateway test failed: {e}')
        results.append(('Gateway Processing', False))
        results.append(('Parameter Augmentation', False))

    try:
        response = requests.get(f'{base_url}/api/fico-configs')
        if response.status_code == 200:
            configs = response.json()
            print(f'✅ Fico configs: {len(configs)} configurations found')
            for config in configs:
                print(f'   - {config["product_code"]} v{config["version"]}')
            results.append(('Configuration Management', True))
        else:
            print(f'❌ Config test failed: {response.status_code}')
            results.append(('Configuration Management', False))
    except Exception as e:
        print(f'❌ Config test failed: {e}')
        results.append(('Configuration Management', False))

    try:
        response = requests.get(f'{base_url}/api/parameters')
        if response.status_code == 200:
            params = response.json()
            print(f'✅ Parameters: {len(params)} parameters found')
            for param in params:
                print(f'   - {param["product_id"]}/{param["subproduct_id"]}/{param["component"]}: {param["parameter_name"]}={param["parameter_value"]}')
            results.append(('Parameter Management', True))
        else:
            print(f'❌ Parameters test failed: {response.status_code}')
            results.append(('Parameter Management', False))
    except Exception as e:
        print(f'❌ Parameters test failed: {e}')
        results.append(('Parameter Management', False))

    try:
        response = requests.get(f'{base_url}/api/changes')
        if response.status_code == 200:
            changes = response.json()
            print(f'✅ Change log: {len(changes)} changes found')
            results.append(('Change Log', True))
        else:
            print(f'❌ Change log test failed: {response.status_code}')
            results.append(('Change Log', False))
    except Exception as e:
        print(f'❌ Change log test failed: {e}')
        results.append(('Change Log', False))

    try:
        plor_request = {
            'headers': {'Content-Type': 'application/json'},
            'body': {
                'bomVersionId': 'PLOR:STANDARD:1.2',
                'customerId': 'CUST_99999',
                'applicationId': 'APP_PLOR',
                'requestType': 'Processing'
            },
            'method': 'POST'
        }
        
        response = requests.post(f'{base_url}/api/gateway/process', json=plor_request)
        if response.status_code == 200:
            print(f'✅ PLOR routing test: {response.status_code}')
            results.append(('Request Routing', True))
        else:
            print(f'❌ PLOR routing test failed: {response.status_code}')
            results.append(('Request Routing', False))
    except Exception as e:
        print(f'❌ PLOR routing test failed: {e}')
        results.append(('Request Routing', False))

    print('\n🎉 API Gateway testing completed!')
    print('\n📊 Test Results Summary:')
    passed = 0
    total = len(results)
    
    for test_name, success in results:
        status = '✅ PASS' if success else '❌ FAIL'
        print(f'   {status}: {test_name}')
        if success:
            passed += 1
    
    print(f'\n📈 Overall: {passed}/{total} tests passed ({passed/total*100:.1f}%)')
    
    if passed == total:
        print('🎊 All tests passed! API Gateway is fully functional.')
        return True
    else:
        print('⚠️  Some tests failed. Please review the issues above.')
        return False

if __name__ == '__main__':
    success = test_api_gateway()
    sys.exit(0 if success else 1)
