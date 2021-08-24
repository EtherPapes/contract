// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@1001-digital/erc721-extensions/contracts/LinearlyAssigned.sol";
import "@1001-digital/erc721-extensions/contracts/WithMarketOffers.sol";
import "@1001-digital/erc721-extensions/contracts/WithContractMetaData.sol";
import "@1001-digital/erc721-extensions/contracts/WithIPFSMetaData.sol";
import "@1001-digital/erc721-extensions/contracts/WithWithdrawals.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

// ––––––––––––––––––––––––––––––––––––––––––––– //
//    _____ _   _           _____                //
//   |   __| |_| |_ ___ ___|  _  |___ ___ ___    //
//   |   __|  _|   | -_|  _|   __| .'| . | -_|   //
//   |_____|_| |_|_|___|_| |__|  |__,|  _|___|   //
//                                   |_|         //
// ––––––––––––––––––––––––––––––––––––––––––––– //
//                pape beats rock                //
// ––––––––––––––––––––––––––––––––––––––––––––– //

contract EtherPapes is
    ERC721,
    WithIPFSMetaData,
    LinearlyAssigned,
    WithContractMetaData,
    WithMarketOffers,
    WithWithdrawals
{
    uint256 public BASE_PRICE = 0.001 ether;

    constructor(
        string memory _cid,
        string memory _contractMetaDataURI
    )
        ERC721("EtherPapes", "$PAPE")
        LinearlyAssigned(100, 1)
        WithContractMetaData(_contractMetaDataURI)
        WithIPFSMetaData(_cid)
    {}

    // Claim a virgin $PAPE
    function claim() external payable ensureAvailability {
        uint256 id = nextToken();
        uint256 price = id**2 * BASE_PRICE;
        require(msg.value >= price, "Pay to play, friend");

        _safeMint(msg.sender, id);
    }

    // Get the tokenURI for a specific token
    function tokenURI(uint256 tokenId)
        public view override(WithIPFSMetaData, ERC721)
        returns (string memory)
    {
        return WithIPFSMetaData.tokenURI(tokenId);
    }

    // Configure the baseURI for the tokenURI method
    function _baseURI()
        internal view override(WithIPFSMetaData, ERC721)
        returns (string memory)
    {
        return WithIPFSMetaData._baseURI();
    }
}
