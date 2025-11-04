# PostgreSQL Setup Guide for Learnify Med Skillz

## Current Status
- ✅ **Backend**: Running with SQLite (`learnify_med_skillz.db`)
- ✅ **PostgreSQL**: Installed locally (version 17.6)
- ⚠️ **Authentication**: Needs configuration

## Quick Switch to PostgreSQL

### Option 1: Configure PostgreSQL Authentication (Recommended)

1. **Set PostgreSQL Password for 'postgres' user:**
   ```bash
   # Connect to PostgreSQL as superuser
   psql -U postgres
   
   # Set password (replace 'yourpassword' with your chosen password)
   ALTER USER postgres PASSWORD 'yourpassword';
   
   # Exit
   \q
   ```

2. **Create the database:**
   ```bash
   createdb -U postgres learnify_med_skillz
   ```

3. **Updatecreatedb -U postgres learnify_med_skillz backend/env file:**
   ```env
   DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/learnify_med_skillz
   ```

4. **Run migrations:**
   ```bash
   cd backend
   python init_db.py
   ```

### Option 2: Use Windows Authentication

1. **Create PostgreSQL user for Windows account:**
   ```sql
   -- Connect as postgres superuser first
   psql -U postgres
   
   -- Create user for Windows account
   CREATE USER "TAH" WITH CREATEDB;
   
   -- Grant privileges
   GRANT ALL PRIVILEGES ON DATABASE postgres TO "TAH";
   
   \q
   ```

2. **Create database:**
   ```bash
   createdb learnify_med_skillz
   ```

3. **Update backend/env file:**
   ```env
   DATABASE_URL=postgresql://TAH@localhost:5432/learnify_med_skillz
   ```

### Option 3: Use Docker (Easiest)

1. **Start PostgreSQL with Docker:**
   ```bash
   cd backend
   docker-compose up -d db
   ```

2. **Update backend/env file:**
   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/learnify_med_skillz
   ```

## Automated Setup Script

Run the setup script after configuring authentication:
```bash
cd backend
python setup_postgresql.py
```

## Troubleshooting

### Authentication Failed Error
- Ensure PostgreSQL service is running
- Check if password is set for the user
- Verify connection string format
- Try connecting manually with `psql` first

### Connection Refused Error
- Check if PostgreSQL service is running: `pg_ctl status`
- Verify port 5432 is not blocked
- Check PostgreSQL configuration files

### Database Does Not Exist
- Create database manually: `createdb learnify_med_skillz`
- Or use the setup script after authentication is working

## Switching Back to SQLite

If you need to revert to SQLite:
```env
DATABASE_URL=sqlite:///./learnify_med_skillz.db
```

## Next Steps

1. Choose one of the authentication options above
2. Test the connection manually with `psql`
3. Update the `backend/env` file
4. Restart the backend server
5. Run database migrations if needed

The backend is ready to switch to PostgreSQL once authentication is properly configured!