
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { History, FileText, Trash2, Download } from 'lucide-react';

export const HistoryPanel = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem('archiCalc_history') || '[]');
    setHistory(savedHistory);
  }, []);

  const clearHistory = () => {
    localStorage.removeItem('archiCalc_history');
    setHistory([]);
  };

  const exportHistory = () => {
    const dataStr = JSON.stringify(history, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'historico_calculos_arquitetura.json';
    link.click();
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <History className="w-5 h-5" />
          <span>Histórico de Cálculos</span>
        </CardTitle>
        <CardDescription>
          Seus cálculos anteriores salvos automaticamente
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between mb-4">
          <Button onClick={exportHistory} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={clearHistory} variant="outline" size="sm">
            <Trash2 className="w-4 h-4 mr-2" />
            Limpar Histórico
          </Button>
        </div>

        {history.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Nenhum cálculo salvo ainda</p>
            <p className="text-sm">Seus cálculos aparecerão aqui automaticamente</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {history.map((item: any, index) => (
              <div key={index} className="border rounded-lg p-3 bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900">
                    Cálculo de {item.shape || 'Material'}
                  </h4>
                  <span className="text-xs text-gray-500">
                    {new Date(item.timestamp).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  {item.area && <p>Área: {item.area} {item.unit}</p>}
                  {item.volume && <p>Volume: {item.volume} m³</p>}
                  {item.totalBricks && <p>Tijolos: {item.totalBricks} unidades</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
