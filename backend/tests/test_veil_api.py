"""VEIL backend API tests - Apple App Store compliance suite."""
import pytest
import requests
import uuid
import time
BASE_URL = "https://hola-hello-496.preview.emergentagent.com/api"

def auth(token):
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


# ===================== AUTH =====================
class TestAuth:
    def test_health(self, api):
        r = api.get(f"{BASE_URL}/")
        assert r.status_code == 200
        assert r.json().get("app") == "VEIL"

    def test_register_rejects_under_18(self, api):
        """Apple compliance: must reject age < 18."""
        email = f"TEST_under18_{uuid.uuid4().hex[:8]}@veil.app"
        r = api.post(f"{BASE_URL}/auth/register", json={
            "email": email, "password": "testpass123",
            "name": "Minor", "age": 17, "bio": ""
        })
        assert r.status_code in (400, 422), f"Expected 422/400 for age<18, got {r.status_code}"

    def test_register_rejects_duplicate(self, api):
        email = f"TEST_dup_{uuid.uuid4().hex[:8]}@veil.app"
        payload = {"email": email, "password": "testpass123", "name": "Dup", "age": 25}
        r1 = api.post(f"{BASE_URL}/auth/register", json=payload)
        assert r1.status_code == 200
        token = r1.json()["access_token"]
        r2 = api.post(f"{BASE_URL}/auth/register", json=payload)
        assert r2.status_code == 409
        # cleanup
        api.delete(f"{BASE_URL}/auth/account", headers=auth(token))

    def test_register_auto_generates_taps(self, api):
        """New user should receive ~8 demo taps."""
        email = f"TEST_taps_{uuid.uuid4().hex[:8]}@veil.app"
        r = api.post(f"{BASE_URL}/auth/register", json={
            "email": email, "password": "testpass123", "name": "TapTest", "age": 22
        })
        assert r.status_code == 200
        token = r.json()["access_token"]
        cnt = api.get(f"{BASE_URL}/taps/count", headers=auth(token)).json().get("count", 0)
        assert 5 <= cnt <= 10, f"Expected ~8 auto-generated taps, got {cnt}"
        # cleanup
        api.delete(f"{BASE_URL}/auth/account", headers=auth(token))

    def test_login_returns_jwt(self, api):
        r = api.post(f"{BASE_URL}/auth/login",
                     json={"email": "review@veil.app", "password": "AppReview2026!"})
        assert r.status_code == 200
        data = r.json()
        assert "access_token" in data and data["token_type"] == "bearer"
        assert "user" in data and data["user"].get("id")

    def test_login_invalid(self, api):
        r = api.post(f"{BASE_URL}/auth/login",
                     json={"email": "review@veil.app", "password": "wrong"})
        assert r.status_code == 401

    def test_delete_account_persists(self, api):
        """Apple Guideline 5.1.1(v): account & data permanently deleted."""
        email = f"TEST_del_{uuid.uuid4().hex[:8]}@veil.app"
        r = api.post(f"{BASE_URL}/auth/register", json={
            "email": email, "password": "testpass123", "name": "DelMe", "age": 25
        })
        token = r.json()["access_token"]
        # send a tap and message to ensure they get cleaned
        nearby = api.get(f"{BASE_URL}/users/nearby", headers=auth(token)).json()
        if nearby:
            api.post(f"{BASE_URL}/taps",
                     json={"to_user_id": nearby[0]["id"], "tap_type": "wave"},
                     headers=auth(token))
        # delete
        d = api.delete(f"{BASE_URL}/auth/account", headers=auth(token))
        assert d.status_code == 200 and d.json().get("deleted") is True
        # verify token unusable
        me = api.get(f"{BASE_URL}/auth/me", headers=auth(token))
        assert me.status_code == 404
        # verify login fails
        relogin = api.post(f"{BASE_URL}/auth/login",
                           json={"email": email, "password": "testpass123"})
        assert relogin.status_code == 401


# ===================== MODERATION =====================
class TestModeration:
    def test_message_blocks_prohibited(self, api, review_token):
        nearby = api.get(f"{BASE_URL}/users/nearby", headers=auth(review_token)).json()
        target = nearby[0]["id"]
        for term in ["escort", "menor", "chemsex"]:
            r = api.post(f"{BASE_URL}/messages",
                         json={"to_user_id": target, "text": f"hola {term} hoy"},
                         headers=auth(review_token))
            assert r.status_code == 400, f"Term '{term}' should be blocked, got {r.status_code}"

    def test_valid_message_succeeds(self, api, review_token):
        nearby = api.get(f"{BASE_URL}/users/nearby", headers=auth(review_token)).json()
        target = nearby[0]["id"]
        r = api.post(f"{BASE_URL}/messages",
                     json={"to_user_id": target, "text": "Hola, ¿qué tal el día?"},
                     headers=auth(review_token))
        assert r.status_code == 200
        msg = r.json()
        assert msg.get("conversation_id") and msg.get("id")
        assert msg.get("text") == "Hola, ¿qué tal el día?"

    def test_rate_limit_30_per_min(self, api):
        # use a fresh test user to not pollute review account
        email = f"TEST_rate_{uuid.uuid4().hex[:8]}@veil.app"
        reg = api.post(f"{BASE_URL}/auth/register", json={
            "email": email, "password": "testpass123", "name": "Rate", "age": 25
        }).json()
        token = reg["access_token"]
        nearby = api.get(f"{BASE_URL}/users/nearby", headers=auth(token)).json()
        target = nearby[0]["id"]
        got_429 = False
        for i in range(35):
            r = api.post(f"{BASE_URL}/messages",
                         json={"to_user_id": target, "text": f"hola {i}"},
                         headers=auth(token))
            if r.status_code == 429:
                got_429 = True
                break
        assert got_429, "Rate limit (429) should trigger before 35 messages"
        api.delete(f"{BASE_URL}/auth/account", headers=auth(token))


# ===================== PROFILE =====================
class TestProfile:
    def test_photos_array_truncates_to_6(self, api, review_token):
        photos = [f"https://example.com/p{i}.jpg" for i in range(10)]
        r = api.put(f"{BASE_URL}/profile",
                    json={"photos": photos}, headers=auth(review_token))
        assert r.status_code == 200
        data = r.json()
        assert len(data["photos"]) == 6, f"Expected 6 photos, got {len(data['photos'])}"

    def test_first_photo_becomes_main_photo(self, api):
        email = f"TEST_pho_{uuid.uuid4().hex[:8]}@veil.app"
        reg = api.post(f"{BASE_URL}/auth/register", json={
            "email": email, "password": "testpass123", "name": "Pho", "age": 25
        }).json()
        token = reg["access_token"]
        photos = ["https://example.com/main.jpg", "https://example.com/2.jpg"]
        r = api.put(f"{BASE_URL}/profile", json={"photos": photos}, headers=auth(token))
        assert r.status_code == 200
        assert r.json()["photo"] == photos[0]
        api.delete(f"{BASE_URL}/auth/account", headers=auth(token))


# ===================== PRIVACY / DISCOVER =====================
class TestDiscover:
    def test_nearby_returns_demo_users(self, api, review_token):
        r = api.get(f"{BASE_URL}/users/nearby", headers=auth(review_token))
        assert r.status_code == 200
        users = r.json()
        assert len(users) >= 26, f"Expected 26+ users, got {len(users)}"

    def test_nearby_sorted_boosted_online_distance(self, api, review_token):
        users = api.get(f"{BASE_URL}/users/nearby", headers=auth(review_token)).json()
        # boosted first, then online
        boosted_idx = [i for i, u in enumerate(users) if u.get("is_boosted")]
        non_boosted_idx = [i for i, u in enumerate(users) if not u.get("is_boosted")]
        if boosted_idx and non_boosted_idx:
            assert max(boosted_idx) < min(non_boosted_idx), "Boosted users must come first"

    def test_distance_rounded_to_half_km(self, api, review_token):
        users = api.get(f"{BASE_URL}/users/nearby", headers=auth(review_token)).json()
        checked = 0
        for u in users:
            d = u.get("distance_km")
            if d is not None:
                # multiples of 0.5
                assert (d * 2) == int(d * 2), f"Distance {d} not rounded to 0.5km increments"
                checked += 1
        assert checked > 5, "Expected to check multiple distances"


# ===================== TAPS =====================
class TestTaps:
    def test_free_user_sees_first_2_unlocked(self, api):
        email = f"TEST_free_{uuid.uuid4().hex[:8]}@veil.app"
        reg = api.post(f"{BASE_URL}/auth/register", json={
            "email": email, "password": "testpass123", "name": "Free", "age": 25
        }).json()
        token = reg["access_token"]
        taps = api.get(f"{BASE_URL}/taps/received", headers=auth(token)).json()
        assert len(taps) >= 5, f"Expected auto-generated taps, got {len(taps)}"
        unlocked = [t for t in taps if not t.get("locked")]
        locked = [t for t in taps if t.get("locked")]
        assert len(unlocked) == 2, f"Free user must see exactly 2 unlocked, got {len(unlocked)}"
        assert len(locked) >= 1, "Rest must be locked"
        api.delete(f"{BASE_URL}/auth/account", headers=auth(token))

    def test_premium_user_sees_all_unlocked(self, api, review_token):
        taps = api.get(f"{BASE_URL}/taps/received", headers=auth(review_token)).json()
        if not taps:
            pytest.skip("Review account has no taps yet")
        for t in taps:
            assert t.get("locked") is False, "Premium must see all taps unlocked"


# ===================== BOOST =====================
class TestBoost:
    def test_boost_activate_sets_1h(self, api, demo_token):
        r = api.post(f"{BASE_URL}/boost/activate", headers=auth(demo_token))
        assert r.status_code == 200
        bu = r.json().get("boost_until")
        assert bu, "boost_until should be returned"
        from datetime import datetime, timezone, timedelta
        until = datetime.fromisoformat(bu.replace('Z', '+00:00'))
        delta = (until - datetime.now(timezone.utc)).total_seconds()
        assert 3500 <= delta <= 3700, f"Expected ~3600s, got {delta}"


# ===================== BLOCK / REPORT =====================
class TestBlockReport:
    def test_block_removes_from_nearby(self, api):
        email = f"TEST_blk_{uuid.uuid4().hex[:8]}@veil.app"
        reg = api.post(f"{BASE_URL}/auth/register", json={
            "email": email, "password": "testpass123", "name": "Blk", "age": 25
        }).json()
        token = reg["access_token"]
        nearby = api.get(f"{BASE_URL}/users/nearby", headers=auth(token)).json()
        target = nearby[0]["id"]
        b = api.post(f"{BASE_URL}/block",
                     json={"target_user_id": target, "reason": ""},
                     headers=auth(token))
        assert b.status_code == 200 and b.json().get("blocked") is True
        after = api.get(f"{BASE_URL}/users/nearby", headers=auth(token)).json()
        assert all(u["id"] != target for u in after), "Blocked user must not appear in nearby"
        api.delete(f"{BASE_URL}/auth/account", headers=auth(token))

    def test_report_saves(self, api, review_token):
        nearby = api.get(f"{BASE_URL}/users/nearby", headers=auth(review_token)).json()
        target = nearby[0]["id"]
        r = api.post(f"{BASE_URL}/report",
                     json={"target_user_id": target, "reason": "harassment"},
                     headers=auth(review_token))
        assert r.status_code == 200 and r.json().get("reported") is True
