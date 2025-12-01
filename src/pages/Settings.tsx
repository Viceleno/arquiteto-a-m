import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings as SettingsIcon, 
  User, 
  Palette,
  Calculator,
  Save,
  Check,
  Info,
  Building2,
  MapPin,
  Phone,
  Globe,
  Image as ImageIcon,
  Upload,
  Percent,
  DollarSign,
  Package,
  Clock,
  RotateCcw,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '@/hooks/useSettings';

const settingsSchema = z.object({
  // Preferências gerais
  theme: z.enum(['light', 'dark', 'system']),
  email_notifications: z.boolean(),
  
  // Configurações de cálculo
  default_margin: z.number().min(0).max(100),
  auto_save_calculations: z.boolean(),
  decimal_places: z.number().min(0).max(6),
  
  // Parâmetros de Engenharia
  bdi_padrao: z.number().min(0).max(100),
  encargos_sociais: z.number().min(0).max(200),
  valor_hora_tecnica: z.number().min(0),
  perda_padrao_materiais: z.number().min(0).max(50),
  
  // Dados da Empresa
  registro_profissional: z.string().max(50).optional(),
  razao_social: z.string().max(200).optional(),
  endereco_comercial: z.string().max(500).optional(),
  telefone_comercial: z.string().max(20).optional(),
  site_portfolio: z.union([z.string().url(), z.literal('')]).optional(),
  logo_url: z.union([z.string().url(), z.literal('')]).optional(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

const Settings = () => {
  const { user, loading: authLoading } = useAuth();
  const { settings, loading: settingsLoading, updateSettings, resetToMarketDefaults } = useSettings();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      theme: 'light',
      email_notifications: true,
      default_margin: 10,
      auto_save_calculations: true,
      decimal_places: 2,
      bdi_padrao: 20,
      encargos_sociais: 88,
      valor_hora_tecnica: 150,
      perda_padrao_materiais: 5,
      registro_profissional: '',
      razao_social: '',
      endereco_comercial: '',
      telefone_comercial: '',
      site_portfolio: '',
      logo_url: '',
    },
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Load user profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          throw profileError;
        }

        if (profileData) {
          form.setValue('registro_profissional', profileData.registro_profissional || '');
          form.setValue('razao_social', profileData.razao_social || '');
          form.setValue('endereco_comercial', profileData.endereco_comercial || '');
          form.setValue('telefone_comercial', profileData.telefone_comercial || '');
          form.setValue('site_portfolio', profileData.site_portfolio || '');
          form.setValue('logo_url', profileData.logo_url || '');
        }
      } catch (error: any) {
        console.error('Error loading profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user && !settingsLoading) {
      loadProfile();
    }
  }, [user, form, settingsLoading]);

  // Update form when settings change
  useEffect(() => {
    if (settings) {
      form.setValue('theme', settings.theme);
      form.setValue('email_notifications', settings.email_notifications);
      form.setValue('default_margin', settings.default_margin);
      form.setValue('auto_save_calculations', settings.auto_save_calculations);
      form.setValue('decimal_places', settings.decimal_places);
      form.setValue('bdi_padrao', settings.bdi_padrao);
      form.setValue('encargos_sociais', settings.encargos_sociais);
      form.setValue('valor_hora_tecnica', settings.valor_hora_tecnica);
      form.setValue('perda_padrao_materiais', settings.perda_padrao_materiais);
    }
  }, [settings, form]);

  // Handle individual setting changes for instant feedback
  const handleSettingChange = async (field: keyof SettingsFormValues, value: any) => {
    try {
      if (['theme', 'email_notifications', 'default_margin', 'auto_save_calculations', 'decimal_places', 'bdi_padrao', 'encargos_sociais', 'valor_hora_tecnica', 'perda_padrao_materiais'].includes(field)) {
        await updateSettings({ [field]: value });
        
        // Show success feedback for important changes
        if (field === 'theme') {
          toast({
            title: '🎨 Tema alterado',
            description: `Tema alterado para ${value === 'light' ? 'claro' : value === 'dark' ? 'escuro' : 'sistema'}`,
            duration: 2000,
          });
        }
      }
    } catch (error: any) {
      toast({
        title: '❌ Erro ao salvar',
        description: error.message,
        variant: 'destructive',
        duration: 3000,
      });
    }
  };

  const onSubmit = async (values: SettingsFormValues) => {
    if (!user || isSaving) return;
    
    setIsSaving(true);
    
    try {
      // Atualizar configurações usando o hook
      await updateSettings({
        theme: values.theme,
        email_notifications: values.email_notifications,
        default_margin: values.default_margin,
        auto_save_calculations: values.auto_save_calculations,
        decimal_places: values.decimal_places,
        bdi_padrao: values.bdi_padrao,
        encargos_sociais: values.encargos_sociais,
        valor_hora_tecnica: values.valor_hora_tecnica,
        perda_padrao_materiais: values.perda_padrao_materiais,
      });

      // Atualizar perfil corporativo
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          registro_profissional: values.registro_profissional || null,
          razao_social: values.razao_social || null,
          endereco_comercial: values.endereco_comercial || null,
          telefone_comercial: values.telefone_comercial || null,
          site_portfolio: values.site_portfolio || null,
          logo_url: values.logo_url || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      toast({
        title: '✅ Configurações salvas',
        description: 'Suas preferências foram atualizadas com sucesso.',
        duration: 3000,
      });
    } catch (error: any) {
      toast({
        title: '❌ Erro ao salvar',
        description: error.message,
        variant: 'destructive',
        duration: 5000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const clearData = async () => {
    if (!user) return;
    
    if (!window.confirm('⚠️ Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      await supabase
        .from('calculations')
        .delete()
        .eq('user_id', user.id);

      toast({
        title: '🗑️ Dados limpos',
        description: 'Todos os seus cálculos foram removidos.',
        duration: 3000,
      });
    } catch (error: any) {
      toast({
        title: '❌ Erro ao limpar dados',
        description: error.message,
        variant: 'destructive',
        duration: 5000,
      });
    }
  };

  const handleResetMarketDefaults = async () => {
    if (!window.confirm('🔄 Restaurar todos os parâmetros para os padrões de mercado?\n\n' +
      '• BDI: 20%\n' +
      '• Encargos Sociais: 88%\n' +
      '• Hora Técnica: R$ 150,00\n' +
      '• Perda Materiais: 5%')) {
      return;
    }

    setIsResetting(true);
    try {
      await resetToMarketDefaults();
      
      // Recarregar o formulário com os novos valores
      if (settings) {
        form.setValue('bdi_padrao', 20);
        form.setValue('encargos_sociais', 88);
        form.setValue('valor_hora_tecnica', 150);
        form.setValue('perda_padrao_materiais', 5);
      }

      toast({
        title: '✅ Parâmetros Restaurados',
        description: 'Seus parâmetros foram resetados para os padrões de mercado com sucesso!',
        duration: 3000,
      });
    } catch (error: any) {
      toast({
        title: '❌ Erro ao restaurar padrões',
        description: error?.message || 'Não foi possível restaurar os parâmetros padrão.',
        variant: 'destructive',
        duration: 5000,
      });
    } finally {
      setIsResetting(false);
    }
  };

  if (authLoading || (user && (isLoading || settingsLoading))) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="text-gray-600 dark:text-gray-400 animate-pulse">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 lg:p-6">
          <div className="max-w-5xl mx-auto">
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <SettingsIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Configurações</h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Personalize a aplicação de acordo com suas preferências
                  </p>
                </div>
              </div>
            </div>
            
            <Tabs defaultValue="general" className="space-y-8">
              <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-white dark:bg-gray-800 shadow-sm border dark:border-gray-700">
                <TabsTrigger value="general" className="flex items-center gap-2 px-4 py-3 text-sm font-medium data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900/30 dark:data-[state=active]:text-blue-400">
                  <Palette className="w-4 h-4" />
                  <span className="hidden sm:inline">Geral</span>
                </TabsTrigger>
                <TabsTrigger value="calculations" className="flex items-center gap-2 px-4 py-3 text-sm font-medium data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900/30 dark:data-[state=active]:text-blue-400">
                  <Calculator className="w-4 h-4" />
                  <span className="hidden sm:inline">Cálculos</span>
                </TabsTrigger>
                <TabsTrigger value="profile" className="flex items-center gap-2 px-4 py-3 text-sm font-medium data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900/30 dark:data-[state=active]:text-blue-400">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Perfil</span>
                </TabsTrigger>
              </TabsList>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  
                  <TabsContent value="general" className="space-y-6">
                    <Card className="shadow-sm border-0 bg-white dark:bg-gray-800 dark:border-gray-700">
                      <CardHeader className="pb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <Palette className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <CardTitle className="text-xl dark:text-white">Preferências Gerais</CardTitle>
                            <CardDescription className="text-gray-600 dark:text-gray-400">
                              Configure a aparência e notificações da aplicação
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <FormField
                          control={form.control}
                          name="theme"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2 text-sm font-medium dark:text-white">
                                <Palette className="w-4 h-4" />
                                Tema
                              </FormLabel>
                              <Select 
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  handleSettingChange('theme', value);
                                }} 
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="h-11 dark:bg-gray-700 dark:border-gray-600">
                                    <SelectValue placeholder="Selecione um tema" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="light">🌞 Claro</SelectItem>
                                  <SelectItem value="dark">🌙 Escuro</SelectItem>
                                  <SelectItem value="system">💻 Sistema</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription className="text-xs text-gray-500 dark:text-gray-400">
                                Escolha entre tema claro, escuro ou automático
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="email_notifications"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Receber novidades por email</FormLabel>
                                <FormDescription className="text-sm text-muted-foreground">
                                  Receba atualizações e novidades sobre o aplicativo
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={(checked) => {
                                    field.onChange(checked);
                                    handleSettingChange('email_notifications', checked);
                                  }}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                          <div className="flex items-center gap-2 mb-4">
                            <Info className="w-4 h-4 text-blue-500" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status das configurações</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                              <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                              <span className="text-green-700 dark:text-green-300">
                                Tema: {settings?.theme === 'light' ? '🌞 Claro' : settings?.theme === 'dark' ? '🌙 Escuro' : '💻 Sistema'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                              <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              <span className="text-blue-700 dark:text-blue-300">
                                Sistema: 📏 Métrico (m, m², m³)
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="calculations">
                    <Card className="shadow-sm border-0 bg-white dark:bg-gray-800 dark:border-gray-700">
                      <CardHeader className="pb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                            <Calculator className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                          </div>
                          <div>
                            <CardTitle className="text-xl dark:text-white">Parâmetros de Engenharia</CardTitle>
                            <CardDescription className="text-gray-600 dark:text-gray-400">
                              Configurações técnicas padrão para cálculos e orçamentos
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Grid de Parâmetros Principais */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* BDI Padrão */}
                          <FormField
                            control={form.control}
                            name="bdi_padrao"
                            render={({ field }) => (
                              <FormItem>
                                <div className="flex items-center gap-2 mb-2">
                                  <Percent className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                  <FormLabel className="text-sm font-medium dark:text-white">
                                    BDI Padrão (%)
                                  </FormLabel>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Info className="w-4 h-4 text-gray-400 hover:text-blue-500 cursor-help transition-colors" />
                                      </TooltipTrigger>
                                      <TooltipContent side="top" className="max-w-xs">
                                        <div className="space-y-2">
                                          <p className="font-semibold">BDI - Benefícios e Despesas Indiretas</p>
                                          <p className="text-xs">Inclui: impostos (ISS, PIS, COFINS), lucro, administração, riscos e despesas gerais.</p>
                                          <p className="text-xs font-medium">Recomendação SINAPI: 20% para obras públicas. Obras privadas: 15-30%.</p>
                                        </div>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    {...field}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                    className="h-11"
                                  />
                                </FormControl>
                                <FormDescription className="text-xs text-gray-500 dark:text-gray-400">
                                  Valor padrão: 20% (SINAPI)
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Encargos Sociais */}
                          <FormField
                            control={form.control}
                            name="encargos_sociais"
                            render={({ field }) => (
                              <FormItem>
                                <div className="flex items-center gap-2 mb-2">
                                  <Percent className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                  <FormLabel className="text-sm font-medium dark:text-white">
                                    Encargos Sociais (%)
                                  </FormLabel>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Info className="w-4 h-4 text-gray-400 hover:text-blue-500 cursor-help transition-colors" />
                                      </TooltipTrigger>
                                      <TooltipContent side="top" className="max-w-xs">
                                        <div className="space-y-2">
                                          <p className="font-semibold">Encargos Sociais sobre Mão de Obra</p>
                                          <p className="text-xs">Inclui: FGTS, INSS, 13º salário, férias, horas extras, adicional noturno, etc.</p>
                                          <p className="text-xs font-medium">Padrão mercado: 88% sobre o salário base. Pode variar conforme região e categoria profissional.</p>
                                        </div>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="0"
                                    max="200"
                                    step="0.1"
                                    {...field}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                    className="h-11"
                                  />
                                </FormControl>
                                <FormDescription className="text-xs text-gray-500 dark:text-gray-400">
                                  Valor padrão: 88% (mercado)
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Valor Hora Técnica */}
                          <FormField
                            control={form.control}
                            name="valor_hora_tecnica"
                            render={({ field }) => (
                              <FormItem>
                                <div className="flex items-center gap-2 mb-2">
                                  <DollarSign className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                  <FormLabel className="text-sm font-medium dark:text-white">
                                    Valor Hora Técnica (R$)
                                  </FormLabel>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Info className="w-4 h-4 text-gray-400 hover:text-blue-500 cursor-help transition-colors" />
                                      </TooltipTrigger>
                                      <TooltipContent side="top" className="max-w-xs">
                                        <div className="space-y-2">
                                          <p className="font-semibold">Custo da Hora Técnica</p>
                                          <p className="text-xs">Valor cobrado por hora de trabalho técnico do responsável (arquiteto/engenheiro).</p>
                                          <p className="text-xs font-medium">Usado em orçamentos de consultoria, projetos e laudos técnicos.</p>
                                        </div>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    {...field}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                    className="h-11"
                                  />
                                </FormControl>
                                <FormDescription className="text-xs text-gray-500 dark:text-gray-400">
                                  Valor padrão: R$ 150,00/hora
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Perda Padrão Materiais */}
                          <FormField
                            control={form.control}
                            name="perda_padrao_materiais"
                            render={({ field }) => (
                              <FormItem>
                                <div className="flex items-center gap-2 mb-2">
                                  <Package className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                  <FormLabel className="text-sm font-medium dark:text-white">
                                    Perda Padrão Materiais (%)
                                  </FormLabel>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Info className="w-4 h-4 text-gray-400 hover:text-blue-500 cursor-help transition-colors" />
                                      </TooltipTrigger>
                                      <TooltipContent side="top" className="max-w-xs">
                                        <div className="space-y-2">
                                          <p className="font-semibold">Margem de Segurança para Materiais</p>
                                          <p className="text-xs">Percentual adicional para cobrir perdas, desperdícios, cortes e ajustes durante a execução.</p>
                                          <p className="text-xs font-medium">Recomendação: 5% para materiais padronizados, 10% para materiais com muitos cortes.</p>
                                        </div>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="0"
                                    max="50"
                                    step="0.1"
                                    {...field}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                    className="h-11"
                                  />
                                </FormControl>
                                <FormDescription className="text-xs text-gray-500 dark:text-gray-400">
                                  Valor padrão: 5% (materiais padrão)
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Configurações Auxiliares */}
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Configurações Auxiliares</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                              control={form.control}
                              name="default_margin"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm font-medium dark:text-white">Margem Padrão (%)</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min="0"
                                      max="100"
                                      {...field}
                                      onChange={(e) => field.onChange(Number(e.target.value))}
                                      className="h-11"
                                    />
                                  </FormControl>
                                  <FormDescription className="text-xs text-gray-500 dark:text-gray-400">
                                    Margem de segurança geral para cálculos
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="decimal_places"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm font-medium dark:text-white">Casas Decimais</FormLabel>
                                  <Select onValueChange={(value) => field.onChange(Number(value))} value={String(field.value)}>
                                    <FormControl>
                                      <SelectTrigger className="h-11">
                                        <SelectValue />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="0">0</SelectItem>
                                      <SelectItem value="1">1</SelectItem>
                                      <SelectItem value="2">2</SelectItem>
                                      <SelectItem value="3">3</SelectItem>
                                      <SelectItem value="4">4</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormDescription className="text-xs text-gray-500 dark:text-gray-400">
                                    Precisão numérica dos resultados
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="mt-4">
                            <FormField
                              control={form.control}
                              name="auto_save_calculations"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                  <div className="space-y-0.5">
                                    <FormLabel className="text-base">Salvar automaticamente</FormLabel>
                                    <FormDescription className="text-sm text-muted-foreground">
                                      Salva os cálculos automaticamente no histórico
                                    </FormDescription>
                                  </div>
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        {/* Informação sobre uso */}
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                              <Info className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                              <div className="space-y-1">
                                <p className="text-sm font-medium text-orange-900 dark:text-orange-200">
                                  Uso dos Parâmetros
                                </p>
                                <p className="text-xs text-orange-700 dark:text-orange-300">
                                  Estes valores serão usados como padrão pelo CostCalculatorEngine ao criar novos orçamentos. Você pode alterá-los individualmente em cada cálculo quando necessário.
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Botão Restaurar Padrões */}
                          <div className="flex gap-3">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handleResetMarketDefaults}
                              disabled={isResetting}
                              className="flex-1 h-11 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-2"
                            >
                              {isResetting ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
                                  <span>Restaurando...</span>
                                </>
                              ) : (
                                <>
                                  <RotateCcw className="w-4 h-4" />
                                  <span>Restaurar Padrões de Mercado</span>
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="profile">
                    <Card className="shadow-sm border-0 bg-white dark:bg-gray-800 dark:border-gray-700">
                      <CardHeader className="pb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <CardTitle className="text-xl dark:text-white">Dados da Empresa</CardTitle>
                            <CardDescription className="text-gray-600 dark:text-gray-400">
                              Informações corporativas para relatórios e orçamentos
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Logo da Empresa */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 mb-2">
                            <ImageIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            <FormLabel className="text-sm font-medium dark:text-white">Logo da Empresa</FormLabel>
                          </div>
                          
                          <FormField
                            control={form.control}
                            name="logo_url"
                            render={({ field }) => (
                              <FormItem>
                                <div className="space-y-4">
                                  {field.value && (
                                    <div className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                      <img 
                                        src={field.value} 
                                        alt="Logo da empresa" 
                                        className="max-h-32 max-w-full object-contain"
                                        onError={(e) => {
                                          e.currentTarget.style.display = 'none';
                                        }}
                                      />
                                    </div>
                                  )}
                                  <FormControl>
                                    <div className="flex gap-2">
                                      <Input
                                        type="url"
                                        placeholder="https://exemplo.com/logo.png"
                                        {...field}
                                        className="flex-1"
                                      />
                                    </div>
                                  </FormControl>
                                  <FormDescription className="text-xs text-gray-500 dark:text-gray-400">
                                    Cole a URL de uma imagem pública do logo da sua empresa
                                  </FormDescription>
                                  <FormMessage />
                                </div>
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Registro Profissional */}
                          <FormField
                            control={form.control}
                            name="registro_profissional"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2 text-sm font-medium dark:text-white">
                                  <User className="w-4 h-4" />
                                  Registro Profissional
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Ex: CAU A12345-6 ou CREA 12345-D"
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription className="text-xs text-gray-500 dark:text-gray-400">
                                  CAU, CREA ou outro registro profissional
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Razão Social */}
                          <FormField
                            control={form.control}
                            name="razao_social"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2 text-sm font-medium dark:text-white">
                                  <Building2 className="w-4 h-4" />
                                  Razão Social
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Nome completo da empresa"
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription className="text-xs text-gray-500 dark:text-gray-400">
                                  Nome oficial para contratos e documentos
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Endereço Comercial */}
                        <FormField
                          control={form.control}
                          name="endereco_comercial"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2 text-sm font-medium dark:text-white">
                                <MapPin className="w-4 h-4" />
                                Endereço Comercial
                              </FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Rua, número, bairro, cidade - UF, CEP"
                                  rows={3}
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription className="text-xs text-gray-500 dark:text-gray-400">
                                Endereço completo para rodapé de orçamentos
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Telefone Comercial */}
                          <FormField
                            control={form.control}
                            name="telefone_comercial"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2 text-sm font-medium dark:text-white">
                                  <Phone className="w-4 h-4" />
                                  Telefone Comercial
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="tel"
                                    placeholder="(00) 00000-0000"
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription className="text-xs text-gray-500 dark:text-gray-400">
                                  Contato público para orçamentos
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Site/Portfolio */}
                          <FormField
                            control={form.control}
                            name="site_portfolio"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2 text-sm font-medium dark:text-white">
                                  <Globe className="w-4 h-4" />
                                  Site/Portfolio
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="url"
                                    placeholder="https://seusite.com.br"
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription className="text-xs text-gray-500 dark:text-gray-400">
                                  Link profissional ou portfólio
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                              <div className="space-y-1">
                                <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                                  Uso dos dados
                                </p>
                                <p className="text-xs text-blue-700 dark:text-blue-300">
                                  Estas informações serão usadas para preencher automaticamente o cabeçalho das calculadoras e orçamentos exportados.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex flex-col space-y-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="w-full pt-4">
                          <Button 
                            type="button" 
                            variant="destructive" 
                            onClick={clearData}
                            className="w-full"
                          >
                            Limpar todos os dados
                          </Button>
                          <p className="text-xs text-muted-foreground mt-2 text-center">
                            Esta ação remove todos os seus cálculos salvos
                          </p>
                        </div>
                      </CardFooter>
                    </Card>
                  </TabsContent>

                  <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
                    <Button 
                      type="submit" 
                      disabled={isSaving}
                      className="w-full lg:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Salvar configurações
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;
