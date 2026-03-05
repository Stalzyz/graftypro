
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.WorkspaceScalarFieldEnum = {
  id: 'id',
  name: 'name',
  business_name: 'business_name',
  website: 'website',
  status: 'status',
  timezone: 'timezone',
  created_at: 'created_at',
  updated_at: 'updated_at',
  plan: 'plan',
  current_plan_id: 'current_plan_id',
  subscription_id: 'subscription_id',
  subscription_status: 'subscription_status',
  settings: 'settings',
  reseller_id: 'reseller_id',
  coupon_id: 'coupon_id',
  industry: 'industry',
  revenue_range: 'revenue_range',
  whatsapp_goal: 'whatsapp_goal',
  message_volume: 'message_volume',
  use_api_already: 'use_api_already',
  needs_assistance: 'needs_assistance',
  trial_ends_at: 'trial_ends_at'
};

exports.Prisma.LeadScalarFieldEnum = {
  id: 'id',
  name: 'name',
  business_name: 'business_name',
  whatsapp_number: 'whatsapp_number',
  revenue_range: 'revenue_range',
  goal: 'goal',
  ip_address: 'ip_address',
  user_agent: 'user_agent',
  source: 'source',
  created_at: 'created_at'
};

exports.Prisma.CommerceStoreScalarFieldEnum = {
  id: 'id',
  workspace_id: 'workspace_id',
  platform: 'platform',
  encrypted_credentials: 'encrypted_credentials',
  status: 'status',
  last_sync_at: 'last_sync_at',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.CommerceProductScalarFieldEnum = {
  id: 'id',
  store_id: 'store_id',
  external_id: 'external_id',
  name: 'name',
  description: 'description',
  price: 'price',
  currency: 'currency',
  stock: 'stock',
  image_urls: 'image_urls',
  category: 'category',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.CommerceOrderScalarFieldEnum = {
  id: 'id',
  store_id: 'store_id',
  external_id: 'external_id',
  customer_phone: 'customer_phone',
  total_amount: 'total_amount',
  status: 'status',
  synced_at: 'synced_at'
};

exports.Prisma.CommerceEventScalarFieldEnum = {
  id: 'id',
  order_id: 'order_id',
  event_type: 'event_type',
  processed_status: 'processed_status',
  payload: 'payload',
  created_at: 'created_at'
};

exports.Prisma.EduFormScalarFieldEnum = {
  id: 'id',
  workspace_id: 'workspace_id',
  name: 'name',
  type: 'type',
  fields: 'fields',
  success_msg: 'success_msg',
  redirect_url: 'redirect_url',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.EduLeadScalarFieldEnum = {
  id: 'id',
  workspace_id: 'workspace_id',
  form_id: 'form_id',
  student_name: 'student_name',
  parent_name: 'parent_name',
  whatsapp_number: 'whatsapp_number',
  email: 'email',
  grade: 'grade',
  course_interested: 'course_interested',
  budget_range: 'budget_range',
  city: 'city',
  status: 'status',
  counselor_id: 'counselor_id',
  notes: 'notes',
  potential_revenue: 'potential_revenue',
  attributes: 'attributes',
  lead_source: 'lead_source',
  follow_up_count: 'follow_up_count',
  last_contacted_at: 'last_contacted_at',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.EduLeadActivityScalarFieldEnum = {
  id: 'id',
  lead_id: 'lead_id',
  type: 'type',
  content: 'content',
  old_status: 'old_status',
  new_status: 'new_status',
  created_at: 'created_at'
};

exports.Prisma.SegmentScalarFieldEnum = {
  id: 'id',
  workspace_id: 'workspace_id',
  name: 'name',
  description: 'description',
  filters: 'filters',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  workspace_id: 'workspace_id',
  email: 'email',
  password_hash: 'password_hash',
  role: 'role',
  first_name: 'first_name',
  last_name: 'last_name',
  phone: 'phone',
  phone_verified: 'phone_verified',
  google_id: 'google_id',
  email_verified: 'email_verified',
  welcome_offer_claimed: 'welcome_offer_claimed',
  avatar_url: 'avatar_url',
  bio: 'bio',
  job_title: 'job_title',
  failed_login_attempts: 'failed_login_attempts',
  locked_until: 'locked_until',
  last_login_at: 'last_login_at',
  last_login_ip: 'last_login_ip',
  two_factor_enabled: 'two_factor_enabled',
  email_otp_verified: 'email_otp_verified',
  remember_token_hash: 'remember_token_hash',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.RememberMeTokenScalarFieldEnum = {
  id: 'id',
  user_id: 'user_id',
  token_hash: 'token_hash',
  expires_at: 'expires_at',
  created_at: 'created_at'
};

exports.Prisma.AuthAuditLogScalarFieldEnum = {
  id: 'id',
  user_id: 'user_id',
  email: 'email',
  action: 'action',
  status: 'status',
  ip_address: 'ip_address',
  user_agent: 'user_agent',
  details: 'details',
  created_at: 'created_at'
};

exports.Prisma.TeamScalarFieldEnum = {
  id: 'id',
  workspace_id: 'workspace_id',
  name: 'name',
  description: 'description',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.TeamMemberScalarFieldEnum = {
  id: 'id',
  team_id: 'team_id',
  user_id: 'user_id',
  joined_at: 'joined_at'
};

exports.Prisma.WhatsAppAccountScalarFieldEnum = {
  id: 'id',
  workspace_id: 'workspace_id',
  integration_status: 'integration_status',
  health_status: 'health_status',
  status: 'status',
  app_id: 'app_id',
  app_secret: 'app_secret',
  access_token: 'access_token',
  waba_id: 'waba_id',
  phone_number_id: 'phone_number_id',
  phone_number: 'phone_number',
  display_name: 'display_name',
  business_id: 'business_id',
  webhook_url: 'webhook_url',
  webhook_verify_token: 'webhook_verify_token',
  webhook_verified_at: 'webhook_verified_at',
  granted_permissions: 'granted_permissions',
  required_permissions: 'required_permissions',
  permission_check_at: 'permission_check_at',
  last_health_check_at: 'last_health_check_at',
  last_successful_send_at: 'last_successful_send_at',
  consecutive_failures: 'consecutive_failures',
  quality_rating: 'quality_rating',
  messaging_limit: 'messaging_limit',
  rate_limit_tier: 'rate_limit_tier',
  validated_at: 'validated_at',
  suspended_at: 'suspended_at',
  suspension_reason: 'suspension_reason',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.IntegrationHealthLogScalarFieldEnum = {
  id: 'id',
  whatsapp_account_id: 'whatsapp_account_id',
  check_type: 'check_type',
  status: 'status',
  details: 'details',
  error_message: 'error_message',
  checked_at: 'checked_at'
};

exports.Prisma.IntegrationAuditLogScalarFieldEnum = {
  id: 'id',
  whatsapp_account_id: 'whatsapp_account_id',
  workspace_id: 'workspace_id',
  user_id: 'user_id',
  action: 'action',
  details: 'details',
  ip_address: 'ip_address',
  user_agent: 'user_agent',
  created_at: 'created_at'
};

exports.Prisma.TemplateScalarFieldEnum = {
  id: 'id',
  workspace_id: 'workspace_id',
  waba_id: 'waba_id',
  name: 'name',
  language: 'language',
  category: 'category',
  status: 'status',
  components: 'components',
  meta_id: 'meta_id',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.TemplateVariableScalarFieldEnum = {
  id: 'id',
  template_id: 'template_id',
  component_index: 'component_index',
  param_index: 'param_index',
  sample_value: 'sample_value'
};

exports.Prisma.ContactScalarFieldEnum = {
  id: 'id',
  workspace_id: 'workspace_id',
  phone: 'phone',
  name: 'name',
  email: 'email',
  tags: 'tags',
  attributes: 'attributes',
  opt_in: 'opt_in',
  blocked: 'blocked',
  last_active_at: 'last_active_at',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.ConversationScalarFieldEnum = {
  id: 'id',
  workspace_id: 'workspace_id',
  contact_id: 'contact_id',
  status: 'status',
  created_at: 'created_at',
  updated_at: 'updated_at',
  assigned_to: 'assigned_to'
};

exports.Prisma.MessageScalarFieldEnum = {
  id: 'id',
  workspace_id: 'workspace_id',
  conversation_id: 'conversation_id',
  contact_id: 'contact_id',
  meta_id: 'meta_id',
  type: 'type',
  direction: 'direction',
  content: 'content',
  status: 'status',
  created_at: 'created_at'
};

exports.Prisma.WebhookEventScalarFieldEnum = {
  id: 'id',
  meta_event_id: 'meta_event_id',
  waba_id: 'waba_id',
  payload: 'payload',
  processed: 'processed',
  created_at: 'created_at'
};

exports.Prisma.FlowScalarFieldEnum = {
  id: 'id',
  workspace_id: 'workspace_id',
  name: 'name',
  trigger_keyword: 'trigger_keyword',
  nodes: 'nodes',
  edges: 'edges',
  status: 'status',
  published_at: 'published_at',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.FlowSessionScalarFieldEnum = {
  id: 'id',
  flow_id: 'flow_id',
  contact_id: 'contact_id',
  current_node_id: 'current_node_id',
  state: 'state',
  is_completed: 'is_completed',
  is_waiting: 'is_waiting',
  next_run_at: 'next_run_at',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.FlowAnalyticsScalarFieldEnum = {
  id: 'id',
  flow_id: 'flow_id',
  node_id: 'node_id',
  hits: 'hits',
  last_hit_at: 'last_hit_at'
};

exports.Prisma.GoalScalarFieldEnum = {
  id: 'id',
  workspace_id: 'workspace_id',
  name: 'name',
  type: 'type',
  status: 'status',
  config: 'config',
  flow_id: 'flow_id',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.GoalMetricScalarFieldEnum = {
  id: 'id',
  goal_id: 'goal_id',
  date: 'date',
  started_count: 'started_count',
  completed_count: 'completed_count',
  dropped_off_count: 'dropped_off_count',
  revenue: 'revenue'
};

exports.Prisma.CampaignScalarFieldEnum = {
  id: 'id',
  workspace_id: 'workspace_id',
  name: 'name',
  template_id: 'template_id',
  template_name: 'template_name',
  flow_id: 'flow_id',
  filters: 'filters',
  scheduled_at: 'scheduled_at',
  status: 'status',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.CampaignStatsScalarFieldEnum = {
  id: 'id',
  campaign_id: 'campaign_id',
  total: 'total',
  sent: 'sent',
  delivered: 'delivered',
  read: 'read',
  failed: 'failed',
  replied: 'replied'
};

exports.Prisma.ProductScalarFieldEnum = {
  id: 'id',
  workspace_id: 'workspace_id',
  name: 'name',
  description: 'description',
  image_url: 'image_url',
  price: 'price',
  currency: 'currency',
  sku: 'sku',
  is_active: 'is_active',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.ProductVariantScalarFieldEnum = {
  id: 'id',
  product_id: 'product_id',
  name: 'name',
  price_adj: 'price_adj'
};

exports.Prisma.OrderScalarFieldEnum = {
  id: 'id',
  workspace_id: 'workspace_id',
  contact_id: 'contact_id',
  total_amount: 'total_amount',
  currency: 'currency',
  status: 'status',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.OrderItemScalarFieldEnum = {
  id: 'id',
  order_id: 'order_id',
  product_id: 'product_id',
  quantity: 'quantity',
  unit_price: 'unit_price',
  total_price: 'total_price'
};

exports.Prisma.IntegrationScalarFieldEnum = {
  id: 'id',
  workspace_id: 'workspace_id',
  type: 'type',
  credentials: 'credentials',
  is_active: 'is_active',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.AppointmentSlotScalarFieldEnum = {
  id: 'id',
  workspace_id: 'workspace_id',
  start_time: 'start_time',
  end_time: 'end_time',
  is_booked: 'is_booked',
  created_at: 'created_at'
};

exports.Prisma.AppointmentScalarFieldEnum = {
  id: 'id',
  workspace_id: 'workspace_id',
  contact_id: 'contact_id',
  slot_id: 'slot_id',
  status: 'status',
  notes: 'notes',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.DripSequenceScalarFieldEnum = {
  id: 'id',
  workspace_id: 'workspace_id',
  name: 'name',
  description: 'description',
  goal_id: 'goal_id',
  stop_on_reply: 'stop_on_reply',
  stop_on_interaction: 'stop_on_interaction',
  settings: 'settings',
  status: 'status',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.DripStepScalarFieldEnum = {
  id: 'id',
  drip_id: 'drip_id',
  step_order: 'step_order',
  delay_hours: 'delay_hours',
  flow_id: 'flow_id',
  template_id: 'template_id'
};

exports.Prisma.DripStepAnalyticsScalarFieldEnum = {
  id: 'id',
  step_id: 'step_id',
  sent_count: 'sent_count',
  delivered_count: 'delivered_count',
  read_count: 'read_count',
  clicked_count: 'clicked_count'
};

exports.Prisma.DripEnrollmentScalarFieldEnum = {
  id: 'id',
  drip_id: 'drip_id',
  contact_id: 'contact_id',
  current_step: 'current_step',
  next_run_at: 'next_run_at',
  is_stopped: 'is_stopped',
  stop_reason: 'stop_reason',
  metadata: 'metadata'
};

exports.Prisma.AutoResponderScalarFieldEnum = {
  id: 'id',
  workspace_id: 'workspace_id',
  keyword: 'keyword',
  match_type: 'match_type',
  reply_type: 'reply_type',
  reply_text: 'reply_text',
  flow_id: 'flow_id',
  status: 'status',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.AdminUserScalarFieldEnum = {
  id: 'id',
  email: 'email',
  password_hash: 'password_hash',
  role: 'role',
  name: 'name',
  avatar_url: 'avatar_url',
  bio: 'bio',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.AdminAuditLogScalarFieldEnum = {
  id: 'id',
  admin_id: 'admin_id',
  action: 'action',
  resource: 'resource',
  details: 'details',
  ip_address: 'ip_address',
  created_at: 'created_at'
};

exports.Prisma.ResellerScalarFieldEnum = {
  id: 'id',
  email: 'email',
  password_hash: 'password_hash',
  name: 'name',
  business_name: 'business_name',
  avatar_url: 'avatar_url',
  bio: 'bio',
  last_login: 'last_login',
  referral_code: 'referral_code',
  status: 'status',
  kyc_status: 'kyc_status',
  base_commission: 'base_commission',
  markup_enabled: 'markup_enabled',
  wallet_balance: 'wallet_balance',
  total_earned: 'total_earned',
  brand_name: 'brand_name',
  logo_url: 'logo_url',
  favicon_url: 'favicon_url',
  primary_color: 'primary_color',
  secondary_color: 'secondary_color',
  custom_domain: 'custom_domain',
  is_frozen: 'is_frozen',
  freeze_reason: 'freeze_reason',
  risk_score: 'risk_score',
  tier_id: 'tier_id',
  low_credit_threshold: 'low_credit_threshold',
  billing_address: 'billing_address',
  gst_number: 'gst_number',
  bank_account_holder: 'bank_account_holder',
  bank_account_number: 'bank_account_number',
  bank_ifsc: 'bank_ifsc',
  bank_name: 'bank_name',
  invoice_config: 'invoice_config',
  onboarding_bonus: 'onboarding_bonus',
  onboarding_bonus_paid: 'onboarding_bonus_paid',
  broadcast_banner: 'broadcast_banner',
  broadcast_link: 'broadcast_link',
  support_email: 'support_email',
  support_url: 'support_url',
  markup_percentage: 'markup_percentage',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.ResellerRiskLogScalarFieldEnum = {
  id: 'id',
  reseller_id: 'reseller_id',
  signal_type: 'signal_type',
  risk_impact: 'risk_impact',
  details: 'details',
  created_at: 'created_at'
};

exports.Prisma.ResellerTierScalarFieldEnum = {
  id: 'id',
  name: 'name',
  min_vendors: 'min_vendors',
  commission_rate: 'commission_rate'
};

exports.Prisma.ResellerVendorMapScalarFieldEnum = {
  id: 'id',
  reseller_id: 'reseller_id',
  workspace_id: 'workspace_id',
  mapped_at: 'mapped_at',
  referral_source: 'referral_source',
  is_permanent: 'is_permanent'
};

exports.Prisma.ResellerLedgerScalarFieldEnum = {
  id: 'id',
  reseller_id: 'reseller_id',
  workspace_id: 'workspace_id',
  amount: 'amount',
  type: 'type',
  description: 'description',
  reference_id: 'reference_id',
  balance_after: 'balance_after',
  created_at: 'created_at'
};

exports.Prisma.ResellerPayoutRequestScalarFieldEnum = {
  id: 'id',
  reseller_id: 'reseller_id',
  amount: 'amount',
  status: 'status',
  payment_method: 'payment_method',
  payment_details: 'payment_details',
  admin_notes: 'admin_notes',
  gateway_payout_id: 'gateway_payout_id',
  processed_by: 'processed_by',
  processed_at: 'processed_at',
  created_at: 'created_at'
};

exports.Prisma.ResellerFraudProofScalarFieldEnum = {
  id: 'id',
  reseller_id: 'reseller_id',
  transaction_id: 'transaction_id',
  proof_url: 'proof_url',
  status: 'status',
  risk_score: 'risk_score',
  checks_passed: 'checks_passed',
  admin_notes: 'admin_notes',
  verified_at: 'verified_at',
  created_at: 'created_at'
};

exports.Prisma.ResellerCouponScalarFieldEnum = {
  id: 'id',
  reseller_id: 'reseller_id',
  code: 'code',
  discount_type: 'discount_type',
  discount_value: 'discount_value',
  valid_until: 'valid_until',
  usage_limit: 'usage_limit',
  usage_count: 'usage_count',
  is_active: 'is_active',
  plan_restrictions: 'plan_restrictions',
  new_users_only: 'new_users_only',
  created_at: 'created_at'
};

exports.Prisma.ResellerLeadScalarFieldEnum = {
  id: 'id',
  reseller_id: 'reseller_id',
  name: 'name',
  email: 'email',
  phone: 'phone',
  business_name: 'business_name',
  status: 'status',
  notes: 'notes',
  source: 'source',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.ResellerOfferScalarFieldEnum = {
  id: 'id',
  reseller_id: 'reseller_id',
  title: 'title',
  description: 'description',
  offer_type: 'offer_type',
  plan_id: 'plan_id',
  discount_code: 'discount_code',
  valid_until: 'valid_until',
  share_link: 'share_link',
  created_at: 'created_at'
};

exports.Prisma.ResellerProposalScalarFieldEnum = {
  id: 'id',
  reseller_id: 'reseller_id',
  lead_id: 'lead_id',
  title: 'title',
  items: 'items',
  total_amount: 'total_amount',
  status: 'status',
  created_at: 'created_at'
};

exports.Prisma.ResellerInvoiceScalarFieldEnum = {
  id: 'id',
  invoice_number: 'invoice_number',
  reseller_id: 'reseller_id',
  amount_subtotal: 'amount_subtotal',
  tax_amount: 'tax_amount',
  amount_total: 'amount_total',
  status: 'status',
  pdf_url: 'pdf_url',
  billing_details: 'billing_details',
  created_at: 'created_at',
  paid_at: 'paid_at'
};

exports.Prisma.TransactionScalarFieldEnum = {
  id: 'id',
  workspace_id: 'workspace_id',
  partner_id: 'partner_id',
  amount: 'amount',
  currency: 'currency',
  type: 'type',
  status: 'status',
  description: 'description',
  reference_id: 'reference_id',
  created_at: 'created_at'
};

exports.Prisma.SystemConfigScalarFieldEnum = {
  id: 'id',
  platform_name: 'platform_name',
  platform_tagline: 'platform_tagline',
  logo_url: 'logo_url',
  dark_logo_url: 'dark_logo_url',
  favicon_url: 'favicon_url',
  login_logo_url: 'login_logo_url',
  dashboard_logo_url: 'dashboard_logo_url',
  reseller_logo_url: 'reseller_logo_url',
  partner_logo_url: 'partner_logo_url',
  footer_logo_url: 'footer_logo_url',
  primary_color: 'primary_color',
  secondary_color: 'secondary_color',
  theme_mode: 'theme_mode',
  border_radius: 'border_radius',
  features: 'features',
  payment_gateways: 'payment_gateways',
  meta_app_id: 'meta_app_id',
  meta_app_secret_enc: 'meta_app_secret_enc',
  meta_waba_id: 'meta_waba_id',
  meta_business_id: 'meta_business_id',
  meta_system_token_enc: 'meta_system_token_enc',
  meta_permanent_token_enc: 'meta_permanent_token_enc',
  meta_credit_line_id: 'meta_credit_line_id',
  meta_onboarding_mode: 'meta_onboarding_mode',
  smtp_host: 'smtp_host',
  smtp_port: 'smtp_port',
  smtp_user: 'smtp_user',
  smtp_pass_enc: 'smtp_pass_enc',
  smtp_from_name: 'smtp_from_name',
  smtp_from_email: 'smtp_from_email',
  smtp_encryption: 'smtp_encryption',
  company_name: 'company_name',
  company_gstin: 'company_gstin',
  company_pan: 'company_pan',
  company_address: 'company_address',
  company_state: 'company_state',
  company_pincode: 'company_pincode',
  company_bank_details: 'company_bank_details',
  invoice_config: 'invoice_config',
  support_email: 'support_email',
  support_phone: 'support_phone',
  support_whatsapp: 'support_whatsapp',
  meta_title: 'meta_title',
  meta_description: 'meta_description',
  social_links: 'social_links',
  landing_page_config: 'landing_page_config',
  google_client_id: 'google_client_id',
  google_client_secret_enc: 'google_client_secret_enc',
  facebook_client_id: 'facebook_client_id',
  facebook_client_secret_enc: 'facebook_client_secret_enc',
  pusher_app_id: 'pusher_app_id',
  pusher_key: 'pusher_key',
  pusher_secret_enc: 'pusher_secret_enc',
  pusher_cluster: 'pusher_cluster',
  updated_at: 'updated_at'
};

exports.Prisma.EmailTemplateScalarFieldEnum = {
  id: 'id',
  slug: 'slug',
  subject: 'subject',
  body_html: 'body_html',
  variables: 'variables',
  is_active: 'is_active',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.PaymentGatewayConfigScalarFieldEnum = {
  id: 'id',
  provider: 'provider',
  key_id: 'key_id',
  key_secret: 'key_secret',
  webhook_secret: 'webhook_secret',
  is_live: 'is_live',
  is_active: 'is_active',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.InvoiceSequenceScalarFieldEnum = {
  id: 'id',
  entity_id: 'entity_id',
  year: 'year',
  next_number: 'next_number',
  updated_at: 'updated_at'
};

exports.Prisma.InvoiceScalarFieldEnum = {
  id: 'id',
  invoice_number: 'invoice_number',
  workspace_id: 'workspace_id',
  wallet_id: 'wallet_id',
  reseller_id: 'reseller_id',
  net_amount: 'net_amount',
  gst_amount: 'gst_amount',
  cgst_amount: 'cgst_amount',
  sgst_amount: 'sgst_amount',
  igst_amount: 'igst_amount',
  total_amount: 'total_amount',
  hsn_code: 'hsn_code',
  is_reverse_charge: 'is_reverse_charge',
  place_of_supply: 'place_of_supply',
  billing_name: 'billing_name',
  billing_address: 'billing_address',
  billing_gstin: 'billing_gstin',
  billing_state: 'billing_state',
  billing_pincode: 'billing_pincode',
  billing_email: 'billing_email',
  billing_phone: 'billing_phone',
  company_name: 'company_name',
  company_gstin: 'company_gstin',
  company_address: 'company_address',
  company_state: 'company_state',
  company_pincode: 'company_pincode',
  authorized_signature_url: 'authorized_signature_url',
  invoice_hash: 'invoice_hash',
  payment_method: 'payment_method',
  payment_id: 'payment_id',
  payment_status: 'payment_status',
  status: 'status',
  cancelled_reason: 'cancelled_reason',
  cancelled_at: 'cancelled_at',
  pdf_url: 'pdf_url',
  pdf_generated_at: 'pdf_generated_at',
  email_sent: 'email_sent',
  email_sent_at: 'email_sent_at',
  notes: 'notes',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.InvoiceItemScalarFieldEnum = {
  id: 'id',
  invoice_id: 'invoice_id',
  description: 'description',
  hsn_code: 'hsn_code',
  quantity: 'quantity',
  rate: 'rate',
  taxable_value: 'taxable_value',
  cgst_rate: 'cgst_rate',
  cgst_amount: 'cgst_amount',
  sgst_rate: 'sgst_rate',
  sgst_amount: 'sgst_amount',
  igst_rate: 'igst_rate',
  igst_amount: 'igst_amount',
  total_amount: 'total_amount'
};

exports.Prisma.VendorWalletScalarFieldEnum = {
  id: 'id',
  workspace_id: 'workspace_id',
  current_balance: 'current_balance',
  locked_balance: 'locked_balance',
  total_purchased: 'total_purchased',
  total_used: 'total_used',
  auto_recharge_enabled: 'auto_recharge_enabled',
  auto_recharge_threshold: 'auto_recharge_threshold',
  auto_recharge_amount: 'auto_recharge_amount',
  razorpay_customer_id: 'razorpay_customer_id',
  razorpay_token_id: 'razorpay_token_id',
  max_daily_velocity: 'max_daily_velocity',
  velocity_alert_threshold: 'velocity_alert_threshold',
  is_automated_blocked: 'is_automated_blocked',
  gst_registered: 'gst_registered',
  gstin: 'gstin',
  billing_name: 'billing_name',
  billing_address: 'billing_address',
  billing_state: 'billing_state',
  billing_pincode: 'billing_pincode',
  billing_email: 'billing_email',
  billing_phone: 'billing_phone',
  is_frozen: 'is_frozen',
  freeze_reason: 'freeze_reason',
  frozen_at: 'frozen_at',
  frozen_by: 'frozen_by',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.CreditTransactionScalarFieldEnum = {
  id: 'id',
  workspace_id: 'workspace_id',
  wallet_id: 'wallet_id',
  type: 'type',
  amount: 'amount',
  balance_before: 'balance_before',
  balance_after: 'balance_after',
  net_amount: 'net_amount',
  gst_amount: 'gst_amount',
  cgst_amount: 'cgst_amount',
  sgst_amount: 'sgst_amount',
  igst_amount: 'igst_amount',
  total_amount: 'total_amount',
  related_payment_id: 'related_payment_id',
  related_message_id: 'related_message_id',
  meta_message_id: 'meta_message_id',
  invoice_id: 'invoice_id',
  message_category: 'message_category',
  country_code: 'country_code',
  meta_cost: 'meta_cost',
  our_charge: 'our_charge',
  margin: 'margin',
  velocity_score: 'velocity_score',
  description: 'description',
  initiated_by: 'initiated_by',
  ip_address: 'ip_address',
  user_agent: 'user_agent',
  status: 'status',
  failure_reason: 'failure_reason',
  created_at: 'created_at',
  reversed_at: 'reversed_at'
};

exports.Prisma.CreditPricingScalarFieldEnum = {
  id: 'id',
  message_type: 'message_type',
  country: 'country',
  country_code: 'country_code',
  meta_cost: 'meta_cost',
  platform_margin: 'platform_margin',
  reseller_margin: 'reseller_margin',
  final_vendor_price: 'final_vendor_price'
};

exports.Prisma.FeedbackScalarFieldEnum = {
  id: 'id',
  workspace_id: 'workspace_id',
  reseller_id: 'reseller_id',
  name: 'name',
  role: 'role',
  content: 'content',
  rating: 'rating',
  is_approved: 'is_approved',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.SubscriptionPlanScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  price: 'price',
  monthly_price: 'monthly_price',
  yearly_price: 'yearly_price',
  currency: 'currency',
  billing_cycle: 'billing_cycle',
  min_reseller_price: 'min_reseller_price',
  max_contacts: 'max_contacts',
  max_flows: 'max_flows',
  max_campaigns: 'max_campaigns',
  max_messages: 'max_messages',
  max_users: 'max_users',
  max_teams: 'max_teams',
  api_access: 'api_access',
  crm_access: 'crm_access',
  flow_builder_access: 'flow_builder_access',
  drip_campaign_access: 'drip_campaign_access',
  commerce_access: 'commerce_access',
  edu_engine_access: 'edu_engine_access',
  is_public: 'is_public',
  is_active: 'is_active',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.VerificationOTPScalarFieldEnum = {
  id: 'id',
  identifier: 'identifier',
  code: 'code',
  type: 'type',
  expires_at: 'expires_at',
  created_at: 'created_at'
};

exports.Prisma.GSTReportScalarFieldEnum = {
  id: 'id',
  month: 'month',
  year: 'year',
  total_sales: 'total_sales',
  total_gst: 'total_gst',
  total_cgst: 'total_cgst',
  total_sgst: 'total_sgst',
  total_igst: 'total_igst',
  invoice_count: 'invoice_count',
  transaction_count: 'transaction_count',
  status: 'status',
  finalized_at: 'finalized_at',
  pdf_url: 'pdf_url',
  generated_at: 'generated_at',
  generated_by: 'generated_by',
  notes: 'notes'
};

exports.Prisma.AuditLogScalarFieldEnum = {
  id: 'id',
  admin_id: 'admin_id',
  admin_email: 'admin_email',
  action_type: 'action_type',
  target_type: 'target_type',
  target_id: 'target_id',
  target_workspace: 'target_workspace',
  before_value: 'before_value',
  after_value: 'after_value',
  reason: 'reason',
  ip_address: 'ip_address',
  user_agent: 'user_agent',
  created_at: 'created_at'
};

exports.Prisma.ProposalScalarFieldEnum = {
  id: 'id',
  protocol_id: 'protocol_id',
  client_name: 'client_name',
  client_email: 'client_email',
  client_company: 'client_company',
  amount: 'amount',
  currency: 'currency',
  status: 'status',
  valid_until: 'valid_until',
  sent_at: 'sent_at',
  accepted_at: 'accepted_at',
  items: 'items',
  notes: 'notes',
  created_by: 'created_by',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};
exports.WorkspaceStatus = exports.$Enums.WorkspaceStatus = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  DARMANT: 'DARMANT'
};

exports.Plan = exports.$Enums.Plan = {
  FREE: 'FREE',
  PRO: 'PRO',
  ENTERPRISE: 'ENTERPRISE'
};

exports.CommercePlatform = exports.$Enums.CommercePlatform = {
  WOOCOMMERCE: 'WOOCOMMERCE',
  SHOPIFY: 'SHOPIFY',
  CUSTOM: 'CUSTOM'
};

exports.EduLeadStatus = exports.$Enums.EduLeadStatus = {
  NEW: 'NEW',
  CONTACTED: 'CONTACTED',
  FOLLOW_UP: 'FOLLOW_UP',
  DEMO_SCHEDULED: 'DEMO_SCHEDULED',
  PAYMENT_PENDING: 'PAYMENT_PENDING',
  ENROLLED: 'ENROLLED',
  LOST: 'LOST'
};

exports.UserRole = exports.$Enums.UserRole = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  FINANCE: 'FINANCE',
  AGENT: 'AGENT'
};

exports.IntegrationStatus = exports.$Enums.IntegrationStatus = {
  DRAFT: 'DRAFT',
  VALIDATING: 'VALIDATING',
  ACTIVE: 'ACTIVE',
  DEGRADED: 'DEGRADED',
  PAUSED: 'PAUSED',
  SUSPENDED: 'SUSPENDED',
  DISABLED: 'DISABLED',
  FAILED: 'FAILED'
};

exports.HealthStatus = exports.$Enums.HealthStatus = {
  HEALTHY: 'HEALTHY',
  WARNING: 'WARNING',
  CRITICAL: 'CRITICAL',
  UNKNOWN: 'UNKNOWN'
};

exports.WabaStatus = exports.$Enums.WabaStatus = {
  CONNECTED: 'CONNECTED',
  DISCONNECTED: 'DISCONNECTED',
  BANNED: 'BANNED'
};

exports.HealthCheckType = exports.$Enums.HealthCheckType = {
  TOKEN_VALIDITY: 'TOKEN_VALIDITY',
  WEBHOOK_REACHABILITY: 'WEBHOOK_REACHABILITY',
  PERMISSION_CHECK: 'PERMISSION_CHECK',
  PHONE_STATUS: 'PHONE_STATUS',
  RATE_LIMIT_CHECK: 'RATE_LIMIT_CHECK',
  MESSAGE_DELIVERY: 'MESSAGE_DELIVERY',
  QUALITY_RATING: 'QUALITY_RATING'
};

exports.AuditAction = exports.$Enums.AuditAction = {
  INTEGRATION_CREATED: 'INTEGRATION_CREATED',
  CREDENTIALS_UPDATED: 'CREDENTIALS_UPDATED',
  VALIDATION_STARTED: 'VALIDATION_STARTED',
  VALIDATION_PASSED: 'VALIDATION_PASSED',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  ACTIVATED: 'ACTIVATED',
  PAUSED: 'PAUSED',
  SUSPENDED: 'SUSPENDED',
  RESUMED: 'RESUMED',
  DELETED: 'DELETED',
  WEBHOOK_VERIFIED: 'WEBHOOK_VERIFIED',
  PERMISSION_GRANTED: 'PERMISSION_GRANTED',
  PERMISSION_REVOKED: 'PERMISSION_REVOKED',
  HEALTH_CHECK_FAILED: 'HEALTH_CHECK_FAILED',
  AUTO_SUSPENDED: 'AUTO_SUSPENDED',
  RESELLER_REGISTERED: 'RESELLER_REGISTERED',
  RESELLER_APPROVED: 'RESELLER_APPROVED',
  RESELLER_SUSPENDED: 'RESELLER_SUSPENDED',
  RESELLER_MARGING_CHANGED: 'RESELLER_MARGING_CHANGED',
  VENDOR_MAPPED_TO_RESELLER: 'VENDOR_MAPPED_TO_RESELLER'
};

exports.TemplateCategory = exports.$Enums.TemplateCategory = {
  MARKETING: 'MARKETING',
  UTILITY: 'UTILITY',
  AUTHENTICATION: 'AUTHENTICATION'
};

exports.TemplateStatus = exports.$Enums.TemplateStatus = {
  DRAFT: 'DRAFT',
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  PAUSED: 'PAUSED',
  DISABLED: 'DISABLED'
};

exports.MessageType = exports.$Enums.MessageType = {
  TEXT: 'TEXT',
  IMAGE: 'IMAGE',
  TEMPLATE: 'TEMPLATE',
  INTERACTIVE: 'INTERACTIVE',
  AUDIO: 'AUDIO',
  VIDEO: 'VIDEO',
  DOCUMENT: 'DOCUMENT',
  UNKNOWN: 'UNKNOWN'
};

exports.MessageDirection = exports.$Enums.MessageDirection = {
  INBOUND: 'INBOUND',
  OUTBOUND: 'OUTBOUND'
};

exports.FlowStatus = exports.$Enums.FlowStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED'
};

exports.GoalType = exports.$Enums.GoalType = {
  BOOK_APPOINTMENT: 'BOOK_APPOINTMENT',
  COLLECT_PAYMENT: 'COLLECT_PAYMENT',
  SELL_PRODUCT: 'SELL_PRODUCT',
  GET_LEAD_INFO: 'GET_LEAD_INFO',
  CUSTOM: 'CUSTOM'
};

exports.GoalStatus = exports.$Enums.GoalStatus = {
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  COMPLETED: 'COMPLETED'
};

exports.CampaignStatus = exports.$Enums.CampaignStatus = {
  DRAFT: 'DRAFT',
  SCHEDULED: 'SCHEDULED',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED'
};

exports.OrderStatus = exports.$Enums.OrderStatus = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED'
};

exports.IntegrationType = exports.$Enums.IntegrationType = {
  RAZORPAY: 'RAZORPAY',
  STRIPE: 'STRIPE',
  SHOPIFY: 'SHOPIFY',
  CALENDLY: 'CALENDLY'
};

exports.DripStatus = exports.$Enums.DripStatus = {
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  COMPLETED: 'COMPLETED'
};

exports.AdminRole = exports.$Enums.AdminRole = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  SALES: 'SALES',
  FINANCE: 'FINANCE',
  SUPPORT: 'SUPPORT',
  READ_ONLY: 'READ_ONLY'
};

exports.ResellerStatus = exports.$Enums.ResellerStatus = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  REJECTED: 'REJECTED'
};

exports.KYCStatus = exports.$Enums.KYCStatus = {
  NONE: 'NONE',
  SUBMITTED: 'SUBMITTED',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED'
};

exports.LedgerEntryType = exports.$Enums.LedgerEntryType = {
  COMMISSION: 'COMMISSION',
  PAYOUT: 'PAYOUT',
  REFUND_REVERSAL: 'REFUND_REVERSAL',
  ADJUSTMENT: 'ADJUSTMENT'
};

exports.PayoutRequestStatus = exports.$Enums.PayoutRequestStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  PAID: 'PAID',
  REJECTED: 'REJECTED'
};

exports.InvoiceStatus = exports.$Enums.InvoiceStatus = {
  DRAFT: 'DRAFT',
  ISSUED: 'ISSUED',
  PAID: 'PAID',
  CANCELLED: 'CANCELLED'
};

exports.TransactionType = exports.$Enums.TransactionType = {
  SUBSCRIPTION_CHARGE: 'SUBSCRIPTION_CHARGE',
  CREDIT_PURCHASE: 'CREDIT_PURCHASE',
  REFUND: 'REFUND',
  COMMISSION_PAYOUT: 'COMMISSION_PAYOUT',
  USAGE_CHARGE: 'USAGE_CHARGE'
};

exports.TransactionStatus = exports.$Enums.TransactionStatus = {
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  PENDING: 'PENDING'
};

exports.CreditTransactionType = exports.$Enums.CreditTransactionType = {
  PURCHASE: 'PURCHASE',
  DEDUCTION: 'DEDUCTION',
  REFUND: 'REFUND',
  REVERSAL: 'REVERSAL',
  ADJUSTMENT: 'ADJUSTMENT'
};

exports.Prisma.ModelName = {
  Workspace: 'Workspace',
  Lead: 'Lead',
  CommerceStore: 'CommerceStore',
  CommerceProduct: 'CommerceProduct',
  CommerceOrder: 'CommerceOrder',
  CommerceEvent: 'CommerceEvent',
  EduForm: 'EduForm',
  EduLead: 'EduLead',
  EduLeadActivity: 'EduLeadActivity',
  Segment: 'Segment',
  User: 'User',
  RememberMeToken: 'RememberMeToken',
  AuthAuditLog: 'AuthAuditLog',
  Team: 'Team',
  TeamMember: 'TeamMember',
  WhatsAppAccount: 'WhatsAppAccount',
  IntegrationHealthLog: 'IntegrationHealthLog',
  IntegrationAuditLog: 'IntegrationAuditLog',
  Template: 'Template',
  TemplateVariable: 'TemplateVariable',
  Contact: 'Contact',
  Conversation: 'Conversation',
  Message: 'Message',
  WebhookEvent: 'WebhookEvent',
  Flow: 'Flow',
  FlowSession: 'FlowSession',
  FlowAnalytics: 'FlowAnalytics',
  Goal: 'Goal',
  GoalMetric: 'GoalMetric',
  Campaign: 'Campaign',
  CampaignStats: 'CampaignStats',
  Product: 'Product',
  ProductVariant: 'ProductVariant',
  Order: 'Order',
  OrderItem: 'OrderItem',
  Integration: 'Integration',
  AppointmentSlot: 'AppointmentSlot',
  Appointment: 'Appointment',
  DripSequence: 'DripSequence',
  DripStep: 'DripStep',
  DripStepAnalytics: 'DripStepAnalytics',
  DripEnrollment: 'DripEnrollment',
  AutoResponder: 'AutoResponder',
  AdminUser: 'AdminUser',
  AdminAuditLog: 'AdminAuditLog',
  Reseller: 'Reseller',
  ResellerRiskLog: 'ResellerRiskLog',
  ResellerTier: 'ResellerTier',
  ResellerVendorMap: 'ResellerVendorMap',
  ResellerLedger: 'ResellerLedger',
  ResellerPayoutRequest: 'ResellerPayoutRequest',
  ResellerFraudProof: 'ResellerFraudProof',
  ResellerCoupon: 'ResellerCoupon',
  ResellerLead: 'ResellerLead',
  ResellerOffer: 'ResellerOffer',
  ResellerProposal: 'ResellerProposal',
  ResellerInvoice: 'ResellerInvoice',
  Transaction: 'Transaction',
  SystemConfig: 'SystemConfig',
  EmailTemplate: 'EmailTemplate',
  PaymentGatewayConfig: 'PaymentGatewayConfig',
  InvoiceSequence: 'InvoiceSequence',
  Invoice: 'Invoice',
  InvoiceItem: 'InvoiceItem',
  VendorWallet: 'VendorWallet',
  CreditTransaction: 'CreditTransaction',
  CreditPricing: 'CreditPricing',
  Feedback: 'Feedback',
  SubscriptionPlan: 'SubscriptionPlan',
  VerificationOTP: 'VerificationOTP',
  GSTReport: 'GSTReport',
  AuditLog: 'AuditLog',
  Proposal: 'Proposal'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
