import NftModel from "../models/nftModel.js";
import { gql } from "apollo-server-express";
import Web3 from "web3";
import { ChainsInfo } from "../smart-config/config-chains.js";

export const nftTypeDefs = gql`
  type Nft {
    _id: ID
    name: String
    tokenId: String
    url: String
    chainId: Int
    network: String
    lazyMint: String
    lazyMintData: String
    nftStatus: String
    collectionAddress: String
    creatorAddress: String
    ownerAddress: String
    imageUrl: String
    collections: String
    teams: String
    athlete: String
    musician: String
    artist: String
    isMarketPlace: Boolean
    isAuction: Boolean
    price: Float
    supply: Int
    mintedNft: Int
    availableSupply: Int
    isApproved: Boolean
  }
  type Query {
    nfts: [Nft]
    filterNfts(
      collections: String
      team: String
      athlete: String
      musician: String
      artist: String
      network: String
      nftStatus: String
      page: Int
    ): [Nft]
    getNFTbyObjectId(nftId: String): [Nft]
    auctionNfts: [Nft]
    auctionFilterNft: [Nft]
    getNftsOfUser(creatorAddress: String): [Nft]
    getNftsOfOwner(ownerAddress: String): [Nft]
    getSingleNft(
      tokenId: String
      collectionAddress: String
      network: String
    ): [Nft]
    searchNfts(key: String): [Nft]
    getSingleNftById(id: String): [Nft]
  }
  type Mutation {
    createNft(
      name: String
      tokenId: String
      url: String
      imageUrl: String
      chainId: Int
      network: String
      nftStatus: String
      lazyMint: String
      lazyMintData: String
      isAuction: Boolean
      collectionAddress: String
      creatorAddress: String
      ownerAddress: String
      collections: String
      teams: String
      athlete: String
      musician: String
      artist: String
      supply: Int
      availableSupply: Int
      mintedNft: Int
      price: Float
      isMarketPlace: Boolean
    ): Nft
    putOnSale(
      collectionAddress: String
      tokenId: String
      isMarketPlace: Boolean
      nftStatus: String
      price: Float
      ownerAddress: String
    ): Nft

    lazyMintUpdate(
      _id: String
      tokenId: String
      isMarketPlace: Boolean
      nftStatus: String
      price: Float
      ownerAddress: String
      lazyMintData: String
      lazyMint: String
    ): Nft

    mintedNftUpdate(nftId: String, mintedNft: Int, availableSupply: Int): Nft
    deleteNft(id: String!): Nft
    updateNftApprove(_id: String!, isApproved: Boolean): Nft
  }

  mutation Mutation(
    $id: String
    $tokenId: String
    $isMarketPlace: Boolean
    $nftStatus: String
    $price: Float
    $ownerAddress: String
    $lazyMintData: String
    $lazyMint: String
  ) {
    lazyMintUpdate(
      _id: $id
      tokenId: $tokenId
      isMarketPlace: $isMarketPlace
      nftStatus: $nftStatus
      price: $price
      ownerAddress: $ownerAddress
      lazyMintData: $lazyMintData
      lazyMint: $lazyMint
    ) {
      _id
      name
      tokenId
      url
      chainId
      network
      lazyMint
      lazyMintData
      nftStatus
      collectionAddress
      creatorAddress
      ownerAddress
      imageUrl
      collections
      teams
      athlete
      musician
      artist
      isMarketPlace
      price
    }
  }
  mutation deleteNft($id: String!) {
    nftDelete(_id: $id) {
      _id
      name
      tokenId
      url
      chainId
      network
    }
  }
  mutation mintedNftUpdate(
    $nftId: String
    $mintedNft: Int
    $availableSupply: Int
  ) {
    mintedNftUpdate(
      nftId: $nftId
      mintedNft: $mintedNft
      availableSupply: $availableSupply
    ) {
      _id
      name
      tokenId
      url
      chainId
      network
      lazyMint
      lazyMintData
      nftStatus
      collectionAddress
      creatorAddress
      ownerAddress
      imageUrl
      collections
      teams
      athlete
      musician
      artist
      isMarketPlace
      price
      supply
      mintedNft
      availableSupply
    }
  }
`;

export const nftResolvers = {
  Query: {
    nfts: async () => {
      const data = await NftModel.find();
      console.log(data);
      return data;
    },
    auctionNfts: async () => {
      const data = await NftModel.find({ isAuction: true });
      return data;
    },
    filterNfts: async (root, args) => {
      const collections = args.collections;
      const team = args.team;
      const athlete = args.athlete;
      const musician = args.musician;
      const artist = args.artist;
      const network = args.network;
      const nftStatus = args.nftStatus;
      const page = args.page;
      const filters = {};
      collections !== ""
        ? (filters.collections = collections.toLowerCase())
        : null;
      team !== "" ? (filters.teams = team.toLowerCase()) : null;
      athlete !== "" ? (filters.athlete = athlete.toLowerCase()) : null;
      musician !== "" ? (filters.musician = musician.toLowerCase()) : null;
      artist !== "" ? (filters.artist = artist.toLowerCase()) : null;
      network !== "" ? (filters.network = network.toLowerCase()) : null;
      nftStatus !== "" ? (filters.nftStatus = nftStatus.toLowerCase()) : null;
      // page = 0;
      // filters.isMarketPlace = true;

      let data;
      await NftModel.aggregate([
        {
          $match: filters,
        },
        {
          $sort: { updatedAt: -1 },
        },
        {
          $skip: page * 8,
        },
        {
          $limit: 8,
        },
      ])
        .then((res) => {
          data = res;
        })
        .catch((err) => {
          console.log(err);
        });
      return data;
    },
    getNFTbyObjectId: async (root, args) => {
      const nfts = await NftModel.find({ _id: args.nftId });
      return nfts;
    },
    getNftsOfOwner: async (root, args) => {
      const nfts = await NftModel.find({ ownerAddress: args.ownerAddress });
      return nfts;
    },
    getSingleNftById: async (root, args) => {
      const nfts = await NftModel.find({ _id: args.id }, {});
      return nfts;
    },
    searchNfts: async (root, args) => {
      const key = args.key;
      const nfts = await NftModel.find({
        name: { $regex: key, $options: "i" },
      });
      return nfts;
    },
    getNftsOfUser: async (root, args) => {
      const nfts = await NftModel.find({ creatorAddress: args.creatorAddress });
      return nfts;
    },
    getSingleNft: async (root, args) => {
      let nft = await NftModel.find({
        tokenId: args.tokenId,
        collectionAddress: args.collectionAddress,
        network: args.network,
      });
      return nft;
    },
  },

  Mutation: {
    createNft: async (root, args) => {
      let nft = new NftModel({
        name: args.name,
        tokenId: args.tokenId,
        url: args.url,
        imageUrl: args.imageUrl,
        creatorAddress: args.creatorAddress,
        chainId: args.chainId,
        network: args.network,
        lazyMint: args.lazyMint,
        lazyMintData: args.lazyMintData,
        isAuction: args.isAuction,
        nftStatus: args.nftStatus,
        ownerAddress: args.ownerAddress,
        collectionAddress: args.collectionAddress,
        collections: args.collections,
        teams: args.teams,
        athlete: args.athlete,
        musician: args.musician,
        artist: args.artist,
        supply: args.supply,
        mintedNft: args.mintedNft,
        availableSupply: args.availableSupply,
        price: args.price,
        isMarketPlace: args.isMarketPlace,
      });
      await nft.save();
      return nft;
    },

    putOnSale: async (root, args) => {
      let nft = NftModel.findOneAndUpdate(
        { tokenId: args.tokenId, collectionAddress: args.collectionAddress },
        {
          isMarketPlace: args.isMarketPlace,
          price: args.price,
          nftStatus: args.nftStatus,
          ownerAddress: args.ownerAddress,
        }
      );
      return nft;
    },

    lazyMintUpdate: async (root, args) => {
      let nft = NftModel.findByIdAndUpdate(
        { _id: args._id },
        {
          tokenId: args.tokenId,
          isMarketPlace: args.isMarketPlace,
          nftStatus: args.nftStatus,
          price: args.price,
          ownerAddress: args.ownerAddress,
          lazyMintData: args.lazyMintData,
          lazyMint: args.lazyMint,
        },
        { new: true }
      );
      return nft;
    },

    mintedNftUpdate: async (root, args) => {
      let nft = NftModel.findByIdAndUpdate(
        { _id: args.nftId },
        { $set: args },
        { new: true }
      );

      return nft;
    },

    deleteNft: async (root, args) => {
      let nft = NftModel.findByIdAndDelete(args.id, {});
      return nft;
    },

    updateNftApprove: async (root, args) => {
      let nft = NftModel.findByIdAndUpdate(
        { _id: args._id },
        {
          isApproved: args.isApproved,
        },
        { new: true }
      );
      return nft;
    },
  },
};
