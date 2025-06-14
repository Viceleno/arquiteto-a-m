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
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Database, 
  Palette,
  Globe,
  Ruler,
  Calculator,
  Save,
  Trash2,
  Check,
  AlertCircle,
  Info
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '@/hooks/useSettings';

const settingsSchema = z.object({
  // Preferências gerais
  theme: z.enum(['light', 'dark', 'system']),
  language: z.enum(['pt-BR', 'en-US', 'es']),
  unit_preference: z.enum(['metric', 'imperial']),
  
  // Configurações de cálculo
  default_margin: z.number().min(0).max(100),
  auto_save_calculations: z.boolean(),
  decimal_places: z.number().min(0).max(6),
  
  // Notificações
  email_notifications: z.boolean(),
  push_notifications: z.boolean(),
  calculation_reminders: z.boolean(),
  
  // Privacidade
  share_calculations: z.boolean(),
  data_analytics: z.boolean(),
  
  // Perfil
  display_name: z.string().max(100),
  bio: z.string().max(500),
  company: z.string().max(100),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

const Settings = () => {
  const { user, loading: authLoading } = useAuth();
  const { settings, loading: settingsLoading, updateSettings } = useSettings();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      theme: 'light',
      language: 'pt-BR',
      unit_preference: 'metric',
      default_margin: 10,
      auto_save_calculations: true,
      decimal_places: 2,
      email_notifications: true,
      push_notifications: false,
      calculation_reminders: true,
      share_calculations: false,
      data_analytics: true,
      display_name: '',
      bio: '',
      company: '',
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
          form.setValue('display_name', profileData.full_name || '');
          form.setValue('bio', profileData.bio || '');
          form.setValue('company', profileData.company || '');
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
      form.setValue('language', settings.language);
      form.setValue('unit_preference', settings.unit_preference);
      form.setValue('default_margin', settings.default_margin);
      form.setValue('auto_save_calculations', settings.auto_save_calculations);
      form.setValue('decimal_places', settings.decimal_places);
      form.setValue('email_notifications', settings.email_notifications);
      form.setValue('push_notifications', settings.push_notifications);
      form.setValue('calculation_reminders', settings.calculation_reminders);
      form.setValue('share_calculations', settings.share_calculations);
      form.setValue('data_analytics', settings.data_analytics);
    }
  }, [settings, form]);

  const onSubmit = async (values: SettingsFormValues) => {
    if (!user || isSaving) return;
    
    setIsSaving(true);
    
    try {
      // Atualizar configurações usando o hook
      await updateSettings({
        theme: values.theme,
        language: values.language,
        unit_preference: values.unit_preference,
        default_margin: values.default_margin,
        auto_save_calculations: values.auto_save_calculations,
        decimal_places: values.decimal_places,
        email_notifications: values.email_notifications,
        push_notifications: values.push_notifications,
        calculation_reminders: values.calculation_reminders,
        share_calculations: values.share_calculations,
        data_analytics: values.data_analytics,
      });

      // Atualizar perfil
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: values.display_name,
          bio: values.bio,
          company: values.company,
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

  if (authLoading || (user && (isLoading || settingsLoading))) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="text-gray-600 animate-pulse">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 lg:p-6">
          <div className="max-w-5xl mx-auto">
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <SettingsIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
                  <p className="text-gray-600 mt-1">
                    Personalize a aplicação de acordo com suas preferências
                  </p>
                </div>
              </div>
            </div>
            
            <Tabs defaultValue="general" className="space-y-8">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-auto p-1 bg-white shadow-sm border">
                <TabsTrigger value="general" className="flex items-center gap-2 px-4 py-3 text-sm font-medium data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                  <Palette className="w-4 h-4" />
                  <span className="hidden sm:inline">Geral</span>
                </TabsTrigger>
                <TabsTrigger value="calculations" className="flex items-center gap-2 px-4 py-3 text-sm font-medium data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                  <Calculator className="w-4 h-4" />
                  <span className="hidden sm:inline">Cálculos</span>
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center gap-2 px-4 py-3 text-sm font-medium data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                  <Bell className="w-4 h-4" />
                  <span className="hidden sm:inline">Notificações</span>
                </TabsTrigger>
                <TabsTrigger value="privacy" className="flex items-center gap-2 px-4 py-3 text-sm font-medium data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                  <Shield className="w-4 h-4" />
                  <span className="hidden sm:inline">Privacidade</span>
                </TabsTrigger>
                <TabsTrigger value="profile" className="flex items-center gap-2 px-4 py-3 text-sm font-medium data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Perfil</span>
                </TabsTrigger>
              </TabsList>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  
                  <TabsContent value="general" className="space-y-6">
                    <Card className="shadow-sm border-0 bg-white">
                      <CardHeader className="pb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <Palette className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <CardTitle className="text-xl">Preferências Gerais</CardTitle>
                            <CardDescription className="text-gray-600">
                              Configure a aparência e idioma da aplicação
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="theme"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2 text-sm font-medium">
                                  <Palette className="w-4 h-4" />
                                  Tema
                                </FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="h-11">
                                      <SelectValue placeholder="Selecione um tema" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="light">🌞 Claro</SelectItem>
                                    <SelectItem value="dark">🌙 Escuro</SelectItem>
                                    <SelectItem value="system">💻 Sistema</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormDescription className="text-xs text-gray-500">
                                  Escolha entre tema claro, escuro ou automático
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="language"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2 text-sm font-medium">
                                  <Globe className="w-4 h-4" />
                                  Idioma
                                </FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="h-11">
                                      <SelectValue placeholder="Selecione um idioma" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="pt-BR">🇧🇷 Português (Brasil)</SelectItem>
                                    <SelectItem value="en-US">🇺🇸 English (US)</SelectItem>
                                    <SelectItem value="es">🇪🇸 Español</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormDescription className="text-xs text-gray-500">
                                  Idioma da interface da aplicação
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="unit_preference"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2 text-sm font-medium">
                                <Ruler className="w-4 h-4" />
                                Sistema de unidades
                              </FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-11">
                                    <SelectValue placeholder="Selecione um sistema" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="metric">📏 Métrico (m, m², m³)</SelectItem>
                                  <SelectItem value="imperial">📐 Imperial (ft, ft², ft³)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription className="text-xs text-gray-500">
                                Sistema de medidas usado nos cálculos
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-2 mb-2">
                            <Info className="w-4 h-4 text-blue-500" />
                            <span className="text-sm font-medium text-gray-700">Status das configurações</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                              <Check className="w-4 h-4 text-green-600" />
                              <span className="text-green-700">Tema: {settings?.theme || 'Carregando...'}</span>
                            </div>
                            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                              <Check className="w-4 h-4 text-blue-600" />
                              <span className="text-blue-700">Idioma: {settings?.language || 'Carregando...'}</span>
                            </div>
                            <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
                              <Check className="w-4 h-4 text-purple-600" />
                              <span className="text-purple-700">Unidades: {settings?.unit_preference || 'Carregando...'}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="calculations">
                    <Card>
                      <CardHeader>
                        <CardTitle>Configurações de Cálculo</CardTitle>
                        <CardDescription>
                          Defina preferências para os cálculos e resultados
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="default_margin"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Margem padrão (%)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="decimal_places"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Casas decimais</FormLabel>
                              <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={String(field.value)}>
                                <FormControl>
                                  <SelectTrigger>
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
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="auto_save_calculations"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Salvar automaticamente</FormLabel>
                                <FormLabel className="text-sm text-muted-foreground font-normal">
                                  Salva os cálculos automaticamente no histórico
                                </FormLabel>
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
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="notifications">
                    <Card>
                      <CardHeader>
                        <CardTitle>Notificações</CardTitle>
                        <CardDescription>
                          Configure como deseja receber notificações
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="email_notifications"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Notificações por email</FormLabel>
                                <FormLabel className="text-sm text-muted-foreground font-normal">
                                  Receba atualizações importantes por email
                                </FormLabel>
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

                        <FormField
                          control={form.control}
                          name="push_notifications"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Notificações push</FormLabel>
                                <FormLabel className="text-sm text-muted-foreground font-normal">
                                  Receba notificações no navegador
                                </FormLabel>
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

                        <FormField
                          control={form.control}
                          name="calculation_reminders"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Lembrete de cálculos</FormLabel>
                                <FormLabel className="text-sm text-muted-foreground font-normal">
                                  Receba lembretes sobre cálculos pendentes
                                </FormLabel>
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
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="privacy">
                    <Card>
                      <CardHeader>
                        <CardTitle>Privacidade e Dados</CardTitle>
                        <CardDescription>
                          Controle como seus dados são utilizados
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="share_calculations"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Compartilhar cálculos</FormLabel>
                                <FormLabel className="text-sm text-muted-foreground font-normal">
                                  Permite compartilhar cálculos com outros usuários
                                </FormLabel>
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

                        <FormField
                          control={form.control}
                          name="data_analytics"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Análise de dados</FormLabel>
                                <FormLabel className="text-sm text-muted-foreground font-normal">
                                  Permite análise anônima para melhorar o serviço
                                </FormLabel>
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

                        <div className="pt-4 border-t">
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
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="profile">
                    <Card>
                      <CardHeader>
                        <CardTitle>Informações do Perfil</CardTitle>
                        <CardDescription>
                          Gerencie suas informações pessoais
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="display_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome de exibição</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="company"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Empresa</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="bio"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Biografia</FormLabel>
                              <FormControl>
                                <Textarea 
                                  {...field} 
                                  rows={4}
                                  placeholder="Conte um pouco sobre você..."
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <div className="flex justify-end pt-6 border-t border-gray-200">
                    <Button 
                      type="submit" 
                      disabled={isSaving}
                      className="w-full lg:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
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
