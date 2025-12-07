import { z } from 'zod';

import { isTelegramHandle, isValidHttpUrl } from '../utils';

type TranslateFn = (key: string, params?: Record<string, any>) => string;

const requiredMessage = (translate: TranslateFn, attribute: string) => {
  const message = translate('validation.required', { attribute });

  if (message === 'validation.required') {
    return translate(fallbackRequiredKey, { attribute });
  }

  return message;
};

const numberPattern = /^\d+(\.\d+)?$/;
const fallbackRequiredKey = 'pages/projects.validation.required';

type SchemaOptions = {
  requireServiceFee?: boolean;
};

export const projectSchema = (translate: TranslateFn, options: SchemaOptions = {}) =>
  z.object({
    name: z.string().min(1, requiredMessage(translate, translate('validation.attributes.name'))),
    activity_type: z.string().min(1, requiredMessage(translate, translate('pages/projects.form.activity_type'))),
    description: z
      .string({ required_error: requiredMessage(translate, translate('validation.attributes.description')) })
      .min(1, requiredMessage(translate, translate('validation.attributes.description'))),
    platform: z
      .enum(['website', 'telegram_bot', 'vk_bot', 'other'])
      .or(z.literal(''))
      .refine((value) => value !== '', {
        message: translate('pages/projects.validation.platform_required'),
      }),
    project_url: z
      .string({ required_error: requiredMessage(translate, translate('pages/projects.form.project_url')) })
      .min(1, requiredMessage(translate, translate('pages/projects.form.project_url'))),
    success_url: z.string().optional().default(''),
    fail_url: z.string().optional().default(''),
    notify_url: z.string().optional().default(''),
    logo: z.union([z.instanceof(File), z.string(), z.null()]).optional().nullable(),
    token_network_ids: z.array(z.number()).min(1, translate('pages/projects.validation.tokens')),
    accept: z.literal(true, { errorMap: () => ({ message: translate('pages/projects.validation.accept') }) }),
    side_commission: z.enum(['client', 'merchant', '']).default('client'),
    side_commission_cc: z.enum(['client', 'merchant', '']).default('client'),
    auto_confirm_partial_by_amount: z
      .union([z.string(), z.number(), z.null()])
      .optional()
      .transform((val) => (val == null ? '' : String(val))),
    auto_confirm_partial_by_percent: z
      .union([z.string(), z.number(), z.null()])
      .optional()
      .transform((val) => (val == null ? '' : String(val))),
    service_fee: z
      .union([z.string(), z.number(), z.null()])
      .optional()
      .transform((val) => (val == null ? '' : String(val))),
  })
    .superRefine((data, ctx) => {
      if (data.platform === 'telegram_bot') {
        if (!isTelegramHandle(data.project_url)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['project_url'],
            message: translate('pages/projects.validation.telegram_handle'),
          });
        }
      } else if (!isValidHttpUrl(data.project_url)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['project_url'],
          message: translate('pages/projects.validation.url'),
        });
      }

      const amountValue = data.auto_confirm_partial_by_amount ?? '';
      const percentValue = data.auto_confirm_partial_by_percent ?? '';
      const amountProvided = `${amountValue}`.trim() !== '';
      const percentProvided = `${percentValue}`.trim() !== '';

      if (amountProvided && percentProvided) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['auto_confirm_partial_by_amount'],
          message: translate('pages/projects.validation.auto_confirm_exclusive'),
        });
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['auto_confirm_partial_by_percent'],
          message: translate('pages/projects.validation.auto_confirm_exclusive'),
        });
      }

      if (amountProvided && !numberPattern.test(String(amountValue).trim())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['auto_confirm_partial_by_amount'],
          message: translate('pages/projects.validation.auto_confirm_number'),
        });
      }

      if (percentProvided && !numberPattern.test(String(percentValue).trim())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['auto_confirm_partial_by_percent'],
          message: translate('pages/projects.validation.auto_confirm_number'),
        });
      }

      const serviceFeeValue = `${data.service_fee ?? ''}`.trim();
      const hasServiceFee = serviceFeeValue !== '';

      if (options.requireServiceFee && !hasServiceFee) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['service_fee'],
          message: translate('pages/projects.validation.service_fee_required'),
        });
      }

      if (hasServiceFee) {
        const feeNumber = Number(serviceFeeValue);

        if (Number.isNaN(feeNumber) || feeNumber < 0 || feeNumber > 10) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['service_fee'],
            message: translate('pages/projects.validation.service_fee_range'),
          });
        }
      }
    });

export type ProjectFormValues = z.infer<ReturnType<typeof projectSchema>>;
