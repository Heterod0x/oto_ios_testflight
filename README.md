# OTO - Voice Data Infrastructure for AI Training

[![React Native](https://img.shields.io/badge/React%20Native-0.79.5-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-~53.0.17-000020.svg)](https://expo.dev/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.28-363636.svg)](https://soliditylang.org/)

## Vision

Speech-AI training data is drastically scarcer than text. **OTO** pairs a wearable voice-capture device with a smartphone app to turn daily conversations into structured data. For major languages: personalized services. For under-represented languages: monetization through data licensing. We're building a speech-based Google Trends with DePIN-style token incentives.

## Architecture

```
oto_ios_testflight/
├── frontend/           # Mobile app for voice capture & analysis
├── contract/          # Smart contracts for USDC rewards
└── README.md          # This overview
```

## Value Propositions

- **Users**: Personalized AI services or data monetization
- **AI Development**: High-quality, diverse voice training data
- **Ecosystem**: Decentralized infrastructure with token incentives

## Tech Stack

- **Mobile**: React Native + Expo
- **Blockchain**: Solidity on Base network
- **AI**: Real-time conversation analysis & transcription

## Quick Start

```bash
git clone <repository-url>
cd oto_ios_testflight

# Mobile app
cd frontend && npm install && npm run ios

# Smart contracts
cd contract && bun install && bun run compile
```

## Documentation

- [Mobile App](./frontend/README.md) - Frontend development
- [Smart Contracts](./contract/README.md) - Blockchain system
- [API Specs](./contract/docs/API_SPECIFICATION.md) - Contract interfaces

## Contributing

Help build the future of voice AI training data through voice collection, mobile development, smart contracts, or AI integration.

---

**Voice Yields** - Transforming global conversations into structured data for personalized services and AI training.🦄
