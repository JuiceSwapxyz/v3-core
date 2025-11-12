/**
 * Compute the POOL_INIT_CODE_HASH for UniswapV3Pool
 *
 * This script computes the keccak256 hash of the UniswapV3Pool bytecode,
 * which is required for CREATE2 address computation in the periphery contracts.
 *
 * Usage:
 *   1. Compile contracts: npx hardhat compile
 *   2. Run this script: npx hardhat run scripts/computePoolInitCodeHash.ts
 */

// @ts-ignore - hardhat provides ethers via module augmentation
import { ethers } from 'hardhat'
import { utils } from 'ethers'
import * as fs from 'fs'
import * as path from 'path'

async function main() {
  console.log('Computing POOL_INIT_CODE_HASH...\n')

  // Path to the compiled UniswapV3Pool artifact
  const artifactPath = path.join(
    __dirname,
    '../artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json'
  )

  // Check if artifact exists
  if (!fs.existsSync(artifactPath)) {
    console.error('Error: UniswapV3Pool artifact not found!')
    console.error('Please compile contracts first: npx hardhat compile')
    process.exit(1)
  }

  // Read the artifact
  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'))

  // Get the bytecode
  const bytecode = artifact.bytecode

  if (!bytecode || bytecode === '0x') {
    console.error('Error: Bytecode is empty!')
    process.exit(1)
  }

  // Compute the hash
  const computedHash = utils.keccak256(bytecode)

  console.log('POOL_INIT_CODE_HASH computed successfully!\n')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`POOL_INIT_CODE_HASH: ${computedHash}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  console.log('Next steps:')
  console.log('1. Copy the hash above')
  console.log('2. Update v3-periphery/contracts/libraries/PoolAddress.sol')
  console.log('3. Replace the POOL_INIT_CODE_HASH constant with this value\n')

  // Optional: Check if we're in the expected environment
  const network = await ethers.provider.getNetwork()
  console.log(`Compiled for network: ${network.name} (chainId: ${network.chainId})`)
  console.log(`Bytecode size: ${(bytecode.length - 2) / 2} bytes\n`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
