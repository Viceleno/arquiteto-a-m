
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
      'Cimento CP-32': 'Cimento Portland comum, ideal para uso geral. Oferece boa resistência e durabilidade para estruturas convencionais.',
      'Areia média': 'Agregado miúdo que preenche os vazios entre os agregados graúdos, conferindo trabalhabilidade ao concreto.',
      'Brita 1': 'Agregado graúdo que forma o esqueleto resistente do concreto, conferindo resistência mecânica.',
      'Água': 'Hidrata o cimento, ativando as reações químicas de endurecimento. Controla a consistência da mistura.',
      'Aço CA-50': 'Barras de aço para armadura que absorvem os esforços de tração, complementando a resistência do concreto.',
      'Arame recozido': 'Utilizado para amarração das armaduras, garantindo a posição correta das barras durante a concretagem.',
      'Espaçador plástico': 'Mantém o cobrimento adequado da armadura, protegendo contra corrosão e garantindo aderência.',
      'Lona plástica': 'Proteção contra intempéries durante a cura do concreto, evitando perda de água e trincas.',
      'Desmoldante': 'Facilita a retirada das formas, evitando aderência entre o concreto e a madeira/metal.',
      'Tijolo cerâmico': 'Elemento de vedação que oferece isolamento térmico e acústico, além de resistência mecânica.',
      'Tijolo cerâmico 6 furos': 'Tijolo estrutural vazado que reduz o peso da alvenaria e melhora o isolamento térmico. Dimensões padrão 14x19x29cm.',
      'Argamassa de assentamento': 'TRAÇO RECOMENDADO: 1:2:8 (cimento:cal:areia) ou 1:6 (cimento:areia) para maior resistência. Função: unir os tijolos garantindo prumo, nível e resistência da alvenaria. Espessura ideal: 10-15mm. Adicione cal hidratada para melhorar trabalhabilidade e retenção de água.',
      'Argamassa de revestimento': 'TRAÇO PARA CHAPISCO: 1:3 (cimento:areia grossa) - aderência à base. TRAÇO PARA EMBOÇO: 1:2:8 (cimento:cal:areia média) - regularização. TRAÇO PARA REBOCO: 1:2:9 (cimento:cal:areia fina) - acabamento liso. A cal confere plasticidade e reduz fissuras.',
      'Argamassa colante': 'Adesivo industrializado para fixação de revestimentos cerâmicos. TIPOS: AC-I (interno), AC-II (externo), AC-III (alta aderência). Rendimento: ~4-5kg/m² com desempenadeira dentada 8x8mm. Tempo em aberto: 15-20 minutos.',
      'Argamassa': 'Mistura de cimento, agregados e aditivos. TRAÇOS BÁSICOS: Assentamento 1:4 a 1:6, Revestimento 1:2:8, Contrapiso 1:4. A proporção varia conforme resistência desejada e aplicação específica.',
      'Rolo': 'Ferramenta para aplicação uniforme de tintas em grandes superfícies.',
      'Pincel': 'Utilizado para acabamentos, cantos e detalhes da pintura.',
      'Cerâmica': 'Revestimento impermeável e durável para pisos e paredes, de fácil limpeza e manutenção.',
      'Cerâmica 45x45cm': 'Peça cerâmica de formato quadrado (45x45cm) para pisos e paredes. Oferece boa resistência ao tráfego e facilidade de limpeza. Rendimento: ~5 peças/m².',
      'Rejunte': 'Material de vedação entre peças cerâmicas. TIPOS: Cimentício (áreas secas) ou Epóxi (áreas molhadas). Largura da junta: 2-3mm para cerâmicas retificadas, 3-5mm para convencionais.',
      'Espaçador': 'Mantém espaçamento uniforme entre peças cerâmicas durante o assentamento.',
      'Madeira': 'Material estrutural renovável com boa resistência mecânica e isolamento térmico.',
      'Madeira para forma': 'Compensado ou tábua utilizada como forma para concreto. Espessura recomendada: 12-18mm para compensado, 25mm para tábuas. Permite reutilização de 3-5 vezes com cuidados adequados.',
      'Piso laminado': 'Revestimento de madeira reconstituída com acabamento melamínico. Resistente ao desgaste e fácil instalação com sistema click. Espessura padrão: 7-12mm.',
      'Manta acústica': 'Subpiso que reduz ruídos de impacto e melhora conforto acústico. Essencial em apartamentos. Espessura: 2-5mm.',
      'Rodapé': 'Acabamento na junção entre piso e parede. Altura padrão: 7-10cm. Protege contra umidade e facilita limpeza.',
      'Cola para piso': 'Adesivo específico para pisos de madeira. TIPOS: PVA (áreas secas) ou Poliuretano (áreas úmidas). Rendimento: ~1kg/m².',
      'Prego': 'Elemento de fixação que une peças de madeira de forma rápida e eficiente.',
      'Parafuso': 'Fixação removível que oferece maior resistência mecânica que pregos.',
      'Cola': 'Adesivo que complementa fixações mecânicas, melhorando a união entre peças.',
      'Tinta acrílica': 'Tinta à base de resina acrílica para uso interno e externo. RENDIMENTO: 12-16m²/litro (2 demãos). Diluição: 10-20% com água. Tempo de secagem: 4-6 horas.',
      'Selador acrílico': 'Fundo preparador que sela a porosidade da superfície. APLICAÇÃO: antes da tinta, especialmente em superfícies novas ou muito porosas. Rendimento: 14-18m²/litro.',
      'Massa corrida PVA': 'Massa para correção de imperfeições em superfícies internas. APLICAÇÃO: 2-3 demãos cruzadas com lixa entre elas. Espessura máxima: 3mm por demão.',
      'Lixa para parede': 'Abrasivo para preparo de superfícies. GRANULAÇÕES: #120 (desbaste), #220 (acabamento). Essencial para uniformização antes da pintura.'
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
          
          {/* Seção Específica sobre Argamassas */}
          <div className="mt-8 p-6 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
            <h4 className="font-bold text-green-800 dark:text-green-200 mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Guia Profissional de Argamassas e Traços
            </h4>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                  <h5 className="font-semibold text-green-700 dark:text-green-300 mb-2">Argamassa de Assentamento</h5>
                  <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    <p><strong>Para alvenaria estrutural:</strong> 1:6 (cimento:areia)</p>
                    <p><strong>Para vedação:</strong> 1:2:8 (cimento:cal:areia)</p>
                    <p><strong>Consumo:</strong> 18-20 litros/m² (junta 10mm)</p>
                    <p><strong>Dica profissional:</strong> Cal hidratada melhora trabalhabilidade</p>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                  <h5 className="font-semibold text-green-700 dark:text-green-300 mb-2">Argamassa de Revestimento</h5>
                  <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    <p><strong>Chapisco:</strong> 1:3 (cimento:areia grossa)</p>
                    <p><strong>Emboço:</strong> 1:2:8 (cimento:cal:areia média)</p>
                    <p><strong>Reboco:</strong> 1:2:9 (cimento:cal:areia fina)</p>
                    <p><strong>Consumo:</strong> 25L/m² (esp. 20mm)</p>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                  <h5 className="font-semibold text-green-700 dark:text-green-300 mb-2">Argamassa de Contrapiso</h5>
                  <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    <p><strong>Traço padrão:</strong> 1:4 (cimento:areia)</p>
                    <p><strong>Alta resistência:</strong> 1:3 (cimento:areia)</p>
                    <p><strong>Consumo:</strong> 25L/m² por cm de espessura</p>
                    <p><strong>Espessura mínima:</strong> 3cm</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                  <h5 className="font-semibold text-green-700 dark:text-green-300 mb-2">Materiais e Proporções</h5>
                  <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                    <p><strong>Cimento:</strong> CP-II ou CP-III para uso geral</p>
                    <p><strong>Cal hidratada:</strong> CH-I (primeira qualidade)</p>
                    <p><strong>Areia:</strong> Módulo de finura 2,0-3,5</p>
                    <p><strong>Água:</strong> Potável, sem impurezas</p>
                    <p><strong>Relação água/cimento:</strong> 0,45-0,65</p>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                  <h5 className="font-semibold text-green-700 dark:text-green-300 mb-2">Dicas do Profissional</h5>
                  <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    <p>• Misture sempre o cimento com areia seca primeiro</p>
                    <p>• Adicione água gradualmente até obter consistência</p>
                    <p>• Use argamassa em até 2,5 horas após preparo</p>
                    <p>• Temperatura ideal de aplicação: 15-25°C</p>
                    <p>• Cure por no mínimo 7 dias mantendo úmido</p>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                  <h5 className="font-semibold text-green-700 dark:text-green-300 mb-2">Controle de Qualidade</h5>
                  <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    <p>• Teste de consistência: cone de Abrams</p>
                    <p>• Resistência mínima: 2,5 MPa (vedação)</p>
                    <p>• Aderência mínima: 0,2 MPa</p>
                    <p>• Permeabilidade máxima: 10⁻¹⁰ m/s</p>
                  </div>
                </div>
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
