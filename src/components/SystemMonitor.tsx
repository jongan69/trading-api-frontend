import React from 'react';
import { 
  Activity, 
  Server, 
  Clock, 
  BarChart3, 
  Wifi, 
  WifiOff,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { tradingAPI, SystemStatus, SystemMetrics, HealthResponse } from '../services/api';
import { useApi } from '../hooks/useApi';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';

interface SystemMonitorProps {
  className?: string;
}

export const SystemMonitor: React.FC<SystemMonitorProps> = ({ className = '' }) => {
  // API hooks
  const health = useApi(() => tradingAPI.getHealth());
  const systemStatus = useApi(() => tradingAPI.getSystemStatus());
  const systemMetrics = useApi(() => tradingAPI.getSystemMetrics());

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const getServiceStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'unhealthy':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getServiceStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
        return 'text-emerald-400';
      case 'unhealthy':
        return 'text-red-400';
      default:
        return 'text-yellow-400';
    }
  };

  const handleRefresh = () => {
    health.refetch();
    systemStatus.refetch();
    systemMetrics.refetch();
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Server className="text-blue-400" />
            System Monitor
          </h2>
          <button 
            onClick={handleRefresh}
            className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-slate-300" />
          </button>
        </div>

        {/* Health Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-900 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="text-emerald-400" />
              <span className="text-slate-400 text-sm">API Health</span>
            </div>
            {health.loading && <LoadingSpinner size="sm" />}
            {health.error && <div className="text-red-400 text-sm">Error</div>}
            {health.data && (
              <div className="text-white font-semibold">
                {health.data.status === 'ok' ? 'Healthy' : 'Unhealthy'}
              </div>
            )}
          </div>

          <div className="bg-slate-900 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="text-blue-400" />
              <span className="text-slate-400 text-sm">Uptime</span>
            </div>
            {systemStatus.loading && <LoadingSpinner size="sm" />}
            {systemStatus.error && <div className="text-red-400 text-sm">Error</div>}
            {systemStatus.data && (
              <div className="text-white font-semibold">
                {formatUptime(systemStatus.data.uptime)}
              </div>
            )}
          </div>

          <div className="bg-slate-900 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="text-purple-400" />
              <span className="text-slate-400 text-sm">Version</span>
            </div>
            {systemStatus.loading && <LoadingSpinner size="sm" />}
            {systemStatus.error && <div className="text-red-400 text-sm">Error</div>}
            {systemStatus.data && (
              <div className="text-white font-semibold">
                v{systemStatus.data.version}
              </div>
            )}
          </div>
        </div>

        {/* System Metrics */}
        {systemMetrics.data && (
          <div className="bg-slate-900 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Performance Metrics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-slate-400 text-sm mb-1">Total Requests</div>
                <div className="text-white font-semibold">
                  {systemMetrics.data.total_requests.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-slate-400 text-sm mb-1">Error Rate</div>
                <div className="text-white font-semibold">
                  {(systemMetrics.data.error_rate * 100).toFixed(2)}%
                </div>
              </div>
              <div>
                <div className="text-slate-400 text-sm mb-1">Avg Response Time</div>
                <div className="text-white font-semibold">
                  {systemMetrics.data.average_response_time.toFixed(0)}ms
                </div>
              </div>
              <div>
                <div className="text-slate-400 text-sm mb-1">Active Connections</div>
                <div className="text-white font-semibold">
                  {systemMetrics.data.active_connections}
                </div>
              </div>
            </div>
            
            {/* Memory Usage */}
            <div className="mt-4">
              <div className="flex justify-between text-slate-400 text-sm mb-2">
                <span>Memory Usage</span>
                <span>{systemMetrics.data.memory_usage.percentage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${systemMetrics.data.memory_usage.percentage}%` }}
                ></div>
              </div>
              <div className="text-slate-400 text-xs mt-1">
                {systemMetrics.data.memory_usage.used_mb.toFixed(0)}MB / {systemMetrics.data.memory_usage.total_mb.toFixed(0)}MB
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Service Status */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Wifi className="text-emerald-400" />
          External Services
        </h3>
        
        {systemStatus.loading && <LoadingSpinner />}
        {systemStatus.error && <ErrorMessage message={systemStatus.error} onRetry={systemStatus.refetch} />}
        {systemStatus.data && (
          <div className="space-y-4">
            {Object.entries(systemStatus.data.services).map(([serviceName, service]) => (
              <div key={serviceName} className="bg-slate-900 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getServiceStatusIcon(service.status)}
                    <div>
                      <div className="text-white font-semibold capitalize">
                        {serviceName.replace('_', ' ')}
                      </div>
                      <div className={`text-sm ${getServiceStatusColor(service.status)}`}>
                        {service.status}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-slate-400 text-sm">Response Time</div>
                    <div className="text-white font-semibold">
                      {service.response_time_ms}ms
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-slate-400">Last Check</div>
                    <div className="text-white">
                      {formatTimestamp(service.last_check)}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400">Error Count</div>
                    <div className="text-white">
                      {service.error_count}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400">Status</div>
                    <div className={`${getServiceStatusColor(service.status)}`}>
                      {service.status}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* System Information */}
      {systemStatus.data && (
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-xl font-bold text-white mb-4">System Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900 rounded-lg p-4">
              <div className="text-slate-400 text-sm mb-1">Environment</div>
              <div className="text-white font-semibold capitalize">
                {systemStatus.data.environment}
              </div>
            </div>
            <div className="bg-slate-900 rounded-lg p-4">
              <div className="text-slate-400 text-sm mb-1">Last Updated</div>
              <div className="text-white font-semibold">
                {formatTimestamp(systemStatus.data.timestamp)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
