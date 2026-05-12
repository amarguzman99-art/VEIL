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

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class ProfileUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=50)
    bio: Optional[str] = Field(None, max_length=300)
    photo: Optional[str] = None
    photos: Optional[List[str]] = None
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
        "distance_km": dist,
        "is_premium": u.get("is_premium", False),
        "is_online": online,
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
    cursor = db.users.find(
        {"id": {"$ne": current["id"], "$nin": list(blocked)}},
        {"_id": 0, "password_hash": 0, "email": 0}
    )
    users = await cursor.to_list(500)
    results = [user_to_public(u, current) for u in users]
    # Boosted users first, then online, then by distance
    results.sort(key=lambda x: (
        not x.get("is_boosted"),
        not x.get("is_online"),
        x["distance_km"] if x["distance_km"] is not None else 9999
    ))
    return results


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
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.messages.insert_one(msg)
    msg.pop("_id", None)
    return msg


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
    return tap


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

@api_router.post("/seed")
async def seed_demo_users():
    count = await db.users.count_documents({"email": {"$regex": "^demo"}})
    if count >= len(DEMO_USERS):
        return {"seeded": False, "existing": count}
    inserted = 0
    now = datetime.now(timezone.utc)
    for i, d in enumerate(DEMO_USERS):
        email = f"demo{i+1}@veil.app"
        if await db.users.find_one({"email": email}):
            continue
        # Random location near Madrid centro
        lat = 40.4168 + random.uniform(-0.08, 0.08)
        lon = -3.7038 + random.uniform(-0.08, 0.08)
        # Last active in last 60 minutes (most online)
        minutes_ago = random.choices([1, 5, 15, 30, 60, 180, 720], weights=[20, 25, 20, 15, 10, 7, 3])[0]
        last_active = (now - timedelta(minutes=minutes_ago)).isoformat()
        is_boosted = random.random() < 0.15
        boost_until = (now + timedelta(minutes=random.randint(5, 55))).isoformat() if is_boosted else None
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": email, "password_hash": hash_pw("DemoPass123"),
            "name": d["name"], "age": d["age"], "bio": d["bio"],
            "photo": d["photo"], "photos": [d["photo"]],
            "interests": d["interests"],
            "latitude": lat, "longitude": lon,
            "is_premium": random.random() < 0.2,
            "blocked": [], "boost_until": boost_until,
            "last_active": last_active,
            "created_at": now.isoformat(),
        })
        inserted += 1
    return {"seeded": True, "inserted": inserted}


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
