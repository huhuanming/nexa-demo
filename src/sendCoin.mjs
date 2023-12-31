/* Setup (non-ESM) debugger. */
/* Import (library) modules. */
import broadcast from './boardcast.mjs'

import { Transaction } from '@nexajs/transaction'

/* Set constants. */
// import DUST_SATOSHIS from './getDustAmount.js'

/**
 * Send Coin
 *
 * Simple coin sending to one or more recipients.
 *
 * NOTE: By default, the transaction fee will be automatically calculated
 *       and subtracted from the transaction value.
 *
 * Coin
 *   - wif
 *   - satoshis
 *   - outpoint
 */
export default async (_coins, _receivers, _autoFee = true) => {
    console.log('Sending coins', _coins, _receivers)

    /* Initialize coin. */
    let coins

    /* Initialize receivers. */
    let receivers

    /* Validate coin. */
    if (_coins) {
        /* Validate coins. */
        if (Array.isArray(_coins)) {
            coins = _coins
        } else {
            coins = [_coins]
        }
    } else {
        throw new Error(`The coin(s) provided are invalid [ ${JSON.stringify(_coins)} ]`)
    }

    /* Validate receivers. */
    if (Array.isArray(_receivers)) {
        receivers = _receivers
    } else {
        receivers = [_receivers]
    }

    /* Set outpoint. */
    const outputpoint = coins[0].outpoint

    /* Set satoshis. */
    const satoshis = coins[0].satoshis

    /* Validate satoshis (sending to receiver). */
    if (!satoshis) {
        throw new Error('No transaction value.')
    }

    /* Initialize (initial) transaction satoshis. */
    // NOTE: It's the original satoshis - 1 sat/byte for tx size
    // FIXME: Recommendation is to use 1.1 sat/byte
    let txAmount = 0

    /* Calculate the total balance of the unspent outputs. */
    // const unspentSatoshis = _unspents
    //     .reduce(
    //         (totalValue, unspentOutput) => (totalValue + unspentOutput.satoshis), 0
    //     )

    /* Handle all receivers. */
    // receivers.forEach(_receiver => {
    //     /* Validate receiver. */
    //     if (!_receiver.address) {
    //         throw new Error(`Invalid receiver address [ ${JSON.stringify(_receiver.address)} ]`)
    //     }
    //
    //     if (!_receiver.satoshis) {
    //         throw new Error(`Invalid receiver value [ ${JSON.stringify(_receiver.satoshis)} ]`)
    //     }
    //
    //     /* Set receipient address. */
    //     // TODO: Add protection against accidental legacy address.
    //     const address = _receiver.address
    //
    //     /* Initialize satoshis. */
    //     let satoshis = null
    //
    //     if (_autoFee) {
    //         /* Calculate fee per recipient. */
    //         // NOTE: Fee is split evenly between all recipients.
    //         const feePerRecipient = Math.ceil(byteCount / receivers.length)
    //
    //         /* Calculate satoshis. */
    //         satoshis = _receiver.satoshis - feePerRecipient
    //
    //         /* Add receiver to transaction. */
    //         transaction.to(address, satoshis)
    //     } else {
    //         /* Set satoshis. */
    //         satoshis = _receiver.satoshis
    //
    //         /* Add receiver to transaction. */
    //         transaction.to(address, satoshis)
    //     }
    //
    //     /* Calculate transaction total. */
    //     txAmount += satoshis
    // })
    // debug('Transaction satoshis (incl. fee):', txAmount)

    /* Validate dust amount. */
    // if (txAmount < DUST_SATOSHIS) {
    //     throw new Error(`Amount is too low. Minimum is [ ${DUST_SATOSHIS} ] satoshis.`)
    // }

    /* Create new transaction. */
    const transaction = new Transaction()

    /* Handle coins. */
    coins.forEach(_coin => {
        /* Add input. */
        transaction.addInput(
            _coin.outpoint,
            _coin.satoshis,
        )
    })

    /* Handle receivers. */
    receivers.forEach(_receiver => {
        /* Handle (value) outputs. */
        if (_receiver.address) {
            /* Add (valu) output. */
            transaction.addOutput(
                _receiver.address,
                _receiver.satoshis,
            )
        }

        /* Handle (data) outputs. */
        if (_receiver.data) {
            /* Add (data) output. */
            transaction.addOutput(
                _receiver.data
            )
        }
    })

    const wifs = coins.map(_coin => {
        return _coin.wif
    })
    // console.log('WIFS', wifs)

    // TODO Add (optional) miner fee.
    // FIXME Allow WIFs for each input.
    await transaction.sign(wifs)

    console.log('\n  Transaction (hex)', transaction.raw)
    // console.log('\n  Transaction (json)', transaction.json)

    // Broadcast transaction
    return broadcast(transaction.raw)
}
