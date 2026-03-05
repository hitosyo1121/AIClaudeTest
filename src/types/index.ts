export type EventType = 'regular' | 'travel' | 'birthday' | 'school' | 'outing';

export interface Event {
  id: number;
  title: string;
  date: string;
  time?: string;
  type: EventType;
  description?: string;
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
