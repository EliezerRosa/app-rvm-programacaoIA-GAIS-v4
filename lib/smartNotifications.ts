// lib/smartNotifications.ts
import { Publisher, Participation } from '../types';

export interface SmartNotification {
  id: string;
  type: 'WARNING' | 'INFO' | 'SUCCESS' | 'ERROR';
  title: string;
  message: string;
  timestamp: number;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
  autoClose?: boolean;
  duration?: number;
}

class SmartNotificationSystem {
  private notifications: SmartNotification[] = [];
  private listeners: Array<(notifications: SmartNotification[]) => void> = [];
  
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
  
  show(notification: Omit<SmartNotification, 'id' | 'timestamp'>): string {
    const id = this.generateId();
    const fullNotification: SmartNotification = {
      ...notification,
      id,
      timestamp: Date.now(),
      autoClose: notification.autoClose ?? true,
      duration: notification.duration ?? 5000
    };
    
    this.notifications.push(fullNotification);
    this.notifyListeners();
    
    // Auto-remove se configurado
    if (fullNotification.autoClose) {
      setTimeout(() => this.remove(id), fullNotification.duration);
    }
    
    return id;
  }
  
  remove(id: string): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notifyListeners();
  }
  
  clear(): void {
    this.notifications = [];
    this.notifyListeners();
  }
  
  subscribe(listener: (notifications: SmartNotification[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
  
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener([...this.notifications]));
  }
  
  // Notificações específicas do domínio
  notifyChildWithoutParent(child: Publisher): void {
    this.show({
      type: 'WARNING',
      title: 'Atenção: Criança sem ajudante válido',
      message: `${child.name} não pode ser pareado com nenhum ajudante disponível. Verifique se um dos pais está disponível.`,
      autoClose: false,
      actions: [{
        label: 'Ver Pais',
        action: () => console.log('Mostrar pais de', child.name)
      }]
    });
  }
  
  notifyOverusedPublisher(publisher: Publisher, recentCount: number): void {
    this.show({
      type: 'INFO',
      title: 'Publicador com muitas designações',
      message: `${publisher.name} recebeu ${recentCount} designações nas últimas semanas. Considere dar oportunidade a outros.`,
      actions: [{
        label: 'Ver Histórico',
        action: () => console.log('Mostrar histórico de', publisher.name)
      }]
    });
  }
  
  notifySuccessfulAiGeneration(assignmentsCount: number): void {
    this.show({
      type: 'SUCCESS',
      title: 'Pauta gerada com sucesso!',
      message: `${assignmentsCount} designações foram criadas automaticamente.`
    });
  }
  
  notifyRuleViolationPrevented(reason: string): void {
    this.show({
      type: 'WARNING',
      title: 'Designação bloqueada',
      message: `A designação foi impedida: ${reason}`
    });
  }
}

export const smartNotifications = new SmartNotificationSystem();