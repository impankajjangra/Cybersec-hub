from fastapi import FastAPI, APIRouter, HTTPException, Request, BackgroundTasks, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Dict, Optional, Any
import uuid
from datetime import datetime, timezone
import nmap
import asyncio
import httpx
from telegram import Bot
import whois
import dns.resolver
from sklearn.ensemble import RandomForestClassifier
import numpy as np
import joblib
import shodan
from passlib.context import CryptContext
from models import UserSignup, LoginModel
from auth import create_token, verify_token
from otp_service import generate_otp, send_email_otp


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────
#  AUTH HELPER – extract user_id from JWT token
# ─────────────────────────────────────────────

def get_current_user(request: Request) -> str:
    """Extract user email/id from Authorization header token."""
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = auth.split(" ", 1)[1]
    try:
        payload = verify_token(token)
        return payload["sub"]
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


# ─────────────────────────────────────────────
#  PYDANTIC MODELS
# ─────────────────────────────────────────────

class ResetPassword(BaseModel):
    email: str
    new_password: str

class OAuthUser(BaseModel):
    email: str

class NetworkScanRequest(BaseModel):
    target: str
    scan_type: str = "quick"

class NetworkScanResult(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    target: str
    scan_type: str
    status: str
    results: Dict[str, Any]
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class OSINTRequest(BaseModel):
    query: str
    query_type: str

class ThreatDetectionRequest(BaseModel):
    scan_id: str

class TelegramSendRequest(BaseModel):
    chat_id: str
    message: str

class TelegramConfig(BaseModel):
    chat_id: str
    enabled: bool = True


# ─────────────────────────────────────────────
#  PASSWORD UTILS
# ─────────────────────────────────────────────

pwd_context = CryptContext(schemes=["bcrypt"])

def hash_password(password):
    password = password[:72]
    return pwd_context.hash(password)

def verify_password(password, hashed):
    password = password[:72]
    return pwd_context.verify(password, hashed)


# ─────────────────────────────────────────────
#  AI MODEL
# ─────────────────────────────────────────────

rf_model = RandomForestClassifier(n_estimators=100, random_state=42)

def init_rf_model():
    X_train = np.array([
        [80, 1, 100, 0], [443, 1, 150, 0], [22, 1, 120, 0], [23, 0, 50, 1],
        [21, 1, 80, 0], [3389, 0, 200, 1], [445, 0, 180, 1], [8080, 1, 90, 0],
        [3306, 1, 110, 0], [1433, 0, 160, 1],
    ])
    y_train = np.array([0, 0, 0, 2, 0, 1, 1, 0, 0, 2])
    rf_model.fit(X_train, y_train)

init_rf_model()


# ─────────────────────────────────────────────
#  TELEGRAM BOT
# ─────────────────────────────────────────────

telegram_bot = None
TELEGRAM_TOKEN = os.getenv('TELEGRAM_TOKEN', '')
if TELEGRAM_TOKEN:
    telegram_bot = Bot(token=TELEGRAM_TOKEN)


# ─────────────────────────────────────────────
#  AUTH ENDPOINTS
# ─────────────────────────────────────────────

@app.post("/auth/microsoft")
async def microsoft_login(user: OAuthUser):
    existing = await db.users.find_one({"email": user.email})
    if not existing:
        await db.users.insert_one({
            "email": user.email,
            "verified": True,
            "plan": "free",
            "search_count": 0
        })
    token = create_token(user.email)
    return {"token": token}


@app.post("/auth/signup")
async def signup(user: UserSignup):
    # Check if email already registered
    existing = await db.users.find_one({"email": user.email})
    if existing:
        raise HTTPException(400, "Email already registered")

    otp = generate_otp()

    # FIX 3: Actually send OTP via email (no mobile OTP)
    await send_email_otp(user.email, otp)
    # OTP is always shown in terminal as fallback even if email fails

    await db.users.insert_one({
        "name": user.name,
        "gender": user.gender,
        "email": user.email,
        # mobile field removed from required; store only if provided
        "password": hash_password(user.password),
        "email_otp": otp,
        "verified": False,
        "search_count": 0,
        "plan": "free"
    })

    return {"message": "OTP sent to your email"}


@app.post("/auth/verify")
async def verify(email: str, email_otp: str):
    # FIX 3: Only email OTP required — mobile_otp parameter removed
    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(404, "User not found")

    if user["email_otp"] != email_otp:
        raise HTTPException(400, "Invalid Email OTP")

    await db.users.update_one(
        {"email": email},
        {"$set": {"verified": True, "email_otp": None}}
    )
    return {"message": "Account verified"}


@app.post("/auth/login")
async def login(data: LoginModel):
    user = await db.users.find_one({"email": data.email})
    if not user:
        raise HTTPException(404, "User not found")
    if not user.get("verified", False):
        raise HTTPException(403, "Email not verified. Please verify your OTP first.")
    if not verify_password(data.password, user["password"]):
        raise HTTPException(401, "Wrong password")

    # FIX 2: Token carries email as subject (consistent identifier)
    token = create_token(data.email)
    return {"token": token}


@app.post("/auth/resend-otp")
async def resend_otp(email: str):
    otp = generate_otp()

    await send_email_otp(email, otp)

    await db.users.update_one(
        {"email": email},
        {"$set": {"email_otp": otp}}
    )
    return {"message": "OTP resent to your email"}


@app.post("/auth/reset-otp")
async def send_reset_otp(email: str):
    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(404, "No account found with this email")
    otp = generate_otp()
    await send_email_otp(email, otp, purpose="reset")
    await db.users.update_one({"email": email}, {"$set": {"reset_otp": otp}})
    return {"message": "OTP sent to your email"}


@app.post("/auth/reset-otp-verify")
async def verify_reset_otp(email: str, otp: str):
    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(404, "User not found")
    if user.get("reset_otp") != otp:
        raise HTTPException(400, "Invalid OTP")
    await db.users.update_one({"email": email}, {"$set": {"reset_otp": None}})
    return {"message": "OTP verified"}


@app.post("/auth/reset-password")
async def reset_password(data: ResetPassword):
    user = await db.users.find_one({"email": data.email})
    if not user:
        raise HTTPException(404, "User not found")
    hashed = hash_password(data.new_password)
    await db.users.update_one(
        {"email": data.email},
        {"$set": {"password": hashed}}
    )
    return {"message": "Password updated"}


# ─────────────────────────────────────────────
#  API ENDPOINTS (all user-scoped)
# ─────────────────────────────────────────────

@api_router.get("/")
async def root():
    return {"message": "CyberSec Hub API", "status": "operational"}


@api_router.post("/scan/network")
async def network_scan(
    request: NetworkScanRequest,
    background_tasks: BackgroundTasks,
    current_user: str = Depends(get_current_user)   # FIX 1
):
    try:
        scan_id = str(uuid.uuid4())
        scan_doc = {
            "id": scan_id,
            "user_id": current_user,              # FIX 1: tag with user
            "target": request.target,
            "scan_type": request.scan_type,
            "status": "running",
            "results": {},
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        await db.scans.insert_one(scan_doc)
        background_tasks.add_task(perform_network_scan, scan_id, request.target, request.scan_type)
        return {"scan_id": scan_id, "status": "started", "message": "Scan initiated"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Network scan error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


async def perform_network_scan(scan_id: str, target: str, scan_type: str):
    try:
        nm = nmap.PortScanner()
        scan_args = "-F" if scan_type == "quick" else "-sV"
        nm.scan(hosts=target, arguments=scan_args)

        results = {"hosts": {}, "scan_stats": nm.scanstats()}
        for host in nm.all_hosts():
            host_info = {"hostname": nm[host].hostname(), "state": nm[host].state(), "protocols": {}}
            for proto in nm[host].all_protocols():
                ports = nm[host][proto].keys()
                host_info["protocols"][proto] = {}
                for port in sorted(ports):
                    port_info = nm[host][proto][port]
                    host_info["protocols"][proto][str(port)] = {
                        "state": port_info["state"],
                        "name": port_info.get("name", "unknown"),
                        "product": port_info.get("product", ""),
                        "version": port_info.get("version", "")
                    }
            results["hosts"][host] = host_info

        await db.scans.update_one({"id": scan_id}, {"$set": {"status": "completed", "results": results}})
    except Exception as e:
        logger.error(f"Scan execution error: {str(e)}")
        await db.scans.update_one({"id": scan_id}, {"$set": {"status": "failed", "error": str(e)}})


@api_router.get("/scan/{scan_id}")
async def get_scan_result(scan_id: str, current_user: str = Depends(get_current_user)):
    # FIX 1: only return if belongs to current user
    scan = await db.scans.find_one({"id": scan_id, "user_id": current_user}, {"_id": 0})
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    return scan


@api_router.post("/osint/lookup")
async def osint_lookup(request: OSINTRequest, current_user: str = Depends(get_current_user)):
    try:
        results = {}
        async with httpx.AsyncClient(timeout=10) as http_client:
            try:
                whois_data = whois.whois(request.query)
                results["whois"] = {
                    "domain_name": str(whois_data.domain_name),
                    "registrar": str(whois_data.registrar),
                    "creation_date": str(whois_data.creation_date),
                    "expiration_date": str(whois_data.expiration_date)
                }
            except Exception as e:
                results["whois"] = {"error": str(e)}

            try:
                answers = dns.resolver.resolve(request.query, 'A')
                results["dns"] = {"a_records": [str(rdata) for rdata in answers]}
            except Exception as e:
                results["dns"] = {"error": str(e)}

            try:
                ipapi_response = await http_client.get(f"http://ip-api.com/json/{request.query}")
                results["ip_api"] = ipapi_response.json()
            except Exception as e:
                results["ip_api"] = {"error": str(e)}

            try:
                ipinfo_token = os.getenv("IPINFO_TOKEN")
                ipinfo_response = await http_client.get(f"https://ipinfo.io/{request.query}?token={ipinfo_token}")
                results["ipinfo"] = ipinfo_response.json()
            except Exception as e:
                results["ipinfo"] = {"error": str(e)}

            try:
                crt_response = await http_client.get(f"https://crt.sh/?q={request.query}&output=json")
                crt_data = crt_response.json()
                subdomains = list({entry["name_value"] for entry in crt_data})
                results["crt_sh"] = {"subdomains_found": len(subdomains), "sample": subdomains[:10]}
            except Exception as e:
                results["crt_sh"] = {"error": str(e)}

            try:
                vt_key = os.getenv("VIRUSTOTAL_API_KEY")
                vt_response = await http_client.get(
                    f"https://www.virustotal.com/api/v3/domains/{request.query}",
                    headers={"x-apikey": vt_key}
                )
                results["virustotal"] = vt_response.json()
            except Exception as e:
                results["virustotal"] = {"error": str(e)}

        try:
            shodan_key = os.getenv("SHODAN_API_KEY")
            api = shodan.Shodan(shodan_key)
            shodan_data = api.host(request.query)
            results["shodan"] = {
                "ip": shodan_data.get("ip_str"),
                "organization": shodan_data.get("org"),
                "ports": shodan_data.get("ports"),
                "os": shodan_data.get("os")
            }
        except Exception as e:
            results["shodan"] = {"error": str(e)}

        osint_doc = {
            "id": str(uuid.uuid4()),
            "user_id": current_user,             # FIX 1
            "query": request.query,
            "query_type": request.query_type,
            "results": results,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        result = await db.osint.insert_one(osint_doc)
        osint_doc["_id"] = str(result.inserted_id)
        return osint_doc

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"OSINT lookup error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.post("/threats/detect")
async def detect_threats(request: ThreatDetectionRequest, current_user: str = Depends(get_current_user)):
    try:
        # FIX 1: only allow threat detection on user's own scans
        scan = await db.scans.find_one({"id": request.scan_id, "user_id": current_user}, {"_id": 0})
        if not scan:
            raise HTTPException(status_code=404, detail="Scan not found")

        threats = []
        HIGH_RISK_PORTS = [21, 23, 445, 3389]
        MEDIUM_RISK_PORTS = [22, 80, 8080]

        if scan.get("results") and scan["results"].get("hosts"):
            for host, host_data in scan["results"]["hosts"].items():
                open_ports_count = 0
                for proto, ports in host_data.get("protocols", {}).items():
                    for port, port_info in ports.items():
                        port = int(port)
                        if port_info["state"] == "open":
                            open_ports_count += 1
                            risk_score = 0
                            classification = "Normal"
                            if port in HIGH_RISK_PORTS:
                                risk_score += 60
                                classification = "High Risk Service"
                            elif port in MEDIUM_RISK_PORTS:
                                risk_score += 30
                                classification = "Moderate Exposure"
                            features = np.array([[port, 1, 100, 0]])
                            prediction = rf_model.predict(features)[0]
                            confidence = float(np.max(rf_model.predict_proba(features)))
                            if prediction > 0:
                                risk_score += 20
                            threat_level = "high" if risk_score >= 70 else "medium" if risk_score >= 40 else "low"
                            if threat_level != "low":
                                threats.append({
                                    "host": host, "port": port,
                                    "service": port_info.get("name", "unknown"),
                                    "classification": classification,
                                    "confidence": confidence,
                                    "risk_score": risk_score,
                                    "threat_level": threat_level
                                })
                if open_ports_count > 5:
                    threats.append({
                        "host": host, "port": "multiple", "service": "multiple",
                        "classification": "Multiple Open Ports Detected",
                        "confidence": 0.9, "risk_score": 80, "threat_level": "high"
                    })

        overall_threat_level = (
            "high" if any(t["threat_level"] == "high" for t in threats) else
            "medium" if any(t["threat_level"] == "medium" for t in threats) else "low"
        )

        threat_doc = {
            "id": str(uuid.uuid4()),
            "user_id": current_user,             # FIX 1
            "scan_id": request.scan_id,
            "threat_level": overall_threat_level,
            "classification": "Threats Detected" if threats else "No Significant Threats",
            "confidence": 0.85,
            "details": {"total_threats": len(threats), "threats": threats},
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

        insert_result = await db.threats.insert_one(threat_doc)
        saved_threat = await db.threats.find_one({"_id": insert_result.inserted_id}, {"_id": 0})
        return saved_threat

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Threat detection error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.post("/telegram/leak_lookup")
async def leak_lookup(request: dict, current_user: str = Depends(get_current_user)):
    try:
        query = request.get("query")
        if not query:
            raise HTTPException(status_code=400, detail="Query is required")

        api_token = os.getenv("LEAKOSINT_API_TOKEN")
        payload = {"token": api_token, "request": query, "limit": 100, "lang": "en", "type": "json"}

        async with httpx.AsyncClient(timeout=30) as http_client:
            response = await http_client.post("https://leakosintapi.com/", json=payload)

        raw_data = response.json()
        formatted_results = []
        total_records = 0

        for source_name, source_data in raw_data.get("List", {}).items():
            if source_name.lower().startswith("no results"):
                continue
            valid_records = [r for r in source_data.get("Data", []) if isinstance(r, dict) and r]
            record_count = len(valid_records)
            if record_count == 0:
                continue
            total_records += record_count
            severity = "high" if record_count > 50 else "medium" if record_count > 10 else "low"
            formatted_results.append({
                "source": source_name, "records_found": record_count,
                "severity": severity, "sample_data": valid_records[:3]
            })

        result_doc = {
            "id": str(uuid.uuid4()),
            "user_id": current_user,             # FIX 1
            "query": query,
            "total_records": total_records,
            "sources": formatted_results,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

        insert_result = await db.leak_history.insert_one(result_doc)
        saved_doc = await db.leak_history.find_one({"_id": insert_result.inserted_id}, {"_id": 0})
        return saved_doc

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Leak lookup error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/telegram/history")
async def get_leak_history(current_user: str = Depends(get_current_user)):
    # FIX 1: filter by user
    history = await db.leak_history.find(
        {"user_id": current_user}, {"_id": 0}
    ).sort("timestamp", -1).limit(20).to_list(20)
    return {"history": history}


@api_router.get("/history")
async def get_scan_history(current_user: str = Depends(get_current_user)):
    # FIX 1: filter by user
    scans = await db.scans.find(
        {"user_id": current_user}, {"_id": 0}
    ).sort("timestamp", -1).limit(50).to_list(50)
    return {"scans": scans, "total": len(scans)}


@api_router.get("/dashboard/stats")
async def get_dashboard_stats(current_user: str = Depends(get_current_user)):
    # FIX 1: only count/show current user's data
    user_filter = {"user_id": current_user}
    total_scans = await db.scans.count_documents(user_filter)
    total_threats = await db.threats.count_documents(user_filter)
    active_scans = await db.scans.count_documents({"user_id": current_user, "status": "running"})

    recent_scans = await db.scans.find(user_filter, {"_id": 0}).sort("timestamp", -1).limit(5).to_list(5)
    recent_threats = await db.threats.find(user_filter, {"_id": 0}).sort("timestamp", -1).limit(5).to_list(5)

    return {
        "total_scans": total_scans,
        "total_threats": total_threats,
        "active_scans": active_scans,
        "recent_scans": recent_scans,
        "recent_threats": recent_threats
    }


# ─────────────────────────────────────────────
#  APP SETUP
# ─────────────────────────────────────────────

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
