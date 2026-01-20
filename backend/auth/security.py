from passlib.context import CryptContext

# Setup the hashing engine (using bcrypt)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """
    Takes a plain password (e.g., 'secret123') 
    and returns a hashed string.
    """
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Checks if a plain password matches the stored hash.
    """
    return pwd_context.verify(plain_password, hashed_password)