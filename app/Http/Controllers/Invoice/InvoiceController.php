<?php

namespace App\Http\Controllers\Invoice;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Project;
use App\Models\Token;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class InvoiceController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:PAYMENTS_VIEW')->only(['index', 'export', 'show']);
        $this->middleware('permission:PAYMENTS_ADMIN_VIEW')->only(['adminIndex', 'adminExport', 'adminShow']);
    }

    public function index(Request $request): Response
    {
        return $this->renderInvoices($request, false);
    }

    public function adminIndex(Request $request): Response
    {
        return $this->renderInvoices($request, true);
    }

    public function export(Request $request): StreamedResponse
    {
        return $this->exportInvoices($request, false);
    }

    public function show(Request $request, Invoice $invoice): Response
    {
        return $this->renderInvoice($request, $invoice, false);
    }

    public function adminExport(Request $request): StreamedResponse
    {
        return $this->exportInvoices($request, true);
    }

    public function adminShow(Request $request, Invoice $invoice): Response
    {
        return $this->renderInvoice($request, $invoice, true);
    }

    public function cancel(Request $request, Invoice $invoice): RedirectResponse
    {
        $user = $request->user();

        if (! $user?->can('PAYMENTS_ADMIN_VIEW') && $invoice->project?->user_id !== $user?->id) {
            abort(403);
        }

        if ($invoice->status !== 'created') {
            return back()->with('error', __('pages/payments.errors.cannot_cancel'));
        }

        $invoice->status = 'canceled';
        $invoice->save();

        return back()->with('success', __('pages/payments.notifications.canceled'));
    }

    private function renderInvoices(Request $request, bool $isAdmin): Response
    {
        [$filters, $invoices] = $this->prepareInvoices($request, $isAdmin);

        return Inertia::render('dashboard/payments/list', [
            'filters' => $filters,
            'invoices' => $invoices,
            'projects' => $this->projectOptions($isAdmin),
            'currencies' => $this->currencyOptions(),
            'isAdmin' => $isAdmin,
        ]);
    }

    private function renderInvoice(Request $request, Invoice $invoice, bool $isAdmin): Response
    {
        $this->abortIfUnauthorized($invoice, $isAdmin);

        return Inertia::render('dashboard/payments/view', [
            'invoice' => $this->invoiceResource($invoice, true),
            'isAdmin' => $isAdmin,
        ]);
    }

    private function exportInvoices(Request $request, bool $isAdmin): StreamedResponse
    {
        [$filters, $invoices] = $this->prepareInvoices($request, $isAdmin);

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="invoices-' . now()->format('Y-m-d_His') . '.csv"',
        ];

        $columns = [
            'status' => 'Status',
            'currency' => 'Currency',
            'amount' => 'Amount',
            'amount_usd' => 'Amount USD',
            'paid_amount' => 'Paid amount',
            'service_fee' => 'Service fee',
            'transfer_fee' => 'Transfer fee',
            'credited_amount' => 'Credited amount',
            'credited_amount_usd' => 'Credited amount USD',
            'tx_ids' => 'TXIDS',
            'number' => 'Invoice number',
            'project' => 'Project',
            'created_at' => 'Created at',
        ];

        return response()->streamDownload(static function () use ($columns, $invoices) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, array_values($columns));

            foreach ($invoices as $invoice) {
                fputcsv($handle, [
                    $invoice['status'],
                    $invoice['currency']['token'] ?? '',
                    $invoice['amount'],
                    $invoice['amount_usd'],
                    $invoice['paid_amount'],
                    $invoice['service_fee'],
                    $invoice['transfer_fee'],
                    $invoice['credited_amount'],
                    $invoice['credited_amount_usd'],
                    implode('; ', $invoice['tx_ids']),
                    $invoice['number'],
                    $invoice['project']['name'] ?? '',
                    $invoice['created_at'],
                ]);
            }

            fclose($handle);
        }, headers: $headers);
    }

    private function prepareInvoices(Request $request, bool $isAdmin): array
    {
        $filters = $this->validatedFilters($request);

        $query = Invoice::query()
            ->with([
                'project:id,name,user_id',
                'tokenNetwork.token:id,name,code,icon_path',
                'tokenNetwork.network:id,name,icon_path',
            ])
            ->latest('created_at');

        if (! $isAdmin) {
            $userId = Auth::id();
            $query->whereHas('project', static fn($projectQuery) => $projectQuery->where('user_id', $userId));
        }

        $this->applyFilters($query, $filters);

        $invoices = $query->get()->map(function (Invoice $invoice) {
            return $this->invoiceResource($invoice);
        });

        return [$filters, $invoices];
    }

    private function validatedFilters(Request $request): array
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string'],
            'project_id' => ['nullable', 'array'],
            'project_id.*' => ['integer'],
            'currency' => ['nullable', 'array'],
            'currency.*' => ['string'],
            'status' => ['nullable', 'array'],
            'status.*' => ['string'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date'],
        ]);

        return [
            'search' => $validated['search'] ?? '',
            'project_id' => isset($validated['project_id']) ? array_map('intval', $validated['project_id']) : [],
            'currency' => $validated['currency'] ?? [],
            'status' => $validated['status'] ?? [],
            'date_from' => $validated['date_from'] ?? null,
            'date_to' => $validated['date_to'] ?? null,
        ];
    }

    private function applyFilters(Builder $query, array $filters): void
    {
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(static function ($builder) use ($search) {
                $builder->where('ulid', 'like', "%{$search}%")
                    ->orWhere('external_order_id', 'like', "%{$search}%")
                    ->orWhereHas('project', static fn($projectQuery) => $projectQuery->where('name', 'like', "%{$search}%"));
            });
        }

        if (!empty($filters['project_id'])) {
            $query->whereIn('project_id', $filters['project_id']);
        }

        if (!empty($filters['currency'])) {
            $currency = $filters['currency'];
            $query->whereHas('tokenNetwork.token', static function ($tokenQuery) use ($currency) {
                $tokenQuery->whereIn('code', $currency)->orWhere(function ($innerQuery) use ($currency) {
                    $innerQuery->whereIn('name', $currency);
                });
            });
        }

        if (!empty($filters['status'])) {
            $query->whereIn('status', $filters['status']);
        }

        if (!empty($filters['date_from'])) {
            $query->whereDate('created_at', '>=', Carbon::parse($filters['date_from'])->startOfDay());
        }

        if (!empty($filters['date_to'])) {
            $query->whereDate('created_at', '<=', Carbon::parse($filters['date_to'])->endOfDay());
        }
    }

    private function projectOptions(bool $isAdmin): Collection
    {
        $projectQuery = Project::query()->select(['id', 'name'])->orderBy('name');

        if (!$isAdmin) {
            $projectQuery->where('user_id', Auth::id());
        }

        return $projectQuery->get();
    }

    private function currencyOptions(): Collection
    {
        $currencies = Token::query()
            ->select(['id', 'name', 'code', 'icon_path'])
            ->orderBy('name')
            ->get()
            ->unique('code')
            ->values();

        $defaultCurrency = ['id' => null, 'name' => 'USDT Tether', 'code' => 'USDT', 'icon' => null];

        if ($currencies->where('code', 'USDT')->isEmpty()) {
            $currencies->prepend($defaultCurrency);
        }

        return $currencies->map(static fn($currency) => [
            'id' => $currency['id'],
            'name' => $currency['name'],
            'code' => $currency['code'],
            'icon' => $currency['icon_url'] ?? null,
        ]);
    }

    private function splitTxIds(?string $txIds): array
    {
        if (empty($txIds)) {
            return [];
        }

        return collect(preg_split('/[,;\s]+/', $txIds))
            ->filter()
            ->values()
            ->all();
    }

    private function invoiceResource(Invoice $invoice, bool $includeMeta = false): array
    {
        $token = $invoice->tokenNetwork?->token;
        $network = $invoice->tokenNetwork?->network;
        $project = $invoice->project;

        $base = [
            'id' => $invoice->id,
            'ulid' => $invoice->ulid,
            'number' => 'INV-' . $invoice->ulid,
            'status' => $invoice->status,
            'amount' => $invoice->amount,
            'amount_usd' => $invoice->amount_usd,
            'paid_amount' => $invoice->paid_amount,
            'service_fee' => $invoice->service_fee,
            'transfer_fee' => $invoice->transfer_fee,
            'credited_amount' => $invoice->credited_amount,
            'credited_amount_usd' => $invoice->credited_amount_usd,
            'tx_ids' => $this->splitTxIds($invoice->tx_ids),
            'external_order_id' => $invoice->external_order_id,
            'project' => $project?->only(['id', 'name']),
            'currency' => [
                'token' => $token?->code,
                'tokenIcon' => $token?->icon_url,
                'code' => $token?->code,
                'network' => $network?->name,
                'networkIcon' => $network?->icon_url,
            ],
            'created_at' => optional($invoice->created_at)?->toDateTimeString(),
            'updated_at' => optional($invoice->updated_at)?->toDateTimeString(),
        ];

        if (! $includeMeta) {
            return $base;
        }

        $metadata = $invoice->metadata ?? [];

        $address = $metadata['address']
            ?? $metadata['to_address']
            ?? $metadata['wallet_address']
            ?? $invoice->depositEvents()->latest()->first()?->to_address;

        return array_merge($base, [
            'address' => $address,
            'can_cancel' => $invoice->status === 'created',
        ]);
    }

    private function abortIfUnauthorized(Invoice $invoice, bool $isAdmin): void
    {
        if ($isAdmin) {
            return;
        }

        $userId = Auth::id();
        if ($invoice->project?->user_id !== $userId) {
            abort(403);
        }
    }
}
