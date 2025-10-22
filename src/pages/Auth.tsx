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
import { AlertCircle, LogIn, UserPlus, Calculator, ArrowRight, Sparkles, Clock, Shield, Zap, CheckCircle, Play } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DemoCalculator } from '@/components/DemoCalculator';
import { SocialProof } from '@/components/SocialProof';

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

  const benefits = [
    { icon: Clock, text: "Economize 2-3 horas por projeto" },
    { icon: Shield, text: "Baseado em normas técnicas ABNT" },
    { icon: Zap, text: "Cálculos instantâneos e precisos" },
    { icon: CheckCircle, text: "Histórico automático de todos os cálculos" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12 items-start max-w-7xl mx-auto">
          
          {/* Seção Principal - Hero + Demo */}
          <div className="space-y-8">
            {/* Hero Section */}
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
              
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                Calcule projetos arquitetônicos
                <span className="text-blue-600 block">10x mais rápido</span>
              </h2>
              <p className="text-lg text-gray-600 mb-6 max-w-xl">
                A plataforma mais completa para cálculos precisos em arquitetura e construção. 
                <strong> Usado por 500+ profissionais</strong> que economizam horas todos os dias.
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
                  <Sparkles className="w-3 h-3 mr-1" />
                  Interface Profissional
                </Badge>
              </div>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3 bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-sm">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{benefit.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Demo Calculator */}
            <div className="lg:hidden">
              <DemoCalculator />
            </div>

            {/* Social Proof */}
            <div className="hidden lg:block">
              <SocialProof />
            </div>
          </div>

          {/* Seção de Login/Cadastro */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-md space-y-6">
              {/* Demo Calculator para Desktop */}
              <div className="hidden lg:block">
                <DemoCalculator />
              </div>

              {/* Formulário de Login/Cadastro */}
              <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
                <CardHeader className="text-center space-y-2">
                  <CardTitle className="text-2xl font-bold">Acesse sua conta</CardTitle>
                  <CardDescription>
                    Entre ou crie sua conta para começar a usar todas as calculadoras profissionais
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
                            Cadastro realizado com sucesso! Faça login para acessar sua conta.
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
                          <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold" disabled={isSubmitting}>
                            {isSubmitting ? "Entrando..." : (
                              <>
                                <LogIn className="mr-2 h-4 w-4" />
                                Entrar
                                <ArrowRight className="ml-2 h-4 w-4" />
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
                          <div className="grid grid-cols-2 gap-3">
                            <FormField
                              control={registerForm.control}
                              name="username"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Usuário</FormLabel>
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
                                  <FormLabel>Nome</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="Nome Completo" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
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
                          <div className="grid grid-cols-2 gap-3">
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
                                  <FormLabel>Confirmar</FormLabel>
                                  <FormControl>
                                    <Input {...field} type="password" placeholder="********" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <Button type="submit" className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-semibold" disabled={isSubmitting}>
                            {isSubmitting ? "Cadastrando..." : (
                              <>
                                <UserPlus className="mr-2 h-4 w-4" />
                                Criar Conta Gratuita
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </>
                            )}
                          </Button>
                        </form>
                      </Form>
                    </TabsContent>
                  </Tabs>
                </CardContent>
                <CardFooter className="flex flex-col items-center space-y-4 text-center">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span>Plataforma segura e profissional</span>
                  </div>
                  <Alert className="bg-blue-50 border-blue-200">
                    <Play className="h-4 w-4" />
                    <AlertDescription className="text-blue-800 text-xs">
                      <strong>Teste grátis!</strong> Experimente a calculadora acima e veja a diferença.
                    </AlertDescription>
                  </Alert>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
