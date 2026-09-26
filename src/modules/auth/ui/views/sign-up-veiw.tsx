'use client';
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import SplashCursor from '@/components/SplashCursor';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { z } from "zod";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, OctagonAlert } from 'lucide-react';

const signUpSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string()
    .min(8, { message: 'Must be at least 8 characters' })
    .regex(/[A-Z]/, { message: 'Must contain an uppercase letter' })
    .regex(/[^a-zA-Z0-9]/, { message: 'Must contain a special character' }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

export const SignUpView = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  useEffect(() => {
    router.prefetch("/");
  }, [router]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  const passwordValue = watch('password') || '';
  
  const has8Chars = passwordValue.length >= 8;
  const hasUpper = /[A-Z]/.test(passwordValue);
  const hasSpecial = /[^a-zA-Z0-9]/.test(passwordValue);

  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animationFrameId: number;
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const updateCursor = () => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }
      animationFrameId = requestAnimationFrame(updateCursor);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA'].includes(target.tagName) && cursorRef.current) {
        cursorRef.current.style.opacity = '0'; 
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA'].includes(target.tagName) && cursorRef.current) {
        cursorRef.current.style.opacity = '1'; 
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    
    updateCursor();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const onSubmit = async (data: SignUpFormValues) => {
    setIsLoading(true);
    setAuthError('');
    try {
      await authClient.signUp.email(
        {
          name: data.name,
          email: data.email,
          password: data.password,
        },
        {
          onSuccess: () => {
            router.push("/");
          },
          onError: (ctx) => {
            setAuthError(ctx.error.message || 'Something went wrong.');
            setIsLoading(false);
          },
        }
      );
    } catch (error: any) {
      setAuthError(error.message || 'An unexpected error occurred.');
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    try {
      await authClient.signIn.social({
        provider: provider as 'github' | 'google',
        callbackURL: "/",
      });
    } catch (error: any) {
      setAuthError(error.message || `Failed to login with ${provider}`);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
        
        body {
          font-family: 'Space Grotesk', sans-serif;
          background-color: #030014;
          margin: 0;
          overflow: hidden;
          cursor: none; 
        }
        
        input, textarea {
          cursor: text; 
        }
        
        button, a, button *, a * {
          cursor: none !important; 
        }

        .font-space {
          font-family: 'Space Grotesk', sans-serif;
        }

        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active{
            -webkit-box-shadow: 0 0 0 30px #0a051e inset !important;
            -webkit-text-fill-color: white !important;
            transition: background-color 5000s ease-in-out 0s;
        }

        /* Custom Scrollbar for expanding card */
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(168,85,247,0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(168,85,247,0.6);
        }
      `}} />

      <div 
        ref={cursorRef} 
        className="pointer-events-none fixed top-0 left-0 w-2 h-2 -ml-1 -mt-1 rounded-full bg-fuchsia-400 shadow-[0_0_15px_3px_rgba(232,121,249,1)] z-[100] mix-blend-screen transition-opacity duration-300"
      ></div>

      <div className="relative min-h-screen w-full bg-[#030014] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(80,0,200,0.15),rgba(255,255,255,0))] overflow-hidden flex items-center justify-center">
        
        <div className="absolute inset-0 z-0 pointer-events-auto">
          <SplashCursor 
            SIM_RESOLUTION={128}
            DYE_RESOLUTION={1024} 
            DENSITY_DISSIPATION={2.0}
            VELOCITY_DISSIPATION={2.5}
            PRESSURE={0.1}
            CURL={3.0}
            SPLAT_RADIUS={0.35}
            SPLAT_FORCE={4000}
            SHADING={true} 
            COLOR_UPDATE_SPEED={10}
            BACK_COLOR={{ r: 0.01, g: 0.0, b: 0.05 }} 
            TRANSPARENT={true}
            RAINBOW_MODE={false} 
            COLOR="#e879f9"
          />
        </div>

        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay pointer-events-none z-0"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none z-0"></div>

        <div 
          className="relative z-10 w-full max-w-md mx-4 sm:mx-0 p-8 sm:p-10 rounded-3xl bg-[#05001a] border border-purple-500/20 shadow-[0_0_50px_-12px_rgba(168,85,247,0.4)] hover:shadow-[0_0_80px_-10px_rgba(168,85,247,0.5)] transition-all duration-700 max-h-[90vh] overflow-y-auto custom-scrollbar"
          onMouseEnter={(e) => e.stopPropagation()} 
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-80 shadow-[0_0_10px_rgba(192,132,252,1)]"></div>

          <div className="flex flex-col items-center mb-8">
            <div className="relative w-20 h-20 mb-4 rounded-2xl flex items-center justify-center bg-white/[0.03] border border-white/10 shadow-[0_0_30px_rgba(168,85,247,0.15)] group-hover:scale-105 transition-transform duration-500">
              <Image 
                src="/logo.png" 
                alt="Wingmeet Ai Logo" 
                width={64}
                height={64}
                className="object-contain z-10 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                  ((e.target as HTMLElement).nextSibling as HTMLElement).style.display = 'block';
                }}
              />
              <span className="hidden absolute text-purple-400 font-bold text-3xl tracking-wider">W</span>
            </div>
            <h1 className="text-3xl font-space font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-purple-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]">
              Create Account
            </h1>
          </div>

          {(Object.keys(errors).length > 0 || authError) && (
            <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm shadow-[0_0_15px_rgba(239,68,68,0.1)]">
              <OctagonAlert className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold mb-1">Error</strong>
                <span className="text-red-400/90">{authError || "Please fix the highlighted fields below."}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 relative z-20">
            
            <div className="relative">
              <input
                {...register('name')}
                type="text"
                placeholder="Full Name"
                className={`w-full px-5 py-[18px] bg-white/[0.02] border rounded-xl text-white placeholder-gray-500/80 outline-none transition-all duration-300 focus:bg-white/[0.05] focus:shadow-[0_0_25px_rgba(168,85,247,0.25)] ${errors.name ? 'border-red-500/50' : 'border-white/5 hover:border-white/10 focus:border-purple-500/60'}`}
              />
              {errors.name && <p className="text-red-400 text-xs mt-1.5 ml-1">{errors.name.message}</p>}
            </div>

            <div className="relative">
              <input
                {...register('email')}
                type="email"
                placeholder="Email Address"
                className={`w-full px-5 py-[18px] bg-white/[0.02] border rounded-xl text-white placeholder-gray-500/80 outline-none transition-all duration-300 focus:bg-white/[0.05] focus:shadow-[0_0_25px_rgba(168,85,247,0.25)] ${errors.email ? 'border-red-500/50' : 'border-white/5 hover:border-white/10 focus:border-purple-500/60'}`}
              />
              {errors.email && <p className="text-red-400 text-xs mt-1.5 ml-1">{errors.email.message}</p>}
            </div>

            <div className="relative">
              <div className="relative flex items-center">
                <input
                  {...register('password')}
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                  className={`w-full px-5 py-[18px] pr-12 bg-white/[0.02] border rounded-xl text-white placeholder-gray-500/80 outline-none transition-all duration-300 focus:bg-white/[0.05] focus:shadow-[0_0_25px_rgba(168,85,247,0.25)] ${errors.password ? 'border-red-500/50' : 'border-white/5 hover:border-white/10 focus:border-purple-500/60'}`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 text-gray-500 hover:text-purple-400 transition-colors z-10 cursor-none">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Animated Password Requirements Dropdown */}
              <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isPasswordFocused || passwordValue.length > 0 ? 'max-h-32 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                <ul className="text-[11px] space-y-2 ml-1 bg-black/40 p-3.5 rounded-xl border border-white/5 backdrop-blur-sm shadow-inner">
                  <li className={`flex items-center gap-2 transition-colors duration-300 ${has8Chars ? "text-purple-300" : "text-gray-500"}`}>
                    <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${has8Chars ? "bg-purple-400 shadow-[0_0_5px_#a855f7]" : "bg-gray-700"}`}></div>
                    At least 8 characters
                  </li>
                  <li className={`flex items-center gap-2 transition-colors duration-300 ${hasUpper ? "text-purple-300" : "text-gray-500"}`}>
                    <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${hasUpper ? "bg-purple-400 shadow-[0_0_5px_#a855f7]" : "bg-gray-700"}`}></div>
                    One uppercase letter
                  </li>
                  <li className={`flex items-center gap-2 transition-colors duration-300 ${hasSpecial ? "text-purple-300" : "text-gray-500"}`}>
                    <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${hasSpecial ? "bg-purple-400 shadow-[0_0_5px_#a855f7]" : "bg-gray-700"}`}></div>
                    One special character (!@#$)
                  </li>
                </ul>
              </div>
            </div>

            <div className="relative">
              <div className="relative flex items-center">
                <input
                  {...register('confirmPassword')}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  className={`w-full px-5 py-[18px] pr-12 bg-white/[0.02] border rounded-xl text-white placeholder-gray-500/80 outline-none transition-all duration-300 focus:bg-white/[0.05] focus:shadow-[0_0_25px_rgba(168,85,247,0.25)] ${errors.confirmPassword ? 'border-red-500/50' : 'border-white/5 hover:border-white/10 focus:border-purple-500/60'}`}
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 text-gray-500 hover:text-purple-400 transition-colors z-10 cursor-none">
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-400 text-xs mt-1.5 ml-1">{errors.confirmPassword.message}</p>}
            </div>

            {/* Premium Animated Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="relative w-full mt-8 py-[18px] font-space font-semibold text-purple-300 text-lg rounded-xl border border-purple-500/40 bg-transparent transition-all duration-500 ease-out overflow-hidden group hover:border-transparent hover:shadow-[0_0_40px_rgba(168,85,247,0.5)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-none"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-fuchsia-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out z-0"></div>
              <span className="relative z-10 group-hover:text-white transition-colors duration-300 tracking-wide">
                {isLoading ? 'Creating Account...' : 'Sign Up'}
              </span>
            </button>
          </form>

          {/* Separator */}
          <div className="relative text-center text-sm my-8">
            <div className="absolute inset-0 top-1/2 h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
            <span className="relative z-10 bg-[#05001a] px-4 text-purple-300/60 font-medium">Continue with</span>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-3 relative z-20">
            <button onClick={() => handleSocialLogin('google')} type="button" className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-gray-300 hover:bg-white/[0.05] hover:text-white transition-all duration-300 hover:border-purple-500/40 hover:shadow-[0_0_15px_rgba(168,85,247,0.15)] cursor-none text-sm font-medium">
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Google
            </button>
            <button onClick={() => handleSocialLogin('github')} type="button" className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-gray-300 hover:bg-white/[0.05] hover:text-white transition-all duration-300 hover:border-purple-500/40 hover:shadow-[0_0_15px_rgba(168,85,247,0.15)] cursor-none text-sm font-medium">
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              GitHub
            </button>
          </div>

          <div className="mt-8 text-center relative z-20">
            <p className="text-gray-400 text-sm">
              Already have an account?{' '}
              <Link href="/sign-in" className="text-purple-400 font-medium hover:text-white transition-colors duration-300 hover:drop-shadow-[0_0_10px_rgba(192,132,252,0.9)] cursor-none underline underline-offset-4">
                Sign In
              </Link>
            </p>
          </div>

          {/* Privacy & Terms */}
          <div className="mt-8 pt-6 border-t border-white/5 text-center relative z-20">
            <p className="text-gray-500 text-[11px] leading-relaxed max-w-[280px] mx-auto">
              By clicking continue, you agree to our{' '}
              <Link href="#" className="text-purple-400/70 hover:text-white transition-colors duration-300 cursor-none underline underline-offset-2">
                Terms of Service
              </Link>
              {' '}and{' '}
              <Link href="#" className="text-purple-400/70 hover:text-white transition-colors duration-300 cursor-none underline underline-offset-2">
                Privacy Policy
              </Link>.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}