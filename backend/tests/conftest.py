import pytest
import requests
import os

BASE_URL = "https://hola-hello-496.preview.emergentagent.com/api"


@pytest.fixture(scope="session")
def base_url():
    return BASE_URL


@pytest.fixture
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def review_token():
    """Premium review@veil.app account token (App Store review)."""
    r = requests.post(f"{BASE_URL}/auth/login",
                      json={"email": "review@veil.app", "password": "AppReview2026!"})
    assert r.status_code == 200, f"Review login failed: {r.text}"
    return r.json()["access_token"]


@pytest.fixture(scope="session")
def demo_token():
    r = requests.post(f"{BASE_URL}/auth/login",
                      json={"email": "demo1@veil.app", "password": "DemoPass123"})
    assert r.status_code == 200, f"Demo login failed: {r.text}"
    return r.json()["access_token"]


def auth(token):
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
