from pydantic import BaseModel, EmailStr, Field

class ContactoCreate(BaseModel):
    nombre: str = Field(..., min_length=2, max_length=100)
    email: EmailStr  # Valida automáticamente que sea un correo electrónico real
    whatsapp: str = Field(..., min_length=7, max_length=20)