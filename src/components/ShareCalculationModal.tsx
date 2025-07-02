import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Share2, Copy, Calendar, Eye, Link2, Clock } from 'lucide-react';
import { useSharingService } from '@/services/sharingService';

interface ShareCalculationModalProps {
  calculationId: string | null;
  calculationName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareCalculationModal: React.FC<ShareCalculationModalProps> = ({
  calculationId,
  calculationName,
  isOpen,
  onClose,
}) => {
  const [hasExpiration, setHasExpiration] = useState(false);
  const [expirationDays, setExpirationDays] = useState(7);
  const [shareUrl, setShareUrl] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const { shareCalculation } = useSharingService();

  const handleShare = async () => {
    if (!calculationId) return;

    setIsSharing(true);
    
    const expiresAt = hasExpiration 
      ? new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000).toISOString()
      : undefined;

    const result = await shareCalculation({
      calculation_id: calculationId,
      expires_at: expiresAt,
    });

    if (result.success && result.shareUrl) {
      setShareUrl(result.shareUrl);
    }

    setIsSharing(false);
  };

  const copyToClipboard = async () => {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl);
    }
  };

  const handleClose = () => {
    setShareUrl('');
    setHasExpiration(false);
    setExpirationDays(7);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Share2 className="w-5 h-5" />
            <span>Compartilhar Cálculo</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações do cálculo */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Link2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{calculationName || 'Cálculo sem nome'}</h4>
                  <p className="text-sm text-gray-500">Gerar link de compartilhamento</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {!shareUrl ? (
            <>
              {/* Configurações de expiração */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Link com expiração</Label>
                    <p className="text-xs text-gray-500">Definir quando o link expira</p>
                  </div>
                  <Switch
                    checked={hasExpiration}
                    onCheckedChange={setHasExpiration}
                  />
                </div>

                {hasExpiration && (
                  <div className="space-y-2">
                    <Label htmlFor="expiration" className="text-sm">
                      Expira em (dias)
                    </Label>
                    <Input
                      id="expiration"
                      type="number"
                      min="1"
                      max="365"
                      value={expirationDays}
                      onChange={(e) => setExpirationDays(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                )}
              </div>

              <Separator />

              {/* Ações */}
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleShare}
                  disabled={isSharing}
                  className="flex-1"
                >
                  {isSharing ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4 mr-2" />
                      Gerar Link
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Link gerado */}
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Eye className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Link criado com sucesso!</span>
                  </div>
                  <p className="text-xs text-green-700">
                    O link foi copiado automaticamente para sua área de transferência.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Link de compartilhamento</Label>
                  <div className="flex space-x-2">
                    <Input
                      value={shareUrl}
                      readOnly
                      className="flex-1 text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyToClipboard}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {hasExpiration && (
                  <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm text-yellow-800">
                        Este link expira em {expirationDays} dia{expirationDays > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Ações finais */}
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={copyToClipboard}
                  className="flex-1"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar Link
                </Button>
                <Button
                  onClick={handleClose}
                  className="flex-1"
                >
                  Fechar
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};