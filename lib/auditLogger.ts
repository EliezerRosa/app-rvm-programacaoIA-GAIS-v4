// lib/auditLogger.ts
export interface AuditLog {
  id: string;
  timestamp: string;
  action: 'ASSIGNMENT_CREATED' | 'ASSIGNMENT_EDITED' | 'ASSIGNMENT_DELETED' | 'AI_GENERATION' | 'RULE_VIOLATION_BLOCKED';
  details: {
    publisherName?: string;
    partTitle?: string;
    week?: string;
    reason?: string;
    userId?: string;
    source: 'MANUAL' | 'AI';
  };
  severity: 'INFO' | 'WARNING' | 'ERROR';
}

class AuditLogger {
  private logs: AuditLog[] = [];
  
  log(action: AuditLog['action'], details: AuditLog['details'], severity: AuditLog['severity'] = 'INFO') {
    const logEntry: AuditLog = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      action,
      details,
      severity
    };
    
    this.logs.push(logEntry);
    console.log(`[AUDIT] ${severity}: ${action}`, details);
    
    // Em produção, enviar para serviço de logging externo
    this.persistLog(logEntry);
  }
  
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
  
  private persistLog(log: AuditLog) {
    // Persistir no localStorage para desenvolvimento
    // Em produção, usar API externa
    const existingLogs = JSON.parse(localStorage.getItem('auditLogs') || '[]');
    existingLogs.push(log);
    localStorage.setItem('auditLogs', JSON.stringify(existingLogs.slice(-1000))); // Manter apenas últimas 1000
  }
  
  getRuleViolationStats(): { [rule: string]: number } {
    return this.logs
      .filter(log => log.action === 'RULE_VIOLATION_BLOCKED')
      .reduce((acc, log) => {
        const reason = log.details.reason || 'Unknown';
        acc[reason] = (acc[reason] || 0) + 1;
        return acc;
      }, {} as { [rule: string]: number });
  }
  
  getAssignmentHistory(publisherName: string): AuditLog[] {
    return this.logs.filter(log => log.details.publisherName === publisherName);
  }
  
  exportLogs(): AuditLog[] {
    return [...this.logs];
  }
}

export const auditLogger = new AuditLogger();