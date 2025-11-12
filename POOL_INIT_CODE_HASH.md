# POOL_INIT_CODE_HASH Management

## What is POOL_INIT_CODE_HASH?

`POOL_INIT_CODE_HASH` is the keccak256 hash of the `UniswapV3Pool` contract's bytecode. It's used in the periphery contracts (specifically `PoolAddress.sol`) to compute pool addresses deterministically using CREATE2.

## Why Does It Matter?

When you modify the `UniswapV3Pool` contract (even slightly), the compiled bytecode changes, which changes its hash. If the `POOL_INIT_CODE_HASH` in the periphery contracts doesn't match the actual bytecode hash, pool address computations will be incorrect, causing:

- ❌ Pool creation failures
- ❌ Liquidity operations failing
- ❌ Incorrect pool address lookups

## Computing the Hash

### Automated Method (Recommended)

After modifying and compiling the core contracts:

```bash
# 1. Compile the contracts
npm run compile

# 2. Run the compute script
npx hardhat run scripts/computePoolInitCodeHash.ts
```

This will output the correct hash to use in `v3-periphery/contracts/libraries/PoolAddress.sol`.

### Manual Method (Not Recommended)

Using Forge:
```bash
forge inspect UniswapV3Pool bytecode | xargs cast keccak
```

Using Solidity (add to a test contract):
```solidity
bytes32 public POOL_INIT_CODE_HASH = keccak256(abi.encodePacked(type(UniswapV3Pool).creationCode));
```

## Updating v3-periphery

1. Copy the computed hash from the script output
2. Open `v3-periphery/contracts/libraries/PoolAddress.sol`
3. Update line 6:
   ```solidity
   bytes32 internal constant POOL_INIT_CODE_HASH = 0x[NEW_HASH_HERE];
   ```
4. Verify the update:
   ```bash
   cd v3-periphery
   CORE_PATH=../v3-core npx hardhat run scripts/verifyPoolInitCodeHash.ts
   ```

## JuiceSwap Modifications

Our fork modifies `UniswapV3Pool.sol` to increase the maximum protocol fee from 25% to 50%:

```solidity
// Line ~853 in UniswapV3Pool.sol
// OLD: (feeProtocol0 == 0 || (feeProtocol0 >= 4 && feeProtocol0 <= 10))
// NEW: (feeProtocol0 == 0 || (feeProtocol0 >= 2 && feeProtocol0 <= 10))
```

This change modifies the bytecode, requiring a new `POOL_INIT_CODE_HASH`.

## Workflow for Core Changes

Whenever you modify core contracts:

```bash
# 1. Make changes to v3-core contracts
cd v3-core
# ... edit contracts ...

# 2. Compile
npm run compile

# 3. Compute new hash
npx hardhat run scripts/computePoolInitCodeHash.ts

# 4. Copy the hash and update v3-periphery
cd ../v3-periphery
# ... update PoolAddress.sol ...

# 5. Verify the hash matches
CORE_PATH=../v3-core npx hardhat run scripts/verifyPoolInitCodeHash.ts

# 6. Compile periphery with updated hash
npm run compile
```

## Testing

Always test pool creation after updating the hash:

```bash
cd deploy-v3
npm run test:ecosystem
```

This ensures pools are created at the expected addresses.

## Reference

- [Uniswap V3 Development Book - Factory Contract](https://uniswapv3book.com/milestone_4/factory-contract.html)
- [Ethereum CREATE2 (EIP-1014)](https://eips.ethereum.org/EIPS/eip-1014)
- Original Uniswap V3 POOL_INIT_CODE_HASH: `0xe34f199b19b2b4f47f68442619d555527d244f78a3297ea89325f843f87b8b54`
