from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os, logging, math, random
from pathlib import Path
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

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
    gender: Optional[str] = Field(default=None, pattern="^(man|woman)$")
    looking_for: Optional[str] = Field(default=None, pattern="^(man|woman|both)$")

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class ProfileUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=50)
    bio: Optional[str] = Field(None, max_length=300)
    photo: Optional[str] = None
    photos: Optional[List[str]] = None
    interests: Optional[List[str]] = None
    prompts: Optional[List[dict]] = None
    gender: Optional[str] = Field(None, pattern="^(man|woman)$")
    looking_for: Optional[str] = Field(None, pattern="^(man|woman|both)$")
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    onboarded: Optional[bool] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

class MessageCreate(BaseModel):
    to_user_id: str
    text: str = Field(..., min_length=1, max_length=2000)

class GiftSend(BaseModel):
    to_user_id: str
    gift_type: str = Field(..., pattern="^(golden_mask|crystal_rose|silk_veil|diamond|emerald_heart)$")

class TapCreate(BaseModel):
    to_user_id: str
    tap_type: str = Field(..., pattern="^(wave|flame|drink|heart|kiss|eye)$")

class BlockReport(BaseModel):
    target_user_id: str
    reason: Optional[str] = ""


# ============ Helpers ============
def hash_pw(pw: str) -> str: return pwd_ctx.hash(pw)
def verify_pw(pw: str, hashed: str) -> bool: return pwd_ctx.verify(pw, hashed)

def create_token(user_id: str) -> str:
    exp = datetime.now(timezone.utc) + timedelta(hours=JWT_EXP_HOURS)
    return jwt.encode({"sub": user_id, "exp": exp}, JWT_SECRET, algorithm=JWT_ALG)

async def get_current_user(creds: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    try:
        payload = jwt.decode(creds.credentials, JWT_SECRET, algorithms=[JWT_ALG])
        user_id = payload.get("sub")
        if not user_id: raise HTTPException(401, "Invalid token")
    except JWTError:
        raise HTTPException(401, "Invalid or expired token")
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
    if not user: raise HTTPException(404, "User not found")
    return user

def haversine(lat1, lon1, lat2, lon2):
    R = 6371
    dLat = math.radians(lat2 - lat1); dLon = math.radians(lon2 - lon1)
    a = math.sin(dLat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dLon/2)**2
    raw = R * 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    # Round to nearest 0.5 km for privacy (GDPR + Apple guideline 18)
    return round(raw * 2) / 2

# Basic prohibited content filter (Apple guideline 4, 26 + community guidelines)
BLOCKED_TERMS = [
    "menor", "menores", "child", "minor", "kid",
    "escort", "escorts", "prostit",
    "chemsex", "crystal meth",
    "fuck now", "sex now", "sexo ya",
    "venta de", "vendo sexo", "by money",
]

def contains_prohibited(text: str) -> bool:
    if not text: return False
    lower = text.lower()
    return any(term in lower for term in BLOCKED_TERMS)

def user_to_public(u: dict, viewer: Optional[dict] = None) -> dict:
    dist = None
    if viewer and u.get("latitude") and viewer.get("latitude"):
        dist = haversine(u["latitude"], u["longitude"], viewer["latitude"], viewer["longitude"])
    # Online if last_active < 15 mins, else "recent"
    now = datetime.now(timezone.utc)
    last_active = u.get("last_active")
    online = True
    if last_active:
        try:
            la = datetime.fromisoformat(last_active.replace('Z', '+00:00')) if isinstance(last_active, str) else last_active
            online = (now - la).total_seconds() < 900
        except: online = True
    return {
        "id": u["id"],
        "name": u.get("name", ""),
        "age": u.get("age", 0),
        "bio": u.get("bio", ""),
        "photo": u.get("photo"),
        "photos": u.get("photos", []),
        "interests": u.get("interests", []),
        "prompts": u.get("prompts", []),
        "verified": u.get("verified", False),
        "gender": u.get("gender"),
        "looking_for": u.get("looking_for"),
        "distance_km": dist,
        "is_premium": u.get("is_premium", False),
        "is_online": online,
        "onboarded": u.get("onboarded", False),
        "is_boosted": bool(u.get("boost_until") and datetime.fromisoformat(u["boost_until"].replace('Z','+00:00')) > now if u.get("boost_until") else False),
    }

def conv_id(u1: str, u2: str) -> str:
    return "_".join(sorted([u1, u2]))


# ============ Auth ============
@api_router.post("/auth/register", response_model=TokenResponse)
async def register(data: UserRegister):
    if await db.users.find_one({"email": data.email.lower()}):
        raise HTTPException(409, "Email already registered")
    uid = str(uuid.uuid4())
    # Random location near Madrid (so demo seeds appear nearby)
    lat = 40.4168 + random.uniform(-0.05, 0.05)
    lon = -3.7038 + random.uniform(-0.05, 0.05)
    user = {
        "id": uid, "email": data.email.lower(), "password_hash": hash_pw(data.password),
        "name": data.name, "age": data.age, "bio": data.bio or "",
        "gender": data.gender, "looking_for": data.looking_for,
        "photo": None, "photos": [], "interests": [],
        "latitude": lat, "longitude": lon,
        "is_premium": False, "blocked": [], "boost_until": None,
        "last_active": datetime.now(timezone.utc).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.users.insert_one(user)
    # Auto-generate taps from demo users so new user feels popular
    demo_users = await db.users.find({"email": {"$regex": "^demo"}}, {"_id": 0, "id": 1}).to_list(50)
    if demo_users:
        tap_types = ["flame", "wave", "heart", "eye", "kiss"]
        sample_size = min(8, len(demo_users))
        for sender in random.sample(demo_users, sample_size):
            await db.taps.insert_one({
                "id": str(uuid.uuid4()),
                "from_user_id": sender["id"],
                "to_user_id": uid,
                "tap_type": random.choice(tap_types),
                "created_at": (datetime.now(timezone.utc) - timedelta(minutes=random.randint(1, 120))).isoformat(),
            })
    return TokenResponse(access_token=create_token(uid), user=user_to_public(user))


@api_router.post("/auth/login", response_model=TokenResponse)
async def login(data: UserLogin):
    user = await db.users.find_one({"email": data.email.lower()})
    if not user or not verify_pw(data.password, user["password_hash"]):
        raise HTTPException(401, "Invalid email or password")
    await db.users.update_one({"id": user["id"]}, {"$set": {"last_active": datetime.now(timezone.utc).isoformat()}})
    return TokenResponse(access_token=create_token(user["id"]), user=user_to_public(user))


@api_router.get("/auth/me")
async def me(current=Depends(get_current_user)):
    return {**user_to_public(current), "email": current.get("email"),
            "latitude": current.get("latitude"), "longitude": current.get("longitude")}


@api_router.delete("/auth/account")
async def delete_account(current=Depends(get_current_user)):
    uid = current["id"]
    await db.users.delete_one({"id": uid})
    await db.messages.delete_many({"$or": [{"from_user_id": uid}, {"to_user_id": uid}]})
    await db.taps.delete_many({"$or": [{"from_user_id": uid}, {"to_user_id": uid}]})
    return {"deleted": True}


# ============ Profile ============
@api_router.put("/profile")
async def update_profile(data: ProfileUpdate, current=Depends(get_current_user)):
    update = {k: v for k, v in data.dict().items() if v is not None}
    if "photos" in update and len(update["photos"]) > 6:
        update["photos"] = update["photos"][:6]
    if "photos" in update and update["photos"] and not update.get("photo"):
        update["photo"] = update["photos"][0]
    update["last_active"] = datetime.now(timezone.utc).isoformat()
    if update:
        await db.users.update_one({"id": current["id"]}, {"$set": update})
    fresh = await db.users.find_one({"id": current["id"]}, {"_id": 0, "password_hash": 0})
    return user_to_public(fresh)


# ============ Discover ============
@api_router.get("/users/nearby")
async def nearby(current=Depends(get_current_user)):
    blocked = set(current.get("blocked", []))
    query: dict = {"id": {"$ne": current["id"], "$nin": list(blocked)}}
    # Orientation filter: only show users whose gender matches what current is looking for
    looking_for = current.get("looking_for")
    if looking_for and looking_for != "both":
        query["gender"] = looking_for
    cursor = db.users.find(query, {"_id": 0, "password_hash": 0, "email": 0})
    users = await cursor.to_list(500)
    results = [user_to_public(u, current) for u in users]
    # Boosted users first, then online, then by distance
    results.sort(key=lambda x: (
        not x.get("is_boosted"),
        not x.get("is_online"),
        x["distance_km"] if x["distance_km"] is not None else 9999
    ))
    return results


@api_router.get("/users/daily-picks")
async def daily_picks_endpoint(current=Depends(get_current_user)):
    """3 curated users for today based on common interests + photo + verified."""
    my_interests = set(current.get("interests", []))
    blocked = set(current.get("blocked", []))
    query: dict = {
        "id": {"$ne": current["id"], "$nin": list(blocked)},
        "photo": {"$ne": None}
    }
    looking_for = current.get("looking_for")
    if looking_for and looking_for != "both":
        query["gender"] = looking_for
    cursor = db.users.find(query, {"_id": 0, "password_hash": 0, "email": 0})
    all_users = await cursor.to_list(200)
    scored = []
    for u in all_users:
        u_interests = set(u.get("interests", []))
        score = len(my_interests & u_interests) * 3
        if u.get("verified"): score += 2
        if u.get("is_boosted"): score += 1
        scored.append((score, u))
    scored.sort(key=lambda x: x[0], reverse=True)
    return [user_to_public(u, current) for _, u in scored[:3]]


@api_router.get("/users/{user_id}")
async def get_user(user_id: str, current=Depends(get_current_user)):
    u = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0, "email": 0})
    if not u: raise HTTPException(404, "User not found")
    return user_to_public(u, current)


# ============ Boost ============
@api_router.post("/boost/activate")
async def boost(current=Depends(get_current_user)):
    # 1H boost (in real app, this would gate on premium/payment)
    until = (datetime.now(timezone.utc) + timedelta(hours=1)).isoformat()
    await db.users.update_one({"id": current["id"]}, {"$set": {"boost_until": until}})
    return {"boost_until": until}


# ============ Chat ============
@api_router.post("/messages")
async def send_message(data: MessageCreate, current=Depends(get_current_user)):
    if not await db.users.find_one({"id": data.to_user_id}):
        raise HTTPException(404, "User not found")
    # Content moderation
    if contains_prohibited(data.text):
        await db.reports.insert_one({
            "id": str(uuid.uuid4()),
            "from_user_id": "system",
            "target_user_id": current["id"],
            "reason": "auto_filter_prohibited",
            "context": data.text[:200],
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        raise HTTPException(400, "Tu mensaje contiene términos no permitidos. Revisa las Normas de Comunidad.")
    # Rate limit: 30 messages per minute (anti-spam)
    one_min_ago = datetime.now(timezone.utc) - timedelta(minutes=1)
    recent = await db.messages.count_documents({
        "from_user_id": current["id"],
        "created_at": {"$gte": one_min_ago.isoformat()}
    })
    if recent >= 30:
        raise HTTPException(429, "Estás enviando mensajes muy rápido. Inténtalo en un minuto.")
    msg = {
        "id": str(uuid.uuid4()),
        "conversation_id": conv_id(current["id"], data.to_user_id),
        "from_user_id": current["id"], "to_user_id": data.to_user_id,
        "text": data.text, "read": False,
        "kind": "text",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.messages.insert_one(msg)
    msg.pop("_id", None)
    return msg


# ============ Gifts (Élite tier) ============
GIFT_THRESHOLD_FREE = 3  # free users: up to 3 gifts / 24h
GIFT_PREMIUM_TYPES = {"diamond", "emerald_heart"}  # premium-only gifts

@api_router.post("/gifts/send")
async def send_gift(data: GiftSend, current=Depends(get_current_user)):
    if not await db.users.find_one({"id": data.to_user_id}):
        raise HTTPException(404, "User not found")
    # Premium gate on luxury gifts
    if data.gift_type in GIFT_PREMIUM_TYPES and not current.get("is_premium"):
        raise HTTPException(402, "Este regalo es exclusivo de VEIL Élite.")
    # Rate-limit free users (3 gifts / 24h)
    if not current.get("is_premium"):
        one_day_ago = datetime.now(timezone.utc) - timedelta(hours=24)
        sent_today = await db.messages.count_documents({
            "from_user_id": current["id"], "kind": "gift",
            "created_at": {"$gte": one_day_ago.isoformat()}
        })
        if sent_today >= GIFT_THRESHOLD_FREE:
            raise HTTPException(429, "Has alcanzado el límite diario de regalos. Mejora a Élite para ilimitados.")
    msg = {
        "id": str(uuid.uuid4()),
        "conversation_id": conv_id(current["id"], data.to_user_id),
        "from_user_id": current["id"], "to_user_id": data.to_user_id,
        "text": "", "read": False,
        "kind": "gift", "gift_type": data.gift_type,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.messages.insert_one(msg)
    msg.pop("_id", None)
    return msg


# ============ Reveal Filter (Privé tier) ============
REVEAL_MESSAGE_THRESHOLD = 3  # each side must send >= 3 messages

async def _reveal_status_for(uid_a: str, uid_b: str) -> dict:
    cid = conv_id(uid_a, uid_b)
    a_count = await db.messages.count_documents({"conversation_id": cid, "from_user_id": uid_a})
    b_count = await db.messages.count_documents({"conversation_id": cid, "from_user_id": uid_b})
    manual = await db.reveals.find_one({"conversation_id": cid})
    auto_revealed = a_count >= REVEAL_MESSAGE_THRESHOLD and b_count >= REVEAL_MESSAGE_THRESHOLD
    manually_revealed = bool(manual)
    revealed = auto_revealed or manually_revealed
    return {
        "revealed": revealed,
        "auto_revealed": auto_revealed,
        "manually_revealed": manually_revealed,
        "my_messages": a_count,
        "their_messages": b_count,
        "threshold": REVEAL_MESSAGE_THRESHOLD,
    }

@api_router.get("/reveal/{user_id}")
async def get_reveal_status(user_id: str, current=Depends(get_current_user)):
    return await _reveal_status_for(current["id"], user_id)

@api_router.post("/reveal/{user_id}")
async def reveal_now(user_id: str, current=Depends(get_current_user)):
    if not current.get("is_premium"):
        raise HTTPException(402, "Revelación manual exclusiva de VEIL Privé.")
    cid = conv_id(current["id"], user_id)
    existing = await db.reveals.find_one({"conversation_id": cid})
    if not existing:
        await db.reveals.insert_one({
            "id": str(uuid.uuid4()),
            "conversation_id": cid,
            "revealed_by": current["id"],
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
    return await _reveal_status_for(current["id"], user_id)


@api_router.get("/messages/{user_id}")
async def get_conversation(user_id: str, current=Depends(get_current_user)):
    cid = conv_id(current["id"], user_id)
    msgs = await db.messages.find({"conversation_id": cid}, {"_id": 0}).sort("created_at", 1).to_list(500)
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
        {"$group": {"_id": "$conversation_id", "last_message": {"$first": "$text"},
                    "last_at": {"$first": "$created_at"},
                    "from_user_id": {"$first": "$from_user_id"},
                    "to_user_id": {"$first": "$to_user_id"}}},
        {"$sort": {"last_at": -1}}
    ]
    convs = await db.messages.aggregate(pipeline).to_list(100)
    result = []
    for c in convs:
        other_id = c["to_user_id"] if c["from_user_id"] == uid else c["from_user_id"]
        other = await db.users.find_one({"id": other_id}, {"_id": 0, "password_hash": 0, "email": 0})
        if other:
            result.append({"user": user_to_public(other, current),
                          "last_message": c["last_message"], "last_at": c["last_at"]})
    return result


# ============ TAP ============
@api_router.post("/taps")
async def send_tap(data: TapCreate, current=Depends(get_current_user)):
    if not await db.users.find_one({"id": data.to_user_id}):
        raise HTTPException(404, "User not found")
    tap = {
        "id": str(uuid.uuid4()),
        "from_user_id": current["id"], "to_user_id": data.to_user_id,
        "tap_type": data.tap_type,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.taps.insert_one(tap)
    tap.pop("_id", None)
    # Detect mutual match: did the target also tap me back?
    reciprocal = await db.taps.find_one({
        "from_user_id": data.to_user_id,
        "to_user_id": current["id"]
    })
    is_match = reciprocal is not None
    return {**tap, "is_match": is_match}


@api_router.get("/matches")
async def get_matches(current=Depends(get_current_user)):
    """Mutual taps = matches. Returns users I tapped AND tapped me back."""
    uid = current["id"]
    sent = await db.taps.find({"from_user_id": uid}, {"_id": 0, "to_user_id": 1}).to_list(500)
    sent_ids = set(t["to_user_id"] for t in sent)
    received = await db.taps.find({"to_user_id": uid}, {"_id": 0, "from_user_id": 1}).to_list(500)
    received_ids = set(t["from_user_id"] for t in received)
    match_ids = sent_ids & received_ids
    result = []
    for mid in match_ids:
        u = await db.users.find_one({"id": mid}, {"_id": 0, "password_hash": 0, "email": 0})
        if u: result.append(user_to_public(u, current))
    return result


@api_router.get("/taps/received")
async def taps_received(current=Depends(get_current_user)):
    cursor = db.taps.find({"to_user_id": current["id"]}, {"_id": 0}).sort("created_at", -1)
    taps = await cursor.to_list(100)
    is_premium = current.get("is_premium", False)
    enriched = []
    for i, t in enumerate(taps):
        sender = await db.users.find_one({"id": t["from_user_id"]}, {"_id": 0, "password_hash": 0, "email": 0})
        if sender:
            # Free users see blurred names + first 2 taps; premium sees all
            if not is_premium and i >= 2:
                enriched.append({**t, "from_user": {
                    "id": "locked", "name": "?", "age": 0, "photo": None, "photos": [],
                    "bio": "", "interests": [], "distance_km": None, "is_premium": False, "is_online": False,
                }, "locked": True})
            else:
                enriched.append({**t, "from_user": user_to_public(sender, current), "locked": False})
    return enriched


@api_router.get("/taps/count")
async def taps_count(current=Depends(get_current_user)):
    n = await db.taps.count_documents({"to_user_id": current["id"]})
    return {"count": n}


# ============ Block / Report ============
@api_router.post("/block")
async def block_user(data: BlockReport, current=Depends(get_current_user)):
    await db.users.update_one({"id": current["id"]}, {"$addToSet": {"blocked": data.target_user_id}})
    return {"blocked": True}


@api_router.post("/report")
async def report_user(data: BlockReport, current=Depends(get_current_user)):
    await db.reports.insert_one({
        "id": str(uuid.uuid4()),
        "from_user_id": current["id"], "target_user_id": data.target_user_id,
        "reason": data.reason, "created_at": datetime.now(timezone.utc).isoformat(),
    })
    return {"reported": True}


# ============ Seed (rich demo data) ============
DEMO_WOMEN = [
    {"name": "Lucía", "age": 27, "bio": "Café de especialidad y libros que duelen.", "photo": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600", "interests": ["☕ Café", "📖 Libros", "🎬 Cine"], "gender": "woman", "looking_for": "man"},
    {"name": "Carmen", "age": 30, "bio": "Bailar hasta que duelan los pies.", "photo": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600", "interests": ["💃 Danza", "🎵 Música", "🍷 Vino"], "gender": "woman", "looking_for": "man"},
    {"name": "Sofía", "age": 25, "bio": "Diseñadora gráfica. Caos creativo.", "photo": "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600", "interests": ["🎨 Diseño", "📷 Foto", "🌃 Noche"], "gender": "woman", "looking_for": "both"},
    {"name": "Valeria", "age": 28, "bio": "Yoga al amanecer, vino al anochecer.", "photo": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600", "interests": ["🧘 Yoga", "🍷 Vino", "🌿 Plantas"], "gender": "woman", "looking_for": "woman"},
    {"name": "Elena", "age": 32, "bio": "Arquitecta. Detalles importan.", "photo": "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=600", "interests": ["🏛️ Arte", "📐 Diseño", "✈️ Viajes"], "gender": "woman", "looking_for": "man"},
    {"name": "Marta", "age": 26, "bio": "Periodista, cinéfila, fan del jazz.", "photo": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600", "interests": ["📰 News", "🎬 Cine", "🎷 Jazz"], "gender": "woman", "looking_for": "man"},
    {"name": "Paula", "age": 29, "bio": "Médica. Cariñosa pero con límites.", "photo": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600", "interests": ["🩺 Salud", "🌊 Mar", "🐕 Perros"], "gender": "woman", "looking_for": "both"},
    {"name": "Ana", "age": 31, "bio": "Profesora. Mochilera. Curiosa siempre.", "photo": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600", "interests": ["📚 Educar", "🎒 Viajar", "🍵 Té"], "gender": "woman", "looking_for": "man"},
    {"name": "Irene", "age": 24, "bio": "Pintora y soñadora profesional.", "photo": "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=600", "interests": ["🎨 Pintar", "🌅 Amaneceres", "🍰 Repostería"], "gender": "woman", "looking_for": "woman"},
    {"name": "Clara", "age": 28, "bio": "Música clásica + electrónica los findes.", "photo": "https://images.unsplash.com/photo-1463453091185-61582044d556?w=600", "interests": ["🎻 Música", "🎧 DJ", "🍸 Cócteles"], "gender": "woman", "looking_for": "man"},
    {"name": "Daniela", "age": 33, "bio": "Empresaria. Directa, leal, intensa.", "photo": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600", "interests": ["💼 Negocios", "🥂 Vino", "✈️ Viajes"], "gender": "woman", "looking_for": "man"},
    {"name": "Beatriz", "age": 26, "bio": "Veterinaria. Toda con peludos.", "photo": "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=600", "interests": ["🐾 Animales", "🌳 Naturaleza", "📚 Lectura"], "gender": "woman", "looking_for": "both"},
    {"name": "Natalia", "age": 30, "bio": "Chef pastelera. Conquisto con tartas.", "photo": "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=600", "interests": ["🍰 Repostería", "🍷 Vino", "🌱 Huerto"], "gender": "woman", "looking_for": "man"},
    {"name": "Carolina", "age": 27, "bio": "Bailarina contemporánea. Cuerpo y emoción.", "photo": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600", "interests": ["💃 Danza", "🎭 Arte", "🧘 Cuerpo"], "gender": "woman", "looking_for": "woman"},
    {"name": "Rocío", "age": 29, "bio": "Abogada de día, surfista los findes.", "photo": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600", "interests": ["⚖️ Ley", "🏄 Surf", "🌊 Mar"], "gender": "woman", "looking_for": "man"},
]

DEMO_USERS = [
    {"name": "Mateo", "age": 28, "bio": "Café, libros, cine de autor. Madrid centro.", "photo": "https://images.unsplash.com/photo-1628784962048-06b620cfcf45?w=600", "interests": ["☕ Café", "📖 Libros", "🎬 Cine"]},
    {"name": "Diego", "age": 31, "bio": "Música electrónica, viajes, gym a las 7am.", "photo": "https://images.unsplash.com/photo-1770894807821-e2e511bf59df?w=600", "interests": ["🎵 Música", "✈️ Viajes", "💪 Gym"]},
    {"name": "Adrián", "age": 25, "bio": "Arquitecto. Amante del arte y la noche.", "photo": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600", "interests": ["🏛️ Arte", "📐 Diseño", "🌃 Noche"]},
    {"name": "Pablo", "age": 34, "bio": "Chef. Cocino, comparto, vivo intensamente.", "photo": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600", "interests": ["🍽️ Cocina", "🍷 Vinos", "🌱 Jardín"]},
    {"name": "Alejandro", "age": 29, "bio": "Runner, fotógrafo y perro lover.", "photo": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=600", "interests": ["🏃 Running", "📸 Foto", "🐕 Perros"]},
    {"name": "Iván", "age": 26, "bio": "Programador honesto y curioso.", "photo": "https://images.unsplash.com/photo-1463453091185-61582044d556?w=600", "interests": ["💻 Tech", "🎮 Gaming", "🍕 Pizza"]},
    {"name": "Sergio", "age": 32, "bio": "Yoga, meditación, conexiones reales.", "photo": "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=600", "interests": ["🧘 Yoga", "🌿 Naturaleza", "📚 Lectura"]},
    {"name": "Hugo", "age": 27, "bio": "Diseñador gráfico. Vinilos y conciertos.", "photo": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600", "interests": ["🎨 Diseño", "🎸 Música", "📀 Vinilo"]},
    {"name": "Nico", "age": 30, "bio": "Abogado de día, DJ de fin de semana.", "photo": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600", "interests": ["⚖️ Ley", "🎧 DJ", "🍸 Cócteles"]},
    {"name": "Bruno", "age": 24, "bio": "Estudio medicina. Honesto y directo.", "photo": "https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?w=600", "interests": ["🩺 Salud", "🌊 Mar", "📷 Foto"]},
    {"name": "Daniel", "age": 33, "bio": "Profesor de español. Latino orgulloso.", "photo": "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=600", "interests": ["📚 Educar", "🥘 Tapas", "💃 Salsa"]},
    {"name": "Marcos", "age": 28, "bio": "Skater. Tatuajes. Energía calma.", "photo": "https://images.unsplash.com/photo-1542327897-d73f4005b533?w=600", "interests": ["🛹 Skate", "🎨 Tattoo", "🧘 Calma"]},
    {"name": "Javier", "age": 35, "bio": "Empresario. Busco algo real.", "photo": "https://images.unsplash.com/photo-1480429370139-e0132c086e2a?w=600", "interests": ["💼 Negocios", "✈️ Viajar", "🥂 Vino"]},
    {"name": "Lucas", "age": 23, "bio": "Estudiante de cine. Amante del drama.", "photo": "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=600", "interests": ["🎬 Cine", "📝 Escribir", "☕ Café"]},
    {"name": "Andrés", "age": 31, "bio": "Personal trainer. Disciplina + ternura.", "photo": "https://images.unsplash.com/photo-1583468982228-19f19164aee2?w=600", "interests": ["💪 Fitness", "🥗 Sano", "🌅 Amaneceres"]},
    {"name": "Rubén", "age": 27, "bio": "Periodista. Pregunto demasiado.", "photo": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=600", "interests": ["📰 News", "🎤 Podcasts", "✏️ Escribir"]},
    {"name": "Óscar", "age": 29, "bio": "Bailarín contemporáneo. Cuerpo y alma.", "photo": "https://images.unsplash.com/photo-1554384645-13eab165c24b?w=600", "interests": ["💃 Danza", "🎭 Arte", "🧘 Cuerpo"]},
    {"name": "Tomás", "age": 26, "bio": "Mochilero. He visitado 30 países.", "photo": "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=600", "interests": ["🎒 Viajar", "🏔️ Montaña", "📸 Foto"]},
    {"name": "Ramón", "age": 32, "bio": "Veterinario. Cuido animales y personas.", "photo": "https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?w=600", "interests": ["🐾 Animales", "🌳 Aire libre", "🚴 Bici"]},
    {"name": "Fernando", "age": 36, "bio": "Maduro, seguro, calmado. Sin dramas.", "photo": "https://images.unsplash.com/photo-1559548331-f9cb98001426?w=600", "interests": ["🍷 Vino", "📚 Filosofía", "🎩 Estilo"]},
    {"name": "César", "age": 25, "bio": "Músico. Guitarra, voz, alma rota.", "photo": "https://images.unsplash.com/photo-1488161628813-04466f872be2?w=600", "interests": ["🎸 Música", "🌧️ Lluvia", "☕ Café"]},
    {"name": "Gonzalo", "age": 30, "bio": "Ingeniero. Lógica + corazón.", "photo": "https://images.unsplash.com/photo-1521119989659-a83eee488004?w=600", "interests": ["⚙️ Ingeniería", "🧩 Puzzles", "🍺 Cerveza"]},
    {"name": "Roberto", "age": 28, "bio": "Estilista. La belleza está en los detalles.", "photo": "https://images.unsplash.com/photo-1500336624523-d727130c3328?w=600", "interests": ["💇 Belleza", "🛍️ Moda", "🎨 Color"]},
    {"name": "Manuel", "age": 33, "bio": "Bombero. Protejo lo que importa.", "photo": "https://images.unsplash.com/photo-1496346236646-50e985039814?w=600", "interests": ["🚒 Rescate", "💪 Fuerza", "🌊 Mar"]},
    {"name": "Felipe", "age": 26, "bio": "Estudio fotografía. Capturo momentos.", "photo": "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=600", "interests": ["📷 Foto", "🌆 Ciudad", "☕ Cafetería"]},
    {"name": "Eduardo", "age": 31, "bio": "Profesional del marketing. Creativo.", "photo": "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600", "interests": ["💡 Ideas", "📈 Crecer", "🌃 Salir"]},
]

DEMO_PROMPTS_POOL = [
    {"q": "Detrás de mi velo hay...", "a": "más curiosidad de la que aparento"},
    {"q": "Mi cita ideal sería...", "a": "una cena lenta y conversación que no termine"},
    {"q": "Lo que me hace reír...", "a": "el humor inteligente y un poco oscuro"},
    {"q": "Mi guilty pleasure...", "a": "reggaetón a las 3am en mi cocina"},
    {"q": "Lo más romántico que he hecho...", "a": "una carta a mano"},
    {"q": "Domingo perfecto...", "a": "brunch, mercadillo y siesta abrazado"},
    {"q": "Banderas verdes...", "a": "se hace responsable de sus emociones"},
    {"q": "Antes de morir quiero...", "a": "vivir un mes en Tokio"},
]

@api_router.post("/seed")
async def seed_demo_users():
    count = await db.users.count_documents({"email": {"$regex": "^demo[0-9]"}})
    has_review = await db.users.find_one({"email": "review@veil.app"})

    inserted = 0
    now = datetime.now(timezone.utc)

    # Ensure App Review demo account exists (idempotent, Premium-enabled per Apple Guideline)
    review_uid = None
    if has_review:
        review_uid = has_review["id"]
        # Always reset password to documented value
        await db.users.update_one({"id": review_uid}, {"$set": {
            "password_hash": hash_pw("AppReview2026!"),
            "is_premium": True,
            "name": "App Review",
            "age": 30,
            "gender": "man",
            "looking_for": "both",
        }})
    else:
        review_uid = str(uuid.uuid4())
        await db.users.insert_one({
            "id": review_uid,
            "email": "review@veil.app",
            "password_hash": hash_pw("AppReview2026!"),
            "name": "App Review", "age": 30,
            "bio": "Cuenta de demostración para Apple App Review.",
            "photo": None, "photos": [], "interests": ["📱 Tech"],
            "gender": "man", "looking_for": "both",
            "latitude": 40.4168, "longitude": -3.7038,
            "is_premium": True, "blocked": [], "boost_until": None,
            "last_active": now.isoformat(), "created_at": now.isoformat(),
        })

    if count < len(DEMO_USERS):
        for i, d in enumerate(DEMO_USERS):
            email = f"demo{i+1}@veil.app"
            if await db.users.find_one({"email": email}):
                continue
            lat = 40.4168 + random.uniform(-0.08, 0.08)
            lon = -3.7038 + random.uniform(-0.08, 0.08)
            minutes_ago = random.choices([1, 5, 15, 30, 60, 180, 720], weights=[20, 25, 20, 15, 10, 7, 3])[0]
            last_active = (now - timedelta(minutes=minutes_ago)).isoformat()
            is_boosted = random.random() < 0.15
            boost_until = (now + timedelta(minutes=random.randint(5, 55))).isoformat() if is_boosted else None
            user_prompts = random.sample(DEMO_PROMPTS_POOL, k=random.randint(2, 3))
            # Original DEMO_USERS are male
            looking = random.choice(["woman", "man", "both"])
            await db.users.insert_one({
                "id": str(uuid.uuid4()),
                "email": email, "password_hash": hash_pw("DemoPass123"),
                "name": d["name"], "age": d["age"], "bio": d["bio"],
                "photo": d["photo"], "photos": [d["photo"]],
                "interests": d["interests"],
                "prompts": user_prompts,
                "verified": random.random() < 0.5,
                "gender": "man", "looking_for": looking,
                "latitude": lat, "longitude": lon,
                "is_premium": random.random() < 0.2,
                "blocked": [], "boost_until": boost_until,
                "last_active": last_active,
                "onboarded": True,
                "created_at": now.isoformat(),
            })
            inserted += 1

    # Insert DEMO_WOMEN (emails demowN@veil.app)
    women_count = await db.users.count_documents({"email": {"$regex": "^demow"}})
    if women_count < len(DEMO_WOMEN):
        for i, d in enumerate(DEMO_WOMEN):
            email = f"demow{i+1}@veil.app"
            if await db.users.find_one({"email": email}):
                continue
            lat = 40.4168 + random.uniform(-0.08, 0.08)
            lon = -3.7038 + random.uniform(-0.08, 0.08)
            minutes_ago = random.choices([1, 5, 15, 30, 60, 180, 720], weights=[20, 25, 20, 15, 10, 7, 3])[0]
            last_active = (now - timedelta(minutes=minutes_ago)).isoformat()
            is_boosted = random.random() < 0.15
            boost_until = (now + timedelta(minutes=random.randint(5, 55))).isoformat() if is_boosted else None
            user_prompts = random.sample(DEMO_PROMPTS_POOL, k=random.randint(2, 3))
            await db.users.insert_one({
                "id": str(uuid.uuid4()),
                "email": email, "password_hash": hash_pw("DemoPass123"),
                "name": d["name"], "age": d["age"], "bio": d["bio"],
                "photo": d["photo"], "photos": [d["photo"]],
                "interests": d["interests"],
                "prompts": user_prompts,
                "verified": random.random() < 0.6,
                "gender": d["gender"], "looking_for": d["looking_for"],
                "latitude": lat, "longitude": lon,
                "is_premium": random.random() < 0.25,
                "blocked": [], "boost_until": boost_until,
                "last_active": last_active,
                "onboarded": True,
                "created_at": now.isoformat(),
            })
            inserted += 1

    # Backfill gender on existing demo* (men) users that don't have it
    await db.users.update_many(
        {"email": {"$regex": "^demo[0-9]"}, "gender": {"$exists": False}},
        {"$set": {"gender": "man", "looking_for": "woman"}}
    )
    # Backfill gender on existing demow users (women) — also set looking_for if missing
    await db.users.update_many(
        {"email": {"$regex": "^demow"}, "gender": {"$exists": False}},
        {"$set": {"gender": "woman", "looking_for": "man"}}
    )

    # Backfill prompts/verified on existing demo users that don't have them
    async for u in db.users.find({"email": {"$regex": "^demo"}, "prompts": {"$exists": False}}):
        await db.users.update_one({"id": u["id"]}, {"$set": {
            "prompts": random.sample(DEMO_PROMPTS_POOL, k=random.randint(2, 3)),
            "verified": random.random() < 0.5,
            "onboarded": True,
        }})

    # Auto-generate 10 received TAPs for review account if it has none (for App Review UX demo)
    review_taps = await db.taps.count_documents({"to_user_id": review_uid})
    if review_taps < 5:
        demo_senders = await db.users.find({"email": {"$regex": "^demo"}}, {"_id": 0, "id": 1}).to_list(50)
        tap_types = ["flame", "wave", "heart", "eye", "kiss", "drink"]
        for sender in random.sample(demo_senders, min(10, len(demo_senders))):
            await db.taps.insert_one({
                "id": str(uuid.uuid4()),
                "from_user_id": sender["id"],
                "to_user_id": review_uid,
                "tap_type": random.choice(tap_types),
                "created_at": (now - timedelta(minutes=random.randint(1, 180))).isoformat(),
            })

    # Cleanup: remove any stale users with empty/no photo and generic test names (Apple visual quality)
    await db.users.delete_many({
        "$and": [
            {"email": {"$not": {"$regex": "^(demo|review)"}}},
            {"$or": [{"photo": None}, {"photo": ""}]},
            {"name": {"$regex": "^(Test|Guzman|Alex|App Review)$", "$options": "i"}}
        ]
    })

    return {"seeded": True, "inserted": inserted, "review_account": "review@veil.app"}


@api_router.get("/")
async def root():
    return {"app": "VEIL", "status": "ok"}


app.include_router(api_router)
app.add_middleware(CORSMiddleware, allow_credentials=True, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
