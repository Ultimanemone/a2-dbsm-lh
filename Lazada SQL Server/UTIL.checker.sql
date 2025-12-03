USE Lazada;
GO

-- Find all PROCEDUREs
SELECT ROUTINE_NAME, ROUTINE_TYPE
FROM INFORMATION_SCHEMA.ROUTINES
WHERE ROUTINE_TYPE = 'PROCEDURE';

-- Find all TRIGGERs
SELECT 
    t.name AS TriggerName,
    s.name AS SchemaName,
    o.name AS ParentObjectName,
    o.type_desc AS ParentObjectType,
    t.is_disabled
FROM sys.triggers t
JOIN sys.objects o ON t.parent_id = o.object_id
JOIN sys.schemas s ON o.schema_id = s.schema_id
ORDER BY s.name, o.name, t.name;
GO

SELECT * FROM [User].Account;
GO

SELECT TOP 25 Username, EmailMain FROM [User].Account;