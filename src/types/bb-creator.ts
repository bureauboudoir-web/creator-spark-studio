export interface BBCreator {
  creator_id: string;
  name: string;
  email: string;
  profile_photo_url: string | null;
  creator_status: string;
}

export interface BBCreatorResponse {
  success: boolean;
  data: BBCreator[];
  error: string | null;
}
