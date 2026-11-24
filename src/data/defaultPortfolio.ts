import { PortfolioData } from '../types/portfolio.ts';

export const DEFAULT_PORTFOLIO_DATA: PortfolioData = {
  profile: {
    brandName: 'SWIZZCONCEPTS',
    fullName: 'Chukwuma Jefferson Nnaji',
    title: 'AI Automation Specialist',
    roleLabels: [
      'AI Automation Specialist',
      'Workflow Automation Engineer',
      'AI Solutions Builder',
    ],
    location: 'Enugu, Nigeria',
    availabilityText: 'Available for Automation Projects & Technical Roles',
    isAvailable: true,
    portraitUrl: '/assets/aistudio/file_00000000e16c8210b57d63895edd10dd_09cba69d.png',
    email: 'nnajichukwumajefferson@gmail.com',
    whatsappUrl: 'https://wa.me/2348168819791',
    whatsappDisplay: '+234(0)8168819791',
    linkedinUrl: 'https://www.linkedin.com/in/nnaji-chukwuma-jefferson',
    linkedinHandle: 'linkedin.com/in/nnaji-chukwuma-jefferson',
    bookingUrl: '',
    bookingButtonLabel: 'Book a Discovery Call',
  },
  siteContent: {
    heroHeadline: 'Transforming Business Processes Into Intelligent Automated Systems.',
    heroSupportingText:
      'I design and build intelligent automation solutions that connect applications, eliminate repetitive tasks, and help businesses operate smarter, faster, and more efficiently.',
    aboutHeadline: 'I build systems that do the repetitive work, so people can do the meaningful work.',
    aboutBioParagraphs: [
      'I am Chukwuma Jefferson Nnaji, an AI Automation Specialist and Workflow Automation Engineer operating under SWIZZCONCEPTS from Enugu, Nigeria. My work centers on turning fragmented, manual operational steps into reliable, self-running workflows powered by APIs, structured data pipelines, and large language models.',
      'My technical foundation was built through intensive formal AI and Automation training at TS Academy, where I mastered visual orchestration across n8n, Make.com, and Zapier alongside REST APIs, webhooks, CRM pipelines, and Retrieval-Augmented Generation (RAG) architectures.',
      'During my practical internship at Big Brains, I moved from classroom theory into production-oriented engineering—designing, testing, and debugging end-to-end automation systems including an AI-powered Lead Qualification CRM that scores, classifies, and routes incoming prospects automatically.',
    ],
    aboutPillarsTitle: 'Core Engineering Focus',
    aboutPillarsSubtitle: 'Practical disciplines applied across client and internal workflows.',
    aboutPillars: [
      'AI & Automation training at TS Academy',
      'Practical internship at Big Brains',
      'Workflow automation with n8n, Make.com & Zapier',
      'REST API and webhook integrations',
      'AI agent development & prompt engineering',
      'RAG-based knowledge systems',
      'AI-powered lead qualification CRM',
      'End-to-end practical automation builds',
    ],
    timelineHeadline: 'From Curiosity to Production Automation Systems',
    servicesHeadline: 'Intelligent Automation & Systems Engineering',
    servicesSubtext:
      'Practical, maintainable systems designed around your existing applications, APIs, and operational workflows.',
    projectsHeadline: 'Practical Automation Systems & Case Studies',
    projectsSubtext:
      'Every project solves an operational problem through structured workflows, API integrations, and AI reasoning.',
    skillsHeadline: 'Tools, Platforms & Honest Proficiency',
    skillsSubtext:
      'Organized by engineering domain with transparent classification between hands-on practical builds and active learning.',
    credentialsHeadline: 'Formal Training & Applied Engineering Internship',
    credentialsSubtext:
      'Verified technical education and hands-on workflow execution across real business automation systems.',
    faqHeadline: 'Frequently Asked Questions',
    faqSubtext:
      'Clear answers on platform choice, API cost ownership, error recovery, timelines, and post-launch handover.',
    contactHeadline: "Let's Build Something Intelligent.",
    contactSubtext:
      'Have a repetitive operational bottleneck, disconnected software stack, or AI agent concept? Share your workflow goals below and let us design a dependable system.',
    contactFormTitle: 'Start a Project Conversation',
    contactFormSubtext:
      'Share your current tools and manual process—no generic sales pitch, just practical engineering feedback.',
    footerTagline: 'Chukwuma Jefferson Nnaji · Enugu, Nigeria',
  },
  blueprints: [
    {
      id: 'bp-lead',
      label: 'B2B Lead Qualification',
      stackSummary: 'Fillout · n8n · OpenAI · HubSpot',
      triggerSource: 'Fillout Intake Webhook',
      triggerMethod: 'POST /webhooks/lead-intake',
      inboundText:
        'Operations team of 25 looking to automate HubSpot follow-ups and invoice extraction.',
      triggerMeta: 'Validated JSON payload · Deduplicated email',
      classification: 'High-Intent ICP · Automation Build',
      aiModel: 'LLM Structured Extractor',
      aiActionMeta: 'Scored company size, urgency & workflow scope',
      crmTarget: 'HubSpot + Airtable CRM',
      crmAction: 'Created Deal #418 · Assigned Priority Tier A · Sent Slack Brief',
      crmMeta: 'Idempotent upsert · Owner notified',
      latencyLabel: '1.4s end-to-end',
      outputJson: {
        intent: 'workflow_automation',
        qualification_tier: 'Tier A',
        crm_sync: 'hubspot_upserted',
        next_action: 'notify_sales_slack',
      },
      features: [
        { label: 'Webhook Auth', value: 'HMAC signature + email dedupe key', statusTag: 'Verified', icon: 'auth' },
        { label: 'Schema Guardrail', value: 'Strict JSON enum & tier validation', statusTag: 'Validated', icon: 'schema' },
        { label: 'Retry & Fallback', value: '3x backoff + Slack dead-letter alert', statusTag: 'Armed', icon: 'retry' },
        { label: 'Idempotent Sync', value: 'Upserted by contact email & domain', statusTag: 'Synced', icon: 'sync' },
        { label: 'Execution SLA', value: '1.4s median · 99.9% completion', statusTag: 'Passed', icon: 'latency' },
        { label: 'Audit & Notify', value: 'Deal #418 brief posted to #sales-ops', statusTag: 'Dispatched', icon: 'audit' },
      ],
    },
    {
      id: 'bp-support',
      label: 'Telegram Support Triage',
      stackSummary: 'Telegram · n8n · Gemini · Airtable',
      triggerSource: 'Telegram Bot Webhook',
      triggerMethod: 'POST /webhooks/telegram-updates',
      inboundText:
        'Order #SWZ-2094 has not arrived yet; can I get the current dispatch update?',
      triggerMeta: 'Parsed chat_id & order reference token',
      classification: 'Order Status Lookup · Dispatch Query',
      aiModel: 'AI Intent Classifier',
      aiActionMeta: 'Extracted order ID & mapped dispatch query intent',
      crmTarget: 'Airtable Dispatch Table',
      crmAction: 'Queried Record #SWZ-2094 · Sent Live ETA Reply on Telegram',
      crmMeta: 'Thread logged · Escalation bypassed',
      latencyLabel: '0.9s end-to-end',
      outputJson: {
        channel: 'telegram',
        intent: 'delivery_lookup',
        order_ref: 'SWZ-2094',
        resolution: 'auto_replied',
      },
      features: [
        { label: 'Webhook Auth', value: 'Telegram secret token header check', statusTag: 'Verified', icon: 'auth' },
        { label: 'Schema Guardrail', value: 'Regex + LLM order code verification', statusTag: 'Validated', icon: 'schema' },
        { label: 'Retry & Fallback', value: 'Human escalation if order missing', statusTag: 'Armed', icon: 'retry' },
        { label: 'Idempotent Sync', value: 'Thread state keyed by chat_id', statusTag: 'Synced', icon: 'sync' },
        { label: 'Execution SLA', value: '0.9s instant customer response', statusTag: 'Passed', icon: 'latency' },
        { label: 'Audit & Notify', value: 'Transcript archived in Airtable', statusTag: 'Dispatched', icon: 'audit' },
      ],
    },
    {
      id: 'bp-rag',
      label: 'RAG Knowledge Assistant',
      stackSummary: 'Slack · Make/n8n · Vector DB · Gemini',
      triggerSource: 'Internal Ops Webhook',
      triggerMethod: 'POST /webhooks/ops-knowledge',
      inboundText:
        'What is our client onboarding SLA for custom REST API webhook integrations?',
      triggerMeta: 'Authenticated workspace request · Role verified',
      classification: 'Knowledge Retrieval · SOP Policy',
      aiModel: 'RAG Grounded Agent',
      aiActionMeta: 'Embedded query & retrieved top-3 SOP passages',
      crmTarget: 'Supabase Vector Store',
      crmAction: 'Retrieved 3 SOP Chunks · Synthesized Grounded Citation Reply',
      crmMeta: 'Source verified · Audit record saved',
      latencyLabel: '1.7s end-to-end',
      outputJson: {
        retrieval: 'vector_top_3',
        grounded: 'true',
        source_doc: 'onboarding_sla_v2',
        confidence: 'verified',
      },
      features: [
        { label: 'Webhook Auth', value: 'Slack workspace signing & role check', statusTag: 'Verified', icon: 'auth' },
        { label: 'Schema Guardrail', value: 'Citation-only grounding enforcement', statusTag: 'Validated', icon: 'schema' },
        { label: 'Retry & Fallback', value: 'Zero-hallucination fallback response', statusTag: 'Armed', icon: 'retry' },
        { label: 'Idempotent Sync', value: 'Cached embedding lookup per query', statusTag: 'Synced', icon: 'sync' },
        { label: 'Execution SLA', value: '1.7s top-k pgvector retrieval', statusTag: 'Passed', icon: 'latency' },
        { label: 'Audit & Notify', value: 'Source version logged per answer', statusTag: 'Dispatched', icon: 'audit' },
      ],
    },
    {
      id: 'bp-audit',
      label: 'AI Audit Report Generator',
      stackSummary: 'Tally · n8n · OpenAI · Google Docs',
      triggerSource: 'Tally Audit Assessment',
      triggerMethod: 'POST /webhooks/audit-submit',
      inboundText:
        'Submitted 18 operational workflow responses covering CRM hygiene and manual invoicing.',
      triggerMeta: 'Normalized 18 form fields · Schema checked',
      classification: 'Ops Bottleneck Audit · Quick Wins',
      aiModel: 'Multi-Step Report Synthesizer',
      aiActionMeta: 'Identified 4 repetitive bottlenecks & ROI steps',
      crmTarget: 'Google Docs + Gmail Dispatch',
      crmAction: 'Generated Branded PDF Report · Logged Link in Airtable CRM',
      crmMeta: 'Delivered to client inbox · CRM attached',
      latencyLabel: '3.2s end-to-end',
      outputJson: {
        bottlenecks_found: '4',
        top_priority: 'invoice_ocr_sync',
        doc_generated: 'google_docs_pdf',
        delivery: 'gmail_dispatched',
      },
      features: [
        { label: 'Webhook Auth', value: 'Tally signature & submission ID check', statusTag: 'Verified', icon: 'auth' },
        { label: 'Schema Guardrail', value: '18-field normalizer & ROI calculator', statusTag: 'Validated', icon: 'schema' },
        { label: 'Retry & Fallback', value: 'Docs PDF export retry with 2s delay', statusTag: 'Armed', icon: 'retry' },
        { label: 'Idempotent Sync', value: 'Single report link per submission ID', statusTag: 'Synced', icon: 'sync' },
        { label: 'Execution SLA', value: '3.2s full multi-page PDF synthesis', statusTag: 'Passed', icon: 'latency' },
        { label: 'Audit & Notify', value: 'Client email + CRM attachment logged', statusTag: 'Dispatched', icon: 'audit' },
      ],
    },
    {
      id: 'bp-travel',
      label: 'Airline Travel Notifications',
      stackSummary: 'Flight API · n8n · AI Classifier · WhatsApp',
      triggerSource: 'Scheduled Flight API Poll',
      triggerMethod: 'GET /v2/flights/status-watch',
      inboundText:
        'Flight W3-402 departure shifted by +45m; boarding gate changed from B4 to B9.',
      triggerMeta: 'Diff detected against cached schedule state',
      classification: 'Schedule Delay + Gate Change Alert',
      aiModel: 'Alert Priority Classifier',
      aiActionMeta: 'Composed concise passenger update with new gate',
      crmTarget: 'WhatsApp + Airtable Itinerary',
      crmAction: 'Updated Passenger Itinerary Record · Dispatched WhatsApp Alert',
      crmMeta: 'Duplicate alert prevented · State synced',
      latencyLabel: '1.1s end-to-end',
      outputJson: {
        flight_code: 'W3-402',
        change_type: 'delay_and_gate',
        new_gate: 'B9',
        notification: 'whatsapp_sent',
      },
      features: [
        { label: 'Webhook Auth', value: 'Signed API poll + state hash diffing', statusTag: 'Verified', icon: 'auth' },
        { label: 'Schema Guardrail', value: 'Verified IATA gate & time delta', statusTag: 'Validated', icon: 'schema' },
        { label: 'Retry & Fallback', value: 'SMS fallback if WhatsApp undelivered', statusTag: 'Armed', icon: 'retry' },
        { label: 'Idempotent Sync', value: 'State hash blocks duplicate alerts', statusTag: 'Synced', icon: 'sync' },
        { label: 'Execution SLA', value: '1.1s diff-to-WhatsApp dispatch', statusTag: 'Passed', icon: 'latency' },
        { label: 'Audit & Notify', value: 'Passenger itinerary timeline updated', statusTag: 'Dispatched', icon: 'audit' },
      ],
    },
    {
      id: 'bp-invoice',
      label: 'Invoice & Ledger OCR',
      stackSummary: 'Gmail · n8n · Vision AI · QuickBooks',
      triggerSource: 'Gmail Invoice Attachment Trigger',
      triggerMethod: 'POST /webhooks/ap-invoice-ocr',
      inboundText:
        'Vendor PDF #INV-8841 ($2,450.00): Cloud infra & API retainer for November billing cycle.',
      triggerMeta: 'Extracted PDF stream · Verified vendor whitelist',
      classification: 'Accounts Payable · Software Expense',
      aiModel: 'Multimodal Invoice Extractor',
      aiActionMeta: 'Parsed line items, tax rate & GL cost center',
      crmTarget: 'QuickBooks + Slack Finance',
      crmAction: 'Created Draft Bill #INV-8841 · Routed Slack Approval Card',
      crmMeta: 'Receipt archived · Ledger reconciled',
      latencyLabel: '2.1s end-to-end',
      outputJson: {
        invoice_no: 'INV-8841',
        total_usd: '2450.00',
        gl_category: 'cloud_infrastructure',
        ledger_status: 'pending_approval',
      },
      features: [
        { label: 'Webhook Auth', value: 'OAuth Gmail watch + vendor allowlist', statusTag: 'Verified', icon: 'auth' },
        { label: 'Schema Guardrail', value: 'Line-item sum equals invoice total', statusTag: 'Validated', icon: 'schema' },
        { label: 'Retry & Fallback', value: 'Flagged for manual review on mismatch', statusTag: 'Armed', icon: 'retry' },
        { label: 'Idempotent Sync', value: 'Deduplicated by vendor + invoice_no', statusTag: 'Synced', icon: 'sync' },
        { label: 'Execution SLA', value: '2.1s OCR parse to QuickBooks draft', statusTag: 'Passed', icon: 'latency' },
        { label: 'Audit & Notify', value: 'PDF linked + Slack CFO approval ping', statusTag: 'Dispatched', icon: 'audit' },
      ],
    },
  ],
  timeline: [
    {
      id: 'tl-1',
      stepNumber: '01',
      title: 'Curiosity',
      subtitle: 'Systems Thinking & Process Discovery',
      description:
        'Explored how everyday business teams lose hours to copy-pasting across forms, spreadsheets, inboxes, and messaging tools—sparking a focus on connected digital workflows.',
    },
    {
      id: 'tl-2',
      stepNumber: '02',
      title: 'TS Academy',
      subtitle: 'AI & Automation Training',
      description:
        'Completed structured hands-on training in n8n, Make.com, Zapier, webhook engineering, OAuth/REST APIs, AI agents, prompt engineering, and RAG-based knowledge systems.',
    },
    {
      id: 'tl-3',
      stepNumber: '03',
      title: 'Big Brains',
      subtitle: 'AI Automation Internship',
      description:
        'Designed, tested, and debugged production-grade automation pipelines—highlighted by an AI-powered Lead Qualification CRM integrating LLM scoring with structured CRM records.',
    },
    {
      id: 'tl-4',
      stepNumber: '04',
      title: 'Building Intelligent Automation Solutions',
      subtitle: 'SWIZZCONCEPTS Practice',
      description:
        'Architecting practical AI agents, RAG assistants, messaging bots, reporting pipelines, and multi-app integrations that solve concrete operational problems.',
    },
  ],
  services: [
    {
      id: 'srv-workflow',
      title: 'Workflow Automation',
      icon: 'Workflow',
      shortDescription:
        'End-to-end orchestration connecting your SaaS tools, triggers, conditional logic, and error-handling paths without manual handoffs.',
      capabilities: [
        'Multi-step n8n, Make.com, and Zapier orchestration',
        'Webhook-driven event routing and retry safeguards',
        'Scheduled batch jobs and conditional branching',
      ],
      howItWorks: {
        trigger: 'Event captured via Webhook, Form submission, or Cron schedule',
        processing: 'Payload validated, transformed in JavaScript/JSON, and routed through conditional nodes',
        output: 'Synchronized updates dispatched across target apps with error alerting',
        summary: 'Eliminates manual data re-entry and enforces deterministic execution logs.',
      },
    },
    {
      id: 'srv-ai-agents',
      title: 'AI Agent Development',
      icon: 'Bot',
      shortDescription:
        'Goal-oriented AI agents equipped with structured prompts, tool-calling capabilities, memory, and deterministic guardrails.',
      capabilities: [
        'Tool-calling agents connected to live APIs and databases',
        'Structured JSON output schemas for reliable downstream actions',
        'Context-aware routing, triage, and multi-step reasoning',
      ],
      howItWorks: {
        trigger: 'User inquiry, inbound message, or operational event received',
        processing: 'LLM evaluates intent, selects authorized tools, and validates structured JSON response',
        output: 'Accurate action executed in CRM, database, or messaging channel',
        summary: 'Turns unstructured natural language into verified operational actions.',
      },
    },
    {
      id: 'srv-bpa',
      title: 'Business Process Automation',
      icon: 'Cpu',
      shortDescription:
        'Comprehensive mapping and automation of recurring internal operations—from approvals and onboarding to reporting.',
      capabilities: [
        'Operational bottleneck auditing and workflow blueprinting',
        'Automated status notifications and audit report generation',
        'Cross-department data synchronization',
      ],
      howItWorks: {
        trigger: 'Internal milestone, daily schedule, or status change in workspace',
        processing: 'Records aggregated, summarized, and verified against business rules',
        output: 'Formatted executive reports or approval tasks delivered automatically',
        summary: 'Reduces cycle times and creates consistent, auditable execution.',
      },
    },
    {
      id: 'srv-crm',
      title: 'CRM and Lead Management Automation',
      icon: 'Users',
      shortDescription:
        'Intelligent lead capture, enrichment, AI qualification scoring, and automated pipeline updates inside HubSpot or Airtable CRM.',
      capabilities: [
        'Automated lead scoring and ICP classification via LLMs',
        'Deduplication, contact enrichment, and owner assignment',
        'Instant follow-up sequences triggered by qualification tier',
      ],
      howItWorks: {
        trigger: 'New lead submitted via Fillout, Tally, or landing page webhook',
        processing: 'AI classifies intent, budget fit, and urgency into structured CRM fields',
        output: 'HubSpot or Airtable CRM updated with score, notes, and instant Slack/email alert',
        summary: 'Ensures sales teams focus immediately on high-intent prospects.',
      },
    },
    {
      id: 'srv-api',
      title: 'API Integration',
      icon: 'Plug',
      shortDescription:
        'Custom REST API, HTTP Request, and OAuth integrations bridging platforms that do not have native out-of-the-box connectors.',
      capabilities: [
        'Custom HTTP Request nodes with pagination and auth headers',
        'OAuth 2.0 token handling and secure webhook verification',
        'JSON schema normalization between incompatible endpoints',
      ],
      howItWorks: {
        trigger: 'Upstream system emits webhook or scheduled sync initiates',
        processing: 'Authenticated REST calls exchange, map, and normalize JSON payloads',
        output: 'Consistent records persisted cleanly across disparate software systems',
        summary: 'Unlocks seamless interoperability without brittle manual CSV exports.',
      },
    },
    {
      id: 'srv-support',
      title: 'AI-Powered Customer Support',
      icon: 'MessageSquareText',
      shortDescription:
        'Responsive 24/7 conversational support assistants on Telegram, WhatsApp, and web channels backed by verified business knowledge.',
      capabilities: [
        'Telegram and WhatsApp automated inquiry resolution',
        'Intent classification with seamless human escalation',
        'Order, delivery, and ticket status lookup integrations',
      ],
      howItWorks: {
        trigger: 'Customer sends a message via Telegram, WhatsApp, or support form',
        processing: 'AI classifies request, queries knowledge base or order database, drafts reply',
        output: 'Instant grounded answer sent or escalated to support staff with context summary',
        summary: 'Cuts first-response wait times while preserving escalation accuracy.',
      },
    },
    {
      id: 'srv-data',
      title: 'Data Processing and Automation',
      icon: 'DatabaseZap',
      shortDescription:
        'Automated extraction, cleaning, classification, and structured storage of unstructured emails, PDFs, forms, and spreadsheets.',
      capabilities: [
        'AI information extraction from documents and messages',
        'Automated validation and normalization into Airtable, Sheets, or Supabase',
        'Scheduled data hygiene and deduplication pipelines',
      ],
      howItWorks: {
        trigger: 'New file, email attachment, or raw form payload enters pipeline',
        processing: 'AI extraction parses key entities and JavaScript cleans formatting',
        output: 'Structured rows written directly to Google Sheets, Airtable, or Supabase',
        summary: 'Eliminates manual transcription errors across reporting databases.',
      },
    },
    {
      id: 'srv-rag',
      title: 'RAG-Based Knowledge Systems',
      icon: 'BookOpenCheck',
      shortDescription:
        'Retrieval-Augmented Generation assistants grounded strictly in your organization documents, SOPs, and vector databases.',
      capabilities: [
        'Document chunking, embedding pipelines, and vector indexing',
        'Context-grounded prompt engineering to minimize hallucinations',
        'Automated sync when source documents or knowledge sheets update',
      ],
      howItWorks: {
        trigger: 'User asks a domain question or new knowledge document is uploaded',
        processing: 'Semantic vector search retrieves top relevant passages for LLM synthesis',
        output: 'Accurate, source-grounded answer returned with clear context boundaries',
        summary: 'Turns scattered internal SOPs and PDFs into an instant queryable assistant.',
      },
    },
  ],
  projects: [
    {
      id: 'proj-rag-assistant',
      title: 'RAG-Powered AI Knowledge Assistant',
      category: 'RAG & Knowledge Systems',
      status: 'Production Ready',
      featured: true,
      overview:
        'A retrieval-augmented AI assistant built to answer complex operational and policy questions using verified internal documents rather than generic model guesses.',
      businessProblem:
        'Teams waste valuable time digging through scattered PDFs, SOP documents, and shared folders to locate accurate answers to recurring operational questions.',
      solutionImplemented:
        'Engineered an automated document ingestion and retrieval pipeline in n8n paired with vector embeddings and structured LLM prompting so every response is grounded in indexed source chunks.',
      tools: ['n8n', 'OpenAI', 'Google Gemini', 'Vector Databases', 'Supabase', 'Webhooks'],
      workflowSteps: [
        'Document upload or update triggers ingestion webhook',
        'Text extracted, split into semantic chunks, and embedded into vector store',
        'User query triggers similarity search for top matching context passages',
        'LLM synthesizes grounded response with fallback when context is missing',
      ],
      workflowExplanation:
        'The system separates ingestion from querying: whenever source documentation changes, an n8n indexing flow updates the vector store automatically. At query time, user questions are embedded, matched against stored vectors, and passed into a strict prompt template that restricts answers to retrieved facts.',
      businessValue:
        'Centralizes institutional knowledge into a single queryable interface, reducing internal search friction and improving answer consistency across staff.',
      coverImageUrl: '/assets/aistudio/IMG-20261020-WA0210_d3a08e76.jpg',
    },
    {
      id: 'proj-audit-report',
      title: 'AI-Powered Audit Report Generator',
      category: 'AI Agents & Reporting',
      status: 'Completed',
      featured: true,
      overview:
        'An automated assessment and reporting pipeline that converts raw audit intake submissions into structured, client-ready diagnostic reports.',
      businessProblem:
        'Preparing tailored workflow or operational audit reports manually after discovery questionnaires requires hours of repetitive synthesis and formatting.',
      solutionImplemented:
        'Connected Fillout/Tally intake forms via webhooks to an n8n AI analysis workflow that scores findings, generates structured recommendations, and delivers formatted audit summaries.',
      tools: ['n8n', 'OpenAI', 'Fillout', 'JSON', 'Google Sheets', 'Gmail'],
      workflowSteps: [
        'Client completes structured audit assessment form',
        'Webhook delivers JSON answers to n8n orchestration engine',
        'AI agent evaluates bottlenecks and drafts structured gap-analysis sections',
        'Formatted report archived in Google Sheets and emailed automatically',
      ],
      workflowExplanation:
        'Form responses trigger a multi-node evaluation pipeline. A JavaScript normalization node scores numeric readiness inputs while an LLM drafts tailored process recommendations constrained to a strict JSON schema before compiling the final report.',
      businessValue:
        'Shortens report turnaround time from hours of manual drafting to minutes while ensuring consistent diagnostic structure for every prospect.',
    },
    {
      id: 'proj-telegram-support',
      title: 'Telegram AI Customer Support Bot',
      category: 'AI Customer Support',
      status: 'Active System',
      featured: true,
      overview:
        'An intelligent conversational support bot on Telegram capable of handling FAQs, classifying customer issues, and routing complex requests to human operators.',
      businessProblem:
        'High volumes of repetitive Telegram inquiries overwhelm small support teams and delay responses outside standard working hours.',
      solutionImplemented:
        'Built a Telegram Bot webhook listener in n8n integrated with LLM intent classification, conversation context tracking, and automated escalation alerts.',
      tools: ['n8n', 'Telegram', 'OpenAI', 'Google Gemini', 'Airtable', 'Webhooks'],
      workflowSteps: [
        'Incoming Telegram message arrives via Bot API webhook',
        'AI agent classifies intent (FAQ, billing, technical issue, escalation)',
        'Knowledge lookup generates accurate reply or logs support ticket in Airtable',
        'Bot sends immediate response back to the user in Telegram',
      ],
      workflowExplanation:
        'Every Telegram update hits an n8n webhook node. After checking session history in Airtable, an AI classifier determines whether the query can be resolved directly from approved knowledge or requires tagging a human team member with a concise ticket summary.',
      businessValue:
        'Provides immediate 24/7 responsiveness for routine inquiries while keeping human agents focused on high-priority support cases.',
    },
    {
      id: 'proj-daily-bi',
      title: 'Daily Business Intelligence Reporter',
      category: 'Data & Reporting',
      status: 'Completed',
      overview:
        'A scheduled automation pipeline that aggregates daily operational metrics from databases and spreadsheets into concise executive briefings.',
      businessProblem:
        'Decision-makers frequently lack a single daily snapshot because sales, support, and task metrics live across separate spreadsheets and apps.',
      solutionImplemented:
        'Designed a cron-scheduled workflow that queries Airtable, Google Sheets, and CRM endpoints, computes daily deltas via JavaScript, and delivers an AI-summarized briefing to Slack and Gmail.',
      tools: ['n8n', 'Make.com', 'Google Sheets', 'Airtable', 'Slack', 'Gmail', 'JavaScript'],
      workflowSteps: [
        'Scheduled trigger runs at end-of-day cutoff',
        'HTTP & database nodes pull daily leads, tickets, and activity records',
        'JavaScript node calculates totals and flags anomalies',
        'LLM summarizes highlights and dispatches formatted digest to Slack and email',
      ],
      workflowExplanation:
        'Instead of raw spreadsheet dumps, the workflow performs deterministic arithmetic first in JavaScript, then passes verified aggregate figures to an LLM solely to produce clear prose commentary delivered to leadership channels.',
      businessValue:
        'Replaces manual end-of-day spreadsheet compilation with a reliable, repeatable executive summary every morning.',
    },
    {
      id: 'proj-job-tracker',
      title: 'Automated Job Application Tracker',
      category: 'Workflow Automation',
      status: 'Completed',
      overview:
        'An email-driven tracking automation that monitors job application confirmations, interview invitations, and status updates into a structured database.',
      businessProblem:
        'Tracking dozens of active applications across email threads quickly leads to missed follow-ups, lost links, and disorganized spreadsheets.',
      solutionImplemented:
        'Connected Gmail triggers to an AI information-extraction pipeline that parses company name, role title, application stage, and next steps directly into Airtable and Google Sheets.',
      tools: ['n8n', 'Zapier', 'Gmail', 'AI Classification', 'Information Extraction', 'Airtable'],
      workflowSteps: [
        'New inbox message matching application keywords triggers pipeline',
        'AI classifier filters out newsletters and extracts structured job metadata',
        'Upsert logic checks Airtable for existing company/role record',
        'Record created or stage updated with interview dates and email summary',
      ],
      workflowExplanation:
        'Incoming emails are filtered and passed through an information-extraction prompt returning strict JSON (company, role, status, action_date). An upsert routine updates existing rows instead of creating duplicates.',
      businessValue:
        'Maintains an always-current, searchable application pipeline with zero manual spreadsheet entry.',
      coverImageUrl: '/assets/aistudio/IMG-20260813-WA0144_114cc1d3.jpg',
    },
    {
      id: 'proj-airline-notify',
      title: 'Airline Travel Notification Automation',
      category: 'API & Notifications',
      status: 'Completed',
      overview:
        'A real-time flight monitoring and traveler alert workflow that checks itinerary status via REST APIs and sends proactive departure or delay notifications.',
      businessProblem:
        'Travelers and coordinators miss gate changes, schedule shifts, or check-in windows when relying on manual airline portal checks.',
      solutionImplemented:
        'Integrated flight status REST API polling with conditional state comparison in n8n to push timely updates over Telegram, WhatsApp, and Gmail.',
      tools: ['n8n', 'REST APIs', 'HTTP Requests', 'JSON', 'Telegram', 'Gmail'],
      workflowSteps: [
        'Active flight records queried from schedule table on interval',
        'HTTP Request node fetches live flight status JSON from aviation API',
        'Conditional node detects gate, delay, or boarding status changes',
        'Formatted travel alert dispatched instantly to traveler channel',
      ],
      workflowExplanation:
        'To avoid noisy repeat messages, the workflow compares the latest API payload against the last recorded flight state in storage and fires notifications strictly on meaningful status transitions.',
      businessValue:
        'Delivers proactive itinerary visibility and reduces missed updates for travelers and operations coordinators.',
      coverImageUrl: '/assets/aistudio/IMG-20260810-WA0045_bdd1100c.jpg',
    },
    {
      id: 'proj-b2b-lead-crm',
      title: 'B2B Lead Generation and Qualification',
      category: 'CRM & Lead Ops',
      status: 'Production Ready',
      featured: true,
      overview:
        'An AI-powered Lead Qualification CRM pipeline engineered during my Big Brains internship to capture, score, classify, and route B2B prospects automatically.',
      businessProblem:
        'Manual lead triage slows down response speed and causes sales teams to spend equal time on unqualified inquiries and high-fit B2B opportunities.',
      solutionImplemented:
        'Built an end-to-end n8n workflow linking lead capture forms and enrichment APIs with LLM lead scoring, structured classification, and HubSpot/Airtable CRM record management.',
      tools: ['n8n', 'OpenAI', 'HubSpot', 'Airtable CRM', 'Fillout', 'Slack', 'Prompt Engineering'],
      workflowSteps: [
        'Inbound B2B prospect submits qualification form or enrichment webhook fires',
        'JavaScript normalizes company domain and contact metadata',
        'AI scoring engine assigns fit tier, urgency, and concise qualification rationale',
        'CRM record created/updated in HubSpot and Airtable with Slack alert for hot leads',
      ],
      workflowExplanation:
        'Prompt engineering rules evaluate company size, stated pain points, and service alignment against defined ICP criteria. High-priority leads trigger instant Slack notifications with a pre-drafted outreach brief.',
      businessValue:
        'Standardizes lead qualification criteria and ensures high-intent B2B inquiries receive rapid, well-informed follow-up.',
    },
    {
      id: 'proj-swizz-care',
      title: 'Swizz Care Feedback & Service',
      category: 'AI Customer Support',
      status: 'Active System',
      overview:
        'An automated customer feedback collection, sentiment classification, and service recovery system built under the SWIZZCONCEPTS ecosystem.',
      businessProblem:
        'Unreviewed customer feedback forms hide urgent dissatisfaction signals and miss opportunities to resolve service issues promptly.',
      solutionImplemented:
        'Connected Tally/Fillout feedback forms to an AI sentiment and urgency classifier that logs categorized insights in Airtable and routes negative feedback for immediate follow-up.',
      tools: ['Make.com', 'n8n', 'Tally', 'AI Classification', 'Airtable', 'WhatsApp', 'Gmail'],
      workflowSteps: [
        'Customer submits post-service feedback through Tally form',
        'AI classification analyzes sentiment, topic category, and urgency',
        'Structured feedback stored in Airtable service dashboard',
        'Urgent issues trigger instant service-recovery alert; positive feedback receives thank-you note',
      ],
      workflowExplanation:
        'By pairing lightweight form collection with deterministic routing rules, positive reviews are archived cleanly while negative or urgent entries immediately notify the service lead with actionable context.',
      businessValue:
        'Closes the feedback loop automatically and prevents critical customer service concerns from going unnoticed.',
    },
    {
      id: 'proj-telegram-delivery',
      title: 'Telegram Delivery Bot Reply',
      category: 'API & Notifications',
      status: 'Completed',
      overview:
        'A responsive Telegram logistics assistant that processes customer delivery inquiries, looks up dispatch records, and sends structured status replies.',
      businessProblem:
        'Delivery teams spend repetitive hours answering "where is my order?" messages manually across chat threads.',
      solutionImplemented:
        'Integrated Telegram Bot webhooks with an Airtable/Google Sheets dispatch lookup and AI-formatted natural-language status replies.',
      tools: ['n8n', 'Telegram', 'Webhooks', 'Airtable', 'Google Sheets', 'OpenAI'],
      workflowSteps: [
        'Customer sends tracking reference or delivery question to Telegram bot',
        'Information extraction pulls order ID or phone reference from message',
        'Workflow queries dispatch sheet/Airtable for current delivery milestone',
        'Bot replies with clear status, ETA context, or dispatch escalation',
      ],
      workflowExplanation:
        'Combines regex/AI entity extraction with a real-time lookup against the active dispatch table so customers receive accurate, polite delivery updates in seconds without interrupting dispatch staff.',
      businessValue:
        'Reduces repetitive manual chat replies for dispatch teams and gives customers instant order transparency.',
    },
  ],
  skillCategories: [
    {
      id: 'cat-workflow',
      name: 'Workflow Automation',
      items: [
        { id: 'sk-n8n', name: 'n8n', proficiency: 'Practical Experience' },
        { id: 'sk-make', name: 'Make.com', proficiency: 'Practical Experience' },
        { id: 'sk-zapier', name: 'Zapier', proficiency: 'Practical Experience' },
      ],
    },
    {
      id: 'cat-ai',
      name: 'Artificial Intelligence',
      items: [
        { id: 'sk-openai', name: 'OpenAI', proficiency: 'Practical Experience' },
        { id: 'sk-gemini', name: 'Google Gemini', proficiency: 'Practical Experience' },
        { id: 'sk-llms', name: 'Large Language Models', proficiency: 'Practical Experience' },
        { id: 'sk-agents', name: 'AI Agents', proficiency: 'Practical Experience' },
        { id: 'sk-prompt', name: 'Prompt Engineering', proficiency: 'Practical Experience' },
        { id: 'sk-rag', name: 'RAG', proficiency: 'Practical Experience' },
        { id: 'sk-class', name: 'AI Classification', proficiency: 'Practical Experience' },
        { id: 'sk-extract', name: 'Information Extraction', proficiency: 'Practical Experience' },
      ],
    },
    {
      id: 'cat-api',
      name: 'API and Integration',
      items: [
        { id: 'sk-rest', name: 'REST APIs', proficiency: 'Practical Experience' },
        { id: 'sk-webhooks', name: 'Webhooks', proficiency: 'Practical Experience' },
        { id: 'sk-http', name: 'HTTP Requests', proficiency: 'Practical Experience' },
        { id: 'sk-json', name: 'JSON', proficiency: 'Practical Experience' },
        { id: 'sk-oauth', name: 'OAuth', proficiency: 'Practical Experience' },
      ],
    },
    {
      id: 'cat-db',
      name: 'Databases and Data',
      items: [
        { id: 'sk-airtable', name: 'Airtable', proficiency: 'Practical Experience' },
        { id: 'sk-sheets', name: 'Google Sheets', proficiency: 'Practical Experience' },
        { id: 'sk-supabase', name: 'Supabase', proficiency: 'Practical Experience' },
        { id: 'sk-postgres', name: 'PostgreSQL', proficiency: 'Learning' },
        { id: 'sk-vector', name: 'Vector Databases', proficiency: 'Practical Experience' },
      ],
    },
    {
      id: 'cat-crm',
      name: 'CRM and Business Tools',
      items: [
        { id: 'sk-hubspot', name: 'HubSpot', proficiency: 'Practical Experience' },
        { id: 'sk-airtable-crm', name: 'Airtable CRM', proficiency: 'Practical Experience' },
      ],
    },
    {
      id: 'cat-comms',
      name: 'Communication and Messaging',
      items: [
        { id: 'sk-telegram', name: 'Telegram', proficiency: 'Practical Experience' },
        { id: 'sk-whatsapp', name: 'WhatsApp', proficiency: 'Practical Experience' },
        { id: 'sk-slack', name: 'Slack', proficiency: 'Practical Experience' },
        { id: 'sk-gmail', name: 'Gmail', proficiency: 'Practical Experience' },
      ],
    },
    {
      id: 'cat-forms',
      name: 'Forms and Data Collection',
      items: [
        { id: 'sk-fillout', name: 'Fillout', proficiency: 'Practical Experience' },
        { id: 'sk-tally', name: 'Tally', proficiency: 'Practical Experience' },
      ],
    },
    {
      id: 'cat-dev',
      name: 'Development Tools',
      items: [
        { id: 'sk-js', name: 'JavaScript', proficiency: 'Practical Experience' },
      ],
    },
  ],
  credentials: [
    {
      id: 'cred-ts-academy',
      organization: 'TS Academy',
      roleTitle: 'AI & Automation Training',
      period: 'Formal Technical Training',
      summary:
        'Intensive applied training focused on designing multi-platform automation workflows, integrating third-party APIs, and deploying AI agents and RAG pipelines for business operations.',
      highlights: [
        'n8n',
        'Make.com',
        'Zapier',
        'AI Agents',
        'API Integrations',
        'Webhooks',
        'CRM Automation',
        'RAG-Based Systems',
      ],
      certificateTitle: 'Certificate of Completion — AI & Automation',
      certificateId: 'TSEGEZAWBCZUP9',
      issuedDate: 'October 30, 2026 · TS Academy Cohort',
      certificateImageUrl: '/assets/aistudio/Screenshot_20261119-152958.Gallery_dc04b7a0.jpg',
      linkedProjectIds: ['proj-rag-assistant', 'proj-audit-report'],
    },
    {
      id: 'cred-big-brains',
      organization: 'Big Brains',
      roleTitle: 'AI Automation Internship',
      period: 'Practical Industry Experience',
      summary:
        'Hands-on engineering internship designing, testing, and debugging production automation workflows—highlighted by architecting an AI-powered Lead Qualification CRM.',
      highlights: [
        'End-to-end n8n workflow development',
        'AI lead scoring and classification',
        'CRM data management',
        'Prompt engineering',
        'Workflow testing and debugging',
      ],
      certificateTitle: 'Certificate of Completion — AI Automation Using n8n',
      certificateId: 'BB-B25E8AFF8320',
      issuedDate: 'October 28, 2026 · Big Brains Internship',
      certificateImageUrl: '/assets/aistudio/Screenshot_20261119-153310.Gallery_c5c871b9.png',
      linkedProjectIds: ['proj-b2b-lead-crm', 'proj-daily-bi'],
    },
  ],
  faqs: [
    {
      id: 'faq-1',
      question: 'How do you decide between n8n, Make.com, and Zapier for my workflow?',
      answer:
        'I choose n8n when you want full data ownership, self-hosting options, complex JavaScript transformations, or cost-effective high-volume AI loops. Make.com works well for visual multi-branch SaaS orchestration, while Zapier is ideal for lightweight, quick-start triggers across standard business apps.',
    },
    {
      id: 'faq-2',
      question: 'Who owns the accounts, workflows, and OpenAI or Gemini API costs?',
      answer:
        'You retain 100% ownership. All workflows, webhooks, vector databases, and LLM API keys run inside your own workspace and billing accounts so there is zero vendor lock-in and full visibility into monthly API usage.',
    },
    {
      id: 'faq-3',
      question: 'How are errors, rate limits, and unexpected AI outputs handled?',
      answer:
        'Every production pipeline includes structured JSON schema validation, idempotency keys to avoid duplicate CRM records, exponential retry backoffs for transient API failures, and instant Slack, Telegram, or email alerts whenever human review is required.',
    },
    {
      id: 'faq-4',
      question: 'What is the typical timeline from discovery call to a live system?',
      answer:
        'Focused single-workflow automations (such as lead qualification or Telegram triage) typically go live within 5 to 7 business days. Multi-system AI agent or RAG knowledge architectures usually take 2 to 3 weeks including edge-case testing and documentation.',
    },
    {
      id: 'faq-5',
      question: 'Can you connect internal tools or APIs that do not have native integrations?',
      answer:
        'Yes. Using custom HTTP Request nodes, OAuth 2.0 flows, webhook listeners, and JavaScript payload normalization, I bridge custom backends, legacy CRMs, and industry-specific APIs directly into your automation stack.',
    },
    {
      id: 'faq-6',
      question: 'What documentation and support do I receive after handover?',
      answer:
        'You receive an architecture diagram, environment/credential setup notes, and a short recorded walkthrough showing how every trigger and fallback works, plus optional ongoing maintenance if your business tools evolve.',
    },
  ],
};
