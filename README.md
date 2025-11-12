# JuiceSwap V3 Core

[![Tests](https://github.com/JuiceSwapXyz/v3-core/actions/workflows/tests.yml/badge.svg)](https://github.com/JuiceSwapXyz/v3-core/actions/workflows/tests.yml)
[![npm version](https://img.shields.io/npm/v/@juiceswapxyz/v3-core/latest.svg)](https://www.npmjs.com/package/@juiceswapxyz/v3-core/v/latest)

This repository contains the core smart contracts for JuiceSwap V3, a fork of [Uniswap V3 Protocol](https://github.com/Uniswap/v3-core) with enhanced protocol fee capabilities.

For higher level contracts, see the [juiceswap-v3-periphery](https://github.com/JuiceSwapXyz/v3-periphery) repository.

## Key Modifications

JuiceSwap V3 increases the maximum protocol fee from **25% to 50%**:

```solidity
// contracts/UniswapV3Pool.sol:839-843
function setFeeProtocol(uint8 feeProtocol0, uint8 feeProtocol1) external override lock onlyFactoryOwner {
    require(
        (feeProtocol0 == 0 || (feeProtocol0 >= 2 && feeProtocol0 <= 10)) &&  // Min: 2 (50%)
            (feeProtocol1 == 0 || (feeProtocol1 >= 2 && feeProtocol1 <= 10))
    );
    // ...
}
```

**Protocol Fee Breakdown:**
- `feeProtocol = 2` → 1/2 = 50% (new minimum)
- `feeProtocol = 3` → 1/3 = 33.3%
- `feeProtocol = 4` → 1/4 = 25% (original minimum)
- `feeProtocol = 10` → 1/10 = 10% (maximum)

This change modifies the contract bytecode, requiring a new `POOL_INIT_CODE_HASH` in periphery contracts.

## Computing Pool Init Code Hash

When you modify core contracts, you must recompute the `POOL_INIT_CODE_HASH` for CREATE2 pool address computation.

**Quick Start:**
```bash
# 1. Compile contracts
npm run compile

# 2. Compute the new hash
npm run compute-pool-hash

# 3. Copy the hash and update v3-periphery/contracts/libraries/PoolAddress.sol
# Replace POOL_INIT_CODE_HASH constant with the computed value
```

The hash computation script (`scripts/computePoolInitCodeHash.ts`) automatically:
- Reads the compiled `UniswapV3Pool` bytecode
- Computes `keccak256(bytecode)`
- Displays the hash and next steps

**Current JuiceSwap V3 Pool Init Code Hash:**
```
0x851d77a45b8b9a205fb9f44cb829cceba85282714d2603d601840640628a3da7
```

> **Note:** This hash differs from vanilla Uniswap V3 (`0xe34f199b19b2b4f47f68442619d555527d244f78a3297ea89325f843f87b8b54`) due to the protocol fee modifications.

## Local Deployment

To deploy this code to a local testnet, install the npm package `@juiceswapxyz/v3-core` and import the factory bytecode:

```typescript
import {
  abi as FACTORY_ABI,
  bytecode as FACTORY_BYTECODE,
} from '@juiceswapxyz/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json'

// deploy the bytecode
```

This ensures you're testing against the same bytecode deployed to mainnet and public testnets, and all JuiceSwap code will correctly interoperate with your local deployment.

## Using Solidity Interfaces

The JuiceSwap V3 interfaces are available for import via the npm artifact `@juiceswapxyz/v3-core`:

```solidity
import '@juiceswapxyz/v3-core/contracts/interfaces/IUniswapV3Pool.sol';

contract MyContract {
  IUniswapV3Pool pool;

  function doSomethingWithPool() {
    // pool.swap(...);
  }
}
```

## Development

```bash
# Install dependencies
npm install

# Compile contracts
npm run compile

# Run tests
npm run test

# Compute pool init code hash
npm run compute-pool-hash
```

## Licensing

The primary license for JuiceSwap V3 Core is GPL-2.0-or-later, see [`LICENSE`](./LICENSE).

### Exceptions

- All files in `contracts/interfaces/` may also be licensed under `GPL-2.0-or-later` (as indicated in their SPDX headers)
- Several files in `contracts/libraries/` may also be licensed under `GPL-2.0-or-later` (as indicated in their SPDX headers)
- `contracts/libraries/FullMath.sol` is licensed under `MIT` (as indicated in its SPDX header)
- All files in `contracts/test` remain unlicensed (as indicated in their SPDX headers)

## Attribution

JuiceSwap V3 is a fork of [Uniswap V3](https://github.com/Uniswap/v3-core). We are grateful to the Uniswap team for their pioneering work in automated market makers.
