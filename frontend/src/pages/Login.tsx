import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleOAuthProvider, GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Key,
  ShieldCheck,
  Eye,
  EyeOff
} from 'lucide-react';

interface GoogleJwtPayload {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
  email_verified?: boolean;
}

export const Login: React.FC = () => {
  const { loginWithGooglePayload, signInWithPassword, signUpWithPassword, user } = useAuth();
  const navigate = useNavigate();

  // Mode: 'signin' | 'signup'
  const [isSignUp, setIsSignUp] = useState(false);

  // Form Fields
  const [identifier, setIdentifier] = useState(''); // phone, username, or email for login
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Sign-Up Specific Fields
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [googleClientId, setGoogleClientId] = useState<string>(() => {
    return localStorage.getItem('codequest_google_client_id') || import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  });
  const [showClientIdConfig, setShowClientIdConfig] = useState(false);

  if (user) {
    navigate('/');
    return null;
  }

  // Google OAuth Success Handler
  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      setErrorMessage('No credential returned by Google Identity Services.');
      return;
    }
    setLoading(true);
    setErrorMessage(null);

    try {
      const decoded = jwtDecode<GoogleJwtPayload>(credentialResponse.credential);
      if (!decoded.email) {
        throw new Error('Google token did not contain an email address.');
      }

      await loginWithGooglePayload({
        sub: decoded.sub,
        email: decoded.email,
        name: decoded.name || decoded.email.split('@')[0],
        picture: decoded.picture,
      });

      navigate('/');
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      setErrorMessage(err.message || 'Failed to authenticate with Google token.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setErrorMessage('Google Sign-In popup closed or authentication cancelled.');
  };

  // Sign In Submission
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!identifier.trim() || !password) {
      setErrorMessage('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      await signInWithPassword(identifier.trim(), password);
      navigate('/');
    } catch (err: any) {
      setErrorMessage(err.message || 'Incorrect username or password.');
    } finally {
      setLoading(false);
    }
  };

  // Sign Up Submission -> Instagram Workflow
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim() || !fullName.trim() || !username.trim() || !password) {
      setErrorMessage('Please fill in all fields to sign up.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await signUpWithPassword({
        email: email.trim(),
        full_name: fullName.trim(),
        display_name: fullName.trim(),
        username: username.trim().toLowerCase(),
        password,
      });

      // Instagram Workflow: After signup, transition to Log In with credentials ready!
      setSuccessMessage(res.message || 'Account created successfully! Please log in.');
      setIdentifier(res.username || email);
      setPassword('');
      setIsSignUp(false); // Switch to Log In view
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveClientId = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('codequest_google_client_id', googleClientId.trim());
    setShowClientIdConfig(false);
    setSuccessMessage('Google Client ID saved! The official Google OAuth popup is active.');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  return (
    <div className="min-h-screen bg-[#0E1526] text-white flex flex-col justify-between py-10 px-4 sm:px-6 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-[-10%] left-[-5%] w-[450px] h-[450px] rounded-full bg-[#7657F6]/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[450px] h-[450px] rounded-full bg-[#39C6D8]/15 blur-[120px] pointer-events-none" />

      {/* Main Instagram-Style Container */}
      <div className="max-w-[400px] w-full mx-auto my-auto space-y-3 z-10 animate-fadeIn">
        
        {/* Main Card */}
        <div className="bg-[#141E34] border border-[#233354] rounded-3xl p-8 sm:p-9 shadow-2xl space-y-6">
          
          {/* Brand Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#7657F6] to-[#39C6D8] flex items-center justify-center shadow-lg shadow-[#7657F6]/30">
                <span className="font-mono font-black text-white text-lg">CQ</span>
              </div>
              <h1 className="font-mono font-black text-2xl tracking-wider text-white">CODEQUEST</h1>
            </div>

            <p className="text-xs font-medium text-gray-400 max-w-[280px] mx-auto leading-relaxed">
              {isSignUp
                ? 'Sign up to challenge yourself with AI programming quizzes with zero repeats.'
                : 'Welcome back! Log in to continue your streak and practice fresh questions.'}
            </p>
          </div>

          {/* Success Banner */}
          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-start gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed font-medium">{successMessage}</span>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed font-medium">{errorMessage}</span>
            </div>
          )}

          {/* Google Auth Button (Instagram-Style Top Action) */}
          {googleClientId ? (
            <GoogleOAuthProvider clientId={googleClientId}>
              <div className="flex flex-col items-center justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="filled_blue"
                  shape="pill"
                  text={isSignUp ? 'signup_with' : 'signin_with'}
                />
              </div>

              {/* Instagram-style OR Divider */}
              <div className="flex items-center gap-3 text-xs text-gray-500 my-4">
                <div className="flex-1 h-px bg-[#233354]"></div>
                <span className="font-bold text-[10px] uppercase tracking-wider text-gray-400">OR</span>
                <div className="flex-1 h-px bg-[#233354]"></div>
              </div>
            </GoogleOAuthProvider>
          ) : null}

          {/* FORM: LOG IN OR SIGN UP */}
          {!isSignUp ? (
            /* --- INSTAGRAM-STYLE SIGN IN FORM --- */
            <form onSubmit={handleSignIn} className="space-y-3.5">
              <div>
                <input
                  type="text"
                  required
                  placeholder="Phone number, username, or email"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl bg-[#0E1526] border border-[#233354] text-white text-xs placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7657F6] focus:border-transparent transition-all"
                />
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl bg-[#0E1526] border border-[#233354] text-white text-xs placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7657F6] focus:border-transparent transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading || !identifier.trim() || !password}
                className="w-full py-3 rounded-xl bg-[#7657F6] hover:bg-[#6543F4] text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-[#7657F6]/30 transition-all disabled:opacity-40"
              >
                {loading ? 'Logging In...' : 'Log In'}
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => alert('To reset your password, contact support or sign in using your verified Google Account.')}
                  className="text-[11px] text-gray-400 hover:text-white transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            </form>
          ) : (
            /* --- INSTAGRAM-STYLE SIGN UP FORM --- */
            <form onSubmit={handleSignUp} className="space-y-3">
              <div>
                <input
                  type="email"
                  required
                  placeholder="Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0E1526] border border-[#233354] text-white text-xs placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7657F6] transition-all"
                />
              </div>

              <div>
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0E1526] border border-[#233354] text-white text-xs placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7657F6] transition-all"
                />
              </div>

              <div>
                <input
                  type="text"
                  required
                  placeholder="Username (e.g. alex_coder)"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0E1526] border border-[#233354] text-white text-xs placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7657F6] transition-all"
                />
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="Password (6+ characters)"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0E1526] border border-[#233354] text-white text-xs placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7657F6] transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <p className="text-[10px] text-gray-400 text-center leading-normal pt-1">
                By signing up, you agree to our Terms, Data Policy and Cookies Policy.
              </p>

              <button
                type="submit"
                disabled={loading || !email.trim() || !fullName.trim() || !username.trim() || !password}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#7657F6] to-[#39C6D8] text-white font-bold text-xs uppercase tracking-wider shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-40"
              >
                {loading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </form>
          )}

          {/* Google Client ID Configuration Accordion */}
          <div className="pt-2 text-center border-t border-[#233354]">
            <button
              onClick={() => setShowClientIdConfig(!showClientIdConfig)}
              className="inline-flex items-center gap-1.5 text-[10px] text-gray-400 hover:text-white transition-colors"
            >
              <Key className="w-3 h-3" />
              <span>{googleClientId ? 'Edit Google Client ID' : 'Configure Google Client ID'}</span>
            </button>

            {showClientIdConfig && (
              <form onSubmit={handleSaveClientId} className="mt-3 p-3 rounded-2xl bg-[#0E1526] border border-[#233354] space-y-2 text-left animate-fadeIn">
                <label className="block text-[10px] font-bold text-gray-300">Google Cloud Client ID</label>
                <input
                  type="text"
                  placeholder="123456789-xxxx.apps.googleusercontent.com"
                  value={googleClientId}
                  onChange={e => setGoogleClientId(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-[#141E34] border border-[#233354] text-xs text-white"
                />
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="submit"
                    className="px-3 py-1 bg-[#7657F6] text-white rounded-lg text-xs font-semibold"
                  >
                    Save
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Secondary Card (Instagram-Style Switcher) */}
        <div className="bg-[#141E34] border border-[#233354] rounded-2xl p-4 text-center text-xs text-gray-300 shadow-md">
          {!isSignUp ? (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(true);
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="font-bold text-[#7657F6] hover:text-[#9076F8] transition-colors ml-1"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(false);
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="font-bold text-[#39C6D8] hover:text-[#62D4E3] transition-colors ml-1"
              >
                Log in
              </button>
            </p>
          )}
        </div>

        {/* App info */}
        <div className="text-center text-[10px] text-gray-500 pt-2">
          <p className="flex items-center justify-center gap-1 text-[#39C6D8]">
            <ShieldCheck className="w-3 h-3" /> SQLite Backend • Strict Zero-Repeat Questions Guaranteed
          </p>
        </div>
      </div>
    </div>
  );
};
