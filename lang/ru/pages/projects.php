<?php

return [
    'breadcrumbs' => [
        'dashboard' => 'Главная',
        'list' => 'Мои проекты',
        'create' => 'Создание проекта',
    ],
    'actions' => [
        'create' => 'Создать проект',
        'save' => 'Сохранить',
        'cancel' => 'Отмена',
    ],
    'table' => [
        'name' => 'Название',
        'platform' => 'Платформа',
        'status' => 'Статус',
        'created' => 'Создан',
        'user' => 'Пользователь',
    ],
    'status' => [
        'pending' => 'На модерации',
        'approved' => 'Одобрен',
        'rejected' => 'Отклонен',
        'enabled' => 'Включен',
        'disabled' => 'Выключен',
    ],
    'empty' => [
        'title' => 'Проекты не найдены',
        'description' => 'Создайте новый проект, чтобы начать работу.',
    ],
    'form' => [
        'name' => 'Название магазина',
        'activity_type' => 'Вид деятельности',
        'description' => 'Описание проекта',
        'platform' => 'Платформа проекта',
        'project_url_website' => 'URL сайта',
        'project_url_telegram' => 'Ссылка на Telegram-бота',
        'project_url_vk' => 'Ссылка на VK-бота / группу',
        'project_url_other' => 'Ссылка на проект',
        'success_url' => 'Успешный URL',
        'fail_url' => 'Неудачный URL',
        'notify_url' => 'URL для уведомлений',
        'logo' => 'Логотип проекта',
        'token_networks' => 'Криптовалюты проекта',
        'test_mode' => 'Тестовый режим',
        'accept_terms' => 'Я принимаю условия сервиса',
    ],
    'validation' => [
        'tokens' => 'Выберите хотя бы одну сеть для приема платежей',
        'accept' => 'Необходимо принять условия сервиса',
    ],
    'notifications' => [
        'sent_to_moderation' => 'Проект отправлен на модерацию',
    ],
    'platforms' => [
        'website' => 'Сайт',
        'telegram_bot' => 'Telegram-бот',
        'vk_bot' => 'VK-бот / группа',
        'other' => 'Другое',
    ],
    'tabs' => [
        'settings' => 'Настройки проекта',
        'integration' => 'Интеграция и API',
        'currencies' => 'Валюты проекта',
        'fees' => 'Комиссии',
        'payment_page' => 'Постоянная страница оплаты',
    ],
    'integration' => [
        'shop_id' => 'Shop ID',
        'apikey_placeholder' => 'Сгенерируйте ключи API после одобрения проекта.',
        'tokens_placeholder' => 'Настройка валют будет доступна после одобрения проекта.',
        'fees_placeholder' => 'Управление комиссиями будет доступно после модерации.',
    ],
    'alerts' => [
        'pending' => 'Проект находится на модерации.',
        'rejected' => 'Проект отклонен. Причина: :reason',
    ],
];
