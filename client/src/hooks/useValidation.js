'use client';

import { useState, useCallback } from 'react';

export function useValidation() {
  const [errors, setErrors] = useState({});

  const validateField = useCallback((name, value, rules = {}) => {
    let error = null;

    if (rules.required && (!value || value.toString().trim() === '')) {
      error = rules.requiredMsg || 'This field is required';
    } else if (rules.maxLength && value && value.length > rules.maxLength) {
      error = `Maximum ${rules.maxLength} characters`;
    } else if (rules.min !== undefined && Number(value) < rules.min) {
      error = `Must be at least ${rules.min}`;
    } else if (rules.max !== undefined && Number(value) > rules.max) {
      error = `Must be at most ${rules.max}`;
    } else if (rules.integer && value && !Number.isInteger(Number(value))) {
      error = 'Must be a whole number';
    } else if (rules.notEqual && value === rules.notEqual.value) {
      error = rules.notEqual.msg || 'Values must be different';
    } else if (rules.noDuplicate && rules.noDuplicate.list) {
      const exists = rules.noDuplicate.list.some(
        (item) => item.toLowerCase() === (value || '').toLowerCase()
      );
      if (exists) error = rules.noDuplicate.msg || 'Already exists';
    }

    setErrors((prev) => {
      if (error) return { ...prev, [name]: error };
      const next = { ...prev };
      delete next[name];
      return next;
    });

    return error;
  }, []);

  const validateTournament = useCallback(
    (value) =>
      validateField('tournament', value, {
        required: true,
        requiredMsg: 'Tournament name is required',
        maxLength: 200,
      }),
    [validateField]
  );

  const validateTotalOvers = useCallback(
    (value) =>
      validateField('totalOvers', value, {
        required: true,
        requiredMsg: 'Total overs is required',
        integer: true,
        min: 1,
        max: 50,
      }),
    [validateField]
  );

  const validateTarget = useCallback(
    (value) =>
      validateField('target', value, {
        integer: true,
        min: 0,
      }),
    [validateField]
  );

  const validateStrikerNotSame = useCallback(
    (striker, nonStriker) => {
      if (striker && nonStriker && striker === nonStriker) {
        setErrors((prev) => ({
          ...prev,
          striker: 'Striker and non-striker cannot be the same',
          nonStriker: 'Striker and non-striker cannot be the same',
        }));
        return 'Striker and non-striker cannot be the same';
      }
      setErrors((prev) => {
        const next = { ...prev };
        delete next.striker;
        delete next.nonStriker;
        return next;
      });
      return null;
    },
    []
  );

  const validateTeamName = useCallback(
    (value) =>
      validateField('teamName', value, {
        required: true,
        requiredMsg: 'Team name is required',
        maxLength: 100,
      }),
    [validateField]
  );

  const validatePlayerName = useCallback(
    (value, existingPlayers) =>
      validateField('playerName', value, {
        required: true,
        requiredMsg: 'Player name is required',
        maxLength: 100,
        noDuplicate: {
          list: existingPlayers || [],
          msg: 'Player already exists in this team',
        },
      }),
    [validateField]
  );

  const clearError = useCallback((name) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  const hasErrors = Object.keys(errors).length > 0;

  return {
    errors,
    hasErrors,
    validateField,
    validateTournament,
    validateTotalOvers,
    validateTarget,
    validateStrikerNotSame,
    validateTeamName,
    validatePlayerName,
    clearError,
    clearAllErrors,
  };
}
