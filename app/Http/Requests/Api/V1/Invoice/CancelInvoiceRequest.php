<?php

namespace App\Http\Requests\Api\V1\Invoice;

use App\Http\Requests\Api\BaseApiRequest;

class CancelInvoiceRequest extends BaseApiRequest
{
    public function rules(): array
    {
        return [
            'ulid' => ['required', 'string'],
        ];
    }

    public function authorize(): bool
    {
        return true;
    }
}
