import { FormEvent, useState } from 'react';
import { User } from '../lib/auth';

interface AuthProps {
  currentUser: User | null;
  onSignUp: (input: { email: string; password: string; displayName: string }) => void;
  onSignIn: (input: { email: string; password: string }) => void;
  onSignOut: () => void;
  canImportLegacy: boolean;
  onImportLegacy: () => void;
}

export function Auth({ currentUser, onSignUp, onSignIn, onSignOut, canImportLegacy, onImportLegacy }: AuthProps) {
  const [signUpData, setSignUpData] = useState({ email: '', password: '', displayName: '' });
  const [signInData, setSignInData] = useState({ email: '', password: '' });

  function submitSignUp(e: FormEvent) {
    e.preventDefault();
    onSignUp(signUpData);
  }

  function submitSignIn(e: FormEvent) {
    e.preventDefault();
    onSignIn(signInData);
  }

  if (!currentUser) {
    return (
      <div className="card" style={{ maxWidth: 760, margin: '3rem auto' }}>
        <h2>Bienvenido a RecompOS</h2>
        <p>Inicia sesión o crea una cuenta local para mantener tus datos separados por usuario.</p>
        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr 1fr' }}>
          <form onSubmit={submitSignUp}>
            <h3>Registro</h3>
            <input placeholder="Nombre" value={signUpData.displayName} onChange={(e) => setSignUpData((s) => ({ ...s, displayName: e.target.value }))} />
            <input placeholder="Email" type="email" value={signUpData.email} onChange={(e) => setSignUpData((s) => ({ ...s, email: e.target.value }))} />
            <input placeholder="Password" type="password" value={signUpData.password} onChange={(e) => setSignUpData((s) => ({ ...s, password: e.target.value }))} />
            <button type="submit">Crear cuenta</button>
          </form>
          <form onSubmit={submitSignIn}>
            <h3>Login</h3>
            <input placeholder="Email" type="email" value={signInData.email} onChange={(e) => setSignInData((s) => ({ ...s, email: e.target.value }))} />
            <input placeholder="Password" type="password" value={signInData.password} onChange={(e) => setSignInData((s) => ({ ...s, password: e.target.value }))} />
            <button type="submit">Entrar</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: 12 }}>
      <strong>{currentUser.displayName}</strong>
      <small>{currentUser.email}</small>
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        {canImportLegacy && <button onClick={onImportLegacy}>Importar datos previos a esta cuenta</button>}
        <button onClick={onSignOut}>Cambiar de usuario / Cerrar sesión</button>
      </div>
    </div>
  );
}
