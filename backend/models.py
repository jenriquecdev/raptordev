from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime
from database import Base  # <-- Sin el punto al inicio

class ContactoModel(Base):
    __tablename__ = "contactos"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String(60), nullable=False)
    email = Column(String(100), nullable=False)
    whatsapp = Column(String(20), nullable=False)
    fecha_registro = Column(DateTime, default=datetime.utcnow)