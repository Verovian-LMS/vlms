from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from urllib.parse import urlparse, parse_qsl, urlunparse

# Determine if we're using SQLite or PostgreSQL
is_sqlite = settings.DATABASE_URL.startswith("sqlite")

# Sync Database engine
if is_sqlite:
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"check_same_thread": False},
        echo=settings.DEBUG
    )
else:
    engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,
        pool_recycle=300,
        echo=settings.DEBUG
    )

# Async Database engine
if is_sqlite:
    async_engine = create_async_engine(
        settings.DATABASE_URL.replace("sqlite://", "sqlite+aiosqlite://"),
        connect_args={"check_same_thread": False},
        echo=settings.DEBUG
    )
else:
    db_url = settings.DATABASE_URL
    connect_args = {}

    # Parse and normalize the URL for asyncpg
    parsed_url = urlparse(db_url)
    query_params = dict(parse_qsl(parsed_url.query))

    # Map common postgres schemes to asyncpg
    if parsed_url.scheme in ("postgres", "postgresql"):
        new_scheme = "postgresql+asyncpg"
    else:
        new_scheme = parsed_url.scheme

    # Convert sslmode to asyncpg's ssl argument
    if "sslmode" in query_params:
        ssl_mode = query_params.pop("sslmode")
        if ssl_mode in ["require", "allow", "prefer"]:
            connect_args["ssl"] = True
        elif ssl_mode == "disable":
            connect_args["ssl"] = False
        else:
            # verify-ca / verify-full would need SSLContext; default to True
            connect_args["ssl"] = True

    new_query = "&".join([f"{k}={v}" for k, v in query_params.items()])
    db_url = urlunparse(parsed_url._replace(scheme=new_scheme, query=new_query))

    async_engine = create_async_engine(
        db_url,
        pool_pre_ping=True,
        pool_recycle=300,
        echo=settings.DEBUG,
        connect_args=connect_args
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
AsyncSessionLocal = sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    autocommit=False,
    autoflush=False
)

Base = declarative_base()


# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Dependency to get async database session
async def get_async_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
