<?php

return [

  /*
  |--------------------------------------------------------------------------
  | Validation Language Lines
  |--------------------------------------------------------------------------
  |
  | following language lines contain default error messages used by
  | validator class. Some of these rules have multiple versions such
  | as size rules. Feel free to tweak each of these messages here.
  |
  */

  'accepted' => '{attribute} должно быть заполнено.',
  'accepted_if' => '{attribute} поле должно быть заполнено, когда {other} is {value}.',
  'active_url' => '{attribute} поле должно быть допустимым URL-адресом.',
  'after' => '{attribute} поле должно быть датой после {date}.',
  'after_or_equal' => '{attribute} поле должно быть датой после или равной {date}.',
  'alpha' => '{attribute} должно содержать только буквы.',
  'alpha_dash' => '{attribute} должно содержать только буквы, цифры, тире и символы подчеркивания.',
  'alpha_num' => '{attribute} поле должно содержать только буквы и цифры.',
  'array' => '{attribute} поле должно быть массивом.',
  'ascii' => '{attribute} должно содержать только однобайтовые буквенно-цифровые символы и символы.',
  'before' => '{attribute} поле должно быть датой до {date}.',
  'before_or_equal' => '{attribute} поле должно быть датой до или равной {date}.',
  'between' => [
    'array' => '{attribute} поле должно иметь между {min} и {max} items.',
    'file' => '{attribute} поле должно находиться между {min} и {max} килобайт.',
    'numeric' => '{attribute} поле должно находиться между {min} и {max}.',
    'string' => '{attribute} поле должно находиться между {min} и {max} значениями.',
  ],
  'boolean' => '{attribute} поле должно быть true или false.',
  'can' => '{attribute} содержит несанкционированное значение.',
  'confirmed' => '{attribute} Поле подтверждения не совпадает.',
  'current_password' => 'Некорректный пароль.',
  'date' => '{attribute} Поле должно быть допустимой датой.',
  'date_equals' => '{attribute} поле должно быть датой, равной {date}.',
  'date_format' => '{attribute} поле должно соответствовать формату {format}.',
  'decimal' => '{attribute} поле должно иметь {decimal} десятичные знаки.',
  'declined' => '{attribute} должно быть отклонено.',
  'declined_if' => '{attribute} поле должно быть отклонено, если {other} это {value}.',
  'different' => '{attribute} поле и {other} должны быть разными.',
  'digits' => '{attribute} поле должно быть {digits} цифр.',
  'digits_between' => '{attribute} поле должно находиться между {min} и {max} цифр.',
  'dimensions' => '{attribute} имеет недопустимые размеры изображения.',
  'distinct' => '{attribute} поле имеет повторяющееся значение.',
  'doesnt_end_with' => '{attribute} не должно заканчиваться одним из следующих значений: {values}.',
  'doesnt_start_with' => '{attribute} не должно начинаться с одного из следующих пунктов: {values}.',
  'email' => 'В поле {attribute} должен быть указан действительный адрес электронной почты.',
  'ends_with' => '{attribute} должно заканчиваться одним из следующих символов: {values}.',
  'enum' => 'Выбранный {attribute} некорректный.',
  'exists' => 'Выбранный {attribute} некорректный.',
  'extensions' => '{attribute} должно иметь одно из следующих расширений: {values}.',
  'file' => '{attribute} поле должно быть файлом.',
  'filled' => '{attribute} поле должно иметь значение.',
  'gt' => [
    'array' => '{attribute} поле должно содержать более {value} предметов.',
    'file' => '{attribute} поле должно быть больше, чем {value} килобайт.',
    'numeric' => '{attribute} поле должно быть больше, чем {value}.',
    'string' => '{attribute} поле должно быть больше, чем {value}.',
  ],
  'gte' => [
    'array' => '{attribute} поле должно иметь {value} предметы или больше.',
    'file' => '{attribute} поле должно быть больше или равно {value} килобайт.',
    'numeric' => '{attribute} поле должно быть больше или равно {value}.',
    'string' => '{attribute} поле должно быть больше или равно {value}.',
  ],
  'hex_color' => '{attribute} поле должно быть допустимого шестнадцатеричного цвета.',
  'image' => '{attribute} поле должно быть изображением.',
  'in' => 'Выбранный {attribute} некорректный.',
  'in_array' => '{attribute} поле должно существовать в {other}.',
  'integer' => '{attribute} поле должно быть целым числом.',
  'ip' => '{attribute} поле должно содержать действительный IP-адрес.',
  'ipv4' => '{attribute} поле должно содержать действительный IPv4-адрес.',
  'ipv6' => '{attribute} поле должно содержать действительный IPv6-адрес.',
  'json' => '{attribute} поле должно быть допустимой строкой JSON.',
  'list' => '{attribute} поле должно быть списком.',
  'lowercase' => '{attribute} поле должно быть в нижнем регистре.',
  'lt' => [
    'array' => '{attribute} поле должно содержать менее {value} предметов.',
    'file' => '{attribute} поле должно быть меньше, чем {value} килобайт.',
    'numeric' => 'Поле {attribute} должно быть меньше {value}.',
    'string' => '{attribute} поле должно быть меньше, чем {value}.',
  ],
  'lte' => [
    'array' => '{attribute} поле не должно содержать более {value} предметов.',
    'file' => '{attribute} поле должно быть меньше или равно {value} килобайт.',
    'numeric' => '{attribute} поле должно быть меньше или равно {value}.',
    'string' => '{attribute} поле должно быть меньше или равно {value}.',
  ],
  'mac_address' => '{attribute} поле должно содержать действительный MAC-адрес.',
  'max' => [
    'array' => '{attribute} поле не должно содержать более {max} предметов.',
    'file' => '{attribute} поле не должно быть больше, чем {max} килобайт.',
    'numeric' => '{attribute} поле не должно быть больше, чем {max}.',
    'string' => '{attribute} поле не должно быть больше, чем {max}.',
  ],
  'max_digits' => '{attribute} поле не должно быть больше, чем {max} цифр.',
  'mimes' => '{attribute} поле должно быть файлом типа: {values}.',
  'mimetypes' => '{attribute} поле должно быть файлом типа: {values}.',
  'min' => [
    'array' => 'Количество элементов в поле {attribute} должно быть не менее {min}.',
    'file' => 'Размер файла в поле {attribute} должен быть не менее {min} килобайт.',
    'numeric' => 'Поле {attribute} должно быть не менее {min}.',
    'string' => 'Количество символов в поле {attribute} должно быть не менее {min}.',
  ],
  'min_digits' => '{attribute} поле должно иметь по крайней мере {min} digits.',
  'missing' => '{attribute} поле отсутствует.',
  'missing_if' => '{attribute} поле отсутствует когда {other} это {value}.',
  'missing_unless' => '{attribute} поле отсутствует если не {other} это {value}.',
  'missing_with' => '{attribute} поле отсутствует когда {values} присутствует.',
  'missing_with_all' => '{attribute} поле отсутствует когда {values} присутствуют.',
  'multiple_of' => '{attribute} поле должно быть кратно {value}.',
  'not_in' => 'Выбранный {attribute} некорректный.',
  'not_regex' => '{attribute} неверный формат поля.',
  'numeric' => '{attribute} поле должно быть числом.',
  'password' => [
    'letters' => '{attribute} поле должно содержать хотя бы одну букву.',
    'mixed' => '{attribute} поле должно содержать по крайней мере одну заглавную и одну строчную букву.',
    'numbers' => '{attribute} поле должно содержать по крайней мере одно число.',
    'symbols' => '{attribute} поле должно содержать хотя бы один символ.',
    'uncompromised' => 'Выданный {attribute} появилась в результате утечки данных. Пожалуйста, выберите другой {attribute}.',
  ],
  'present' => '{attribute} поле должно присутствовать.',
  'present_if' => '{attribute} поле должно присутствовать, когда {other} это {value}.',
  'present_unless' => '{attribute} поле должно присутствовать, если только {other} это {value}.',
  'present_with' => '{attribute} поле должно присутствовать, когда {values} это present.',
  'present_with_all' => '{attribute} поле должно присутствовать, когда {values} присутствуют.',
  'prohibited' => '{attribute} поле запрещено.',
  'prohibited_if' => '{attribute} поле запрещено, когда {other} это {value}.',
  'prohibited_unless' => '{attribute} поле запрещено, если только {other} в {values}.',
  'prohibits' => '{attribute} поле запрещает {other} от присутствия.',
  'regex' => '{attribute} неверный формат поля.',
  'required' => 'Поле {attribute} обязательно для заполнения.',
  'required_array_keys' => '{attribute} поле должно содержать записи для: {values}.',
  'required_if' => '{attribute} поле является обязательным, когда {other} это {value}.',
  'required_if_accepted' => '{attribute} поле является обязательным, когда {other} это accepted.',
  'required_unless' => '{attribute} поле является обязательным, если только {other} в {values}.',
  'required_with' => '{attribute} поле является обязательным, когда {values} это present.',
  'required_with_all' => '{attribute} поле является обязательным, когда {values} присутствуют.',
  'required_without' => '{attribute} поле является обязательным, когда {values} не присутствует.',
  'required_without_all' => '{attribute} поле является обязательным, если ни один из {values} присутствуют.',
  'same' => '{attribute} поле должно соответствовать {other}.',
  'size' => [
    'array' => '{attribute} поле должно содержать {size} items.',
    'file' => '{attribute} поле должно быть {size} килобайт.',
    'numeric' => '{attribute} поле должно быть {size}.',
    'string' => '{attribute} поле должно быть {size} персонажи.',
  ],
  'starts_with' => '{attribute} поле должно начинаться с одного из следующих символов: {values}.',
  'string' => '{attribute} поле должно быть строкой.',
  'timezone' => '{attribute} поле должно указывать допустимый часовой пояс.',
  'unique' => '{attribute} уже принят.',
  'uploaded' => '{attribute} не удалось загрузить.',
  'uppercase' => '{attribute} поле должно быть заглавным.',
  'url' => '{attribute} поле должно содержать допустимый URL-адрес.',
  'ulid' => '{attribute} поле должно содержать действительный идентификатор ULID.',
  'uuid' => '{attribute} поле должно быть действительным UUID.',

  /*
  |--------------------------------------------------------------------------
  | Custom Validation Language Lines
  |--------------------------------------------------------------------------
  |
  | Here you may specify custom validation messages for attributes using the
  | convention "attribute.rule" to name lines. This makes it quick to
  | specify a specific custom language line for a given attribute rule.
  |
  */

  'custom' => [
    'attribute-name' => [
      'rule-name' => 'custom-message',
    ],
  ],

  /*
  |--------------------------------------------------------------------------
  | Custom Validation Attributes
  |--------------------------------------------------------------------------
  |
  | following language lines are used to swap our attribute placeholder
  | with something more reader friendly such as "E-Mail Address" instead
  | of "email". This simply helps us make our message more expressive.
  |
  */

  'attributes' => [
    'email' => 'Электронная почта',
    'name' => 'Имя',
    'password' => 'Пароль',
    'password_confirmation' => 'Подтверждение пароля',
    'current_password' => 'Текущий пароль',
    'roles' => 'Роли',
  ],

];
