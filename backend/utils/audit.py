from models.audit_log import AuditLog


def create_audit_log(
    db,
    document_id,
    action,
    user,
    ip_address
):
    log = AuditLog(
        document_id=document_id,
        action=action,
        user=user,
        ip_address=ip_address
    )

    db.add(log)
    db.commit()