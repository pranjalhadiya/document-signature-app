from database import Base, engine
from models.user import User
from models.document import Document

Base.metadata.create_all(bind=engine)

print("Tables Created Successfully")