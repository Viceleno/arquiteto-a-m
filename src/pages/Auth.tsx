import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, LogIn, UserPlus, Calculator, Ruler, Building, TrendingUp, CheckCircle, Users, Shield, Zap, BookOpen } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Login Form Schema
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
});

// Register Form Schema
const registerSchema = z.object({
  username: z.string().min(3, 'Nome de usuário deve ter no mínimo 3 caracteres'),
  full_name: z.string().min(3, 'Nome completo deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não conferem",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

const Auth = () => {
  const { user, signIn, signUp, loading } = useAuth();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      full_name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onLoginSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    setLoginError(null);
    try {
      await signIn(data.email, data.password);
    } catch (error: any) {
      console.error('Erro no formulário de login:', error);
      setLoginError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onRegisterSubmit = async (data: RegisterFormValues) => {
    setIsSubmitting(true);
    setRegisterError(null);
    setRegisterSuccess(false);
    try {
      const { username, full_name, email, password } = data;
      await signUp(email, password, { username, full_name });
      setRegisterSuccess(true);
      setTab("login");
      registerForm.reset();
      // Preenche o email no formulário de login
      loginForm.setValue("email", email);
    } catch (error: any) {
      console.error('Erro no formulário de cadastro:', error);
      setRegisterError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Redirect if user is logged in
  if (user && !loading) {
    return <Navigate to="/" replace />;
  }

  const features = [
    {
      icon: Calculator,
      title: "Cálculos Precisos",
      description: "Ferramentas profissionais para cálculos arquitetônicos baseados em normas técnicas brasileiras (ABNT)"
    },
    {
      icon: Building,
      title: "Múltiplas Categorias",
      description: "Calculadoras para áreas, materiais, custos, estruturas e muito mais"
    },
    {
      icon: TrendingUp,
      title: "Histórico Completo",
      description: "Salve e organize todos os seus cálculos com exportação em diferentes formatos"
    },
    {
      icon: Users,
      title: "Feito para Profissionais",
      description: "Desenvolvido por e para arquitetos, engenheiros e profissionais da construção"
    }
  ];

  const benefits = [
    "✓ Cálculos instantâneos com precisão profissional",
    "✓ Interface intuitiva e responsiva",
    "✓ Histórico de cálculos salvo automaticamente",
    "✓ Exportação em múltiplos formatos",
    "✓ Baseado em normas técnicas brasileiras",
    "✓ Sempre atualizado com as últimas práticas"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 items-center max-w-6xl mx-auto">
          
          {/* Seção Informativa */}
          <div className="space-y-8">
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <Calculator className="w-8 h-8 text-white" />
                </div>
                <div className="ml-4">
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">ArqCalc</h1>
                  <p className="text-gray-600">Calculadora Profissional de Arquitetura</p>
                </div>
              </div>
              
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                Transforme seus cálculos arquitetônicos
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                A plataforma mais completa para cálculos precisos em arquitetura e construção. 
                Desenvolvida com base nas normas técnicas brasileiras para garantir resultados confiáveis.
              </p>
              
              <div className="flex flex-wrap gap-2 justify-center lg:justify-start mb-8">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  <Shield className="w-3 h-3 mr-1" />
                  Normas ABNT
                </Badge>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Zap className="w-3 h-3 mr-1" />
                  Resultados Instantâneos
                </Badge>
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  <BookOpen className="w-3 h-3 mr-1" />
                  Interface Profissional
                </Badge>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Benefits List */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                Por que escolher o ArqCalc?
              </h3>
              <div className="grid sm:grid-cols-2 gap-2">
                {benefits.map((benefit, index) => (
                  <p key={index} className="text-sm text-gray-700">{benefit}</p>
                ))}
              </div>
            </div>
          </div>

          {/* Seção de Login/Cadastro */}
          <div className="flex justify-center">
            <Card className="w-full max-w-md shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="text-center space-y-2">
                <CardTitle className="text-2xl font-bold">Acesse sua conta</CardTitle>
                <CardDescription>
                  Entre ou crie sua conta para começar a usar as calculadoras profissionais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue={tab} value={tab} onValueChange={(v) => setTab(v as "login" | "register")}>
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="login" className="flex items-center">
                      <LogIn className="w-4 h-4 mr-2" />
                      Entrar
                    </TabsTrigger>
                    <TabsTrigger value="register" className="flex items-center">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Cadastrar
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="login">
                    {loginError && (
                      <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{loginError}</AlertDescription>
                      </Alert>
                    )}
                    {registerSuccess && (
                      <Alert className="mb-4 bg-green-50 border-green-200">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                          Cadastro realizado com sucesso! Se a confirmação de email estiver habilitada, verifique sua caixa de entrada antes de fazer login.
                        </AlertDescription>
                      </Alert>
                    )}
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4 pt-4">
                        <FormField
                          control={loginForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input {...field} type="email" placeholder="seu@email.com" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={loginForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Senha</FormLabel>
                              <FormControl>
                                <Input {...field} type="password" placeholder="********" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                          {isSubmitting ? "Entrando..." : (
                            <>
                              <LogIn className="mr-2 h-4 w-4" />
                              Entrar
                            </>
                          )}
                        </Button>
                      </form>
                    </Form>
                  </TabsContent>
                  <TabsContent value="register">
                    {registerError && (
                      <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{registerError}</AlertDescription>
                      </Alert>
                    )}
                    <Form {...registerForm}>
                      <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4 pt-4">
                        <FormField
                          control={registerForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome de usuário</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="seunome" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="full_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome completo</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Seu Nome Completo" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input {...field} type="email" placeholder="seu@email.com" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Senha</FormLabel>
                              <FormControl>
                                <Input {...field} type="password" placeholder="********" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirmar senha</FormLabel>
                              <FormControl>
                                <Input {...field} type="password" placeholder="********" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                          {isSubmitting ? "Cadastrando..." : (
                            <>
                              <UserPlus className="mr-2 h-4 w-4" />
                              Cadastrar
                            </>
                          )}
                        </Button>
                      </form>
                    </Form>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="flex flex-col items-center space-y-4 text-center">
                <p className="text-sm text-gray-500">
                  Plataforma segura e profissional para arquitetos
                </p>
                <Alert className="bg-blue-50 border-blue-200">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-blue-800 text-xs">
                    <strong>Primeira vez aqui?</strong> Crie uma conta gratuita para acessar todas as calculadoras e salvar seu histórico de cálculos.
                  </AlertDescription>
                </Alert>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
