export type FeatureErrorCode =
  | 'NAME_REQUIRED'
  | 'UNKNOWN_PROPERTY'
  | 'NAME_STRING_TYPE_REQUIRED'
  | 'STORY_REQUIRED'
  | 'SPECS_REQUIRED'
  | 'PAGES_REQUIRED'
  | 'STORY_AS_ROLE_NOT_FOUND'

export interface FeatureErrorData {
  property?: string
  feature?: string
  role?: string
}

export class FeatureError extends Error {
  public code: string

  constructor(
    public message: FeatureErrorCode,
    public data?: FeatureErrorData
  ) {
    super(message)
    this.name = 'FEATURE_ERROR'
    this.code = this.name + '_' + message
  }
}
