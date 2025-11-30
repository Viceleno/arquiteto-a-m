import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, FolderOpen } from 'lucide-react';
import { CalculationData, useCalculationService } from '@/services/calculationService';

interface Project {
  id: string;
  name: string;
  client_name: string | null;
  status: 'active' | 'completed' | 'archived';
}

interface SaveCalculationModalProps {
  isOpen: boolean;
  onClose: () => void;
  calculationData: CalculationData;
  onSaveSuccess?: () => void;
}

export const SaveCalculationModal: React.FC<SaveCalculationModalProps> = ({
  isOpen,
  onClose,
  calculationData,
  onSaveSuccess,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { saveCalculation } = useCalculationService();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [projectOption, setProjectOption] = useState<'none' | 'existing' | 'new'>('none');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [newProject, setNewProject] = useState({
    name: '',
    client_name: '',
    address: '',
    status: 'active' as 'active' | 'completed' | 'archived',
  });
  const [calculationName, setCalculationName] = useState(calculationData.name || '');

  useEffect(() => {
    if (isOpen && user) {
      fetchProjects();
      // Resetar estado quando modal abrir
      setProjectOption('none');
      setSelectedProjectId('');
      setNewProject({ name: '', client_name: '', address: '', status: 'active' });
      setCalculationName(calculationData.name || '');
    }
  }, [isOpen, user]);

  const fetchProjects = async () => {
    if (!user) return;

    try {
      setIsLoadingProjects(true);
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, client_name, status')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar projetos:', error);
      toast({
        title: 'Erro ao carregar projetos',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast({
        title: 'Login necessário',
        description: 'Faça login para salvar seu cálculo',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSaving(true);

      let projectId: string | null = null;

      // Criar novo projeto se necessário
      if (projectOption === 'new') {
        if (!newProject.name.trim()) {
          toast({
            title: 'Nome obrigatório',
            description: 'Por favor, informe o nome do projeto.',
            variant: 'destructive',
          });
          setIsSaving(false);
          return;
        }

        const { data: newProjectData, error: projectError } = await supabase
          .from('projects')
          .insert({
            user_id: user.id,
            name: newProject.name.trim(),
            client_name: newProject.client_name.trim() || null,
            address: newProject.address.trim() || null,
            status: newProject.status,
          })
          .select()
          .single();

        if (projectError) throw projectError;
        projectId = newProjectData.id;
      } else if (projectOption === 'existing') {
        projectId = selectedProjectId || null;
      }

      // Salvar cálculo
      const success = await saveCalculation({
        ...calculationData,
        name: calculationName.trim() || calculationData.name,
        project_id: projectId,
      });

      if (!success) {
        throw new Error('Falha ao salvar cálculo');
      }

      // Toast já é exibido pelo hook useCalculationService
      // Mas podemos adicionar uma mensagem adicional se necessário

      onSaveSuccess?.();
      onClose();

      // Se criou um novo projeto, redirecionar para ele
      if (projectOption === 'new' && projectId) {
        setTimeout(() => {
          navigate(`/projects/${projectId}`);
        }, 500);
      }
    } catch (error: any) {
      console.error('Erro ao salvar cálculo:', error);
      toast({
        title: 'Erro ao salvar',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Salvar Cálculo</DialogTitle>
          <DialogDescription>
            Dê um nome ao seu cálculo e opcionalmente vincule a um projeto.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Nome do cálculo */}
          <div className="space-y-2">
            <Label htmlFor="calculation-name">Nome do Cálculo *</Label>
            <Input
              id="calculation-name"
              placeholder="Ex: Cálculo de Área - Sala Principal"
              value={calculationName}
              onChange={(e) => setCalculationName(e.target.value)}
            />
          </div>

          {/* Opções de projeto */}
          <div className="space-y-3">
            <Label>Vincular a um Projeto (Opcional)</Label>
            <RadioGroup
              value={projectOption}
              onValueChange={(value) => setProjectOption(value as 'none' | 'existing' | 'new')}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="none" id="none" />
                <Label htmlFor="none" className="cursor-pointer">
                  Não vincular a projeto
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <RadioGroupItem value="existing" id="existing" />
                <Label htmlFor="existing" className="cursor-pointer">
                  Vincular a projeto existente
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <RadioGroupItem value="new" id="new" />
                <Label htmlFor="new" className="cursor-pointer">
                  Criar novo projeto
                </Label>
              </div>
            </RadioGroup>

            {/* Seleção de projeto existente */}
            {projectOption === 'existing' && (
              <div className="ml-6 space-y-2 border-l-2 border-blue-200 pl-4 pt-2">
                {isLoadingProjects ? (
                  <p className="text-sm text-gray-500">Carregando projetos...</p>
                ) : projects.length === 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">
                      Nenhum projeto ativo encontrado.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onClose();
                        navigate('/projects');
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Projeto
                    </Button>
                  </div>
                ) : (
                  <Select
                    value={selectedProjectId}
                    onValueChange={setSelectedProjectId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um projeto" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          <div className="flex items-center space-x-2">
                            <FolderOpen className="w-4 h-4" />
                            <span>{project.name}</span>
                            {project.client_name && (
                              <span className="text-gray-500 text-sm">
                                - {project.client_name}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}

            {/* Formulário de novo projeto */}
            {projectOption === 'new' && (
              <div className="ml-6 space-y-4 border-l-2 border-blue-200 pl-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="project-name">Nome do Projeto *</Label>
                  <Input
                    id="project-name"
                    placeholder="Ex: Casa Residencial - Jardim das Flores"
                    value={newProject.name}
                    onChange={(e) =>
                      setNewProject({ ...newProject, name: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client-name">Cliente</Label>
                  <Input
                    id="client-name"
                    placeholder="Nome do cliente"
                    value={newProject.client_name}
                    onChange={(e) =>
                      setNewProject({ ...newProject, client_name: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    placeholder="Endereço do projeto"
                    value={newProject.address}
                    onChange={(e) =>
                      setNewProject({ ...newProject, address: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={newProject.status}
                    onValueChange={(value: 'active' | 'completed' | 'archived') =>
                      setNewProject({ ...newProject, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="completed">Concluído</SelectItem>
                      <SelectItem value="archived">Arquivado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !calculationName.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSaving ? 'Salvando...' : 'Salvar Cálculo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

