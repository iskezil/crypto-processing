<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Invoice\CancelInvoiceRequest;
use App\Http\Requests\Api\V1\Invoice\InvoiceInfoRequest;
use App\Http\Requests\Api\V1\Invoice\ListInvoicesRequest;
use App\Http\Requests\Api\V1\Invoice\StoreInvoiceRequest;
use App\Models\Invoice;
use App\Models\Project;
use App\Services\InvoiceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Carbon;
use Illuminate\Validation\ValidationException;
use OpenApi\Annotations as OA;

/**
 * @OA\SecurityScheme(
 *     securityScheme="sanctum",
 *     type="http",
 *     scheme="bearer",
 *     bearerFormat="Token"
 * )
 */
class InvoiceController extends Controller
{
    public function __construct(private readonly InvoiceService $invoiceService)
    {
    }

    /**
     * @OA\Post(
     *     path="/api/v1/invoice/merchant/create",
     *     tags={"Invoices"},
     *     security={{"sanctum": {}}},
     *     summary="Create invoice",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"shop_id","amount"},
     *             @OA\Property(property="shop_id", type="string", example="01JABCDEF1234567890"),
     *             @OA\Property(property="amount", type="number", format="float", example=100.5),
     *             @OA\Property(property="currency", type="string", example="USD"),
     *             @OA\Property(property="is_email_required", type="boolean", example=false),
     *             @OA\Property(property="test_mode", type="boolean", example=false),
     *             @OA\Property(property="time_to_pay", type="object", @OA\Property(property="hours", type="integer", example=24), @OA\Property(property="minutes", type="integer", example=0)),
     *             @OA\Property(property="order_id", type="string", example="ORDER-123"),
     *             @OA\Property(property="metadata", type="object", example={"customer_id":"123","comment":"Any data"})
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Created",
     *         @OA\JsonContent(example={"status":"success","result":{"uuid":"INV-01JABCDEF1234567890","ulid":"01JABCDEF1234567890","project_id":12,"amount":"100.50000000","amount_usd":"100.50000000","fiat_currency":"USD","status":"created","side_commission":"client","side_commission_cc":"client","is_email_required":false,"test_mode":false,"expiry_date":"2025-12-11T12:00:00Z","external_order_id":"ORDER-123","metadata":{"customer_id":"123","comment":"Any data"},"created_at":"2025-12-11T10:00:00Z","updated_at":"2025-12-11T10:00:00Z"}})
     *     ),
     *     @OA\Response(response=422, description="Validation error"),
     *     @OA\Response(response=401, description="Unauthorized")
     * )
     */
    public function store(StoreInvoiceRequest $request): JsonResponse
    {
        $user = $this->resolveUser($request);
        $data = $request->validated();

        try {
            $invoice = $this->invoiceService->createInvoice($user, $data);
        } catch (ValidationException $exception) {
            return $this->errorResponse($this->extractError($exception), 400);
        }

        return $this->successResponse($this->formatInvoice($invoice), 201);
    }

    /**
     * @OA\Post(
     *     path="/api/v1/invoice/merchant/canceled",
     *     tags={"Invoices"},
     *     security={{"sanctum": {}}},
     *     summary="Cancel invoice",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"ulid"},
     *             @OA\Property(property="ulid", type="string", example="INV-01JABCDEF1234567890")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Canceled", @OA\JsonContent(example={"status":"success","result":["ok"]})),
     *     @OA\Response(response=422, description="Validation error"),
     *     @OA\Response(response=401, description="Unauthorized")
     * )
     */
    public function cancel(CancelInvoiceRequest $request): JsonResponse
    {
        $user = $this->resolveUser($request);

        $payload = $request->validated();

        try {
            $this->invoiceService->cancelInvoice($user, $payload['ulid']);
        } catch (ValidationException $exception) {
            return $this->errorResponse('Invoice not found or cannot be canceled', 400);
        }

        return $this->successResponse(['ok']);
    }

    /**
     * @OA\Post(
     *     path="/api/v1/invoice/merchant/list",
     *     tags={"Invoices"},
     *     security={{"sanctum": {}}},
     *     summary="List invoices",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"start","end"},
     *             @OA\Property(property="start", type="string", example="01.01.2023"),
     *             @OA\Property(property="end", type="string", example="31.01.2023"),
     *             @OA\Property(property="store_id", type="string", example="01JABCDEF1234567890"),
     *             @OA\Property(property="offset", type="integer", example=0),
     *             @OA\Property(property="limit", type="integer", example=50)
     *         )
     *     ),
     *     @OA\Response(response=200, description="Invoice list", @OA\JsonContent(example={"status":"success","result":[{"uuid":"INV-01JABCDEF1234567890","ulid":"01JABCDEF1234567890","created":"2023-01-01 12:00:00","expiry_date":"2023-01-02 12:00:00","status":"created","side_commission":"client","side_commission_cc":"client","is_email_required":false,"test_mode":false,"amount":100.0,"amount_usd":100.0,"paid_amount":0.0,"credited_amount":0.0,"credited_amount_usd":0.0,"service_fee":0,"service_fee_usd":0,"transfer_fee":0,"fiat_currency":"USD","external_order_id":"1111","tx_ids":null,"project":{"id":1,"name":"My store","fail":"https://test.com/fail?order_id=1111&invoice_uuid=INV-01JABCDEF1234567890","success":"https://test.com/success?order_id=1111&invoice_uuid=INV-01JABCDEF1234567890","logo":null},"token_network":{"id":4,"code":"USDT_TRC20","name":"USDT on TRC20"}}],"all_count":1})),
     *     @OA\Response(response=422, description="Validation error"),
     *     @OA\Response(response=401, description="Unauthorized")
     * )
     */
    public function list(ListInvoicesRequest $request): JsonResponse
    {
        $user = $this->resolveUser($request);
        $payload = $request->validated();

        $start = Carbon::createFromFormat('d.m.Y', $payload['start']);
        $end = Carbon::createFromFormat('d.m.Y', $payload['end']);
        $offset = $payload['offset'] ?? 0;
        $limit = $payload['limit'] ?? 50;

        $projectId = null;

        if (! empty($payload['store_id'])) {
            $project = $this->invoiceService->resolveProject($user, $payload['store_id']);

            if (! $project) {
                return $this->errorResponse('store_id does not belong to current merchant', 403);
            }

            $projectId = $project->id;
        }

        if ($end->lt($start)) {
            return $this->errorResponse('Invalid date range', 400);
        }

        $list = $this->invoiceService->listInvoices($user, $start, $end, $offset, $limit, $projectId);

        return $this->successResponse(
            $list['invoices']->map(fn (Invoice $invoice) => $this->formatInvoiceForList($invoice))->values(),
            200,
            $list['all']
        );
    }

    /**
     * @OA\Post(
     *     path="/api/v1/invoice/merchant/info",
     *     tags={"Invoices"},
     *     security={{"sanctum": {}}},
     *     summary="Invoice info",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"uuids"},
     *             @OA\Property(property="uuids", type="array", @OA\Items(type="string", example="INV-01JABCDEF1234567890"))
     *         )
     *     ),
     *     @OA\Response(response=200, description="Invoices info", @OA\JsonContent(example={"status":"success","result":[{"uuid":"INV-01JABCDEF1234567890","ulid":"01JABCDEF1234567890","expiry_date":"2023-01-01 12:00:00","side_commission":"client","side_commission_cc":"client","amount":100.2,"amount_usd":100.2,"received":100.2,"received_usd":100.2,"fee":1.4,"fee_usd":1.4,"service_fee":0,"service_fee_usd":1.9,"status":"overpaid","order_id":"1111","fiat_currency":"USD","project":{"id":1,"name":"MyStore","fail":"https://test.com?order_id=1111&invoice_uuid=INV-01JABCDEF1234567890","success":"https://test.com?order_id=1111&invoice_uuid=INV-01JABCDEF1234567890","logo":null},"token_network":{"id":4,"code":"USDT_TRC20","name":"USDT on TRC20"},"test_mode":false}]})),
     *     @OA\Response(response=422, description="Validation error"),
     *     @OA\Response(response=401, description="Unauthorized")
     * )
     */
    public function info(InvoiceInfoRequest $request): JsonResponse
    {
        $user = $this->resolveUser($request);
        $payload = $request->validated();

        $invoices = $this->invoiceService->findInvoices($user, $payload['uuids']);

        if ($invoices->isEmpty()) {
            return $this->errorResponse('No invoices found for provided uuids', 404);
        }

        return $this->successResponse(
            $invoices->map(fn (Invoice $invoice) => $this->formatInvoiceInfo($invoice))->values()
        );
    }

    private function resolveUser(Request $request)
    {
        return $request->attributes->get('authenticated_user') ?? $request->user();
    }

    private function successResponse($result, int $status = 200, ?int $allCount = null): JsonResponse
    {
        $payload = [
            'status' => 'success',
            'result' => $result,
        ];

        if ($allCount !== null) {
            $payload['all_count'] = $allCount;
        }

        return response()->json($payload, $status);
    }

    private function errorResponse(string $message, int $status = 400): JsonResponse
    {
        return response()->json([
            'status' => 'error',
            'result' => [
                'validate_error' => $message,
            ],
        ], $status);
    }

    private function formatInvoice(Invoice $invoice): array
    {
        return [
            'uuid' => 'INV-'.$invoice->ulid,
            'ulid' => $invoice->ulid,
            'project_id' => $invoice->project_id,
            'amount' => $invoice->amount,
            'amount_usd' => $invoice->amount_usd,
            'fiat_currency' => $invoice->fiat_currency,
            'status' => $invoice->status,
            'side_commission' => $invoice->side_commission,
            'side_commission_cc' => $invoice->side_commission_cc,
            'is_email_required' => (bool) $invoice->is_email_required,
            'test_mode' => (bool) $invoice->test_mode,
            'expiry_date' => optional($invoice->expiry_date)?->toISOString(),
            'external_order_id' => $invoice->external_order_id,
            'metadata' => $invoice->metadata,
            'created_at' => optional($invoice->created_at)?->toISOString(),
            'updated_at' => optional($invoice->updated_at)?->toISOString(),
        ];
    }

    private function formatInvoiceForList(Invoice $invoice): array
    {
        return [
            'uuid' => 'INV-'.$invoice->ulid,
            'ulid' => $invoice->ulid,
            'created' => optional($invoice->created_at)?->format('Y-m-d H:i:s'),
            'expiry_date' => optional($invoice->expiry_date)?->format('Y-m-d H:i:s'),
            'status' => $invoice->status,
            'side_commission' => $invoice->side_commission,
            'side_commission_cc' => $invoice->side_commission_cc,
            'is_email_required' => (bool) $invoice->is_email_required,
            'test_mode' => (bool) $invoice->test_mode,
            'amount' => (float) $invoice->amount,
            'amount_usd' => (float) $invoice->amount_usd,
            'paid_amount' => (float) $invoice->paid_amount,
            'credited_amount' => (float) $invoice->credited_amount,
            'credited_amount_usd' => (float) $invoice->credited_amount_usd,
            'service_fee' => $invoice->service_fee ? (float) $invoice->service_fee : 0,
            'service_fee_usd' => $invoice->service_fee_usd ? (float) $invoice->service_fee_usd : 0,
            'transfer_fee' => $invoice->transfer_fee ? (float) $invoice->transfer_fee : 0,
            'fiat_currency' => $invoice->fiat_currency,
            'external_order_id' => $invoice->external_order_id,
            'tx_ids' => $invoice->tx_ids,
            'project' => $this->formatProject($invoice->project),
            'token_network' => $this->formatTokenNetwork($invoice),
        ];
    }

    private function formatInvoiceInfo(Invoice $invoice): array
    {
        $received = $invoice->credited_amount ?: $invoice->paid_amount;
        $receivedUsd = $invoice->credited_amount_usd ?: $invoice->paid_amount;
        $fee = ($invoice->service_fee ?? 0) + ($invoice->transfer_fee ?? 0);
        $feeUsd = ($invoice->service_fee_usd ?? 0) + ($invoice->transfer_fee ?? 0);

        return [
            'uuid' => 'INV-'.$invoice->ulid,
            'ulid' => $invoice->ulid,
            'expiry_date' => optional($invoice->expiry_date)?->format('Y-m-d H:i:s'),
            'side_commission' => $invoice->side_commission,
            'side_commission_cc' => $invoice->side_commission_cc,
            'amount' => (float) $invoice->amount,
            'amount_usd' => (float) $invoice->amount_usd,
            'received' => (float) $received,
            'received_usd' => (float) $receivedUsd,
            'fee' => (float) $fee,
            'fee_usd' => (float) $feeUsd,
            'service_fee' => $invoice->service_fee ? (float) $invoice->service_fee : 0,
            'service_fee_usd' => $invoice->service_fee_usd ? (float) $invoice->service_fee_usd : 0,
            'status' => $invoice->status,
            'order_id' => $invoice->external_order_id,
            'fiat_currency' => $invoice->fiat_currency,
            'project' => $this->formatProject($invoice->project),
            'token_network' => $this->formatTokenNetwork($invoice),
            'test_mode' => (bool) $invoice->test_mode,
        ];
    }

    private function formatProject(?Project $project): ?array
    {
        if (! $project) {
            return null;
        }

        return [
            'id' => $project->id,
            'name' => $project->name,
            'fail' => $project->fail_url,
            'success' => $project->success_url,
            'logo' => $project->logo,
        ];
    }

    private function formatTokenNetwork(Invoice $invoice): ?array
    {
        $tokenNetwork = $invoice->tokenNetwork;

        if (! $tokenNetwork) {
            return null;
        }

        $tokenName = $tokenNetwork->token?->name;
        $networkName = $tokenNetwork->network?->name;

        return [
            'id' => $tokenNetwork->id,
            'code' => $tokenNetwork->full_code ?? $tokenNetwork->token?->code,
            'name' => trim(($tokenName ? $tokenName.' ' : '').($networkName ? 'on '.$networkName : '')),
        ];
    }

    private function extractError(ValidationException $exception): string
    {
        $messages = $exception->errors();

        $first = Arr::first($messages);

        return is_array($first) ? (string) Arr::first($first) : 'Validation error';
    }
}
