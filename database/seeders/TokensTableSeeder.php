<?php

namespace Database\Seeders;

use App\Models\Token;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TokensTableSeeder extends Seeder
{
  /**
   * Run the database seeds.
   */
  public function run(): void
  {
    $tokens = [
      [
        'code' => 'USDT',
        'name' => 'Tether USD',
        'decimals' => 6,
        'icon_path' => 'assets/icons/cryptocurrency/tokens/usdt.svg'
      ],
      [
        'code' => 'USDD',
        'name' => 'USDD',
        'decimals' => 18,
        'icon_path' => 'assets/icons/cryptocurrency/tokens/usdd.svg'
      ],
      [
        'code' => 'TRX',
        'name' => 'TRON',
        'decimals' => 6,
        'icon_path' => 'assets/icons/cryptocurrency/tokens/trx.svg'
      ],
      [
        'code' => 'USDC',
        'name' => 'USD Coin',
        'decimals' => 6,
        'icon_path' => 'assets/icons/cryptocurrency/tokens/usdc.svg'
      ],
      [
        'code' => 'TUSD',
        'name' => 'TrueUSD',
        'decimals' => 18,
        'icon_path' => 'assets/icons/cryptocurrency/tokens/tusd.svg'
      ],
      [
        'code' => 'BTC',
        'name' => 'Bitcoin',
        'decimals' => 8,
        'icon_path' => 'assets/icons/cryptocurrency/tokens/btc.svg'
      ],
      [
        'code' => 'LTC',
        'name' => 'Litecoin',
        'decimals' => 8,
        'icon_path' => 'assets/icons/cryptocurrency/tokens/ltc.svg'
      ],
      [
        'code' => 'ETH',
        'name' => 'Ethereum',
        'decimals' => 18,
        'icon_path' => 'assets/icons/cryptocurrency/tokens/eth.svg'
      ],
      [
        'code' => 'SHIB',
        'name' => 'Shiba Inu',
        'decimals' => 18,
        'icon_path' => 'assets/icons/cryptocurrency/tokens/shib.svg'
      ],
      [
        'code' => 'BNB',
        'name' => 'BNB',
        'decimals' => 18,
        'icon_path' => 'assets/icons/cryptocurrency/tokens/bnb.svg'
      ],
      [
        'code' => 'TON',
        'name' => 'Toncoin',
        'decimals' => 9,
        'icon_path' => 'assets/icons/cryptocurrency/tokens/ton.svg'
      ],
      [
        'code' => 'SOL',
        'name' => 'Solana',
        'decimals' => 9,
        'icon_path' => 'assets/icons/cryptocurrency/tokens/sol.svg'
      ],
    ];

    foreach ($tokens as $data) {
      Token::updateOrCreate(
        ['code' => $data['code']],
        [
          'name' => $data['name'],
          'decimals' => $data['decimals'],
          'icon_path' => $data['icon_path'],
          'is_archived' => false,
        ]
      );
    }
  }
}
