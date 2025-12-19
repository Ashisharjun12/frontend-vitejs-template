import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSession } from '../../../lib/auth-client';
import { useNavigate } from 'react-router-dom';

const Pricing = () => {
  const { data: session } = useSession();
  const navigate = useNavigate();

  const pricingPlans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for getting started',
      features: [
        '1 Frontend Project',
        '1 Backend Project',
        '100 GB Bandwidth',
        'Basic SSL',
        'Community Support',
        'GitHub Deploy',
      ],
      cta: 'Get Started',
      popular: false,
      accent: 'slate',
    },
    {
      name: 'Basic',
      price: '$9',
      period: 'per month',
      description: 'For developers & small teams',
      features: [
        '5 Frontend Projects',
        '5 Backend Projects',
        '500 GB Bandwidth',
        'Free SSL',
        'Email Support',
        'Advanced Analytics',
        'Environment Variables',
        'Preview Deployments',
      ],
      cta: 'Start Free Trial',
      popular: true,
      accent: 'blue',
    },
    {
      name: 'Pro',
      price: '$29',
      period: 'per month',
      description: 'For teams & production',
      features: [
        'Unlimited Projects',
        '2 TB Bandwidth',
        'Priority Support',
        'GitHub/GitLab Deploy',
        'Team Collaboration',
        'CI/CD Integration',
        'Docker Support',
        'Database Backups',
      ],
      cta: 'Go Pro',
      popular: false,
      accent: 'purple',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  const handleCtaClick = (planName) => {
    if (session) {
      navigate('/workspace');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="w-full py-16 bg-background">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="text-center mb-12"
        >
          <motion.h2
            variants={cardVariants}
            className="text-3xl md:text-4xl font-bold mb-3"
          >
            Simple, Transparent Pricing
          </motion.h2>
          <motion.p
            variants={cardVariants}
            className="text-base text-muted-foreground max-w-2xl mx-auto"
          >
            Choose the perfect plan for your deployment needs. Start free and scale as you grow.
          </motion.p>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.name}
              variants={cardVariants}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <span className="px-3 py-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-[10px] font-semibold rounded-full shadow-lg">
                    Popular
                  </span>
                </div>
              )}
              <Card
                className={`h-full flex flex-col transition-all duration-300 rounded-3xl cursor-pointer ${
                  plan.popular
                    ? 'border-2 border-blue-500/50 shadow-lg shadow-blue-500/10 bg-card'
                    : 'border-border/30 hover:border-border/50 hover:shadow-md bg-card'
                }`}
              >
                <CardHeader className="pb-4 pt-6 px-5">
                  <CardTitle className="text-xl font-bold mb-1">{plan.name}</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mb-3">
                    {plan.description}
                  </CardDescription>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground text-xs">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col px-5 pb-5">
                  <ul className="space-y-2 mb-6 flex-1">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check
                          className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                            plan.popular ? 'text-blue-500' : 'text-primary'
                          }`}
                        />
                        <span className="text-xs text-foreground leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    onClick={() => handleCtaClick(plan.name)}
                    className={`w-full rounded-full h-10 text-sm font-medium cursor-pointer ${
                      plan.popular
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
                        : 'bg-foreground text-background hover:bg-foreground/90'
                    }`}
                    variant={plan.popular ? 'default' : 'default'}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer Note */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={cardVariants}
          className="text-center mt-10"
        >
          <p className="text-xs text-muted-foreground">
            All plans include automatic deployments, instant rollbacks, and 99.9% uptime SLA.{' '}
            <a href="#" className="text-primary hover:underline">
              Learn more
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Pricing;

