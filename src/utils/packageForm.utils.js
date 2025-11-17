export const toNumber = (value) => {
  if (value === null || value === undefined || value === '') return 0;
  const numericValue = Number(value);
  return Number.isNaN(numericValue) ? 0 : numericValue;
};

export const extractBenefitIds = (source) => {
  if (!source) return [];
  if (Array.isArray(source.benefits)) {
    return source.benefits
      .map((benefit) => benefit?.id || benefit?.benefitId)
      .filter(Boolean);
  }
  if (Array.isArray(source.benefitIds)) {
    return source.benefitIds.filter(Boolean);
  }
  if (Array.isArray(source.templateBenefits)) {
    return source.templateBenefits
      .map((item) => item?.benefitId || item?.id)
      .filter(Boolean);
  }
  return [];
};

export const normalizeBenefitIds = (benefitIds = []) =>
  Array.from(new Set((benefitIds || []).filter(Boolean).map(String)));


