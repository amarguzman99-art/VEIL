from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import math
from pathlib import Path
from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Config
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ['JWT_SECRET_KEY']
JWT_ALG = os.environ['JWT_ALGORITHM']
JWT_EXP_HOURS = int(os.environ['JWT_EXPIRATION_HOURS'])

pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

app = FastAPI(title="VEIL API")
api_router = APIRouter(prefix="/api")


# ============ Models ============
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    name: str = Field(..., min_length=1, max_length=50)
    age: int = Field(..., ge=18, le=99)
    bio: Optional[str] = Field(default="", max_length=300)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserPublic(BaseModel):
    id: str
    name: str
    age: int
    bio: str
    photo: Optional[str] = None
    interests: List[str] = []
    distance_km: Optional[float] = None
    is_premium: bool = False
    is_online: bool = True

class ProfileUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=50)
    bio: Optional[str] = Field(None, max_length=300)
    photo: Optional[str] = None  # base64
    interests: Optional[List[str]] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

class MessageCreate(BaseModel):
    to_user_id: str
    text: str = Field(..., min_length=1, max_length=2000)

class TapCreate(BaseModel):
    to_user_id: str
    tap_type: str = Field(..., pattern="^(wave|flame|drink|heart)$")

class BlockReport(BaseModel):
    target_user_id: str
    reason: Optional[str] = ""


# ============ Auth helpers ============
def hash_pw(pw: str) -> str:
    return pwd_ctx.hash(pw)

def verify_pw(pw: str, hashed: str) -> bool:
    return pwd_ctx.verify(pw, hashed)

def create_token(user_id: str) -> str:
    exp = datetime.now(timezone.utc) + timedelta(hours=JWT_EXP_HOURS)
    return jwt.encode({"sub": user_id, "exp": exp}, JWT_SECRET, algorithm=JWT_ALG)

async def get_current_user(creds: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    try:
        payload = jwt.decode(creds.credentials, JWT_SECRET, algorithms=[JWT_ALG])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(401, "Invalid token")
    except JWTError:
        raise HTTPException(401, "Invalid or expired token")
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(404, "User not found")
    return user


def user_to_public(u: dict, viewer: Optional[dict] = None) -> dict:
    dist = None
    if viewer and u.get("latitude") and viewer.get("latitude"):
        dist = haversine(u["latitude"], u["longitude"], viewer["latitude"], viewer["longitude"])
    return {
        "id": u["id"],
        "name": u.get("name", ""),
        "age": u.get("age", 0),
        "bio": u.get("bio", ""),
        "photo": u.get("photo"),
        "interests": u.get("interests", []),
        "distance_km": dist,
        "is_premium": u.get("is_premium", False),
        "is_online": True,
    }


def haversine(lat1, lon1, lat2, lon2):
    R = 6371
    dLat = math.radians(lat2 - lat1)
    dLon = math.radians(lon2 - lon1)
    a = math.sin(dLat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dLon/2)**2
    return round(R * 2 * math.atan2(math.sqrt(a), math.sqrt(1-a)), 1)


def conv_id(u1: str, u2: str) -> str:
    return "_".join(sorted([u1, u2]))


# ============ Auth routes ============
@api_router.post("/auth/register", response_model=TokenResponse)
async def register(data: UserRegister):
    if await db.users.find_one({"email": data.email.lower()}):
        raise HTTPException(409, "Email already registered")
    uid = str(uuid.uuid4())
    user = {
        "id": uid,
        "email": data.email.lower(),
        "password_hash": hash_pw(data.password),
        "name": data.name,
        "age": data.age,
        "bio": data.bio or "",
        "photo": None,
        "interests": [],
        "latitude": None,
        "longitude": None,
        "is_premium": False,
        "blocked": [],
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.users.insert_one(user)
    public = user_to_public(user)
    return TokenResponse(access_token=create_token(uid), user=public)


@api_router.post("/auth/login", response_model=TokenResponse)
async def login(data: UserLogin):
    user = await db.users.find_one({"email": data.email.lower()})
    if not user or not verify_pw(data.password, user["password_hash"]):
        raise HTTPException(401, "Invalid email or password")
    return TokenResponse(access_token=create_token(user["id"]), user=user_to_public(user))


@api_router.get("/auth/me")
async def me(current=Depends(get_current_user)):
    return {
        **user_to_public(current),
        "email": current.get("email"),
        "latitude": current.get("latitude"),
        "longitude": current.get("longitude"),
    }


@api_router.delete("/auth/account")
async def delete_account(current=Depends(get_current_user)):
    uid = current["id"]
    await db.users.delete_one({"id": uid})
    await db.messages.delete_many({"$or": [{"from_user_id": uid}, {"to_user_id": uid}]})
    await db.taps.delete_many({"$or": [{"from_user_id": uid}, {"to_user_id": uid}]})
    return {"deleted": True}


# ============ Profile routes ============
@api_router.put("/profile")
async def update_profile(data: ProfileUpdate, current=Depends(get_current_user)):
    update = {k: v for k, v in data.dict().items() if v is not None}
    if update:
        await db.users.update_one({"id": current["id"]}, {"$set": update})
    fresh = await db.users.find_one({"id": current["id"]}, {"_id": 0, "password_hash": 0})
    return user_to_public(fresh)


# ============ Grid / Discover ============
@api_router.get("/users/nearby")
async def nearby(current=Depends(get_current_user)):
    blocked = set(current.get("blocked", []))
    cursor = db.users.find(
        {"id": {"$ne": current["id"], "$nin": list(blocked)}},
        {"_id": 0, "password_hash": 0, "email": 0}
    )
    users = await cursor.to_list(200)
    results = [user_to_public(u, current) for u in users]
    results.sort(key=lambda x: (x["distance_km"] if x["distance_km"] is not None else 9999))
    return results


@api_router.get("/users/{user_id}")
async def get_user(user_id: str, current=Depends(get_current_user)):
    u = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0, "email": 0})
    if not u:
        raise HTTPException(404, "User not found")
    return user_to_public(u, current)


# ============ Chat ============
@api_router.post("/messages")
async def send_message(data: MessageCreate, current=Depends(get_current_user)):
    target = await db.users.find_one({"id": data.to_user_id})
    if not target:
        raise HTTPException(404, "User not found")
    msg = {
        "id": str(uuid.uuid4()),
        "conversation_id": conv_id(current["id"], data.to_user_id),
        "from_user_id": current["id"],
        "to_user_id": data.to_user_id,
        "text": data.text,
        "read": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.messages.insert_one(msg)
    msg.pop("_id", None)
    return msg


@api_router.get("/messages/{user_id}")
async def get_conversation(user_id: str, current=Depends(get_current_user)):
    cid = conv_id(current["id"], user_id)
    cursor = db.messages.find({"conversation_id": cid}, {"_id": 0}).sort("created_at", 1)
    msgs = await cursor.to_list(500)
    # Mark received messages as read
    await db.messages.update_many(
        {"conversation_id": cid, "to_user_id": current["id"], "read": False},
        {"$set": {"read": True}}
    )
    return msgs


@api_router.get("/conversations")
async def list_conversations(current=Depends(get_current_user)):
    uid = current["id"]
    pipeline = [
        {"$match": {"$or": [{"from_user_id": uid}, {"to_user_id": uid}]}},
        {"$sort": {"created_at": -1}},
        {"$group": {
            "_id": "$conversation_id",
            "last_message": {"$first": "$text"},
            "last_at": {"$first": "$created_at"},
            "from_user_id": {"$first": "$from_user_id"},
            "to_user_id": {"$first": "$to_user_id"},
        }},
        {"$sort": {"last_at": -1}}
    ]
    convs = await db.messages.aggregate(pipeline).to_list(100)
    result = []
    for c in convs:
        other_id = c["to_user_id"] if c["from_user_id"] == uid else c["from_user_id"]
        other = await db.users.find_one({"id": other_id}, {"_id": 0, "password_hash": 0, "email": 0})
        if other:
            result.append({
                "user": user_to_public(other, current),
                "last_message": c["last_message"],
                "last_at": c["last_at"],
            })
    return result


# ============ TAP zone ============
@api_router.post("/taps")
async def send_tap(data: TapCreate, current=Depends(get_current_user)):
    target = await db.users.find_one({"id": data.to_user_id})
    if not target:
        raise HTTPException(404, "User not found")
    tap = {
        "id": str(uuid.uuid4()),
        "from_user_id": current["id"],
        "to_user_id": data.to_user_id,
        "tap_type": data.tap_type,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.taps.insert_one(tap)
    tap.pop("_id", None)
    return tap


@api_router.get("/taps/received")
async def taps_received(current=Depends(get_current_user)):
    cursor = db.taps.find({"to_user_id": current["id"]}, {"_id": 0}).sort("created_at", -1)
    taps = await cursor.to_list(100)
    enriched = []
    for t in taps:
        sender = await db.users.find_one({"id": t["from_user_id"]}, {"_id": 0, "password_hash": 0, "email": 0})
        if sender:
            enriched.append({
                **t,
                "from_user": user_to_public(sender, current),
            })
    return enriched


# ============ Block / Report ============
@api_router.post("/block")
async def block_user(data: BlockReport, current=Depends(get_current_user)):
    await db.users.update_one({"id": current["id"]}, {"$addToSet": {"blocked": data.target_user_id}})
    return {"blocked": True}


@api_router.post("/report")
async def report_user(data: BlockReport, current=Depends(get_current_user)):
    await db.reports.insert_one({
        "id": str(uuid.uuid4()),
        "from_user_id": current["id"],
        "target_user_id": data.target_user_id,
        "reason": data.reason,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    return {"reported": True}


# ============ Seed ============
@api_router.post("/seed")
async def seed_demo_users():
    """Seed demo users (idempotent). Only adds if none exist beyond current."""
    count = await db.users.count_documents({"email": {"$regex": "^demo"}})
    if count >= 8:
        return {"seeded": False, "existing": count}
    demos = [
        {"name": "Mateo", "age": 28, "bio": "Café, libros, cine de autor.", "photo": "https://images.unsplash.com/photo-1628784962048-06b620cfcf45?w=600", "interests": ["☕ Café", "📖 Libros", "🎬 Cine"], "lat": 40.4168, "lon": -3.7038},
        {"name": "Diego", "age": 31, "bio": "Música electrónica, viajes, gym.", "photo": "https://images.unsplash.com/photo-1770894807821-e2e511bf59df?w=600", "interests": ["🎵 Música", "✈️ Viajes", "💪 Gym"], "lat": 40.4170, "lon": -3.7000},
        {"name": "Adrián", "age": 25, "bio": "Estudiante de arquitectura. Amante del arte.", "photo": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600", "interests": ["🏛️ Arte", "📐 Diseño", "🌃 Noche"], "lat": 40.4200, "lon": -3.7100},
        {"name": "Pablo", "age": 34, "bio": "Chef. Cocino, comparto, vivo.", "photo": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600", "interests": ["🍽️ Cocina", "🍷 Vinos", "🌱 Jardín"], "lat": 40.4250, "lon": -3.7050},
        {"name": "Alejandro", "age": 29, "bio": "Runner, fotógrafo amateur, perro lover.", "photo": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=600", "interests": ["🏃 Running", "📸 Foto", "🐕 Perros"], "lat": 40.4100, "lon": -3.6900},
        {"name": "Iván", "age": 26, "bio": "Programador. Curioso. Honesto.", "photo": "https://images.unsplash.com/photo-1463453091185-61582044d556?w=600", "interests": ["💻 Tech", "🎮 Gaming", "🍕 Pizza"], "lat": 40.4080, "lon": -3.7200},
        {"name": "Sergio", "age": 32, "bio": "Yoga, meditación, conexiones reales.", "photo": "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=600", "interests": ["🧘 Yoga", "🌿 Naturaleza", "📚 Lectura"], "lat": 40.4300, "lon": -3.6800},
        {"name": "Hugo", "age": 27, "bio": "Diseñador gráfico. Vinilos y conciertos.", "photo": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600", "interests": ["🎨 Diseño", "🎸 Música", "📀 Vinilo"], "lat": 40.4150, "lon": -3.7150},
    ]
    inserted = 0
    for i, d in enumerate(demos):
        email = f"demo{i+1}@veil.app"
        if await db.users.find_one({"email": email}):
            continue
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": email,
            "password_hash": hash_pw("DemoPass123"),
            "name": d["name"],
            "age": d["age"],
            "bio": d["bio"],
            "photo": d["photo"],
            "interests": d["interests"],
            "latitude": d["lat"],
            "longitude": d["lon"],
            "is_premium": False,
            "blocked": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        inserted += 1
    return {"seeded": True, "inserted": inserted}


@api_router.get("/")
async def root():
    return {"app": "VEIL", "status": "ok"}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
