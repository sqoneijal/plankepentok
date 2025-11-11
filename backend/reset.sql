SELECT setval('tb_audit_logs_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM tb_audit_logs));
