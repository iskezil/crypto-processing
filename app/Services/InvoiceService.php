<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Support\Carbon;
use Illuminate\Validation\ValidationException;

class InvoiceService
{
    public function normalizeUlid(string $uuid): string
    {
        return str_starts_with($uuid, 'INV-') ? substr($uuid, 4) : $uuid;
    }

    public function resolveProject(User $user, string $ulid): ?Project
    {
        return Project::query()
            ->where('ulid', $ulid)
            ->where('user_id', $user->id)
            ->first();
    }

    public function createInvoice(User $user, array $payload): Invoice
    {
        $project = $this->resolveProject($user, $payload['shop_id']);

        if (! $project) {
            throw ValidationException::withMessages([
                'shop_id' => 'shop_id does not belong to current merchant',
            ]);
        }

        $timeToPay = $payload['time_to_pay'] ?? [];
        $totalMinutes = ($timeToPay['hours'] ?? 24) * 60 + ($timeToPay['minutes'] ?? 0);

        if (empty($timeToPay)) {
            $totalMinutes = 24 * 60;
        }

        if ($totalMinutes < 30 || $totalMinutes > 1440) {
            throw ValidationException::withMessages([
                'time_to_pay' => 'Invalid payment window provided',
            ]);
        }

        $currency = $payload['currency'] ?? 'USD';
        $amount = $payload['amount'];
        $amountUsd = $currency === 'USD' ? $amount : $amount;

        return Invoice::create([
            'project_id' => $project->id,
            'amount' => $amount,
            'amount_usd' => $amountUsd,
            'paid_amount' => 0,
            'credited_amount' => 0,
            'credited_amount_usd' => 0,
            'service_fee' => null,
            'transfer_fee' => null,
            'service_fee_usd' => null,
            'fiat_currency' => $currency,
            'token_network_id' => null,
            'status' => 'created',
            'side_commission' => $project->side_commission ?? 'client',
            'side_commission_cc' => $project->side_commission_cc ?? 'client',
            'is_email_required' => (bool) ($payload['is_email_required'] ?? false),
            'tx_ids' => null,
            'test_mode' => (bool) ($payload['test_mode'] ?? false),
            'expiry_date' => Carbon::now()->addMinutes($totalMinutes),
            'external_order_id' => $payload['order_id'] ?? null,
            'metadata' => $payload['metadata'] ?? null,
        ]);
    }

    public function cancelInvoice(User $user, string $ulid): Invoice
    {
        $pureUlid = $this->normalizeUlid($ulid);

        $invoice = Invoice::query()
            ->where('ulid', $pureUlid)
            ->first();

        if (! $invoice || $invoice->project?->user_id !== $user->id) {
            throw ValidationException::withMessages([
                'ulid' => 'Invoice not found or cannot be canceled',
            ]);
        }

        if (in_array($invoice->status, ['paid', 'overpaid', 'canceled'], true)) {
            throw ValidationException::withMessages([
                'ulid' => 'Invoice not found or cannot be canceled',
            ]);
        }

        $invoice->status = 'canceled';
        $invoice->save();

        return $invoice;
    }

    public function cancelInvoiceModel(Invoice $invoice, User $user, bool $allowForeign = false): Invoice
    {
        if (! $allowForeign && $invoice->project?->user_id !== $user->id) {
            throw ValidationException::withMessages([
                'invoice' => 'Invoice not found or cannot be canceled',
            ]);
        }

        if (in_array($invoice->status, ['paid', 'overpaid', 'canceled'], true)) {
            throw ValidationException::withMessages([
                'invoice' => 'Invoice not found or cannot be canceled',
            ]);
        }

        $invoice->status = 'canceled';
        $invoice->save();

        return $invoice;
    }

    /**
     * @return array{invoices:EloquentCollection,all:int}
     */
    public function listInvoices(User $user, Carbon $start, Carbon $end, int $offset = 0, int $limit = 50, ?int $projectId = null): array
    {
        $projectIds = $projectId ? collect([$projectId]) : $user->projects()->pluck('id');

        $query = Invoice::query()
            ->with(['project', 'tokenNetwork.token', 'tokenNetwork.network'])
            ->whereIn('project_id', $projectIds)
            ->whereBetween('created_at', [$start->startOfDay(), $end->endOfDay()])
            ->orderByDesc('created_at');

        $all = (clone $query)->count();

        $invoices = $query
            ->skip($offset)
            ->take($limit)
            ->get();

        return [
            'invoices' => $invoices,
            'all' => $all,
        ];
    }

    public function findInvoices(User $user, array $ulids): EloquentCollection
    {
        $pureUlids = array_map([$this, 'normalizeUlid'], $ulids);
        $projectIds = $user->projects()->pluck('id');

        return Invoice::query()
            ->with(['project', 'tokenNetwork.token', 'tokenNetwork.network'])
            ->whereIn('ulid', $pureUlids)
            ->whereIn('project_id', $projectIds)
            ->get();
    }
}
