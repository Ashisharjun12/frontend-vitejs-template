import React from 'react';
import { motion } from 'framer-motion';
import { FaGithub } from 'react-icons/fa';
import googleIcon from '@/assets/google.png';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { signIn } from '@/lib/auth-client';

const LoginDialog = ({ open, onOpenChange }) => {
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden rounded-3xl">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="p-8"
        >
          <DialogHeader className="space-y-2 pb-6">
            <motion.div variants={itemVariants}>
              <DialogTitle className="text-2xl font-bold text-center tracking-tight">
                Welcome to Deploy
              </DialogTitle>
            </motion.div>
            <motion.div variants={itemVariants}>
              <DialogDescription className="text-center text-sm text-muted-foreground">
                Sign in to your account to continue
              </DialogDescription>
            </motion.div>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            <motion.div variants={itemVariants}>
              <Button
                variant="outline"
                size="lg"
                onClick={handleGoogleSignIn}
                className="w-full h-12 rounded-full border-border/30 hover:bg-accent/30 hover:border-border/50 transition-all duration-200 text-sm font-medium bg-background"
              >
                <motion.div
                  className="flex items-center justify-center gap-3 w-full"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <img src={googleIcon} alt="Google" className="h-5 w-5" />
                  <span>Continue with Google</span>
                </motion.div>
              </Button>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Button
                variant="outline"
                size="lg"
                onClick={handleGithubSignIn}
                className="w-full h-12 rounded-full border-border/30 hover:bg-accent/30 hover:border-border/50 transition-all duration-200 text-sm font-medium bg-background"
              >
                <motion.div
                  className="flex items-center justify-center gap-3 w-full"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <FaGithub className="h-5 w-5" />
                  <span>Continue with GitHub</span>
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
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog;

