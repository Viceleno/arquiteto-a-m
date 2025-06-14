import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { useToast } from '@/hooks/use-toast';
import { Settings as SettingsIcon, User, Bell, Shield, Database, Palette } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

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
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

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
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Load user settings and profile
  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;
      
      try {
        // Carregar configurações
        const { data: settingsData, error: settingsError } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', user.id)
          .single();

        // Carregar perfil
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (settingsError && settingsError.code !== 'PGRST116') {
          throw settingsError;
        }

        if (settingsData || profileData) {
          // Safe type casting with validation
          const theme = settingsData?.theme && ['light', 'dark', 'system'].includes(settingsData.theme) 
            ? settingsData.theme as 'light' | 'dark' | 'system' 
            : 'light';
          const language = settingsData?.language && ['pt-BR', 'en-US', 'es'].includes(settingsData.language) 
            ? settingsData.language as 'pt-BR' | 'en-US' | 'es' 
            : 'pt-BR';
          const unit_preference = settingsData?.unit_preference && ['metric', 'imperial'].includes(settingsData.unit_preference) 
            ? settingsData.unit_preference as 'metric' | 'imperial' 
            : 'metric';

          form.reset({
            theme,
            language,
            unit_preference,
            default_margin: settingsData?.default_margin || 10,
            auto_save_calculations: settingsData?.auto_save_calculations ?? true,
            decimal_places: settingsData?.decimal_places || 2,
            email_notifications: settingsData?.email_notifications ?? true,
            push_notifications: settingsData?.push_notifications ?? false,
            calculation_reminders: settingsData?.calculation_reminders ?? true,
            share_calculations: settingsData?.share_calculations ?? false,
            data_analytics: settingsData?.data_analytics ?? true,
            display_name: profileData?.full_name || '',
            bio: profileData?.bio || '',
            company: profileData?.company || '',
          });
        }
      } catch (error: any) {
        toast({
          title: 'Erro ao carregar configurações',
          description: error.message,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadSettings();
    }
  }, [user, form, toast]);

  const onSubmit = async (values: SettingsFormValues) => {
    if (!user) return;
    
    try {
      // Atualizar configurações
      const { error: settingsError } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
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
          updated_at: new Date().toISOString(),
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

      if (settingsError) throw settingsError;
      if (profileError) throw profileError;

      // Aplicar configurações de tema
      if (values.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (values.theme === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        // System theme
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }

      toast({
        title: 'Configurações salvas',
        description: 'Suas preferências foram atualizadas com sucesso.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar configurações',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const clearData = async () => {
    if (!user) return;
    
    if (!window.confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      await supabase
        .from('calculations')
        .delete()
        .eq('user_id', user.id);

      toast({
        title: 'Dados limpos',
        description: 'Todos os seus cálculos foram removidos.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao limpar dados',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (loading || (user && isLoading)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 lg:p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6 lg:mb-8">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-2 mb-2">
                <SettingsIcon />
                <span>Configurações</span>
              </h1>
              <p className="text-gray-600 text-sm lg:text-base">
                Personalize a aplicação de acordo com suas preferências
              </p>
            </div>
            
            <Tabs defaultValue="general" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-auto p-1">
                <TabsTrigger value="general" className="flex items-center gap-2 text-xs lg:text-sm">
                  <Palette className="w-4 h-4" />
                  <span className="hidden sm:inline">Geral</span>
                </TabsTrigger>
                <TabsTrigger value="calculations" className="flex items-center gap-2 text-xs lg:text-sm">
                  <Database className="w-4 h-4" />
                  <span className="hidden sm:inline">Cálculos</span>
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center gap-2 text-xs lg:text-sm">
                  <Bell className="w-4 h-4" />
                  <span className="hidden sm:inline">Notificações</span>
                </TabsTrigger>
                <TabsTrigger value="privacy" className="flex items-center gap-2 text-xs lg:text-sm">
                  <Shield className="w-4 h-4" />
                  <span className="hidden sm:inline">Privacidade</span>
                </TabsTrigger>
                <TabsTrigger value="profile" className="flex items-center gap-2 text-xs lg:text-sm">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Perfil</span>
                </TabsTrigger>
              </TabsList>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  
                  <TabsContent value="general">
                    <Card>
                      <CardHeader>
                        <CardTitle>Preferências Gerais</CardTitle>
                        <CardDescription>
                          Configure a aparência e idioma da aplicação
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="theme"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tema</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione um tema" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="light">Claro</SelectItem>
                                  <SelectItem value="dark">Escuro</SelectItem>
                                  <SelectItem value="system">Sistema</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="language"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Idioma</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione um idioma" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                                  <SelectItem value="en-US">English (US)</SelectItem>
                                  <SelectItem value="es">Español</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="unit_preference"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Sistema de unidades</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione um sistema" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="metric">Métrico (m, m², m³)</SelectItem>
                                  <SelectItem value="imperial">Imperial (ft, ft², ft³)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
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

                  <div className="flex justify-end pt-6">
                    <Button type="submit" className="w-full lg:w-auto">
                      Salvar configurações
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
