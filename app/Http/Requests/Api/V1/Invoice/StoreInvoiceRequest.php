<?php

namespace App\Http\Requests\Api\V1\Invoice;

use App\Http\Requests\Api\BaseApiRequest;

class StoreInvoiceRequest extends BaseApiRequest
{
    public function rules(): array
    {
        return [
            'shop_id' => ['required', 'string'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'currency' => [
                'nullable',
                'string',
                'in:USD,UZS,KGS,KZT,AMD,AZN,BYN,AUD,TRY,AED,CAD,CNY,HKD,IDR,INR,JPY,PHP,SGD,THB,VND,MYR,RUB,UAH,EUR,GBP',
            ],
            'is_email_required' => ['nullable', 'boolean'],
            'test_mode' => ['nullable', 'boolean'],
            'time_to_pay' => ['nullable', 'array'],
            'time_to_pay.hours' => ['required_with:time_to_pay', 'integer', 'min:0'],
            'time_to_pay.minutes' => ['required_with:time_to_pay', 'integer', 'min:0'],
            'order_id' => ['nullable', 'string', 'max:255'],
            'metadata' => ['nullable', 'array'],
        ];
    }

    public function authorize(): bool
    {
        return true;
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $hours = (int) ($this->input('time_to_pay.hours', 0));
            $minutes = (int) ($this->input('time_to_pay.minutes', 0));
            $totalMinutes = $hours * 60 + $minutes;

            if ($this->missing('time_to_pay')) {
                return;
            }

            if ($totalMinutes < 30 || $totalMinutes > 1440) {
                $validator->errors()->add('time_to_pay', __('validation.between.numeric', ['min' => 30, 'max' => 1440]));
            }
        });
    }
}
