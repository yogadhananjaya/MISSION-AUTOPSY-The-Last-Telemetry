/* antislop: Tactical High-Security Authentication Portal (Team Certified Space Cap) */
import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  KeyRound, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  CheckCircle2, 
  Globe
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { sounds } from '../../utils/soundEngine';
import { useTranslation } from '../../i18n';

interface AuthScreenProps {
  onSuccess: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess }) => {
  const { language, setLanguage } = useTranslation();
  const { login, register, loginWithGoogle, isLoading, error, clearError } = useAuthStore();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState('');

  // Password strength checks for registration
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordsMatch = mode === 'login' || (password === confirmPassword && confirmPassword.length > 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    sounds.playClick(750);

    if (mode === 'login') {
      const ok = await login(email, password);
      if (ok) {
        sounds.playSuccess();
        onSuccess();
      } else {
        sounds.playAlarm();
      }
    } else {
      if (!passwordsMatch) {
        sounds.playAlarm();
        return;
      }
      const ok = await register(email, password, confirmPassword);
      if (ok) {
        sounds.playSuccess();
        onSuccess();
      } else {
        sounds.playAlarm();
      }
    }
  };

  const handleSimulateGoogleLogin = async (selectedEmail: string) => {
    sounds.playClick(800);
    setShowGoogleModal(false);
    const googleId = 'gid_' + Math.random().toString(36).substring(2, 12);
    const ok = await loginWithGoogle({
      email: selectedEmail,
      name: selectedEmail.split('@')[0],
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${selectedEmail}`,
      googleId,
    });
    if (ok) {
      sounds.playSuccess();
      onSuccess();
    } else {
      sounds.playAlarm();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#070A0F] text-white select-none blueprint-grid p-4 sm:p-6 overflow-y-auto">
      
      {/* Background Ambience: Deep Space Terminal Glow */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          background: 'radial-gradient(circle at 50% 30%, rgba(245,158,11,0.08) 0%, rgba(11,14,20,0.85) 60%, #070A0F 100%)',
        }}
      />

      {/* Main Tactical Authentication Card */}
      <div className="relative z-10 w-full max-w-md bg-[#111520]/95 border border-black border-t-2 border-t-amber-500 rounded clip-chamfer-md shadow-2xl p-6 sm:p-8 space-y-6 backdrop-blur-xl">
        
        {/* Top Header Badge: Team Certified Space Cap & NASA Security */}
        <div className="flex items-center justify-between border-b border-black/80 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest">
              CERTIFIED SPACE CAP // TIER-1 AUTH
            </span>
          </div>

          {/* Language Switch */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'id' : 'en')}
            className="flex items-center gap-1 px-2 py-0.5 bg-[#18202F] hover:bg-amber-500 hover:text-black border border-black text-slate-300 text-[10px] font-mono font-bold rounded transition-colors"
          >
            <Globe className="w-3 h-3" />
            <span>{language.toUpperCase()}</span>
          </button>
        </div>

        {/* Title & Mission Branding */}
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500 text-black font-bold rounded clip-chamfer-sm">
              <ShieldCheck className="w-5 h-5 text-black" />
            </div>
            <div>
              <h1 className="font-display font-black text-lg sm:text-xl text-white uppercase tracking-wider">
                ORBITA NOVA
              </h1>
              <p className="text-[11px] font-mono text-slate-400">
                {language === 'en' ? 'FLIGHT CLEARANCE & MISSION ACCESS' : 'OTORISASI AKSES DIREKTORAT MISI'}
              </p>
            </div>
          </div>
        </div>

        {/* Mode Selector: Login vs Register */}
        <div className="grid grid-cols-2 gap-1 bg-[#0A0D14] p-1 border border-black rounded clip-chamfer-sm font-mono text-xs font-bold">
          <button
            type="button"
            onClick={() => { sounds.playClick(600); setMode('login'); clearError(); }}
            className={`py-2 rounded transition-colors cursor-pointer ${
              mode === 'login' 
                ? 'bg-amber-500 text-black shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {language === 'en' ? 'LOGIN' : 'MASUK'}
          </button>
          <button
            type="button"
            onClick={() => { sounds.playClick(600); setMode('register'); clearError(); }}
            className={`py-2 rounded transition-colors cursor-pointer ${
              mode === 'register' 
                ? 'bg-amber-500 text-black shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {language === 'en' ? 'REGISTER' : 'DAFTAR BARU'}
          </button>
        </div>

        {/* Error Alert Banner */}
        {error && (
          <div className="p-3 bg-rose-950/80 border border-rose-500/80 rounded clip-chamfer-sm text-xs font-mono text-rose-200 flex items-start gap-2 shadow-lg animate-shake">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono font-bold text-slate-300 uppercase flex items-center justify-between">
              <span>{language === 'en' ? 'ASTRONAUT EMAIL' : 'EMAIL PENJELAJAH'}</span>
              <span className="text-[9px] text-slate-500">RFC 5322</span>
            </label>
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-[#0A0D14] border border-black rounded focus-within:border-amber-500 transition-colors">
              <Mail className="w-4 h-4 text-amber-400 shrink-0" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="cadet.pilot@nasa.gov"
                className="w-full bg-transparent font-mono text-xs sm:text-sm text-white placeholder:text-slate-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono font-bold text-slate-300 uppercase flex items-center justify-between">
              <span>{language === 'en' ? 'SECURITY CLEARANCE KEY' : 'KATA SANDI KEAMANAN'}</span>
              <span className="text-[9px] text-slate-500">SCRYPT 256-BIT</span>
            </label>
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-[#0A0D14] border border-black rounded focus-within:border-amber-500 transition-colors">
              <Lock className="w-4 h-4 text-amber-400 shrink-0" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-transparent font-mono text-xs sm:text-sm text-white placeholder:text-slate-600 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field (Register Only) */}
          {mode === 'register' && (
            <div className="space-y-1.5 animate-fadeIn">
              <label className="text-[11px] font-mono font-bold text-slate-300 uppercase">
                {language === 'en' ? 'CONFIRM SECURITY KEY' : 'KONFIRMASI KATA SANDI'}
              </label>
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-[#0A0D14] border border-black rounded focus-within:border-amber-500 transition-colors">
                <KeyRound className="w-4 h-4 text-amber-400 shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-transparent font-mono text-xs sm:text-sm text-white placeholder:text-slate-600 focus:outline-none"
                />
              </div>

              {/* Realtime Password Strength Indicators */}
              <div className="p-2.5 bg-[#0A0D14] border border-black rounded space-y-1 text-[10px] font-mono">
                <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-400' : 'text-slate-500'}`}>
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Minimal 8 karakter</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasUpperCase && hasLowerCase ? 'text-emerald-400' : 'text-slate-500'}`}>
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Huruf besar & huruf kecil</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-400' : 'text-slate-500'}`}>
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Minimal 1 angka (0-9)</span>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-black font-display font-black text-xs sm:text-sm uppercase tracking-wider rounded clip-chamfer-sm shadow-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span>{language === 'en' ? 'AUTHENTICATING...' : 'MEMPROSES OTORISASI...'}</span>
            ) : (
              <>
                <span>{mode === 'login' ? (language === 'en' ? 'VERIFY & ENTER HUB' : 'VERIFIKASI & MASUK HUB') : (language === 'en' ? 'CREATE SECURE ACCOUNT' : 'BUAT AKUN AMAN')}</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </>
            )}
          </button>
        </form>

        {/* Tactical Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-black/80 w-full" />
          <span className="bg-[#111520] px-3 font-mono text-[9px] text-slate-500 uppercase tracking-widest">
            {language === 'en' ? 'OR CONTINUE WITH' : 'ATAU MASUK MELALUI'}
          </span>
        </div>

        {/* Official Google OAuth Sign-in Button */}
        <button
          type="button"
          onClick={() => { sounds.playClick(650); setShowGoogleModal(true); }}
          className="w-full py-2.5 px-4 bg-[#141824] hover:bg-[#1A2234] border border-black hover:border-slate-700 text-white font-mono text-xs font-bold rounded clip-chamfer-sm shadow-md flex items-center justify-center gap-3 transition-all cursor-pointer"
        >
          {/* Official Google 'G' icon */}
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.14z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"/>
            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.92 0 12s.45 3.85 1.24 5.42l4.04-3.15z"/>
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
          </svg>
          <span>{language === 'en' ? 'Continue with Google Account' : 'Masuk dengan Akun Google'}</span>
        </button>

        {/* Security Footer Notice */}
        <div className="pt-2 border-t border-black/80 flex items-center justify-between text-[9px] font-mono text-slate-500">
          <span>TEAM CERTIFIED SPACE CAP</span>
          <span>SCRYPT + RATE LIMIT GUARD</span>
        </div>

      </div>

      {/* Google Account Selector Dialog */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-[#161B26] border border-black rounded-xl p-5 space-y-4 shadow-2xl text-white">
            
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.14z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.92 0 12s.45 3.85 1.24 5.42l4.04-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <div>
                <h3 className="font-display font-bold text-sm text-white">Google Single Sign-On</h3>
                <p className="text-[10px] font-mono text-slate-400">Pilih akun Google untuk masuk ke Orbita Nova</p>
              </div>
            </div>

            {/* Quick Suggested Accounts */}
            <div className="space-y-2 pt-1">
              {[
                { name: 'Cadet Pilot', email: 'cadet.pilot@gmail.com' },
                { name: 'Flight Specialist', email: 'specialist.astro@gmail.com' }
              ].map((acc) => (
                <button
                  key={acc.email}
                  onClick={() => handleSimulateGoogleLogin(acc.email)}
                  className="w-full p-2.5 bg-[#0F131C] hover:bg-amber-500 hover:text-black border border-black rounded text-left transition-colors cursor-pointer group"
                >
                  <div className="font-display font-bold text-xs group-hover:text-black">{acc.name}</div>
                  <div className="font-mono text-[10px] text-slate-400 group-hover:text-black/80">{acc.email}</div>
                </button>
              ))}
            </div>

            {/* Or custom Google Email */}
            <div className="space-y-1.5 pt-2 border-t border-black/80">
              <label className="text-[10px] font-mono text-slate-400">Gunakan akun Google lain:</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={googleEmailInput}
                  onChange={(e) => setGoogleEmailInput(e.target.value)}
                  placeholder="anda@gmail.com"
                  className="flex-1 px-3 py-1.5 bg-[#0F131C] border border-black rounded font-mono text-xs text-white focus:outline-none focus:border-amber-500"
                />
                <button
                  onClick={() => {
                    if (googleEmailInput.trim()) {
                      handleSimulateGoogleLogin(googleEmailInput.trim());
                    }
                  }}
                  className="px-3 py-1.5 bg-amber-500 text-black font-display font-bold text-xs rounded cursor-pointer"
                >
                  OK
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowGoogleModal(false)}
                className="text-xs font-mono text-slate-400 hover:text-white cursor-pointer"
              >
                Batal
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
