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

class ToolScanRequest(BaseModel):
    target: str
    tool: str  # nmap | nuclei | nikto | whatweb | zap

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
        import socket, ipaddress, shutil, httpx

        # Resolve domain to IP
        try:
            ip = socket.gethostbyname(target)
        except Exception:
            ip = target

        results = {"hosts": {}, "scan_stats": {}}

        # ── Check if private IP — GCP cannot reach private IPs ──────────
        try:
            ip_obj = ipaddress.ip_address(ip)
            is_private = ip_obj.is_private or ip_obj.is_loopback or ip_obj.is_link_local
        except ValueError:
            is_private = False

        if is_private:
            results["scan_stats"] = {
                "engine": "blocked",
                "uphosts": "0", "downhosts": "1", "totalhosts": "1",
                "message": f"Private IP ({ip}) cannot be reached from cloud server. Use a public IP or domain."
            }
            await db.scans.update_one({"id": scan_id}, {"$set": {"status": "completed", "results": results}})
            return

        # ── Try Nmap (works on GCP VPS) ──────────────────────────────────
        nmap_ran = False
        try:
            if not shutil.which("nmap"):
                raise Exception("nmap binary not found")

            nm = nmap.PortScanner()

            if scan_type == "quick":
                scan_args = "-Pn -F -T4 -sV --version-intensity 3"
            else:
                scan_args = "-Pn -T4 -sV -sC --version-intensity 7 -O --osscan-guess"

            logger.info(f"[NMAP] Starting scan: {target} | args: {scan_args}")
            nm.scan(hosts=target, arguments=scan_args)
            logger.info(f"[NMAP] Completed. Hosts: {nm.all_hosts()}")
            nmap_ran = True

            if nm.all_hosts():
                for host in nm.all_hosts():
                    host_info = {
                        "hostname": nm[host].hostname() or target,
                        "state": nm[host].state(),
                        "protocols": {},
                        "os": [],
                        "hostnames": [nm[host].hostname()] if nm[host].hostname() else [],
                        "vulns": [], "tags": [], "cpes": [],
                        "uptime": "",
                        "network_distance": "",
                    }

                    # OS Detection results
                    if "osmatch" in nm[host] and nm[host]["osmatch"]:
                        for osmatch in nm[host]["osmatch"][:5]:
                            host_info["os"].append({
                                "name": osmatch.get("name", "Unknown"),
                                "accuracy": osmatch.get("accuracy", ""),
                                "type": osmatch.get("osclass", [{}])[0].get("type", "") if osmatch.get("osclass") else "",
                                "vendor": osmatch.get("osclass", [{}])[0].get("vendor", "") if osmatch.get("osclass") else "",
                                "osfamily": osmatch.get("osclass", [{}])[0].get("osfamily", "") if osmatch.get("osclass") else "",
                                "cpe": osmatch.get("osclass", [{}])[0].get("cpe", [""])[0] if osmatch.get("osclass") else ""
                            })

                    # Port scanning results — all ports including filtered
                    for proto in nm[host].all_protocols():
                        host_info["protocols"][proto] = {}
                        for port in sorted(nm[host][proto].keys()):
                            pi = nm[host][proto][port]
                            script_output = {}
                            if "script" in pi:
                                script_output = pi["script"]
                            host_info["protocols"][proto][str(port)] = {
                                "state": pi["state"],
                                "name": pi.get("name", "unknown"),
                                "product": pi.get("product", ""),
                                "version": pi.get("version", ""),
                                "extrainfo": pi.get("extrainfo", ""),
                                "cpe": pi.get("cpe", ""),
                                "scripts": script_output,
                            }

                    results["hosts"][host] = host_info

                total_open = sum(
                    1 for h in results["hosts"].values()
                    for proto in h["protocols"].values()
                    for p in proto.values()
                    if p["state"] == "open"
                )

                results["scan_stats"] = {
                    **nm.scanstats(),
                    "engine": "nmap",
                    "scan_type": scan_type,
                    "open_ports": total_open,
                    "nmap_version": "7.95",
                }

                # Enrich with Shodan CVE data
                try:
                    async with httpx.AsyncClient(timeout=8) as c:
                        r = await c.get(f"https://internetdb.shodan.io/{ip}")
                    if r.status_code == 200:
                        sd = r.json()
                        for h in results["hosts"]:
                            results["hosts"][h]["vulns"] = sd.get("vulns", [])
                            results["hosts"][h]["tags"] = sd.get("tags", [])
                            results["hosts"][h]["cpes"] = sd.get("cpes", [])
                except Exception:
                    pass

            else:
                results["scan_stats"] = {
                    "engine": "nmap", "scan_type": scan_type,
                    "uphosts": "0", "downhosts": "0", "totalhosts": "1",
                    "message": "Host is up but all ports are filtered/closed"
                }

        except Exception as nmap_err:
            logger.warning(f"[NMAP] Failed: {nmap_err} — using Shodan fallback")
            nmap_ran = False

        # ── Shodan InternetDB fallback (for non-GCP environments) ────────
        if not nmap_ran:
            PORT_NAMES = {
                21:"ftp",22:"ssh",23:"telnet",25:"smtp",53:"dns",80:"http",
                110:"pop3",143:"imap",443:"https",445:"smb",993:"imaps",
                995:"pop3s",1433:"mssql",3306:"mysql",3389:"rdp",
                5432:"postgresql",5900:"vnc",6379:"redis",
                8080:"http-alt",8443:"https-alt",27017:"mongodb"
            }
            try:
                async with httpx.AsyncClient(timeout=15) as client:
                    response = await client.get(f"https://internetdb.shodan.io/{ip}")
                if response.status_code == 200:
                    data = response.json()
                    ports = data.get("ports", [])
                    hostnames = data.get("hostnames", [])
                    protocols = {"tcp": {}}
                    for port in ports:
                        protocols["tcp"][str(port)] = {
                            "state": "open", "name": PORT_NAMES.get(port, "unknown"),
                            "product": "", "version": "", "extrainfo": "", "cpe": "", "scripts": {}
                        }
                    results["hosts"][ip] = {
                        "hostname": hostnames[0] if hostnames else target,
                        "state": "up", "protocols": protocols,
                        "os": [], "hostnames": hostnames,
                        "vulns": data.get("vulns", []),
                        "tags": data.get("tags", []),
                        "cpes": data.get("cpes", []),
                    }
                    results["scan_stats"] = {
                        "uphosts": "1", "downhosts": "0", "totalhosts": "1",
                        "open_ports": len(ports), "engine": "shodan-internetdb"
                    }
                else:
                    results["scan_stats"] = {
                        "uphosts": "0", "totalhosts": "1",
                        "message": "No data found", "engine": "shodan-internetdb"
                    }
            except Exception as se:
                logger.error(f"Shodan fallback failed: {se}")
                results["scan_stats"] = {"error": str(se), "engine": "error"}

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
        scan = await db.scans.find_one({"id": request.scan_id, "user_id": current_user}, {"_id": 0})
        if not scan:
            raise HTTPException(status_code=404, detail="Scan not found")

        threats = []

        # High/medium/critical risk ports
        CRITICAL_PORTS = [23, 445, 3389, 1433, 3306, 5432, 27017, 6379]  # telnet, smb, rdp, db ports
        HIGH_RISK_PORTS = [21, 22, 80, 8080, 8443, 5900, 1521]            # ftp, ssh, http, vnc, oracle
        MEDIUM_RISK_PORTS = [25, 53, 110, 143, 161, 389, 512, 513, 514]   # smtp, dns, pop, imap, snmp, ldap

        PORT_SERVICES = {
            21: "FTP", 22: "SSH", 23: "Telnet", 25: "SMTP",
            53: "DNS", 80: "HTTP", 110: "POP3", 143: "IMAP",
            161: "SNMP", 389: "LDAP", 443: "HTTPS", 445: "SMB",
            512: "rexec", 513: "rlogin", 514: "rsh",
            1433: "MSSQL", 1521: "Oracle", 3306: "MySQL",
            3389: "RDP", 5432: "PostgreSQL", 5900: "VNC",
            6379: "Redis", 8080: "HTTP-Alt", 8443: "HTTPS-Alt",
            27017: "MongoDB"
        }

        if scan.get("results") and scan["results"].get("hosts"):
            for host, host_data in scan["results"]["hosts"].items():

                # --- 1. CVE-based threats (from Shodan InternetDB) ---
                vulns = host_data.get("vulns", [])
                if vulns:
                    # Each CVE is a critical threat
                    cve_risk = min(40 + len(vulns) * 2, 100)
                    threats.append({
                        "host": host,
                        "port": "multiple",
                        "service": "multiple",
                        "classification": f"{len(vulns)} Known CVE Vulnerabilities Found",
                        "confidence": 0.95,
                        "risk_score": cve_risk,
                        "threat_level": "critical" if len(vulns) >= 10 else "high",
                        "cves": vulns[:10]  # show top 10
                    })

                # --- 2. Port-based threats ---
                all_ports = []
                for proto, ports in host_data.get("protocols", {}).items():
                    for port_str, port_info in ports.items():
                        port = int(port_str)
                        all_ports.append(port)

                        risk_score = 0
                        classification = "Open Port"

                        if port in CRITICAL_PORTS:
                            risk_score = 90
                            classification = f"Critical Risk Service ({PORT_SERVICES.get(port, str(port))})	- Exposed to internet"
                            threat_level = "critical"
                        elif port in HIGH_RISK_PORTS:
                            risk_score = 65
                            classification = f"High Risk Service ({PORT_SERVICES.get(port, str(port))})	- Should be restricted"
                            threat_level = "high"
                        elif port in MEDIUM_RISK_PORTS:
                            risk_score = 45
                            classification = f"Medium Risk Service ({PORT_SERVICES.get(port, str(port))})	- Review access control"
                            threat_level = "medium"
                        else:
                            # Use ML model for unknown ports
                            features = np.array([[port, 1, 100, 0]])
                            prediction = rf_model.predict(features)[0]
                            confidence_ml = float(np.max(rf_model.predict_proba(features)))
                            if prediction > 0:
                                risk_score = 35
                                classification = "Suspicious Port - ML Detection"
                                threat_level = "medium"
                            else:
                                continue  # skip low risk ports

                        features = np.array([[port, 1, 100, 0]])
                        confidence = float(np.max(rf_model.predict_proba(features)))

                        threats.append({
                            "host": host,
                            "port": port,
                            "service": PORT_SERVICES.get(port, port_info.get("name", "unknown")),
                            "classification": classification,
                            "confidence": round(confidence, 2),
                            "risk_score": risk_score,
                            "threat_level": threat_level
                        })

                # --- 3. Too many open ports ---
                if len(all_ports) > 10:
                    threats.append({
                        "host": host,
                        "port": "multiple",
                        "service": "multiple",
                        "classification": f"Large Attack Surface — {len(all_ports)} open ports detected",
                        "confidence": 0.9,
                        "risk_score": 75,
                        "threat_level": "high"
                    })

        # Overall threat level — use highest found
        if any(t["threat_level"] == "critical" for t in threats):
            overall_threat_level = "critical"
        elif any(t["threat_level"] == "high" for t in threats):
            overall_threat_level = "high"
        elif any(t["threat_level"] == "medium" for t in threats):
            overall_threat_level = "medium"
        else:
            overall_threat_level = "low"

        # Calculate weighted confidence
        if threats:
            avg_confidence = sum(t["confidence"] for t in threats) / len(threats)
        else:
            avg_confidence = 0.85

        threat_doc = {
            "id": str(uuid.uuid4()),
            "user_id": current_user,
            "scan_id": request.scan_id,
            "threat_level": overall_threat_level,
            "classification": "Threats Detected" if threats else "No Significant Threats",
            "confidence": round(avg_confidence, 2),
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
            # Any leak found is serious — minimum medium, high if 5+ records, critical if 20+
            severity = "critical" if record_count >= 20 else "high" if record_count >= 5 else "medium"
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

    # Fetch more data for charts — 50 most recent
    recent_scans = await db.scans.find(user_filter, {"_id": 0}).sort("timestamp", -1).limit(50).to_list(50)
    recent_threats = await db.threats.find(user_filter, {"_id": 0}).sort("timestamp", -1).limit(50).to_list(50)

    # Build threat level distribution across ALL threats
    threat_level_counts = {"critical": 0, "high": 0, "medium": 0, "low": 0}
    for t in recent_threats:
        lvl = t.get("threat_level", "low")
        if lvl in threat_level_counts:
            threat_level_counts[lvl] += 1
        else:
            threat_level_counts["low"] += 1

    # Build scan status distribution
    scan_status_counts = {"completed": 0, "failed": 0, "running": 0}
    for s in recent_scans:
        st = s.get("status", "failed")
        if st in scan_status_counts:
            scan_status_counts[st] += 1

    return {
        "total_scans": total_scans,
        "total_threats": total_threats,
        "active_scans": active_scans,
        "recent_scans": recent_scans[:5],        # last 5 for recent list
        "recent_threats": recent_threats[:5],    # last 5 for recent list
        "all_scans": recent_scans,               # all for charts
        "all_threats": recent_threats,           # all for charts
        "threat_level_counts": threat_level_counts,
        "scan_status_counts": scan_status_counts
    }


# ─────────────────────────────────────────────
#  APP SETUP
# ─────────────────────────────────────────────


# ─────────────────────────────────────────────
#  MULTI-TOOL SCANNER ENDPOINTS
# ─────────────────────────────────────────────

@api_router.post("/scan/tool")
async def tool_scan(
    request: ToolScanRequest,
    background_tasks: BackgroundTasks,
    current_user: str = Depends(get_current_user)
):
    """Run a security tool scan (nmap/nuclei/nikto/whatweb/zap)"""
    try:
        scan_id = str(uuid.uuid4())
        scan_doc = {
            "id": scan_id,
            "user_id": current_user,
            "target": request.target,
            "scan_type": f"{request.tool}",
            "tool": request.tool,
            "status": "running",
            "results": {},
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        await db.scans.insert_one(scan_doc)
        background_tasks.add_task(perform_tool_scan, scan_id, request.target, request.tool)
        return {"scan_id": scan_id, "status": "started", "tool": request.tool}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def perform_tool_scan(scan_id: str, target: str, tool: str):
    """Execute the requested security tool and store structured results"""
    import subprocess, shutil, socket, ipaddress, re

    results = {"tool": tool, "target": target, "output": [], "summary": {}, "findings": []}

    try:
        # Resolve to IP for private check
        try:
            ip = socket.gethostbyname(target.replace("http://","").replace("https://","").split("/")[0])
        except Exception:
            ip = target

        try:
            ip_obj = ipaddress.ip_address(ip)
            if ip_obj.is_private or ip_obj.is_loopback:
                results["summary"] = {"error": f"Private IP ({ip}) cannot be scanned from cloud server"}
                await db.scans.update_one({"id": scan_id}, {"$set": {"status": "completed", "results": results}})
                return
        except ValueError:
            pass

        # ── NMAP ────────────────────────────────────────────────────────
        if tool == "nmap":
            if not shutil.which("nmap"):
                raise Exception("nmap not installed")
            cmd = ["nmap", "-Pn", "-T4", "-sV", "-sC", "--open", target]
            proc = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
            raw = proc.stdout + proc.stderr

            # Parse ports
            findings = []
            for line in raw.splitlines():
                m = re.match(r"(\d+)/(\w+)\s+(\w+)\s+(\S+)\s*(.*)", line)
                if m:
                    findings.append({
                        "port": m.group(1), "protocol": m.group(2),
                        "state": m.group(3), "service": m.group(4),
                        "version": m.group(5).strip(), "severity": "info"
                    })

            results["output"] = raw.splitlines()
            results["findings"] = findings
            results["summary"] = {
                "total_ports": len(findings),
                "open_ports": sum(1 for f in findings if f["state"] == "open"),
                "tool_version": "Nmap 7.95"
            }

        # ── NUCLEI ──────────────────────────────────────────────────────
        elif tool == "nuclei":
            if not shutil.which("nuclei"):
                # Nuclei not installed — provide install instructions
                results["summary"] = {
                    "status": "not_installed",
                    "message": "Nuclei is not installed on this server",
                    "install": "Run: go install github.com/projectdiscovery/nuclei/v3/cmd/nuclei@latest",
                    "description": "Nuclei is a fast template-based vulnerability scanner. It finds CVEs, misconfigs, exposed admin panels, default credentials and security issues using community templates."
                }
                results["output"] = [
                    "Nuclei - Fast & customizable vulnerability scanner",
                    "Install: go install github.com/projectdiscovery/nuclei/v3/cmd/nuclei@latest",
                    "Templates: https://github.com/projectdiscovery/nuclei-templates",
                    "",
                    "What Nuclei finds:",
                    "  - CVE vulnerabilities",
                    "  - Exposed admin panels (Jenkins, phpMyAdmin etc)",
                    "  - Default credentials",
                    "  - Misconfigurations",
                    "  - Sensitive file exposures",
                    "  - DNS misconfigurations",
                    "  - SSL/TLS issues",
                ]
                await db.scans.update_one({"id": scan_id}, {"$set": {"status": "completed", "results": results}})
                return

            url = target if target.startswith("http") else f"http://{target}"
            cmd = ["nuclei", "-u", url, "-severity", "critical,high,medium",
                   "-silent", "-json", "-timeout", "10"]
            proc = subprocess.run(cmd, capture_output=True, text=True, timeout=180)

            findings = []
            for line in proc.stdout.splitlines():
                try:
                    import json as _json
                    item = _json.loads(line)
                    severity = item.get("info", {}).get("severity", "info")
                    findings.append({
                        "template": item.get("template-id", ""),
                        "name": item.get("info", {}).get("name", ""),
                        "severity": severity,
                        "url": item.get("matched-at", ""),
                        "description": item.get("info", {}).get("description", ""),
                        "tags": item.get("info", {}).get("tags", []),
                        "reference": item.get("info", {}).get("reference", []),
                    })
                except Exception:
                    pass

            results["output"] = proc.stdout.splitlines() + proc.stderr.splitlines()
            results["findings"] = findings
            results["summary"] = {
                "total": len(findings),
                "critical": sum(1 for f in findings if f["severity"] == "critical"),
                "high": sum(1 for f in findings if f["severity"] == "high"),
                "medium": sum(1 for f in findings if f["severity"] == "medium"),
                "tool_version": "Nuclei"
            }

        # ── NIKTO ───────────────────────────────────────────────────────
        elif tool == "nikto":
            # Try multiple possible nikto locations
            nikto_path = shutil.which("nikto") or "/usr/bin/nikto" or "/usr/local/bin/nikto"
            if not os.path.exists(nikto_path or "") and not shutil.which("nikto"):
                results["summary"] = {
                    "status": "not_installed",
                    "message": "Nikto is not installed on this server",
                    "install": "Run: sudo apt install nikto",
                    "description": "Nikto is an open-source web server scanner. It performs comprehensive tests against web servers for dangerous files/CGIs, outdated software, configuration issues and server problems."
                }
                results["output"] = [
                    "Nikto - Web Server Scanner",
                    "Install: sudo apt install nikto",
                    "",
                    "What Nikto finds:",
                    "  - Dangerous files and CGIs",
                    "  - Outdated server software",
                    "  - Version-specific problems",
                    "  - Default files and scripts",
                    "  - HTTP server options",
                    "  - Insecure headers (X-Frame-Options, HSTS etc)",
                    "  - SSL certificate issues",
                ]
                await db.scans.update_one({"id": scan_id}, {"$set": {"status": "completed", "results": results}})
                return

            url = target if target.startswith("http") else f"http://{target}"
            nikto_bin = shutil.which("nikto") or "/usr/bin/nikto"
            cmd = [nikto_bin, "-h", url, "-Format", "txt", "-timeout", "10", "-maxtime", "120", "-nointeractive"]
            proc = subprocess.run(cmd, capture_output=True, text=True, timeout=150)
            raw = proc.stdout

            findings = []
            for line in raw.splitlines():
                if line.startswith("+"):
                    severity = "high" if any(k in line.lower() for k in ["vulnerable", "critical", "xss", "sql", "injection"]) else                                "medium" if any(k in line.lower() for k in ["outdated", "server", "header", "found"]) else "info"
                    findings.append({"message": line.lstrip("+ "), "severity": severity})

            results["output"] = raw.splitlines()
            results["findings"] = findings
            results["summary"] = {
                "total_findings": len(findings),
                "high": sum(1 for f in findings if f["severity"] == "high"),
                "medium": sum(1 for f in findings if f["severity"] == "medium"),
                "info": sum(1 for f in findings if f["severity"] == "info"),
                "tool_version": "Nikto"
            }

        # ── WHATWEB ─────────────────────────────────────────────────────
        elif tool == "whatweb":
            if not shutil.which("whatweb"):
                results["summary"] = {
                    "status": "not_installed",
                    "message": "WhatWeb is not installed on this server",
                    "install": "Run: sudo apt install whatweb",
                    "description": "WhatWeb identifies website technologies including CMS, web frameworks, server software, analytics, JavaScript libraries, IP addresses, email addresses and more."
                }
                results["output"] = [
                    "WhatWeb - Web Technology Fingerprinter",
                    "Install: sudo apt install whatweb",
                    "",
                    "What WhatWeb detects:",
                    "  - CMS (WordPress, Joomla, Drupal etc)",
                    "  - Web frameworks (Laravel, Django, Rails etc)",
                    "  - Server software (Apache, Nginx, IIS etc)",
                    "  - JavaScript libraries (jQuery, React etc)",
                    "  - Analytics platforms (Google Analytics etc)",
                    "  - CDN providers (Cloudflare, Akamai etc)",
                    "  - Email addresses and IP addresses",
                    "  - Security headers",
                ]
                await db.scans.update_one({"id": scan_id}, {"$set": {"status": "completed", "results": results}})
                return

            url = target if target.startswith("http") else f"http://{target}"
            cmd = ["whatweb", "-a", "3", "--log-verbose", "/dev/stdout", url]
            proc = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
            raw = proc.stdout + proc.stderr

            # Parse whatweb output for technologies
            findings = []
            tech_pattern = re.compile(r"(\w[\w\-\.]+)\[([^\]]+)\]")
            for match in tech_pattern.finditer(raw):
                tech_name = match.group(1)
                tech_version = match.group(2)
                if tech_name not in ["HTTP", "Country", "IP"]:
                    findings.append({
                        "technology": tech_name,
                        "version": tech_version,
                        "severity": "info"
                    })

            results["output"] = raw.splitlines()
            results["findings"] = findings
            results["summary"] = {
                "technologies_found": len(findings),
                "url": url,
                "tool_version": "WhatWeb"
            }

        # ── OWASP ZAP ───────────────────────────────────────────────────
        elif tool == "zap":
            # Use python-owasp-zap-v2.4 API if ZAP daemon is running
            # Otherwise use subprocess with zaproxy
            import json as _json

            url = target if target.startswith("http") else f"http://{target}"

            # Try zaproxy via subprocess
            zap_cmd = shutil.which("zap.sh") or shutil.which("zaproxy") or shutil.which("zap")

            if not zap_cmd:
                results["summary"] = {
                    "status": "not_installed",
                    "message": "OWASP ZAP is not installed on this server",
                    "install": "sudo snap install zaproxy --classic",
                    "description": "OWASP ZAP finds SQL Injection, XSS, CSRF, broken auth and all OWASP Top 10 vulnerabilities."
                }
                results["output"] = [
                    "OWASP ZAP - Web Application Security Scanner",
                    "Install via snap: sudo snap install zaproxy --classic",
                    "Or download: https://www.zaproxy.org/download/",
                    "",
                    "What ZAP finds:",
                    "  - SQL Injection (CWE-89)",
                    "  - Cross-Site Scripting - XSS (CWE-79)",
                    "  - CSRF vulnerabilities (CWE-352)",
                    "  - Broken Authentication",
                    "  - Sensitive Data Exposure",
                    "  - Security Misconfigurations",
                    "  - Broken Access Control",
                    "  - All OWASP Top 10 vulnerabilities",
                    "",
                    "Note: ZAP needs 512MB+ RAM. On e2-micro, use nikto instead for lightweight web scanning.",
                ]
                await db.scans.update_one({"id": scan_id}, {"$set": {"status": "completed", "results": results}})
                return

            report_path = f"/tmp/zap_report_{scan_id}.json"
            cmd = [zap_cmd, "-cmd", "-quickurl", url,
                   "-quickprogress", "-quickout", report_path,
                   "-config", "connection.timeoutInSecs=10"]

            try:
                proc = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
                findings = []

                if os.path.exists(report_path):
                    try:
                        with open(report_path) as f:
                            report = _json.load(f)
                        for site in report.get("site", []):
                            for alert in site.get("alerts", []):
                                riskdesc = alert.get("riskdesc", "Informational")
                                risk = riskdesc.lower().split()[0]
                                severity = "high" if "high" in risk else "medium" if "medium" in risk else "low" if "low" in risk else "info"
                                instances = alert.get("instances", [{}])
                                findings.append({
                                    "name": alert.get("alert", "Unknown"),
                                    "severity": severity,
                                    "description": alert.get("desc", "").replace("<p>","").replace("</p>"," ").strip(),
                                    "solution": alert.get("solution", "").replace("<p>","").replace("</p>"," ").strip(),
                                    "url": instances[0].get("uri", url) if instances else url,
                                    "cweid": alert.get("cweid", ""),
                                    "reference": alert.get("reference", ""),
                                    "count": alert.get("count", "1"),
                                })
                        try:
                            os.remove(report_path)
                        except Exception:
                            pass
                    except Exception as parse_err:
                        logger.error(f"ZAP report parse error: {parse_err}")

                raw_lines = (proc.stdout + proc.stderr).splitlines()
                results["output"] = raw_lines[:100]  # limit raw output
                results["findings"] = findings
                results["summary"] = {
                    "total": len(findings),
                    "high": sum(1 for f in findings if f["severity"] == "high"),
                    "medium": sum(1 for f in findings if f["severity"] == "medium"),
                    "low": sum(1 for f in findings if f["severity"] == "low"),
                    "info": sum(1 for f in findings if f["severity"] == "info"),
                    "target": url,
                    "tool_version": "OWASP ZAP"
                }
                if not findings:
                    results["output"].insert(0, f"ZAP scan completed for {url}. No alerts found or scan may need more time.")

            except subprocess.TimeoutExpired:
                results["summary"] = {"error": "ZAP scan timed out (5 min). Try a smaller target or use Nikto instead.", "tool_version": "OWASP ZAP"}
                results["output"] = ["Scan timed out after 300 seconds"]

        else:
            results["summary"] = {"error": f"Unknown tool: {tool}"}

        await db.scans.update_one({"id": scan_id}, {"$set": {"status": "completed", "results": results}})

    except subprocess.TimeoutExpired:
        results["summary"] = {"error": f"{tool} scan timed out"}
        results["output"] = [f"Scan timed out after maximum allowed time"]
        await db.scans.update_one({"id": scan_id}, {"$set": {"status": "completed", "results": results}})
    except Exception as e:
        logger.error(f"Tool scan error [{tool}]: {e}")
        await db.scans.update_one({"id": scan_id}, {"$set": {"status": "failed", "error": str(e)}})


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=['*'],
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