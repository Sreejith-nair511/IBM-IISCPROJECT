from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
import asyncio

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Define Models
class SensorReading(BaseModel):
    day: str
    soil_moisture: float
    temperature: float
    humidity: float
    ph_level: float
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class Village(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    district: str
    state: str
    crop: str
    coords: List[float]  # [latitude, longitude]
    population: int
    area_hectares: float
    soil_type: str
    irrigation_type: str
    history: List[SensorReading] = Field(default_factory=list)
    alerts: List[str] = Field(default_factory=list)
    last_updated: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class VillageCreate(BaseModel):
    name: str
    district: str
    state: str
    crop: str
    coords: List[float]
    population: int = 1000
    area_hectares: float = 100.0
    soil_type: str = "loam"
    irrigation_type: str = "canal"

class Alert(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    village_id: str
    alert_type: str  # "drought", "flood", "pest", "disease"
    message: str
    severity: str  # "low", "medium", "high", "critical"
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = True

class SimulationTrigger(BaseModel):
    scenario: str
    village_id: str
    severity: str = "medium"

# Initialize with sample data
async def initialize_sample_data():
    """Initialize the database with sample Indian villages if empty"""
    villages_count = await db.villages.count_documents({})
    if villages_count == 0:
        sample_villages = [
            {
                "id": "mandya-kirangur",
                "name": "Kirangur",
                "district": "Mandya",
                "state": "Karnataka",
                "crop": "paddy",
                "coords": [12.522, 76.899],
                "population": 1500,
                "area_hectares": 250.0,
                "soil_type": "clayey",
                "irrigation_type": "canal",
                "history": [
                    {"day": "Day 1", "soil_moisture": 28.5, "temperature": 32.1, "humidity": 78.2, "ph_level": 6.8, "timestamp": "2024-01-01T10:00:00Z"},
                    {"day": "Day 2", "soil_moisture": 25.2, "temperature": 33.4, "humidity": 76.1, "ph_level": 6.7, "timestamp": "2024-01-02T10:00:00Z"},
                    {"day": "Day 3", "soil_moisture": 22.8, "temperature": 34.2, "humidity": 74.5, "ph_level": 6.6, "timestamp": "2024-01-03T10:00:00Z"},
                    {"day": "Day 4", "soil_moisture": 20.1, "temperature": 35.8, "humidity": 71.2, "ph_level": 6.5, "timestamp": "2024-01-04T10:00:00Z"},
                    {"day": "Day 5", "soil_moisture": 18.4, "temperature": 36.5, "humidity": 68.9, "ph_level": 6.4, "timestamp": "2024-01-05T10:00:00Z"}
                ],
                "alerts": ["Low soil moisture detected", "Temperature rising"],
                "last_updated": datetime.now(timezone.utc)
            },
            {
                "id": "thanjavur-kovil",
                "name": "Kovil",
                "district": "Thanjavur",
                "state": "Tamil Nadu",
                "crop": "sugarcane",
                "coords": [10.786, 79.138],
                "population": 2200,
                "area_hectares": 400.0,
                "soil_type": "alluvial",
                "irrigation_type": "drip",
                "history": [
                    {"day": "Day 1", "soil_moisture": 60.2, "temperature": 29.8, "humidity": 82.1, "ph_level": 7.2, "timestamp": "2024-01-01T10:00:00Z"},
                    {"day": "Day 2", "soil_moisture": 58.5, "temperature": 30.4, "humidity": 80.8, "ph_level": 7.1, "timestamp": "2024-01-02T10:00:00Z"},
                    {"day": "Day 3", "soil_moisture": 55.8, "temperature": 31.2, "humidity": 79.4, "ph_level": 7.0, "timestamp": "2024-01-03T10:00:00Z"},
                    {"day": "Day 4", "soil_moisture": 53.2, "temperature": 32.1, "humidity": 77.9, "ph_level": 6.9, "timestamp": "2024-01-04T10:00:00Z"},
                    {"day": "Day 5", "soil_moisture": 51.4, "temperature": 32.8, "humidity": 76.2, "ph_level": 6.8, "timestamp": "2024-01-05T10:00:00Z"}
                ],
                "alerts": ["Optimal conditions"],
                "last_updated": datetime.now(timezone.utc)
            },
            {
                "id": "washim-manjari",
                "name": "Manjari",
                "district": "Washim",
                "state": "Maharashtra",
                "crop": "soybean",
                "coords": [20.125, 76.103],
                "population": 800,
                "area_hectares": 180.0,
                "soil_type": "sandy loam",
                "irrigation_type": "rainfed",
                "history": [
                    {"day": "Day 1", "soil_moisture": 15.2, "temperature": 38.5, "humidity": 45.2, "ph_level": 6.2, "timestamp": "2024-01-01T10:00:00Z"},
                    {"day": "Day 2", "soil_moisture": 14.1, "temperature": 39.2, "humidity": 43.8, "ph_level": 6.1, "timestamp": "2024-01-02T10:00:00Z"},
                    {"day": "Day 3", "soil_moisture": 13.5, "temperature": 40.1, "humidity": 41.5, "ph_level": 6.0, "timestamp": "2024-01-03T10:00:00Z"},
                    {"day": "Day 4", "soil_moisture": 12.8, "temperature": 41.2, "humidity": 39.2, "ph_level": 5.9, "timestamp": "2024-01-04T10:00:00Z"},
                    {"day": "Day 5", "soil_moisture": 11.9, "temperature": 42.1, "humidity": 36.8, "ph_level": 5.8, "timestamp": "2024-01-05T10:00:00Z"}
                ],
                "alerts": ["CRITICAL: Drought conditions", "Immediate irrigation required"],
                "last_updated": datetime.now(timezone.utc)
            },
            {
                "id": "payyanur-kerala",
                "name": "Payyanur",
                "district": "Kannur",
                "state": "Kerala",
                "crop": "coconut+paddy",
                "coords": [12.093, 75.198],
                "population": 3200,
                "area_hectares": 320.0,
                "soil_type": "laterite",
                "irrigation_type": "mixed",
                "history": [
                    {"day": "Day 1", "soil_moisture": 70.5, "temperature": 28.2, "humidity": 88.5, "ph_level": 6.5, "timestamp": "2024-01-01T10:00:00Z"},
                    {"day": "Day 2", "soil_moisture": 68.8, "temperature": 29.1, "humidity": 87.2, "ph_level": 6.4, "timestamp": "2024-01-02T10:00:00Z"},
                    {"day": "Day 3", "soil_moisture": 66.2, "temperature": 29.8, "humidity": 85.8, "ph_level": 6.3, "timestamp": "2024-01-03T10:00:00Z"},
                    {"day": "Day 4", "soil_moisture": 65.1, "temperature": 30.5, "humidity": 84.1, "ph_level": 6.2, "timestamp": "2024-01-04T10:00:00Z"},
                    {"day": "Day 5", "soil_moisture": 64.3, "temperature": 31.2, "humidity": 82.5, "ph_level": 6.1, "timestamp": "2024-01-05T10:00:00Z"}
                ],
                "alerts": ["High humidity - monitor for fungal diseases"],
                "last_updated": datetime.now(timezone.utc)
            }
        ]
        
        for village_data in sample_villages:
            await db.villages.insert_one(village_data)
        
        logging.info("Sample village data initialized")

# API Routes
@api_router.get("/")
async def root():
    return {"message": "Digital Sarpanch API - Village Governance System"}

@api_router.get("/villages", response_model=List[Village])
async def get_villages():
    """Get all villages with their sensor data"""
    villages = await db.villages.find().to_list(1000)
    return [Village(**village) for village in villages]

@api_router.get("/villages/{village_id}", response_model=Village)
async def get_village(village_id: str):
    """Get a specific village by ID"""
    village = await db.villages.find_one({"id": village_id})
    if not village:
        raise HTTPException(status_code=404, detail="Village not found")
    return Village(**village)

@api_router.post("/villages", response_model=Village)
async def create_village(village: VillageCreate):
    """Create a new village"""
    village_dict = village.dict()
    village_obj = Village(**village_dict)
    await db.villages.insert_one(village_obj.dict())
    return village_obj

@api_router.post("/simulate/trigger")
async def trigger_simulation(trigger: SimulationTrigger):
    """Trigger a simulation scenario for a village"""
    village = await db.villages.find_one({"id": trigger.village_id})
    if not village:
        raise HTTPException(status_code=404, detail="Village not found")
    
    # Create alert based on scenario
    alert_messages = {
        "drought": f"DROUGHT ALERT: Critical water shortage detected in {village['name']}. Immediate irrigation required.",
        "flood": f"FLOOD WARNING: Heavy rainfall predicted for {village['name']}. Prepare drainage systems.",
        "pest": f"PEST ALERT: Pest infestation detected in {village['name']} {village['crop']} fields.",
        "disease": f"DISEASE WARNING: Crop disease outbreak in {village['name']}. Contact agricultural officer."
    }
    
    alert = Alert(
        village_id=trigger.village_id,
        alert_type=trigger.scenario,
        message=alert_messages.get(trigger.scenario, f"Alert triggered for {village['name']}"),
        severity=trigger.severity
    )
    
    # Save alert
    await db.alerts.insert_one(alert.dict())
    
    # Update village alerts
    await db.villages.update_one(
        {"id": trigger.village_id},
        {"$push": {"alerts": alert.message}, "$set": {"last_updated": datetime.now(timezone.utc)}}
    )
    
    return {
        "message": f"Simulation '{trigger.scenario}' triggered for village {trigger.village_id}",
        "alert": alert.dict(),
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@api_router.get("/alerts", response_model=List[Alert])
async def get_alerts(active_only: bool = True):
    """Get all alerts, optionally filter for active ones"""
    filter_query = {"is_active": True} if active_only else {}
    alerts = await db.alerts.find(filter_query).sort("timestamp", -1).to_list(100)
    return [Alert(**alert) for alert in alerts]

@api_router.get("/alerts/{village_id}", response_model=List[Alert])
async def get_village_alerts(village_id: str):
    """Get alerts for a specific village"""
    alerts = await db.alerts.find({"village_id": village_id}).sort("timestamp", -1).to_list(100)
    return [Alert(**alert) for alert in alerts]

@api_router.patch("/alerts/{alert_id}/dismiss")
async def dismiss_alert(alert_id: str):
    """Dismiss an active alert"""
    result = await db.alerts.update_one(
        {"id": alert_id},
        {"$set": {"is_active": False}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Alert not found")
    return {"message": "Alert dismissed successfully"}

@api_router.get("/dashboard/stats")
async def get_dashboard_stats():
    """Get dashboard statistics"""
    total_villages = await db.villages.count_documents({})
    active_alerts = await db.alerts.count_documents({"is_active": True})
    critical_alerts = await db.alerts.count_documents({"is_active": True, "severity": "critical"})
    
    # Get villages with critical conditions
    critical_villages = await db.villages.find({
        "alerts": {"$regex": "CRITICAL", "$options": "i"}
    }).to_list(10)
    
    return {
        "total_villages": total_villages,
        "active_alerts": active_alerts,
        "critical_alerts": critical_alerts,
        "critical_villages": len(critical_villages),
        "last_updated": datetime.now(timezone.utc).isoformat()
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    """Initialize sample data on startup"""
    await initialize_sample_data()

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()