<?php

return [
    'breadcrumbs' => [
        'dashboard' => 'Dashboard',
        'list' => 'My projects',
        'create' => 'Create project',
    ],
    'actions' => [
        'create' => 'Create project',
        'save' => 'Save',
        'cancel' => 'Cancel',
        'next' => 'Next',
        'previous' => 'Back',
    ],
    'table' => [
        'name' => 'Name',
        'platform' => 'Platform',
        'status' => 'Status',
        'created' => 'Created at',
        'user' => 'User',
    ],
    'status' => [
        'pending' => 'Pending',
        'approved' => 'Approved',
        'rejected' => 'Rejected',
        'enabled' => 'Enabled',
        'disabled' => 'Disabled',
    ],
    'empty' => [
        'title' => 'No projects yet',
        'description' => 'Create a new project to start accepting payments.',
    ],
    'form' => [
        'name' => 'Store name',
        'activity_type' => 'Activity type',
        'description' => 'Project description',
        'platform' => 'Project platform',
        'project_url_website' => 'Website URL',
        'project_url_telegram' => 'Telegram bot link',
        'project_url_vk' => 'VK bot / group link',
        'project_url_other' => 'Project link',
        'success_url' => 'Success URL',
        'fail_url' => 'Fail URL',
        'notify_url' => 'Webhook URL',
        'logo' => 'Project logo',
        'token_networks' => 'Project currencies',
        'test_mode' => 'Test mode',
        'accept_terms' => 'I accept service terms',
    ],
    'steps' => [
        'details' => 'Basic information',
        'links' => 'Project settings',
        'currencies' => 'Project currencies',
    ],
    'helpers' => [
        'description' => 'Minimum 100 characters. Maximum 210 characters.',
        'logo_title' => 'Drag & drop your logo',
        'logo_description' => 'PNG, SVG or JPG up to 2 MB',
    ],
    'validation' => [
        'tokens' => 'Select at least one token network',
        'accept' => 'You must accept the service terms',
    ],
    'notifications' => [
        'sent_to_moderation' => 'Project sent for moderation',
    ],
    'platforms' => [
        'website' => 'Website',
        'telegram_bot' => 'Telegram bot',
        'vk_bot' => 'VK bot / group',
        'other' => 'Other',
    ],
    'tabs' => [
        'settings' => 'Project settings',
        'integration' => 'Integration & API',
        'currencies' => 'Project currencies',
        'fees' => 'Fees',
        'payment_page' => 'Permanent payment page',
    ],
    'integration' => [
        'shop_id' => 'Shop ID',
        'apikey_placeholder' => 'Generate API keys after the project is approved.',
        'tokens_placeholder' => 'Currencies setup will be available after approval.',
        'fees_placeholder' => 'Fees configuration will be available after moderation.',
    ],
    'alerts' => [
        'pending' => 'The project is under moderation.',
        'rejected' => 'The project was rejected. Reason: :reason',
    ],
];
