import { z } from 'zod';

export const createEventSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です').max(100),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日付の形式が正しくありません'),
  time: z.string().regex(/^\d{2}:\d{2}$/).optional().or(z.literal('')),
  type: z.enum(['regular', 'travel', 'birthday', 'school', 'outing']),
  description: z.string().max(2000).optional().or(z.literal('')),
});

export const travelPlanSchema = z.object({
  destination: z.string().min(1).max(100),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  adults: z.number().int().min(1).max(20),
  children: z.number().int().min(0).max(20),
  childAges: z.array(z.number().int().min(0).max(18)),
  preferences: z.string().max(500).optional(),
});

export const spotRecommendationSchema = z.object({
  region: z.string().min(1).max(100),
  season: z.enum(['spring', 'summer', 'autumn', 'winter']),
  childAgeMin: z.number().int().min(0).max(18),
  childAgeMax: z.number().int().min(0).max(18),
  activityType: z.enum(['outdoor', 'indoor', 'cultural', 'all']),
});
