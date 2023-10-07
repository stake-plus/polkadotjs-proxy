// Import necessary modules
const express = require('express');
const { ApiPromise, WsProvider } = require('@polkadot/api');

// Initialize the Express app
const app = express();
app.use(express.json());

// Object to cache API connections for different networks
let apis = {};

// Function to fetch (or create and cache) the API connection for a given network
async function getApi(providerUrl) {
    if (apis[providerUrl]) {
        return apis[providerUrl];
    } else {
        const provider = new WsProvider(providerUrl);
        const api = await ApiPromise.create({ provider });
        apis[providerUrl] = api;
        return api;
    }
}

// Recursive function to find and decorate call indexes with human-readable names
function findAndDecorateCallIndexes(api, obj) {
    if (Array.isArray(obj)) {
        for (let item of obj) {
            findAndDecorateCallIndexes(api, item);
        }
    } else if (typeof obj === 'object' && obj !== null) {
        if (typeof obj.callIndex === 'string') {
            const callBytes = api.createType('CallIndex', obj.callIndex).toU8a();
            const call = api.registry.findMetaCall(callBytes);
            obj.callName = call.meta.name.toString();
            obj.palletName = call.section;
        }
        
        for (let key in obj) {
            findAndDecorateCallIndexes(api, obj[key]);
        }
    }
}

// Endpoint to handle general API requests to Polkadot nodes
app.post('/api', async (req, res) => {
    const { type, namespace, method, params, network, blockHash } = req.body;
    let api = await getApi(network);

    if (blockHash) {
        api = await api.at(blockHash);
    }

    if (!type || !namespace || !method || !api[type] || !api[type][namespace] || !api[type][namespace][method]) {
        return res.status(400).json({ error: 'Invalid type, namespace, or method' });
    }

    try {
        let result = await api[type][namespace][method](...params);

        if (type === "query" && namespace === "preimage" && method === 'preimageFor' && result.isSome) {
            const preimageData = result.unwrap();
            const hex = preimageData.toHex();
            let decoded = null;

            try {
                decoded = api.createType('Call', hex);

                if (typeof decoded.toJSON === 'function') {
                    try {
                        result = decoded.toJSON();
                        findAndDecorateCallIndexes(api, result);
                    } catch (err) {
                        console.error('Failed to convert to JSON:', err);
                    }
                } else {
                    console.error('Decoded object does not have toJSON method.');
                }
            } catch (err) {
                console.error('Failed to createType:', err);
            }
        }

        res.json({ result });

    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
});

// Endpoint to list available transaction methods from Polkadot nodes
app.post('/api/listMethods', async (req, res) => {
  const { network } = req.body;
  let api = await getApi(network);

  try {
    const txMethods = api.tx;
    let palletsAndMethods = {};
    for (const [pallet, methods] of Object.entries(txMethods)) {
      palletsAndMethods[pallet] = Object.keys(methods);
    }
    res.json({ result: palletsAndMethods });
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});

// Start the Express server on port 3000, bound to localhost
app.listen(3000, 'localhost', () => console.log('Server running on port 3000 and listening only on localhost'));
