import { z } from 'zod';

type TranslateFn = (key: string, params?: Record<string, any>) => string;

const requiredMessage = (translate: TranslateFn, attribute: string) =>
  translate('validation.required', { attribute });

export const projectSchema = (translate: TranslateFn) =>
  z.object({
    name: z.string().min(1, requiredMessage(translate, translate('validation.attributes.name'))),
    activity_type: z.string().min(1, requiredMessage(translate, translate('pages/projects.form.activity_type'))),
    description: z
      .string({ required_error: requiredMessage(translate, translate('validation.attributes.description')) })
      .min(1, requiredMessage(translate, translate('validation.attributes.description'))),
    platform: z.enum(['website', 'telegram_bot', 'vk_bot', 'other']),
    project_url: z
      .string({ required_error: requiredMessage(translate, translate('pages/projects.form.project_url')) })
      .min(1, requiredMessage(translate, translate('pages/projects.form.project_url'))),
    success_url: z.string().optional().default(''),
    fail_url: z.string().optional().default(''),
    notify_url: z.string().optional().default(''),
    logo: z.union([z.instanceof(File), z.string(), z.null()]).optional().nullable(),
    token_network_ids: z.array(z.number()).min(1, translate('pages/projects.validation.tokens')),
    accept: z.literal(true, { errorMap: () => ({ message: translate('pages/projects.validation.accept') }) }),
  });

export type ProjectFormValues = z.infer<ReturnType<typeof projectSchema>>;
