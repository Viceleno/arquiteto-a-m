
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CostResult } from './CostCalculatorTypes';
import { Package, Wrench, Calculator, Info, HelpCircle, BookOpen } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CostResultDetailsProps {
  result: CostResult;
}

export const CostResultDetails: React.FC<CostResultDetailsProps> = ({ result }) => {
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const materials = result.materialDetails.filter(item => item.category === 'material');
  const auxiliaries = result.materialDetails.filter(item => item.category === 'auxiliary');

  const getMaterialExplanation = (materialName: string): string => {
    const explanations: Record<string, string> = {
      'Cimento Portland': 'Aglomerante hidráulico que confere resistência e durabilidade à estrutura. Responsável pela união dos agregados.',
      'Areia média': 'Agregado miúdo que preenche os vazios entre os agregados graúdos, conferindo trabalhabilidade ao concreto.',
      'Brita 1': 'Agregado graúdo que forma o esqueleto resistente do concreto, conferindo resistência mecânica.',
      'Água': 'Hidrata o cimento, ativando as reações químicas de endurecimento. Controla a consistência da mistura.',
      'Aço CA-50': 'Barras de aço para armadura que absorvem os esforços de tração, complementando a resistência do concreto.',
      'Arame recozido': 'Utilizado para amarração das armaduras, garantindo a posição correta das barras durante a concretagem.',
      'Espaçador plástico': 'Mantém o cobrimento adequado da armadura, protegendo contra corrosão e garantindo aderência.',
      'Lona plástica': 'Proteção contra intempéries durante a cura do concreto, evitando perda de água e trincas.',
      'Desmoldante': 'Facilita a retirada das formas, evitando aderência entre o concreto e a madeira/metal.',
      'Tijolo cerâmico': 'Elemento de vedação que oferece isolamento térmico e acústico, além de resistência mecânica.',
      'Argamassa': 'Mistura para assentamento e revestimento, garantindo aderência e nivelamento dos elementos.',
      'Tinta acrílica': 'Revestimento que protege e decora as superfícies, oferecendo resistência às intempéries.',
      'Selador': 'Prepara a superfície para receber a tinta, melhorando aderência e uniformidade do acabamento.',
      'Massa corrida': 'Corrige imperfeições da superfície, proporcionando acabamento liso e uniforme.',
      'Lixa': 'Prepara e nivela superfícies para aplicação de tintas e revestimentos.',
      'Rolo': 'Ferramenta para aplicação uniforme de tintas em grandes superfícies.',
      'Pincel': 'Utilizado para acabamentos, cantos e detalhes da pintura.',
      'Cerâmica': 'Revestimento impermeável e durável para pisos e paredes, de fácil limpeza e manutenção.',
      'Argamassa colante': 'Adesivo específico para fixação de revestimentos cerâmicos, garantindo aderência duradoura.',
      'Rejunte': 'Vedação entre peças cerâmicas que impermeabiliza e finaliza o acabamento.',
      'Espaçador': 'Mantém espaçamento uniforme entre peças cerâmicas durante o assentamento.',
      'Madeira': 'Material estrutural renovável com boa resistência mecânica e isolamento térmico.',
      'Prego': 'Elemento de fixação que une peças de madeira de forma rápida e eficiente.',
      'Parafuso': 'Fixação removível que oferece maior resistência mecânica que pregos.',
      'Cola': 'Adesivo que complementa fixações mecânicas, melhorando a união entre peças.'
    };
    return explanations[materialName] || 'Material utilizado conforme especificações técnicas do projeto.';
  };

  return (
    <div className="space-y-6">
      {/* Resumo Executivo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calculator className="w-5 h-5" />
            <span>Resumo do Orçamento</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">Materiais</p>
              <p className="text-lg font-bold text-blue-800">{formatCurrency(result.materialTotal)}</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600 font-medium">Mão de Obra</p>
              <p className="text-lg font-bold text-green-800">{formatCurrency(result.laborTotal)}</p>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-600 font-medium">BDI ({result.bdi}%)</p>
              <p className="text-lg font-bold text-yellow-800">{formatCurrency(result.bdiAmount)}</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-600 font-medium">Custo/m²</p>
              <p className="text-lg font-bold text-purple-800">{formatCurrency(result.costPerM2)}</p>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold">Total Geral:</span>
              <span className="text-2xl font-bold text-green-600">{formatCurrency(result.totalCost)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detalhamento de Materiais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="w-5 h-5" />
            <span>Materiais Principais</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-4 h-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Materiais principais necessários para a execução</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead>Preço Unit.</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materials.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{item.name}</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="w-4 h-4 text-blue-500 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p className="text-sm">{getMaterialExplanation(item.name)}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                  <TableCell>{item.quantity.toLocaleString('pt-BR')}</TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(item.total)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Insumos Auxiliares */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wrench className="w-5 h-5" />
            <span>Insumos Auxiliares</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-4 h-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Materiais complementares e ferramentas necessárias</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead>Preço Unit.</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auxiliaries.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{item.name}</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="w-4 h-4 text-blue-500 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p className="text-sm">{getMaterialExplanation(item.name)}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                  <TableCell>{item.quantity.toLocaleString('pt-BR')}</TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(item.total)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Explicações Técnicas */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-blue-900 dark:text-blue-100">
            <BookOpen className="w-5 h-5" />
            <span>Explicações Técnicas</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200">Cálculo de Materiais</h4>
              <div className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
                <p>• <strong>Consumo:</strong> Baseado em tabelas técnicas (SINAPI/TCPO)</p>
                <p>• <strong>Perdas:</strong> Percentual aplicado conforme o tipo de material</p>
                <p>• <strong>Preços:</strong> Valores de referência atualizados regionalmente</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200">Cálculo de Mão de Obra</h4>
              <div className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
                <p>• <strong>Produtividade:</strong> Baseada em índices técnicos reconhecidos</p>
                <p>• <strong>Complexidade:</strong> Fator multiplicador do tempo de execução</p>
                <p>• <strong>Valor/hora:</strong> Inclui encargos sociais e trabalhistas</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200">BDI - Benefícios e Despesas Indiretas</h4>
              <div className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
                <p>• <strong>Administração Central:</strong> Custos administrativos da empresa</p>
                <p>• <strong>Lucro:</strong> Margem de lucro da construtora</p>
                <p>• <strong>Impostos:</strong> Tributos incidentes sobre o faturamento</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200">Precisão do Orçamento</h4>
              <div className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
                <p>• <strong>Nível:</strong> Orçamento paramétrico (±15% de precisão)</p>
                <p>• <strong>Uso:</strong> Viabilidade e estudos preliminares</p>
                <p>• <strong>Recomendação:</strong> Confirmar preços regionais</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start space-x-2">
              <Info className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800 dark:text-yellow-200">
                <p className="font-medium mb-1">Importante:</p>
                <p>Este orçamento é uma estimativa inicial. Para projetos executivos, recomenda-se:</p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>Pesquisa de preços local detalhada</li>
                  <li>Análise específica das condições da obra</li>
                  <li>Consultoria com profissional habilitado</li>
                  <li>Verificação das normas técnicas aplicáveis</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
