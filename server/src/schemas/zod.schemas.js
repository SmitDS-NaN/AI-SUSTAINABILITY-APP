import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z.string().email({ message: "Invalid email format" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  full_name: z.string().min(2, { message: "Full name is required" }),
  org_name: z.string().min(2, { message: "Organization name is required" }),
  industry: z.string().optional().default('Manufacturing & Operations')
});

export const LoginSchema = z.object({
  email: z.string().email({ message: "Invalid email format" }),
  password: z.string().min(1, { message: "Password is required" })
});

export const UsageLogSchema = z.object({
  category: z.enum(['electricity', 'water', 'fuel', 'waste'], {
    errorMap: () => ({ message: "Category must be electricity, water, fuel, or waste" })
  }),
  quantity: z.number().positive({ message: "Quantity must be a positive number" }),
  unit: z.string().optional(),
  cost_inr: z.number().nonnegative().optional().nullable(),
  usage_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Date must be YYYY-MM-DD" }),
  notes: z.string().optional().nullable()
});

export const GoalSchema = z.object({
  target_category: z.enum(['electricity', 'water', 'fuel', 'waste', 'all']),
  reduction_percentage: z.number().min(1).max(100),
  target_date: z.string()
});

export const AIRecommendationSchema = z.object({
  recommendations: z.array(z.object({
    title: z.string(),
    description: z.string(),
    impact_co2_kg: z.number(),
    savings_inr: z.number(),
    effort_level: z.enum(['Low', 'Medium', 'High']),
    rationale: z.string().describe("Why this is recommended based on the specific data provided")
  }))
});

export const AIAnomalyExplanationSchema = z.object({
  likely_causes: z.array(z.string()),
  recommended_actions: z.array(z.string()),
  severity: z.enum(['Low', 'Medium', 'High'])
});

export const AIChatRequestSchema = z.object({
  message: z.string().min(1, "Message cannot be empty")
});
