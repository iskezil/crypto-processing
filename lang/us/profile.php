<?php

return [
    'show' => [
      'profile' => 'Profile',
      'profile_about' => 'About the profile',
      'nickname' => 'Nick:',
      'email' => 'Email:',
      'role' => 'Role:',
      'status' => 'Status:',
      'statistics' => 'Statistics',
    ],

    'edit' => [
      'menu' => [
        'account' => 'Account',
        'security' => 'Security'
      ],

      'account' => [
        'profile_detail' => 'Profile details',
        'photo' => [
          'upload_photo' => 'Upload photo',
          'reset_photo' => 'Reset',
          'requirements_photo' => 'форматы JPG, GIF or PNG. Max size of 1МБ'
        ],
        'info' => [
          'nickname' => 'Nickname:',
          'email' => 'Email:',
          'button_save' => 'Save',
        ],
        'security' => [
          'title' => 'Change Password',
          'current_password' => 'Current Password',
          'new_password' => 'New Password',
          'confirm_new_password' => 'Confirm New Password',
          'password_requirements' => [
            'title' => 'Password Requirements:',
            'minimum' => 'Minimum 8 characters long - the more, the better',
            'lower_case' => 'At least one lowercase character',
            'number' => 'At least one number, symbol, or whitespace character'
          ],
          'button_save' => 'Save changes'
        ],
        'delete' => [
          'title' => 'Delete account?',
          'alert' => [
            'title' => 'Are you sure you want to delete your account?',
            'body' => 'Once you delete your account, there is no going back. Please be certain.'
          ],
          'password' => 'Enter the password to confirm',
          'agreement' => 'I confirm my account deactivation',
          'button_delete' => 'Deactivate Account',
        ],
        'alerts' => [
          'avatar' => [
            'success'=>[
              'title' => 'Success!',
              'message' => 'The avatar has been successfully updated!',
            ]
          ],
          'info' => [
            'success'=>[
              'title' => 'Success!',
              'message' => 'The information has been successfully updated!',
            ]
          ],
          'security' => [
            'success'=>[
              'title' => 'Success!',
              'message' => 'The password has been successfully changed!',
            ]
          ],
        ]
      ],
    ],
];
