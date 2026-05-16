import { FormEvent, useState } from 'react';
import { LogOut, UserCircle } from 'lucide-react';
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
      <main className="authShell">
        <section className="authCard">
          <div className="authIntro">
            <span className="logo"><UserCircle size={22} strokeWidth={2.3} /></span>
            <div>
              <span className="eyebrow">Acceso local</span>
              <h1>RecompOS</h1>
              <p>Separa tus datos por usuario y conserva el flujo de entrenamiento, nutrición y progreso en este dispositivo.</p>
            </div>
          </div>
          <div className="authGrid">
            <form className="authForm" onSubmit={submitSignUp}>
              <h3>Crear cuenta</h3>
              <label>Nombre<input placeholder="Dani" value={signUpData.displayName} onChange={(e) => setSignUpData((s) => ({ ...s, displayName: e.target.value }))} /></label>
              <label>Email<input placeholder="tu@email.com" type="email" value={signUpData.email} onChange={(e) => setSignUpData((s) => ({ ...s, email: e.target.value }))} /></label>
              <label>Password<input placeholder="Mínimo 6 caracteres" type="password" value={signUpData.password} onChange={(e) => setSignUpData((s) => ({ ...s, password: e.target.value }))} /></label>
              <button className="primaryButton" type="submit">Crear cuenta</button>
            </form>
            <form className="authForm" onSubmit={submitSignIn}>
              <h3>Entrar</h3>
              <label>Email<input placeholder="tu@email.com" type="email" value={signInData.email} onChange={(e) => setSignInData((s) => ({ ...s, email: e.target.value }))} /></label>
              <label>Password<input placeholder="Tu password" type="password" value={signInData.password} onChange={(e) => setSignInData((s) => ({ ...s, password: e.target.value }))} /></label>
              <button className="secondaryButton" type="submit">Entrar</button>
            </form>
          </div>
        </section>
      </main>
    );
  }

  return (
    <div className="accountPanel">
      <div className="accountIdentity">
        <UserCircle size={19} />
        <div>
          <strong>{currentUser.displayName}</strong>
          <small>{currentUser.email}</small>
        </div>
      </div>
      <div className="accountActions">
        {canImportLegacy && <button className="secondaryButton" onClick={onImportLegacy}>Importar datos previos</button>}
        <button className="iconTextButton subtle" onClick={onSignOut}><LogOut size={16} /> <span>Cerrar sesión</span></button>
      </div>
    </div>
  );
}
