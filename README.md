# Bitxor Explorer

[![Build Status](https://travis-ci.com/bitxorcorp/bitxor-explorer.svg?branch=main)](https://travis-ci.com/bitxor/bitxor-explorer)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

Bitxor Explorer is a read-only web application to browse the content of the blockchain.
The explorer supports searching for transactions, accounts, namespaces, tokens, and blocks information on a given network.

## Requirements

- Node.js 12 or above

## Installation

1. Clone the project.

```
git clone https://github.com/bitxor/bitxor-explorer.git
```

2. Install the required dependencies.

```
cd bitxor-explorer
npm install
```

3. Run the explorer application.

```
npm run dev
```

4. Visit http://localhost:8080/#/ in your browser.

## Developer notes

### Architecture

* `/src/config`: Handles the explorer configuration.
* `/src/infrastructure`: Handles the API / SDK request from Bitxor nodes.
* `/src/store`: Handles the application logic with state management.
* `/src/views`: Handles the UI of the explorer.

## Getting help

Use the following available resources to get help:

- [Bitxor Documentation][docs]
- Join the community [Discord][discord]
- If you found a bug, [open a new issue][issues]

## Contributing

Contributions are welcome and appreciated.
Check [CONTRIBUTING](CONTRIBUTING.md) for information on how to contribute.

## License

Copyright 2022 Bitxor Community

Licensed under the [Apache License 2.0](LICENSE)

[self]: https://github.com/bitxorcorp/bitxor-explorer
[docs]: https://docs.bitxor.org
[issues]: https://github.com/bitxorcorp/bitxor-explorer/issues
[discord]: https://discord.gg/kz7UPtnNt2
