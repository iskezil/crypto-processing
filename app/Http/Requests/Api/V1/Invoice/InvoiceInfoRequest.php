<?php

namespace App\Http\Requests\Api\V1\Invoice;

use App\Http\Requests\Api\BaseApiRequest;

class InvoiceInfoRequest extends BaseApiRequest
{
    public function rules(): array
    {
        return [
            'uuids' => ['required', 'array', 'min:1'],
            'uuids.*' => ['required', 'string'],
        ];
    }

    public function authorize(): bool
    {
        return true;
    }
}
