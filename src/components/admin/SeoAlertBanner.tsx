import { Link } from 'react-router-dom';
import { AlertTriangle, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useSeoAlerts } from '@/hooks/useSeoAlerts';

/**
 * Banner exibido no topo do /admin sempre que houver alertas de SEO ainda não
 * reconhecidos (ex.: termo legado detectado, falha no ping diário do sitemap).
 * Clicar no botão envia o admin para /admin/seo na aba de alertas.
 */
export default function SeoAlertBanner() {
  const { alerts, acknowledge, acknowledgeAll } = useSeoAlerts();
  if (alerts.length === 0) return null;

  const top = alerts[0];
  const variant = top.severity === 'critical' ? 'destructive' : 'default';

  return (
    <Alert variant={variant} className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="flex items-center justify-between gap-2">
        <span>
          {alerts.length} alerta(s) de SEO pendente(s)
        </span>
        <div className="flex items-center gap-2">
          <Button
            asChild
            size="sm"
            variant="outline"
            className="h-7"
          >
            <Link to="/admin/seo?tab=alerts">
              Ver detalhes <ChevronRight className="h-3 w-3 ml-1" />
            </Link>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7"
            onClick={() => void acknowledgeAll()}
          >
            <X className="h-3 w-3 mr-1" /> Ignorar todos
          </Button>
        </div>
      </AlertTitle>
      <AlertDescription className="mt-2">
        <strong>{top.alert_type}:</strong> {top.message}
        {alerts.length > 1 && (
          <span className="ml-2 opacity-70">(+{alerts.length - 1} mais)</span>
        )}
        <button
          onClick={() => void acknowledge(top.id)}
          className="ml-2 underline text-xs opacity-80 hover:opacity-100"
        >
          marcar este como visto
        </button>
      </AlertDescription>
    </Alert>
  );
}
