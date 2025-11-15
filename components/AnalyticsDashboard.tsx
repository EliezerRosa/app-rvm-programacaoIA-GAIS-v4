import React, { useState, useEffect, useMemo } from 'react';
import { analyticsEngine, AnalyticsMetrics } from '../lib/analytics';
import { Publisher, Participation } from '../types';

interface AnalyticsDashboardProps {
  publishers: Publisher[];
  participations: Participation[];
  isOpen: boolean;
  onClose: () => void;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ 
  publishers, 
  participations, 
  isOpen, 
  onClose 
}) => {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const derivedMetrics = useMemo(() => {
    if (!metrics) {
      return {
        participationCounts: [] as number[],
        totalAssignments: 0,
        sortedParticipationEntries: [] as Array<[string, number]>,
        sectionValues: [] as number[],
        maxSectionCount: 1,
        femaleParticipationPercentage: 0,
      };
    }

    const participationCounts = Object.values(metrics.participationDistribution) as number[];
    const totalAssignments = participationCounts.reduce((sum, count) => sum + count, 0);
    const sortedParticipationEntries = Object.entries(metrics.participationDistribution)
      .map(([name, count]) => [name, Number(count)] as [string, number])
      .sort(([, countA], [, countB]) => countB - countA);
    const sectionValues = Object.values(metrics.sectionBalance) as number[];
    const maxSectionCount = sectionValues.length > 0 ? Math.max(...sectionValues) : 1;
    const totalGenderParticipations = metrics.genderBalance.male + metrics.genderBalance.female;
    const femaleParticipationPercentage = totalGenderParticipations > 0
      ? Math.round((metrics.genderBalance.female / totalGenderParticipations) * 100)
      : 0;

    return {
      participationCounts,
      totalAssignments,
      sortedParticipationEntries,
      sectionValues,
      maxSectionCount,
      femaleParticipationPercentage,
    };
  }, [metrics]);

  useEffect(() => {
    if (isOpen && publishers.length > 0) {
      setLoading(true);
      try {
        const calculatedMetrics = analyticsEngine.calculateMetrics(publishers, participations);
        const recs = analyticsEngine.generateRecommendations(calculatedMetrics);
        
        setMetrics(calculatedMetrics);
        setRecommendations(recs);
      } catch (error) {
        console.error('Erro ao calcular métricas:', error);
      } finally {
        setLoading(false);
      }
    }
  }, [isOpen, publishers, participations]);

  if (!isOpen) return null;

  const renderMetricCard = (title: string, value: string | number, subtitle?: string, color = 'blue') => (
    <div className={`bg-gradient-to-r from-${color}-50 to-${color}-100 dark:from-${color}-900 dark:to-${color}-800 p-4 rounded-lg shadow-sm`}>
      <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{title}</h3>
      <p className={`text-2xl font-bold text-${color}-600 dark:text-${color}-400`}>{value}</p>
      {subtitle && <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl m-4 max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              📊 Analytics da Congregação
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <span className="text-2xl">×</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Calculando métricas...</p>
              </div>
            </div>
          ) : metrics ? (
            <>
              {/* Métricas Principais */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {renderMetricCard(
                  'Compliance Segurança Infantil',
                  `${metrics.childSafetyCompliance}%`,
                  'Meta: 100%',
                  metrics.childSafetyCompliance === 100 ? 'green' : 'red'
                )}
                {renderMetricCard(
                  'Total Designações',
                  derivedMetrics.totalAssignments,
                  'Últimos 3 meses'
                )}
                {renderMetricCard(
                  'Publicadores Ativos',
                  Object.keys(metrics.participationDistribution).length,
                  'Com designações'
                )}
                {renderMetricCard(
                  'Equilíbrio de Gênero',
                  `${derivedMetrics.femaleParticipationPercentage}%`,
                  'Participação feminina',
                  'purple'
                )}
              </div>

              {/* Recomendações */}
              {recommendations.length > 0 && (
                <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-3 flex items-center">
                    💡 Recomendações
                  </h3>
                  <ul className="space-y-2">
                    {recommendations.map((rec, index) => (
                      <li key={index} className="text-yellow-700 dark:text-yellow-300 text-sm flex items-start">
                        <span className="mr-2">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Distribuição de Participações */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">📈 Distribuição de Participações</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-64 overflow-y-auto">
                  {derivedMetrics.sortedParticipationEntries
                    .map(([name, count]) => (
                      <div key={name} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                        <span className="text-sm text-gray-700 dark:text-gray-300">{name}</span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">{count}</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Distribuição por Seção */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">📚 Distribuição por Seção</h3>
                <div className="space-y-2">
                  {Object.entries(metrics.sectionBalance).map(([section, count]) => (
                    <div key={section} className="flex justify-between items-center">
                      <span className="text-sm text-gray-700 dark:text-gray-300">{section}</span>
                      <div className="flex items-center">
                        <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-3">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ 
                              width: `${derivedMetrics.maxSectionCount > 0 ? (Number(count) / derivedMetrics.maxSectionCount) * 100 : 0}%`
                            }}
                          ></div>
                        </div>
                        <span className="font-semibold text-blue-600 dark:text-blue-400 min-w-[2rem] text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400">
              Nenhum dado disponível para análise
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Dados baseados nos últimos 3 meses de atividade
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;