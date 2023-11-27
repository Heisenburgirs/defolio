## DeFolio
# Universal Profile management

At the beginning of the month when Buildup #2 kicked off, I started to brainstorm ideas on what to build. The Lukso standards allow developers to build never seen before applications. But every idea I came up with lacked something, that is, Universal Profiles are same as EOAs. Meaning you can't really do much with them - you can't add or manage permissions for 3rd parties, view and transfer LSP7/8 tokens, utilize vaults and many other things in a user-friendly way.

That's when I decided to build DeFolio - allowing users to manage every aspect of their Universal Profile.

## DeFolio Technical Documentation

# Overview
DeFolio is an innovative platform developed for the Lukso ecosystem, designed to enhance the management and utilization of digital assets. This document outlines the key features, functionalities, and potential use cases of DeFolio.

## Features

# Assets

***Asset Viewing:*** Users can view their LSP7/LSP8 assets and LYX balance, providing a comprehensive overview of their digital portfolio.

***Portfolio Value:*** DeFolio displays the overall value of the user’s portfolio.

***Asset Valuation:*** Users can view the value of their assets in various currencies.

***Asset Transfer:*** DeFolio enables the transfer of LSP7/LSP8 or native LYX tokens to any recipient. A 'safetransfer' feature ensures secure transactions, even to External Owned Accounts (EOAs).

# Keymanager

***Controller Insights:*** Displays existing controllers and their specific permissions.

***Controller Management:*** Users can manage controllers, adding or removing permissions as needed.

***New Controllers:*** Addition of new controllers with customizable permissions.

***Permission Explanations:*** Offers detailed explanations of each permission and its functionality.

# Vault

***Vault Deployment:*** Users can deploy vaults with custom names and descriptions.

***Vault Management:*** Allows for the management of vault names, descriptions and vault itself.

***Asset Interaction:*** Enables sending assets to and from vaults.

# Session Keys

***Session Key Deployment:*** Users with a UP profile can deploy a session key contract.

***Permission Granting:*** The UP profile can grant any desired permission to the session contract.

***Session Management:*** Users can add addresses to the session contract with a set deadline, granting temporary access to the contract’s permissions. Existing sessions can be updated or terminated, and users can review past sessions.

## Why DeFolio?

***Enhanced Asset Management:*** Streamlines the process of managing digital assets.

***Increased Security:*** Safe transfer features and permission management enhance security.

***User-Friendly Interface:*** Intuitive design makes it easy for users to navigate and manage their digital assets.

***Flexibility:*** The platform caters to a range of user needs, from asset viewing to complex permission management.

## Use Cases

# Vaults

***Asset Isolation:*** Vaults can be used to isolate assets, providing an additional layer of security.

***Contract Interaction:*** Users can interact with contracts using vaults, offering more control over asset management.

# Session

***Temporary Access:*** Users can grant temporary access to parts of their UP for specific purposes, such as gaming or trading.

***Controlled Permissions:*** The ability to set specific permissions and deadlines for session keys allows for controlled, secure access.

## Further Improvements

# Vault

A URD can be setup that deploys new instance of a vault for specific LSP7/LSP8 token and transfers the incoming asset to appropriate vault. The LSP7/LSP8 tokens can be selected beforehand by the user.

***Objective:*** Enhance security and streamline management by segregating assets.

***Description:*** By creating a dedicated vault for each LSP7 and LSP8 token, it facilitates a separation of concerns and enhances security. This approach allows users to manage each asset type independently, providing a clear structure and reducing the complexity associated with managing a diverse portfolio. Furthermore, Session Key contract can be utilized to grant 3rd parties time-limited access to the vaults. This ensures that any 3rd party only has access to that specific LSP7/LSP8 asset, for a limited amount of time.

# Session Key

***Objective:*** Grant temporary access to UP using Keymanager

***Description:*** Currently the session key contract is very basic and limited. There's no separation of permissions or to what permission each address has access to. Further improvements can be made to allow Universal Profile to give address Y access to permission X for N amount of time. Meaning, currently by default any address added to the session key contract has access to all permissions granted to the session key contract by the Universal Profile.

## Development

npm install

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
