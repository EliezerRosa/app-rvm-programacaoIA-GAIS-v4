// lib/validationCache.ts
interface CacheEntry {
  result: boolean;
  reason: string;
  timestamp: number;
}

class ValidationCache {
  private cache = new Map<string, CacheEntry>();
  private readonly TTL = 5 * 60 * 1000; // 5 minutos
  
  private generateKey(publisherId: string, partType: string, partTitle: string, meetingDate: string, rulesHash: string): string {
    return `${publisherId}:${partType}:${partTitle}:${meetingDate}:${rulesHash}`;
  }
  
  private hashRules(rules: any[]): string {
    return rules.map(r => `${r.id}:${r.isActive}`).join('|');
  }
  
  get(publisherId: string, partType: string, partTitle: string, meetingDate: string, rules: any[]): CacheEntry | null {
    const key = this.generateKey(publisherId, partType, partTitle, meetingDate, this.hashRules(rules));
    const entry = this.cache.get(key);
    
    if (entry && Date.now() - entry.timestamp < this.TTL) {
      return entry;
    }
    
    // Remove entrada expirada
    if (entry) {
      this.cache.delete(key);
    }
    
    return null;
  }
  
  set(publisherId: string, partType: string, partTitle: string, meetingDate: string, rules: any[], result: boolean, reason: string): void {
    const key = this.generateKey(publisherId, partType, partTitle, meetingDate, this.hashRules(rules));
    this.cache.set(key, {
      result,
      reason,
      timestamp: Date.now()
    });
    
    // Cleanup - manter apenas últimas 1000 entradas
    if (this.cache.size > 1000) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  getStats(): { size: number; hitRate: number } {
    // Implementação básica - em produção, rastrear hits/misses
    return {
      size: this.cache.size,
      hitRate: 0 // Placeholder
    };
  }
}

export const validationCache = new ValidationCache();