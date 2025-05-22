
import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: any) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up the auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Use setTimeout to avoid deadlocks when we need to fetch additional data
        if (session?.user) {
          setTimeout(() => {
            console.log('Auth state changed:', event);
          }, 0);
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        // Tratamento específico para o erro de email não confirmado
        if (error.message === 'Email not confirmed') {
          toast({
            title: "Email não confirmado",
            description: "Tentando confirmar seu email automaticamente...",
            variant: "default",
          });
          
          // Tentativa de login novamente após confirmar o email
          await autoConfirmEmail(email);
          return signIn(email, password);
        } else {
          toast({
            title: "Erro ao entrar",
            description: error.message,
            variant: "destructive",
          });
        }
        throw error;
      }
    } catch (error: any) {
      // Esse bloco já está tratado acima para o caso específico
      if (error.message !== 'Email not confirmed') {
        toast({
          title: "Erro ao entrar",
          description: error.message,
          variant: "destructive",
        });
      }
      throw error;
    }
  };

  // Nova função para confirmar o email automaticamente (apenas para desenvolvimento)
  const autoConfirmEmail = async (email: string) => {
    try {
      // Esta é uma função que só funciona se você tiver acesso administrativo ao Supabase
      // ou se estiver usando o serviço localmente para desenvolvimento
      const { error } = await supabase.auth.admin.updateUserById(
        email,
        { email_confirm: true }
      );

      if (error) {
        console.error("Erro ao confirmar email automaticamente:", error);
        toast({
          title: "Não foi possível confirmar o email automaticamente",
          description: "Por favor, confirme o email na sua caixa de entrada ou desabilite a verificação de email no painel do Supabase.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Email confirmado automaticamente",
          description: "Você pode fazer login agora.",
        });
      }
    } catch (error: any) {
      console.error("Erro ao confirmar email:", error);
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });
      if (error) throw error;
      
      toast({
        title: "Cadastro realizado",
        description: "Tentando confirmar seu email automaticamente...",
      });
      
      // Tenta confirmar o email automaticamente após o cadastro
      if (data.user) {
        await autoConfirmEmail(email);
      }
    } catch (error: any) {
      toast({
        title: "Erro ao cadastrar",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Erro ao sair",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
