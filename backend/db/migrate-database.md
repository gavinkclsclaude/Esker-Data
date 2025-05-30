# Database Migration Guide

## Method 1: Using pg_dump and psql (Recommended)

### On the source server:
```bash
# Dump the entire database
pg_dump -h source_host -U source_user -d source_db_name -f database_backup.sql

# Or create a compressed backup
pg_dump -h source_host -U source_user -d source_db_name -Fc -f database_backup.dump
```

### Transfer the file to this server:
```bash
# Using scp
scp user@source_server:/path/to/database_backup.sql /home/gamsmith/esker-data/fullstack-crud-app/backend/db/

# Or using rsync
rsync -avz user@source_server:/path/to/database_backup.sql /home/gamsmith/esker-data/fullstack-crud-app/backend/db/
```

### On this server (restore):
```bash
# For .sql file
PGPASSWORD='crudapp123' psql -U crudapp -d crudapp_db -h localhost -f database_backup.sql

# For .dump file
PGPASSWORD='crudapp123' pg_restore -U crudapp -d crudapp_db -h localhost database_backup.dump
```

## Method 2: Direct server-to-server copy

```bash
# Dump from source and restore to target in one command
pg_dump -h source_host -U source_user -d source_db_name | PGPASSWORD='crudapp123' psql -U crudapp -d crudapp_db -h localhost
```

## Method 3: Using pg_dump with custom options

```bash
# Export only data (no schema)
pg_dump -h source_host -U source_user -d source_db_name --data-only -f data_only.sql

# Export only specific tables
pg_dump -h source_host -U source_user -d source_db_name -t items -t users -f specific_tables.sql

# Export with INSERT statements instead of COPY
pg_dump -h source_host -U source_user -d source_db_name --inserts -f database_inserts.sql
```

## Update app configuration

After importing, update `/home/gamsmith/esker-data/fullstack-crud-app/backend/.env`:

```
DB_NAME=your_imported_db_name  # if different
DB_USER=crudapp
DB_PASSWORD=crudapp123
```

## Common issues and solutions

1. **Permission errors**: Make sure the user has proper permissions
```bash
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE your_db TO crudapp;"
```

2. **Encoding issues**: Specify encoding during import
```bash
PGPASSWORD='crudapp123' psql -U crudapp -d crudapp_db -h localhost -f backup.sql --set ON_ERROR_STOP=on --set ENCODING='UTF8'
```

3. **Large databases**: Use compression and parallel jobs
```bash
# Dump with compression and parallel jobs
pg_dump -h source_host -U source_user -d source_db_name -Fd -j 4 -f backup_directory/

# Restore with parallel jobs
pg_restore -U crudapp -d crudapp_db -h localhost -j 4 backup_directory/
```