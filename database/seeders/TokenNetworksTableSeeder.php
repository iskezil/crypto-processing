<?php

namespace Database\Seeders;

use App\Models\Network;
use App\Models\Token;
use App\Models\TokenNetwork;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TokenNetworksTableSeeder extends Seeder
{
  /**
   * Run the database seeds.
   */
  public function run(): void
  {
    // Сначала тянем сети/токены по code
    $net = fn(string $code) => Network::where('code', $code)->firstOrFail();
    $tok = fn(string $code) => Token::where('code', $code)->firstOrFail();

    $rows = [
      // Tron
      [
        'token' => 'USDT',
        'network' => 'TRON',
        'full_code' => 'USDT_TRC20',
        'stable_coin' => true,
        'contract' => 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
      ],
      [
        'token' => 'USDD',
        'network' => 'TRON',
        'full_code' => 'USDD_TRC20',
        'stable_coin' => true,
        'contract' => 'TPYmHEhy5n8TCEfYGqW2rPxsghSfzghPDn',
      ],
      [
        'token' => 'TRX',
        'network' => 'TRON',
        'full_code' => 'TRX_TRON',
        'stable_coin' => false,
        'contract' => null, // native
      ],

      // Ethereum
      [
        'token' => 'USDT',
        'network' => 'ETHEREUM',
        'full_code' => 'USDT_ERC20',
        'stable_coin' => true,
        'contract' => '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      ],
      [
        'token' => 'USDC',
        'network' => 'ETHEREUM',
        'full_code' => 'USDC_ERC20',
        'stable_coin' => true,
        'contract' => '0xA0b86991c6218B36c1d19D4a2e9Eb0cE3606eB48',
      ],
      [
        'token' => 'TUSD',
        'network' => 'ETHEREUM',
        'full_code' => 'TUSD_ERC20',
        'stable_coin' => true,
        'contract' => '0x0000000000085d4780B73119b644AE5ecd22b376',
      ],
      [
        'token' => 'ETH',
        'network' => 'ETHEREUM',
        'full_code' => 'ETH_MAINNET',
        'stable_coin' => false,
        'contract' => null, // native
      ],
      [
        'token' => 'SHIB',
        'network' => 'ETHEREUM',
        'full_code' => 'SHIB_ERC20',
        'stable_coin' => false,
        'contract' => '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE',
      ],

      // Bitcoin
      [
        'token' => 'BTC',
        'network' => 'BITCOIN',
        'full_code' => 'BTC_MAINNET',
        'stable_coin' => false,
        'contract' => null,
      ],

      // Litecoin
      [
        'token' => 'LTC',
        'network' => 'LITECOIN',
        'full_code' => 'LTC_MAINNET',
        'stable_coin' => false,
        'contract' => null,
      ],

      // BSC
      [
        'token' => 'BNB',
        'network' => 'BSC',
        'full_code' => 'BNB_BSC',
        'stable_coin' => false,
        'contract' => null,
      ],
      [
        'token' => 'USDT',
        'network' => 'BSC',
        'full_code' => 'USDT_BSC',
        'stable_coin' => true,
        'contract' => '0x55d398326f99059fF775485246999027B3197955',
      ],
      [
        'token' => 'USDC',
        'network' => 'BSC',
        'full_code' => 'USDC_BSC',
        'stable_coin' => true,
        'contract' => '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
      ],
      [
        'token' => 'TUSD',
        'network' => 'BSC',
        'full_code' => 'TUSD_BSC',
        'stable_coin' => true,
        'contract' => '0x40Af3827f39A2f94B7A0A3c1073f31e30383c11D',
      ],

      // TON
      [
        'token' => 'TON',
        'network' => 'TON',
        'full_code' => 'TON_MAINNET',
        'stable_coin' => false,
        'contract' => null,
      ],
      [
        'token' => 'USDT',
        'network' => 'TON',
        'full_code' => 'USDT_TON',
        'stable_coin' => true,
        'contract' => 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs',
      ],

      // Solana
      [
        'token' => 'SOL',
        'network' => 'SOLANA',
        'full_code' => 'SOL_MAINNET',
        'stable_coin' => false,
        'contract' => null,
      ],
      [
        'token' => 'USDT',
        'network' => 'SOLANA',
        'full_code' => 'USDT_SOL',
        'stable_coin' => true,
        'contract' => 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
      ],
      [
        'token' => 'USDC',
        'network' => 'SOLANA',
        'full_code' => 'USDC_SOL',
        'stable_coin' => true,
        'contract' => 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      ],

      // Base
      [
        'token' => 'ETH',
        'network' => 'BASE',
        'full_code' => 'ETH_BASE',
        'stable_coin' => false,
        'contract' => null,
      ],
      [
        'token' => 'USDC',
        'network' => 'BASE',
        'full_code' => 'USDC_BASE',
        'stable_coin' => true,
        'contract' => '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      ],

      // Arbitrum
      [
        'token' => 'ETH',
        'network' => 'ARBITRUM',
        'full_code' => 'ETH_ARB',
        'stable_coin' => false,
        'contract' => null,
      ],
      [
        'token' => 'USDC',
        'network' => 'ARBITRUM',
        'full_code' => 'USDC_ARB',
        'stable_coin' => true,
        'contract' => '0xaf88d065e77c8CC2239327C5EDb3A432268e5831',
      ],
      [
        'token' => 'USDT',
        'network' => 'ARBITRUM',
        'full_code' => 'USDT_ARB',
        'stable_coin' => true,
        'contract' => '0xFd086bC7CD5C481DCC9C85ebe478A1C0b69FCbb9',
      ],

      // Optimism
      [
        'token' => 'ETH',
        'network' => 'OPTIMISM',
        'full_code' => 'ETH_OPT',
        'stable_coin' => false,
        'contract' => null,
      ],
      [
        'token' => 'USDC',
        'network' => 'OPTIMISM',
        'full_code' => 'USDC_OPT',
        'stable_coin' => true,
        'contract' => '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
      ],
      [
        'token' => 'USDT',
        'network' => 'OPTIMISM',
        'full_code' => 'USDT_OPT',
        'stable_coin' => true,
        'contract' => '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
      ],
    ];

    foreach ($rows as $row) {
      $token = $tok($row['token']);
      $network = $net($row['network']);

      TokenNetwork::updateOrCreate(
        [
          'token_id' => $token->id,
          'network_id' => $network->id,
        ],
        [
          'contract_address' => $row['contract'],
          'stable_coin' => $row['stable_coin'],
          'full_code' => $row['full_code'],
          'explorer_tx_url' => $network->explorer_tx_url,
          'explorer_addr_url' => $network->explorer_addr_url,
          'active' => true,
          'order' => 1,
          'hot_wallet_address' => null,
          'encrypted_hot_wallet_key' => null,
          'min_deposit_amount' => null,
          'max_deposit_amount' => null,
          'sweep_fee_percent' => null,
          'notes' => null,
        ]
      );
    }
  }
}
