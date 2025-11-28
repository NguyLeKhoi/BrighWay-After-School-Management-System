import * as yup from 'yup';

// Schema for Step 1: Basic Info only
export const packageTemplateBasicSchema = yup.object({
  name: yup
    .string()
    .required('Tên mẫu gói là bắt buộc')
    .min(3, 'Tên mẫu gói phải có ít nhất 3 ký tự')
    .max(150, 'Tên mẫu gói không được vượt quá 150 ký tự'),
  desc: yup
    .string()
    .nullable()
    .max(500, 'Mô tả không được vượt quá 500 ký tự')
});

export const packageTemplateSchema = yup.object({
  name: yup
    .string()
    .required('Tên mẫu gói là bắt buộc')
    .min(3, 'Tên mẫu gói phải có ít nhất 3 ký tự')
    .max(150, 'Tên mẫu gói không được vượt quá 150 ký tự'),
  desc: yup
    .string()
    .nullable()
    .max(500, 'Mô tả không được vượt quá 500 ký tự'),
  minPrice: yup
    .number()
    .typeError('Giá thấp nhất phải là số')
    .required('Giá thấp nhất là bắt buộc')
    .min(0, 'Giá thấp nhất không được nhỏ hơn 0'),
  maxPrice: yup
    .number()
    .typeError('Giá cao nhất phải là số')
    .required('Giá cao nhất là bắt buộc')
    .min(yup.ref('minPrice'), 'Giá cao nhất phải lớn hơn hoặc bằng giá thấp nhất'),
  defaultPrice: yup
    .number()
    .typeError('Giá mặc định phải là số')
    .required('Giá mặc định là bắt buộc')
    .min(yup.ref('minPrice'), 'Giá mặc định phải lớn hơn hoặc bằng giá thấp nhất')
    .max(yup.ref('maxPrice'), 'Giá mặc định phải nhỏ hơn hoặc bằng giá cao nhất'),
  minDurationInMonths: yup
    .number()
    .typeError('Thời hạn thấp nhất phải là số')
    .required('Thời hạn thấp nhất là bắt buộc')
    .min(1, 'Thời hạn thấp nhất phải ít nhất 1 tháng'),
  maxDurationInMonths: yup
    .number()
    .typeError('Thời hạn cao nhất phải là số')
    .required('Thời hạn cao nhất là bắt buộc')
    .min(yup.ref('minDurationInMonths'), 'Thời hạn cao nhất phải lớn hơn hoặc bằng thời hạn thấp nhất'),
  defaultDurationInMonths: yup
    .number()
    .typeError('Thời hạn mặc định phải là số')
    .required('Thời hạn mặc định là bắt buộc')
    .min(yup.ref('minDurationInMonths'), 'Thời hạn mặc định phải lớn hơn hoặc bằng thời hạn thấp nhất')
    .max(yup.ref('maxDurationInMonths'), 'Thời hạn mặc định phải nhỏ hơn hoặc bằng thời hạn cao nhất'),
  minSlots: yup
    .number()
    .typeError('Slot thấp nhất phải là số')
    .required('Slot thấp nhất là bắt buộc')
    .min(1, 'Slot thấp nhất phải ít nhất 1'),
  maxSlots: yup
    .number()
    .typeError('Slot cao nhất phải là số')
    .required('Slot cao nhất là bắt buộc')
    .min(yup.ref('minSlots'), 'Slot cao nhất phải lớn hơn hoặc bằng slot thấp nhất'),
  defaultTotalSlots: yup
    .number()
    .typeError('Slot mặc định phải là số')
    .required('Slot mặc định là bắt buộc')
    .min(yup.ref('minSlots'), 'Slot mặc định phải lớn hơn hoặc bằng slot thấp nhất')
    .max(yup.ref('maxSlots'), 'Slot mặc định phải nhỏ hơn hoặc bằng slot cao nhất')
});

export const packageSchema = yup.object({
  name: yup
    .string()
    .required('Tên gói là bắt buộc')
    .min(3, 'Tên gói phải có ít nhất 3 ký tự')
    .max(150, 'Tên gói không được vượt quá 150 ký tự'),
  desc: yup
    .string()
    .nullable()
    .max(500, 'Mô tả không được vượt quá 500 ký tự'),
  price: yup
    .number()
    .typeError('Giá phải là số')
    .required('Giá là bắt buộc')
    .min(0, 'Giá không được nhỏ hơn 0'),
  durationInMonths: yup
    .number()
    .typeError('Thời hạn phải là số')
    .required('Thời hạn là bắt buộc')
    .min(1, 'Thời hạn phải ít nhất 1 tháng'),
  totalSlots: yup
    .number()
    .typeError('Slot phải là số')
    .required('Slot là bắt buộc')
    .min(1, 'Slot phải ít nhất là 1'),
  packageTemplateId: yup
    .string()
    .required('Vui lòng chọn mẫu gói'),
  branchId: yup
    .string()
    .required('Vui lòng chọn chi nhánh'),
  studentLevelId: yup
    .string()
    .required('Vui lòng chọn cấp độ học sinh'),
  isActive: yup.boolean().required()
});

const applyRange = (schema, minValue, maxValue, unitLabel) => {
  let next = schema;
  if (minValue !== null && minValue !== undefined) {
    next = next.min(minValue, `Giá trị phải lớn hơn hoặc bằng ${minValue}${unitLabel}`);
  }
  if (maxValue !== null && maxValue !== undefined) {
    next = next.max(maxValue, `Giá trị phải nhỏ hơn hoặc bằng ${maxValue}${unitLabel}`);
  }
  return next;
};

export const managerBranchPackageSchema = (template) => {
  const priceMin = template?.minPrice ?? null;
  const priceMax = template?.maxPrice ?? null;
  const durationMin = template?.minDurationInMonths ?? null;
  const durationMax = template?.maxDurationInMonths ?? null;
  const slotMin = template?.minSlots ?? null;
  const slotMax = template?.maxSlots ?? null;

  return yup.object({
    name: yup
      .string()
      .required('Tên gói là bắt buộc')
      .min(3, 'Tên gói phải có ít nhất 3 ký tự')
      .max(150, 'Tên gói không được vượt quá 150 ký tự'),
    desc: yup
      .string()
      .nullable()
      .max(500, 'Mô tả không được vượt quá 500 ký tự'),
    price: applyRange(
      yup
        .number()
        .typeError('Giá phải là số')
        .required('Giá là bắt buộc'),
      priceMin,
      priceMax,
      ' VNĐ'
    ),
    durationInMonths: applyRange(
      yup
        .number()
        .typeError('Thời hạn phải là số')
        .required('Thời hạn là bắt buộc'),
      durationMin,
      durationMax,
      ' tháng'
    ),
    totalSlots: applyRange(
      yup
        .number()
        .typeError('Slot phải là số')
        .required('Slot là bắt buộc'),
      slotMin,
      slotMax,
      ''
    ),
    packageTemplateId: yup.mixed().nullable(),
    studentLevelId: yup
      .string()
      .required('Vui lòng chọn cấp độ học sinh'),
    isActive: yup.boolean().required()
  });
};

// Schema for Step 1: Basic Info only
export const packageStep1BasicSchema = yup.object({
  name: yup
    .string()
    .required('Tên gói là bắt buộc')
    .min(3, 'Tên gói phải có ít nhất 3 ký tự')
    .max(150, 'Tên gói không được vượt quá 150 ký tự'),
  desc: yup
    .string()
    .nullable()
    .max(500, 'Mô tả không được vượt quá 500 ký tự'),
  packageTemplateId: yup
    .string()
    .required('Vui lòng chọn mẫu gói'),
  isActive: yup.boolean().required()
});

// Schema for Step 2: Associations only (packageTemplateId already selected in Step 1)
export const packageStep2AssociationsSchema = yup.object({
  branchId: yup
    .string()
    .required('Vui lòng chọn chi nhánh'),
  studentLevelId: yup
    .string()
    .required('Vui lòng chọn cấp độ học sinh')
});

// Schema for Step 3: Pricing & Slots only
export const packageStep3PricingSchema = yup.object({
  price: yup
    .number()
    .typeError('Giá phải là số')
    .required('Giá là bắt buộc')
    .min(0, 'Giá không được nhỏ hơn 0'),
  durationInMonths: yup
    .number()
    .typeError('Thời hạn phải là số')
    .required('Thời hạn là bắt buộc')
    .min(1, 'Thời hạn phải ít nhất 1 tháng'),
  totalSlots: yup
    .number()
    .typeError('Slot phải là số')
    .required('Slot là bắt buộc')
    .min(1, 'Slot phải ít nhất là 1')
});

export const packageStepGeneralSchema = yup.object({
  name: yup
    .string()
    .required('Tên gói là bắt buộc')
    .min(3, 'Tên gói phải có ít nhất 3 ký tự')
    .max(150, 'Tên gói không được vượt quá 150 ký tự'),
  desc: yup
    .string()
    .nullable()
    .max(500, 'Mô tả không được vượt quá 500 ký tự'),
  studentLevelId: yup
    .string()
    .required('Vui lòng chọn cấp độ học sinh'),
  isActive: yup.boolean().required()
});

export const packageStepPricingSchema = (template) => {
  const priceMin = template?.minPrice ?? null;
  const priceMax = template?.maxPrice ?? null;
  const durationMin = template?.minDurationInMonths ?? null;
  const durationMax = template?.maxDurationInMonths ?? null;
  const slotMin = template?.minSlots ?? null;
  const slotMax = template?.maxSlots ?? null;

  return yup.object({
    price: applyRange(
      yup
        .number()
        .typeError('Giá phải là số')
        .required('Giá là bắt buộc'),
      priceMin,
      priceMax,
      ' VNĐ'
    ),
    durationInMonths: applyRange(
      yup
        .number()
        .typeError('Thời hạn phải là số')
        .required('Thời hạn là bắt buộc'),
      durationMin,
      durationMax,
      ' tháng'
    ),
    totalSlots: applyRange(
      yup
        .number()
        .typeError('Slot phải là số')
        .required('Slot là bắt buộc'),
      slotMin,
      slotMax,
      ''
    )
  });
};

export const packageStep3Schema = yup.object({
  benefitIds: yup
    .array()
    .of(yup.string())
    .min(1, 'Vui lòng chọn ít nhất 1 lợi ích')
});

