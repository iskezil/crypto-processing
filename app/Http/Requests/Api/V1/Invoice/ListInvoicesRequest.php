<?php

namespace App\Http\Requests\Api\V1\Invoice;

use App\Http\Requests\Api\BaseApiRequest;

class ListInvoicesRequest extends BaseApiRequest
{
    public function rules(): array
    {
        return [
            'start' => ['required', 'string', 'date_format:d.m.Y'],
            'end' => ['required', 'string', 'date_format:d.m.Y'],
            'offset' => ['nullable', 'integer', 'min:0'],
            'limit' => ['nullable', 'integer', 'min:1', 'max:100'],
            'store_id' => ['nullable', 'string'],
        ];
    }

    public function authorize(): bool
    {
        return true;
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $start = $this->input('start');
            $end = $this->input('end');

            if (! $start || ! $end) {
                return;
            }

            $startDate = \DateTime::createFromFormat('d.m.Y', $start);
            $endDate = \DateTime::createFromFormat('d.m.Y', $end);

            if ($startDate && $endDate && $startDate > $endDate) {
                $validator->errors()->add('end', __('validation.after_or_equal', ['date' => $start]));
            }
        });
    }
}
