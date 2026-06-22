import sys, json, urllib.request, urllib.error
sys.stdout.reconfigure(encoding='utf-8')

SUPABASE_URL = 'https://fdusyudelkhoomakdfel.supabase.co'
ANON_KEY = 'sb_publishable_hMpj6OKgcZno6jUBEm4xSg_lRDVe9Vf'

# Check if user exists via password reset endpoint
print("=== Check if user exists ===")
url = f'{SUPABASE_URL}/auth/v1/recover'
data = json.dumps({'email': 'jerrcoc1@gmail.com'}).encode()
req = urllib.request.Request(url, data=data, headers={
    'apikey': ANON_KEY, 'Content-Type': 'application/json'
})
try:
    with urllib.request.urlopen(req, timeout=10) as resp:
        print('  User EXISTS (password reset request accepted)')
except urllib.error.HTTPError as e:
    body = json.loads(e.read().decode())
    if 'over_email_send_rate_limit' in str(body):
        print('  User EXISTS (rate limited on reset)')
    elif 'user_not_found' in str(body):
        print('  User NOT FOUND in auth.users!')
    else:
        print(f'  Status {e.code}: {body}')

# Try to sign up (this will fail if already exists)
print()
print("=== Try sign-up ===")
url2 = f'{SUPABASE_URL}/auth/v1/signup'
data2 = json.dumps({'email': 'jerrcoc1@gmail.com', 'password': 'TestAdmin123!'}).encode()
req2 = urllib.request.Request(url2, data=data2, headers={
    'apikey': ANON_KEY, 'Content-Type': 'application/json'
})
try:
    with urllib.request.urlopen(req2, timeout=10) as resp:
        result = json.loads(resp.read().decode())
        print(f'  Sign-up SUCCEEDED! User created. ID: {result.get("user",{}).get("id","?")}')
        if result.get('session'):
            print('  Session: ACTIVE (email confirmation disabled)')
        else:
            print('  Session: NULL (email confirmation REQUIRED)')
except urllib.error.HTTPError as e:
    body = json.loads(e.read().decode())
    msg = body.get('msg', str(body))
    if 'already registered' in msg.lower() or 'already exists' in msg.lower():
        print(f'  User ALREADY EXISTS — password was wrong earlier')
    else:
        print(f'  Error: {msg}')
