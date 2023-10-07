# polkadotjs-proxy

This server acts as a bridge for systems to communicate with Polkadot's WSS endpoints using the pure PolkadotJS API functionality, allowing seamless interaction without the need for native support.

## Overview

The `polkadotjs-proxy` enables communication to the RPC proxy on the specified port. Example JSON command can be found below:

```json
{
    "type": "query",
    "namespace": "system",
    "method": "account",
    "params": ["5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty"],
    "network": "wss://rpc.ibp.network/kusama",
    "blockHash": "0xabc123"
}
```

(Note: Please remove the extra backslashes `\` before the backticks around the JSON code block.)

The `type`, `namespace`, `method`, `params`, `network`, and `blockHash` are input variables. This proxy facilitates queries and interactions with the Polkadot nodes.

## Dependencies

- Node.js
- Express
- @polkadot/api

## Compilation & Launch Instructions

1. Ensure you have Node.js installed.
2. Install the necessary npm packages:

```bash
npm install
```

3. Run the server using the `server.js` file:

```bash
node server.js
```

4. Launch using systemd:

   - Create a systemd service file, e.g., `/etc/systemd/system/polkadotjs-proxy.service`:

```ini
[Unit]
Description=PolkadotJS Proxy Server

[Service]
ExecStart=/usr/bin/node /path/to/your/server.js
Restart=always
User=your_username
Group=your_group
Environment=PATH=/usr/bin:/usr/local/bin
WorkingDirectory=/path/to/your/directory

[Install]
WantedBy=multi-user.target
```

   - Reload systemd:

```bash
sudo systemctl daemon-reload
```

   - Start the service:

```bash
sudo systemctl start polkadotjs-proxy
```

   - (Optional) Enable on boot:

```bash
sudo systemctl enable polkadotjs-proxy
```

**Note**: Replace `/path/to/your/` with the actual path to your `server.js` file and adjust `User` and `Group` as necessary.

This updated README reflects the name change and provides details under the "polkadotjs-proxy" title.
