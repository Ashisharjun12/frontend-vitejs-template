import React from 'react';
import { motion } from 'framer-motion';
import DeployFlow from './DeployFlow';

const MISection = () => {

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <div className="w-full py-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Top Heading */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={itemVariants}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            How Deploy Helps You
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Streamline your deployment process and solve common development challenges with our powerful platform.
          </p>
        </motion.div>

        {/* DeployFlow Component - Full Width */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={itemVariants}
          className="w-full max-w-7xl mx-auto"
        >
          <DeployFlow />
        </motion.div>
      </div>
    </div>
  );
};

export default MISection;

