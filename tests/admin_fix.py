import sys, json, urllib.request, urllib.error
sys.stdout.reconfigure(encoding='utf-8')

SUPABASE_URL = 'https://fdusyudelkhoomakdfel.supabase.co'
ANON_KEY = 'sb_publishable_hMpj6OKgcZno6jUBEm4xSg_lRDVe9Vf'
EMAIL = 'jerrcoc1@gmail.com'
PASSWORD = '123456'

print("=== 1. Sign in ===")
url = f'{SUPABASE_URL}/auth/v1/token?grant_type=password'
data = json.dumps({'email': EMAIL, 'password': PASSWORD}).encode()
req = urllib.request.Request(url, data=data, headers={
    'apikey': ANON_KEY, 'Content-Type': 'application/json'
})
try:
    with urllib.request.urlopen(req, timeout=10) as resp:
        r = json.loads(resp.read().decode())
        user_id = r['user']['id']
        access_token = r['access_token']
        print(f'  OK! User ID: {user_id}')
        print(f'  Email confirmed: {r["user"].get("email_confirmed_at", "NEVER")}')
except urllib.error.HTTPError as e:
    body = json.loads(e.read().decode())
    print(f'  FAIL ({e.code}): {body.get("error","?")} - {body.get("error_description","?")}')
    sys.exit(1)

# 2. Check if profile exists
print("\n=== 2. Profile check ===")
url2 = f'{SUPABASE_URL}/rest/v1/profiles?id=eq.{user_id}&select=*'
req2 = urllib.request.Request(url2, headers={
    'apikey': ANON_KEY,
    'Authorization': f'Bearer {access_token}'
})
try:
    with urllib.request.urlopen(req2, timeout=10) as resp:
        data = json.loads(resp.read().decode())
        if data:
            print(f'  PROFILE EXISTS: {json.dumps(data[0], indent=2, ensure_ascii=False)}')
        else:
            print('  NO PROFILE — need to create it')
except urllib.error.HTTPError as e:
    print(f'  Error: {e.code}')

# 3. Try to create profile if missing
print("\n=== 3. Create profile ===")
upsert_data = json.dumps({
    'id': user_id,
    'email': EMAIL,
    'name': 'Jerrison',
    'role': 'admin',
    'updated_at': '2026-06-22T13:30:00Z'
}).encode()
url3 = f'{SUPABASE_URL}/rest/v1/profiles'
req3 = urllib.request.Request(url3, data=upsert_data, headers={
    'apikey': ANON_KEY,
    'Authorization': f'Bearer {access_token}',
    'Content-Type': 'application/json',
    'Prefer': 'resolution=merge-duplicates'
})
try:
    urllib.request.urlopen(req3, timeout=10)
    print('  Profile CREATED!')
except urllib.error.HTTPError as e:
    body = e.read().decode()
    print(f'  FAIL ({e.code}): {body[:200]}')

# 4. Verify
print("\n=== 4. Verify ===")
req4 = urllib.request.Request(url2, headers={
    'apikey': ANON_KEY,
    'Authorization': f'Bearer {access_token}'
})
try:
    with urllib.request.urlopen(req4, timeout=10) as resp:
        data = json.loads(resp.read().decode())
        print(f'  Role: {data[0].get("role") if data else "MISSING"}')
except:
    print('  Verify failed')
