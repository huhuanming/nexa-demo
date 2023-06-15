import { hexToBin, binToHex, instantiateSecp256k1, encodeDataPush, instantiateRipemd160, instantiateSha256, encodePrivateKeyWif } from '@bitauth/libauth';
import { decodeAddress, encodeAddress, listUnspent } from '@nexajs/address';
import { v4 as uuidv4 } from 'uuid'
import { Transaction } from '@nexajs/transaction';
import sendCoin from './sendCoin.mjs'

// const transaction = new Transaction({

// })

// const myAddress = 'nexa:nqtsq5g5ynxl8rwp5pzh47muagnn795pckdgtjrtatyzv2p5'
// decodeAddress(myAddress)



// const HASH_VERIFY = new Uint8Array([
//     23,   0,  81, 20, 240,  56,  25,
//    205,  14, 116, 30,  63, 178,  25,
//     98,  17, 205,  8, 192, 195, 215,
//    187, 121, 177
//  ])

//  const hexString = Buffer.from(HASH_VERIFY).toString('hex')
//  console.log(hexString, HASH_VERIFY.length)
// TODE: Address Type
// const HASH_VERIFY = new Uint8Array(Buffer.from('03560d4451deeef0d1bcc46ff062372400ecf7b6e4e058ef01792f140ce2a97c31', 'hex'))
// const address = encodeAddress('nexa', 'TEMPLATE', HASH_VERIFY)
// console.log(address)
// const result = decodeAddress(address)
// console.log(result)
const DUST_LIMIT = 546

const privateKey = '6b4d9dee8a37f4329cbf7db9a137a2ecdc63be8e6caa881ef05b3a3349ef8db9'

const secp256k1 = await instantiateSecp256k1()
const ripemd160 = await instantiateRipemd160()
const sha256 = await instantiateSha256()

const publicKey1 = secp256k1.derivePublicKeyCompressed(hexToBin(privateKey))
console.log('PUBLIC KEY 1 (hex)', binToHex(publicKey1), Buffer.from(publicKey1).toString('hex'))

const scriptPushPubKey = encodeDataPush(publicKey1)
console.log('SCRIPT PUSH PUBLIC KEY', scriptPushPubKey);

const publicKeyHash = ripemd160.hash(sha256.hash(scriptPushPubKey))
console.log('PUBLIC KEY HASH (hex)', binToHex(publicKeyHash))

const scriptPubKey = hexToBin('17005114' + binToHex(publicKeyHash))
console.info('  Public key hash Script:', binToHex(scriptPubKey))
const NEXA_RECEIVING_ADDRESS = 'nexa:nqtsq5g57qupnngwws0rlvsevggu6zxqc0tmk7d3v5ulpfh6'

const nexaAddress = encodeAddress(
    'nexa', 'TEMPLATE', scriptPubKey)
console.info('\n  Nexa address:', nexaAddress)
 // Fetch all unspent transaction outputs for the temporary in-browser wallet.
 let unspent = await listUnspent(nexaAddress)
 console.log('\n  Unspent outputs:\n', unspent)

 if (unspent.length === 0) {
     console.error('There are NO unspent outputs available.')
 }

 const mempool = unspent.find(_unspent=> {
     return _unspent.height === 0
 })
 console.log('MEMPOOL', mempool)

 if (mempool) {
     unspent = [mempool]
 }

 const wif = encodePrivateKeyWif(sha256, hexToBin(privateKey), 'mainnet')
 console.log('PRIVATE KEY (WIF):', wif)
 /* Build parameters. */
//  const coins = unspent.map(_unspent => {
//      // const outpoint = _unspent.outpointHash
//      const outpoint = _unspent.outpointHash
//      const satoshis = _unspent.value

//      return {
//          outpoint,
//          satoshis,
//          wif,
//      }
//  })

const coins = [{
    outpoint: binToHex(publicKey1),
    satoshis: 10000,
    wif,
}]

 console.log('\n  Coins:', coins)

 /* Calculate the total balance of the unspent outputs. */
 const unspentSatoshis = unspent
     .reduce(
         (totalValue, unspentOutput) => (totalValue + unspentOutput.value), 0
     )
 console.log('UNSPENT SATOSHIS', unspentSatoshis)

 const testVal = 1337

 // NOTE: 150b (per input), 35b (per output), 10b (misc)
 // NOTE: Double the estimate (for safety).
 const feeEstimate = ((coins.length * 150) + (35 * 2) + 10) * 2
 console.log('FEE ESTIMATE', feeEstimate)

//  const userData = `NexaJS~UnitTest~${uuidv4()}`
 // console.log('USER DATA', userData)

 /* Initialize hex data. */
//  let hexData = ''

//  /* Convert user data (string) to hex. */
//  for (let i = 0; i < userData.length; i++) {
//      /* Convert to hex code. */
//      let code = userData.charCodeAt(i).toString(16)
//      // console.log('CODE', userData[i], code)

//      if (userData[i] === '~') {
//          code = '09'
//      }

//      /* Add hex code to string. */
//      hexData += code
//  }
//  // console.log('HEX DATA', hexData)

 const receivers = [
    //  {
    //      data: hexData
    //  },
     {
         address: NEXA_RECEIVING_ADDRESS,
         satoshis: testVal,
     },
 ]

 /* Handle (automatic) change. */
//  if (unspentSatoshis - testVal - feeEstimate > DUST_LIMIT) {
//      receivers.push({
//          address: nexaAddress,
//          satoshis: unspentSatoshis - testVal - feeEstimate,
//      })
//  }
 console.log('\n  Receivers:', receivers)

 /* Set automatic fee (handling) flag. */
 const autoFee = false // FIXME Enable auto-fee.

 /* Send UTXO request. */
 const response = await sendCoin(coins, receivers, autoFee)
 console.log('Send UTXO (response):', response)

 try {
     const txResult = JSON.parse(response)
     console.log('TX RESULT', txResult)

     if (txResult.error) {
        console.error(txResult.message)
     }

     console.log(txResult.result, txResult.result.length)
 } catch (err) {
     console.error(err)
 }