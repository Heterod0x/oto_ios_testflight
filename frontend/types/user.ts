export interface UserProfileResponse {
  id: string;
  name: string | null;
  age: number | null;
  nationality: string | null;
  first_language: string | null;
  second_languages: string | null;
  interests: string | null;
  preferred_topics: string | null;
}

export interface PointBalanceResponse {
  user_id: string;
  points: number;
  pending_points: number;
  points_claimed: number;
}

export interface ClaimableAmountResponse {
  amount: number;
  display_amount: string;
}

export interface ClaimResponse {
  signature: string;
  success: boolean;
}

export interface UserUpdateRequest extends Partial<UserProfileResponse> {}
