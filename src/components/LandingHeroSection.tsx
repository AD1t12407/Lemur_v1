import React, { Suspense, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronDown, CheckCircle } from 'lucide-react';
import Spline from '@splinetool/react-spline';
import { ApiService } from '../services/api';
import { useMediaQuery } from '../hooks/useMediaQuery';

const LandingHeroSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track if viewport is extra-large or above
  const isXL = useMediaQuery('(min-width: 1280px)');

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setIsEmailValid(value.includes('@') && value.includes('.'));
    setError(null); // Clear error when user starts typing
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEmailValid && email && !isLoading) {
      setIsLoading(true);
      setError(null);
      
      try {
        await ApiService.getAccess({ email });
        setIsSubmitted(true);
        setEmail('');
      } catch (err: any) {
        setError(err.message || 'Failed to submit. Please try again.');
        console.error('Early access submission failed:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-white via-gray-50 to-blue-50/20 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950/20 transition-colors duration-500">
      {/* Premium background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-transparent to-white/90 dark:from-gray-950/90 dark:via-transparent dark:to-gray-950/90 z-10 transition-colors duration-500" />
      
      {/* Subtle grid pattern - Apple style */}
      <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03] transition-opacity duration-500" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgb(0,0,0) 1px, transparent 0)`,
        backgroundSize: '50px 50px'
      }} />

      {/* Main Container */}
      <div className="relative z-20 w-full max-w-8xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-screen">
          
          {/* Left Side - Content with Apple-style hierarchy */}
          <div className="flex flex-col justify-center space-y-6 md:space-y-8 lg:space-y-12 lg:pr-12 text-center lg:text-left">
            
            {/* Subtle intro line - Apple style */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm md:text-lg font-medium tracking-wide transition-colors duration-500"
            >
              🚀 Complete Business Automation for Consultants
            </motion.div>

            {/* Main headline - Apple typography hierarchy */}
            <div className="space-y-4 md:space-y-6">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-extrabold text-gray-900 dark:text-white leading-[1.05] tracking-tight transition-colors duration-500"
              >
                From Lead to Deal
                <br />
                <motion.span 
                  className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 0.5 }}
                >
                  with Lemur AI
                </motion.span>
              </motion.h1>

              {/* Emotional value proposition */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-700 dark:text-gray-300 leading-relaxed font-medium max-w-3xl transition-colors duration-500"
              >
                The complete business automation platform for consulting firms and freelancers. From the first meeting to the first proposal, we handle the heavy lifting so you can focus on closing deals.
              </motion.p>
            </div>

            {/* Apple-style feature highlights */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              className="space-y-4 md:space-y-6"
            >
              <div className="space-y-5 sm:space-y-6 flex flex-col items-center lg:items-start max-w-md mx-auto lg:max-w-none lg:mx-0">
                <div className="flex items-start space-x-4 w-full">
                  <div className="w-3 h-3 bg-blue-400 rounded-full flex-shrink-0 mt-1"></div>
                  <span className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-600 dark:text-gray-300 font-medium transition-colors duration-500 text-left flex-1">Centralized business intelligence that learns</span>
                </div>
                <div className="flex items-start space-x-4 w-full">
                  <div className="w-3 h-3 bg-purple-400 rounded-full flex-shrink-0 mt-1"></div>
                  <span className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-600 dark:text-gray-300 font-medium transition-colors duration-500 text-left flex-1">AI agents that work while you sleep</span>
                </div>
                <div className="flex items-start space-x-4 w-full">
                  <div className="w-3 h-3 bg-green-400 rounded-full flex-shrink-0 mt-1"></div>
                  <span className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-600 dark:text-gray-300 font-medium transition-colors duration-500 text-left flex-1">Proposals that close themselves</span>
                </div>
              </div>
            </motion.div>

            {/* Premium CTA section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
              className="space-y-6 md:space-y-8"
            >
              {/* Email capture with Apple aesthetics */}
              <div className="space-y-4">
                {!isSubmitted ? (
                  <form onSubmit={handleSubmit} className="flex flex-col space-y-4 max-w-md mx-auto lg:max-w-none lg:flex-row lg:space-y-0 lg:space-x-4">
                    <div className="w-full lg:flex-1">
                      <input
                        type="email"
                        placeholder="Enter your email to join the waitlist"
                        className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-xl sm:rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-white/20 focus:border-blue-500/50 dark:focus:border-white/20 transition-all duration-300 text-sm sm:text-base lg:text-lg font-medium"
                        value={email}
                        onChange={handleEmailChange}
                        required
                        disabled={isLoading}
                      />
                      {error && (
                        <div className="text-red-500 text-sm mt-2 text-center">
                          {error}
                        </div>
                      )}
                    </div>
                    <motion.button
                      type="submit"
                      className="group w-full lg:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base lg:text-lg transition-all duration-300 flex items-center justify-center space-x-2 sm:space-x-3 lg:min-w-fit disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                      whileHover={{ 
                        scale: !isLoading ? 1.02 : 1, 
                        boxShadow: !isLoading ? "0 20px 40px -10px rgba(139, 92, 246, 0.4)" : undefined
                      }}
                      whileTap={{ scale: !isLoading ? 0.98 : 1 }}
                      disabled={!isEmailValid || !email || isLoading}
                    >
                      <span>{isLoading ? 'Processing...' : 'Join'}</span>
                      {!isLoading && (
                        <motion.div
                          className="group-hover:translate-x-1 transition-transform duration-200"
                        >
                          <ArrowRight className="h-5 w-5" />
                        </motion.div>
                      )}
                    </motion.button>
                  </form>
                ) : (
                                      <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-green-200 dark:border-green-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center"
                    >
                      <CheckCircle className="h-8 w-8 sm:h-12 sm:w-12 text-green-500 mx-auto mb-3 sm:mb-4" />
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                        Thanks for Joining! 🎉
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-2">
                        You will be getting an email confirmation shortly
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        We'll reach out to you shortly with early access details
                      </p>
                    </motion.div>
                )}
                                
                {/* Secondary action */}
                <div className="text-center lg:text-left">
                  <motion.button
                    className="group text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-300 text-sm font-medium"
                    whileHover={{ y: -2 }}
                  >
                    <span>See how it works first</span>
                    <motion.span
                      className="inline-block ml-1"
                      animate={{ y: [0, 3, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      ↓
                    </motion.span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>

            {/* Trust indicators - Apple minimal style */}

            {/* Right Side – 3D Spline Bot */}
            <AnimatePresence initial={false}>
              {isXL && (
                <motion.div
                  key="spline-hero"
                  initial={{ opacity: 0, scale: 0.9, y: 120 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 20 }}
                  transition={{ duration: 1.4, ease: 'easeOut' }}
                  className="relative top-0.7 right-0 sm:right-4 xl:right-0 transform -translate-y-1/2 z-10 lg:w-[600px] lg:h-[600px] xl:w-[900px] xl:h-[800px] pointer-events-none"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 dark:from-blue-500/10 dark:to-purple-500/10 rounded-3xl blur-3xl transition-colors duration-500"></div>

                  <Suspense
                    fallback={
                      <div className="w-full h-full flex items-center justify-center">
                        <motion.div
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                          className="w-16 h-16 border-2 border-gray-300 dark:border-white/20 rounded-full flex items-center justify-center transition-colors duration-500"
                        >
                          <div className="w-8 h-8 border-2 border-gray-900 dark:border-white border-t-transparent rounded-full animate-spin transition-colors duration-500"></div>
                        </motion.div>
                      </div>
                    }
                  >
                    <div className="relative w-full h-full rounded-3xl overflow-hidden">
                      <Spline
                        scene="https://prod.spline.design/mhtNAO3CVpiYk4zx/scene.splinecode"
                        style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
                      />
                    </div>
                  </Suspense>
                </motion.div>
              )}
            </AnimatePresence>

        
          
        </div>

        {/* Scroll indicator - Apple minimal style */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ 
              y: [0, 8, 0],
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer transition-colors duration-300"
          >
            <ChevronDown className="h-6 w-6" />
          </motion.div>
        </motion.div>
      </div>

      {/* Premium ambient lighting */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 dark:bg-blue-500/5 rounded-full blur-3xl transition-colors duration-500"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 dark:bg-purple-500/5 rounded-full blur-3xl transition-colors duration-500"></div>
    </section>
  );
};

export default LandingHeroSection; 