import { AlertCircle, CheckCircle2, X } from 'lucide-react';
export default function Notice({ message, kind = 'error', onClose }) {
  if (!message) return null;
  return <div className={`notice ${kind === 'success' ? 'notice-success' : 'notice-error'}`} role="alert">
    {kind === 'success' ? <CheckCircle2 size={18}/> : <AlertCircle size={18}/>}
    <span>{message}</span>{onClose && <button className="icon-button" onClick={onClose} aria-label="Fechar"><X size={16}/></button>}
  </div>;
}
