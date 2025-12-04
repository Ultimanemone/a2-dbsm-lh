USE Lazada
GO

-- Drop all FK constraints
DECLARE @sql NVARCHAR(MAX) = N'';

SELECT @sql += N'
ALTER TABLE ' + QUOTENAME(OBJECT_SCHEMA_NAME(parent_object_id)) 
    + '.' + QUOTENAME(OBJECT_NAME(parent_object_id))
    + ' DROP CONSTRAINT ' + QUOTENAME(name) + ';'
FROM sys.foreign_keys;

EXEC sp_executesql @sql;


-- Drop all tables
SET @sql = N'';

SELECT @sql += N'
DROP TABLE ' + QUOTENAME(OBJECT_SCHEMA_NAME(object_id))
    + '.' + QUOTENAME(name) + ';'
FROM sys.tables;

EXEC sp_executesql @sql;
