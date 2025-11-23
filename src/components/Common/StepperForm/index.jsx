import React, { useState, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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
import ConfirmDialog from '../ConfirmDialog';
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
 * @param {boolean} showStepConfirmation - Show confirmation dialog after each step
 * @param {string} storageKey - Optional custom storage key. If not provided, will use location.pathname
 * @param {boolean} enableLocalStorage - Enable localStorage persistence (default: true)
 */
const StepperForm = ({
  steps = [],
  onComplete,
  onCancel,
  initialData = {},
  title = 'Multi-Step Form',
  icon = null,
  stepProps = {},
  showStepConfirmation = false,
  storageKey = null,
  enableLocalStorage = true
}) => {
  const location = useLocation();
  
  // Generate storage key from pathname if not provided
  const getStorageKey = useCallback(() => {
    if (storageKey) return storageKey;
    // Use pathname as storage key, replace slashes with underscores
    return `stepperForm_${location.pathname.replace(/\//g, '_')}`;
  }, [storageKey, location.pathname]);

  // Load saved data from localStorage on mount
  const loadSavedData = useCallback(() => {
    if (!enableLocalStorage) return null;
    
    try {
      const key = getStorageKey();
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Filter out File objects (can't be serialized)
        const sanitized = Object.entries(parsed.formData || {}).reduce((acc, [key, value]) => {
          // Skip File objects - they will be lost on refresh but that's expected
          if (value instanceof File) {
            return acc;
          }
          acc[key] = value;
          return acc;
        }, {});
        return {
          formData: sanitized,
          activeStep: parsed.activeStep || 0,
          completedSteps: parsed.completedSteps ? new Set(parsed.completedSteps) : new Set()
        };
      }
    } catch (error) {
      console.error('Error loading saved form data:', error);
    }
    return null;
  }, [enableLocalStorage, getStorageKey]);

  // Save data to localStorage
  const saveData = useCallback((data, step, completed) => {
    if (!enableLocalStorage) return;
    
    try {
      const key = getStorageKey();
      // Filter out File objects before saving
      const sanitized = Object.entries(data).reduce((acc, [key, value]) => {
        if (value instanceof File) {
          // Don't save File objects - they can't be serialized
          return acc;
        }
        acc[key] = value;
        return acc;
      }, {});
      
      const toSave = {
        formData: sanitized,
        activeStep: step,
        completedSteps: Array.from(completed)
      };
      localStorage.setItem(key, JSON.stringify(toSave));
    } catch (error) {
      console.error('Error saving form data:', error);
    }
  }, [enableLocalStorage, getStorageKey]);

  // Clear saved data
  const clearSavedData = useCallback(() => {
    if (!enableLocalStorage) return;
    
    try {
      const key = getStorageKey();
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error clearing saved form data:', error);
    }
  }, [enableLocalStorage, getStorageKey]);

  // Load saved data on mount - use lazy initialization to only run once
  const savedDataOnMountRef = React.useRef(null);
  if (savedDataOnMountRef.current === null) {
    savedDataOnMountRef.current = loadSavedData();
  }
  const savedDataOnMount = savedDataOnMountRef.current;
  
  const [activeStep, setActiveStep] = useState(savedDataOnMount?.activeStep || 0);
  // Merge initialData with saved data, prioritizing initialData for critical fields like studentId
  const [formData, setFormData] = useState(() => {
    const saved = savedDataOnMount?.formData || {};
    return { ...saved, ...initialData };
  });
  const [stepErrors, setStepErrors] = useState({});
  const [completedSteps, setCompletedSteps] = useState(savedDataOnMount?.completedSteps || new Set());
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    description: '',
    onConfirm: null
  });

  const stepRefs = React.useRef({});
  // Initialize formDataRef with merged saved data and initialData
  const getInitialFormDataForRef = () => {
    const saved = savedDataOnMount?.formData || {};
    return { ...saved, ...initialData };
  };
  const formDataRef = React.useRef(getInitialFormDataForRef());
  const hasLoadedSavedData = React.useRef(false);
  
  // Load saved data on mount (only once)
  React.useEffect(() => {
    if (!hasLoadedSavedData.current && enableLocalStorage) {
      const saved = loadSavedData();
      if (saved) {
        // Merge saved data with initialData, prioritizing initialData for critical fields
        const merged = { ...saved.formData, ...initialData };
        setFormData(merged);
        setActiveStep(saved.activeStep);
        setCompletedSteps(saved.completedSteps);
        formDataRef.current = merged;
        hasLoadedSavedData.current = true;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enableLocalStorage]); // Only depend on enableLocalStorage, not loadSavedData
  
  // Update formData when initialData changes (for update scenarios)
  // Merge initialData into formData to ensure important fields like studentId are always present
  React.useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData(prev => {
        // Merge initialData with existing formData, prioritizing initialData for critical fields
        const merged = { ...prev, ...initialData };
        formDataRef.current = merged;
        return merged;
      });
    }
  }, [initialData]);
  
  // Keep ref in sync with state
  React.useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  // Save to localStorage whenever formData or activeStep changes
  // Use a ref to debounce saves and avoid saving on initial mount
  const saveTimeoutRef = React.useRef(null);
  const prevFormDataRef = React.useRef(formData);
  const prevActiveStepRef = React.useRef(activeStep);
  
  useEffect(() => {
    if (enableLocalStorage && hasLoadedSavedData.current) {
      // Only save if data actually changed (deep comparison for formData is expensive, so use ref)
      const formDataChanged = prevFormDataRef.current !== formData;
      const stepChanged = prevActiveStepRef.current !== activeStep;
      
      if (formDataChanged || stepChanged) {
        prevFormDataRef.current = formData;
        prevActiveStepRef.current = activeStep;
        
        // Debounce saves to avoid too many writes
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = setTimeout(() => {
          saveData(formData, activeStep, completedSteps);
        }, 300); // 300ms debounce
      }
      
      return () => {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, activeStep, completedSteps, enableLocalStorage]); // Remove saveData from deps
  
  // Save on unmount (beforeunload)
  React.useEffect(() => {
    const handleBeforeUnload = () => {
      if (enableLocalStorage) {
        // Use refs to get latest values
        saveData(formDataRef.current, activeStep, completedSteps);
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Final save on cleanup - use refs for latest values
      if (enableLocalStorage && saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (enableLocalStorage) {
        saveData(formDataRef.current, activeStep, completedSteps);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enableLocalStorage]); // Only depend on enableLocalStorage, use refs for values

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
      // If showStepConfirmation is enabled, show dialog before moving to next step
      if (showStepConfirmation) {
        const nextStepLabel = steps[activeStep + 1]?.label || 'bước tiếp theo';
        setConfirmDialog({
          open: true,
          title: 'Hoàn thành bước',
          description: `Bạn đã hoàn thành "${steps[activeStep]?.label}". Bạn có muốn tiếp tục đến "${nextStepLabel}" không?`,
          onConfirm: () => {
            setConfirmDialog(prev => ({ ...prev, open: false }));
            setActiveStep(activeStep + 1);
          }
        });
      } else {
        setActiveStep(activeStep + 1);
      }
    } else {
      // Last step - call onComplete and clear saved data
      clearSavedData();
      if (onComplete) {
        onComplete(formDataRef.current);
      }
    }
  }, [activeStep, steps, formData, onComplete, showStepConfirmation, clearSavedData]);

  const handleBack = useCallback((e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (activeStep === 0) {
      // Clear saved data when canceling
      clearSavedData();
      if (onCancel) {
        onCancel();
      }
      return;
    }

    setActiveStep((prev) => Math.max(prev - 1, 0));
  }, [activeStep, onCancel, clearSavedData]);

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
    <>
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
                  background: 'var(--color-secondary)',
                  color: 'var(--text-primary)',
                  boxShadow: 'var(--shadow-sm)',
                  '&:hover': {
                    background: 'var(--color-secondary-dark)',
                    boxShadow: 'var(--shadow-md)',
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

      {/* Step Confirmation Dialog */}
      {showStepConfirmation && (
        <ConfirmDialog
          open={confirmDialog.open}
          onClose={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
          onConfirm={confirmDialog.onConfirm || (() => {})}
          title={confirmDialog.title}
          description={confirmDialog.description}
          confirmText="Tiếp tục"
          cancelText="Ở lại"
          confirmColor="primary"
          showWarningIcon={false}
        />
      )}
    </>
  );
};

export default StepperForm;

