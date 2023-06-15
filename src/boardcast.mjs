/* Setup (non-ESM) debugger. */
import fetch from 'node-fetch'
const INSOMNIA_ENDPOINT = 'https://testnet-explorer.nexa.org:30002'
// const ROSTRUM_ENDPOINT = 'wss://electrum.nexa.org:20004'
const ROSTRUM_ENDPOINT = 'wss://testnet-explorer.nexa.org:30004'

/**
 * Broadcast a (signed) transaction to the network.
 *
 * @param {*} transaction
 */
export default (_rawTx) => {
    // FIXME Automatically detect transaction format

    // return broadcastBch(_rawTx)
    return broadcastBch(_rawTx)
}

/**
 * Broadcast a (signed) transaction to the network.
 *
 * @param {*} transaction
 */
const broadcastBch = async (_rawTx) => {
    const request = {
        id: 'nexajs',
        method: 'blockchain.transaction.broadcast',
        params: [_rawTx],
    }
    /* Call remote API. */
    try {
        const response = await fetch(INSOMNIA_ENDPOINT, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'text/plain'
            },
            body: JSON.stringify(request),
        })

        console.log(response.status)
        /* Request (response) body. */
        const body = await response.json()
        console.log('Broadcast (response):', body)

        /* Return (response) body. */
        return body
    } catch (error) {
        // TODO Handle error
    
        /* Set error. */
        // error = err
        console.error(error)
    }
}

/**
 * Broadcast a (signed) transaction to the network.
 *
 * @param {*} transaction
 */
const broadcastNexa = async (_rawTx) => {
    /* Initialize locals. */
    let request
    let resolve
    let reject

    /* Import WebSocket. */
    // NOTE: Ignored by esmify.
    const WebSocket = (await import('isomorphic-ws')).default

    /* Initialize socket connection. */
    // TODO Enable connection pooling.
    const socket = new WebSocket(ROSTRUM_ENDPOINT)

    /* Handle open connection. */
    socket.onopen = () => {
        // console.log('SOCKET OPENDED!')

        /* Build request. */
        request = {
            id: 'nexajs',
            method: 'blockchain.transaction.broadcast',
            params: [_rawTx],
        }

        /* Send request. */
        socket.send(JSON.stringify(request) + '\n')
    }

    /* Handle socket messages. */
    socket.onmessage = (msg) => {
        // console.log('MESSAGE (data):', msg.data)

        /* Resolve message data. */
        resolve(msg.data)

        /* Close connection. */
        // TODO Add support for connection pooling.
        socket.close()
    }

    /* Handle socket errors. */
    socket.onerror = (err) => {
        reject(err)
    }

    /* Return (response) promise. */
    return new Promise((_resolve, _reject) => {
        resolve = _resolve
        reject = _reject // FIXME Handle socket errors.
    })
}
