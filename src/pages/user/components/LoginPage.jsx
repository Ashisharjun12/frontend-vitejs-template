import React from 'react';
import { motion } from 'framer-motion';
import { FaGithub } from 'react-icons/fa';
import googleIcon from '@/assets/google.png';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { signIn, useSession } from '../../../lib/auth-client';

export default function LoginPage() {
  const { data: session, isPending } = useSession();

  const handleGoogleSignIn = () => {
    signIn.social({
      provider: 'google',
      callbackURL: window.location.origin
    });
  };

  const handleGithubSignIn = () => {
    signIn.social({
      provider: 'github',
      callbackURL: window.location.origin
    });
  };

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-9 w-24 animate-pulse rounded-full bg-muted" />
      </div>
    );
  }

  if (session) {
    return <Navigate to="/" replace />;
  }

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.96, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.2,
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.2,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md"
      >
        <Card className="rounded-3xl border-border/40 overflow-hidden">
          <CardHeader className="p-8 pb-6">
            <motion.div variants={itemVariants}>
              <CardTitle className="text-2xl font-semibold text-center tracking-tight">
                Welcome to Deploy
              </CardTitle>
            </motion.div>
            <motion.div variants={itemVariants}>
              <CardDescription className="text-center text-sm text-muted-foreground">
                Sign in to your account to continue
              </CardDescription>
            </motion.div>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            <div className="flex flex-col gap-4">
              <motion.div variants={itemVariants}>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleGoogleSignIn}
                  className="w-full h-12 rounded-full border-border/50 hover:bg-accent/50 transition-all duration-200 text-base"
                >
                  <motion.div
                    className="flex items-center justify-center gap-3 w-full"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <img src={googleIcon} alt="Google" className="h-6 w-6" />
                    <span className="font-medium">Continue with Google</span>
                  </motion.div>
                </Button>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleGithubSignIn}
                  className="w-full h-12 rounded-full border-border/50 hover:bg-accent/50 transition-all duration-200 text-base"
                >
                  <motion.div
                    className="flex items-center justify-center gap-3 w-full"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FaGithub className="h-6 w-6" />
                    <span className="font-medium">Continue with GitHub</span>
                  </motion.div>
                </Button>
              </motion.div>
            </div>

            <motion.div
              variants={itemVariants}
              className="mt-6 text-center"
            >
              <p className="text-xs text-muted-foreground leading-relaxed">
                By continuing, you agree to our{' '}
                <a href="#" className="underline underline-offset-4 hover:text-foreground transition-colors">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="underline underline-offset-4 hover:text-foreground transition-colors">
                  Privacy Policy
                </a>
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
