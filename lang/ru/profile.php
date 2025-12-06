<?php

return [
    'show' => [
      'profile' => 'Профиль',
      'profile_about' => 'О профиле',
      'nickname' => 'Ник:',
      'email' => 'Email:',
      'role' => 'Роль:',
      'status' => 'Статус:',
      'statistics' => 'Статистика',
    ],

    'edit' => [
      'menu' => [
        'account' => 'Аккаунт',
        'security' => 'Настройки безопасности'
      ],

      'account' => [
        'profile_detail' => 'Детали профиля',
        'photo' => [
          'upload_photo' => 'Загрузить фото',
          'reset_photo' => 'Сбросить на дефолт',
          'requirements_photo' => 'форматы JPG, GIF or PNG. Max size of 1МБ',
        ],
        'info' => [
          'nickname' => 'Ник:',
          'email' => 'Email:',
          'button_save' => 'Сохранить',
        ],
        'security' => [
          'title' => 'Изменение пароля',
          'current_password' => 'Текущий пароль',
          'new_password' => 'Новый пароль',
          'confirm_new_password' => 'Повторите новый пароль',
          'password_requirements' => [
            'title' => 'Условия пароля:',
            'minimum' => 'Длина не менее 8 символов',
            'lower_case' => 'Минимум один строчный символ и один заглавный',
            'number' => 'Минимум одна цифра, символ или пробел'
          ],
          'button_save' => 'Сохранить'
        ],
        'delete' => [
          'title' => 'Удалить аккаунт',
          'alert' => [
            'title' => 'Вы серьёзно хотите хотите удалить аккаунт?',
            'body' => 'После удаления аккаунта, восстановить его не получится'
          ],
          'password' => 'Введите пароль для подтверждения',
          'agreement' => 'Я понимаю что аккаунт удалиться безвозвратно',
          'button_delete' => 'Удалить',
        ],
        'alerts' => [
          'avatar' => [
            'success'=>[
              'title' => 'Успешно!',
              'message' => 'Аватар успешно обновлен!',
            ]
          ],
          'info' => [
            'success'=>[
              'title' => 'Успешно!',
              'message' => 'Информация успешно обновлена!',
            ]
          ],
          'security' => [
            'success'=>[
              'title' => 'Успешно!',
              'message' => 'Пароль успешно изменен!',
            ]
          ],
        ]
      ],
    ],
];
