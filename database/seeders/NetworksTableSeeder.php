<?php

namespace Database\Seeders;

use App\Models\Network;
use Illuminate\Database\Seeder;

class NetworksTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
      $networks = [
        [
          'code'             => 'TRON',
          'name'             => 'Tron',
          'rpc_url'          => 'https://api.trongrid.io',
          'explorer_tx_url'  => 'https://tronscan.org/#/transaction/{tx}',
          'explorer_addr_url'=> 'https://tronscan.org/#/address/{addr}',
          'icon_path'        => 'assets/icons/cryptocurrency/networks/tron.svg',
          'native_token'     => 'TRX',
          'active'           => true,
          'is_public'        => true,
        ],
        [
          'code'             => 'ETHEREUM',
          'name'             => 'Ethereum',
          'rpc_url'          => 'https://mainnet.infura.io/v3/YOUR_KEY',
          'explorer_tx_url'  => 'https://etherscan.io/tx/{tx}',
          'explorer_addr_url'=> 'https://etherscan.io/address/{addr}',
          'icon_path'        => 'assets/icons/cryptocurrency/networks/ethereum.svg',
          'native_token'     => 'ETH',
          'chain_id'         => 1,
          'active'           => true,
          'is_public'        => true,
        ],
        [
          'code'             => 'BITCOIN',
          'name'             => 'Bitcoin',
          'rpc_url'          => 'https://btc.your-node.example',
          'explorer_tx_url'  => 'https://mempool.space/tx/{tx}',
          'explorer_addr_url'=> 'https://mempool.space/address/{addr}',
          'icon_path'        => 'assets/icons/cryptocurrency/networks/bitcoin.svg',
          'native_token'     => 'BTC',
          'active'           => true,
          'is_public'        => true,
        ],
        [
          'code'             => 'LITECOIN',
          'name'             => 'Litecoin',
          'rpc_url'          => 'https://ltc.your-node.example',
          'explorer_tx_url'  => 'https://litecoinspace.org/tx/{tx}',
          'explorer_addr_url'=> 'https://litecoinspace.org/address/{addr}',
          'icon_path'        => 'assets/icons/cryptocurrency/networks/litecoin.svg',
          'native_token'     => 'LTC',
          'active'           => true,
          'is_public'        => true,
        ],
        [
          'code'             => 'BSC',
          'name'             => 'BNB Smart Chain',
          'rpc_url'          => 'https://bsc-dataseed.binance.org',
          'explorer_tx_url'  => 'https://bscscan.com/tx/{tx}',
          'explorer_addr_url'=> 'https://bscscan.com/address/{addr}',
          'icon_path'        => 'assets/icons/cryptocurrency/networks/bnb.svg',
          'native_token'     => 'BNB',
          'chain_id'         => 56,
          'active'           => true,
          'is_public'        => true,
        ],
        [
          'code'             => 'TON',
          'name'             => 'TON',
          'rpc_url'          => 'https://toncenter.com/api/v2/jsonRPC',
          'explorer_tx_url'  => 'https://tonviewer.com/transaction/{tx}',
          'explorer_addr_url'=> 'https://tonviewer.com/{addr}',
          'icon_path'        => 'assets/icons/cryptocurrency/networks/ton.svg',
          'native_token'     => 'TON',
          'active'           => true,
          'is_public'        => true,
        ],
        [
          'code'             => 'SOLANA',
          'name'             => 'Solana',
          'rpc_url'          => 'https://api.mainnet-beta.solana.com',
          'explorer_tx_url'  => 'https://explorer.solana.com/tx/{tx}',
          'explorer_addr_url'=> 'https://explorer.solana.com/address/{addr}',
          'icon_path'        => 'assets/icons/cryptocurrency/networks/solana.svg',
          'native_token'     => 'SOL',
          'active'           => true,
          'is_public'        => true,
        ],
        [
          'code'             => 'BASE',
          'name'             => 'Base',
          'rpc_url'          => 'https://mainnet.base.org',
          'explorer_tx_url'  => 'https://basescan.org/tx/{tx}',
          'explorer_addr_url'=> 'https://basescan.org/address/{addr}',
          'icon_path'        => 'assets/icons/cryptocurrency/networks/base.svg',
          'native_token'     => 'ETH',
          'chain_id'         => 8453,
          'active'           => true,
          'is_public'        => true,
        ],
        [
          'code'             => 'ARBITRUM',
          'name'             => 'Arbitrum One',
          'rpc_url'          => 'https://arb1.arbitrum.io/rpc',
          'explorer_tx_url'  => 'https://arbiscan.io/tx/{tx}',
          'explorer_addr_url'=> 'https://arbiscan.io/address/{addr}',
          'icon_path'        => 'assets/icons/cryptocurrency/networks/arbitrum.svg',
          'native_token'     => 'ETH',
          'chain_id'         => 42161,
          'active'           => true,
          'is_public'        => true,
        ],
        [
          'code'             => 'OPTIMISM',
          'name'             => 'Optimism',
          'rpc_url'          => 'https://mainnet.optimism.io',
          'explorer_tx_url'  => 'https://optimistic.etherscan.io/tx/{tx}',
          'explorer_addr_url'=> 'https://optimistic.etherscan.io/address/{addr}',
          'icon_path'        => 'assets/icons/cryptocurrency/networks/optimism.svg',
          'native_token'     => 'ETH',
          'chain_id'         => 10,
          'active'           => true,
          'is_public'        => true,
        ],
      ];

      foreach ($networks as $data) {
        Network::updateOrCreate(
          ['code' => $data['code']],
          $data
        );
      }
    }
}
