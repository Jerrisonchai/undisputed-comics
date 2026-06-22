import sys, json, urllib.request, urllib.error
sys.stdout.reconfigure(encoding='utf-8')

SUPABASE_URL = 'https://fdusyudelkhoomakdfel.supabase.co'
ANON_KEY = 'sb_publishable_hMpj6OKgcZno6jUBEm4xSg_lRDVe9Vf'

# Check if tables exist
checks = {
    'profiles': '/rest/v1/profiles?limit=0',
    'notification_logs': '/rest/v1/notification_logs?limit=0',
}

print("=== TABLE CHECK ===")
for table, path in checks.items():
    url = f'{SUPABASE_URL}{path}'
    req = urllib.request.Request(url, headers={
        'apikey': ANON_KEY, 'Authorization': f'Bearer {ANON_KEY}', 'Accept': 'application/json'
    })
    try:
        urllib.request.urlopen(req, timeout=8)
        print(f'  [OK] {table}')
    except urllib.error.HTTPError as e:
        body = e.read().decode()[:200]
        print(f'  [MISSING] {table}: HTTP {e.code}')

# Test auth sign-in
print()
print("=== AUTH CHECK ===")
auth_url = f'{SUPABASE_URL}/auth/v1/token?grant_type=password'
auth_data = json.dumps({'email': 'jerrcoc1@gmail.com', 'password': 'test123'}).encode()
req = urllib.request.Request(auth_url, data=auth_data, headers={
    'apikey': ANON_KEY, 'Content-Type': 'application/json'
})
try:
    with urllib.request.urlopen(req, timeout=10) as resp:
        print('  Sign-in SUCCEEDED — user exists and is confirmed')
except urllib.error.HTTPError as e:
    body = json.loads(e.read().decode())
    err = body.get('error', str(body))
    desc = body.get('error_description', '')
    print(f'  Auth error ({e.code}): {err}')
    if desc:
        print(f'  Description: {desc}')
