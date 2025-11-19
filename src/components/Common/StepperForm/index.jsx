import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Paper,
  Typography
} from '@mui/material';
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import styles from './StepperForm.module.css';

/**
 * Reusable Multi-Step Form Component
 * 
 * @param {Array} steps - Array of step configurations
 *   Each step should have: { label, component: ReactComponent, validation?: function }
 * @param {Function} onComplete - Callback when all steps are completed
 * @param {Function} onCancel - Callback when user cancels
 * @param {Object} initialData - Initial form data
 * @param {string} title - Form title
 * @param {ReactNode} icon - Icon to display in header
 */
const StepperForm = ({
  steps = [],
  onComplete,
  onCancel,
  initialData = {},
  title = 'Multi-Step Form',
  icon = null,
  stepProps = {}
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState(initialData);
  const [stepErrors, setStepErrors] = useState({});
  const [completedSteps, setCompletedSteps] = useState(new Set()); // Track completed steps

  const stepRefs = React.useRef({});
  const formDataRef = React.useRef(initialData);
  
  // Update formData when initialData changes (for update scenarios)
  React.useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData(initialData);
      formDataRef.current = initialData;
    }
  }, [initialData]);
  
  // Keep ref in sync with state
  React.useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  const handleNext = useCallback(async (e) => {
    // Prevent default form submission
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    const currentStep = steps[activeStep];
    const stepRef = stepRefs.current[activeStep];
    
    // If step has a submit function (e.g., form), call it first
    // This will validate and update formData via updateData callback
    if (stepRef?.submit) {
      try {
        const submitResult = await stepRef.submit();
        if (submitResult === false) {
          // Validation or submit failed
          setStepErrors(prev => ({ ...prev, [activeStep]: true }));
          return;
        }
        // Wait a bit for state to update
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error('Step submit error:', error);
        setStepErrors(prev => ({ ...prev, [activeStep]: true }));
        return;
      }
    }
    
    // Validate current step if validation function exists
    // Note: For step 1, this will create the branch slot
    if (currentStep?.validation) {
      try {
        // Use the latest formData from ref (updated by updateData callback)
        const currentFormData = formDataRef.current;
        const result = await currentStep.validation(currentFormData);
        // Validation function should return true to proceed, false to stay
        if (result === false) {
          setStepErrors(prev => ({ ...prev, [activeStep]: true }));
          return;
        }
      } catch (error) {
        console.error('Step validation error:', error);
        setStepErrors(prev => ({ ...prev, [activeStep]: true }));
        return;
      }
    }

    // Clear error for current step
    setStepErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[activeStep];
      return newErrors;
    });

    // Mark current step as completed
    setCompletedSteps(prev => new Set([...prev, activeStep]));

    // Move to next step only if validation passed
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    } else {
      // Last step - call onComplete
      if (onComplete) {
        onComplete(formDataRef.current);
      }
    }
  }, [activeStep, steps, formData, onComplete]);

  const handleBack = useCallback((e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (activeStep === 0) {
      if (onCancel) {
        onCancel();
      }
      return;
    }

    setActiveStep((prev) => Math.max(prev - 1, 0));
  }, [activeStep, onCancel]);

  const handleBackButtonClick = useCallback(
    (e) => {
      if (activeStep === 0) {
        if (onCancel) {
          onCancel(e);
        }
        return;
      }
      handleBack(e);
    },
    [activeStep, handleBack, onCancel]
  );

  const handleStepChange = useCallback((stepIndex) => {
    // Only allow clicking on:
    // 1. Steps that are already completed (can go back)
    // 2. The next step if current step is completed
    const isStepCompleted = completedSteps.has(stepIndex);
    const isNextStep = stepIndex === activeStep + 1 && completedSteps.has(activeStep);
    const isPreviousStep = stepIndex < activeStep;
    
    if (isStepCompleted || isNextStep || isPreviousStep) {
      setActiveStep(stepIndex);
    }
  }, [activeStep, completedSteps]);

  const updateFormData = useCallback((data) => {
    setFormData(prev => {
      const newData = { ...prev, ...data };
      formDataRef.current = newData; // Update ref immediately
      return newData;
    });
  }, []);

  const CurrentStepComponent = steps[activeStep]?.component;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Box className={styles.container}>
        <Box className={styles.paper}>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Box className={styles.header}>
              {icon && (
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Box className={styles.iconContainer}>
                    {icon}
                  </Box>
                </motion.div>
              )}
              <Typography variant="h4" component="h1" className={styles.title}>
                {title}
              </Typography>
            </Box>
          </motion.div>

        {/* Stepper */}
        <Box className={styles.stepperContainer}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((step, index) => {
              const isStepCompleted = completedSteps.has(index);
              const isNextStep = index === activeStep + 1 && completedSteps.has(activeStep);
              const isPreviousStep = index < activeStep;
              const isClickable = isStepCompleted || isNextStep || isPreviousStep;
              
              return (
                <Step 
                  key={index}
                  completed={isStepCompleted}
                  error={stepErrors[index]}
                  disabled={!isClickable && index !== activeStep}
                >
                  <StepLabel
                    onClick={() => isClickable && handleStepChange(index)}
                    style={{ 
                      cursor: isClickable ? 'pointer' : 'not-allowed',
                      opacity: isClickable || index === activeStep ? 1 : 0.5
                    }}
                  >
                    {step.label}
                  </StepLabel>
                </Step>
              );
            })}
          </Stepper>
        </Box>

        {/* Step Content */}
        <Box className={styles.content}>
          <Box className={styles.scrollWrapper}>
            <AnimatePresence mode="wait">
              {CurrentStepComponent && (
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <CurrentStepComponent
                    ref={(ref) => {
                      if (ref) {
                        stepRefs.current[activeStep] = ref;
                      }
                    }}
                    data={formData}
                    updateData={updateFormData}
                    stepIndex={activeStep}
                    totalSteps={steps.length}
                    {...stepProps}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </Box>
        </Box>

        {/* Navigation Buttons */}
        <Box className={styles.actions}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              type="button"
              onClick={handleBackButtonClick}
              disabled={activeStep === 0 && !onCancel}
              startIcon={<ArrowBack />}
              size="large"
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                fontWeight: 600,
                padding: '10px 24px'
              }}
            >
              {activeStep === 0 ? (onCancel ? 'Hủy' : 'Quay lại') : 'Quay lại'}
            </Button>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              type="button"
              variant="contained"
              onClick={handleNext}
              endIcon={activeStep === steps.length - 1 ? null : <ArrowForward />}
              size="large"
              color="primary"
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                fontWeight: 600,
                padding: '10px 24px',
                background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 100%)',
                  boxShadow: '0 6px 20px rgba(99, 102, 241, 0.4)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              {activeStep === steps.length - 1 ? 'Hoàn thành' : 'Tiếp theo'}
            </Button>
          </motion.div>
        </Box>
      </Box>
    </Box>
    </motion.div>
  );
};

export default StepperForm;

