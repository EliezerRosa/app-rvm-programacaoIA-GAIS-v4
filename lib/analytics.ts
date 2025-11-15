// lib/analytics.ts
import { Publisher, Participation } from '../types';

export interface AnalyticsMetrics {
  participationDistribution: { [publisherName: string]: number };
  genderBalance: { male: number; female: number };
  roleDistribution: { [condition: string]: number };
  frequencyAnalysis: { [publisherName: string]: { lastAssignment: string; frequency: number } };
  childSafetyCompliance: number; // Percentual de cumprimento
  availabilityUtilization: { [publisherName: string]: number };
  sectionBalance: { [section: string]: number };
}

class AnalyticsEngine {
  calculateMetrics(publishers: Publisher[], participations: Participation[]): AnalyticsMetrics {
    const now = new Date();
    const last3Months = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    
    const recentParticipations = participations.filter(p => 
      new Date(p.date) >= last3Months
    );
    
    return {
      participationDistribution: this.calculateParticipationDistribution(recentParticipations),
      genderBalance: this.calculateGenderBalance(recentParticipations, publishers),
      roleDistribution: this.calculateRoleDistribution(recentParticipations, publishers),
      frequencyAnalysis: this.calculateFrequencyAnalysis(recentParticipations, publishers),
      childSafetyCompliance: this.calculateChildSafetyCompliance(recentParticipations, publishers),
      availabilityUtilization: this.calculateAvailabilityUtilization(publishers, recentParticipations),
      sectionBalance: this.calculateSectionBalance(recentParticipations)
    };
  }
  
  private calculateParticipationDistribution(participations: Participation[]): { [publisherName: string]: number } {
    return participations.reduce((acc, p) => {
      acc[p.publisherName] = (acc[p.publisherName] || 0) + 1;
      return acc;
    }, {} as { [publisherName: string]: number });
  }
  
  private calculateGenderBalance(participations: Participation[], publishers: Publisher[]): { male: number; female: number } {
    const maleParticipations = participations.filter(p => {
      const publisher = publishers.find(pub => pub.name === p.publisherName);
      return publisher?.gender === 'brother';
    }).length;
    
    const femaleParticipations = participations.length - maleParticipations;
    
    return { male: maleParticipations, female: femaleParticipations };
  }
  
  private calculateRoleDistribution(participations: Participation[], publishers: Publisher[]): { [condition: string]: number } {
    return participations.reduce((acc, p) => {
      const publisher = publishers.find(pub => pub.name === p.publisherName);
      if (publisher) {
        acc[publisher.condition] = (acc[publisher.condition] || 0) + 1;
      }
      return acc;
    }, {} as { [condition: string]: number });
  }
  
  private calculateFrequencyAnalysis(participations: Participation[], publishers: Publisher[]): { [publisherName: string]: { lastAssignment: string; frequency: number } } {
    const analysis: { [publisherName: string]: { lastAssignment: string; frequency: number } } = {};
    
    publishers.forEach(publisher => {
      const publisherParticipations = participations
        .filter(p => p.publisherName === publisher.name)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      analysis[publisher.name] = {
        lastAssignment: publisherParticipations[0]?.week || 'Nunca',
        frequency: publisherParticipations.length
      };
    });
    
    return analysis;
  }
  
  private calculateChildSafetyCompliance(participations: Participation[], publishers: Publisher[]): number {
    const childParticipations = participations.filter(p => {
      const publisher = publishers.find(pub => pub.name === p.publisherName);
      return publisher?.ageGroup === 'Criança';
    });
    
    if (childParticipations.length === 0) return 100;
    
    let compliantCount = 0;
    
    for (const childParticipation of childParticipations) {
      const child = publishers.find(p => p.name === childParticipation.publisherName);
      if (!child) continue;
      
      // Verificar se há ajudante apropriado na mesma semana
      const helper = participations.find(p => 
        p.week === childParticipation.week && 
        p.type.includes('Ajudante')
      );
      
      if (helper) {
        const helperPublisher = publishers.find(p => p.name === helper.publisherName);
        if (helperPublisher) {
          const isParent = child.parentIds.includes(helperPublisher.id);
          const isAuthorizedAdult = child.canPairWithNonParent && helperPublisher.ageGroup === 'Adulto';
          
          if (isParent || isAuthorizedAdult) {
            compliantCount++;
          }
        }
      }
    }
    
    return Math.round((compliantCount / childParticipations.length) * 100);
  }
  
  private calculateAvailabilityUtilization(publishers: Publisher[], participations: Participation[]): { [publisherName: string]: number } {
    const utilization: { [publisherName: string]: number } = {};
    
    publishers.forEach(publisher => {
      const assignedCount = participations.filter(p => p.publisherName === publisher.name).length;
      
      // Calcular quantas oportunidades o publicador teve (aproximação)
      const totalOpportunities = participations.length / publishers.length; // Distribuição ideal
      
      utilization[publisher.name] = Math.round((assignedCount / totalOpportunities) * 100);
    });
    
    return utilization;
  }
  
  private calculateSectionBalance(participations: Participation[]): { [section: string]: number } {
    return participations.reduce((acc, p) => {
      acc[p.type] = (acc[p.type] || 0) + 1;
      return acc;
    }, {} as { [section: string]: number });
  }
  
  generateRecommendations(metrics: AnalyticsMetrics): string[] {
    const recommendations: string[] = [];
    
    // Análise de distribuição
    const participationValues = Object.values(metrics.participationDistribution);
    const avgParticipation = participationValues.reduce((a, b) => a + b, 0) / participationValues.length;
    const overutilized = Object.entries(metrics.participationDistribution)
      .filter(([_, count]) => count > avgParticipation * 1.5)
      .map(([name]) => name);
    
    if (overutilized.length > 0) {
      recommendations.push(`Considere reduzir as designações para: ${overutilized.join(', ')}`);
    }
    
    // Análise de equilíbrio de gênero (onde apropriado)
    const { male, female } = metrics.genderBalance;
    if (female > 0 && male / (male + female) < 0.3) {
      recommendations.push('Considere mais oportunidades para irmãos nas seções apropriadas');
    }
    
    // Compliance de segurança infantil
    if (metrics.childSafetyCompliance < 100) {
      recommendations.push(`⚠️ CRÍTICO: Compliance de segurança infantil em ${metrics.childSafetyCompliance}%. Revisar regras de pareamento.`);
    }
    
    return recommendations;
  }
}

export const analyticsEngine = new AnalyticsEngine();