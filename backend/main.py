import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from database import engine, get_db
from models import Base, ContactoModel
from schemas import ContactoCreate

Base.metadata.create_all(bind=engine)

# 1. Configuración del limitador de velocidad (Rate Limiting) por IP contra spam
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="Raptor Dev Backend", version="1.0.0")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Middleware para añadir Cabeceras de Seguridad HTTP
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response

# --- CONFIGURACIÓN DE CORREO SMTP ---
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
CORREO_EMISOR = "raptordevecu@gmail.com"       
PASSWORD_EMISOR = "xauv zsiz pcmz hdwa"     
CORREO_DESTINO = "raptordevecu@gmail.com"      

def enviar_alerta_correo(nombre: str, email_cliente: str, whatsapp_cliente: str):
    try:
        asunto = f"🚀 ¡Nuevo Lead en Raptor Dev de {nombre}!"
        cuerpo = f"""
        ¡Hola Juan! Has recibido un nuevo mensaje desde el formulario web de Raptor Dev.

        Detalles del cliente:
        - Nombre: {nombre}
        - Correo: {email_cliente}
        - WhatsApp: {whatsapp_cliente}

        ---
        Notificación automática generada por tu backend de FastAPI.
        """

        mensaje = MIMEMultipart()
        mensaje["From"] = CORREO_EMISOR
        mensaje["To"] = CORREO_DESTINO
        mensaje["Subject"] = asunto
        mensaje.attach(MIMEText(cuerpo, "plain"))

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as servidor:
            servidor.starttls()
            servidor.login(CORREO_EMISOR, PASSWORD_EMISOR)
            servidor.sendmail(CORREO_EMISOR, CORREO_DESTINO, mensaje.as_string())
            
        print("[CORREO] Alerta enviada con éxito a tu bandeja.")
    except Exception as e:
        print(f"[CORREO] Error al enviar el correo: {e}")

@app.get("/")
def leer_raiz():
    return {"mensaje": "Servidor de Raptor Dev operando al 100% 🚀"}

@app.post("/api/contacto")
@limiter.limit("3/minute")  # RESTRICCIÓN: Máximo 3 peticiones por minuto por IP
def guardar_contacto(request: Request, contacto: ContactoCreate, db: Session = Depends(get_db)):
    # 1. Guardar en la base de datos MySQL Workbench
    nuevo_contacto = ContactoModel(
        nombre=contacto.nombre,
        email=contacto.email,
        whatsapp=contacto.whatsapp
    )
    
    db.add(nuevo_contacto)
    db.commit()
    db.refresh(nuevo_contacto)
    
    # 2. Disparar la alerta por correo electrónico
    enviar_alerta_correo(nuevo_contacto.nombre, nuevo_contacto.email, nuevo_contacto.whatsapp)
    
    return {
        "estado": "success", 
        "mensaje": "¡Datos guardados y correo de alerta enviado!",
        "datos": {
            "nombre": nuevo_contacto.nombre,
            "email": nuevo_contacto.email
        }
    }