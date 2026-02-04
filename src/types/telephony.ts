// Telephony Provider Types

export type TelephonyProviderType = 'twilio' | 'sip' | 'pbx' | 'mock';

export interface TelephonyProvider {
  id: string;
  business_id: string;
  provider_type: TelephonyProviderType;
  display_name: string;
  config: Record<string, unknown>;
  is_active: boolean;
  is_default: boolean;
  webhook_mode?: 'http' | 'ami' | 'both';
  created_at: string;
  updated_at: string;
}

export interface BusinessPhoneNumber {
  id: string;
  business_id: string;
  provider_id: string;
  phone_number: string;
  display_name: string | null;
  is_default: boolean;
  capabilities: ('inbound' | 'outbound')[];
  external_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CallEvent {
  id: string;
  call_queue_id: string | null;
  call_history_id: string | null;
  business_id: string;
  provider_type: TelephonyProviderType;
  event_type: string;
  event_data: Record<string, unknown>;
  external_call_id: string | null;
  error_code: string | null;
  error_message: string | null;
  created_at: string;
}

export interface CallResult {
  success: boolean;
  externalCallId?: string;
  error?: string;
  errorCode?: string;
  retryable?: boolean;
}

export interface NormalizedCallEvent {
  eventType: 'incoming' | 'ringing' | 'answered' | 'hold' | 'transfer' | 'ended' | 'recording' | 'failed';
  externalCallId: string;
  callerPhone: string;
  calledNumber: string;
  status: string;
  duration?: number;
  recordingUrl?: string;
  originalData: unknown;
}

// Extended call queue item with provider info
export interface CallQueueItemWithProvider {
  id: string;
  business_id: string;
  caller_phone: string;
  caller_name: string | null;
  caller_address: string | null;
  external_call_id: string | null;
  twilio_call_sid: string | null; // Legacy, deprecated
  provider_type: TelephonyProviderType;
  phone_number_id: string | null;
  original_caller_id: string | null;
  status: 'ringing' | 'queued' | 'answered' | 'on_hold' | 'transferred' | 'completed' | 'missed' | 'abandoned' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  call_type: 'sales' | 'support' | 'appointment' | 'complaint' | 'general' | 'internal';
  answered_by: string | null;
  answered_at: string | null;
  transferred_to: string | null;
  transferred_at: string | null;
  completed_at: string | null;
  queue_position: number | null;
  wait_time_seconds: number | null;
  created_at: string;
  updated_at: string;
}

// Extended call history item with provider info
export interface CallHistoryItemWithProvider {
  id: string;
  business_id: string;
  caller_phone: string;
  caller_name: string | null;
  callee_phone: string | null;
  call_type: string;
  direction: 'inbound' | 'outbound' | 'internal';
  status: string;
  duration_seconds: number;
  recording_url: string | null;
  recording_duration_seconds: number | null;
  handled_by: string | null;
  notes: string | null;
  outcome: string | null;
  provider_type: TelephonyProviderType;
  external_call_id: string | null;
  phone_number_id: string | null;
  original_caller_id: string | null;
  created_at: string;
}

// Provider configuration schemas
export interface TwilioConfig {
  accountSid?: string; // Reference to secret
  authToken?: string; // Reference to secret
  apiKey?: string; // Reference to secret
  apiSecret?: string; // Reference to secret
  webhookBaseUrl?: string;
  recordCalls?: boolean;
  transcribeCalls?: boolean;
}

export interface SipPbxConfig {
  sipServer?: string;
  sipPort?: number;
  transport?: 'udp' | 'tcp' | 'tls';
  realm?: string;
  authMethod?: 'digest' | 'ip-based';
  webhookMode?: 'http' | 'ami' | 'both';
  amiHost?: string;
  amiPort?: number;
  amiUsername?: string; // Reference to secret
  amiPassword?: string; // Reference to secret
  recordingsPath?: string;
  recordingsBaseUrl?: string;
}
