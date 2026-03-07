export type EventType = 'regular' | 'travel' | 'birthday' | 'school' | 'outing';
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface FamilyMember {
  id: number;
  name: string;
  color: string;
  created_at: string;
}

export interface Event {
  id: number;
  title: string;
  date: string;
  time?: string;
  type: EventType;
  description?: string;
  recurrence: RecurrenceType;
  recurrence_end_date?: string;
  member_id?: number;
  member?: FamilyMember;
  created_at: string;
  photos?: Photo[];
}

export interface Photo {
  id: number;
  event_id: number;
  filename: string;
  original_name?: string;
  uploaded_at: string;
}

export interface TravelPlanRequest {
  destination: string;
  startDate: string;
  endDate: string;
  adults: number;
  children: number;
  childAges: number[];
  preferences?: string;
}

export interface TravelDaySchedule {
  time: string;
  activity: string;
  description: string;
  tips: string;
}

export interface TravelDay {
  day: number;
  date: string;
  title: string;
  schedule: TravelDaySchedule[];
}

export interface TravelPlan {
  overview: string;
  days: TravelDay[];
  tips: string[];
  budget: string;
}

export interface SpotRecommendationRequest {
  region: string;
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  childAgeMin: number;
  childAgeMax: number;
  activityType: 'outdoor' | 'indoor' | 'cultural' | 'all';
}

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  regular: '通常',
  travel: '旅行',
  birthday: '誕生日',
  school: '学校行事',
  outing: 'おでかけ',
};

export const EVENT_TYPE_COLORS: Record<EventType, string> = {
  regular: 'bg-gray-100 text-gray-700 border-gray-300',
  travel: 'bg-blue-100 text-blue-700 border-blue-300',
  birthday: 'bg-pink-100 text-pink-700 border-pink-300',
  school: 'bg-green-100 text-green-700 border-green-300',
  outing: 'bg-orange-100 text-orange-700 border-orange-300',
};

export const EVENT_TYPE_DOT_COLORS: Record<EventType, string> = {
  regular: 'bg-gray-400',
  travel: 'bg-blue-500',
  birthday: 'bg-pink-500',
  school: 'bg-green-500',
  outing: 'bg-orange-500',
};

export const RECURRENCE_LABELS: Record<RecurrenceType, string> = {
  none: '繰り返しなし',
  daily: '毎日',
  weekly: '毎週',
  monthly: '毎月',
  yearly: '毎年',
};

export const MEMBER_COLOR_OPTIONS = [
  { value: '#ef4444', label: '赤' },
  { value: '#f97316', label: 'オレンジ' },
  { value: '#eab308', label: '黄' },
  { value: '#22c55e', label: '緑' },
  { value: '#3b82f6', label: '青' },
  { value: '#8b5cf6', label: '紫' },
  { value: '#ec4899', label: 'ピンク' },
  { value: '#14b8a6', label: 'ティール' },
];
