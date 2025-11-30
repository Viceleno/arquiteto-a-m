import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, LogIn, UserPlus, Calculator, ArrowRight, CheckCircle } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-blue-50/50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto min-h-[calc(100vh-4rem)]">
          
          {/* Seção Principal - Hero */}
          <div className="flex flex-col justify-center text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start mb-8">
              <div className="w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                <Calculator className="w-7 h-7 text-white" />
              </div>
              <div className="ml-4">
                <h1 className="text-3xl font-bold text-gray-900">ArqCalc</h1>
              </div>
            </div>
            
            <h2 className="text-2xl lg:text-3xl font-semibold text-gray-900 mb-4 leading-tight">
              Suíte de Cálculos para Arquitetura
            </h2>
            <p className="text-base text-gray-600 max-w-lg">
              Acesse suas ferramentas de cálculo de área, materiais e custos em um único lugar.
            </p>
          </div>

          {/* Seção de Login/Cadastro */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-md">
              {/* Formulário de Login/Cadastro */}
              <Card className="shadow-lg border border-gray-200 bg-white">
                <CardHeader className="text-center space-y-2">
                  <CardTitle className="text-2xl font-bold">Acesse sua conta</CardTitle>
                  <CardDescription>
                    Entre ou crie sua conta para começar
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
                          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium" disabled={isSubmitting}>
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
                          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium" disabled={isSubmitting}>
                            {isSubmitting ? "Cadastrando..." : (
                              <>
                                <UserPlus className="mr-2 h-4 w-4" />
                                Criar Conta
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </>
                            )}
                          </Button>
                        </form>
                      </Form>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
