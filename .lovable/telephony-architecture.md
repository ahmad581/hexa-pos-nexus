# Telephony Provider Abstraction Architecture

## Executive Summary

This document outlines the architecture for refactoring the existing Twilio-based Call Center into a **provider-agnostic system** that supports multiple telephony providers including cloud services (Twilio) and local/on-prem systems (SIP/PBX via Asterisk).

## Goals

1. **Provider Independence**: Core call center logic should not be coupled to any specific provider
2. **Backward Compatibility**: Existing Twilio functionality must remain fully operational
3. **Unified Agent Experience**: Agents use a single UI regardless of provider
4. **Multi-Provider Support**: Businesses can use cloud, local, or hybrid telephony
5. **Extensibility**: New providers can be added without core refactoring

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (React)                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐  ┌─────────────────┐   │
│  │ CallCenter  │  │ CallQueue    │  │ Softphone   │  │ NumberSelector  │   │
│  │   Page      │  │   Card       │  │  Widget     │  │   Dialog        │   │
│  └─────────────┘  └──────────────┘  └─────────────┘  └─────────────────┘   │
│                              │                                              │
│                    ┌─────────┴─────────┐                                   │
│                    │  useCallCenter    │ (Provider-agnostic hook)          │
│                    │  useTelephony     │ (WebRTC/SIP client)               │
│                    └───────────────────┘                                   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        EDGE FUNCTIONS (Deno)                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                    telephony-gateway/index.ts                          │ │
│  │  ┌──────────────────────────────────────────────────────────────────┐  │ │
│  │  │                  TelephonyProviderFactory                        │  │ │
│  │  │  - getProvider(providerType) → ITelephonyProvider                │  │ │
│  │  └──────────────────────────────────────────────────────────────────┘  │ │
│  │                              │                                          │ │
│  │    ┌─────────────────────────┴─────────────────────────┐               │ │
│  │    ▼                         ▼                         ▼               │ │
│  │  ┌──────────────┐  ┌──────────────────┐  ┌───────────────────────┐    │ │
│  │  │TwilioProvider│  │ SipPbxProvider   │  │ MockProvider (dev)    │    │ │
│  │  │              │  │                  │  │                       │    │ │
│  │  │- initiateCall│  │- initiateCall    │  │- initiateCall         │    │ │
│  │  │- answerCall  │  │- answerCall      │  │- answerCall           │    │ │
│  │  │- holdCall    │  │- holdCall        │  │- holdCall             │    │ │
│  │  │- transferCall│  │- transferCall    │  │- transferCall         │    │ │
│  │  │- endCall     │  │- endCall         │  │- endCall              │    │ │
│  │  │- getRecording│  │- getRecording    │  │- getRecording         │    │ │
│  │  └──────────────┘  └──────────────────┘  └───────────────────────┘    │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐ │
│  │ twilio-webhook  │  │ sip-webhook     │  │ telephony-actions           │ │
│  │ (Twilio events) │  │ (PBX events)    │  │ (Unified agent actions)     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          DATABASE (PostgreSQL)                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────┐  ┌─────────────────────────────────────────────┐   │
│  │ telephony_providers│  │ business_phone_numbers                      │   │
│  │                    │  │                                             │   │
│  │ - id               │  │ - id                                        │   │
│  │ - business_id      │  │ - business_id                               │   │
│  │ - provider_type    │  │ - provider_id (FK → telephony_providers)    │   │
│  │   (twilio|sip|...) │  │ - phone_number                              │   │
│  │ - config (JSONB)   │  │ - display_name                              │   │
│  │ - is_active        │  │ - is_default                                │   │
│  │ - created_at       │  │ - capabilities (inbound/outbound/both)     │   │
│  └────────────────────┘  │ - external_id (provider-specific ID)        │   │
│                          │ - is_active                                  │   │
│                          └─────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ call_queue (UPDATED)                                                 │   │
│  │                                                                       │   │
│  │ + provider_type: text          -- 'twilio' | 'sip' | 'pbx'          │   │
│  │ + external_call_id: text       -- Provider-specific call ID          │   │
│  │ + phone_number_id: uuid        -- FK → business_phone_numbers        │   │
│  │ + original_caller_id: text     -- Preserved caller ID                │   │
│  │ - twilio_call_sid: text        -- DEPRECATED (use external_call_id)  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ call_history (UPDATED)                                               │   │
│  │                                                                       │   │
│  │ + provider_type: text          -- 'twilio' | 'sip' | 'pbx'          │   │
│  │ + external_call_id: text       -- Provider-specific call ID          │   │
│  │ + phone_number_id: uuid        -- FK → business_phone_numbers        │   │
│  │ + original_caller_id: text     -- Preserved caller ID                │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ call_events (NEW - Unified event log)                                │   │
│  │                                                                       │   │
│  │ - id: uuid                                                           │   │
│  │ - call_queue_id: uuid (FK)                                           │   │
│  │ - event_type: text ('ringing'|'answered'|'hold'|'transfer'|'ended') │   │
│  │ - event_data: jsonb (provider-specific raw data)                     │   │
│  │ - provider_type: text                                                │   │
│  │ - created_at: timestamptz                                            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Call Routing Responsibility

- **Agent assignment**, **queues**, **skills**, **business hours**, and **overflow logic** are handled by the **Call Center Core**.
- Telephony providers are **execution-only** — they connect, route, and manage media but do not make routing decisions.
- The Call Center Core determines which agent receives a call; the provider simply bridges the connection.

---

## Deployment Models

Supported deployment models:

| Model | Description |
|-------|-------------|
| **Platform-hosted PBX** | Shared or isolated PBX infrastructure managed by the platform |
| **Customer-hosted PBX** | On-prem or cloud-hosted PBX managed by the customer (Asterisk, FreePBX, etc.) |
| **Hybrid** | Combination of cloud provider (e.g., Twilio) + local PBX for different use cases |

Each `telephony_providers` record represents **one isolated integration endpoint**. A business may have:
- Multiple providers of the same type (e.g., two SIP trunks for different regions)
- Mixed providers (e.g., Twilio for outbound, SIP for inbound)

---

## Media Handling Strategy

| Provider Type | Signaling | Media |
|---------------|-----------|-------|
| **Cloud (Twilio)** | Handled by provider | Handled by provider |
| **SIP/PBX** | Handled by provider | Handled by PBX |
| **WebRTC Agents** | Via gateway | Requires WebRTC-to-SIP bridge |

**Key considerations:**
- Cloud providers (Twilio) handle both signaling and media end-to-end
- SIP/PBX providers handle signaling only; media flows through the PBX
- Browser-based agents using WebRTC require a **WebRTC-to-SIP gateway** (e.g., Ovislink, Obi, Obi200, or sipjs/FreeSWITCH bridges)
- Audio quality and latency are provider-dependent; the abstraction layer does not normalize media

---

## Failure Handling

| Scenario | Behavior |
|----------|----------|
| **Provider timeout** | Normalized to `CallStatus = 'failed'` with error metadata |
| **Provider rejection** | Normalized to `CallStatus = 'failed'` with rejection reason |
| **Network issues** | Retry per provider-specific rules; surfaced uniformly via `call_events` |
| **Recording failure** | Call continues; recording marked as unavailable |

**Retry Rules:**
- Retry logic is **provider-specific** (e.g., Twilio has built-in retry; SIP may need custom retry)
- All retry attempts are logged to `call_events` for debugging
- **No automatic cross-provider failover** unless explicitly configured per business
- Failover configuration (if enabled) is stored in `telephony_providers.config`

**Error Normalization:**
```typescript
interface CallError {
  code: string;           // Normalized error code (e.g., 'TIMEOUT', 'REJECTED', 'UNAVAILABLE')
  message: string;        // Human-readable message
  providerCode?: string;  // Original provider error code
  providerMessage?: string; // Original provider error message
  retryable: boolean;     // Whether the operation can be retried
}
```

---

## Provider Interface

### ITelephonyProvider

```typescript
interface ITelephonyProvider {
  // Provider identification
  readonly type: TelephonyProviderType;
  
  // Call lifecycle
  initiateCall(params: InitiateCallParams): Promise<CallResult>;
  answerCall(callId: string, agentId: string): Promise<CallResult>;
  holdCall(callId: string): Promise<CallResult>;
  resumeCall(callId: string): Promise<CallResult>;
  transferCall(callId: string, targetExtension: string): Promise<CallResult>;
  endCall(callId: string, reason?: string): Promise<CallResult>;
  
  // Media & recordings
  startRecording(callId: string): Promise<RecordingResult>;
  stopRecording(callId: string): Promise<RecordingResult>;
  getRecordingUrl(recordingId: string): Promise<string | null>;
  
  // Webhook event handling
  parseWebhookEvent(request: Request): Promise<NormalizedCallEvent>;
  generateCallResponse(event: NormalizedCallEvent): Response;
  
  // Configuration
  validateConfig(config: ProviderConfig): Promise<boolean>;
}
```

### Type Definitions

```typescript
type TelephonyProviderType = 'twilio' | 'sip' | 'pbx' | 'mock';

interface InitiateCallParams {
  fromNumber: string;
  toNumber: string;
  businessId: string;
  agentId: string;
  metadata?: Record<string, string>;
}

interface CallResult {
  success: boolean;
  externalCallId?: string;
  error?: string;
}

interface NormalizedCallEvent {
  eventType: 'incoming' | 'ringing' | 'answered' | 'hold' | 'transfer' | 'ended' | 'recording';
  externalCallId: string;
  callerPhone: string;
  calledNumber: string;
  status: CallStatus;
  duration?: number;
  recordingUrl?: string;
  originalData: unknown; // Raw provider data for debugging
}

type CallStatus = 'ringing' | 'queued' | 'answered' | 'on_hold' | 'transferred' | 'completed' | 'missed' | 'abandoned' | 'failed';
```

---

## Database Schema Changes

### New Tables

```sql
-- Telephony provider configurations per business
CREATE TABLE public.telephony_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES custom_businesses(id) ON DELETE CASCADE,
  provider_type TEXT NOT NULL CHECK (provider_type IN ('twilio', 'sip', 'pbx', 'mock')),
  display_name TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(business_id, provider_type, display_name)
);

-- Multiple phone numbers per business with provider association
CREATE TABLE public.business_phone_numbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES custom_businesses(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES telephony_providers(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  display_name TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  capabilities TEXT[] NOT NULL DEFAULT ARRAY['inbound', 'outbound'],
  external_id TEXT, -- Provider-specific ID (Twilio SID, SIP trunk ID, etc.)
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(business_id, phone_number)
);

-- Unified call event log for debugging and analytics
CREATE TABLE public.call_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_queue_id UUID REFERENCES call_queue(id) ON DELETE SET NULL,
  call_history_id UUID REFERENCES call_history(id) ON DELETE SET NULL,
  business_id UUID NOT NULL REFERENCES custom_businesses(id) ON DELETE CASCADE,
  provider_type TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL DEFAULT '{}',
  external_call_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Schema Modifications

```sql
-- Add provider-agnostic columns to call_queue
ALTER TABLE public.call_queue
  ADD COLUMN IF NOT EXISTS provider_type TEXT DEFAULT 'twilio',
  ADD COLUMN IF NOT EXISTS external_call_id TEXT,
  ADD COLUMN IF NOT EXISTS phone_number_id UUID REFERENCES business_phone_numbers(id),
  ADD COLUMN IF NOT EXISTS original_caller_id TEXT;

-- Create index for external_call_id lookups
CREATE INDEX IF NOT EXISTS idx_call_queue_external_call_id 
  ON public.call_queue(external_call_id) WHERE external_call_id IS NOT NULL;

-- Add provider-agnostic columns to call_history
ALTER TABLE public.call_history
  ADD COLUMN IF NOT EXISTS provider_type TEXT DEFAULT 'twilio',
  ADD COLUMN IF NOT EXISTS external_call_id TEXT,
  ADD COLUMN IF NOT EXISTS phone_number_id UUID REFERENCES business_phone_numbers(id),
  ADD COLUMN IF NOT EXISTS original_caller_id TEXT;

-- Migrate existing data
UPDATE public.call_queue SET 
  provider_type = 'twilio',
  external_call_id = twilio_call_sid
WHERE twilio_call_sid IS NOT NULL AND external_call_id IS NULL;
```

---

## Edge Function Architecture

### telephony-gateway (New - Unified Entry Point)

```
supabase/functions/telephony-gateway/
├── index.ts                 # Main router
├── providers/
│   ├── interface.ts         # ITelephonyProvider interface
│   ├── factory.ts           # Provider factory
│   ├── twilio.ts            # Twilio implementation
│   ├── sip.ts               # SIP/PBX implementation
│   └── mock.ts              # Mock provider for testing
├── events/
│   ├── normalizer.ts        # Event normalization
│   └── handler.ts           # Unified event handling
└── utils/
    ├── auth.ts              # Authentication helpers
    └── db.ts                # Database helpers
```

### Webhook Flow

```
                     Twilio                 PBX/Asterisk
                       │                         │
                       ▼                         ▼
              /twilio-webhook           /sip-webhook
                       │                         │
                       └──────────┬──────────────┘
                                  ▼
                     ┌────────────────────────┐
                     │  Event Normalizer      │
                     │  - Parse provider data │
                     │  - Map to unified type │
                     └────────────────────────┘
                                  │
                                  ▼
                     ┌────────────────────────┐
                     │  Unified Handler       │
                     │  - Update call_queue   │
                     │  - Log to call_events  │
                     │  - Trigger realtime    │
                     └────────────────────────┘
```

---

## Provider Configurations

### Twilio Provider Config (JSONB)

```json
{
  "accountSid": "secret:TWILIO_ACCOUNT_SID",
  "authToken": "secret:TWILIO_AUTH_TOKEN",
  "apiKey": "secret:TWILIO_API_KEY",
  "apiSecret": "secret:TWILIO_API_SECRET",
  "webhookBaseUrl": "https://fcdfephraaiusolzfdvf.supabase.co/functions/v1",
  "recordCalls": true,
  "transcribeCalls": false
}
```

### SIP/PBX Provider Config (JSONB)

```json
{
  "sipServer": "pbx.company.local",
  "sipPort": 5060,
  "transport": "udp", // udp | tcp | tls
  "realm": "asterisk",
  "authMethod": "digest", // digest | ip-based
  "webhookMode": "http", // http | ami | both
  "amiHost": "192.168.1.100",
  "amiPort": 5038,
  "amiUsername": "secret:AMI_USERNAME",
  "amiPassword": "secret:AMI_PASSWORD",
  "recordingsPath": "/var/spool/asterisk/monitor/",
  "recordingsBaseUrl": "https://recordings.company.local/"
}
```

---

## Frontend Changes

### Number Selection for Outbound Calls

```typescript
// New component: NumberSelectorDialog
interface NumberSelectorProps {
  businessId: string;
  onSelect: (phoneNumberId: string) => void;
  onCancel: () => void;
}

// Hook update: useTelephony
interface UseTelephonyResult {
  // Existing
  initiateCall: (toNumber: string, phoneNumberId?: string) => Promise<void>;
  
  // New
  availableNumbers: BusinessPhoneNumber[];
  defaultNumber: BusinessPhoneNumber | null;
  showNumberSelector: boolean;
  selectNumber: (id: string) => void;
}
```

### Provider-Agnostic useCallCenter Updates

```typescript
// Key changes to useCallCenter hook:
// 1. Remove Twilio-specific endpoint URLs
// 2. Use unified /telephony-gateway endpoints
// 3. Handle provider_type in call objects
// 4. Support multiple phone numbers

const TELEPHONY_BASE_URL = 'https://fcdfephraaiusolzfdvf.supabase.co/functions/v1/telephony-gateway';

// Call actions now go through unified gateway
const answerCall = async (callId: string) => {
  await fetch(`${TELEPHONY_BASE_URL}/answer`, {
    method: 'POST',
    body: JSON.stringify({ callId }),
    // ... auth headers
  });
};
```

---

## Implementation Phases

### Phase 1: Database & Provider Abstraction (Week 1)
1. ✅ Create architecture document
2. Create database migration for new tables
3. Create `telephony-gateway` edge function structure
4. Implement `ITelephonyProvider` interface
5. Migrate existing Twilio logic to `TwilioProvider`

### Phase 2: Unified Backend (Week 2)
1. Implement event normalizer
2. Update webhook handlers to use normalized events
3. Implement `SipPbxProvider` skeleton
4. Add provider configuration management

### Phase 3: Frontend Integration (Week 3)
1. Update `useCallCenter` hook for provider agnosticism
2. Add number selection UI for outbound calls
3. Add provider/number management in Settings
4. Testing with Twilio (regression)

### Phase 4: SIP/PBX Support (Week 4)
1. Complete `SipPbxProvider` implementation
2. Add AMI polling support
3. Add webhook mode for PBX events
4. End-to-end testing with Asterisk

---

## Security Considerations

1. **Provider Credentials**: Store in Supabase secrets, reference via `secret:KEY_NAME` in config
2. **Webhook Validation**: Validate signatures for Twilio, implement IP whitelisting for PBX
3. **RLS Policies**: Ensure all new tables have proper business_id-based RLS
4. **Audit Trail**: Log all provider actions in `call_events` table

---

## Migration Strategy

### Backward Compatibility

1. Existing `twilio_call_sid` column remains but deprecated
2. Default `provider_type` = 'twilio' for all existing records
3. Existing `twilio-webhook` function continues working during transition
4. Gradual migration of businesses to new unified system

### Data Migration

```sql
-- Migrate existing call_center_numbers to new schema
INSERT INTO telephony_providers (business_id, provider_type, display_name, is_active, is_default)
SELECT DISTINCT business_id, 'twilio', 'Twilio (Legacy)', true, true
FROM call_center_numbers
WHERE business_id IS NOT NULL;

INSERT INTO business_phone_numbers (business_id, provider_id, phone_number, display_name, external_id, is_default, is_active)
SELECT 
  ccn.business_id,
  tp.id,
  ccn.phone_number,
  'Primary Number',
  ccn.twilio_sid,
  true,
  ccn.is_active
FROM call_center_numbers ccn
JOIN telephony_providers tp ON tp.business_id = ccn.business_id AND tp.provider_type = 'twilio';
```

---

## Next Steps

After approval of this architecture:

1. **Confirm design decisions** - Review with team/stakeholders
2. **Create database migration** - New tables and schema modifications
3. **Implement provider interface** - TypeScript types and base implementation
4. **Refactor Twilio provider** - Extract from current webhook into provider class
5. **Build unified gateway** - New edge function with routing logic
6. **Update frontend hooks** - Provider-agnostic call management
7. **Add SIP provider** - Generic SIP/PBX implementation
8. **Testing & documentation** - End-to-end testing with both providers

---

## Appendix A: SIP/PBX Event Examples

### Asterisk AMI Events

```
Event: Newchannel
Channel: SIP/trunk-00000001
CallerIDNum: +15551234567
CallerIDName: John Doe
Exten: 1001
Context: from-trunk

Event: Hangup
Channel: SIP/trunk-00000001
Cause: 16
Cause-txt: Normal Clearing
```

### FreePBX Webhook (HTTP)

```json
{
  "event": "incoming_call",
  "channel": "SIP/trunk-00000001",
  "caller_id": "+15551234567",
  "caller_name": "John Doe",
  "destination": "1001",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## Appendix B: Provider Feature Matrix

| Feature | Twilio | SIP/PBX | Mock |
|---------|--------|---------|------|
| Inbound calls | ✅ | ✅ | ✅ |
| Outbound calls | ✅ | ✅ | ✅ |
| Call recording | ✅ | ✅* | ✅ |
| Call transfer | ✅ | ✅ | ✅ |
| Hold music | ✅ | ✅* | ✅ |
| WebRTC | ✅ | ❌** | ✅ |
| Transcription | ✅ | ❌ | ❌ |
| SMS/MMS | ✅ | ❌ | ✅ |

\* Requires PBX configuration
\** Requires separate WebRTC gateway (e.g., Ovislink, Obi, or webRTC-to-SIP bridge)
